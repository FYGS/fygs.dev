import { describe, test, expect, beforeEach, vi } from "vitest";
import { db } from "@/lib/db";
import { AnalyticsHelper } from "@/lib/analytics-helper";
import { createCourse, createUser } from "../support/factories";
import { resetDatabase } from "../support/test-db";

/**
 * T060: Analytics Event Integration Test
 *
 * Tests that analytics events are properly emitted by the real user actions
 * (enrollment, lesson completion, certificate issuance) and stored correctly in
 * the database.
 */

// Better Auth: the session is the user of the current test
const session = vi.hoisted(() => ({ userId: "" }));
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(async () => ({ user: { id: session.userId } })),
    },
  },
}));

import { enrollCourse } from "@/app/[locale]/(main)/dashboard/actions/enrollCourse";
import { updateLessonProgress } from "@/app/[locale]/(main)/dashboard/actions/updateLessonProgress";
import { issueCertificate } from "@/app/[locale]/(main)/dashboard/actions/issueCertificate";

type Props = Record<string, any>;

describe("Analytics Event Integration", () => {
  let user: Awaited<ReturnType<typeof createUser>>;
  let course: Awaited<ReturnType<typeof createCourse>>;
  let lessons: { id: string; order: number }[];

  const eventsOf = (type: string) =>
    db.analyticsEvent.findMany({
      where: { userId: user.id, type },
      orderBy: { createdAt: "asc" },
    });

  beforeEach(async () => {
    await resetDatabase(db);
    user = await createUser();
    session.userId = user.id;
    course = await createCourse({ title: "Analytics Test Course" });
    lessons = await Promise.all(
      [1, 2].map((order) =>
        db.lesson.create({
          data: {
            title: `Analytics Test Lesson ${order}`,
            slug: `analytics-test-lesson-${order}`,
            order,
            courseId: course.id,
            published: true,
            content: `Test lesson content ${order}`,
          },
          select: { id: true, order: true },
        })
      )
    );
  });

  describe("Enrollment analytics", () => {
    test("records enrollment event with correct properties", async () => {
      const result = await enrollCourse({ courseId: course.id });
      expect(result.success).toBe(true);

      const analyticsEvents = await eventsOf("ENROLLMENT_CREATED");
      expect(analyticsEvents).toHaveLength(1);

      const event = analyticsEvents[0];
      expect(event.userId).toBe(user.id);
      expect(event.type).toBe("ENROLLMENT_CREATED");
      expect(event.source).toBe("server");

      const properties = event.properties as Props;
      expect(properties.courseId).toBe(course.id);
      expect(properties.courseTitle).toBe(course.title);
      expect(properties.courseTier).toBe("FREE");
      expect(properties.enrollmentSource).toBe("direct_link");
      expect(properties.hasActiveSubscription).toBe(false);
      expect(properties.correlationId).toMatch(/^corr_\d+_[a-z0-9]+$/);
      expect(new Date(properties.timestamp).getTime()).not.toBeNaN();
    });

    test("a repeated enrollment request does not record a second event", async () => {
      await enrollCourse({ courseId: course.id });
      const again = await enrollCourse({ courseId: course.id });

      expect(again.alreadyEnrolled).toBe(true);
      expect(await eventsOf("ENROLLMENT_CREATED")).toHaveLength(1);
    });

    test("a refused enrollment records nothing", async () => {
      const premium = await createCourse({ accessTier: "PREMIUM" });

      const result = await enrollCourse({ courseId: premium.id });

      expect(result.success).toBe(false);
      expect(await db.analyticsEvent.count({ where: { userId: user.id } })).toBe(
        0
      );
    });
  });

  describe("Lesson completion analytics", () => {
    test("records lesson completion event with progress tracking", async () => {
      await enrollCourse({ courseId: course.id });

      const result = await updateLessonProgress({
        lessonId: lessons[0].id,
        completed: true,
        watchTimeDelta: 300,
      });
      expect(result.success).toBe(true);

      const analyticsEvents = await eventsOf("LESSON_COMPLETED");
      expect(analyticsEvents).toHaveLength(1);

      const event = analyticsEvents[0];
      expect(event.userId).toBe(user.id);
      expect(event.type).toBe("LESSON_COMPLETED");
      expect(event.source).toBe("server");

      const properties = event.properties as Props;
      expect(properties.lessonId).toBe(lessons[0].id);
      expect(properties.courseId).toBe(course.id);
      expect(properties.lessonOrder).toBe(1);
      expect(properties.watchTime).toBe(300);
      expect(properties.completionPercentage).toBe(100);
      expect(properties.isFirstCompletion).toBe(true);
    });

    test("only the first completion of a lesson is recorded", async () => {
      await enrollCourse({ courseId: course.id });

      await updateLessonProgress({ lessonId: lessons[0].id, completed: true });
      await updateLessonProgress({
        lessonId: lessons[0].id,
        completed: true,
        watchTimeDelta: 30,
      });

      expect(await eventsOf("LESSON_COMPLETED")).toHaveLength(1);
    });

    test("tracks progress across multiple lesson completions", async () => {
      await enrollCourse({ courseId: course.id });

      await updateLessonProgress({
        lessonId: lessons[0].id,
        completed: true,
        watchTimeDelta: 300,
      });
      await updateLessonProgress({
        lessonId: lessons[1].id,
        completed: true,
        watchTimeDelta: 450,
      });

      const analyticsEvents = await eventsOf("LESSON_COMPLETED");
      expect(analyticsEvents).toHaveLength(2);

      // Verify lesson 1 completion
      const lesson1Props = analyticsEvents[0].properties as Props;
      expect(lesson1Props.lessonId).toBe(lessons[0].id);
      expect(lesson1Props.lessonOrder).toBe(1);
      expect(lesson1Props.watchTime).toBe(300);

      // Verify lesson 2 completion
      const lesson2Props = analyticsEvents[1].properties as Props;
      expect(lesson2Props.lessonId).toBe(lessons[1].id);
      expect(lesson2Props.lessonOrder).toBe(2);
      expect(lesson2Props.watchTime).toBe(450);
    });
  });

  describe("Certificate issuance analytics", () => {
    test("records certificate event when course is completed", async () => {
      await enrollCourse({ courseId: course.id });
      for (const lesson of lessons) {
        await updateLessonProgress({
          lessonId: lesson.id,
          completed: true,
          watchTimeDelta: 300,
        });
      }

      const result = await issueCertificate({ courseId: course.id });
      expect(result.success).toBe(true);

      const analyticsEvents = await eventsOf("CERTIFICATE_ISSUED");
      expect(analyticsEvents).toHaveLength(1);

      const event = analyticsEvents[0];
      expect(event.userId).toBe(user.id);
      expect(event.type).toBe("CERTIFICATE_ISSUED");

      const properties = event.properties as Props;
      expect(properties.certificateId).toBe(result.certificate!.id);
      expect(properties.courseId).toBe(course.id);
      expect(properties.courseTitle).toBe(course.title);
      expect(properties.totalLessons).toBe(2);
      expect(properties.totalWatchTime).toBe(600); // 2 lessons * 300s each
    });

    test("asking for the certificate again does not record a second event", async () => {
      await enrollCourse({ courseId: course.id });
      for (const lesson of lessons) {
        await updateLessonProgress({ lessonId: lesson.id, completed: true });
      }

      await issueCertificate({ courseId: course.id });
      const again = await issueCertificate({ courseId: course.id });

      expect(again.alreadyIssued).toBe(true);
      expect(await eventsOf("CERTIFICATE_ISSUED")).toHaveLength(1);
    });
  });

  describe("Event correlation and tracking", () => {
    test("events include correlation IDs for session tracking", async () => {
      const correlationId = `corr_${Date.now()}_session_test`;

      // Related events sharing one correlation ID
      await AnalyticsHelper.emit({
        userId: user.id,
        type: "ENROLLMENT_CREATED",
        source: "server",
        properties: { courseId: course.id, correlationId },
      });
      await AnalyticsHelper.emit({
        userId: user.id,
        type: "LESSON_COMPLETED",
        source: "server",
        properties: { lessonId: lessons[0].id, courseId: course.id, correlationId },
      });
      // ...and an unrelated one
      await AnalyticsHelper.emit({
        userId: user.id,
        type: "LESSON_COMPLETED",
        source: "server",
        properties: { lessonId: lessons[1].id, courseId: course.id },
      });

      // Verify events can be correlated
      const correlatedEvents = await db.analyticsEvent.findMany({
        where: {
          userId: user.id,
          properties: { path: ["correlationId"], equals: correlationId },
        },
      });

      expect(correlatedEvents).toHaveLength(2);
      expect(correlatedEvents.map((e) => e.type).sort()).toEqual([
        "ENROLLMENT_CREATED",
        "LESSON_COMPLETED",
      ]);
    });

    test("events contain proper timestamps and metadata", async () => {
      const beforeTime = new Date();

      await enrollCourse({ courseId: course.id });

      const afterTime = new Date();

      const event = await db.analyticsEvent.findFirstOrThrow({
        where: { userId: user.id, type: "ENROLLMENT_CREATED" },
      });

      expect(event.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime()
      );
      expect(event.createdAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
      expect(event.source).toBe("server");

      const properties = event.properties as Props;
      expect(new Date(properties.timestamp).getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime()
      );
      expect(properties.correlationId).toMatch(/^corr_\d+_/);
    });
  });

  describe("Event data integrity", () => {
    test("handles missing optional properties gracefully", async () => {
      // Minimal payload: no timestamp, no correlationId
      await AnalyticsHelper.emit({
        userId: user.id,
        type: "ENROLLMENT_CREATED",
        source: "server",
        properties: { courseId: course.id },
      });

      const event = await db.analyticsEvent.findFirstOrThrow({
        where: { userId: user.id, type: "ENROLLMENT_CREATED" },
      });

      expect(event.userId).toBe(user.id);
      expect(event.type).toBe("ENROLLMENT_CREATED");

      const properties = event.properties as Props;
      expect(properties.courseId).toBe(course.id);
      // a correlation id is generated when the caller gives none
      expect(properties.correlationId).toMatch(/^corr_\d+_/);
    });

    test("preserves complex property structures", async () => {
      const complexProperties = {
        courseId: course.id,
        metadata: {
          userAgent: "test-browser/1.0",
          referrer: "https://example.com",
          sessionData: {
            startTime: new Date().toISOString(),
            interactions: ["click", "scroll", "submit"],
          },
        },
        timing: {
          pageLoadTime: 1250,
          timeToEnroll: 3400,
        },
        correlationId: `corr_${Date.now()}_complex`,
      };

      await AnalyticsHelper.emit({
        userId: user.id,
        type: "ENROLLMENT_CREATED",
        source: "web",
        properties: complexProperties,
      });

      const event = await db.analyticsEvent.findFirstOrThrow({
        where: { userId: user.id, type: "ENROLLMENT_CREATED" },
      });

      expect(event.source).toBe("web");
      const properties = event.properties as Props;
      expect(properties).toEqual(complexProperties);
      expect(properties.metadata.sessionData.interactions).toEqual([
        "click",
        "scroll",
        "submit",
      ]);
    });

    test("strips personal data from the properties", async () => {
      await AnalyticsHelper.emit({
        userId: user.id,
        type: "ENROLLMENT_CREATED",
        source: "server",
        properties: {
          courseId: course.id,
          email: "someone@example.com",
          name: "Someone",
          ip: "203.0.113.7",
        },
      });

      const event = await db.analyticsEvent.findFirstOrThrow({
        where: { userId: user.id },
      });

      const properties = event.properties as Props;
      expect(properties.courseId).toBe(course.id);
      expect(properties).not.toHaveProperty("email");
      expect(properties).not.toHaveProperty("name");
      expect(properties).not.toHaveProperty("ip");
    });
  });
});
