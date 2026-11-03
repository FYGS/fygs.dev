import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { resetDatabase } from "../../support/test-db";
import { createCourse, createUser, enroll, sessionFor } from "../../support/factories";
import { primeLessonForCompletion } from "../../support/progress-helpers";

const h = vi.hoisted(() => ({ session: null as { user: { id: string; role?: string } } | null }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn(async () => h.session) } } }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn(async () => ({ allowed: true })), enforceRateLimit: vi.fn(async () => null) }));
vi.mock("@/lib/email-service", () => ({
  emailService: { certificateEarnedEmail: () => ({ subject: "Certificat", html: "<p>ok</p>" }), sendEmail: vi.fn(async () => true) },
}));

import { checkQuizAnswer, submitQuizAnswers } from "@/app/actions/quiz-actions";
import { startFinalExam, submitFinalExam } from "@/app/actions/exam-actions";
import { CertificateService } from "@/lib/certificate-service";
import { completeCourseIfDone } from "@/lib/learning/completion";
import { findCertificateByCode } from "@/lib/learning/certificates";
import { signExamAttempt } from "@/lib/learning/exam-token";
import { getQuizStartBlock } from "@/lib/learning/quiz-status";
import { recordLessonProgress } from "@/lib/learning/lesson-progress";
import { rewardLessonCompleted } from "@/lib/learning/rewards";
import { updateStreak } from "@/lib/gamification";
import { withPurchaseLock } from "@/lib/payments/locks";

beforeEach(async () => {
  h.session = null;
  await resetDatabase(db);
});
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const ago = (ms: number) => new Date(Date.now() - ms);

const EXAM_QUESTIONS = [
  { question: "Q1", options: ["a", "b", "c"], correct: 1, explanation: "because b" },
  { question: "Q2", options: ["a", "b"], correct: 0, explanation: "because a" },
];
const RIGHT = [1, 0];
const WRONG = [0, 1];

async function courseWithExam(extra: { timeLimit?: number | null; published?: boolean } = {}) {
  const course = await createCourse();
  const exam = await db.finalExam.create({
    data: {
      courseId: course.id,
      title: "Examen final",
      passingScore: 70,
      timeLimit: extra.timeLimit === undefined ? 60 : extra.timeLimit,
      published: extra.published ?? true,
      questions: EXAM_QUESTIONS,
    },
  });
  const user = await createUser();
  await enroll(user.id, course.id);
  h.session = sessionFor(user.id);
  return { course, exam, user };
}

async function begin(courseId: string) {
  const started = await startFinalExam({ courseId });
  if (!started.success) throw new Error(`expected a sitting: ${started.error}`);
  return started;
}

/** Moves every sitting of the learner back in time, as if the waiting time had passed. */
const ageSittings = (userId: string, ms: number) =>
  db.$executeRaw`UPDATE "ExamAttempt" SET "submittedAt" = "submittedAt" - make_interval(secs => ${ms / 1000}),
    "startedAt" = "startedAt" - make_interval(secs => ${ms / 1000}) WHERE "userId" = ${userId}`;

describe("final exam: a sitting is one row, claimed once", () => {
  it("refuses the second submission of the same sitting, and a failed sitting reveals no answer", async () => {
    const { course, exam } = await courseWithExam();
    const started = await begin(course.id);

    const first = await submitFinalExam({ examId: exam.id, token: started.token, answers: WRONG });
    expect(first).toMatchObject({ success: true, passed: false, percentage: 0 });
    if (!first.success) return;
    expect(first.review.revealed).toBe(false);
    // nothing in what the browser receives says which option is right or why
    const wire = JSON.stringify(first);
    for (const secret of ["because", "correctOption", "explanation"]) expect(wire).not.toContain(secret);
    expect(first.review.items.map((i) => i.isCorrect)).toEqual([false, false]);
    expect(first.next).toMatchObject({ sittingsLeftToday: 2 });
    expect(first.next?.retryAt).toBeTruthy();

    // the same token, now with the right answers: refused
    const replay = await submitFinalExam({ examId: exam.id, token: started.token, answers: RIGHT });
    expect(replay).toEqual({ success: false, error: "Cette session d’examen a déjà été envoyée" });
    expect(await db.certificate.count()).toBe(0);
    expect((await db.examResult.findFirstOrThrow()).passed).toBe(false);
  });

  it("applies the waiting time to a new sitting, then reveals everything on a pass", async () => {
    const { course, exam, user } = await courseWithExam();
    const started = await begin(course.id);
    await submitFinalExam({ examId: exam.id, token: started.token, answers: WRONG });

    expect(await startFinalExam({ courseId: course.id })).toMatchObject({
      success: false,
      error: expect.stringMatching(/^Vous pourrez repasser l’examen dans \d+ min\.$/),
    });

    await ageSittings(user.id, 20 * MINUTE);
    const again = await begin(course.id);
    expect(again.token).not.toBe(started.token);
    const passed = await submitFinalExam({ examId: exam.id, token: again.token, answers: RIGHT });
    expect(passed).toMatchObject({ success: true, passed: true, percentage: 100 });
    if (!passed.success) return;
    expect(passed.review.revealed).toBe(true);
    expect(JSON.stringify(passed)).toContain("because b");
    expect(passed.course).toMatchObject({ isComplete: true, justIssued: true });

    expect(await startFinalExam({ courseId: course.id })).toEqual({ success: false, error: "Vous avez déjà réussi cet examen." });
  });

  it("grades exactly one of several parallel submissions of the same token", async () => {
    const { course, exam } = await courseWithExam();
    const started = await begin(course.id);
    const results = await Promise.all(
      Array.from({ length: 6 }, () => submitFinalExam({ examId: exam.id, token: started.token, answers: RIGHT })),
    );
    expect(results.filter((r) => r.success)).toHaveLength(1);
    expect(results.filter((r) => !r.success)).toHaveLength(5);
    expect(await db.examResult.count()).toBe(1);
    expect(await db.certificate.count()).toBe(1);
    const attempts = await db.examAttempt.findMany();
    expect(attempts).toHaveLength(1);
    expect(attempts[0]).toMatchObject({ passed: true });
  });

  it("opens one sitting for parallel starts, and gives the same sitting back on a reload", async () => {
    const { course } = await courseWithExam();
    const starts = await Promise.all(Array.from({ length: 5 }, () => startFinalExam({ courseId: course.id })));
    expect(starts.every((s) => s.success)).toBe(true);
    expect(await db.examAttempt.count()).toBe(1);
    const tokens = new Set(starts.flatMap((s) => (s.success ? [s.token] : [])));
    expect(tokens.size).toBe(1);
    const reload = await startFinalExam({ courseId: course.id });
    expect(reload).toMatchObject({ success: true, resumed: true });
  });

  it("takes the time limit from the sitting's own start, and closes a late one as failed", async () => {
    const { course, exam, user } = await courseWithExam({ timeLimit: 30 });
    const started = await begin(course.id);
    await db.examAttempt.updateMany({ where: { userId: user.id }, data: { startedAt: ago(3 * HOUR) } });
    expect(await submitFinalExam({ examId: exam.id, token: started.token, answers: RIGHT })).toEqual({
      success: false,
      error: "Le temps imparti est écoulé",
    });
    const attempt = await db.examAttempt.findFirstOrThrow();
    expect(attempt).toMatchObject({ passed: false });
    expect(attempt.submittedAt).not.toBeNull();
    expect(await db.certificate.count()).toBe(0);
    // dated at the end of its window, long past: a new sitting may start
    expect(await startFinalExam({ courseId: course.id })).toMatchObject({ success: true, resumed: false });
  });

  it("counts a sitting left unsubmitted against the daily cap", async () => {
    const { course, exam, user } = await courseWithExam({ timeLimit: 30 });
    // three sittings in the last day, the last one long enough ago for the waiting time to be over
    await db.examAttempt.createMany({
      data: [
        { userId: user.id, examId: exam.id, startedAt: ago(10 * HOUR), submittedAt: ago(10 * HOUR - 5 * MINUTE), passed: false },
        { userId: user.id, examId: exam.id, startedAt: ago(6 * HOUR), submittedAt: ago(6 * HOUR - 5 * MINUTE), passed: false },
        { userId: user.id, examId: exam.id, startedAt: ago(3 * HOUR) }, // never submitted
      ],
    });
    expect(await startFinalExam({ courseId: course.id })).toMatchObject({
      success: false,
      error: expect.stringMatching(/^Limite de 3 passages par jour atteinte : réessayez dans (\d+ h|\d+ min)/),
    });
  });

  it("refuses an unpublished exam, for a start and for a submission", async () => {
    const { course, exam } = await courseWithExam();
    const started = await begin(course.id);

    await db.finalExam.update({ where: { id: exam.id }, data: { published: false } });
    expect(await startFinalExam({ courseId: course.id })).toEqual({ success: false, error: "Cet examen n’est pas disponible" });
    expect(await submitFinalExam({ examId: exam.id, token: started.token, answers: RIGHT })).toEqual({
      success: false,
      error: "Cet examen n’est pas disponible",
    });
    expect(await db.certificate.count()).toBe(0);
  });

  it("FR-041: a learner of a withdrawn course keeps sitting its published exam", async () => {
    const { course, exam } = await courseWithExam();
    const started = await begin(course.id);
    await db.course.update({ where: { id: course.id }, data: { published: false } });
    const result = await submitFinalExam({ examId: exam.id, token: started.token, answers: RIGHT });
    expect(result).toMatchObject({ success: true });
  });

  it("binds the token to the learner, the exam and the signature", async () => {
    const { course, exam, user } = await courseWithExam();
    const started = await begin(course.id);

    const other = await createUser();
    await enroll(other.id, course.id);
    h.session = sessionFor(other.id);
    expect(await submitFinalExam({ examId: exam.id, token: started.token, answers: RIGHT })).toEqual({
      success: false,
      error: "Session d’examen invalide, recommencez",
    });

    h.session = sessionFor(user.id);
    const [attemptId] = started.token.split(".");
    expect(await submitFinalExam({ examId: exam.id, token: `${attemptId}.forged`, answers: RIGHT })).toMatchObject({ success: false });
    expect(await submitFinalExam({ examId: exam.id, token: "nonsense", answers: RIGHT })).toMatchObject({ success: false });
    // a correctly signed token for a sitting that belongs to someone else
    const theirs = await db.examAttempt.create({ data: { userId: other.id, examId: exam.id } });
    expect(await submitFinalExam({ examId: exam.id, token: signExamAttempt(user.id, exam.id, theirs.id), answers: RIGHT })).toEqual({
      success: false,
      error: "Session d’examen invalide, recommencez",
    });
    expect((await db.examAttempt.findUniqueOrThrow({ where: { id: theirs.id } })).submittedAt).toBeNull();
  });

  it("lets the author try their own exam with the full correction and stores nothing", async () => {
    const { course, exam } = await courseWithExam();
    const author = await createUser({ role: "INSTRUCTOR" });
    await db.course.update({ where: { id: course.id }, data: { instructorId: author.id } });
    h.session = sessionFor(author.id);

    const started = await begin(course.id);
    const result = await submitFinalExam({ examId: exam.id, token: started.token, answers: WRONG });
    expect(result).toMatchObject({ success: true, passed: false });
    if (!result.success) return;
    expect(result.review.revealed).toBe(true);
    expect(await db.examAttempt.count()).toBe(0);
    expect(await db.examResult.count()).toBe(0);

    // a learner cannot use the author's try-out token, nor an author token a learner's sitting
    const learner = await createUser();
    await enroll(learner.id, course.id);
    h.session = sessionFor(learner.id);
    expect(await submitFinalExam({ examId: exam.id, token: started.token, answers: RIGHT })).toMatchObject({ success: false });
  });
});

/** A course with two questions in one quiz. */
async function courseWithQuiz() {
  const course = await createCourse();
  const mod = await db.module.create({ data: { courseId: course.id, title: "M", slug: "m", order: 1 } });
  const quiz = await db.quiz.create({
    data: {
      courseId: course.id,
      moduleId: mod.id,
      title: "Quiz",
      questions: { create: [0, 1].map((order) => ({ question: `Q${order}`, options: ["A", "B", "C"], correct: order, explanation: `e${order}`, order })) },
    },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  const user = await createUser();
  await enroll(user.id, course.id);
  h.session = sessionFor(user.id);
  return { course, quiz, user };
}

describe("quiz sittings count from the moment they start", () => {
  it("opens one sitting for parallel first answers", async () => {
    const { quiz } = await courseWithQuiz();
    const calls = Array.from({ length: 12 }, (_, i) =>
      checkQuizAnswer({ quizId: quiz.id, questionId: quiz.questions[i % 2].id, selectedOption: i % 3 }),
    );
    const results = await Promise.all(calls);
    expect(results.every((r) => r.success)).toBe(true);
    expect(await db.quizAttempt.count()).toBe(1);
    expect(await db.quizAttemptAnswer.count()).toBe(2);
  });

  it("reports the recorded answer, not the one this request sent, when a parallel request won", async () => {
    const { quiz } = await courseWithQuiz();
    const question = quiz.questions[0];
    const results = await Promise.all([0, 1, 2, 0, 1, 2].map((selectedOption) => checkQuizAnswer({ quizId: quiz.id, questionId: question.id, selectedOption })));
    const recorded = await db.quizAttemptAnswer.findFirstOrThrow({ where: { questionId: question.id } });
    for (const result of results) {
      expect(result).toMatchObject({ success: true, selectedOption: recorded.selectedOption });
      if (result.success) expect(result.isCorrect).toBe(recorded.selectedOption === question.correct);
    }
    expect(await db.quizAttemptAnswer.count({ where: { questionId: question.id } })).toBe(1);
  });

  it("counts sittings left unsubmitted: five of them in a day block the sixth", async () => {
    const { quiz, user } = await courseWithQuiz();
    await db.quizAttempt.createMany({
      data: [20, 17, 14, 11, 8].map((hours) => ({ userId: user.id, quizId: quiz.id, startedAt: ago(hours * HOUR) })),
    });
    expect(await getQuizStartBlock(user.id, quiz.id)).toMatch(/^Limite de 5 tentatives par jour atteinte, réessayez dans /);
    expect(await checkQuizAnswer({ quizId: quiz.id, questionId: quiz.questions[0].id, selectedOption: 0 })).toMatchObject({
      success: false,
      error: expect.stringMatching(/^Limite de 5 tentatives par jour atteinte/),
    });
    expect(await db.quizAttempt.count()).toBe(5);
  });

  it("starts from the abandoned sitting's start for the waiting time", async () => {
    const { quiz, user } = await courseWithQuiz();
    // an open sitting past its lifetime started 2 h 10 min ago, long enough ago for the 5 minute wait to be over
    await db.quizAttempt.create({ data: { userId: user.id, quizId: quiz.id, startedAt: ago(2 * HOUR + 10 * MINUTE) } });
    expect(await getQuizStartBlock(user.id, quiz.id)).toBeNull();
    expect(await checkQuizAnswer({ quizId: quiz.id, questionId: quiz.questions[0].id, selectedOption: 0 })).toMatchObject({ success: true });
    expect(await db.quizAttempt.count()).toBe(2);
  });

  it("FR-041: a learner of a withdrawn course keeps answering its quizzes", async () => {
    const { course, quiz } = await courseWithQuiz();
    await db.course.update({ where: { id: course.id }, data: { published: false } });
    expect(await checkQuizAnswer({ quizId: quiz.id, questionId: quiz.questions[0].id, selectedOption: 0 })).toMatchObject({ success: true });
    expect(
      await submitQuizAnswers({
        quizId: quiz.id,
        courseId: course.id,
        answers: quiz.questions.map((q) => ({ questionId: q.id, selectedOption: 0 })),
      }),
    ).toMatchObject({ success: true });
  });

  it("a learner who does not hold the course still cannot answer its quizzes", async () => {
    const { course, quiz } = await courseWithQuiz();
    await db.enrollment.deleteMany({ where: { courseId: course.id } });
    await db.course.update({ where: { id: course.id }, data: { published: false } });
    expect(await checkQuizAnswer({ quizId: quiz.id, questionId: quiz.questions[0].id, selectedOption: 0 })).toMatchObject({ success: false });
    expect(await db.quizAttempt.count()).toBe(0);
  });
});

/** A course with one video lesson of 120 s and one text lesson. */
async function courseWithLessons() {
  const course = await createCourse();
  const video = await db.lesson.create({
    data: { courseId: course.id, title: "Vidéo", slug: "video", order: 1, published: true, duration: 120, videoUrl: "https://cdn.test/v.mp4" },
  });
  const text = await db.lesson.create({ data: { courseId: course.id, title: "Texte", slug: "texte", order: 2, published: true } });
  const user = await createUser();
  await enroll(user.id, course.id);
  return { course, video, text, viewer: { id: user.id } };
}

describe("a lesson is completed by time spent, at a human pace", () => {
  it("refuses completion without the time, and tells how much is missing", async () => {
    const { video, viewer } = await courseWithLessons();
    const refused = await recordLessonProgress(viewer, { lessonId: video.id, completed: true });
    expect(refused).toMatchObject({ success: false, error: "WATCH_MORE", remainingSeconds: 96 });
    expect(refused.refusal).toMatch(/^Prenez encore/);
    expect((await db.progress.findFirstOrThrow()).completed).toBe(false);
  });

  it("asks for 80 % of a video, and a short dwell time for text", async () => {
    const { video, text, viewer } = await courseWithLessons();
    await db.progress.create({ data: { userId: viewer.id, lessonId: video.id, watchTime: 95 } });
    expect(await recordLessonProgress(viewer, { lessonId: video.id, completed: true })).toMatchObject({ success: false, error: "WATCH_MORE", remainingSeconds: 1 });
    await db.progress.update({ where: { userId_lessonId: { userId: viewer.id, lessonId: video.id } }, data: { watchTime: 96 } });
    expect(await recordLessonProgress(viewer, { lessonId: video.id, completed: true })).toMatchObject({ success: true });

    await db.progress.create({ data: { userId: viewer.id, lessonId: text.id, watchTime: 19 } });
    await db.$executeRaw`UPDATE "Progress" SET "completedAt" = "completedAt" - interval '5 minutes' WHERE "completed" = true`;
    expect(await recordLessonProgress(viewer, { lessonId: text.id, completed: true })).toMatchObject({ success: false, error: "WATCH_MORE", remainingSeconds: 1 });
    await db.progress.update({ where: { userId_lessonId: { userId: viewer.id, lessonId: text.id } }, data: { watchTime: 20 } });
    expect(await recordLessonProgress(viewer, { lessonId: text.id, completed: true })).toMatchObject({ success: true });
  });

  it("credits time no faster than it passes", async () => {
    const { video, viewer } = await courseWithLessons();
    // first report: at most two minutes, whatever is claimed
    const first = await recordLessonProgress(viewer, { lessonId: video.id, watchTimeDelta: 7200 });
    expect(first.progress?.watchTime).toBe(120);
    // a report right after the first one adds seconds, not hours
    const second = await recordLessonProgress(viewer, { lessonId: video.id, watchTimeDelta: 7200 });
    expect(second.progress?.watchTime).toBeLessThanOrEqual(120 + 12);
  });

  it("keeps two completions of the same learner 20 seconds apart", async () => {
    const { video, text, viewer } = await courseWithLessons();
    await primeLessonForCompletion(viewer.id, video.id);
    await primeLessonForCompletion(viewer.id, text.id);
    expect(await recordLessonProgress(viewer, { lessonId: video.id, completed: true })).toMatchObject({ success: true });
    const tooFast = await recordLessonProgress(viewer, { lessonId: text.id, completed: true });
    expect(tooFast).toMatchObject({ success: false, error: "TOO_FAST" });
    expect(tooFast.remainingSeconds).toBeGreaterThan(0);
    expect(await recordLessonProgress(viewer, { lessonId: text.id, completed: true }, { now: new Date(Date.now() + 25_000) })).toMatchObject({ success: true });
  });

  it("stops at 200 completions a day", async () => {
    const { course, text, viewer } = await courseWithLessons();
    const filler = await Promise.all(
      Array.from({ length: 200 }, (_, i) =>
        db.lesson.create({ data: { courseId: course.id, title: `F${i}`, slug: `f${i}`, order: 100 + i, published: true } }),
      ),
    );
    await db.progress.createMany({
      data: filler.map((lesson, i) => ({ userId: viewer.id, lessonId: lesson.id, completed: true, watchTime: 60, completedAt: ago((i + 1) * MINUTE) })),
    });
    await db.progress.create({ data: { userId: viewer.id, lessonId: text.id, watchTime: 60 } });
    expect(await recordLessonProgress(viewer, { lessonId: text.id, completed: true })).toMatchObject({ success: false, error: "DAILY_LIMIT" });
  });

  it("changes the completed state once under parallel requests, and rewards it once", async () => {
    const { text, viewer } = await courseWithLessons();
    await primeLessonForCompletion(viewer.id, text.id);
    const results = await Promise.all(Array.from({ length: 10 }, () => recordLessonProgress(viewer, { lessonId: text.id, completed: true })));
    expect(results.every((r) => r.success)).toBe(true);
    expect(results.filter((r) => r.reward)).toHaveLength(1);
    expect(await db.xpEvent.count({ where: { userId: viewer.id, reason: "LESSON_COMPLETED" } })).toBe(1);
  });

  it("records nothing on an unpublished course or lesson", async () => {
    const { course, text, viewer } = await courseWithLessons();
    await db.course.update({ where: { id: course.id }, data: { published: false } });
    expect(await recordLessonProgress(viewer, { lessonId: text.id, watchTimeDelta: 30 })).toMatchObject({ success: false, error: "LESSON_NOT_PUBLISHED" });
    expect(await db.progress.count()).toBe(0);
  });
});

describe("XP and streaks are given once, in parallel too", () => {
  it("awards a lesson, the first lesson and the points once for twenty simultaneous calls", async () => {
    const { text, viewer } = await courseWithLessons();
    await db.progress.create({ data: { userId: viewer.id, lessonId: text.id, completed: true, completedAt: new Date() } });
    const rewards = await Promise.all(Array.from({ length: 20 }, () => rewardLessonCompleted(viewer.id, text.id)));
    expect(rewards.filter((r) => r !== null)).toHaveLength(1);
    expect(await db.xpEvent.count({ where: { userId: viewer.id, reason: "LESSON_COMPLETED" } })).toBe(1);
    expect(await db.xpEvent.count({ where: { userId: viewer.id, reason: "FIRST_LESSON" } })).toBe(1);
    expect((await db.user.findUniqueOrThrow({ where: { id: viewer.id } })).communityPoints).toBe(30);
  });

  it("extends a streak once a day whatever the number of parallel activities", async () => {
    const { viewer } = await courseWithLessons();
    // noon yesterday, whatever the time of the day the test runs
    const noonYesterday = new Date(new Date().setHours(0, 0, 0, 0) - 12 * HOUR);
    await db.userStreak.create({ data: { userId: viewer.id, currentStreak: 6, longestStreak: 6, lastActivityAt: noonYesterday } });
    const results = await Promise.all(Array.from({ length: 15 }, () => updateStreak(viewer.id)));
    expect(results.filter((r) => r.isNewDay)).toHaveLength(1);
    expect((await db.userStreak.findUniqueOrThrow({ where: { userId: viewer.id } })).currentStreak).toBe(7);
    // the 7-day bonus is paid once
    expect(await db.xpEvent.count({ where: { userId: viewer.id, reason: "STREAK_BONUS" } })).toBe(1);
  });
});

describe("certificates", () => {
  async function finishedCourse() {
    const course = await createCourse();
    const lesson = await db.lesson.create({ data: { courseId: course.id, title: "L", slug: "l", order: 1, published: true } });
    const user = await createUser({ name: "Alice Martin" });
    await enroll(user.id, course.id);
    await db.progress.create({ data: { userId: user.id, lessonId: lesson.id, completed: true, completedAt: new Date() } });
    return { course, user };
  }

  it("prints the name as it was at issue time, cleaned, and keeps it after a rename", async () => {
    const { course, user } = await finishedCourse();
    await db.user.update({ where: { id: user.id }, data: { name: "Ali\u202Ece\u200B  Martin" } });
    const outcome = await completeCourseIfDone(user.id, course.id);
    const code = outcome.certificate!.code;
    expect(code).toMatch(/^[a-f0-9]{32}$/);
    expect((await db.certificate.findUniqueOrThrow({ where: { code } })).holderName).toBe("Alice Martin");

    await db.user.update({ where: { id: user.id }, data: { name: "Quelqu'un d'autre" } });
    expect((await findCertificateByCode(code))?.holderName).toBe("Alice Martin");
  });

  it("follows the account's cleaned name for a certificate issued before names were kept", async () => {
    const { course, user } = await finishedCourse();
    const outcome = await completeCourseIfDone(user.id, course.id);
    await db.certificate.update({ where: { code: outcome.certificate!.code }, data: { holderName: null } });
    await db.user.update({ where: { id: user.id }, data: { name: "Bob\u200B\u202E Durand" } });
    expect((await findCertificateByCode(outcome.certificate!.code))?.holderName).toBe("Bob Durand");
  });

  it("is not issued once a refund has closed the access, and waits for a refund that holds the lock", async () => {
    const course = await createCourse({ accessTier: "PREMIUM", price: 49 });
    const lesson = await db.lesson.create({ data: { courseId: course.id, title: "L", slug: "l", order: 1, published: true } });
    const user = await createUser();
    await enroll(user.id, course.id);
    await db.payment.create({ data: { userId: user.id, courseId: course.id, amount: 49, status: "COMPLETED", kind: "COURSE" } });
    await db.progress.create({ data: { userId: user.id, lessonId: lesson.id, completed: true, completedAt: new Date() } });

    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    // a refund in progress: it holds the purchase lock, and commits REFUNDED when it is done
    const refund = withPurchaseLock(user.id, course.id, async (tx) => {
      await gate;
      await tx.payment.updateMany({ where: { userId: user.id, courseId: course.id }, data: { status: "REFUNDED" } });
    });
    await new Promise((resolve) => setTimeout(resolve, 150));

    let settled = false;
    const issuing = CertificateService.issueCertificate({
      userId: user.id,
      courseId: course.id,
      completedLessons: 1,
      totalLessons: 1,
      completionPercentage: 100,
    }).then((result) => {
      settled = true;
      return result;
    });
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(settled).toBe(false); // issuance waits for the lock

    release();
    await refund;
    const result = await issuing;
    expect(result.success).toBe(false);
    expect(await db.certificate.count()).toBe(0);
  });
});
