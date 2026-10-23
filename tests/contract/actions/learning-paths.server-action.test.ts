import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Role } from "@/lib/generated/prisma/client";
import { resetDatabase } from "../../support/test-db";
import { createCourse, createUser } from "../../support/factories";
import {
  checkPathSlugAction,
  deletePathAction,
  savePathAction,
  setPathPublishedAction,
} from "@/app/[locale]/(admin)/admin/paths/_actions/path-actions";
import { enrollInPathAction } from "@/app/[locale]/(main)/parcours/_actions/path-enrollment";

vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn() } } }));

const getSession = vi.mocked(auth.api.getSession) as unknown as ReturnType<typeof vi.fn>;
const signedInAs = (user: { id: string; role: string } | null) =>
  getSession.mockResolvedValue(user ? { user: { id: user.id, role: user.role } } : null);

beforeEach(async () => {
  await resetDatabase(db);
  getSession.mockReset();
});
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

const description = "Un parcours pour apprendre dans le bon ordre, étape par étape.";
const payload = (courseIds: string[], over: Record<string, unknown> = {}) => ({
  title: "Parcours",
  slug: "parcours",
  description,
  thumbnail: "https://cdn.test/c.png",
  level: "BEGINNER",
  objectives: [],
  featured: false,
  courses: courseIds.map((courseId) => ({ courseId })),
  ...over,
});

describe("path administration actions", () => {
  it("answer 'not signed in' to a visitor, 'admin only' to everyone else", async () => {
    const a = await createCourse();
    const b = await createCourse();
    const path = await db.path.create({ data: { slug: "existant", title: "Existant", description } });

    signedInAs(null);
    expect(await savePathAction(null, payload([a.id, b.id]))).toEqual({ success: false, error: "Non authentifié" });
    expect(await setPathPublishedAction(path.id, true)).toMatchObject({ success: false, error: "Non authentifié" });
    expect(await deletePathAction(path.id)).toMatchObject({ success: false, error: "Non authentifié" });
    expect(await checkPathSlugAction("libre")).toEqual({ available: false, valid: true });

    for (const role of [Role.STUDENT, Role.INSTRUCTOR]) {
      signedInAs(await createUser({ role }));
      expect(await savePathAction(null, payload([a.id, b.id]))).toMatchObject({ success: false, error: expect.stringContaining("administrateur") });
      expect(await setPathPublishedAction(path.id, true)).toMatchObject({ success: false });
      expect(await deletePathAction(path.id)).toMatchObject({ success: false });
      expect(await checkPathSlugAction("libre")).toEqual({ available: false, valid: true });
    }
    expect(await db.path.count()).toBe(1);
  });

  it("let an admin create, publish and delete, and check a slug", async () => {
    const admin = await createUser({ role: Role.ADMIN });
    signedInAs(admin);
    const a = await createCourse();
    const b = await createCourse();

    const saved = await savePathAction(null, payload([a.id, b.id]));
    expect(saved).toMatchObject({ success: true, slug: "parcours" });
    const id = (saved as { id: string }).id;

    expect(await checkPathSlugAction("parcours")).toEqual({ available: false, valid: true });
    expect(await checkPathSlugAction("parcours", id)).toEqual({ available: true, valid: true });
    expect(await checkPathSlugAction("libre-ok")).toEqual({ available: true, valid: true });
    expect(await checkPathSlugAction("Pas Valide")).toEqual({ available: false, valid: false });
    expect(await checkPathSlugAction("verification")).toEqual({ available: false, valid: false });

    expect(await setPathPublishedAction(id, true)).toMatchObject({ success: true });
    expect(await deletePathAction(id)).toEqual({ success: true });
    expect(await db.path.count()).toBe(0);
  });
});

describe("enrollInPathAction", () => {
  it("needs a signed-in learner and a valid, published path", async () => {
    const course = await createCourse();
    const other = await createCourse();
    const path = await db.path.create({
      data: {
        slug: "p",
        title: "P",
        description,
        published: true,
        courses: { create: [{ courseId: course.id, order: 1 }, { courseId: other.id, order: 2 }] },
      },
    });

    signedInAs(null);
    expect(await enrollInPathAction(path.id)).toMatchObject({ success: false, message: expect.stringContaining("Connectez-vous") });

    const user = await createUser();
    signedInAs(user);
    expect(await enrollInPathAction("")).toMatchObject({ success: false });
    expect(await enrollInPathAction("inconnu")).toMatchObject({ success: false, message: "Ce parcours n'est pas disponible" });

    const ok = await enrollInPathAction(path.id);
    expect(ok).toMatchObject({ success: true, enrolledCount: 2, needsAccess: [] });
    expect(await db.enrollment.count({ where: { userId: user.id } })).toBe(2);
    expect(await enrollInPathAction(path.id)).toMatchObject({ success: true, enrolledCount: 0 });
  });

  it("issues the certificate right away when the courses were already completed", async () => {
    const user = await createUser();
    signedInAs(user);
    const courses = [await createCourse(), await createCourse()];
    for (const course of courses) {
      const lesson = await db.lesson.create({ data: { courseId: course.id, title: "L", slug: `l-${course.id}`, order: 1, published: true } });
      await db.enrollment.create({ data: { userId: user.id, courseId: course.id } });
      await db.progress.create({ data: { userId: user.id, lessonId: lesson.id, completed: true } });
    }
    const path = await db.path.create({
      data: {
        slug: "deja-fait",
        title: "Déjà fait",
        description,
        published: true,
        courses: { create: courses.map((c, i) => ({ courseId: c.id, order: i + 1 })) },
      },
    });

    await enrollInPathAction(path.id);
    expect(await db.pathCertificate.count({ where: { userId: user.id, pathId: path.id } })).toBe(1);
  });
});
