import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { db } from "@/lib/db";
import { issueCertificate } from "@/app/[locale]/(main)/dashboard/actions/issueCertificate";
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

describe("Issue Certificate Server Action Contract Tests", () => {
  let testUserId: string;
  let testCourseId: string;
  let testLessonIds: string[];
  let testEmail: string;
  let suffix: string;

  beforeEach(async () => {
    // unique per test: no collision with leftovers of another test or file
    suffix = Math.random().toString(36).slice(2, 10);
    testEmail = `certificate-test-${suffix}@example.com`;
    // Create test user
    const user = await db.user.create({
      data: {
        email: testEmail,
        name: "Certificate Test User",
        emailVerified: true,
      },
    });
    testUserId = user.id;

    // Create test course
    const course = await db.course.create({
      data: {
        title: "Certificate Test Course",
        slug: `certificate-test-course-${suffix}`,
        description: "Course for testing certificate issuance",
        category: "JAVASCRIPT",
        level: "BEGINNER",
        published: true,
        accessTier: "FREE",
      },
    });
    testCourseId = course.id;

    // Create test lessons
    const lessons = await Promise.all([
      db.lesson.create({
        data: {
          title: "Lesson 1",
          slug: "lesson-1",
          courseId: testCourseId,
          order: 1,
          published: true,
        },
      }),
      db.lesson.create({
        data: {
          title: "Lesson 2",
          slug: "lesson-2",
          courseId: testCourseId,
          order: 2,
          published: true,
        },
      }),
      db.lesson.create({
        data: {
          title: "Lesson 3",
          slug: "lesson-3",
          courseId: testCourseId,
          order: 3,
          published: true,
        },
      }),
    ]);
    testLessonIds = lessons.map((lesson) => lesson.id);

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
    });
  });

  afterEach(async () => {
    // Cleanup in reverse dependency order
    await db.certificate.deleteMany({ where: { userId: testUserId } });
    await db.progress.deleteMany({ where: { userId: testUserId } });
    await db.enrollment.deleteMany({ where: { userId: testUserId } });
    await db.lesson.deleteMany({ where: { courseId: testCourseId } });
    await db.course.delete({ where: { id: testCourseId } });
    await db.user.delete({ where: { id: testUserId } });
    vi.clearAllMocks();
  });

  describe("Input validation", () => {
    test("rejects invalid course ID format", async () => {
      // The action reports schema errors in its result instead of throwing
      const result = await issueCertificate({ courseId: "invalid id" });

      expect(result).toMatchObject({
        success: false,
        error: "VALIDATION_ERROR",
      });
      expect(await db.certificate.count({ where: { userId: testUserId } })).toBe(0);
    });

    test("accepts valid course ID", async () => {
      const result = await issueCertificate({ courseId: testCourseId });

      // Should either succeed or fail for business reasons, not validation
      expect(result).toBeDefined();
      expect(typeof result.success).toBe("boolean");
    });
  });

  describe("Course existence and enrollment validation", () => {
    test("rejects non-existent course", async () => {
      const result = await issueCertificate({
        courseId: "cm0000000000000000000000", // Valid CUID but non-existent
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test("rejects course user is not enrolled in", async () => {
      // Create another course
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

      const result = await issueCertificate({ courseId: otherCourse.id });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.message).toContain("enrolled");

      // Cleanup
      await db.course.delete({ where: { id: otherCourse.id } });
    });
  });

  describe("Completion percentage validation", () => {
    test("rejects certificate issuance for incomplete course", async () => {
      // Complete only 2 out of 3 lessons (66.67% completion)
      await Promise.all([
        db.progress.create({
          data: {
            userId: testUserId,
            lessonId: testLessonIds[0],
            completed: true,
            watchTime: 300,
          },
        }),
        db.progress.create({
          data: {
            userId: testUserId,
            lessonId: testLessonIds[1],
            completed: true,
            watchTime: 450,
          },
        }),
        db.progress.create({
          data: {
            userId: testUserId,
            lessonId: testLessonIds[2],
            completed: false, // Not completed
            watchTime: 150,
          },
        }),
      ]);

      const result = await issueCertificate({ courseId: testCourseId });

      expect(result.success).toBe(false);
      expect(result.error).toBe("NOT_ELIGIBLE");
      expect(result.eligibility).toMatchObject({ eligible: false });
      expect(result.eligibility!.completionPercentage).toBeLessThan(100);
      expect(await db.certificate.count({ where: { userId: testUserId } })).toBe(0);
    });

    test("issues certificate for 100% completed course", async () => {
      // Complete all 3 lessons (100% completion)
      await Promise.all(
        testLessonIds.map((lessonId) =>
          db.progress.create({
            data: {
              userId: testUserId,
              lessonId,
              completed: true,
              watchTime: 300,
              completedAt: new Date(),
            },
          })
        )
      );

      const result = await issueCertificate({ courseId: testCourseId });

      expect(result.success).toBe(true);
      expect(result.certificate).toBeDefined();
      expect(result.certificate!.id).toBeDefined();
      expect(result.certificate!.issuedAt).toBeInstanceOf(Date);
      if (result.certificate!.courseTitle) {
        expect(result.certificate!.courseTitle).toBe("Certificate Test Course");
      }
    });

    test("excludes unpublished lessons from completion calculation", async () => {
      // Create unpublished lesson
      const unpublishedLesson = await db.lesson.create({
        data: {
          title: "Unpublished Lesson",
          slug: "unpublished-lesson",
          courseId: testCourseId,
          order: 4,
          published: false,
        },
      });

      // Complete only the 3 published lessons (should be 100% since unpublished lesson is excluded)
      await Promise.all(
        testLessonIds.map((lessonId) =>
          db.progress.create({
            data: {
              userId: testUserId,
              lessonId,
              completed: true,
              watchTime: 300,
              completedAt: new Date(),
            },
          })
        )
      );

      const result = await issueCertificate({ courseId: testCourseId });

      expect(result.success).toBe(true);
      expect(result.certificate).toBeDefined();

      // Cleanup
      await db.lesson.delete({ where: { id: unpublishedLesson.id } });
    });

    test("handles course with no lessons", async () => {
      // Create course with no lessons
      const emptyeCourse = await db.course.create({
        data: {
          title: "Empty Course",
          slug: `empty-course-${suffix}`,
          description: "Course with no lessons",
          category: "JAVASCRIPT",
          level: "BEGINNER",
          published: true,
          accessTier: "FREE",
        },
      });

      // Enroll user in empty course
      await db.enrollment.create({
        data: {
          userId: testUserId,
          courseId: emptyeCourse.id,
        },
      });

      const result = await issueCertificate({ courseId: emptyeCourse.id });

      // nothing to complete is not "completed": no certificate for an empty course
      expect(result.success).toBe(false);
      expect(result.error).toBe("NOT_ELIGIBLE");
      expect(
        await db.certificate.count({ where: { courseId: emptyeCourse.id } })
      ).toBe(0);

      // Cleanup
      await db.enrollment.deleteMany({ where: { courseId: emptyeCourse.id } });
      await db.course.delete({ where: { id: emptyeCourse.id } });
    });
  });

  describe("Idempotency and duplicate prevention", () => {
    beforeEach(async () => {
      // Complete all lessons for these tests
      await Promise.all(
        testLessonIds.map((lessonId) =>
          db.progress.create({
            data: {
              userId: testUserId,
              lessonId,
              completed: true,
              watchTime: 300,
              completedAt: new Date(),
            },
          })
        )
      );
    });

    test("prevents duplicate certificate issuance", async () => {
      // First issuance
      const result1 = await issueCertificate({ courseId: testCourseId });
      expect(result1.success).toBe(true);

      const firstCertificateId = result1.certificate!.id;
      const firstIssuedAt = result1.certificate!.issuedAt;

      // Second issuance attempt (should return existing certificate)
      const result2 = await issueCertificate({ courseId: testCourseId });
      expect(result2.success).toBe(true);
      expect(result2.certificate!.id).toBe(firstCertificateId); // Same certificate
      expect(result2.certificate!.issuedAt).toEqual(firstIssuedAt); // Same timestamp
      expect(result2.alreadyIssued).toBe(true); // Indicates existing certificate

      // Verify only one certificate exists in database
      const certificateCount = await db.certificate.count({
        where: {
          userId: testUserId,
          courseId: testCourseId,
        },
      });
      expect(certificateCount).toBe(1);
    });

    test("handles concurrent certificate issuance attempts", async () => {
      // Simulate concurrent issuance attempts
      const promises = Array.from({ length: 3 }, () =>
        issueCertificate({ courseId: testCourseId })
      );

      const results = await Promise.all(promises);

      // All should succeed
      results.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.certificate).toBeDefined();
      });

      // Should have same certificate ID (one created, others return existing)
      const certificateIds = results.map((r) => r.certificate!.id);
      const uniqueIds = new Set(certificateIds);
      expect(uniqueIds.size).toBe(1);

      // Verify only one certificate in database
      const certificateCount = await db.certificate.count({
        where: {
          userId: testUserId,
          courseId: testCourseId,
        },
      });
      expect(certificateCount).toBe(1);
    });
  });

  describe("Certificate content validation", () => {
    beforeEach(async () => {
      // Complete all lessons for these tests
      await Promise.all(
        testLessonIds.map((lessonId) =>
          db.progress.create({
            data: {
              userId: testUserId,
              lessonId,
              completed: true,
              watchTime: 300,
              completedAt: new Date(),
            },
          })
        )
      );
    });

    test("records accurate issuance timestamp", async () => {
      const beforeIssuance = new Date();

      const result = await issueCertificate({ courseId: testCourseId });

      const afterIssuance = new Date();

      expect(result.success).toBe(true);
      expect(result.certificate!.issuedAt).toBeInstanceOf(Date);
      expect(result.certificate!.issuedAt.getTime()).toBeGreaterThanOrEqual(
        beforeIssuance.getTime()
      );
      expect(result.certificate!.issuedAt.getTime()).toBeLessThanOrEqual(
        afterIssuance.getTime()
      );
    });

    test("includes course title in certificate", async () => {
      const result = await issueCertificate({ courseId: testCourseId });

      expect(result.success).toBe(true);
      if (result.certificate!.courseTitle) {
        expect(result.certificate!.courseTitle).toBe("Certificate Test Course");
      }
    });
  });

  describe("Error handling edge cases", () => {
    test("handles user session validation errors", async () => {
      // Mock session to return null
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await issueCertificate({ courseId: testCourseId });

      expect(result.success).toBe(false);
      expect(result.error).toBe("UNAUTHORIZED");
    });

    test("handles database constraint violations gracefully", async () => {
      // Complete all lessons
      await Promise.all(
        testLessonIds.map((lessonId) =>
          db.progress.create({
            data: {
              userId: testUserId,
              lessonId,
              completed: true,
              watchTime: 300,
              completedAt: new Date(),
            },
          })
        )
      );

      // First issuance should succeed
      const result1 = await issueCertificate({ courseId: testCourseId });
      expect(result1.success).toBe(true);

      // Subsequent calls should handle unique constraint gracefully
      const result2 = await issueCertificate({ courseId: testCourseId });
      expect(result2.success).toBe(true);
      expect(result2.alreadyIssued).toBe(true);
    });
  });

  describe("Response format validation", () => {
    beforeEach(async () => {
      // Complete all lessons for these tests
      await Promise.all(
        testLessonIds.map((lessonId) =>
          db.progress.create({
            data: {
              userId: testUserId,
              lessonId,
              completed: true,
              watchTime: 300,
              completedAt: new Date(),
            },
          })
        )
      );
    });

    test("success response has correct structure", async () => {
      const result = await issueCertificate({ courseId: testCourseId });

      expect(result).toMatchObject({
        success: true,
        message: expect.any(String),
        certificate: {
          id: expect.stringMatching(/^cm[a-z0-9]+$/), // CUID format
          issuedAt: expect.any(Date),
        },
      });
    });

    test("error response has correct structure", async () => {
      // Un-complete the lessons to trigger a completion error
      await db.progress.deleteMany({ where: { userId: testUserId } });
      const result = await issueCertificate({ courseId: testCourseId });

      expect(result).toMatchObject({
        success: false,
        message: expect.any(String),
        error: expect.any(String),
      });
    });

    test("idempotent response has correct structure", async () => {
      // First issuance
      await issueCertificate({ courseId: testCourseId });

      // Second issuance (idempotent)
      const result = await issueCertificate({ courseId: testCourseId });

      expect(result).toMatchObject({
        success: true,
        message: expect.any(String),
        certificate: {
          id: expect.stringMatching(/^cm[a-z0-9]+$/),
          issuedAt: expect.any(Date),
        },
        alreadyIssued: true, // Indicates existing certificate
      });
    });
  });
});
