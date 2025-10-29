/**
 * T109: Re-Subscription Preservation Test
 *
 * Tests that when users re-activate their subscription after cancellation,
 * their previous progress and lifetime purchases are preserved as required
 * by FR-034. This ensures data continuity and user experience integrity.
 */

import { describe, test, expect, afterEach, beforeEach, vi } from "vitest";
import { db } from "@/lib/db";
import { createTestEnvironment } from "../../utils/test-database";

// Mock access service for testing access preservation
const mockAccessService = {
  checkCourseAccess: vi.fn(),
  checkLessonAccess: vi.fn(),
  hasActivePremiumSubscription: vi.fn(),
};

vi.mock("@/lib/access-service", () => ({
  default: mockAccessService,
  AccessService: mockAccessService,
}));

describe("T109: Re-Subscription Preservation Test", () => {
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe("Progress Preservation", () => {
    test("preserves lesson progress after subscription re-activation", async () => {
      // Create test user
      const user = await db.user.create({
        data: {
          email: `progress-test-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}@example.com`,
          name: "Progress Test User",
          emailVerified: true,
        },
      });

      // Create premium course with multiple lessons
      const course = await db.course.create({
        data: {
          title: "Progress Preservation Course",
          slug: `progress-course-${Date.now()}`,
          description: "Course for testing progress preservation",
          price: 199.99,
          level: "INTERMEDIATE",
          published: true,
          accessTier: "PREMIUM",
          category: "JAVASCRIPT",
        },
      });

      const lessons = await Promise.all([
        db.lesson.create({
          data: {
            title: "Lesson 1",
            slug: `lesson-1-${Date.now()}`,
            content: "First lesson content",
            courseId: course.id,
            order: 1,
            published: true,
          },
        }),
        db.lesson.create({
          data: {
            title: "Lesson 2",
            slug: `lesson-2-${Date.now()}`,
            content: "Second lesson content",
            courseId: course.id,
            order: 2,
            published: true,
          },
        }),
        db.lesson.create({
          data: {
            title: "Lesson 3",
            slug: `lesson-3-${Date.now()}`,
            content: "Third lesson content",
            courseId: course.id,
            order: 3,
            published: true,
          },
        }),
      ]);

      testEnv.trackUser(user.id);
      testEnv.trackCourse(course.id);

      // Step 1: Create initial active subscription
      const initialSubscription = await db.subscription.create({
        data: {
          userId: user.id,
          status: "ACTIVE",
          plan: "PREMIUM",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          stripeSubscriptionId: `sub_initial_${Date.now()}`,
          priceId: "price_premium",
        },
      });

      // Create enrollment
      await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          enrolledAt: new Date(),
        },
      });

      // Step 2: User completes some lessons and makes progress
      const progress = await Promise.all([
        db.progress.create({
          data: {
            userId: user.id,
            lessonId: lessons[0].id,
            completed: true,
            completedAt: new Date(),
          },
        }),
        db.progress.create({
          data: {
            userId: user.id,
            lessonId: lessons[1].id,
            completed: true,
            completedAt: new Date(),
          },
        }),
        db.progress.create({
          data: {
            userId: user.id,
            lessonId: lessons[2].id,
            completed: false, // Partially completed course
          },
        }),
      ]);

      // Verify initial progress (order by lesson order to ensure consistent indexing)
      const initialProgress = await db.progress.findMany({
        where: { userId: user.id },
        include: { lesson: true },
        orderBy: { lesson: { order: "asc" } },
      });
      expect(initialProgress).toHaveLength(3);
      expect(initialProgress[0].completed).toBe(true);
      expect(initialProgress[1].completed).toBe(true);
      expect(initialProgress[2].completed).toBe(false);

      // Step 3: Cancel subscription
      await db.subscription.update({
        where: { id: initialSubscription.id },
        data: {
          status: "CANCELED",
        },
      });

      // Verify progress still exists after cancellation
      const progressAfterCancel = await db.progress.findMany({
        where: { userId: user.id },
        include: { lesson: true },
        orderBy: { lesson: { order: "asc" } },
      });
      expect(progressAfterCancel).toHaveLength(3);
      expect(progressAfterCancel[0].completed).toBe(true);
      expect(progressAfterCancel[1].completed).toBe(true);
      expect(progressAfterCancel[2].completed).toBe(false);

      // Step 4: Re-activate subscription (new subscription with same user)
      await db.subscription.update({
        where: { id: initialSubscription.id },
        data: {
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          stripeSubscriptionId: `sub_reactivated_${Date.now()}`,
        },
      });

      // Step 5: Verify progress is preserved after re-activation
      const progressAfterReactivation = await db.progress.findMany({
        where: { userId: user.id },
        include: { lesson: true },
        orderBy: { lesson: { order: "asc" } },
      });
      expect(progressAfterReactivation).toHaveLength(3);
      expect(progressAfterReactivation[0].completed).toBe(true);
      expect(progressAfterReactivation[1].completed).toBe(true);
      expect(progressAfterReactivation[2].completed).toBe(false);

      // Verify the exact same progress records (by ID) - find by lesson order
      const progressByLessonOrder = progress.sort((a, b) => {
        const lessonA = lessons.find((l) => l.id === a.lessonId)!;
        const lessonB = lessons.find((l) => l.id === b.lessonId)!;
        return lessonA.order - lessonB.order;
      });

      expect(progressAfterReactivation[0].id).toBe(progressByLessonOrder[0].id);
      expect(progressAfterReactivation[1].id).toBe(progressByLessonOrder[1].id);
      expect(progressAfterReactivation[2].id).toBe(progressByLessonOrder[2].id);

      // Verify completion timestamps are preserved
      expect(progressAfterReactivation[0].completedAt).toEqual(
        progressByLessonOrder[0].completedAt
      );
      expect(progressAfterReactivation[1].completedAt).toEqual(
        progressByLessonOrder[1].completedAt
      );
      expect(progressAfterReactivation[2].completedAt).toBe(null);
    });

    test("preserves course completion status after re-subscription", async () => {
      // Create test user
      const user = await db.user.create({
        data: {
          email: `completion-test-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}@example.com`,
          name: "Completion Test User",
          emailVerified: true,
        },
      });

      // Create course with lessons
      const course = await db.course.create({
        data: {
          title: "Completion Test Course",
          slug: `completion-course-${Date.now()}`,
          description: "Course for testing completion preservation",
          price: 149.99,
          level: "BEGINNER",
          published: true,
          accessTier: "PREMIUM",
          category: "TYPESCRIPT",
        },
      });

      const lessons = await Promise.all([
        db.lesson.create({
          data: {
            title: "Completion Lesson 1",
            slug: `completion-lesson-1-${Date.now()}`,
            content: "First lesson",
            courseId: course.id,
            order: 1,
            published: true,
          },
        }),
        db.lesson.create({
          data: {
            title: "Completion Lesson 2",
            slug: `completion-lesson-2-${Date.now()}`,
            content: "Second lesson",
            courseId: course.id,
            order: 2,
            published: true,
          },
        }),
      ]);

      testEnv.trackUser(user.id);
      testEnv.trackCourse(course.id);

      // Create subscription and enrollment
      const subscription = await db.subscription.create({
        data: {
          userId: user.id,
          status: "ACTIVE",
          plan: "PREMIUM",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          stripeSubscriptionId: `sub_completion_${Date.now()}`,
          priceId: "price_premium",
        },
      });

      const enrollment = await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          enrolledAt: new Date(),
        },
      });

      // Complete all lessons
      await Promise.all([
        db.progress.create({
          data: {
            userId: user.id,
            lessonId: lessons[0].id,
            completed: true,
            completedAt: new Date(),
          },
        }),
        db.progress.create({
          data: {
            userId: user.id,
            lessonId: lessons[1].id,
            completed: true,
            completedAt: new Date(),
          },
        }),
      ]);

      // Mark course as completed
      const courseCompletionDate = new Date();
      await db.enrollment.update({
        where: { id: enrollment.id },
        data: {
          completedAt: courseCompletionDate,
        },
      });

      // Verify course completion
      const completedEnrollment = await db.enrollment.findUnique({
        where: { id: enrollment.id },
      });
      expect(completedEnrollment?.completedAt).toEqual(courseCompletionDate);

      // Cancel subscription
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "CANCELED",
        },
      });

      // Verify course completion persists after cancellation
      const enrollmentAfterCancel = await db.enrollment.findUnique({
        where: { id: enrollment.id },
      });
      expect(enrollmentAfterCancel?.completedAt).toEqual(courseCompletionDate);

      // Re-activate subscription
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Verify course completion is preserved after re-activation
      const enrollmentAfterReactivation = await db.enrollment.findUnique({
        where: { id: enrollment.id },
      });
      expect(enrollmentAfterReactivation?.completedAt).toEqual(
        courseCompletionDate
      );

      // Verify all lesson progress is also preserved
      const allProgress = await db.progress.findMany({
        where: { userId: user.id },
      });
      expect(allProgress).toHaveLength(2);
      expect(allProgress.every((p) => p.completed)).toBe(true);
    });
  });

  describe("Enrollment Preservation", () => {
    test("preserves enrollment history across subscription changes", async () => {
      // Create test user
      const user = await db.user.create({
        data: {
          email: `enrollment-test-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}@example.com`,
          name: "Enrollment Test User",
          emailVerified: true,
        },
      });

      // Create multiple courses
      const courses = await Promise.all([
        db.course.create({
          data: {
            title: "Premium Course A",
            slug: `premium-a-${Date.now()}`,
            description: "First premium course",
            price: 199.99,
            level: "BEGINNER",
            published: true,
            accessTier: "PREMIUM",
            category: "JAVASCRIPT",
          },
        }),
        db.course.create({
          data: {
            title: "Premium Course B",
            slug: `premium-b-${Date.now()}`,
            description: "Second premium course",
            price: 299.99,
            level: "INTERMEDIATE",
            published: true,
            accessTier: "PREMIUM",
            category: "TYPESCRIPT",
          },
        }),
        db.course.create({
          data: {
            title: "Free Course C",
            slug: `free-c-${Date.now()}`,
            description: "Free course",
            price: 0,
            level: "BEGINNER",
            published: true,
            accessTier: "FREE",
            category: "FRONTEND",
          },
        }),
      ]);

      testEnv.trackUser(user.id);
      courses.forEach((c) => testEnv.trackCourse(c.id));

      // Create subscription and enroll in courses
      const subscription = await db.subscription.create({
        data: {
          userId: user.id,
          status: "ACTIVE",
          plan: "PREMIUM",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          stripeSubscriptionId: `sub_enrollment_${Date.now()}`,
          priceId: "price_premium",
        },
      });

      const enrollmentDates = [
        new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      ];

      const enrollments = await Promise.all([
        db.enrollment.create({
          data: {
            userId: user.id,
            courseId: courses[0].id,
            enrolledAt: enrollmentDates[0],
          },
        }),
        db.enrollment.create({
          data: {
            userId: user.id,
            courseId: courses[1].id,
            enrolledAt: enrollmentDates[1],
          },
        }),
        db.enrollment.create({
          data: {
            userId: user.id,
            courseId: courses[2].id,
            enrolledAt: enrollmentDates[2],
          },
        }),
      ]);

      // Verify initial enrollments
      const initialEnrollments = await db.enrollment.findMany({
        where: { userId: user.id },
        orderBy: { enrolledAt: "asc" },
      });
      expect(initialEnrollments).toHaveLength(3);
      expect(initialEnrollments[0].enrolledAt).toEqual(enrollmentDates[0]);
      expect(initialEnrollments[1].enrolledAt).toEqual(enrollmentDates[1]);
      expect(initialEnrollments[2].enrolledAt).toEqual(enrollmentDates[2]);

      // Cancel subscription
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "CANCELED",
        },
      });

      // Verify enrollments persist after cancellation
      const enrollmentsAfterCancel = await db.enrollment.findMany({
        where: { userId: user.id },
        orderBy: { enrolledAt: "asc" },
      });
      expect(enrollmentsAfterCancel).toHaveLength(3);
      expect(enrollmentsAfterCancel[0].id).toBe(enrollments[0].id);
      expect(enrollmentsAfterCancel[1].id).toBe(enrollments[1].id);
      expect(enrollmentsAfterCancel[2].id).toBe(enrollments[2].id);

      // Re-activate subscription
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Verify enrollments are preserved after re-activation
      const enrollmentsAfterReactivation = await db.enrollment.findMany({
        where: { userId: user.id },
        orderBy: { enrolledAt: "asc" },
      });
      expect(enrollmentsAfterReactivation).toHaveLength(3);
      expect(enrollmentsAfterReactivation[0].id).toBe(enrollments[0].id);
      expect(enrollmentsAfterReactivation[1].id).toBe(enrollments[1].id);
      expect(enrollmentsAfterReactivation[2].id).toBe(enrollments[2].id);
      expect(enrollmentsAfterReactivation[0].enrolledAt).toEqual(
        enrollmentDates[0]
      );
      expect(enrollmentsAfterReactivation[1].enrolledAt).toEqual(
        enrollmentDates[1]
      );
      expect(enrollmentsAfterReactivation[2].enrolledAt).toEqual(
        enrollmentDates[2]
      );
    });

    test("maintains enrollment sequence across multiple subscription cycles", async () => {
      // Create test user
      const user = await db.user.create({
        data: {
          email: `cycles-test-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}@example.com`,
          name: "Cycles Test User",
          emailVerified: true,
        },
      });

      // Create course
      const course = await db.course.create({
        data: {
          title: "Subscription Cycles Course",
          slug: `cycles-course-${Date.now()}`,
          description: "Course for testing subscription cycles",
          price: 199.99,
          level: "INTERMEDIATE",
          published: true,
          accessTier: "PREMIUM",
          category: "BACKEND",
        },
      });

      testEnv.trackUser(user.id);
      testEnv.trackCourse(course.id);

      // Create initial subscription
      const subscription = await db.subscription.create({
        data: {
          userId: user.id,
          status: "ACTIVE",
          plan: "PREMIUM",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          stripeSubscriptionId: `sub_cycles_${Date.now()}`,
          priceId: "price_premium",
        },
      });

      // Initial enrollment
      const initialEnrollmentDate = new Date();
      const enrollment = await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          enrolledAt: initialEnrollmentDate,
        },
      });

      // Cycle 1: Cancel
      await db.subscription.update({
        where: { id: subscription.id },
        data: { status: "CANCELED" },
      });

      // Verify enrollment persists
      let currentEnrollment = await db.enrollment.findUnique({
        where: { id: enrollment.id },
      });
      expect(currentEnrollment?.enrolledAt).toEqual(initialEnrollmentDate);

      // Cycle 1: Re-activate
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Verify enrollment still persists with original date
      currentEnrollment = await db.enrollment.findUnique({
        where: { id: enrollment.id },
      });
      expect(currentEnrollment?.enrolledAt).toEqual(initialEnrollmentDate);

      // Cycle 2: Cancel again
      await db.subscription.update({
        where: { id: subscription.id },
        data: { status: "CANCELED" },
      });

      // Cycle 2: Re-activate again
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Verify enrollment survives multiple cycles
      currentEnrollment = await db.enrollment.findUnique({
        where: { id: enrollment.id },
      });
      expect(currentEnrollment?.enrolledAt).toEqual(initialEnrollmentDate);
      expect(currentEnrollment?.id).toBe(enrollment.id);
    });
  });

  describe("Access Restoration", () => {
    test("restores access to premium content after re-subscription", async () => {
      // Create test user
      const user = await db.user.create({
        data: {
          email: `access-restoration-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}@example.com`,
          name: "Access Restoration User",
          emailVerified: true,
        },
      });

      // Create premium course
      const course = await db.course.create({
        data: {
          title: "Access Restoration Course",
          slug: `access-course-${Date.now()}`,
          description: "Course for testing access restoration",
          price: 249.99,
          level: "ADVANCED",
          published: true,
          accessTier: "PREMIUM",
          category: "FULLSTACK",
        },
      });

      const lesson = await db.lesson.create({
        data: {
          title: "Access Restoration Lesson",
          slug: `access-lesson-${Date.now()}`,
          content: "Premium lesson content",
          courseId: course.id,
          order: 1,
          published: true,
        },
      });

      testEnv.trackUser(user.id);
      testEnv.trackCourse(course.id);

      // Setup access service mocks
      mockAccessService.hasActivePremiumSubscription.mockImplementation(
        async (userId: string) => {
          const activeSubscription = await db.subscription.findFirst({
            where: {
              userId: userId,
              status: "ACTIVE",
            },
          });
          return !!activeSubscription;
        }
      );

      mockAccessService.checkLessonAccess.mockImplementation(
        async (userId: string, lessonId: string) => {
          const lesson = await db.lesson.findUnique({
            where: { id: lessonId },
            include: { course: true },
          });

          if (!lesson) return { hasAccess: false, reason: "LESSON_NOT_FOUND" };

          if (lesson.course.accessTier === "FREE") {
            return { hasAccess: true, reason: "FREE_CONTENT" };
          }

          const hasActiveSub =
            await mockAccessService.hasActivePremiumSubscription(userId);
          if (!hasActiveSub) {
            return { hasAccess: false, reason: "NO_PREMIUM_SUBSCRIPTION" };
          }

          const enrollment = await db.enrollment.findFirst({
            where: {
              userId: userId,
              courseId: lesson.courseId,
            },
          });

          if (!enrollment) {
            return { hasAccess: false, reason: "NOT_ENROLLED" };
          }

          return { hasAccess: true, reason: "VALID_PREMIUM_ACCESS" };
        }
      );

      // Step 1: Create active subscription and enrollment
      const subscription = await db.subscription.create({
        data: {
          userId: user.id,
          status: "ACTIVE",
          plan: "PREMIUM",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          stripeSubscriptionId: `sub_access_${Date.now()}`,
          priceId: "price_premium",
        },
      });

      await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          enrolledAt: new Date(),
        },
      });

      // Verify initial access
      const initialAccess = await mockAccessService.checkLessonAccess(
        user.id,
        lesson.id
      );
      expect(initialAccess.hasAccess).toBe(true);
      expect(initialAccess.reason).toBe("VALID_PREMIUM_ACCESS");

      // Step 2: Cancel subscription
      await db.subscription.update({
        where: { id: subscription.id },
        data: { status: "CANCELED" },
      });

      // Verify access is denied after cancellation
      const accessAfterCancel = await mockAccessService.checkLessonAccess(
        user.id,
        lesson.id
      );
      expect(accessAfterCancel.hasAccess).toBe(false);
      expect(accessAfterCancel.reason).toBe("NO_PREMIUM_SUBSCRIPTION");

      // Step 3: Re-activate subscription
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Step 4: Verify access is restored
      const accessAfterReactivation = await mockAccessService.checkLessonAccess(
        user.id,
        lesson.id
      );
      expect(accessAfterReactivation.hasAccess).toBe(true);
      expect(accessAfterReactivation.reason).toBe("VALID_PREMIUM_ACCESS");

      // Verify access service was called correctly
      expect(mockAccessService.checkLessonAccess).toHaveBeenCalledTimes(3);
      expect(mockAccessService.hasActivePremiumSubscription).toHaveBeenCalled();
    });
  });

  describe("Data Integrity", () => {
    test("ensures no data loss during subscription state transitions", async () => {
      // Create test user
      const user = await db.user.create({
        data: {
          email: `integrity-test-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}@example.com`,
          name: "Data Integrity User",
          emailVerified: true,
        },
      });

      // Create course with lessons
      const course = await db.course.create({
        data: {
          title: "Data Integrity Course",
          slug: `integrity-course-${Date.now()}`,
          description: "Course for testing data integrity",
          price: 199.99,
          level: "INTERMEDIATE",
          published: true,
          accessTier: "PREMIUM",
          category: "CLOUD",
        },
      });

      const lessons = await Promise.all([
        db.lesson.create({
          data: {
            title: "Integrity Lesson 1",
            slug: `integrity-1-${Date.now()}`,
            content: "First lesson",
            courseId: course.id,
            order: 1,
            published: true,
          },
        }),
        db.lesson.create({
          data: {
            title: "Integrity Lesson 2",
            slug: `integrity-2-${Date.now()}`,
            content: "Second lesson",
            courseId: course.id,
            order: 2,
            published: true,
          },
        }),
      ]);

      testEnv.trackUser(user.id);
      testEnv.trackCourse(course.id);

      // Create subscription and enrollment
      const subscription = await db.subscription.create({
        data: {
          userId: user.id,
          status: "ACTIVE",
          plan: "PREMIUM",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          stripeSubscriptionId: `sub_integrity_${Date.now()}`,
          priceId: "price_premium",
        },
      });

      const enrollment = await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          enrolledAt: new Date(),
        },
      });

      // Create comprehensive progress data
      const initialProgress = await Promise.all([
        db.progress.create({
          data: {
            userId: user.id,
            lessonId: lessons[0].id,
            completed: true,
            completedAt: new Date(),
          },
        }),
        db.progress.create({
          data: {
            userId: user.id,
            lessonId: lessons[1].id,
            completed: false,
          },
        }),
      ]);

      // Record initial state for comparison
      const initialData = {
        subscription: await db.subscription.findUnique({
          where: { id: subscription.id },
        }),
        enrollment: await db.enrollment.findUnique({
          where: { id: enrollment.id },
        }),
        progress: await db.progress.findMany({
          where: { userId: user.id },
          orderBy: { lessonId: "asc" },
        }),
      };

      // Perform multiple state transitions
      const stateTransitions = [
        "CANCELED",
        "ACTIVE",
        "PAST_DUE",
        "ACTIVE",
        "INCOMPLETE",
        "ACTIVE",
      ];

      for (const status of stateTransitions) {
        await db.subscription.update({
          where: { id: subscription.id },
          data: { status: status as any },
        });

        // Verify data integrity after each transition
        const currentData = {
          enrollment: await db.enrollment.findUnique({
            where: { id: enrollment.id },
          }),
          progress: await db.progress.findMany({
            where: { userId: user.id },
            orderBy: { lessonId: "asc" },
          }),
        };

        // Enrollment should remain unchanged
        expect(currentData.enrollment?.id).toBe(initialData.enrollment?.id);
        expect(currentData.enrollment?.enrolledAt).toEqual(
          initialData.enrollment?.enrolledAt
        );
        expect(currentData.enrollment?.courseId).toBe(
          initialData.enrollment?.courseId
        );

        // Progress should remain unchanged
        expect(currentData.progress).toHaveLength(2);
        expect(currentData.progress[0].id).toBe(initialProgress[0].id);
        expect(currentData.progress[1].id).toBe(initialProgress[1].id);
        expect(currentData.progress[0].completed).toBe(true);
        expect(currentData.progress[1].completed).toBe(false);
        expect(currentData.progress[0].completedAt).toEqual(
          initialProgress[0].completedAt
        );
      }

      // Final verification after all transitions
      const finalData = {
        subscription: await db.subscription.findUnique({
          where: { id: subscription.id },
        }),
        enrollment: await db.enrollment.findUnique({
          where: { id: enrollment.id },
        }),
        progress: await db.progress.findMany({
          where: { userId: user.id },
          orderBy: { lessonId: "asc" },
        }),
      };

      // Verify final subscription is active
      expect(finalData.subscription?.status).toBe("ACTIVE");

      // Verify all user data is preserved
      expect(finalData.enrollment?.id).toBe(initialData.enrollment?.id);
      expect(finalData.progress).toHaveLength(2);
      expect(finalData.progress[0].completed).toBe(true);
      expect(finalData.progress[1].completed).toBe(false);
    });
  });
});
