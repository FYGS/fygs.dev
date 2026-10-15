import { describe, it, expect, vi, beforeEach } from "vitest";

const m = vi.hoisted(() => ({
  getSession: vi.fn(),
  checkCourseAccess: vi.fn(),
  questionFindFirst: vi.fn(),
  quizFindUnique: vi.fn(),
  resultUpsert: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: m.getSession } } }));
vi.mock("next/headers", () => ({ headers: vi.fn(() => Promise.resolve(new Headers())) }));
vi.mock("@/lib/access-service", () => ({
  AccessService: { checkCourseAccess: m.checkCourseAccess },
}));
vi.mock("@/lib/structured-logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));
vi.mock("@/lib/db", () => ({
  db: {
    quizQuestion: { findFirst: m.questionFindFirst },
    quiz: { findUnique: m.quizFindUnique },
    quizResult: { upsert: m.resultUpsert },
  },
}));

import { checkQuizAnswer, submitQuizAnswers } from "@/app/actions/quiz-actions";

const questions = [
  { id: "q1", options: ["a", "b", "c"], correct: 1, explanation: "because b" },
  { id: "q2", options: ["a", "b"], correct: 0, explanation: null },
  { id: "q3", options: ["a", "b", "c", "d"], correct: 3, explanation: "d it is" },
];
const quiz = { courseId: "course-1", questions };

beforeEach(() => {
  vi.clearAllMocks();
  m.getSession.mockResolvedValue({ user: { id: "user-1" } });
  m.checkCourseAccess.mockResolvedValue({ canAccessCourse: true });
  m.quizFindUnique.mockResolvedValue(quiz);
  m.resultUpsert.mockResolvedValue({});
});

describe("checkQuizAnswer", () => {
  const input = { quizId: "quiz-1", questionId: "q1", selectedOption: 1 };
  beforeEach(() => {
    m.questionFindFirst.mockResolvedValue({ ...questions[0], quiz: { courseId: "course-1" } });
  });

  it("rejects an anonymous caller without revealing anything", async () => {
    m.getSession.mockResolvedValue(null);
    expect(await checkQuizAnswer(input)).toEqual({ success: false, error: "Non authentifié" });
    expect(m.questionFindFirst).not.toHaveBeenCalled();
  });

  it("refuses a user who cannot access the course", async () => {
    m.checkCourseAccess.mockResolvedValue({ canAccessCourse: false });
    expect(await checkQuizAnswer(input)).toEqual({ success: false, error: "Accès refusé" });
  });

  it("looks the question up within the given quiz", async () => {
    await checkQuizAnswer(input);
    expect(m.questionFindFirst.mock.calls[0][0].where).toEqual({ id: "q1", quizId: "quiz-1" });
  });

  it("returns the correct option and explanation after a right answer", async () => {
    expect(await checkQuizAnswer(input)).toEqual({
      success: true,
      questionId: "q1",
      isCorrect: true,
      correctOption: 1,
      explanation: "because b",
    });
  });

  it("flags a wrong answer and still returns the right option", async () => {
    expect(await checkQuizAnswer({ ...input, selectedOption: 0 })).toMatchObject({
      success: true,
      isCorrect: false,
      correctOption: 1,
    });
  });

  it("rejects an option index outside the question's options", async () => {
    expect(await checkQuizAnswer({ ...input, selectedOption: 9 })).toEqual({
      success: false,
      error: "Réponse invalide",
    });
  });

  it("rejects malformed input", async () => {
    expect(await checkQuizAnswer({ ...input, selectedOption: -1 })).toMatchObject({ success: false });
    expect(await checkQuizAnswer({ ...input, selectedOption: 1.5 })).toMatchObject({ success: false });
  });

  it("answers 'Question invalide' for a question that is not in the quiz", async () => {
    m.questionFindFirst.mockResolvedValue(null);
    expect(await checkQuizAnswer(input)).toEqual({ success: false, error: "Question invalide" });
  });
});

describe("submitQuizAnswers", () => {
  const all = (picks: number[]) => ({
    quizId: "quiz-1",
    courseId: "course-1",
    answers: questions.map((q, i) => ({ questionId: q.id, selectedOption: picks[i] })),
  });

  it("rejects an anonymous caller", async () => {
    m.getSession.mockResolvedValue(null);
    expect(await submitQuizAnswers(all([1, 0, 3]))).toEqual({ success: false, error: "Non authentifié" });
    expect(m.resultUpsert).not.toHaveBeenCalled();
  });

  it("grades on the server: 3/3 stores 100%", async () => {
    const result = await submitQuizAnswers(all([1, 0, 3]));
    expect(result).toMatchObject({ success: true, score: 3, total: 3, percentage: 100 });
    expect(m.resultUpsert.mock.calls[0][0].create).toMatchObject({
      userId: "user-1",
      quizId: "quiz-1",
      score: 3,
      total: 3,
      percentage: 100,
    });
  });

  it("grades wrong answers as wrong, whatever the client claims", async () => {
    const result = await submitQuizAnswers(all([0, 1, 0]));
    expect(result).toMatchObject({ success: true, score: 0, percentage: 0 });
    expect(m.resultUpsert.mock.calls[0][0].update).toMatchObject({ score: 0, percentage: 0 });
  });

  it("rounds the percentage (2/3 -> 67)", async () => {
    expect(await submitQuizAnswers(all([1, 0, 0]))).toMatchObject({ score: 2, percentage: 67 });
  });

  it("returns a per-question review with the right options", async () => {
    const result = await submitQuizAnswers(all([1, 1, 3]));
    expect(result.success && result.review).toEqual([
      { questionId: "q1", isCorrect: true, correctOption: 1, explanation: "because b" },
      { questionId: "q2", isCorrect: false, correctOption: 0, explanation: "" },
      { questionId: "q3", isCorrect: true, correctOption: 3, explanation: "d it is" },
    ]);
  });

  it("cannot be handed a score: extra fields are ignored", async () => {
    const forged = { ...all([0, 1, 0]), score: 3, total: 3, percentage: 100 } as never;
    expect(await submitQuizAnswers(forged)).toMatchObject({ score: 0, percentage: 0 });
  });

  it("requires every question to be answered", async () => {
    const partial = { ...all([1, 0, 3]), answers: all([1, 0, 3]).answers.slice(0, 2) };
    expect(await submitQuizAnswers(partial)).toEqual({ success: false, error: "Quiz incomplet" });
    expect(m.resultUpsert).not.toHaveBeenCalled();
  });

  it("rejects duplicate answers to one question (cannot pad a score)", async () => {
    const dup = { ...all([1, 0, 3]), answers: [...all([1, 0, 3]).answers, { questionId: "q1", selectedOption: 1 }] };
    expect(await submitQuizAnswers(dup)).toEqual({ success: false, error: "Réponses invalides" });
  });

  it("rejects answers for questions that are not in the quiz", async () => {
    const foreign = { ...all([1, 0, 3]), answers: [{ questionId: "q1", selectedOption: 1 }, { questionId: "q2", selectedOption: 0 }, { questionId: "zzz", selectedOption: 3 }] };
    expect(await submitQuizAnswers(foreign)).toEqual({ success: false, error: "Quiz incomplet" });
  });

  it("rejects a courseId that does not match the quiz", async () => {
    expect(await submitQuizAnswers({ ...all([1, 0, 3]), courseId: "other" })).toEqual({
      success: false,
      error: "Quiz invalide",
    });
  });

  it("refuses a user who cannot access the course", async () => {
    m.checkCourseAccess.mockResolvedValue({ canAccessCourse: false });
    expect(await submitQuizAnswers(all([1, 0, 3]))).toEqual({ success: false, error: "Accès refusé" });
    expect(m.resultUpsert).not.toHaveBeenCalled();
  });

  it("refuses a quiz without questions", async () => {
    m.quizFindUnique.mockResolvedValue({ courseId: "course-1", questions: [] });
    expect(await submitQuizAnswers({ quizId: "quiz-1", courseId: "course-1", answers: [] })).toEqual({
      success: false,
      error: "Quiz incomplet",
    });
  });
});
