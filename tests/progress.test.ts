import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { markLessonProgress } from "@/app/actions/lesson-progress";
import { db } from "@/lib/db";
import { createCourse, createUser, enroll } from "./support/factories";

const session = vi.hoisted(() => ({ userId: "" }));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: { getSession: async () => ({ user: { id: session.userId } }) },
  },
}));

vi.mock("@/lib/email-service", () => ({
  emailService: {
    certificateEarnedEmail: () => ({ subject: "s", html: "h" }),
    sendEmail: vi.fn(async () => undefined),
  },
}));

describe("lesson progress + certificate issuance", () => {
  let userId = "";
  let courseId = "";
  const lessonIds: string[] = [];

  beforeAll(async () => {
    const user = await createUser();
    userId = user.id;
    session.userId = userId;
    const course = await createCourse();
    courseId = course.id;
    await enroll(userId, courseId);
    for (let i = 0; i < 3; i++) {
      const lesson = await db.lesson.create({
        data: {
          title: `L${i}`,
          slug: `l${i}`,
          courseId,
          order: i,
          published: true,
        },
      });
      lessonIds.push(lesson.id);
    }
  });

  afterAll(async () => {
    await db.course.delete({ where: { id: courseId } });
    await db.user.delete({ where: { id: userId } });
  });

  it("increments watch time and marks completion", async () => {
    const r1 = await markLessonProgress({
      lessonId: lessonIds[0],
      watchTimeIncrement: 50,
    });
    expect(r1.ok).toBe(true);
    const r2 = await markLessonProgress({
      lessonId: lessonIds[0],
      completed: true,
      watchTimeIncrement: 10,
    });
    expect(r2.ok).toBe(true);
    if (!r2.ok) return;
    expect(r2.progress.completed).toBe(true);
    expect(r2.progress.watchTime).toBe(60);
    expect(r2.progress.completedAt).toBeInstanceOf(Date);
  });

  it("issues certificate after all lessons complete", async () => {
    for (let i = 1; i < lessonIds.length; i++) {
      await markLessonProgress({ lessonId: lessonIds[i], completed: true });
    }
    const certs = await db.certificate.findMany({ where: { userId, courseId } });
    expect(certs.length).toBe(1);
  });
});
