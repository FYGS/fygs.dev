import { describe, it, expect, vi, beforeEach } from "vitest";

const m = vi.hoisted(() => ({
  getSession: vi.fn(),
  checkCourseAccess: vi.fn(),
  questionFindFirst: vi.fn(),
  quizFindUnique: vi.fn(),
  resultUpsert: vi.fn(),
  attemptFindMany: vi.fn(),
  attemptFindFirst: vi.fn(),
  attemptCreate: vi.fn(),
  attemptUpdateMany: vi.fn(),
  answerCreateMany: vi.fn(),
  answerFindUnique: vi.fn(),
  recorded: { selectedOption: 0 },
  resultFindUnique: vi.fn(),
  completeCourse: vi.fn(),
  rewardQuiz: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/learning/completion", () => ({ completeCourseIfDone: m.completeCourse }));
vi.mock("@/lib/learning/rewards", () => ({ rewardQuizPassed: m.rewardQuiz }));
vi.mock("@/lib/learning/locks", () => ({ advisoryLock: vi.fn(async () => undefined) }));

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
    quizResult: { upsert: m.resultUpsert, findUnique: m.resultFindUnique },
    quizAttempt: { findMany: m.attemptFindMany, updateMany: m.attemptUpdateMany },
    quizAttemptAnswer: { createMany: m.answerCreateMany, findUnique: m.answerFindUnique },
    // the array form saves a result, the function form is the sitting opened under a lock
    $transaction: (arg: Promise<unknown>[] | ((tx: unknown) => Promise<unknown>)) =>
      typeof arg === "function"
        ? arg({ quizAttempt: { findFirst: m.attemptFindFirst, findMany: m.attemptFindMany, create: m.attemptCreate } })
        : Promise.all(arg),
  },
}));

import { checkQuizAnswer, submitQuizAnswers } from "@/app/actions/quiz-actions";

const questions = [
  { id: "q1", options: ["a", "b", "c"], correct: 1, explanation: "because b" },
  { id: "q2", options: ["a", "b"], correct: 0, explanation: null },
  { id: "q3", options: ["a", "b", "c", "d"], correct: 3, explanation: "d it is" },
];
const quiz = { courseId: "course-1", course: { slug: "course-one", published: true }, questions };

beforeEach(() => {
  vi.clearAllMocks();
  m.getSession.mockResolvedValue({ user: { id: "user-1" } });
  m.checkCourseAccess.mockResolvedValue({ canAccessCourse: true, recordsProgress: true });
  m.quizFindUnique.mockResolvedValue(quiz);
  m.resultUpsert.mockResolvedValue({});
  m.resultFindUnique.mockResolvedValue(null);
  m.rewardQuiz.mockResolvedValue(null);
  m.completeCourse.mockResolvedValue({
    progress: { percent: 50 },
    isComplete: false,
    certificate: null,
    justIssued: false,
  });
  // no sitting in progress and none finished: the first answer starts one
  m.attemptFindMany.mockResolvedValue([]);
  m.attemptFindFirst.mockResolvedValue(null);
  m.attemptCreate.mockResolvedValue({ id: "attempt-1" });
  m.attemptUpdateMany.mockResolvedValue({ count: 1 });
  // insert-if-absent, then read back what is recorded
  m.answerCreateMany.mockImplementation(async ({ data }: { data: { selectedOption: number }[] }) => {
    m.recorded = { selectedOption: data[0].selectedOption };
    return { count: 1 };
  });
  m.answerFindUnique.mockImplementation(async () => ({ selectedOption: m.recorded.selectedOption }));
});

const openAttempt = (answers: { questionId: string; selectedOption: number }[]) => ({
  id: "attempt-open",
  answers: answers.map((answer) => ({ ...answer, answeredAt: new Date("2026-10-20T10:00:00Z") })),
});
/**
 * The sittings of the learner: `open` are the ones in progress (read for the recorded answers, and the newest one is the
 * sitting a new answer joins), `finished` are the ones that count for the cooldown and the daily cap.
 */
const sittings = (open: { id: string }[], finished: unknown[] = []) => {
  m.attemptFindMany.mockImplementation(async (args: { where: { submittedAt?: unknown } }) =>
    args.where.submittedAt === null ? open : finished,
  );
  m.attemptFindFirst.mockResolvedValue(open.length > 0 ? { id: open[open.length - 1].id } : null);
};

describe("checkQuizAnswer", () => {
  const input = { quizId: "quiz-1", questionId: "q1", selectedOption: 1 };
  beforeEach(() => {
    m.questionFindFirst.mockResolvedValue({ ...questions[0], quiz: { courseId: "course-1", course: { published: true } } });
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
      selectedOption: 1,
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

describe("checkQuizAnswer: the first answer is final", () => {
  const input = { quizId: "quiz-1", questionId: "q1", selectedOption: 0 };
  beforeEach(() => {
    m.questionFindFirst.mockResolvedValue({ ...questions[0], quiz: { courseId: "course-1", course: { published: true } } });
  });

  it("starts a sitting and records the answer on it", async () => {
    await checkQuizAnswer(input);

    expect(m.attemptCreate).toHaveBeenCalledWith({
      data: { userId: "user-1", quizId: "quiz-1", startedAt: expect.any(Date) },
      select: { id: true },
    });
    expect(m.answerCreateMany).toHaveBeenCalledWith({
      data: [{ attemptId: "attempt-1", questionId: "q1", selectedOption: 0 }],
      skipDuplicates: true,
    });
  });

  it("answers about the recorded option when the same question is asked again", async () => {
    sittings([openAttempt([{ questionId: "q1", selectedOption: 0 }])]); // 0 was wrong, 1 is right

    const retry = await checkQuizAnswer({ ...input, selectedOption: 1 });

    expect(retry).toMatchObject({ success: true, isCorrect: false });
    expect(m.answerCreateMany).not.toHaveBeenCalled();
    expect(m.attemptCreate).not.toHaveBeenCalled();
  });

  it("probing every option of a question cannot turn a wrong answer into a right one", async () => {
    // first probe: option 2 (wrong) is recorded
    await checkQuizAnswer({ ...input, selectedOption: 2 });
    sittings([openAttempt([{ questionId: "q1", selectedOption: 2 }])]);

    for (const selectedOption of [0, 1, 2]) {
      expect(await checkQuizAnswer({ ...input, selectedOption })).toMatchObject({ isCorrect: false });
    }
  });

  it("adds a new question to the sitting already in progress", async () => {
    sittings([openAttempt([{ questionId: "q2", selectedOption: 0 }])]);

    await checkQuizAnswer(input);

    expect(m.attemptCreate).not.toHaveBeenCalled();
    expect(m.answerCreateMany.mock.calls[0][0].data).toEqual([{ attemptId: "attempt-open", questionId: "q1", selectedOption: 0 }]);
  });

  it("refuses to start a new sitting during the cooldown, without revealing the answer", async () => {
    sittings([], [{ submittedAt: new Date(Date.now() - 60_000) }]);

    const result = await checkQuizAnswer(input);

    expect(result).toMatchObject({ success: false });
    expect(result).not.toHaveProperty("correctOption");
    if (!result.success) expect(result.error).toMatch(/^Vous pourrez refaire ce quiz dans \d+ min$/);
    expect(m.attemptCreate).not.toHaveBeenCalled();
    expect(m.answerCreateMany).not.toHaveBeenCalled();
  });

  it("refuses a sixth sitting in 24 hours", async () => {
    const hour = 3_600_000;
    sittings([], [1, 2, 3, 4, 5].map((i) => ({ submittedAt: new Date(Date.now() - (i + 1) * hour) })));

    const result = await checkQuizAnswer(input);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/^Limite de 5 tentatives par jour atteinte, réessayez dans /);
  });

  it("reports the answer a parallel request recorded first, not the option this request sent", async () => {
    // the insert finds the question already answered (0, wrong): this request sent 1 (right)
    m.answerCreateMany.mockResolvedValue({ count: 0 });
    m.answerFindUnique.mockResolvedValue({ selectedOption: 0 });

    const result = await checkQuizAnswer({ ...input, selectedOption: 1 });

    expect(result).toMatchObject({ success: true, selectedOption: 0, isCorrect: false });
  });

  it("allows a new sitting once the cooldown has passed", async () => {
    sittings([], [{ submittedAt: new Date(Date.now() - 10 * 60_000) }]);

    expect(await checkQuizAnswer(input)).toMatchObject({ success: true });
    expect(m.attemptCreate).toHaveBeenCalled();
  });
});

describe("submitQuizAnswers: recorded answers win", () => {
  const all = (picks: Record<string, number>) => ({
    quizId: "quiz-1",
    courseId: "course-1",
    answers: Object.entries(picks).map(([questionId, selectedOption]) => ({ questionId, selectedOption })),
  });
  const rightAnswers = { q1: 1, q2: 0, q3: 3 };

  it("grades a question whose feedback was shown on the answer given then, not on what the browser sends", async () => {
    // the learner picked 0 on q1 (wrong), saw the feedback, then the browser claims 1 (right)
    sittings([openAttempt([{ questionId: "q1", selectedOption: 0 }])]);

    const result = await submitQuizAnswers(all(rightAnswers));

    expect(result).toMatchObject({ success: true, score: 2, total: 3, percentage: 67 });
    if (result.success) expect(result.review[0].isCorrect).toBe(false);
  });

  it("grades the questions that were never checked on the submitted answer", async () => {
    sittings([openAttempt([{ questionId: "q1", selectedOption: 1 }])]);

    expect(await submitQuizAnswers(all(rightAnswers))).toMatchObject({ success: true, score: 3 });
  });

  it("closes every sitting in progress together with saving the result", async () => {
    sittings([openAttempt([]), { ...openAttempt([]), id: "attempt-open-2" }]);

    await submitQuizAnswers(all(rightAnswers));

    expect(m.attemptUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: ["attempt-open", "attempt-open-2"] }, submittedAt: null },
      data: { submittedAt: expect.any(Date) },
    });
  });

  it("a parallel request that recorded another answer first: the earliest one counts", async () => {
    sittings([
      { id: "a", answers: [{ questionId: "q1", selectedOption: 0, answeredAt: new Date("2026-10-20T10:00:05Z") }] },
      { id: "b", answers: [{ questionId: "q1", selectedOption: 1, answeredAt: new Date("2026-10-20T10:00:01Z") }] },
    ]);

    const result = await submitQuizAnswers(all(rightAnswers));

    expect(result).toMatchObject({ success: true, score: 3 }); // b answered first: 1 is what was recorded
  });

  it("a submission without any feedback request is one sitting, subject to the cooldown", async () => {
    sittings([], [{ submittedAt: new Date(Date.now() - 30_000) }]);

    const result = await submitQuizAnswers(all(rightAnswers));

    expect(result.success).toBe(false);
    expect(m.resultUpsert).not.toHaveBeenCalled();
  });

  it("starts the sitting itself when none was open and the policy allows it", async () => {
    expect(await submitQuizAnswers(all(rightAnswers))).toMatchObject({ success: true, score: 3 });
    expect(m.attemptCreate).toHaveBeenCalledTimes(1);
    expect(m.attemptUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: ["attempt-1"] }, submittedAt: null },
      data: { submittedAt: expect.any(Date) },
    });
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
      { questionId: "q1", selectedOption: 1, isCorrect: true, correctOption: 1, explanation: "because b" },
      { questionId: "q2", selectedOption: 1, isCorrect: false, correctOption: 0, explanation: "" },
      { questionId: "q3", selectedOption: 3, isCorrect: true, correctOption: 3, explanation: "d it is" },
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
    m.quizFindUnique.mockResolvedValue({ courseId: "course-1", course: { slug: "course-one", published: true }, questions: [] });
    expect(await submitQuizAnswers({ quizId: "quiz-1", courseId: "course-1", answers: [] })).toEqual({
      success: false,
      error: "Quiz incomplet",
    });
  });
});
