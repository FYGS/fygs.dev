import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { AccessService } from "@/lib/access-service";
import {
  CourseAccessTier,
  PaymentKind,
  PaymentStatus,
  SubscriptionStatus,
} from "@/lib/generated/prisma/client";
import { resetDatabase } from "../../support/test-db";
import { createCourse, createSubscription, createUser, enroll } from "../../support/factories";

beforeEach(() => resetDatabase(db));
afterAll(async () => {
  await resetDatabase(db); // leave an empty database for the suites that run next
  await db.$disconnect();
});

describe("AccessService on a real database", () => {
  it("requires an enrollment, even for a free course", async () => {
    const user = await createUser();
    const free = await createCourse({ accessTier: CourseAccessTier.FREE });

    let access = await AccessService.checkCourseAccess(user.id, free.id);
    expect(access).toMatchObject({ canAccessCourse: false, isFreeCourse: true, accessReason: "not_enrolled" });

    await enroll(user.id, free.id);
    access = await AccessService.checkCourseAccess(user.id, free.id);
    expect(access).toMatchObject({ canAccessCourse: true, canAccessLessons: true, accessReason: "ok" });
    expect(access.enrollmentDate).toBeInstanceOf(Date);
  });

  it("offers a first-lesson preview of a premium course only when previewEnabled", async () => {
    const user = await createUser();
    const withPreview = await createCourse({ accessTier: CourseAccessTier.PREMIUM, previewEnabled: true });
    const withoutPreview = await createCourse({ accessTier: CourseAccessTier.PREMIUM, previewEnabled: false });

    expect(await AccessService.checkCourseAccess(user.id, withPreview.id)).toMatchObject({
      canAccessCourse: false,
      canPreviewFirstLesson: true,
      accessReason: "preview_only",
    });
    expect(await AccessService.checkCourseAccess(user.id, withoutPreview.id)).toMatchObject({
      canPreviewFirstLesson: false,
      accessReason: "not_enrolled",
    });
  });

  it("only the first lesson of a locked premium course is reachable", async () => {
    const user = await createUser();
    const course = await createCourse({ accessTier: CourseAccessTier.PREMIUM, previewEnabled: true });
    const lessons = await Promise.all(
      [1, 2, 3].map((order) =>
        db.lesson.create({
          data: { courseId: course.id, title: `L${order}`, slug: `l-${order}`, order, published: true },
        }),
      ),
    );

    expect(await AccessService.canAccessLesson(user.id, lessons[0].id)).toBe(true);
    expect(await AccessService.canAccessLesson(user.id, lessons[1].id)).toBe(false);
    expect(await AccessService.canAccessLesson(user.id, "does-not-exist")).toBe(false);

    await enroll(user.id, course.id);
    expect(await AccessService.canAccessLesson(user.id, lessons[2].id)).toBe(true);
  });

  it("an ACTIVE subscription counts, a CANCELED one does not", async () => {
    const active = await createUser();
    const canceled = await createUser();
    const none = await createUser();
    await createSubscription(active.id, { status: SubscriptionStatus.ACTIVE, cancelAtPeriodEnd: true });
    await createSubscription(canceled.id, { status: SubscriptionStatus.CANCELED });

    expect(await AccessService.hasActiveSubscription(active.id)).toBe(true); // keeps access until the period ends
    expect(await AccessService.hasActiveSubscription(canceled.id)).toBe(false);
    expect(await AccessService.hasActiveSubscription(none.id)).toBe(false);

    const premium = await createCourse({ accessTier: CourseAccessTier.PREMIUM });
    const access = await AccessService.checkCourseAccess(active.id, premium.id);
    expect(access).toMatchObject({ hasActiveSubscription: true, subscriptionCancelAtPeriodEnd: true });
  });

  it("getCourseAccessContext + evaluateCourseAccess agree with the stored rows", async () => {
    const user = await createUser();
    const premium = await createCourse({ accessTier: CourseAccessTier.PREMIUM });
    await enroll(user.id, premium.id);

    let context = await AccessService.getCourseAccessContext(user.id, premium.id);
    expect(AccessService.evaluateCourseAccess(context)).toMatchObject({ allowed: false, reason: "PREMIUM_LOCKED" });

    await db.payment.create({
      data: {
        userId: user.id,
        courseId: premium.id,
        amount: "49.90",
        kind: PaymentKind.COURSE,
        status: PaymentStatus.COMPLETED,
      },
    });
    context = await AccessService.getCourseAccessContext(user.id, premium.id);
    expect(context.payments?.[0].kind).toBe(PaymentKind.COURSE);
    expect(AccessService.evaluateCourseAccess(context)).toMatchObject({ allowed: true, reason: "LIFETIME_PURCHASE" });

    await expect(AccessService.getCourseAccessContext(user.id, "missing")).rejects.toThrow(/not found/);
  });

  it("checkMultipleCoursesAccess answers per course; one enrollment per user and course", async () => {
    const user = await createUser();
    const [a, b] = await Promise.all([createCourse(), createCourse()]);
    await enroll(user.id, a.id);
    await expect(enroll(user.id, a.id)).rejects.toMatchObject({ code: "P2002" });

    expect(await AccessService.isEnrolledInCourse(user.id, a.id)).toBe(true);
    expect(await AccessService.isEnrolledInCourse(user.id, b.id)).toBe(false);

    const result = await AccessService.checkMultipleCoursesAccess(user.id, [a.id, b.id]);
    expect(result[a.id]).toMatchObject({ isEnrolledInCourse: true, canAccessCourse: true });
    expect(result[b.id]).toMatchObject({ isEnrolledInCourse: false, canAccessCourse: false });
  });
});
