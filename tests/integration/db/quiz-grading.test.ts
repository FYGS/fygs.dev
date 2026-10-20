import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { resetDatabase } from "../../support/test-db";
import { createCourse, createQuiz, createUser, enroll, sessionFor } from "../../support/factories";

const h = vi.hoisted(() => ({ session: null as { user: { id: string } } | null }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn(async () => h.session) } } }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn(async () => ({ allowed: true })) }));

import { checkQuizAnswer, submitQuizAnswers } from "@/app/actions/quiz-actions";

beforeEach(async () => {
  h.session = null;
  await resetDatabase(db);
});
afterAll(async () => {
  await resetDatabase(db); // leave an empty database for the suites that run next
  await db.$disconnect();
});

/** Moves the sittings of a user back in time, to get past the cooldown without waiting */
async function ageSittings(userId: string, ms: number) {
  const attempts = await db.quizAttempt.findMany({ where: { userId } });
  for (const attempt of attempts) {
    await db.quizAttempt.update({
      where: { id: attempt.id },
      data: {
        startedAt: new Date(attempt.startedAt.getTime() - ms),
        submittedAt: attempt.submittedAt ? new Date(attempt.submittedAt.getTime() - ms) : null,
      },
    });
  }
}

async function setup(correct = [1, 2, 0]) {
  const user = await createUser();
  const course = await createCourse();
  await enroll(user.id, course.id);
  const quiz = await createQuiz(course.id, correct);
  h.session = sessionFor(user.id);
  return { user, course, quiz };
}

describe("quiz grading (server-side, real database)", () => {
  it("grades a full attempt and stores one result per user and quiz", async () => {
    const { user, course, quiz } = await setup([1, 2, 0]);
    const [q0, q1, q2] = quiz.questions;

    const first = await submitQuizAnswers({
      quizId: quiz.id,
      courseId: course.id,
      answers: [
        { questionId: q0.id, selectedOption: 1 }, // right
        { questionId: q1.id, selectedOption: 0 }, // wrong
        { questionId: q2.id, selectedOption: 0 }, // right
      ],
    });
    expect(first).toMatchObject({ success: true, score: 2, total: 3, percentage: 67 });
    if (first.success) {
      expect(first.review.map((r) => r.isCorrect)).toEqual([true, false, true]);
      expect(first.review[1]).toMatchObject({ correctOption: 2, explanation: "Because 2" });
    }

    // too soon: the cooldown between two sittings applies
    const tooSoon = await submitQuizAnswers({
      quizId: quiz.id,
      courseId: course.id,
      answers: quiz.questions.map((q) => ({ questionId: q.id, selectedOption: 0 })),
    });
    expect(tooSoon.success).toBe(false);
    await ageSittings(user.id, 10 * 60_000);

    // a retake overwrites the previous result instead of adding a row
    const retake = await submitQuizAnswers({
      quizId: quiz.id,
      courseId: course.id,
      answers: [
        { questionId: q0.id, selectedOption: 1 },
        { questionId: q1.id, selectedOption: 2 },
        { questionId: q2.id, selectedOption: 0 },
      ],
    });
    expect(retake).toMatchObject({ success: true, score: 3, percentage: 100 });
    const rows = await db.quizResult.findMany({ where: { userId: user.id } });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ score: 3, total: 3, percentage: 100 });
  });

  it("refuses incomplete, duplicated, forged or foreign attempts and stores nothing", async () => {
    const { course, quiz } = await setup([1, 2, 0]);
    const [q0, q1] = quiz.questions;
    const other = await createCourse();

    const submit = (input: Parameters<typeof submitQuizAnswers>[0]) => submitQuizAnswers(input);

    expect(await submit({ quizId: quiz.id, courseId: course.id, answers: [{ questionId: q0.id, selectedOption: 1 }] }))
      .toEqual({ success: false, error: "Quiz incomplet" });
    expect(await submit({
      quizId: quiz.id, courseId: course.id,
      answers: [{ questionId: q0.id, selectedOption: 1 }, { questionId: q0.id, selectedOption: 1 }, { questionId: q1.id, selectedOption: 2 }],
    })).toEqual({ success: false, error: "Réponses invalides" });
    expect(await submit({ quizId: quiz.id, courseId: other.id, answers: [] }))
      .toEqual({ success: false, error: "Quiz invalide" });
    expect(await submit({ quizId: "nope", courseId: course.id, answers: [] }))
      .toEqual({ success: false, error: "Quiz invalide" });
    expect(await db.quizResult.count()).toBe(0);
  });

  it("denies a user who is not enrolled and an anonymous visitor", async () => {
    const { course, quiz } = await setup();
    const outsider = await createUser();
    const answers = quiz.questions.map((q) => ({ questionId: q.id, selectedOption: 0 }));

    h.session = sessionFor(outsider.id);
    expect(await submitQuizAnswers({ quizId: quiz.id, courseId: course.id, answers }))
      .toEqual({ success: false, error: "Accès refusé" });
    expect(await checkQuizAnswer({ quizId: quiz.id, questionId: quiz.questions[0].id, selectedOption: 0 }))
      .toEqual({ success: false, error: "Accès refusé" });

    h.session = null;
    expect(await submitQuizAnswers({ quizId: quiz.id, courseId: course.id, answers }))
      .toEqual({ success: false, error: "Non authentifié" });
    expect(await db.quizResult.count()).toBe(0);
  });

  it("checkQuizAnswer gives per-question feedback and rejects out-of-range options", async () => {
    const { quiz } = await setup([3, 1, 0]);
    const q = quiz.questions[0];

    expect(await checkQuizAnswer({ quizId: quiz.id, questionId: q.id, selectedOption: 3 }))
      .toMatchObject({ success: true, isCorrect: true, correctOption: 3, explanation: "Because 3" });
    // the first answer is final: asking again with another option still answers about the recorded one
    expect(await checkQuizAnswer({ quizId: quiz.id, questionId: q.id, selectedOption: 0 }))
      .toMatchObject({ success: true, isCorrect: true, correctOption: 3 });
    expect(await checkQuizAnswer({ quizId: quiz.id, questionId: q.id, selectedOption: 9 }))
      .toEqual({ success: false, error: "Réponse invalide" });
    expect(await checkQuizAnswer({ quizId: quiz.id, questionId: "other", selectedOption: 0 }))
      .toEqual({ success: false, error: "Question invalide" });
  });
});

describe("quiz sittings (anti-cheat, real database)", () => {
  const sitting = async (quizId: string, courseId: string, picks: number[], questionIds: string[]) => {
    for (const [i, questionId] of questionIds.entries()) {
      const r = await checkQuizAnswer({ quizId, questionId, selectedOption: picks[i] });
      if (!r.success) return r;
    }
    return submitQuizAnswers({
      quizId,
      courseId,
      answers: questionIds.map((questionId, i) => ({ questionId, selectedOption: picks[i] })),
    });
  };

  it("probing all options then submitting the right ones does not give a perfect score", async () => {
    const { user, course, quiz } = await setup([1, 2, 0]);
    const ids = quiz.questions.map((q) => q.id);

    // the cheater wants to learn the answers: asks option 0, then 1, 2, 3 for each question
    for (const questionId of ids) {
      for (const selectedOption of [0, 1, 2, 3]) await checkQuizAnswer({ quizId: quiz.id, questionId, selectedOption });
    }
    // and then submits what the feedback told them
    const result = await submitQuizAnswers({
      quizId: quiz.id,
      courseId: course.id,
      answers: [
        { questionId: ids[0], selectedOption: 1 },
        { questionId: ids[1], selectedOption: 2 },
        { questionId: ids[2], selectedOption: 0 },
      ],
    });

    // only the first option tried for each question counted: 0 -> right only for the last question
    expect(result).toMatchObject({ success: true, score: 1, total: 3 });
    expect(await db.quizAttemptAnswer.count()).toBe(3); // one recorded answer per question
    expect(await db.quizResult.findFirst({ where: { userId: user.id } })).toMatchObject({ score: 1 });
  });

  it("a second sitting is refused during the cooldown and allowed after it", async () => {
    const { user, course, quiz } = await setup([1, 2, 0]);
    const ids = quiz.questions.map((q) => q.id);

    expect(await sitting(quiz.id, course.id, [0, 0, 0], ids)).toMatchObject({ success: true, score: 1 });

    const blocked = await checkQuizAnswer({ quizId: quiz.id, questionId: ids[0], selectedOption: 1 });
    expect(blocked).toMatchObject({ success: false });
    expect(blocked).not.toHaveProperty("correctOption");
    expect(await db.quizAttempt.count({ where: { userId: user.id } })).toBe(1);

    await ageSittings(user.id, 6 * 60_000);
    expect(await sitting(quiz.id, course.id, [1, 2, 0], ids)).toMatchObject({ success: true, score: 3 });
  });

  it("allows 5 sittings in 24 hours, not 6", async () => {
    const { user, course, quiz } = await setup([1, 2, 0]);
    const ids = quiz.questions.map((q) => q.id);

    for (let i = 0; i < 5; i++) {
      expect(await sitting(quiz.id, course.id, [0, 0, 0], ids)).toMatchObject({ success: true });
      await ageSittings(user.id, 10 * 60_000);
    }
    const sixth = await sitting(quiz.id, course.id, [1, 2, 0], ids);

    expect(sixth.success).toBe(false);
    if (!sixth.success) expect(sixth.error).toMatch(/^Limite de 5 tentatives par jour/);
    expect(await db.quizResult.findFirst({ where: { userId: user.id } })).toMatchObject({ score: 1 });
  });

  it("an abandoned sitting does not lock the learner out: it expires after 2 hours", async () => {
    const { user, course, quiz } = await setup([1, 2, 0]);
    const ids = quiz.questions.map((q) => q.id);
    await checkQuizAnswer({ quizId: quiz.id, questionId: ids[0], selectedOption: 0 }); // wrong, then walks away
    await ageSittings(user.id, 3 * 3_600_000);

    // a fresh sitting: the old wrong answer is not carried over
    expect(await sitting(quiz.id, course.id, [1, 2, 0], ids)).toMatchObject({ success: true, score: 3 });
    expect(await db.quizAttempt.count({ where: { userId: user.id } })).toBe(2);
  });

  it("sittings of different users and different quizzes do not interfere", async () => {
    const { course, quiz } = await setup([1, 2, 0]);
    const other = await createUser();
    await enroll(other.id, course.id);
    const ids = quiz.questions.map((q) => q.id);
    expect(await sitting(quiz.id, course.id, [0, 0, 0], ids)).toMatchObject({ success: true });

    h.session = sessionFor(other.id);
    expect(await sitting(quiz.id, course.id, [1, 2, 0], ids)).toMatchObject({ success: true, score: 3 });
  });
});
