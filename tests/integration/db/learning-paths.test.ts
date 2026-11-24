import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { CourseAccessTier, PaymentKind, PaymentStatus, Role } from "@/lib/generated/prisma/client";
import { resetDatabase } from "../../support/test-db";
import { createCourse, createSubscription, createUser, enroll } from "../../support/factories";
import { deletePath, savePath, setPathPublished, type Actor } from "@/lib/paths/admin";
import { listAdminPaths } from "@/lib/paths/admin-list";
import { syncPathCertificates } from "@/lib/paths/certificates";
import { findCertificateByCode } from "@/lib/learning/certificates";
import { enrollInPath } from "@/lib/paths/enrollment";
import { getPublishedPath, listPathsOfCourse, listPublishedPaths } from "@/lib/paths/queries";
import { loadUserPath } from "@/lib/paths/progress";

beforeEach(() => resetDatabase(db));
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

/** A published course with one published lesson (so it has something to complete). */
async function courseWithLesson(over: Parameters<typeof createCourse>[0] = {}) {
  const course = await createCourse(over);
  const lesson = await db.lesson.create({
    data: { courseId: course.id, title: "Leçon", slug: `lecon-${course.id}`, order: 1, published: true, duration: 30 * 60 }, // seconds
  });
  return { course, lesson };
}

const finish = (userId: string, lessonId: string) =>
  db.progress.create({ data: { userId, lessonId, completed: true, completedAt: new Date() } });

async function admin(): Promise<Actor> {
  const user = await createUser({ role: Role.ADMIN });
  return { id: user.id, role: user.role };
}

const description = "Un parcours pour apprendre dans le bon ordre, étape par étape.";
const input = (courseIds: { courseId: string; optional?: boolean }[], over: Record<string, unknown> = {}) => ({
  title: "Parcours de test",
  slug: "parcours-de-test",
  description,
  thumbnail: "https://cdn.test/cover.png",
  level: "BEGINNER",
  objectives: ["Objectif 1"],
  featured: false,
  courses: courseIds,
  ...over,
});

/** A published path straight in the database. */
async function publishedPath(courses: { id: string; optional?: boolean }[], slug = "parcours") {
  return db.path.create({
    data: {
      slug,
      title: `Parcours ${slug}`,
      description,
      thumbnail: "https://cdn.test/cover.png",
      published: true,
      publishedAt: new Date(),
      courses: { create: courses.map((c, i) => ({ courseId: c.id, order: i + 1, optional: c.optional ?? false })) },
    },
  });
}

describe("path progress and certificate", () => {
  it("completes only when every required course is complete, optional ones never block", async () => {
    const user = await createUser();
    const a = await courseWithLesson();
    const b = await courseWithLesson();
    const optional = await courseWithLesson();
    const path = await publishedPath([{ id: a.course.id }, { id: b.course.id }, { id: optional.course.id, optional: true }]);
    await enrollInPath(user.id, path.id);

    await finish(user.id, a.lesson.id);
    let state = await loadUserPath(user.id, (await getPublishedPath(path.slug))!);
    expect(state.enrolled).toBe(true);
    expect(state.progress).toMatchObject({ requiredTotal: 2, requiredDone: 1, percent: 50, isComplete: false });
    expect(state.next?.courseId).toBe(b.course.id);
    expect(state.courses.map((c) => c.status)).toEqual(["completed", "not_started", "not_started"]);

    await finish(user.id, b.lesson.id);
    state = await loadUserPath(user.id, (await getPublishedPath(path.slug))!);
    expect(state.progress).toMatchObject({ percent: 100, isComplete: true, nextCourseId: null });
    expect(state.next).toBeNull();
  });

  it("follows the next item of a started course", async () => {
    const user = await createUser();
    const a = await courseWithLesson({ slug: "react" });
    const b = await courseWithLesson();
    const path = await publishedPath([{ id: a.course.id }, { id: b.course.id }]);
    await enrollInPath(user.id, path.id);
    const state = await loadUserPath(user.id, (await getPublishedPath(path.slug))!);
    expect(state.next?.href).toBe(`/learn/react/lessons/${a.lesson.slug}`);
  });

  it("issues the certificate once, whatever the number of calls", async () => {
    const user = await createUser({ name: "Awa Traoré" });
    const a = await courseWithLesson();
    const b = await courseWithLesson();
    const path = await publishedPath([{ id: a.course.id }, { id: b.course.id }]);
    await enrollInPath(user.id, path.id);

    expect((await syncPathCertificates(user.id)).issued).toHaveLength(0); // nothing done yet
    await finish(user.id, a.lesson.id);
    await finish(user.id, b.lesson.id);

    const results = await Promise.all([syncPathCertificates(user.id), syncPathCertificates(user.id)]);
    expect(results.flatMap((r) => r.issued)).toHaveLength(1);
    expect((await syncPathCertificates(user.id)).issued).toHaveLength(0);
    expect(await db.pathCertificate.count()).toBe(1);

    const { code } = (await db.pathCertificate.findFirstOrThrow())!;
    expect(await findCertificateByCode(code)).toMatchObject({
      kind: "path",
      holderName: "Awa Traoré",
      href: `/parcours/${path.slug}`,
      courseTitles: [a.course.title, b.course.title],
    });
    expect(await findCertificateByCode(code.toUpperCase())).not.toBeNull();
  });

  it("does not issue a certificate to someone who never enrolled in the path", async () => {
    const user = await createUser();
    const a = await courseWithLesson();
    const b = await courseWithLesson();
    await publishedPath([{ id: a.course.id }, { id: b.course.id }]);
    await finish(user.id, a.lesson.id);
    await finish(user.id, b.lesson.id);
    expect((await syncPathCertificates(user.id)).issued).toHaveLength(0);
  });

  it("a course unpublished later stops blocking the certificate", async () => {
    const user = await createUser();
    const a = await courseWithLesson();
    const b = await courseWithLesson();
    const path = await publishedPath([{ id: a.course.id }, { id: b.course.id }]);
    await enrollInPath(user.id, path.id);
    await finish(user.id, a.lesson.id);
    await db.course.update({ where: { id: b.course.id }, data: { published: false } });

    const detail = (await getPublishedPath(path.slug))!;
    expect(detail.courseCount).toBe(1);
    expect((await loadUserPath(user.id, detail)).courses.map((c) => c.status)).toEqual(["completed", "unavailable"]);
    expect((await syncPathCertificates(user.id)).issued).toHaveLength(1);
  });

  it("rejects verification of an unknown or malformed code", async () => {
    expect(await findCertificateByCode("0".repeat(32))).toBeNull();
    expect(await findCertificateByCode("'; drop table")).toBeNull();
    expect(await findCertificateByCode("")).toBeNull();
  });
});

describe("enrolling in a path", () => {
  it("enrols in free courses and never unlocks a premium course", async () => {
    const user = await createUser();
    const free = await courseWithLesson();
    const premium = await courseWithLesson({ accessTier: CourseAccessTier.PREMIUM });
    const path = await publishedPath([{ id: free.course.id }, { id: premium.course.id }]);

    const result = await enrollInPath(user.id, path.id);
    expect(result).toMatchObject({ ok: true, alreadyEnrolled: false, enrolledCourseIds: [free.course.id] });
    expect(result.needsAccess).toEqual([
      { courseId: premium.course.id, slug: premium.course.slug, title: premium.course.title, optional: false },
    ]);
    expect(await db.enrollment.count({ where: { userId: user.id } })).toBe(1);

    const state = await loadUserPath(user.id, (await getPublishedPath(path.slug))!);
    expect(state.courses.map((c) => c.status)).toEqual(["not_started", "needs_access"]);
  });

  it("an active subscription or a lifetime purchase entitles to a premium course", async () => {
    const subscriber = await createUser();
    const buyer = await createUser();
    const premium = await courseWithLesson({ accessTier: CourseAccessTier.PREMIUM });
    const other = await courseWithLesson({ accessTier: CourseAccessTier.PREMIUM });
    const path = await publishedPath([{ id: premium.course.id }, { id: other.course.id }]);

    await createSubscription(subscriber.id);
    expect((await enrollInPath(subscriber.id, path.id)).needsAccess).toHaveLength(0);
    expect(await db.enrollment.count({ where: { userId: subscriber.id } })).toBe(2);

    await db.payment.create({
      data: { userId: buyer.id, courseId: premium.course.id, amount: 49, kind: PaymentKind.COURSE, status: PaymentStatus.COMPLETED },
    });
    const result = await enrollInPath(buyer.id, path.id);
    expect(result.enrolledCourseIds).toEqual([premium.course.id]);
    expect(result.needsAccess.map((c) => c.courseId)).toEqual([other.course.id]);
  });

  it("a pending or refunded payment does not entitle", async () => {
    const user = await createUser();
    const premium = await courseWithLesson({ accessTier: CourseAccessTier.PREMIUM });
    const filler = await courseWithLesson();
    const path = await publishedPath([{ id: premium.course.id }, { id: filler.course.id }]);
    await db.payment.create({
      data: { userId: user.id, courseId: premium.course.id, amount: 49, kind: PaymentKind.COURSE, status: PaymentStatus.PENDING },
    });
    const result = await enrollInPath(user.id, path.id);
    expect(result.needsAccess.map((c) => c.courseId)).toEqual([premium.course.id]);
  });

  it("is idempotent, keeps existing enrolments, and picks up a course unlocked since", async () => {
    const user = await createUser();
    const free = await courseWithLesson();
    const premium = await courseWithLesson({ accessTier: CourseAccessTier.PREMIUM });
    const path = await publishedPath([{ id: free.course.id }, { id: premium.course.id }]);
    await enroll(user.id, free.course.id); // enrolled before, on its own

    const first = await enrollInPath(user.id, path.id);
    expect(first.enrolledCourseIds).toEqual([]);
    const second = await enrollInPath(user.id, path.id);
    expect(second.alreadyEnrolled).toBe(true);
    expect(await db.pathEnrollment.count()).toBe(1);

    await createSubscription(user.id); // subscribes later
    const third = await enrollInPath(user.id, path.id);
    expect(third.enrolledCourseIds).toEqual([premium.course.id]);
    expect(await db.enrollment.count({ where: { userId: user.id } })).toBe(2);
  });

  it("refuses an unpublished or unknown path and skips unpublished courses", async () => {
    const user = await createUser();
    const a = await courseWithLesson();
    const draftCourse = await courseWithLesson({ published: false });
    const draftPath = await db.path.create({
      data: { slug: "brouillon", title: "Brouillon", description, published: false },
    });
    expect(await enrollInPath(user.id, draftPath.id)).toMatchObject({ ok: false, error: "NOT_FOUND" });
    expect(await enrollInPath(user.id, "nope")).toMatchObject({ ok: false, error: "NOT_FOUND" });

    const path = await publishedPath([{ id: a.course.id }, { id: draftCourse.course.id }]);
    const result = await enrollInPath(user.id, path.id);
    expect(result.enrolledCourseIds).toEqual([a.course.id]);
  });
});

describe("catalog queries", () => {
  it("lists only published paths, with filters, sorting and an escaped search", async () => {
    const a = await courseWithLesson();
    const b = await courseWithLesson();
    await db.path.create({
      data: {
        slug: "alpha",
        title: "Alpha web",
        description,
        level: "BEGINNER",
        published: true,
        publishedAt: new Date("2026-01-01"),
        courses: { create: [{ courseId: a.course.id, order: 1 }] },
      },
    });
    await db.path.create({
      data: {
        slug: "beta",
        title: "Beta data",
        description,
        level: "ADVANCED",
        published: true,
        featured: true,
        publishedAt: new Date("2026-06-01"),
        courses: { create: [{ courseId: a.course.id, order: 1 }, { courseId: b.course.id, order: 2 }] },
      },
    });
    await db.path.create({ data: { slug: "draft", title: "Draft", description, published: false, courses: { create: [{ courseId: a.course.id, order: 1 }] } } });
    await db.path.create({ data: { slug: "empty", title: "Empty", description, published: true } });

    expect((await listPublishedPaths()).map((p) => p.slug)).toEqual(["beta", "alpha"]); // featured first, empty and draft hidden
    expect((await listPublishedPaths({ sort: "title" })).map((p) => p.slug)).toEqual(["alpha", "beta"]);
    expect((await listPublishedPaths({ sort: "courses" })).map((p) => p.slug)).toEqual(["beta", "alpha"]);
    expect((await listPublishedPaths({ sort: "recent" })).map((p) => p.slug)).toEqual(["beta", "alpha"]);
    expect((await listPublishedPaths({ level: "ADVANCED" })).map((p) => p.slug)).toEqual(["beta"]);
    expect((await listPublishedPaths({ q: "DATA" })).map((p) => p.slug)).toEqual(["beta"]);
    expect(await listPublishedPaths({ q: "%" })).toHaveLength(0); // a wildcard is text, not "everything"
    expect((await listPublishedPaths({ q: "_lpha" })).length).toBe(0);

    const beta = (await getPublishedPath("beta"))!;
    expect(beta).toMatchObject({ courseCount: 2, requiredCount: 2, minutes: 60 });
    expect(await getPublishedPath("draft")).toBeNull();
    expect((await listPathsOfCourse(a.course.id)).map((p) => p.slug)).toEqual(["beta", "alpha"]);
    expect(await listPathsOfCourse(b.course.id)).toHaveLength(1);
  });

  it("(pathId, order) and (pathId, courseId) are unique", async () => {
    const a = await createCourse();
    const b = await createCourse();
    const path = await db.path.create({ data: { slug: "u", title: "U", description, courses: { create: [{ courseId: a.id, order: 1 }] } } });
    await expect(db.pathCourse.create({ data: { pathId: path.id, courseId: b.id, order: 1 } })).rejects.toMatchObject({ code: "P2002" });
    await expect(db.pathCourse.create({ data: { pathId: path.id, courseId: a.id, order: 2 } })).rejects.toMatchObject({ code: "P2002" });
  });
});

describe("path administration", () => {
  it("only an admin may write", async () => {
    const a = await createCourse();
    const b = await createCourse();
    const payload = input([{ courseId: a.id }, { courseId: b.id }]);
    for (const role of [Role.STUDENT, Role.INSTRUCTOR, undefined, null]) {
      const user = await createUser({ role: role ?? Role.STUDENT });
      const actor: Actor = { id: user.id, role };
      expect(await savePath(actor, null, payload)).toMatchObject({ success: false, error: expect.stringContaining("administrateur") });
    }
    expect(await db.path.count()).toBe(0);

    const instructor = await createUser({ role: Role.INSTRUCTOR });
    const path = await publishedPath([{ id: a.id }, { id: b.id }]);
    const actor: Actor = { id: instructor.id, role: Role.INSTRUCTOR };
    expect(await setPathPublished(actor, path.id, false)).toMatchObject({ success: false });
    expect(await deletePath(actor, path.id)).toMatchObject({ success: false });
    expect((await db.path.findUniqueOrThrow({ where: { id: path.id } })).published).toBe(true);
  });

  it("creates a draft with the courses in the order sent, then reorders them", async () => {
    const actor = await admin();
    const [a, b, c] = [await createCourse(), await createCourse(), await createCourse()];
    const created = await savePath(actor, null, input([{ courseId: a.id }, { courseId: b.id, optional: true }, { courseId: c.id }]));
    expect(created).toMatchObject({ success: true, slug: "parcours-de-test" });
    const id = (created as { id: string }).id;

    const rows = () => db.pathCourse.findMany({ where: { pathId: id }, orderBy: { order: "asc" } });
    expect((await rows()).map((r) => [r.courseId, r.order, r.optional])).toEqual([
      [a.id, 1, false],
      [b.id, 2, true],
      [c.id, 3, false],
    ]);
    expect((await db.path.findUniqueOrThrow({ where: { id } })).published).toBe(false);
    expect((await db.path.findUniqueOrThrow({ where: { id } })).authorId).toBe(actor.id);

    // swap and drop: the (pathId, order) unique key must not trip
    expect(await savePath(actor, id, input([{ courseId: c.id }, { courseId: a.id }]))).toMatchObject({ success: true });
    expect((await rows()).map((r) => [r.courseId, r.order])).toEqual([[c.id, 1], [a.id, 2]]);
  });

  it("validates the input and the slug", async () => {
    const actor = await admin();
    const a = await createCourse();
    const b = await createCourse();
    expect(await savePath(actor, null, input([], { slug: "Bad Slug" }))).toMatchObject({ success: false });
    expect(await savePath(actor, null, input([{ courseId: "ghost" }]))).toMatchObject({ success: false, error: expect.stringContaining("n'existe plus") });
    expect(await savePath(actor, "missing", input([]))).toMatchObject({ success: false, error: "Parcours introuvable" });

    const first = await savePath(actor, null, input([{ courseId: a.id }, { courseId: b.id }]));
    expect(first.success).toBe(true);
    expect(await savePath(actor, null, input([], { title: "Autre" }))).toMatchObject({ success: false, error: expect.stringContaining("slug") });
    // keeping its own slug when saving again is fine
    expect(await savePath(actor, (first as { id: string }).id, input([{ courseId: a.id }, { courseId: b.id }]))).toMatchObject({ success: true });
  });

  it("publishes only a complete path, and a published path must stay publishable", async () => {
    const actor = await admin();
    const a = (await courseWithLesson()).course;
    const b = (await courseWithLesson()).course;
    const empty = await createCourse(); // published, but nothing to do in it
    const draft = await createCourse({ published: false });

    const saved = (await savePath(actor, null, input([{ courseId: a.id }, { courseId: draft.id }], { thumbnail: null }))) as { id: string };
    const refused = await setPathPublished(actor, saved.id, true);
    expect(refused).toMatchObject({ success: false });
    expect(refused.success === false && refused.issues).toEqual(expect.arrayContaining([expect.stringMatching(/couverture/), expect.stringMatching(/n'est pas publiée/)]));

    // a course without any published lesson could never be completed: the certificate would be out of reach
    await savePath(actor, saved.id, input([{ courseId: a.id }, { courseId: empty.id }]));
    const withEmpty = await setPathPublished(actor, saved.id, true);
    expect(withEmpty.success === false && withEmpty.issues).toEqual([expect.stringMatching(/aucune leçon publiée/)]);

    await savePath(actor, saved.id, input([{ courseId: a.id }, { courseId: b.id }]));
    expect(await setPathPublished(actor, saved.id, true)).toMatchObject({ success: true });
    const published = await db.path.findUniqueOrThrow({ where: { id: saved.id } });
    expect(published.published).toBe(true);
    expect(published.publishedAt).toBeInstanceOf(Date);

    // editing a published path into an unpublishable state is refused, nothing is written
    const broken = await savePath(actor, saved.id, input([{ courseId: a.id }]));
    expect(broken).toMatchObject({ success: false, issues: expect.any(Array) });
    expect(await db.pathCourse.count({ where: { pathId: saved.id } })).toBe(2);

    // unpublishing keeps the first publication date
    expect(await setPathPublished(actor, saved.id, false)).toMatchObject({ success: true });
    expect((await db.path.findUniqueOrThrow({ where: { id: saved.id } })).publishedAt).toEqual(published.publishedAt);
  });

  it("deletes a path nobody holds a certificate for, and refuses otherwise", async () => {
    const actor = await admin();
    const user = await createUser();
    const a = await courseWithLesson();
    const b = await courseWithLesson();
    const used = await publishedPath([{ id: a.course.id }, { id: b.course.id }], "avec-certificat");
    const unused = await publishedPath([{ id: a.course.id }, { id: b.course.id }], "sans-certificat");
    await db.pathEnrollment.create({ data: { userId: user.id, pathId: unused.id } });
    await db.pathCertificate.create({ data: { userId: user.id, pathId: used.id } });

    expect(await deletePath(actor, used.id)).toMatchObject({ success: false, error: expect.stringContaining("certificat") });
    expect(await db.path.count({ where: { id: used.id } })).toBe(1);

    expect(await deletePath(actor, unused.id)).toEqual({ success: true, slug: "sans-certificat" });
    expect(await db.pathEnrollment.count()).toBe(0);
    expect(await db.course.count()).toBe(2); // the courses stay
    expect(await deletePath(actor, unused.id)).toMatchObject({ success: false });
  });

  it("lists paths for the back office with counts, filters and paging", async () => {
    const a = await courseWithLesson();
    const b = await courseWithLesson();
    const user = await createUser();
    const live = await publishedPath([{ id: a.course.id }, { id: b.course.id }], "live");
    await db.path.create({ data: { slug: "brouillon-x", title: "Brouillon X", description } });
    await db.pathEnrollment.create({ data: { userId: user.id, pathId: live.id } });

    const all = await listAdminPaths({});
    expect(all.total).toBe(2);
    expect(all.rows.find((r) => r.slug === "live")).toMatchObject({ courseCount: 2, enrollmentCount: 1, certificateCount: 0, published: true });
    expect((await listAdminPaths({ status: "draft" })).rows.map((r) => r.slug)).toEqual(["brouillon-x"]);
    expect((await listAdminPaths({ status: "published" })).rows.map((r) => r.slug)).toEqual(["live"]);
    expect((await listAdminPaths({ q: "BROUILLON" })).total).toBe(1);
    expect((await listAdminPaths({ q: "%" })).total).toBe(0);
    expect((await listAdminPaths({ page: 99 })).page).toBe(1);
  });
});
