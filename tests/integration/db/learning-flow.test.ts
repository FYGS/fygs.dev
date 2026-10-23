import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { resetDatabase } from "../../support/test-db";
import { createCourse, createSubscription, createUser, enroll, sessionFor } from "../../support/factories";

const h = vi.hoisted(() => ({ session: null as { user: { id: string; role?: string } } | null, sendEmail: vi.fn(async () => true) }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn(async () => h.session) } } }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn(async () => ({ allowed: true })), enforceRateLimit: vi.fn(async () => null) }));
vi.mock("@/lib/email-service", () => ({
  emailService: { certificateEarnedEmail: () => ({ subject: "Certificat", html: "<p>ok</p>" }), sendEmail: h.sendEmail },
}));

import { updateLessonProgress } from "@/app/[locale]/(main)/dashboard/actions/updateLessonProgress";
import { checkQuizAnswer, submitQuizAnswers } from "@/app/actions/quiz-actions";
import { startFinalExam, submitFinalExam } from "@/app/actions/exam-actions";
import { askLessonQuestion } from "@/app/actions/lesson-questions";
import { createNote } from "@/app/actions/note-actions";
import { completeCourseIfDone } from "@/lib/learning/completion";
import { loadLearnerCourseState } from "@/lib/learning/course-state";
import { resolveLearnerAccess } from "@/lib/learning/access";
import { suggestNextCourses } from "@/lib/learning/recommendations";
import { getQuizStartBlock } from "@/lib/learning/quiz-status";
import { signExamStart } from "@/lib/learning/exam-token";
import { getUserCoursesProgress } from "@/lib/progress-summary";
import { AccessService } from "@/lib/access-service";

beforeEach(async () => {
  h.session = null;
  h.sendEmail.mockClear();
  await resetDatabase(db);
});
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

const EXAM_QUESTIONS = [
  { question: "Q1", options: ["a", "b", "c"], correct: 1, explanation: "because b" },
  { question: "Q2", options: ["a", "b"], correct: 0, explanation: "because a" },
];

/** A course: module 1 with two lessons and a quiz, module 2 with one lesson, and optionally a final exam. */
async function buildCourse(opts: { exam?: boolean; accessTier?: "FREE" | "PREMIUM"; flaggedPreview?: boolean } = {}) {
  const course = await createCourse({ accessTier: opts.accessTier ?? "FREE", previewEnabled: true });
  const m1 = await db.module.create({ data: { courseId: course.id, title: "Bases", slug: "bases", order: 1 } });
  const m2 = await db.module.create({ data: { courseId: course.id, title: "Avancé", slug: "avance", order: 2 } });
  const lesson = (moduleId: string, slug: string, order: number, extra = {}) =>
    db.lesson.create({ data: { courseId: course.id, moduleId, title: slug, slug, order, published: true, duration: 120, ...extra } });
  const l1 = await lesson(m1.id, "variables", 1, opts.flaggedPreview ? { isPreview: true } : {});
  const l2 = await lesson(m1.id, "fonctions", 2);
  const l3 = await lesson(m2.id, "async", 1);
  const quiz = await db.quiz.create({
    data: {
      courseId: course.id,
      moduleId: m1.id,
      title: "Quiz des bases",
      questions: {
        create: [0, 1].map((order) => ({ question: `Q${order}`, options: ["A", "B", "C"], correct: order, explanation: `e${order}`, order })),
      },
    },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  const exam = opts.exam
    ? await db.finalExam.create({
        data: { courseId: course.id, title: "Examen final", passingScore: 70, timeLimit: 60, published: true, questions: EXAM_QUESTIONS },
      })
    : null;
  return { course, lessons: [l1, l2, l3], quiz, exam };
}

async function learner(course: { id: string }) {
  const user = await createUser();
  await enroll(user.id, course.id);
  h.session = sessionFor(user.id);
  return user;
}

const complete = (lessonId: string) => updateLessonProgress({ lessonId, completed: true });

async function passQuiz(quiz: Awaited<ReturnType<typeof buildCourse>>["quiz"], courseId: string, right = true) {
  const answers = quiz.questions.map((q) => ({ questionId: q.id, selectedOption: right ? q.correct : (q.correct + 1) % 3 }));
  for (const a of answers) await checkQuizAnswer({ quizId: quiz.id, questionId: a.questionId, selectedOption: a.selectedOption });
  return submitQuizAnswers({ quizId: quiz.id, courseId, answers });
}

describe("one progress rule: lessons, quizzes and the exam", () => {
  it("counts every published lesson, every quiz with questions and the published exam", async () => {
    const { course, lessons, quiz } = await buildCourse({ exam: true });
    const user = await learner(course);
    // a draft lesson and an empty quiz are not part of the course
    await db.lesson.create({ data: { courseId: course.id, title: "Brouillon", slug: "brouillon", order: 9, published: false } });
    await db.quiz.create({ data: { courseId: course.id, moduleId: quiz.moduleId, title: "Vide" } });

    let state = await loadLearnerCourseState(user.id, course.id);
    expect(state.progress).toMatchObject({ total: 5, done: 0, percent: 0, isComplete: false });
    expect(state.outline.items.map((i) => i.kind)).toEqual(["lesson", "lesson", "quiz", "lesson", "exam"]);
    expect(state.progress.next?.id).toBe(lessons[0].id);

    await complete(lessons[0].id);
    await complete(lessons[1].id);
    state = await loadLearnerCourseState(user.id, course.id);
    expect(state.progress).toMatchObject({ done: 2, percent: 40 });
    expect(state.progress.next?.id).toBe(quiz.id);
  });

  it("is the same number on the dashboard summary", async () => {
    const { course, lessons } = await buildCourse({ exam: true });
    const user = await learner(course);
    await complete(lessons[0].id);
    const [summary] = await getUserCoursesProgress(user.id);
    expect(summary).toMatchObject({ courseId: course.id, done: 1, total: 5, percent: 20, hasCertificate: false, isComplete: false });
    expect(summary.continueHref).toBe(`/learn/${course.slug}/lessons/fonctions`);
  });
});

describe("the certificate follows completion, in the live flow", () => {
  it("is issued when the last lesson is done on a course with lessons only", async () => {
    const course = await createCourse();
    const user = await learner(course);
    const lessons = await Promise.all(
      [1, 2].map((order) => db.lesson.create({ data: { courseId: course.id, title: `L${order}`, slug: `l${order}`, order, published: true } })),
    );
    const first = await complete(lessons[0].id);
    expect(first.course).toMatchObject({ isComplete: false, certificate: null });
    const last = await complete(lessons[1].id);
    expect(last.course).toMatchObject({ isComplete: true, justIssued: true, percent: 100 });
    expect(last.course?.certificate?.code).toMatch(/^[a-f0-9]{32}$/);
    expect(last.reward?.xp).toBeGreaterThan(0);
    expect(await db.certificate.count({ where: { userId: user.id, courseId: course.id } })).toBe(1);
  });

  it("needs the lessons, then the quiz, then the exam, and only then gives the certificate", async () => {
    const { course, lessons, quiz, exam } = await buildCourse({ exam: true });
    const user = await learner(course);

    for (const lesson of lessons) await complete(lesson.id);
    expect(await db.certificate.count({ where: { userId: user.id } })).toBe(0); // quiz and exam are missing

    // a failed quiz does not count
    const failed = await passQuiz(quiz, course.id, false);
    expect(failed).toMatchObject({ success: true, passed: false });
    expect(await db.certificate.count({ where: { userId: user.id } })).toBe(0);

    // passing it still leaves the exam
    await db.quizAttempt.deleteMany({ where: { userId: user.id } }); // skip the waiting time
    const passed = await passQuiz(quiz, course.id, true);
    expect(passed).toMatchObject({ success: true, passed: true, percentage: 100 });
    if (passed.success) expect(passed.course).toMatchObject({ isComplete: false, percent: 80, justIssued: false });
    expect(await db.certificate.count({ where: { userId: user.id } })).toBe(0);

    // the exam: right answers finish the course
    const started = await startFinalExam({ courseId: course.id });
    expect(started.success).toBe(true);
    if (!started.success) return;
    expect(JSON.stringify(started)).not.toContain("because"); // no explanation, no answer before grading
    const graded = await submitFinalExam({ examId: exam!.id, token: started.token, answers: [1, 0] });
    expect(graded).toMatchObject({ success: true, passed: true, percentage: 100 });
    if (!graded.success) return;
    expect(graded.course).toMatchObject({ isComplete: true, justIssued: true });

    const certificate = await db.certificate.findUniqueOrThrow({ where: { userId_courseId: { userId: user.id, courseId: course.id } } });
    expect(certificate.code).toMatch(/^[a-f0-9]{32}$/);
    expect((await db.enrollment.findUniqueOrThrow({ where: { userId_courseId: { userId: user.id, courseId: course.id } } })).completedAt).not.toBeNull();
    expect(await db.xpEvent.count({ where: { userId: user.id, reason: "COURSE_COMPLETED" } })).toBe(1);
    expect(await db.notification.count({ where: { recipientId: user.id } })).toBe(1);
    expect(h.sendEmail).toHaveBeenCalledTimes(1);
  });

  it("is issued once, whatever calls completion again", async () => {
    const course = await createCourse();
    const user = await learner(course);
    const lesson = await db.lesson.create({ data: { courseId: course.id, title: "L", slug: "l", order: 1, published: true } });
    await complete(lesson.id);
    const outcomes = await Promise.all([1, 2, 3].map(() => completeCourseIfDone(user.id, course.id)));
    expect(outcomes.every((o) => o.certificate?.code)).toBe(true);
    expect(outcomes.filter((o) => o.justIssued)).toHaveLength(0); // the lesson call already issued it
    expect(await db.certificate.count({ where: { userId: user.id } })).toBe(1);
    expect(await db.xpEvent.count({ where: { userId: user.id, reason: "COURSE_COMPLETED" } })).toBe(1);
    expect(h.sendEmail).toHaveBeenCalledTimes(1);
  });

  it("is not given to a learner whose access to a premium course has lapsed", async () => {
    const { course, lessons, quiz } = await buildCourse({ accessTier: "PREMIUM" });
    const user = await createUser();
    await enroll(user.id, course.id); // enrolled but no subscription or purchase
    for (const lesson of lessons) await db.progress.create({ data: { userId: user.id, lessonId: lesson.id, completed: true, completedAt: new Date() } });
    for (const q of [quiz]) await db.quizResult.create({ data: { userId: user.id, quizId: q.id, score: 2, total: 2, percentage: 100 } });

    const outcome = await completeCourseIfDone(user.id, course.id);
    expect(outcome).toMatchObject({ isComplete: true, certificate: null, justIssued: false });

    // access comes back: the next completion check issues it
    await createSubscription(user.id);
    const later = await completeCourseIfDone(user.id, course.id);
    expect(later).toMatchObject({ isComplete: true, justIssued: true });
    expect(later.certificate?.code).toBeTruthy();
  });

  it("keeps the best quiz score: a worse retake does not take the pass away", async () => {
    const { course, lessons, quiz } = await buildCourse();
    const user = await learner(course);
    for (const lesson of lessons) await complete(lesson.id);
    expect(await passQuiz(quiz, course.id, true)).toMatchObject({ passed: true });
    await db.quizAttempt.deleteMany({ where: { userId: user.id } });
    const worse = await passQuiz(quiz, course.id, false);
    expect(worse).toMatchObject({ success: true, percentage: 0, bestPercentage: 100 });
    expect((await db.quizResult.findUniqueOrThrow({ where: { userId_quizId: { userId: user.id, quizId: quiz.id } } })).percentage).toBe(100);
    expect(await db.certificate.count({ where: { userId: user.id } })).toBe(1);
  });
});

describe("the quiz tells about the waiting time before the first answer", () => {
  it("is free to start, then blocked right after a sitting", async () => {
    const { course, quiz } = await buildCourse();
    const user = await learner(course);
    expect(await getQuizStartBlock(user.id, quiz.id)).toBeNull();
    await passQuiz(quiz, course.id, true);
    expect(await getQuizStartBlock(user.id, quiz.id)).toMatch(/^Vous pourrez refaire ce quiz dans \d+ min\.$/);
  });
});

describe("the final exam", () => {
  it("refuses a forged or stale sitting, and a retake during the waiting time", async () => {
    const { course, exam } = await buildCourse({ exam: true });
    const user = await learner(course);

    const forged = await submitFinalExam({ examId: exam!.id, token: "123.forged", answers: [1, 0] });
    expect(forged).toEqual({ success: false, error: "Session d’examen invalide, recommencez" });

    const stale = signExamStart(user.id, exam!.id, Date.now() - 3 * 3600_000);
    expect(await submitFinalExam({ examId: exam!.id, token: stale, answers: [1, 0] })).toEqual({
      success: false,
      error: "Le temps imparti est écoulé",
    });

    const started = await startFinalExam({ courseId: course.id });
    if (!started.success) throw new Error("expected a sitting");
    expect(await submitFinalExam({ examId: exam!.id, token: started.token, answers: [1] })).toMatchObject({ success: false }); // wrong length
    const failed = await submitFinalExam({ examId: exam!.id, token: started.token, answers: [0, 1] });
    expect(failed).toMatchObject({ success: true, passed: false, percentage: 0 });
    expect(await db.certificate.count()).toBe(0);

    const retake = await startFinalExam({ courseId: course.id });
    expect(retake).toMatchObject({ success: false, error: expect.stringMatching(/^Vous pourrez repasser l’examen dans \d+ min$/) });

    // after the waiting time and a pass, the exam cannot be taken again
    await db.examResult.updateMany({ data: { completedAt: new Date(Date.now() - 3600_000) } });
    const again = await startFinalExam({ courseId: course.id });
    if (!again.success) throw new Error("expected a sitting after the waiting time");
    expect(await submitFinalExam({ examId: exam!.id, token: again.token, answers: [1, 0] })).toMatchObject({ passed: true });
    expect(await startFinalExam({ courseId: course.id })).toEqual({ success: false, error: "Vous avez déjà réussi cet examen" });
  });

  it("is closed to someone who is not enrolled", async () => {
    const { course } = await buildCourse({ exam: true });
    const stranger = await createUser();
    h.session = sessionFor(stranger.id);
    expect(await startFinalExam({ courseId: course.id })).toEqual({ success: false, error: "Accès refusé" });
  });
});

describe("who may open what", () => {
  it("lets a visitor of a premium course open the flagged lesson only", async () => {
    const { course, lessons } = await buildCourse({ accessTier: "PREMIUM", flaggedPreview: true });
    const visitor = await createUser();
    expect(await AccessService.canAccessLesson(visitor.id, lessons[0].id)).toBe(true);
    expect(await AccessService.canAccessLesson(visitor.id, lessons[1].id)).toBe(false);
    expect(await resolveLearnerAccess({ userId: visitor.id, course: { ...course, instructorId: null } })).toMatchObject({ mode: "preview" });
  });

  it("falls back to the first lesson in course order when none is flagged", async () => {
    const { course, lessons } = await buildCourse({ accessTier: "PREMIUM" });
    const visitor = await createUser();
    expect(await AccessService.canAccessLesson(visitor.id, lessons[0].id)).toBe(true);
    expect(await AccessService.canAccessLesson(visitor.id, lessons[2].id)).toBe(false);
    await db.course.update({ where: { id: course.id }, data: { previewEnabled: false } });
    expect(await AccessService.canAccessLesson(visitor.id, lessons[0].id)).toBe(false);
  });

  it("never opens a draft lesson or an unpublished course as a preview", async () => {
    const { course, lessons } = await buildCourse({ accessTier: "PREMIUM", flaggedPreview: true });
    const visitor = await createUser();
    await db.lesson.update({ where: { id: lessons[0].id }, data: { published: false } });
    expect(await AccessService.canAccessLesson(visitor.id, lessons[0].id)).toBe(false);
    await db.lesson.update({ where: { id: lessons[0].id }, data: { published: true } });
    await db.course.update({ where: { id: course.id }, data: { published: false } });
    expect(await AccessService.canAccessLesson(visitor.id, lessons[0].id)).toBe(false);
  });

  it("gives the author their draft course, read only, and an expired subscriber the reason", async () => {
    const { course } = await buildCourse({ accessTier: "PREMIUM" });
    const author = await createUser({ role: "INSTRUCTOR" });
    await db.course.update({ where: { id: course.id }, data: { instructorId: author.id, published: false } });
    const draft = { id: course.id, published: false, instructorId: author.id };
    expect(await resolveLearnerAccess({ userId: author.id, role: "INSTRUCTOR", course: draft })).toMatchObject({ mode: "staff" });
    const other = await createUser({ role: "INSTRUCTOR" });
    expect(await resolveLearnerAccess({ userId: other.id, role: "INSTRUCTOR", course: draft })).toMatchObject({ mode: "none", reason: "unpublished" });

    const expired = await createUser();
    await enroll(expired.id, course.id);
    const published = { ...draft, published: true };
    await db.course.update({ where: { id: course.id }, data: { published: true, previewEnabled: false } });
    expect(await resolveLearnerAccess({ userId: expired.id, course: published })).toMatchObject({ mode: "none", reason: "premium_locked" });
  });
});

describe("notes and questions from a lesson", () => {
  it("keeps notes to lessons the learner can open", async () => {
    const { course, lessons } = await buildCourse({ accessTier: "PREMIUM" });
    const stranger = await createUser();
    h.session = sessionFor(stranger.id);
    expect(await createNote({ lessonId: lessons[1].id, content: "x", timestamp: null })).toEqual({ error: "Accès refusé" });
    const member = await learner(course);
    await createSubscription(member.id);
    expect(await createNote({ lessonId: lessons[1].id, content: "à retenir", timestamp: 42 })).toMatchObject({ note: { timestamp: 42 } });
  });

  it("files a question under the lesson and the course topic, created once", async () => {
    const { course, lessons } = await buildCourse();
    const user = await learner(course);
    const first = await askLessonQuestion({ lessonId: lessons[0].id, title: "Pourquoi let ?", content: "Je ne comprends pas la différence avec var." });
    expect(first.success).toBe(true);
    await askLessonQuestion({ lessonId: lessons[1].id, title: "Une autre question", content: "Et les fermetures, comment ça marche ?" });
    expect(await db.topic.count({ where: { courseId: course.id } })).toBe(1);
    const stored = await db.discussion.findMany({ where: { authorId: user.id }, orderBy: { createdAt: "asc" } });
    expect(stored.map((d) => d.lessonId)).toEqual([lessons[0].id, lessons[1].id]);
    expect(stored[0].courseId).toBe(course.id);

    const tooShort = await askLessonQuestion({ lessonId: lessons[0].id, title: "Hm", content: "court" });
    expect(tooShort.success).toBe(false);

    const stranger = await createUser();
    h.session = sessionFor(stranger.id);
    expect(await askLessonQuestion({ lessonId: lessons[0].id, title: "Question valable", content: "Un texte assez long pour passer." })).toEqual({
      success: false,
      error: "Inscrivez-vous à la formation pour poser une question",
    });
  });
});

describe("what to learn next", () => {
  it("suggests the same subject first, never a course already followed or the current one", async () => {
    const current = await createCourse({ category: "JAVASCRIPT", level: "BEGINNER", title: "Courante" });
    const sameSubject = await createCourse({ category: "JAVASCRIPT", level: "INTERMEDIATE", title: "JS suite" });
    const other = await createCourse({ category: "CLOUD", level: "BEGINNER", title: "Cloud" });
    const followed = await createCourse({ category: "JAVASCRIPT", level: "INTERMEDIATE", title: "Déjà suivie" });
    await createCourse({ category: "JAVASCRIPT", published: false, title: "Brouillon" });
    const user = await createUser();
    await enroll(user.id, current.id);
    await enroll(user.id, followed.id);

    const suggestions = await suggestNextCourses(user.id, current.id);
    expect(suggestions.map((c) => c.id)).toEqual([sameSubject.id, other.id]);
  });
});
