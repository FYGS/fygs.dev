import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { resetDatabase } from "../../support/test-db";
import { createCourse, createUser } from "../../support/factories";

const h = vi.hoisted(() => ({ session: null as { user: { id: string; role: string } } | null }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn(async () => h.session) } } }));
vi.mock("@/lib/redis", () => ({ default: { eval: vi.fn(async () => { throw new Error("redis down"); }) } }));

import { writeAudit } from "@/lib/audit";
import { moderateReview } from "@/lib/services/review-moderation";
import { grantCourseAccess, revokeCourseAccess } from "@/lib/curriculum/insights";
import { changeUserRole, setUserBan } from "@/lib/services/user-admin";
import { deleteTag, updateTag } from "@/app/[locale]/(admin)/admin/tags/_actions/tag-actions";

beforeEach(async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  h.session = null;
  await resetDatabase(db);
});
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

const trail = (action: string) => db.auditLog.findMany({ where: { action }, orderBy: { createdAt: "asc" } });

describe("the audit trail", () => {
  it("writeAudit stores who did what to which object, and nothing else about the actor", async () => {
    const admin = await createUser({ role: "ADMIN" });
    await writeAudit({ actorId: admin.id, action: "course.published", targetType: "course", targetId: "c1", metadata: { slug: "react" } });
    const [entry] = await trail("course.published");
    expect(entry).toMatchObject({ actorId: admin.id, targetType: "course", targetId: "c1", metadata: { slug: "react" } });
    expect(entry.createdAt).toBeInstanceOf(Date);
  });

  it("keeps the entry after the actor's account is deleted (the actor becomes null)", async () => {
    const admin = await createUser({ role: "ADMIN" });
    await writeAudit({ actorId: admin.id, action: "course.deleted", targetType: "course", targetId: "c1" });
    await db.user.delete({ where: { id: admin.id } });
    expect(await trail("course.deleted")).toEqual([expect.objectContaining({ actorId: null, targetId: "c1" })]);
  });

  it("an entry written in a transaction is rolled back with it", async () => {
    const admin = await createUser({ role: "ADMIN" });
    await expect(
      db.$transaction(async (tx) => {
        await writeAudit({ actorId: admin.id, action: "user.banned", targetType: "user", targetId: "u" }, tx);
        throw new Error("the change failed");
      }),
    ).rejects.toThrow("the change failed");
    expect(await trail("user.banned")).toHaveLength(0);
  });

  it("role change and ban are recorded by the shared service, with the previous role", async () => {
    const admin = await createUser({ role: "ADMIN" });
    const student = await createUser();
    expect(await changeUserRole(admin.id, student.id, "INSTRUCTOR")).toEqual({ ok: true });
    expect(await setUserBan(admin.id, student.id, true)).toEqual({ ok: true });
    expect(await trail("user.role_changed")).toEqual([expect.objectContaining({ actorId: admin.id, targetId: student.id, metadata: { from: "STUDENT", to: "INSTRUCTOR" } })]);
    expect(await trail("user.banned")).toHaveLength(1);
    // asking for what is already true changes and records nothing
    expect(await changeUserRole(admin.id, student.id, "INSTRUCTOR")).toEqual({ ok: true });
    expect(await trail("user.role_changed")).toHaveLength(1);
  });

  it("a review decision is recorded once, and a lost race records nothing", async () => {
    const admin = await createUser({ role: "ADMIN" });
    const course = await createCourse();
    const author = await createUser();
    const review = await db.review.create({ data: { userId: author.id, courseId: course.id, rating: 3, comment: "Un avis à relire.", status: "PENDING" } });
    expect(await moderateReview({ reviewId: review.id, decision: "REJECT", moderatorId: admin.id })).toMatchObject({ ok: true, changed: true });
    expect(await moderateReview({ reviewId: review.id, decision: "REJECT", moderatorId: admin.id })).toMatchObject({ ok: true, changed: false });
    expect(await trail("review.moderated")).toEqual([
      expect.objectContaining({ actorId: admin.id, targetType: "review", targetId: review.id, metadata: { from: "PENDING", to: "REJECTED" } }),
    ]);
  });

  it("granting and withdrawing an access are recorded with the person concerned", async () => {
    const admin = await createUser({ role: "ADMIN" });
    const learner = await createUser({ email: "apprenant@example.test" });
    const course = await createCourse({ accessTier: "PREMIUM", price: 49 });
    expect(await grantCourseAccess(course.id, "apprenant@example.test", admin.id)).toMatchObject({ success: true });
    expect(await revokeCourseAccess(course.id, learner.id, admin.id)).toMatchObject({ success: true });
    expect(await trail("access.granted")).toEqual([
      expect.objectContaining({ actorId: admin.id, targetType: "course", targetId: course.id, metadata: { userId: learner.id, createdEnrollment: true } }),
    ]);
    expect(await trail("access.revoked")).toEqual([
      expect.objectContaining({ actorId: admin.id, targetId: course.id, metadata: { userId: learner.id, removedEnrollment: true } }),
    ]);
  });

  it("a tag rename and a tag deletion are recorded; an instructor's attempt is refused and recorded nowhere", async () => {
    const admin = await createUser({ role: "ADMIN" });
    const instructor = await createUser({ role: "INSTRUCTOR" });
    const tag = await db.tag.create({ data: { name: "Ancien nom", color: "#112233" } });

    h.session = { user: { id: instructor.id, role: "INSTRUCTOR" } };
    expect(await updateTag(tag.id, { name: "Pris par un formateur" })).toMatchObject({ success: false });
    expect(await deleteTag(tag.id)).toMatchObject({ success: false });
    expect(await trail("tag.changed")).toHaveLength(0);

    h.session = { user: { id: admin.id, role: "ADMIN" } };
    expect(await updateTag(tag.id, { name: "Nouveau nom" })).toMatchObject({ success: true });
    expect(await deleteTag(tag.id)).toEqual({ success: true });
    expect(await trail("tag.changed")).toEqual([
      expect.objectContaining({ actorId: admin.id, metadata: expect.objectContaining({ operation: "update", before: { name: "Ancien nom", color: "#112233" }, after: { name: "Nouveau nom", color: "#112233" } }) }),
      expect.objectContaining({ actorId: admin.id, metadata: { operation: "delete", name: "Nouveau nom" } }),
    ]);
  });
});
