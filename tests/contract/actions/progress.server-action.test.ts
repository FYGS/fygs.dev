import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { db } from "@/lib/db";
import { updateLessonProgress } from "@/app/[locale]/(main)/dashboard/actions/updateLessonProgress";
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

describe("Update Lesson Progress Server Action Contract Tests", () => {
  let testUserId: string;
  let testCourseId: string;
  let testLessonId: string;
  let testEmail: string;
  let suffix: string;

  beforeEach(async () => {
    // unique per test: no collision with leftovers of another test or file
    suffix = Math.random().toString(36).slice(2, 10);
    testEmail = `progress-test-${suffix}@example.com`;
    // Create test user
    const user = await db.user.create({
      data: {
        email: testEmail,
        name: "Progress Test User",
        emailVerified: true,
      },
    });
    testUserId = user.id;

    // Create test course
    const course = await db.course.create({
      data: {
        title: "Progress Test Course",
        slug: `progress-test-course-${suffix}`,
        description: "Course for testing progress",
        category: "JAVASCRIPT",
        level: "BEGINNER",
        published: true,
        accessTier: "FREE",
      },
    });
    testCourseId = course.id;

    // Create test lesson
    const lesson = await db.lesson.create({
      data: {
        title: "Test Lesson",
        slug: "test-lesson",
        courseId: testCourseId,
        order: 1,
        published: true,
      },
    });
    testLessonId = lesson.id;

    // Enroll user in course
    await db.enrollment.create({
      data: {
        userId: testUserId,
        courseId: testCourseId,
      },
    });

    // Mock the auth user ID to match our test user
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: testUserId, email: testEmail },
    } as never);
  });

  afterEach(async () => {
    // Cleanup in reverse dependency order
    await db.progress.deleteMany({ where: { userId: testUserId } });
    await db.enrollment.deleteMany({ where: { userId: testUserId } });
    await db.lesson.deleteMany({ where: { courseId: testCourseId } });
    await db.course.delete({ where: { id: testCourseId } });
    await db.user.delete({ where: { id: testUserId } });
    vi.clearAllMocks();
  });

  describe("Input validation", () => {
    test("rejects invalid lesson ID format", async () => {
      // The action reports schema errors in its result instead of throwing
      const result = await updateLessonProgress({ lessonId: "invalid id" });

      expect(result).toMatchObject({
        success: false,
        error: "VALIDATION_ERROR",
      });
      expect(await db.progress.count({ where: { userId: testUserId } })).toBe(0);
    });

    test("accepts valid lesson ID with optional fields", async () => {
      const result = await updateLessonProgress({
        lessonId: testLessonId,
        watchTimeDelta: 30,
        completed: false,
      });

      expect(result.success).toBe(true);
      expect(result.progress!.watchTime).toBe(30);
    });

    test("rejects negative watch time delta", async () => {
      const result = await updateLessonProgress({
        lessonId: testLessonId,
        watchTimeDelta: -10,
      });

      expect(result).toMatchObject({
        success: false,
        error: "VALIDATION_ERROR",
      });
      expect(await db.progress.count({ where: { userId: testUserId } })).toBe(0);
    });

    test("rejects excessive watch time delta", async () => {
      // More than 2 hours (7200 seconds) in one call cannot be real playback
      const tooMuch = await updateLessonProgress({
        lessonId: testLessonId,
        watchTimeDelta: 8000,
      });
      expect(tooMuch).toMatchObject({
        success: false,
        error: "VALIDATION_ERROR",
      });
      expect(await db.progress.count({ where: { userId: testUserId } })).toBe(0);

      // the limit itself is accepted
      const atLimit = await updateLessonProgress({
        lessonId: testLessonId,
        watchTimeDelta: 7200,
      });
      expect(atLimit.success).toBe(true);
    });
  });

  describe("Lesson existence and access validation", () => {
    test("rejects non-existent lesson", async () => {
      const result = await updateLessonProgress({
        lessonId: "cm0000000000000000000000", // Valid CUID but non-existent
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("LESSON_NOT_FOUND");
    });

    test("rejects lesson from course user is not enrolled in", async () => {
      // Create another course and lesson
      const otherCourse = await db.course.create({
        data: {
          title: "Other Course",
          slug: `other-course-${suffix}`,
          description: "Course user is not enrolled in",
          category: "TYPESCRIPT",
          level: "INTERMEDIATE",
          published: true,
          accessTier: "FREE",
        },
      });

      const otherLesson = await db.lesson.create({
        data: {
          title: "Other Lesson",
          slug: "other-lesson",
          courseId: otherCourse.id,
          order: 1,
          published: true,
        },
      });

      const result = await updateLessonProgress({
        lessonId: otherLesson.id,
        watchTimeDelta: 30,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("ACCESS_DENIED");
      expect(
        await db.progress.count({ where: { lessonId: otherLesson.id } })
      ).toBe(0);

      // Cleanup
      await db.lesson.delete({ where: { id: otherLesson.id } });
      await db.course.delete({ where: { id: otherCourse.id } });
    });
  });

  describe("Upsert semantics", () => {
    test("creates new progress record for first update", async () => {
      const result = await updateLessonProgress({
        lessonId: testLessonId,
        watchTimeDelta: 120,
        completed: false,
      });

      expect(result.success).toBe(true);
      expect(result.progress).toBeDefined();
      expect(result.progress!.watchTime).toBe(120);
      expect(result.progress!.completed).toBe(false);
      expect(result.progress!.completedAt).toBeNull();

      // Verify record exists in database
      const dbProgress = await db.progress.findUnique({
        where: {
          userId_lessonId: {
            userId: testUserId,
            lessonId: testLessonId,
          },
        },
      });

      expect(dbProgress).toBeDefined();
      expect(dbProgress!.watchTime).toBe(120);
    });

    test("updates existing progress record", async () => {
      // Create initial progress
      await db.progress.create({
        data: {
          userId: testUserId,
          lessonId: testLessonId,
          completed: false,
          watchTime: 100,
        },
      });

      const result = await updateLessonProgress({
        lessonId: testLessonId,
        watchTimeDelta: 50,
        completed: true,
      });

      expect(result.success).toBe(true);
      expect(result.progress!.watchTime).toBe(150); // 100 + 50
      expect(result.progress!.completed).toBe(true);
      expect(result.progress!.completedAt).toBeInstanceOf(Date);
    });

    test("accumulates watch time correctly across multiple updates", async () => {
      // First update
      const result1 = await updateLessonProgress({
        lessonId: testLessonId,
        watchTimeDelta: 60,
      });
      expect(result1.success).toBe(true);
      expect(result1.progress!.watchTime).toBe(60);

      // Second update
      const result2 = await updateLessonProgress({
        lessonId: testLessonId,
        watchTimeDelta: 90,
      });
      expect(result2.success).toBe(true);
      expect(result2.progress!.watchTime).toBe(150); // 60 + 90

      // Third update
      const result3 = await updateLessonProgress({
        lessonId: testLessonId,
        watchTimeDelta: 30,
      });
      expect(result3.success).toBe(true);
      expect(result3.progress!.watchTime).toBe(180); // 150 + 30
    });
  });

  describe("Completion state management", () => {
    test("sets completion timestamp when marking as completed", async () => {
      const result = await updateLessonProgress({
        lessonId: testLessonId,
        watchTimeDelta: 300,
        completed: true,
      });

      expect(result.success).toBe(true);
      expect(result.progress!.completed).toBe(true);
      expect(result.progress!.completedAt).toBeInstanceOf(Date);
      expect(result.progress!.completedAt!.getTime()).toBeCloseTo(
        Date.now(),
        -3
      ); // Within 1 second
    });

    test("preserves original completion timestamp on re-completion", async () => {
      const originalCompletedAt = new Date("2024-01-01T12:00:00.000Z");

      // Create already completed progress
      await db.progress.create({
        data: {
          userId: testUserId,
          lessonId: testLessonId,
          completed: true,
          watchTime: 200,
          completedAt: originalCompletedAt,
        },
      });

      const result = await updateLessonProgress({
        lessonId: testLessonId,
        watchTimeDelta: 50,
        completed: true, // Re-marking as completed
      });

      expect(result.success).toBe(true);
      expect(result.progress!.completed).toBe(true);
      expect(result.progress!.watchTime).toBe(250); // Updated
      expect(result.progress!.completedAt).toEqual(originalCompletedAt); // Preserved
    });

    test("clears completion timestamp when marking as incomplete", async () => {
      // Create completed progress
      await db.progress.create({
        data: {
          userId: testUserId,
          lessonId: testLessonId,
          completed: true,
          watchTime: 300,
          completedAt: new Date(),
        },
      });

      const result = await updateLessonProgress({
        lessonId: testLessonId,
        completed: false,
      });

      expect(result.success).toBe(true);
      expect(result.progress!.completed).toBe(false);
      expect(result.progress!.completedAt).toBeNull();

      // the stored row agrees with the response, and the watch time is kept
      const stored = await db.progress.findUniqueOrThrow({
        where: {
          userId_lessonId: { userId: testUserId, lessonId: testLessonId },
        },
      });
      expect(stored.completed).toBe(false);
      expect(stored.completedAt).toBeNull();
      expect(stored.watchTime).toBe(300);
    });

    test("completing again after un-completing records a new completion date", async () => {
      const first = new Date("2024-01-01T12:00:00.000Z");
      await db.progress.create({
        data: {
          userId: testUserId,
          lessonId: testLessonId,
          completed: true,
          watchTime: 300,
          completedAt: first,
        },
      });

      await updateLessonProgress({ lessonId: testLessonId, completed: false });
      const result = await updateLessonProgress({
        lessonId: testLessonId,
        completed: true,
      });

      expect(result.progress!.completed).toBe(true);
      expect(result.progress!.completedAt!.getTime()).toBeGreaterThan(
        first.getTime()
      );
    });
  });

  describe("Idempotency behavior", () => {
    test("handles concurrent progress updates safely", async () => {
      // Simulate concurrent updates
      const promises = Array.from({ length: 3 }, () =>
        updateLessonProgress({
          lessonId: testLessonId,
          watchTimeDelta: 30,
        })
      );

      const results = await Promise.all(promises);

      // All should succeed
      results.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.progress).toBeDefined();
      });

      // Final watch time should be sum of all deltas (3 * 30 = 90)
      const finalProgress = await db.progress.findUnique({
        where: {
          userId_lessonId: {
            userId: testUserId,
            lessonId: testLessonId,
          },
        },
      });

      // (increments are applied by the database: none may be lost)
      expect(finalProgress!.watchTime).toBe(90);

      // Should only have one progress record
      const progressCount = await db.progress.count({
        where: {
          userId: testUserId,
          lessonId: testLessonId,
        },
      });
      expect(progressCount).toBe(1);
    });
  });

  describe("Error handling edge cases", () => {
    test("handles user session validation errors", async () => {
      // Mock session to return null
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await updateLessonProgress({
        lessonId: testLessonId,
        watchTimeDelta: 30,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("UNAUTHORIZED");
    });
  });

  describe("Response format validation", () => {
    test("success response has correct structure", async () => {
      const result = await updateLessonProgress({
        lessonId: testLessonId,
        watchTimeDelta: 120,
        completed: true,
      });

      expect(result).toMatchObject({
        success: true,
        message: expect.any(String),
        progress: {
          id: expect.any(String),
          completed: true,
          watchTime: expect.any(Number),
          completedAt: expect.any(Date),
        },
      });
    });

    test("error response has correct structure", async () => {
      const result = await updateLessonProgress({
        lessonId: "cm0000000000000000000000", // Non-existent lesson
      });

      expect(result).toMatchObject({
        success: false,
        message: expect.any(String),
        error: expect.any(String),
      });
    });
  });
});
