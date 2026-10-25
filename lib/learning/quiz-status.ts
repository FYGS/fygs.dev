import { db } from "@/lib/db";
import {
  QUIZ_MAX_ATTEMPTS_PER_DAY,
  canStartQuizAttempt,
  formatRetryDelay,
  quizAttemptExpiry,
  quizDayStart,
} from "@/lib/quiz-attempt-policy";

/** An answer already given in the sitting in progress, with the correction the learner has already seen. */
export interface ResumedAnswer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  correctOption: number;
  explanation: string;
}

/**
 * The answers of the sitting the learner has started and not finished, oldest answer first for each
 * question (the one that counts, as in app/actions/quiz-actions.ts). The quiz page shows them again so the
 * learner continues where they stopped instead of answering questions whose answer is already final.
 */
export async function getResumedAnswers(userId: string, quizId: string, now = new Date()): Promise<ResumedAnswer[]> {
  const attempts = await db.quizAttempt.findMany({
    where: { userId, quizId, submittedAt: null, startedAt: { gt: quizAttemptExpiry(now) } },
    select: {
      answers: {
        orderBy: { answeredAt: "asc" },
        select: {
          questionId: true,
          selectedOption: true,
        },
      },
    },
  });
  const first = new Map<string, number>();
  for (const attempt of attempts) {
    for (const answer of attempt.answers) {
      if (!first.has(answer.questionId)) first.set(answer.questionId, answer.selectedOption);
    }
  }
  if (first.size === 0) return [];

  const questions = await db.quizQuestion.findMany({
    where: { quizId, id: { in: [...first.keys()] } },
    select: { id: true, correct: true, explanation: true },
  });
  return questions.map((q) => {
    const selectedOption = first.get(q.id)!;
    return {
      questionId: q.id,
      selectedOption,
      isCorrect: selectedOption === q.correct,
      correctOption: q.correct,
      explanation: q.explanation ?? "",
    };
  });
}

/**
 * Why the learner cannot start a new sitting of this quiz right now, in words, or null when they can.
 * Same rule as the server applies on the first answer (app/actions/quiz-actions.ts), asked up front
 * so the learner is told before answering, not after.
 */
export async function getQuizStartBlock(userId: string, quizId: string, now = new Date()): Promise<string | null> {
  const open = await db.quizAttempt.count({
    where: { userId, quizId, submittedAt: null, startedAt: { gt: quizAttemptExpiry(now) } },
  });
  if (open > 0) return null; // a sitting is in progress: the learner continues it

  const finished = await db.quizAttempt.findMany({
    where: { userId, quizId, submittedAt: { gt: quizDayStart(now) } },
    select: { submittedAt: true },
  });
  const decision = canStartQuizAttempt(
    finished.flatMap((a) => (a.submittedAt ? [a.submittedAt] : [])),
    now,
  );
  if (decision.allowed) return null;
  const when = formatRetryDelay(decision.retryAt, now);
  return decision.reason === "COOLDOWN"
    ? `Vous pourrez refaire ce quiz ${when}.`
    : `Limite de ${QUIZ_MAX_ATTEMPTS_PER_DAY} tentatives par jour atteinte, réessayez ${when}.`;
}
