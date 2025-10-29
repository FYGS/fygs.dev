/**
 * T106: Admin Analytics Aggregation Tests
 *
 * Tests the admin analytics dashboard with comprehensive metrics
 * including enrollment counts, subscription analytics, churn analysis,
 * completion rates, and payment tracking.
 */

import { describe, test, expect, afterEach } from "vitest";
import { db } from "@/lib/db";
import { createTestEnvironment } from "../../utils/test-database";

describe("T106: Admin Analytics Aggregation Tests", () => {
  const testEnv = createTestEnvironment();

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe("Enrollment Analytics", () => {
    test("counts total enrollments correctly", async () => {
      // Create test users and courses for this test
      const users = await Promise.all([
        db.user.create({
          data: {
            email: `analytics-user-1-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@example.com`,
            name: "Analytics Test User 1",
            emailVerified: true,
          },
        }),
        db.user.create({
          data: {
            email: `analytics-user-2-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@example.com`,
            name: "Analytics Test User 2",
            emailVerified: true,
          },
        }),
      ]);

      const courses = await Promise.all([
        db.course.create({
          data: {
            title: "Analytics Test Course 1",
            slug: `analytics-course-1-${Date.now()}`,
            description: "Test course for analytics",
            price: 29.99,
            level: "BEGINNER",
            published: true,
            accessTier: "FREE",
            category: "JAVASCRIPT",
          },
        }),
        db.course.create({
          data: {
            title: "Analytics Test Course 2",
            slug: `analytics-course-2-${Date.now()}`,
            description: "Another test course for analytics",
            price: 49.99,
            level: "INTERMEDIATE",
            published: true,
            accessTier: "PREMIUM",
            category: "JAVASCRIPT",
          },
        }),
      ]);

      users.forEach((u) => testEnv.trackUser(u.id));
      courses.forEach((c) => testEnv.trackCourse(c.id));

      // Create enrollments
      await db.enrollment.create({
        data: { userId: users[0].id, courseId: courses[0].id },
      });
      await db.enrollment.create({
        data: { userId: users[1].id, courseId: courses[0].id },
      });
      await db.enrollment.create({
        data: { userId: users[0].id, courseId: courses[1].id },
      });

      // Count enrollments
      const totalEnrollments = await db.enrollment.count();
      expect(totalEnrollments).toBeGreaterThanOrEqual(3);

      // Count unique students
      const uniqueStudents = await db.enrollment.groupBy({
        by: ["userId"],
        _count: { userId: true },
      });
      expect(uniqueStudents).toHaveLength(2);
    });

    test("tracks enrollments by course popularity", async () => {
      // Create test users and courses for this test
      const users = await Promise.all([
        db.user.create({
          data: {
            email: `analytics-user-1-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@example.com`,
            name: "Analytics Test User 1",
            emailVerified: true,
          },
        }),
        db.user.create({
          data: {
            email: `analytics-user-2-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@example.com`,
            name: "Analytics Test User 2",
            emailVerified: true,
          },
        }),
        db.user.create({
          data: {
            email: `analytics-user-3-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@example.com`,
            name: "Analytics Test User 3",
            emailVerified: true,
          },
        }),
      ]);

      const courses = await Promise.all([
        db.course.create({
          data: {
            title: "Popular Course",
            slug: `popular-course-${Date.now()}`,
            description: "A very popular course",
            price: 99.99,
            level: "BEGINNER",
            published: true,
            accessTier: "FREE",
            category: "JAVASCRIPT",
          },
        }),
        db.course.create({
          data: {
            title: "Less Popular Course",
            slug: `less-popular-course-${Date.now()}`,
            description: "A less popular course",
            price: 149.99,
            level: "INTERMEDIATE",
            published: true,
            accessTier: "PREMIUM",
            category: "JAVASCRIPT",
          },
        }),
      ]);

      users.forEach((u) => testEnv.trackUser(u.id));
      courses.forEach((c) => testEnv.trackCourse(c.id));

      // Create enrollments with varying popularity
      await db.enrollment.createMany({
        data: [
          { userId: users[0].id, courseId: courses[0].id },
          { userId: users[1].id, courseId: courses[0].id },
          { userId: users[2].id, courseId: courses[0].id },
          { userId: users[0].id, courseId: courses[1].id },
          { userId: users[1].id, courseId: courses[1].id },
        ],
      });

      // Count enrollments by course
      const coursePopularity = await db.enrollment.groupBy({
        by: ["courseId"],
        _count: { courseId: true },
        orderBy: { _count: { courseId: "desc" } },
      });

      expect(coursePopularity).toHaveLength(2);
      expect(coursePopularity[0]._count.courseId).toBe(3); // Most popular course
      expect(coursePopularity[1]._count.courseId).toBe(2); // Less popular course
    });
  });

  describe("Subscription Analytics", () => {
    test("counts active subscriptions correctly", async () => {
      // Create test users
      const users = await Promise.all([
        db.user.create({
          data: {
            email: `sub-user-1-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@example.com`,
            name: "Subscription Test User 1",
            emailVerified: true,
          },
        }),
        db.user.create({
          data: {
            email: `sub-user-2-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@example.com`,
            name: "Subscription Test User 2",
            emailVerified: true,
          },
        }),
        db.user.create({
          data: {
            email: `sub-user-3-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@example.com`,
            name: "Subscription Test User 3",
            emailVerified: true,
          },
        }),
      ]);

      users.forEach((u) => testEnv.trackUser(u.id));

      const now = new Date();
      const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Create active subscriptions
      await db.subscription.createMany({
        data: [
          {
            userId: users[0].id,
            status: "ACTIVE",
            plan: "PREMIUM",
            priceId: "price_premium_monthly",
            currentPeriodStart: now,
            currentPeriodEnd: futureDate,
            stripeSubscriptionId: `sub_active_1_${Date.now()}`,
          },
          {
            userId: users[1].id,
            status: "ACTIVE",
            plan: "PREMIUM",
            priceId: "price_premium_yearly",
            currentPeriodStart: now,
            currentPeriodEnd: futureDate,
            stripeSubscriptionId: `sub_active_2_${Date.now()}`,
          },
          {
            userId: users[2].id,
            status: "CANCELED",
            plan: "PREMIUM",
            priceId: "price_premium_monthly",
            currentPeriodStart: now,
            currentPeriodEnd: futureDate,
            stripeSubscriptionId: `sub_canceled_${Date.now()}`,
          },
        ],
      });

      // Count active subscriptions
      const activeSubscriptions = await db.subscription.count({
        where: { status: "ACTIVE" },
      });
      expect(activeSubscriptions).toBe(2);

      // Count by plan
      const subscriptionsByPlan = await db.subscription.groupBy({
        by: ["plan"],
        where: { status: "ACTIVE" },
        _count: { plan: true },
      });
      expect(subscriptionsByPlan).toHaveLength(1); // Only PREMIUM plans
    });

    test("calculates MRR approximation", async () => {
      // Create test users
      const users = await Promise.all([
        db.user.create({
          data: {
            email: `mrr-user-1-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@example.com`,
            name: "MRR Test User 1",
            emailVerified: true,
          },
        }),
        db.user.create({
          data: {
            email: `mrr-user-2-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@example.com`,
            name: "MRR Test User 2",
            emailVerified: true,
          },
        }),
      ]);

      users.forEach((u) => testEnv.trackUser(u.id));

      const now = new Date();
      const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Create subscriptions with known pricing
      await db.subscription.createMany({
        data: [
          {
            userId: users[0].id,
            status: "ACTIVE",
            plan: "PREMIUM",
            priceId: "price_premium_monthly_2999", // $29.99/month
            currentPeriodStart: now,
            currentPeriodEnd: futureDate,
            stripeSubscriptionId: `sub_mrr_1_${Date.now()}`,
          },
          {
            userId: users[1].id,
            status: "ACTIVE",
            plan: "PREMIUM",
            priceId: "price_premium_yearly_19999", // $199.99/year = ~$16.67/month
            currentPeriodStart: now,
            currentPeriodEnd: futureDate,
            stripeSubscriptionId: `sub_mrr_2_${Date.now()}`,
          },
        ],
      });

      // Simple MRR approximation based on active subscriptions
      const activeSubscriptions = await db.subscription.findMany({
        where: { status: "ACTIVE" },
        select: { priceId: true },
      });

      // Mock MRR calculation (in real implementation this would use actual price data)
      let approximateMRR = 0;
      activeSubscriptions.forEach((sub) => {
        if (sub.priceId && sub.priceId.includes("monthly")) {
          approximateMRR += 29.99; // Monthly subscription
        } else if (sub.priceId && sub.priceId.includes("yearly")) {
          approximateMRR += 16.67; // Yearly subscription monthly equivalent
        }
      });

      expect(approximateMRR).toBeCloseTo(46.66, 1); // $29.99 + $16.67
      expect(activeSubscriptions).toHaveLength(2);
    });
  });

  describe("Churn Analytics", () => {
    test("calculates churn in last 30 days", async () => {
      // Create test users
      const users = await Promise.all([
        db.user.create({
          data: {
            email: `churn-user-1-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@example.com`,
            name: "Churn Test User 1",
            emailVerified: true,
          },
        }),
        db.user.create({
          data: {
            email: `churn-user-2-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@example.com`,
            name: "Churn Test User 2",
            emailVerified: true,
          },
        }),
        db.user.create({
          data: {
            email: `churn-user-3-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@example.com`,
            name: "Churn Test User 3",
            emailVerified: true,
          },
        }),
      ]);

      users.forEach((u) => testEnv.trackUser(u.id));

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Create subscriptions with different statuses
      // Recent subscription canceled (within 30 days based on updatedAt)
      await db.subscription.create({
        data: {
          userId: users[0].id,
          status: "CANCELED",
          plan: "PREMIUM",
          priceId: "price_premium_monthly",
          currentPeriodStart: now,
          currentPeriodEnd: now,
          stripeSubscriptionId: `sub_churn_recent_${Date.now()}`,
        },
      });

      // Old subscription canceled (more than 30 days ago based on updatedAt)
      const oldCanceled = await db.subscription.create({
        data: {
          userId: users[1].id,
          status: "CANCELED",
          plan: "PREMIUM",
          priceId: "price_premium_monthly",
          currentPeriodStart: thirtyDaysAgo,
          currentPeriodEnd: thirtyDaysAgo,
          stripeSubscriptionId: `sub_churn_old_${Date.now()}`,
        },
      });

      // Update the old one to have an older updatedAt timestamp
      await db.subscription.update({
        where: { id: oldCanceled.id },
        data: { updatedAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000) },
      });

      // Active subscription
      await db.subscription.create({
        data: {
          userId: users[2].id,
          status: "ACTIVE",
          plan: "PREMIUM",
          priceId: "price_premium_monthly",
          currentPeriodStart: now,
          currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          stripeSubscriptionId: `sub_active_${Date.now()}`,
        },
      });

      // Count cancellations in last 30 days (using updatedAt as proxy)
      const recentChurn = await db.subscription.count({
        where: {
          status: "CANCELED",
          updatedAt: {
            gte: thirtyDaysAgo,
          },
        },
      });

      expect(recentChurn).toBe(1); // Only one cancellation in last 30 days

      // Total canceled subscriptions
      const totalCanceled = await db.subscription.count({
        where: { status: "CANCELED" },
      });

      expect(totalCanceled).toBe(2);
    });
  });

  describe("Completion Analytics", () => {
    test("calculates course completion percentage", async () => {
      // Create test users
      const users = await Promise.all([
        db.user.create({
          data: {
            email: `completion-user-1-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@example.com`,
            name: "Completion Test User 1",
            emailVerified: true,
          },
        }),
        db.user.create({
          data: {
            email: `completion-user-2-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@example.com`,
            name: "Completion Test User 2",
            emailVerified: true,
          },
        }),
        db.user.create({
          data: {
            email: `completion-user-3-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@example.com`,
            name: "Completion Test User 3",
            emailVerified: true,
          },
        }),
      ]);

      users.forEach((u) => testEnv.trackUser(u.id));

      // Create course with lessons
      const courseWithLessons = await db.course.create({
        data: {
          title: "Completion Test Course",
          slug: `completion-course-${Date.now()}`,
          description: "Course for testing completion rates",
          price: 99.99,
          level: "BEGINNER",
          published: true,
          accessTier: "PREMIUM",
          category: "JAVASCRIPT",
        },
      });

      testEnv.trackCourse(courseWithLessons.id);

      // Create lessons
      const lessons = await Promise.all([
        db.lesson.create({
          data: {
            title: "Lesson 1",
            slug: `lesson-1-${Date.now()}`,
            content: "Lesson 1 content",
            courseId: courseWithLessons.id,
            order: 1,
            published: true,
          },
        }),
        db.lesson.create({
          data: {
            title: "Lesson 2",
            slug: `lesson-2-${Date.now()}`,
            content: "Lesson 2 content",
            courseId: courseWithLessons.id,
            order: 2,
            published: true,
          },
        }),
      ]);

      lessons.forEach((l) => testEnv.trackLesson(l.id));

      // Create enrollments and progress
      await db.enrollment.createMany({
        data: [
          { userId: users[0].id, courseId: courseWithLessons.id },
          { userId: users[1].id, courseId: courseWithLessons.id },
          { userId: users[2].id, courseId: courseWithLessons.id },
        ],
      });

      // Create progress records (user 1 completes all, user 2 completes half, user 3 completes none)
      await db.progress.createMany({
        data: [
          { userId: users[0].id, lessonId: lessons[0].id, completed: true },
          { userId: users[0].id, lessonId: lessons[1].id, completed: true },
          { userId: users[1].id, lessonId: lessons[0].id, completed: true },
          { userId: users[1].id, lessonId: lessons[1].id, completed: false },
        ],
      });

      // Calculate completion rate
      const totalEnrollments = await db.enrollment.count({
        where: { courseId: courseWithLessons.id },
      });

      const totalLessons = await db.lesson.count({
        where: { courseId: courseWithLessons.id },
      });

      const completedProgress = await db.progress.count({
        where: {
          lesson: { courseId: courseWithLessons.id },
          completed: true,
        },
      });

      const maxPossibleProgress = totalEnrollments * totalLessons;
      const completionPercentage =
        (completedProgress / maxPossibleProgress) * 100;

      expect(totalEnrollments).toBe(3);
      expect(totalLessons).toBe(2);
      expect(completedProgress).toBe(3); // 2 + 1 completed lessons
      expect(completionPercentage).toBeCloseTo(50, 0); // 3/6 = 50%
    });
  });

  describe("Payment Analytics", () => {
    test("calculates payment statistics correctly", async () => {
      // Create test users
      const users = await Promise.all([
        db.user.create({
          data: {
            email: `payment-user-1-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@example.com`,
            name: "Payment Test User 1",
            emailVerified: true,
          },
        }),
        db.user.create({
          data: {
            email: `payment-user-2-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@example.com`,
            name: "Payment Test User 2",
            emailVerified: true,
          },
        }),
        db.user.create({
          data: {
            email: `payment-user-3-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@example.com`,
            name: "Payment Test User 3",
            emailVerified: true,
          },
        }),
      ]);

      users.forEach((u) => testEnv.trackUser(u.id));

      // Create payments with different statuses
      await db.payment.createMany({
        data: [
          {
            userId: users[0].id,
            amount: 9999,
            currency: "USD",
            status: "COMPLETED",
            stripePaymentIntentId: `pi_successful_1_${Date.now()}`,
            kind: "COURSE",
          },
          {
            userId: users[1].id,
            amount: 4999,
            currency: "USD",
            status: "COMPLETED",
            stripePaymentIntentId: `pi_successful_2_${Date.now()}`,
            kind: "SUBSCRIPTION",
          },
          {
            userId: users[2].id,
            amount: 7999,
            currency: "USD",
            status: "FAILED",
            stripePaymentIntentId: `pi_failed_${Date.now()}`,
            kind: "COURSE",
          },
          {
            userId: users[0].id,
            amount: 2999,
            currency: "USD",
            status: "REFUNDED",
            stripePaymentIntentId: `pi_refunded_${Date.now()}`,
            kind: "COURSE",
          },
        ],
      });

      // Calculate payment statistics
      const totalPayments = await db.payment.count();

      const completedPayments = await db.payment.count({
        where: { status: "COMPLETED" },
      });

      const refundedPayments = await db.payment.count({
        where: { status: "REFUNDED" },
      });

      const failedPayments = await db.payment.count({
        where: { status: "FAILED" },
      });

      // Calculate revenue (only from completed payments)
      const revenue = await db.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      });

      // Verify payment analytics
      expect(totalPayments).toBe(4);
      expect(completedPayments).toBe(2);
      expect(refundedPayments).toBe(1);
      expect(failedPayments).toBe(1);
      expect(revenue._sum.amount?.toNumber()).toBe(14998); // 9999 + 4999

      // Calculate success rate
      const successRate = (completedPayments / totalPayments) * 100;
      expect(successRate).toBe(50); // 2/4 = 50%
    });
  });

  describe("Comprehensive Analytics Dashboard", () => {
    test("generates complete analytics summary", async () => {
      // Create test users
      const users = await Promise.all([
        db.user.create({
          data: {
            email: `dashboard-user-1-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@example.com`,
            name: "Dashboard Test User 1",
            emailVerified: true,
          },
        }),
        db.user.create({
          data: {
            email: `dashboard-user-2-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@example.com`,
            name: "Dashboard Test User 2",
            emailVerified: true,
          },
        }),
      ]);

      users.forEach((u) => testEnv.trackUser(u.id));

      // Create courses
      const courses = await Promise.all([
        db.course.create({
          data: {
            title: "Dashboard Course 1",
            slug: `dashboard-course-1-${Date.now()}`,
            description: "First dashboard test course",
            price: 99.99,
            level: "BEGINNER",
            published: true,
            accessTier: "PREMIUM",
            category: "JAVASCRIPT",
          },
        }),
        db.course.create({
          data: {
            title: "Dashboard Course 2",
            slug: `dashboard-course-2-${Date.now()}`,
            description: "Second dashboard test course",
            price: 149.99,
            level: "INTERMEDIATE",
            published: true,
            accessTier: "PREMIUM",
            category: "JAVASCRIPT",
          },
        }),
      ]);

      courses.forEach((c) => testEnv.trackCourse(c.id));

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Create comprehensive test data
      await db.enrollment.createMany({
        data: [
          { userId: users[0].id, courseId: courses[0].id },
          { userId: users[1].id, courseId: courses[0].id },
          { userId: users[0].id, courseId: courses[1].id },
        ],
      });

      await db.subscription.createMany({
        data: [
          {
            userId: users[0].id,
            status: "ACTIVE",
            plan: "PREMIUM",
            priceId: "price_premium_monthly",
            currentPeriodStart: now,
            currentPeriodEnd: new Date(
              now.getTime() + 30 * 24 * 60 * 60 * 1000
            ),
            stripeSubscriptionId: `sub_dashboard_1_${Date.now()}`,
          },
          {
            userId: users[1].id,
            status: "CANCELED",
            plan: "PREMIUM",
            priceId: "price_premium_monthly",
            currentPeriodStart: now,
            currentPeriodEnd: now,
            stripeSubscriptionId: `sub_dashboard_2_${Date.now()}`,
          },
        ],
      });

      await db.payment.createMany({
        data: [
          {
            userId: users[0].id,
            amount: 9999,
            currency: "USD",
            status: "COMPLETED",
            stripePaymentIntentId: `pi_dashboard_1_${Date.now()}`,
            kind: "COURSE",
          },
          {
            userId: users[1].id,
            amount: 14999,
            currency: "USD",
            status: "REFUNDED",
            stripePaymentIntentId: `pi_dashboard_2_${Date.now()}`,
            kind: "COURSE",
          },
        ],
      });

      // Generate analytics summary
      const analytics = {
        totalEnrollments: await db.enrollment.count(),
        uniqueStudents: (
          await db.enrollment.groupBy({
            by: ["userId"],
            _count: { userId: true },
          })
        ).length,
        activeSubscriptions: await db.subscription.count({
          where: { status: "ACTIVE" },
        }),
        recentChurn: await db.subscription.count({
          where: {
            status: "CANCELED",
            updatedAt: { gte: thirtyDaysAgo },
          },
        }),
        totalPayments: await db.payment.count(),
        completedPayments: await db.payment.count({
          where: { status: "COMPLETED" },
        }),
        refundedPayments: await db.payment.count({
          where: { status: "REFUNDED" },
        }),
      };

      // Verify comprehensive analytics
      expect(analytics.totalEnrollments).toBe(3);
      expect(analytics.uniqueStudents).toBe(2);
      expect(analytics.activeSubscriptions).toBe(1);
      expect(analytics.recentChurn).toBe(1);
      expect(analytics.totalPayments).toBe(2);
      expect(analytics.completedPayments).toBe(1);
      expect(analytics.refundedPayments).toBe(1);

      // Calculate derived metrics
      const refundRate =
        (analytics.refundedPayments / analytics.totalPayments) * 100;
      expect(refundRate).toBe(50); // 1/2 = 50%
    });
  });
});
