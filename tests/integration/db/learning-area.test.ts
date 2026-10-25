import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { resetDatabase } from "../../support/test-db";
import { createCourse, createUser, enroll, sessionFor } from "../../support/factories";

const h = vi.hoisted(() => ({
  session: null as { user: { id: string; role?: string; name?: string } } | null,
  sendEmail: vi.fn(async () => true),
}));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn(async () => h.session) } } }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn(async () => ({ allowed: true })), enforceRateLimit: vi.fn(async () => null) }));
vi.mock("@/lib/email-service", () => ({
  emailService: { certificateEarnedEmail: () => ({ subject: "Certificat", html: "<p>ok</p>" }), sendEmail: h.sendEmail },
}));

import { askLessonQuestion } from "@/app/actions/lesson-questions";
import { createNote } from "@/app/actions/note-actions";
import { checkQuizAnswer } from "@/app/actions/quiz-actions";
import { findCertificateByCode, listUserCertificates } from "@/lib/learning/certificates";
import { loadCourseOutline } from "@/lib/learning/course-state";
import { getLessonAccess } from "@/lib/learning/lesson-access";
import { recordLessonProgress } from "@/lib/learning/lesson-progress";
import { getResumedAnswers } from "@/lib/learning/quiz-status";
import { syncPathCertificates } from "@/lib/paths/certificates";
import { getUserCoursesProgress } from "@/lib/progress-summary";

beforeEach(async () => {
  h.session = null;
  h.sendEmail.mockClear();
  await resetDatabase(db);
});
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

/** A published course with one module, two lessons (the first one a free sample) and a two-question quiz. */
async function course(over: Parameters<typeof createCourse>[0] = {}) {
  const c = await createCourse({ previewEnabled: false, ...over });
  const m = await db.module.create({ data: { courseId: c.id, title: "Bases", slug: "bases", order: 1 } });
  const sample = await db.lesson.create({
    data: { courseId: c.id, moduleId: m.id, title: "Intro", slug: "intro", order: 1, published: true, isPreview: true, content: "<p>x</p>" },
  });
  const locked = await db.lesson.create({
    data: { courseId: c.id, moduleId: m.id, title: "Suite", slug: "suite", order: 2, published: true, content: "<p>y</p>" },
  });
  const quiz = await db.quiz.create({
    data: {
      courseId: c.id,
      moduleId: m.id,
      title: "Quiz",
      questions: { create: [0, 1].map((order) => ({ question: `Q${order}`, options: ["A", "B", "C"], correct: 1, explanation: `e${order}`, order })) },
    },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  return { course: c, sample, locked, quiz };
}

describe("who may open a lesson, and what is recorded", () => {
  it("opens the free sample to a visitor and to a signed-in learner, the rest only to the course's learners", async () => {
    const { course: c, sample, locked } = await course({ accessTier: "PREMIUM", price: 49 });
    const outsider = await createUser();
    expect(await getLessonAccess(null, sample.id)).toMatchObject({ canOpen: true, mode: "preview" });
    expect(await getLessonAccess(null, locked.id)).toMatchObject({ canOpen: false });
    expect(await getLessonAccess({ id: outsider.id }, sample.id)).toMatchObject({ canOpen: true, mode: "preview" });

    const instructor = await createUser({ role: "INSTRUCTOR" });
    await db.course.update({ where: { id: c.id }, data: { instructorId: instructor.id } });
    expect(await getLessonAccess({ id: instructor.id, role: "INSTRUCTOR" }, locked.id)).toMatchObject({ canOpen: true, mode: "staff" });
  });

  it("records progress for a learner who follows the course, never for a preview or the author", async () => {
    const { course: c, sample } = await course();
    const visitor = await createUser();
    expect(await recordLessonProgress({ id: visitor.id }, { lessonId: sample.id, completed: true })).toMatchObject({
      success: false,
      error: "ACCESS_DENIED",
    });

    const instructor = await createUser({ role: "INSTRUCTOR" });
    await db.course.update({ where: { id: c.id }, data: { instructorId: instructor.id } });
    expect(await recordLessonProgress({ id: instructor.id, role: "INSTRUCTOR" }, { lessonId: sample.id, watchTimeDelta: 30 })).toMatchObject({
      success: false,
      error: "ACCESS_DENIED",
    });
    expect(await db.progress.count()).toBe(0);

    const student = await createUser();
    await enroll(student.id, c.id);
    const ok = await recordLessonProgress({ id: student.id }, { lessonId: sample.id, watchTimeDelta: 30, lastPosition: 42 });
    expect(ok).toMatchObject({ success: true, progress: { watchTime: 30, lastPosition: 42, completed: false } });
    // two reports add up (the database adds, nothing is overwritten)
    await recordLessonProgress({ id: student.id }, { lessonId: sample.id, watchTimeDelta: 15 });
    expect((await db.progress.findFirstOrThrow({ where: { userId: student.id } })).watchTime).toBe(45);
  });

  it("lets the author keep notes while previewing their own course", async () => {
    const { course: c, locked } = await course();
    const instructor = await createUser({ role: "INSTRUCTOR" });
    await db.course.update({ where: { id: c.id }, data: { instructorId: instructor.id } });
    h.session = { user: { id: instructor.id, role: "INSTRUCTOR" } };
    const result = await createNote({ lessonId: locked.id, content: "À reformuler", timestamp: null });
    expect("note" in result).toBe(true);
  });
});

describe("quiz in progress", () => {
  it("gives back the answers of the open sitting, the first one recorded for each question", async () => {
    const { course: c, quiz } = await course();
    const student = await createUser();
    await enroll(student.id, c.id);
    h.session = sessionFor(student.id);
    const [q0] = quiz.questions;
    const first = await checkQuizAnswer({ quizId: quiz.id, questionId: q0.id, selectedOption: 0 });
    // trying another option afterwards: the server keeps the first one and says which one counts
    const again = await checkQuizAnswer({ quizId: quiz.id, questionId: q0.id, selectedOption: 1 });
    expect(first).toMatchObject({ success: true, selectedOption: 0, isCorrect: false });
    expect(again).toMatchObject({ success: true, selectedOption: 0, isCorrect: false });

    expect(await getResumedAnswers(student.id, quiz.id)).toEqual([
      { questionId: q0.id, selectedOption: 0, isCorrect: false, correctOption: 1, explanation: "e0" },
    ]);
  });
});

describe("the outline", () => {
  it("leaves out a published exam whose questions cannot be read: it could never be passed", async () => {
    const { course: c } = await course();
    await db.finalExam.create({ data: { courseId: c.id, title: "Examen", published: true, questions: [{ question: "Q", options: ["seule"] }] } });
    const outline = await loadCourseOutline(c.id);
    expect(outline.items.some((i) => i.kind === "exam")).toBe(false);
  });
});

describe("questions asked from a lesson", () => {
  it("tells the instructor of the course at once", async () => {
    const { course: c, sample } = await course();
    const instructor = await createUser({ role: "INSTRUCTOR" });
    await db.course.update({ where: { id: c.id }, data: { instructorId: instructor.id } });
    const student = await createUser({ name: "Léa" });
    await enroll(student.id, c.id);
    h.session = { user: { id: student.id, name: "Léa" } };

    const result = await askLessonQuestion({ lessonId: sample.id, title: "Pourquoi const ?", content: "Je ne comprends pas la différence avec let." });
    expect(result.success).toBe(true);
    const notification = await db.notification.findFirstOrThrow({ where: { recipientId: instructor.id } });
    expect(notification.title).toBe("Nouvelle question sur votre formation");
    expect(notification.message).toContain("Pourquoi const ?");
    expect(notification.data).toMatchObject({ kind: "lesson_question", lessonId: sample.id });
  });

  it("is for the course's learners only", async () => {
    const { sample } = await course();
    const outsider = await createUser();
    h.session = sessionFor(outsider.id);
    const result = await askLessonQuestion({ lessonId: sample.id, title: "Une question", content: "Une question assez longue." });
    expect(result.success).toBe(false);
  });
});

describe("certificates of courses and paths, read the same way", () => {
  it("finds either kind by its code, lists both, and announces a path certificate", async () => {
    const { course: a } = await course();
    const { course: b } = await course();
    const user = await createUser({ name: "Ada" });
    const courseCert = await db.certificate.create({ data: { userId: user.id, courseId: a.id } });

    const path = await db.path.create({
      data: {
        slug: "web",
        title: "Le web",
        description: "Deux formations dans l'ordre.",
        published: true,
        courses: { create: [{ courseId: a.id, order: 1 }, { courseId: b.id, order: 2 }] },
      },
    });
    await db.pathEnrollment.create({ data: { userId: user.id, pathId: path.id } });
    // b is complete for this learner: every lesson done, the quiz passed, and enrolled
    await enroll(user.id, a.id);
    await enroll(user.id, b.id);
    for (const courseId of [a.id, b.id]) {
      for (const lesson of await db.lesson.findMany({ where: { courseId } })) {
        await db.progress.create({ data: { userId: user.id, lessonId: lesson.id, completed: true, completedAt: new Date() } });
      }
      for (const quiz of await db.quiz.findMany({ where: { courseId } })) {
        await db.quizResult.create({ data: { userId: user.id, quizId: quiz.id, score: 2, total: 2, percentage: 100 } });
      }
    }

    const { issued } = await syncPathCertificates(user.id);
    expect(issued).toHaveLength(1);
    const pathCode = issued[0].code;

    expect(await findCertificateByCode(courseCert.code)).toMatchObject({ kind: "course", holderName: "Ada", holderHref: `/certificates/${a.id}` });
    expect(await findCertificateByCode(pathCode.toUpperCase())).toMatchObject({
      kind: "path",
      title: "Le web",
      courseTitles: [a.title, b.title],
      holderHref: "/parcours/web/certificat",
    });
    expect(await findCertificateByCode("0".repeat(32))).toBeNull();
    expect(await findCertificateByCode("'; drop table")).toBeNull();

    expect((await listUserCertificates(user.id)).map((c) => c.kind).sort()).toEqual(["course", "path"]);
    expect(await db.notification.count({ where: { recipientId: user.id, title: "Certificat de parcours obtenu" } })).toBe(1);
    expect(h.sendEmail).toHaveBeenCalledTimes(1);
  });
});

describe("« Mon apprentissage »", () => {
  it("says when a premium course is no longer open and keeps the progress, leading to the course page", async () => {
    const { course: c, sample } = await course({ accessTier: "PREMIUM", price: 49 });
    const user = await createUser();
    await enroll(user.id, c.id);
    await db.progress.create({ data: { userId: user.id, lessonId: sample.id, completed: true, completedAt: new Date() } });

    const [summary] = await getUserCoursesProgress(user.id);
    expect(summary).toMatchObject({ hasAccess: false, lapsed: "premium_required", done: 1, continueHref: `/formations/${c.slug}`, nextStepTitle: null });
  });

  it("never calls an empty course finished", async () => {
    const c = await createCourse();
    const user = await createUser();
    await enroll(user.id, c.id);
    const [summary] = await getUserCoursesProgress(user.id);
    expect(summary).toMatchObject({ total: 0, isComplete: false, continueHref: `/formations/${c.slug}` });
  });
});
