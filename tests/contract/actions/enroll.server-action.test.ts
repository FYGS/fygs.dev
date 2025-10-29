import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { db } from "@/lib/db";
import { enrollCourse } from "@/app/(main)/dashboard/actions/enrollCourse";
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

describe("Enroll Course Server Action Contract Tests", () => {
  let testUserId: string;
  let testCourseId: string;
  let premiumCourseId: string;

  beforeEach(async () => {
    // Create test user
    const user = await db.user.create({
      data: {
        email: "enroll-test@example.com",
        name: "Enroll Test User",
        emailVerified: true,
      },
    });
    testUserId = user.id;

    // Create free course
    const freeCourse = await db.course.create({
      data: {
        title: "Free Test Course",
        slug: "free-test-course",
        description: "Course for testing enrollment",
        category: "JAVASCRIPT",
        level: "BEGINNER",
        published: true,
        accessTier: "FREE",
      },
    });
    testCourseId = freeCourse.id;

    // Create premium course
    const premiumCourse = await db.course.create({
      data: {
        title: "Premium Test Course",
        slug: "premium-test-course",
        description: "Premium course for testing enrollment",
        category: "TYPESCRIPT",
        level: "INTERMEDIATE",
        published: true,
        accessTier: "PREMIUM",
      },
    });
    premiumCourseId = premiumCourse.id;

    // Mock the auth user ID to match our test user
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: testUserId, email: "enroll-test@example.com" },
    });
  });

  afterEach(async () => {
    // Cleanup in reverse dependency order
    await db.enrollment.deleteMany({ where: { userId: testUserId } });
    await db.course.deleteMany({
      where: { id: { in: [testCourseId, premiumCourseId] } },
    });
    await db.user.delete({ where: { id: testUserId } });
    vi.clearAllMocks();
  });

  describe("Input validation", () => {
    test("rejects invalid course ID format", async () => {
      try {
        await enrollCourse({ courseId: "invalid-id" });
        expect.fail("Should have thrown validation error");
      } catch (error) {
        // Zod validation should throw for invalid CUID
        expect(error).toBeDefined();
      }
    });

    test("accepts valid course ID", async () => {
      const result = await enrollCourse({ courseId: testCourseId });

      // Should either succeed or fail for business reasons, not validation
      expect(result).toBeDefined();
      expect(typeof result.success).toBe("boolean");
    });
  });

  describe("Course existence validation", () => {
    test("rejects non-existent course", async () => {
      const result = await enrollCourse({
        courseId: "cm0000000000000000000000",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("Access control validation", () => {
    test("allows enrollment in free course", async () => {
      const result = await enrollCourse({ courseId: testCourseId });

      expect(result.success).toBe(true);
      expect(result.enrollment).toBeDefined();
      expect(result.enrollment!.id).toBeDefined();
      expect(result.enrollment!.enrolledAt).toBeInstanceOf(Date);
    });

    test("rejects premium course without subscription", async () => {
      const result = await enrollCourse({ courseId: premiumCourseId });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test("allows premium course with active subscription", async () => {
      // Create active subscription
      await db.subscription.create({
        data: {
          userId: testUserId,
          status: "ACTIVE",
          priceId: "price_premium_monthly",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          stripeSubscriptionId: "sub_test_123",
        },
      });

      const result = await enrollCourse({ courseId: premiumCourseId });

      expect(result.success).toBe(true);
      expect(result.enrollment).toBeDefined();
    });
  });

  describe("Idempotency behavior", () => {
    test("returns existing enrollment without error on duplicate call", async () => {
      // First enrollment
      const result1 = await enrollCourse({ courseId: testCourseId });
      expect(result1.success).toBe(true);

      const firstEnrollmentId = result1.enrollment!.id;

      // Second enrollment (idempotent)
      const result2 = await enrollCourse({ courseId: testCourseId });
      expect(result2.success).toBe(true);
      expect(result2.enrollment!.id).toBe(firstEnrollmentId);
      expect(result2.alreadyEnrolled).toBe(true);

      // Verify only one enrollment exists in database
      const enrollmentCount = await db.enrollment.count({
        where: {
          userId: testUserId,
          courseId: testCourseId,
        },
      });
      expect(enrollmentCount).toBe(1);
    });

    test("handles concurrent enrollment attempts", async () => {
      // Simulate concurrent enrollment attempts
      const promises = Array.from({ length: 3 }, () =>
        enrollCourse({ courseId: testCourseId })
      );
      const results = await Promise.all(promises);

      // All should succeed
      results.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.enrollment).toBeDefined();
      });

      // Should have same enrollment ID
      const enrollmentIds = results.map((r) => r.enrollment!.id);
      const uniqueIds = new Set(enrollmentIds);
      expect(uniqueIds.size).toBe(1);

      // Verify only one enrollment in database
      const enrollmentCount = await db.enrollment.count({
        where: {
          userId: testUserId,
          courseId: testCourseId,
        },
      });
      expect(enrollmentCount).toBe(1);
    });
  });

  describe("Error handling edge cases", () => {
    test("handles user session validation errors", async () => {
      // Mock session to return null
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await enrollCourse({ courseId: testCourseId });

      expect(result.success).toBe(false);
      expect(result.error).toBe("UNAUTHORIZED");
    });
  });

  describe("Response format validation", () => {
    test("success response has correct structure", async () => {
      const result = await enrollCourse({ courseId: testCourseId });

      expect(result).toMatchObject({
        success: true,
        message: expect.any(String),
        enrollment: {
          id: expect.stringMatching(/^cm[a-z0-9]+$/),
          enrolledAt: expect.any(Date),
        },
      });
    });

    test("error response has correct structure", async () => {
      const result = await enrollCourse({ courseId: premiumCourseId });

      expect(result).toMatchObject({
        success: false,
        message: expect.any(String),
        error: expect.any(String),
      });
    });
  });
});
