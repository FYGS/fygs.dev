import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { db } from "@/lib/db";
import { enrollCourse } from "@/app/[locale]/(main)/dashboard/actions/enrollCourse";
import { updateLessonProgress } from "@/app/[locale]/(main)/dashboard/actions/updateLessonProgress";
import { cancelSubscription } from "@/app/[locale]/(main)/dashboard/actions/cancelSubscription";
import { issueCertificate } from "@/app/[locale]/(main)/dashboard/actions/issueCertificate";
import { AccessService } from "@/lib/access-service";
import { auth } from "@/lib/auth";

// Mock auth for testing
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(() =>
        Promise.resolve({
          user: { id: "test-user-id", email: "test@example.com" },
        })
      ),
    },
  },
}));

// Mock headers
vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

describe("User Full Flow Integration Tests", () => {
  let testUserId: string;
  let freeCourseId: string;
  let premiumCourseId: string;
  let lifetimeCourseId: string;
  let subscriptionId: string;

  beforeEach(async () => {
    // Create test user
    const user = await db.user.create({
      data: {
        email: "fullflow-test@example.com",
        name: "Full Flow Test User",
        emailVerified: true,
      },
    });
    testUserId = user.id;

    // Create test courses
    const [freeCourse, premiumCourse, lifetimeCourse] = await Promise.all([
      db.course.create({
        data: {
          title: "Free Test Course",
          slug: "free-test-course",
          description: "Free course for testing",
          category: "JAVASCRIPT",
          level: "BEGINNER",
          published: true,
          accessTier: "FREE",
        },
      }),
      db.course.create({
        data: {
          title: "Premium Test Course",
          slug: "premium-test-course",
          description: "Premium course for testing",
          category: "TYPESCRIPT",
          level: "INTERMEDIATE",
          published: true,
          accessTier: "PREMIUM",
        },
      }),
      db.course.create({
        data: {
          title: "Lifetime Purchase Course",
          slug: "lifetime-test-course",
          description: "Course purchased for lifetime",
          category: "FULLSTACK",
          level: "ADVANCED",
          published: true,
          accessTier: "PREMIUM",
        },
      }),
    ]);

    freeCourseId = freeCourse.id;
    premiumCourseId = premiumCourse.id;
    lifetimeCourseId = lifetimeCourse.id;

    // Create lessons for each course
    await Promise.all([
      // Free course lessons
      db.lesson.create({
        data: {
          title: "Free Lesson 1",
          slug: "free-lesson-1",
          courseId: freeCourseId,
          order: 1,
          published: true,
        },
      }),
      db.lesson.create({
        data: {
          title: "Free Lesson 2",
          slug: "free-lesson-2",
          courseId: freeCourseId,
          order: 2,
          published: true,
        },
      }),
      // Premium course lessons
      db.lesson.create({
        data: {
          title: "Premium Lesson 1",
          slug: "premium-lesson-1",
          courseId: premiumCourseId,
          order: 1,
          published: true,
        },
      }),
      db.lesson.create({
        data: {
          title: "Premium Lesson 2",
          slug: "premium-lesson-2",
          courseId: premiumCourseId,
          order: 2,
          published: true,
        },
      }),
      // Lifetime course lessons
      db.lesson.create({
        data: {
          title: "Lifetime Lesson 1",
          slug: "lifetime-lesson-1",
          courseId: lifetimeCourseId,
          order: 1,
          published: true,
        },
      }),
      db.lesson.create({
        data: {
          title: "Lifetime Lesson 2",
          slug: "lifetime-lesson-2",
          courseId: lifetimeCourseId,
          order: 2,
          published: true,
        },
      }),
    ]);

    // Mock the auth user ID to match our test user
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: testUserId, email: "fullflow-test@example.com" },
    });
  });

  afterEach(async () => {
    // Cleanup in reverse dependency order
    await db.certificate.deleteMany({ where: { userId: testUserId } });
    await db.progress.deleteMany({ where: { userId: testUserId } });
    await db.enrollment.deleteMany({ where: { userId: testUserId } });
    await db.payment.deleteMany({ where: { userId: testUserId } });
    await db.subscription.deleteMany({ where: { userId: testUserId } });
    await db.lesson.deleteMany({
      where: {
        courseId: {
          in: [freeCourseId, premiumCourseId, lifetimeCourseId],
        },
      },
    });
    await db.course.deleteMany({
      where: {
        id: {
          in: [freeCourseId, premiumCourseId, lifetimeCourseId],
        },
      },
    });
    await db.user.delete({ where: { id: testUserId } });
    vi.clearAllMocks();
  });

  test("complete user flow: enroll free → subscribe → enroll premium → cancel (eligible) → retain lifetime purchased course", async () => {
    // Step 1: Enroll in free course
    const freeEnrollResult = await enrollCourse({ courseId: freeCourseId });
    expect(freeEnrollResult.success).toBe(true);
    expect(freeEnrollResult.enrollment).toBeDefined();

    // Verify access to free course
    const freeAccessResult = await AccessService.checkCourseAccess(
      testUserId,
      freeCourseId
    );
    expect(freeAccessResult.canAccessCourse).toBe(true);

    // Step 2: Create subscription (simulate subscription creation)
    const subscription = await db.subscription.create({
      data: {
        userId: testUserId,
        status: "ACTIVE",
        priceId: "price_test_premium_monthly",
        stripeCustomerId: "cus_test",
        stripeSubscriptionId: "sub_test",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });
    subscriptionId = subscription.id;

    // Verify has active subscription
    const hasActiveSubscription = await AccessService.hasActiveSubscription(
      testUserId
    );
    expect(hasActiveSubscription).toBe(true);

    // Step 3: Enroll in premium course
    const premiumEnrollResult = await enrollCourse({
      courseId: premiumCourseId,
    });
    expect(premiumEnrollResult.success).toBe(true);
    expect(premiumEnrollResult.enrollment).toBeDefined();

    // Verify access to premium course
    const premiumAccessResult = await AccessService.checkCourseAccess(
      testUserId,
      premiumCourseId
    );
    expect(premiumAccessResult.canAccessCourse).toBe(true);

    // Step 4: Purchase lifetime course
    const lifetimePayment = await db.payment.create({
      data: {
        userId: testUserId,
        amount: 29900, // $299
        currency: "EUR",
        status: "COMPLETED",
        description: `Course:${lifetimeCourseId} - Lifetime Access`,
        stripePaymentIntentId: "pi_test_lifetime",
      },
    });
    paymentId = lifetimePayment.id;

    // Enroll in lifetime course
    const lifetimeEnrollResult = await enrollCourse({
      courseId: lifetimeCourseId,
    });
    expect(lifetimeEnrollResult.success).toBe(true);

    // Verify access to lifetime course
    const lifetimeAccessResult = await AccessService.checkCourseAccess(
      testUserId,
      lifetimeCourseId
    );
    expect(lifetimeAccessResult.canAccessCourse).toBe(true);

    // Step 5: Complete some lessons and verify progress
    const lessons = await db.lesson.findMany({
      where: { courseId: freeCourseId },
      orderBy: { order: "asc" },
    });

    for (const lesson of lessons) {
      const progressResult = await updateLessonProgress({
        lessonId: lesson.id,
        completed: true,
        watchTimeDelta: 300,
      });
      expect(progressResult.success).toBe(true);
    }

    // Issue certificate for completed free course
    const certificateResult = await issueCertificate({
      courseId: freeCourseId,
    });
    expect(certificateResult.success).toBe(true);
    expect(certificateResult.certificate).toBeDefined();

    // Step 6: Cancel subscription (within refund window)
    const cancelResult = await cancelSubscription({
      immediate: false,
      reason: "Testing refund eligibility",
    });
    expect(cancelResult.success).toBe(true);
    expect(cancelResult.refund?.eligible).toBe(true);

    // Verify subscription is cancelled
    const updatedSubscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
    });
    expect(updatedSubscription?.cancelAtPeriodEnd).toBe(true);

    // Step 7: Verify access states after cancellation
    // Free course: should still have access (enrolled)
    const freeAccessAfterCancelResult = await AccessService.checkCourseAccess(
      testUserId,
      freeCourseId
    );
    expect(freeAccessAfterCancelResult.canAccessCourse).toBe(true);

    // Premium course: should lose access after period end (simulate)
    await db.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: "CANCELED",
        currentPeriodEnd: new Date(Date.now() - 1000), // Past date
      },
    });

    const premiumAccessAfterCancelResult =
      await AccessService.checkCourseAccess(testUserId, premiumCourseId);
    expect(premiumAccessAfterCancelResult.canAccessCourse).toBe(false);

    // Lifetime course: should retain access (lifetime purchase)
    const lifetimeAccessAfterCancelResult =
      await AccessService.checkCourseAccess(testUserId, lifetimeCourseId);
    expect(lifetimeAccessAfterCancelResult.canAccessCourse).toBe(true);

    // Step 8: Verify enrollments persist
    const enrollments = await db.enrollment.findMany({
      where: { userId: testUserId },
      include: { course: { select: { title: true, accessTier: true } } },
    });

    expect(enrollments).toHaveLength(3);
    expect(enrollments.some((e) => e.courseId === freeCourseId)).toBe(true);
    expect(enrollments.some((e) => e.courseId === premiumCourseId)).toBe(true);
    expect(enrollments.some((e) => e.courseId === lifetimeCourseId)).toBe(true);

    // Step 9: Verify progress persists
    const progressRecords = await db.progress.findMany({
      where: { userId: testUserId },
    });

    expect(progressRecords.length).toBeGreaterThan(0);
    expect(progressRecords.every((p) => p.userId === testUserId)).toBe(true);

    // Step 10: Verify certificate persists
    const certificates = await db.certificate.findMany({
      where: { userId: testUserId },
    });

    expect(certificates).toHaveLength(1);
    expect(certificates[0].courseId).toBe(freeCourseId);
  });

  test("handles subscription re-activation and access restoration", async () => {
    // Create and cancel subscription
    const subscription = await db.subscription.create({
      data: {
        userId: testUserId,
        status: "CANCELED",
        priceId: "price_test_premium_monthly",
        stripeCustomerId: "cus_test",
        stripeSubscriptionId: "sub_test",
        currentPeriodStart: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    });

    // Enroll in premium course while having cancelled subscription
    const enrollResult = await enrollCourse({ courseId: premiumCourseId });
    expect(enrollResult.success).toBe(false); // Should fail without active subscription

    // Reactivate subscription
    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
      },
    });

    // Now enrollment should succeed
    const reEnrollResult = await enrollCourse({ courseId: premiumCourseId });
    expect(reEnrollResult.success).toBe(true);

    // Verify access is restored
    const hasAccessResult = await AccessService.checkCourseAccess(
      testUserId,
      premiumCourseId
    );
    expect(hasAccessResult.canAccessCourse).toBe(true);
  });

  test("verifies lifetime purchase persists through subscription changes", async () => {
    // Purchase lifetime course
    await db.payment.create({
      data: {
        userId: testUserId,
        amount: 29900,
        currency: "EUR",
        status: "COMPLETED",
        description: `Course:${lifetimeCourseId} - Lifetime Access`,
        stripePaymentIntentId: "pi_test_lifetime_persistence",
      },
    });

    await enrollCourse({ courseId: lifetimeCourseId });

    // Create and cancel subscription
    await db.subscription.create({
      data: {
        userId: testUserId,
        status: "CANCELED",
        priceId: "price_test_premium_monthly",
        stripeCustomerId: "cus_test",
        stripeSubscriptionId: "sub_test",
        currentPeriodStart: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    });

    // Verify lifetime course access persists despite subscription cancellation
    const lifetimeAccessResult = await AccessService.checkCourseAccess(
      testUserId,
      lifetimeCourseId
    );
    expect(lifetimeAccessResult.canAccessCourse).toBe(true);

    // Complete lessons and ensure progress persists
    const lessons = await db.lesson.findMany({
      where: { courseId: lifetimeCourseId },
      orderBy: { order: "asc" },
    });

    for (const lesson of lessons) {
      const progressResult = await updateLessonProgress({
        lessonId: lesson.id,
        completed: true,
      });
      expect(progressResult.success).toBe(true);
    }

    // Verify progress persists
    const progress = await db.progress.findMany({
      where: {
        userId: testUserId,
        lesson: { courseId: lifetimeCourseId },
      },
    });

    expect(progress).toHaveLength(lessons.length);
    expect(progress.every((p) => p.completed)).toBe(true);
  });
});
