/**
 * How often a learner may sit the same quiz. The quiz shows the right answer after each
 * question, so an unlimited retake is a way to read the answers and then score 100%.
 * Pure rules, used by app/actions/quiz-actions.ts (a "use server" file cannot export constants).
 */

/** Time to wait between the end of one sitting and the start of the next */
export const QUIZ_COOLDOWN_MINUTES = 5;
/** Sittings of the same quiz allowed in any 24 hours */
export const QUIZ_MAX_ATTEMPTS_PER_DAY = 5;
/** A sitting left unfinished this long is abandoned; the next answer starts a new one */
export const QUIZ_ATTEMPT_TTL_HOURS = 2;

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

export const quizAttemptExpiry = (now: Date) => new Date(now.getTime() - QUIZ_ATTEMPT_TTL_HOURS * HOUR_MS);
export const quizDayStart = (now: Date) => new Date(now.getTime() - 24 * HOUR_MS);

/**
 * The moments to count a learner's sittings from, for the cooldown and the daily cap: a submitted sitting counts from
 * the time it was submitted, a sitting left unsubmitted until it expired counts from the time it started. A sitting that
 * is still open is not counted: it is the one being continued. Counting abandoned sittings is what stops "answer
 * everything, read the corrections, never submit" from being a way around the limits.
 */
export function sittingEndTimes(
  attempts: { startedAt: Date; submittedAt: Date | null }[],
  now: Date,
): Date[] {
  const expiry = quizAttemptExpiry(now).getTime();
  return attempts.flatMap((attempt) => {
    if (attempt.submittedAt) return [attempt.submittedAt];
    return attempt.startedAt.getTime() <= expiry ? [attempt.startedAt] : [];
  });
}

export type QuizAttemptDecision =
  | { allowed: true }
  | { allowed: false; reason: "COOLDOWN" | "DAILY_LIMIT"; retryAt: Date };

/**
 * Whether a NEW sitting may start now.
 * `submittedAt` are the end times of the learner's sittings of this quiz in the last 24 hours.
 */
export function canStartQuizAttempt(submittedAt: Date[], now: Date): QuizAttemptDecision {
  const recent = submittedAt.filter((date) => now.getTime() - date.getTime() < 24 * HOUR_MS);
  if (recent.length === 0) return { allowed: true };

  const last = new Date(Math.max(...recent.map((date) => date.getTime())));
  const cooldownEnd = new Date(last.getTime() + QUIZ_COOLDOWN_MINUTES * MINUTE_MS);
  if (cooldownEnd.getTime() > now.getTime()) return { allowed: false, reason: "COOLDOWN", retryAt: cooldownEnd };

  if (recent.length >= QUIZ_MAX_ATTEMPTS_PER_DAY) {
    const oldest = new Date(Math.min(...recent.map((date) => date.getTime())));
    return { allowed: false, reason: "DAILY_LIMIT", retryAt: new Date(oldest.getTime() + 24 * HOUR_MS) };
  }
  return { allowed: true };
}

/** "dans 3 min", "dans 2 h 10 min": what the learner is told */
export function formatRetryDelay(retryAt: Date, now: Date): string {
  const minutes = Math.max(1, Math.ceil((retryAt.getTime() - now.getTime()) / MINUTE_MS));
  if (minutes < 60) return `dans ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `dans ${hours} h` : `dans ${hours} h ${rest} min`;
}
