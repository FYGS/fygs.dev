import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { db } from "@/lib/db";
import { AccessService } from "@/lib/access-service";
import { CourseAccessTier, Role } from "@/lib/generated/prisma/client";
import {
  createCourse,
  createSubscription,
  createUser,
  enroll,
} from "../../support/factories";
import { resetDatabase } from "../../support/test-db";

/**
 * T114: first-lesson preview of premium courses, through the real AccessService.
 *
 * Rules (lib/access-service.ts): every course is enrollment-gated. The one
 * exception is the preview: a PREMIUM course with previewEnabled lets a visitor
 * (enrolled or not, subscribed or not) watch its first published lesson, and only
 * that one. FREE courses have no preview, they simply need an enrollment. On a
 * PREMIUM course the enrollment opens the whole course only while the user holds an
 * entitlement (active subscription or lifetime purchase, FR-003/FR-005).
 */

let lessonCounter = 0;
function createLesson(
  courseId: string,
  order: number,
  published = true
): Promise<{ id: string }> {
  lessonCounter += 1;
  return db.lesson.create({
    data: {
      title: `Lesson ${order}`,
      slug: `lesson-${order}-${lessonCounter}`,
      content: `Content of lesson ${order}`,
      order,
      courseId,
      published,
    },
    select: { id: true },
  });
}

/** A premium course with two published lessons. */
async function premiumCourseWithLessons(previewEnabled = true) {
  const course = await createCourse({
    accessTier: CourseAccessTier.PREMIUM,
    previewEnabled,
  });
  const first = await createLesson(course.id, 1);
  const second = await createLesson(course.id, 2);
  return { course, first, second };
}

const getProgressRecord = (userId: string, courseId: string) =>
  db.progress.findFirst({ where: { userId, lesson: { courseId } } });

// leave an empty database for the suites that run next
afterAll(async () => {
  await resetDatabase(db);
});

describe("T114: Premium First Lesson Preview Tests", () => {
  beforeEach(async () => {
    await resetDatabase(db);
  });

  describe("Premium Course Preview Access", () => {
    it("non-subscribed user can preview first lesson of premium course", async () => {
      const user = await createUser();
      const { course, first, second } = await premiumCourseWithLessons();

      expect(await AccessService.canAccessLesson(user.id, first.id)).toBe(true);
      // ...but only the first one
      expect(await AccessService.canAccessLesson(user.id, second.id)).toBe(
        false
      );

      const access = await AccessService.checkCourseAccess(user.id, course.id);
      expect(access).toMatchObject({
        canPreviewFirstLesson: true,
        canAccessCourse: false,
        accessReason: "preview_only",
      });
    });

    it("subscribed user can preview first lesson of premium course (the subscription does not enroll)", async () => {
      const user = await createUser();
      await createSubscription(user.id, { priceId: "price_premium" });
      const { course, first, second } = await premiumCourseWithLessons();

      expect(await AccessService.canAccessLesson(user.id, first.id)).toBe(true);
      expect(await AccessService.canAccessLesson(user.id, second.id)).toBe(
        false
      );

      const access = await AccessService.checkCourseAccess(user.id, course.id);
      expect(access).toMatchObject({
        hasActiveSubscription: true,
        isEnrolledInCourse: false,
        canPreviewFirstLesson: true,
      });
    });

    it("enrolled user can access every lesson of the premium course", async () => {
      const user = await createUser();
      const { course, first, second } = await premiumCourseWithLessons();
      await createSubscription(user.id);
      await enroll(user.id, course.id);

      expect(await AccessService.canAccessLesson(user.id, first.id)).toBe(true);
      expect(await AccessService.canAccessLesson(user.id, second.id)).toBe(true);

      const access = await AccessService.checkCourseAccess(user.id, course.id);
      expect(access).toMatchObject({
        canAccessCourse: true,
        canPreviewFirstLesson: false, // a preview only exists for those locked out
        accessReason: "ok",
      });
    });

    it("enrolled but without entitlement falls back to the preview of the first lesson only", async () => {
      const user = await createUser();
      const { course, first, second } = await premiumCourseWithLessons();
      await enroll(user.id, course.id); // e.g. the subscription ended

      expect(await AccessService.canAccessLesson(user.id, first.id)).toBe(true);
      expect(await AccessService.canAccessLesson(user.id, second.id)).toBe(false);
      expect(await AccessService.checkCourseAccess(user.id, course.id)).toMatchObject({
        isEnrolledInCourse: true,
        canAccessCourse: false,
        canPreviewFirstLesson: true,
        accessReason: "preview_only",
      });
    });

    it("no preview when the course has previewEnabled turned off", async () => {
      const user = await createUser();
      const { course, first } = await premiumCourseWithLessons(false);

      expect(await AccessService.canAccessLesson(user.id, first.id)).toBe(false);
      expect(
        (await AccessService.checkCourseAccess(user.id, course.id)).accessReason
      ).toBe("not_enrolled");
    });
  });

  describe("Progress Record Verification", () => {
    it("no progress record exists before enrollment for premium preview", async () => {
      const user = await createUser();
      const { course, first } = await premiumCourseWithLessons();

      // Previewing is a read: it leaves no progress and no enrollment behind
      expect(await getProgressRecord(user.id, course.id)).toBeNull();
      expect(await AccessService.isEnrolledInCourse(user.id, course.id)).toBe(
        false
      );
      expect(await AccessService.canAccessLesson(user.id, first.id)).toBe(true);
      expect(await getProgressRecord(user.id, course.id)).toBeNull();
      expect(await AccessService.isEnrolledInCourse(user.id, course.id)).toBe(
        false
      );
    });

    it("progress record can exist after enrollment for premium course", async () => {
      const user = await createUser();
      const { course, first } = await premiumCourseWithLessons();
      await enroll(user.id, course.id);

      await db.progress.create({
        data: {
          userId: user.id,
          lessonId: first.id,
          completed: true,
          completedAt: new Date(),
          watchTime: 120,
        },
      });

      const foundProgress = await getProgressRecord(user.id, course.id);
      expect(foundProgress).toBeTruthy();
      expect(foundProgress?.completed).toBe(true);
      expect(await AccessService.canAccessLesson(user.id, first.id)).toBe(true);
    });
  });

  describe("Free Course Comparison", () => {
    it("free course first lesson needs an enrollment, there is no preview", async () => {
      const user = await createUser();
      const course = await createCourse({ accessTier: CourseAccessTier.FREE });
      const lesson = await createLesson(course.id, 1);

      expect(await AccessService.canAccessLesson(user.id, lesson.id)).toBe(false);
      expect(
        (await AccessService.checkCourseAccess(user.id, course.id))
          .canPreviewFirstLesson
      ).toBe(false);

      await enroll(user.id, course.id);
      expect(await AccessService.canAccessLesson(user.id, lesson.id)).toBe(true);
    });
  });

  describe("Admin and Edge Cases", () => {
    it("admin gets the same first-lesson preview as anybody (not enrolled)", async () => {
      const admin = await createUser({ role: Role.ADMIN });
      const { first, second } = await premiumCourseWithLessons();

      expect(await AccessService.canAccessLesson(admin.id, first.id)).toBe(true);
      // admin viewing of the rest is a route-level decision, not an entitlement
      expect(await AccessService.canAccessLesson(admin.id, second.id)).toBe(
        false
      );
    });

    it("the preview lesson is the first PUBLISHED lesson", async () => {
      const user = await createUser();
      const course = await createCourse({
        accessTier: CourseAccessTier.PREMIUM,
        previewEnabled: true,
      });
      const draft = await createLesson(course.id, 1, false);
      const published = await createLesson(course.id, 2);

      expect(await AccessService.canAccessLesson(user.id, draft.id)).toBe(false);
      expect(await AccessService.canAccessLesson(user.id, published.id)).toBe(
        true
      );
    });

    it("an unknown user id is treated like any visitor that is not enrolled", async () => {
      const { first, second } = await premiumCourseWithLessons();

      // preview needs no account; nothing is created for the unknown id
      expect(await AccessService.canAccessLesson("non-existent-user", first.id)).toBe(
        true
      );
      expect(await AccessService.canAccessLesson("non-existent-user", second.id)).toBe(
        false
      );
      expect(await db.enrollment.count()).toBe(0);
      expect(await db.progress.count()).toBe(0);
    });

    it("non-existent lesson or course cannot be previewed", async () => {
      const user = await createUser();

      expect(await AccessService.canAccessLesson(user.id, "non-existent-lesson")).toBe(
        false
      );
      expect(
        (await AccessService.checkCourseAccess(user.id, "non-existent-course"))
          .canPreviewFirstLesson
      ).toBe(false);
    });
  });

  describe("Preview Access Flow Verification", () => {
    it("verifies complete preview flow for premium course", async () => {
      const user = await createUser();
      const { course, first, second } = await premiumCourseWithLessons();

      // 1. Initial state - no enrollment, no progress
      expect(await AccessService.isEnrolledInCourse(user.id, course.id)).toBe(
        false
      );
      expect(await getProgressRecord(user.id, course.id)).toBeNull();

      // 2. Preview accessible for the first lesson only
      expect(await AccessService.canAccessLesson(user.id, first.id)).toBe(true);
      expect(await AccessService.canAccessLesson(user.id, second.id)).toBe(
        false
      );

      // 3. After enrollment - the whole course opens up for an entitled user
      await createSubscription(user.id);
      await enroll(user.id, course.id);

      expect(await AccessService.isEnrolledInCourse(user.id, course.id)).toBe(
        true
      );
      expect(await AccessService.canAccessLesson(user.id, first.id)).toBe(true);
      expect(await AccessService.canAccessLesson(user.id, second.id)).toBe(true);
    });
  });
});
