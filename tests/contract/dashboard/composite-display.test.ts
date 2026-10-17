import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { db } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/client";

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

// Mock better auth
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

describe("Dashboard Composite Display Contract Tests (FR-014)", () => {
  let testUserId: string;
  let testSubscriptionId: string;
  let testCourseId: string;

  beforeEach(async () => {
    // Create test user with unique email
    const user = await db.user.create({
      data: {
        email: `dashboard-test-${Date.now()}@example.com`,
        name: "Dashboard Test User",
      },
    });
    testUserId = user.id;

    // Create test course
    const course = await db.course.create({
      data: {
        title: "Dashboard Test Course",
        slug: `dashboard-test-course-${Date.now()}`,
        description: "Test course for dashboard display",
        price: new Decimal("29.99"),
        category: "JAVASCRIPT",
        level: "BEGINNER",
        accessTier: "PREMIUM",
        published: true,
      },
    });
    testCourseId = course.id;

    // Create test subscription
    const subscription = await db.subscription.create({
      data: {
        userId: testUserId,
        status: "ACTIVE",
        plan: "PREMIUM",
        stripeSubscriptionId: `sub_test_${Date.now()}`,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });
    testSubscriptionId = subscription.id;

    // Create enrollment
    await db.enrollment.create({
      data: {
        userId: testUserId,
        courseId: testCourseId,
      },
    });

    // Create certificate
    const certificate = await db.certificate.create({
      data: {
        userId: testUserId,
        courseId: testCourseId,
        issuedAt: new Date(),
      },
    });
    testCertificateId = certificate.id;
  });

  afterEach(async () => {
    // Cleanup in reverse dependency order
    await db.certificate.deleteMany({ where: { userId: testUserId } });
    await db.enrollment.deleteMany({ where: { userId: testUserId } });
    await db.subscription.deleteMany({ where: { userId: testUserId } });
    await db.course.deleteMany({ where: { id: testCourseId } });
    await db.user.deleteMany({ where: { id: testUserId } });
  });

  describe("Subscription plan status display", () => {
    test("displays active subscription with correct plan and cycle", async () => {
      // Get subscription for dashboard display
      const subscription = await db.subscription.findFirst({
        where: { userId: testUserId, status: "ACTIVE" },
      });

      expect(subscription).toBeTruthy();
      expect(subscription!.status).toBe("ACTIVE");
      expect(subscription!.plan).toBe("PREMIUM");
      expect(subscription!.currentPeriodEnd).toBeInstanceOf(Date);
      expect(subscription!.currentPeriodEnd!.getTime()).toBeGreaterThan(
        Date.now()
      );
    });

    test("calculates correct renewal date for active subscription", async () => {
      const subscription = await db.subscription.findFirst({
        where: { userId: testUserId, status: "ACTIVE" },
      });

      const renewalDate = subscription!.currentPeriodEnd!;
      const now = new Date();
      const thirtyDaysFromNow = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000
      );

      // Should renew within 1 day of 30 days from creation
      expect(
        Math.abs(renewalDate.getTime() - thirtyDaysFromNow.getTime())
      ).toBeLessThan(24 * 60 * 60 * 1000);
    });

    test("displays cancellation-scheduled subscription correctly", async () => {
      // Update subscription to cancel_at_period_end
      await db.subscription.update({
        where: { id: testSubscriptionId },
        data: { cancelAtPeriodEnd: true },
      });

      const subscription = await db.subscription.findFirst({
        where: { userId: testUserId },
      });

      expect(subscription!.status).toBe("ACTIVE");
      expect(subscription!.cancelAtPeriodEnd).toBe(true);
      expect(subscription!.currentPeriodEnd).toBeInstanceOf(Date);
    });
  });

  describe("Enrolled courses with progress percentage", () => {
    test("calculates course progress percentage correctly", async () => {
      // Create lessons for the course
      const lessons = await Promise.all([
        db.lesson.create({
          data: {
            courseId: testCourseId,
            title: "Lesson 1",
            slug: "lesson-1",
            content: "Content 1",
            published: true,
            order: 1,
          },
        }),
        db.lesson.create({
          data: {
            courseId: testCourseId,
            title: "Lesson 2",
            slug: "lesson-2",
            content: "Content 2",
            published: true,
            order: 2,
          },
        }),
        db.lesson.create({
          data: {
            courseId: testCourseId,
            title: "Lesson 3",
            slug: "lesson-3",
            content: "Content 3",
            published: true,
            order: 3,
          },
        }),
      ]);

      // Mark first lesson as completed
      await db.progress.create({
        data: {
          userId: testUserId,
          lessonId: lessons[0].id,
          completed: true,
          completedAt: new Date(),
          watchTime: 600,
        },
      });

      // Calculate progress percentage
      const enrolledCourses = await db.enrollment.findMany({
        where: { userId: testUserId },
        include: {
          course: {
            include: {
              lessons: {
                where: { published: true },
                include: {
                  progress: {
                    where: { userId: testUserId },
                  },
                },
              },
            },
          },
        },
      });

      const course = enrolledCourses[0].course;
      const totalLessons = course.lessons.length;
      const completedLessons = course.lessons.filter((lesson) =>
        lesson.progress.some((p) => p.completed)
      ).length;
      const progressPercentage = Math.round(
        (completedLessons / totalLessons) * 100
      );

      expect(totalLessons).toBe(3);
      expect(completedLessons).toBe(1);
      expect(progressPercentage).toBe(33); // 1/3 = 33%
    });

    test("excludes unpublished lessons from progress calculation", async () => {
      // Create published and unpublished lessons
      const publishedLesson = await db.lesson.create({
        data: {
          courseId: testCourseId,
          title: "Published Lesson",
          slug: "published-lesson",
          content: "Published content",
          published: true,
          order: 1,
        },
      });

      const unpublishedLesson = await db.lesson.create({
        data: {
          courseId: testCourseId,
          title: "Unpublished Lesson",
          slug: "unpublished-lesson",
          content: "Unpublished content",
          published: false,
          order: 2,
        },
      });

      // Mark both lessons as completed
      await Promise.all([
        db.progress.create({
          data: {
            userId: testUserId,
            lessonId: publishedLesson.id,
            completed: true,
            completedAt: new Date(),
            watchTime: 600,
          },
        }),
        db.progress.create({
          data: {
            userId: testUserId,
            lessonId: unpublishedLesson.id,
            completed: true,
            completedAt: new Date(),
            watchTime: 600,
          },
        }),
      ]);

      // Query only published lessons for progress calculation
      const course = await db.course.findFirst({
        where: { id: testCourseId },
        include: {
          lessons: {
            where: { published: true },
            include: {
              progress: {
                where: { userId: testUserId, completed: true },
              },
            },
          },
        },
      });

      const publishedLessons = course!.lessons;
      const completedPublishedLessons = publishedLessons.filter(
        (lesson) => lesson.progress.length > 0
      );

      expect(publishedLessons.length).toBe(1); // Only published lesson counted
      expect(completedPublishedLessons.length).toBe(1);
      // Progress should be 100% based on published lessons only
      expect(
        Math.round(
          (completedPublishedLessons.length / publishedLessons.length) * 100
        )
      ).toBe(100);
    });
  });

  describe("Recent completions display", () => {
    test("shows recent lesson completions in chronological order", async () => {
      // Create lessons
      const lessons = await Promise.all([
        db.lesson.create({
          data: {
            courseId: testCourseId,
            title: "First Lesson",
            slug: "first-lesson",
            content: "First content",
            published: true,
            order: 1,
          },
        }),
        db.lesson.create({
          data: {
            courseId: testCourseId,
            title: "Second Lesson",
            slug: "second-lesson",
            content: "Second content",
            published: true,
            order: 2,
          },
        }),
      ]);

      // Complete lessons with different timestamps
      const firstCompletionTime = new Date(
        Date.now() - 2 * 24 * 60 * 60 * 1000
      ); // 2 days ago
      const secondCompletionTime = new Date(
        Date.now() - 1 * 24 * 60 * 60 * 1000
      ); // 1 day ago

      await Promise.all([
        db.progress.create({
          data: {
            userId: testUserId,
            lessonId: lessons[0].id,
            completed: true,
            completedAt: firstCompletionTime,
            watchTime: 600,
          },
        }),
        db.progress.create({
          data: {
            userId: testUserId,
            lessonId: lessons[1].id,
            completed: true,
            completedAt: secondCompletionTime,
            watchTime: 700,
          },
        }),
      ]);

      // Query recent completions (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentCompletions = await db.progress.findMany({
        where: {
          userId: testUserId,
          completed: true,
          completedAt: {
            gte: sevenDaysAgo,
          },
        },
        include: {
          lesson: {
            include: {
              course: true,
            },
          },
        },
        orderBy: {
          completedAt: "desc",
        },
      });

      expect(recentCompletions).toHaveLength(2);
      // Most recent completion should be first
      expect(recentCompletions[0].lesson.title).toBe("Second Lesson");
      expect(recentCompletions[1].lesson.title).toBe("First Lesson");
      expect(recentCompletions[0].completedAt!.getTime()).toBeGreaterThan(
        recentCompletions[1].completedAt!.getTime()
      );
    });

    test("limits recent completions to specified timeframe", async () => {
      const lesson = await db.lesson.create({
        data: {
          courseId: testCourseId,
          title: "Old Lesson",
          slug: "old-lesson",
          content: "Old content",
          published: true,
          order: 1,
        },
      });

      // Complete lesson 10 days ago (outside 7-day window)
      const oldCompletionTime = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      await db.progress.create({
        data: {
          userId: testUserId,
          lessonId: lesson.id,
          completed: true,
          completedAt: oldCompletionTime,
          watchTime: 600,
        },
      });

      // Query recent completions (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentCompletions = await db.progress.findMany({
        where: {
          userId: testUserId,
          completed: true,
          completedAt: {
            gte: sevenDaysAgo,
          },
        },
      });

      expect(recentCompletions).toHaveLength(0); // No completions in last 7 days
    });
  });

  describe("Certificates presence verification", () => {
    test("displays earned certificates with course information", async () => {
      const certificates = await db.certificate.findMany({
        where: { userId: testUserId },
        include: {
          course: true,
        },
        orderBy: {
          issuedAt: "desc",
        },
      });

      expect(certificates).toHaveLength(1);
      expect(certificates[0].course.title).toBe("Dashboard Test Course");
      expect(certificates[0].issuedAt).toBeInstanceOf(Date);
      expect(certificates[0].course).toBeTruthy();
    });

    test("shows no certificates for user without completions", async () => {
      // Create new user without certificates
      const newUser = await db.user.create({
        data: {
          email: `no-certs-${Date.now()}@example.com`,
          name: "No Certificates User",
        },
      });

      const certificates = await db.certificate.findMany({
        where: { userId: newUser.id },
      });

      expect(certificates).toHaveLength(0);

      // Cleanup
      await db.user.delete({ where: { id: newUser.id } });
    });
  });

  describe("Dashboard composite data integrity", () => {
    test("ensures all dashboard components load consistently", async () => {
      // Simulate dashboard data loading
      const dashboardData = await Promise.all([
        // Subscription data
        db.subscription.findFirst({
          where: { userId: testUserId, status: "ACTIVE" },
        }),
        // Enrolled courses with progress
        db.enrollment.findMany({
          where: { userId: testUserId },
          include: {
            course: {
              include: {
                lessons: {
                  where: { published: true },
                  include: {
                    progress: {
                      where: { userId: testUserId },
                    },
                  },
                },
              },
            },
          },
        }),
        // Recent completions
        db.progress.findMany({
          where: {
            userId: testUserId,
            completed: true,
            completedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
          include: {
            lesson: {
              include: {
                course: true,
              },
            },
          },
          orderBy: {
            completedAt: "desc",
          },
          take: 5,
        }),
        // Certificates
        db.certificate.findMany({
          where: { userId: testUserId },
          include: {
            course: true,
          },
          orderBy: {
            issuedAt: "desc",
          },
        }),
      ]);

      const [subscription, enrollments, , certificates] = dashboardData;

      // Verify all data is consistent
      expect(subscription).toBeTruthy();
      expect(enrollments).toHaveLength(1);
      expect(certificates).toHaveLength(1);
      // All references should point to the same course
      expect(enrollments[0].courseId).toBe(testCourseId);
      expect(certificates[0].courseId).toBe(testCourseId);
    });
  });
});
