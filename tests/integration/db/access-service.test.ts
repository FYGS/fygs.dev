import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { AccessService } from "@/lib/access-service";
import { coursesWithPreview, getEntitlement, getEntitlements } from "@/lib/access/entitlement";
import { CourseAccessTier, PaymentKind, PaymentStatus, Role, SubscriptionStatus } from "@/lib/generated/prisma/client";
import { resetDatabase } from "../../support/test-db";
import { createCourse, createSubscription, createUser, enroll } from "../../support/factories";

beforeEach(() => resetDatabase(db));
afterAll(async () => {
  await resetDatabase(db); // leave an empty database for the suites that run next
  await db.$disconnect();
});

const purchase = (userId: string, courseId: string, status: PaymentStatus = PaymentStatus.COMPLETED) =>
  db.payment.create({ data: { userId, courseId, amount: "49.90", kind: PaymentKind.COURSE, status } });

const lessons = (courseId: string, count: number, flagged: number[] = []) =>
  Promise.all(
    Array.from({ length: count }, (_, i) =>
      db.lesson.create({
        data: { courseId, title: `L${i + 1}`, slug: `l-${i + 1}`, order: i + 1, published: true, isPreview: flagged.includes(i) },
      }),
    ),
  );

describe("entitlement on a real database (lib/access/entitlement.ts)", () => {
  it("a free course is open once enrolled, and only then", async () => {
    const user = await createUser();
    const free = await createCourse({ accessTier: CourseAccessTier.FREE });

    expect(await getEntitlement(user.id, free.id)).toMatchObject({ eligible: true, entitled: false, source: "free" });
    await enroll(user.id, free.id);
    expect(await getEntitlement(user.id, free.id)).toMatchObject({ entitled: true, source: "free" });
    expect(await AccessService.checkCourseAccess(user.id, free.id)).toMatchObject({ canAccessCourse: true, recordsProgress: true, accessReason: "ok" });
  });

  it("a visitor (no account) holds nothing", async () => {
    const free = await createCourse({ accessTier: CourseAccessTier.FREE });
    const all = await getEntitlements(null, [free.id]);
    expect(all.signedIn).toBe(false);
    expect(all.courses.get(free.id)).toMatchObject({ enrolled: false, entitled: false });
  });

  it("premium: purchase, refund, purchase of another course", async () => {
    const user = await createUser();
    const [premium, other] = await Promise.all([
      createCourse({ accessTier: CourseAccessTier.PREMIUM }),
      createCourse({ accessTier: CourseAccessTier.PREMIUM }),
    ]);
    await Promise.all([enroll(user.id, premium.id), enroll(user.id, other.id)]);
    const bought = await purchase(user.id, premium.id);

    expect(await getEntitlement(user.id, premium.id)).toMatchObject({ entitled: true, source: "purchase", purchased: true });
    expect(await getEntitlement(user.id, other.id)).toMatchObject({ entitled: false, lapsed: "premium_required" });

    await db.payment.update({ where: { id: bought.id }, data: { status: PaymentStatus.REFUNDED } });
    expect(await getEntitlement(user.id, premium.id)).toMatchObject({ entitled: false, purchased: false, lapsed: "refunded" });
    expect(await AccessService.checkCourseAccess(user.id, premium.id)).toMatchObject({ canAccessCourse: false, accessReason: "premium_locked" });

    // bought again after the refund: the new purchase counts
    await purchase(user.id, premium.id);
    expect(await getEntitlement(user.id, premium.id)).toMatchObject({ entitled: true, source: "purchase", lapsed: null });
  });

  it("premium: an active or trialing subscription opens it; a cancelled one leaves the learner lapsed", async () => {
    const user = await createUser();
    const premium = await createCourse({ accessTier: CourseAccessTier.PREMIUM });
    await enroll(user.id, premium.id);
    const sub = await createSubscription(user.id, { status: SubscriptionStatus.TRIALING });

    expect(await getEntitlement(user.id, premium.id)).toMatchObject({ entitled: true, source: "subscription" });
    expect(await AccessService.hasActiveSubscription(user.id)).toBe(true);

    await db.subscription.update({ where: { id: sub.id }, data: { status: SubscriptionStatus.ACTIVE, cancelAtPeriodEnd: true } });
    expect(await getEntitlement(user.id, premium.id)).toMatchObject({ entitled: true }); // until the period ends

    await db.subscription.update({ where: { id: sub.id }, data: { status: SubscriptionStatus.CANCELED } });
    expect(await getEntitlement(user.id, premium.id)).toMatchObject({ entitled: false, lapsed: "subscription_ended" });
    expect(await AccessService.hasActiveSubscription(user.id)).toBe(false);
  });

  it("a subscriber who did not enrol yet is eligible: one click away", async () => {
    const user = await createUser();
    const premium = await createCourse({ accessTier: CourseAccessTier.PREMIUM });
    await createSubscription(user.id, { status: SubscriptionStatus.ACTIVE });
    expect(await getEntitlement(user.id, premium.id)).toMatchObject({ eligible: true, entitled: false, source: "subscription" });
  });

  it("an access granted by an administrator opens a premium course without payment or subscription", async () => {
    const [user, admin] = await Promise.all([createUser(), createUser({ role: Role.ADMIN })]);
    const premium = await createCourse({ accessTier: CourseAccessTier.PREMIUM });
    await db.enrollment.create({ data: { userId: user.id, courseId: premium.id, grantedById: admin.id, grantedAt: new Date() } });
    expect(await getEntitlement(user.id, premium.id)).toMatchObject({ entitled: true, source: "grant", granted: true });
  });

  it("the author and administrators are staff; another instructor is not", async () => {
    const [author, admin, other] = await Promise.all([
      createUser({ role: Role.INSTRUCTOR }),
      createUser({ role: Role.ADMIN }),
      createUser({ role: Role.INSTRUCTOR }),
    ]);
    const course = await createCourse({ accessTier: CourseAccessTier.PREMIUM, instructorId: author.id, published: false });
    expect(await getEntitlement({ id: author.id, role: Role.INSTRUCTOR }, course.id)).toMatchObject({ entitled: true, source: "staff", isStaff: true });
    expect(await getEntitlement(admin.id, course.id)).toMatchObject({ source: "staff" });
    expect(await getEntitlement(other.id, course.id)).toMatchObject({ entitled: false, isStaff: false });
    // staff look, nothing recorded
    expect(await AccessService.checkCourseAccess(author.id, course.id)).toMatchObject({ canAccessCourse: true, recordsProgress: false });
  });

  it("entitlements of many courses come in one call, unknown ids are left out", async () => {
    const user = await createUser();
    const [free, bought, locked] = await Promise.all([
      createCourse({ accessTier: CourseAccessTier.FREE }),
      createCourse({ accessTier: CourseAccessTier.PREMIUM }),
      createCourse({ accessTier: CourseAccessTier.PREMIUM }),
    ]);
    await Promise.all([enroll(user.id, free.id), enroll(user.id, bought.id), enroll(user.id, locked.id)]);
    await purchase(user.id, bought.id);

    const { courses } = await getEntitlements(user.id, [free.id, bought.id, locked.id, "missing"]);
    expect(courses.size).toBe(3);
    expect(courses.get(free.id)?.source).toBe("free");
    expect(courses.get(bought.id)?.source).toBe("purchase");
    expect(courses.get(locked.id)).toMatchObject({ entitled: false, lapsed: "premium_required" });
  });
});

describe("free sample lessons", () => {
  it("flagged lessons, plus the first one when the course offers it; nothing more", async () => {
    const user = await createUser();
    const course = await createCourse({ accessTier: CourseAccessTier.PREMIUM, previewEnabled: true });
    const [first, second, third] = await lessons(course.id, 3, [2]);

    expect(await AccessService.canAccessLesson(user.id, first.id)).toBe(true);
    expect(await AccessService.canAccessLesson(user.id, third.id)).toBe(true);
    expect(await AccessService.canAccessLesson(user.id, second.id)).toBe(false);
    expect(await AccessService.canAccessLesson(user.id, "does-not-exist")).toBe(false);
    // a sample is watched, never recorded
    expect(await AccessService.canRecordLessonProgress(user.id, first.id)).toBe(false);

    await db.course.update({ where: { id: course.id }, data: { previewEnabled: false } });
    expect(await AccessService.canAccessLesson(user.id, first.id)).toBe(false);
    expect(await AccessService.canAccessLesson(user.id, third.id)).toBe(true);
  });

  it("the rule is the same for a free course; an unpublished course or one without lesson has no sample", async () => {
    const [free, draft, empty] = await Promise.all([
      createCourse({ accessTier: CourseAccessTier.FREE, previewEnabled: true }),
      createCourse({ accessTier: CourseAccessTier.PREMIUM, previewEnabled: true, published: false }),
      createCourse({ accessTier: CourseAccessTier.PREMIUM, previewEnabled: true }),
    ]);
    await lessons(free.id, 2);
    await lessons(draft.id, 2);
    const withSample = await coursesWithPreview([free.id, draft.id, empty.id]);
    expect([...withSample]).toEqual([free.id]);

    const user = await createUser();
    expect(await AccessService.checkCourseAccess(user.id, free.id)).toMatchObject({ canPreviewFirstLesson: true, accessReason: "preview_only" });
    expect(await AccessService.checkCourseAccess(user.id, empty.id)).toMatchObject({ canPreviewFirstLesson: false, accessReason: "not_enrolled" });
  });

  it("an entitled learner opens and records every lesson", async () => {
    const user = await createUser();
    const course = await createCourse({ accessTier: CourseAccessTier.PREMIUM, previewEnabled: false });
    const [, second] = await lessons(course.id, 2);
    expect(await AccessService.canAccessLesson(user.id, second.id)).toBe(false);
    await enroll(user.id, course.id);
    await createSubscription(user.id, { status: SubscriptionStatus.ACTIVE });
    expect(await AccessService.canAccessLesson(user.id, second.id)).toBe(true);
    expect(await AccessService.canRecordLessonProgress(user.id, second.id)).toBe(true);
  });
});
