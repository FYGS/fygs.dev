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
    expect(await checkQuizAnswer({ quizId: quiz.id, questionId: q.id, selectedOption: 0 }))
      .toMatchObject({ success: true, isCorrect: false, correctOption: 3 });
    expect(await checkQuizAnswer({ quizId: quiz.id, questionId: q.id, selectedOption: 9 }))
      .toEqual({ success: false, error: "Réponse invalide" });
    expect(await checkQuizAnswer({ quizId: quiz.id, questionId: "other", selectedOption: 0 }))
      .toEqual({ success: false, error: "Question invalide" });
  });
});
