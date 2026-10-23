import { db } from "@/lib/db";
import {
  QUIZ_MAX_ATTEMPTS_PER_DAY,
  canStartQuizAttempt,
  formatRetryDelay,
  quizAttemptExpiry,
  quizDayStart,
} from "@/lib/quiz-attempt-policy";

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
