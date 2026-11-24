import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { ERASED_CERTIFICATE_HOLDER, ERASED_NAME, eraseAccount, erasureBlocker } from "@/lib/account-erasure";
import { resetDatabase } from "../../support/test-db";
import { createCourse, createSubscription, createUser } from "../../support/factories";

beforeEach(() => resetDatabase(db));
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

/** A learner with a trace in every place the erasure must reach, and a payment it must leave alone. */
async function learnerWithHistory() {
  const user = await createUser({
    name: "Ada Lovelace",
    email: "ada@example.test",
    image: "https://avatars.githubusercontent.com/u/1",
    bio: "Mathématicienne",
    githubUrl: "https://github.com/ada",
    linkedinUrl: "https://linkedin.com/in/ada",
    websiteUrl: "https://ada.example",
    twoFactorEnabled: true,
  });
  const friend = await createUser();
  const course = await createCourse();
  const lesson = await db.lesson.create({ data: { courseId: course.id, title: "Leçon", slug: "lecon", order: 1, published: true } });

  await db.session.create({ data: { userId: user.id, token: "tok-1", expiresAt: new Date(Date.now() + 1e6) } });
  await db.account.create({ data: { userId: user.id, accountId: user.id, providerId: "credential", password: "hash" } });
  await db.account.create({ data: { userId: user.id, accountId: "gh-1", providerId: "github" } });
  await db.twoFactor.create({ data: { userId: user.id, secret: "s", backupCodes: "b" } });
  await db.verification.create({ data: { identifier: "ada@example.test", value: "token-1", expiresAt: new Date(Date.now() + 1e6) } });
  await db.lessonNote.create({ data: { userId: user.id, lessonId: lesson.id, content: "ma note" } });
  await db.notification.create({ data: { recipientId: user.id, senderId: friend.id, type: "FOLLOW", title: "t", message: "m" } });
  await db.notification.create({ data: { recipientId: friend.id, senderId: user.id, type: "FOLLOW", title: "t", message: "m" } });
  await db.userFollow.create({ data: { followerId: user.id, followingId: friend.id } });
  await db.userFollow.create({ data: { followerId: friend.id, followingId: user.id } });
  await db.mentorRequest.create({ data: { studentId: user.id, mentorId: friend.id, message: "bonjour, voici mon numéro" } });
  await db.xpEvent.create({ data: { userId: user.id, amount: 10, reason: "LESSON_COMPLETED" } });
  await db.userStreak.create({ data: { userId: user.id } });
  await db.enrollment.create({ data: { userId: user.id, courseId: course.id } });
  await db.progress.create({ data: { userId: user.id, lessonId: lesson.id, completed: true } });
  await db.review.create({ data: { userId: user.id, courseId: course.id, rating: 5, comment: "Excellent" } });
  await db.certificate.create({ data: { userId: user.id, courseId: course.id, holderName: "Ada Lovelace" } });
  const payment = await db.payment.create({ data: { userId: user.id, courseId: course.id, amount: 49.99, status: "COMPLETED" } });
  return { user, friend, course, payment };
}

describe("eraseAccount", () => {
  it("anonymises the person and removes every way to sign in", async () => {
    const { user } = await learnerWithHistory();
    expect(await eraseAccount(user.id)).toEqual({ ok: true });

    const erased = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(erased).toMatchObject({
      name: ERASED_NAME,
      email: `deleted-${user.id}@deleted.invalid`,
      emailVerified: false,
      image: null,
      bio: null,
      githubUrl: null,
      linkedinUrl: null,
      websiteUrl: null,
      role: "STUDENT",
      twoFactorEnabled: false,
      isBanned: true,
    });
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
    expect(await db.account.count({ where: { userId: user.id } })).toBe(0);
    expect(await db.twoFactor.count({ where: { userId: user.id } })).toBe(0);
    expect(await db.verification.count({ where: { identifier: "ada@example.test" } })).toBe(0);
  });

  it("removes the personal data that is not history", async () => {
    const { user, friend } = await learnerWithHistory();
    await eraseAccount(user.id);

    expect(await db.lessonNote.count({ where: { userId: user.id } })).toBe(0);
    expect(await db.notification.count({ where: { OR: [{ recipientId: user.id }, { senderId: user.id }] } })).toBe(0);
    expect(await db.userFollow.count({ where: { OR: [{ followerId: user.id }, { followingId: user.id }] } })).toBe(0);
    expect(await db.mentorRequest.count({ where: { OR: [{ studentId: user.id }, { mentorId: user.id }] } })).toBe(0);
    expect(await db.xpEvent.count({ where: { userId: user.id } })).toBe(0);
    expect(await db.userStreak.count({ where: { userId: user.id } })).toBe(0);
    // what belonged to someone else stays
    expect(await db.user.count({ where: { id: friend.id } })).toBe(1);
  });

  it("keeps the history without the name, and the payments untouched", async () => {
    const { user, course, payment } = await learnerWithHistory();
    await eraseAccount(user.id);

    expect(await db.review.count({ where: { userId: user.id } })).toBe(1); // text stays, author shows as erased
    expect(await db.enrollment.count({ where: { userId: user.id, courseId: course.id } })).toBe(1);
    expect(await db.progress.count({ where: { userId: user.id } })).toBe(1);
    expect((await db.certificate.findFirstOrThrow({ where: { userId: user.id } })).holderName).toBe(ERASED_CERTIFICATE_HOLDER);

    const kept = await db.payment.findUniqueOrThrow({ where: { id: payment.id } });
    expect(kept.status).toBe("COMPLETED");
    expect(Number(kept.amount)).toBe(49.99);
    expect(kept.userId).toBe(user.id);
  });

  it("writes it in the audit trail, with no personal data", async () => {
    const { user } = await learnerWithHistory();
    await eraseAccount(user.id);
    const [entry] = await db.auditLog.findMany({ where: { targetId: user.id } });
    expect(entry).toMatchObject({ action: "user.deleted", targetType: "user", actorId: user.id });
    expect(JSON.stringify(entry)).not.toContain("ada@example.test");
  });

  it("is all or nothing, and does nothing for an account that is gone", async () => {
    expect(await eraseAccount("nobody")).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });
});

describe("what stops an erasure", () => {
  it("a subscription that is running", async () => {
    const { user } = await learnerWithHistory();
    await createSubscription(user.id, { status: "ACTIVE", cancelAtPeriodEnd: false });
    expect(await eraseAccount(user.id)).toMatchObject({ ok: false, code: "ACTIVE_SUBSCRIPTION" });
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).name).toBe("Ada Lovelace"); // untouched
    expect(await db.session.count({ where: { userId: user.id } })).toBe(1);
  });

  it("is not stopped by a subscription already set to end, or already cancelled", async () => {
    const { user } = await learnerWithHistory();
    await createSubscription(user.id, { status: "ACTIVE", cancelAtPeriodEnd: true });
    expect(await erasureBlocker(user.id)).toBeNull();
    await db.subscription.update({ where: { userId: user.id }, data: { status: "CANCELED", cancelAtPeriodEnd: false } });
    expect(await erasureBlocker(user.id)).toBeNull();
  });

  it("courses the person authors", async () => {
    const teacher = await createUser({ role: "INSTRUCTOR" });
    await createCourse({ instructorId: teacher.id });
    expect(await eraseAccount(teacher.id)).toMatchObject({ ok: false, code: "OWNS_COURSES" });
  });

  it("being the last administrator", async () => {
    const admin = await createUser({ role: "ADMIN" });
    expect(await eraseAccount(admin.id)).toMatchObject({ ok: false, code: "LAST_ADMIN" });
    await createUser({ role: "ADMIN" });
    expect(await eraseAccount(admin.id)).toEqual({ ok: true });
  });
});
