/**
 * When a lesson may be marked as completed. Completion used to be a bare claim of the browser: one call per lesson
 * completed a whole course in seconds, and a course without quiz or exam then issued its certificate on the spot. The
 * rules below make completion follow time really spent, using only what the server can verify. Pure functions: the
 * database side is in lesson-progress.ts.
 *
 * - Time spent ("watch time") is credited by the page while the lesson is open and visible: the video player counts
 *   played seconds, a lesson without a file video counts the time the page is shown. The server never credits more
 *   than the wall-clock time since the previous report of the same lesson (plus a little slack), so a request cannot
 *   claim an hour in one call.
 * - A lesson with a video of known duration needs 80 % of that duration; any other lesson needs a short dwell time.
 * - Two completions of the same learner are at least 20 seconds apart, and at most 200 happen in a day.
 */

/** Share of the announced duration that must have been watched to complete a lesson with a video. */
export const REQUIRED_WATCH_RATIO = 0.8;
/** Time on a lesson without video (or without a known duration) before it can be completed. */
export const MIN_DWELL_SECONDS = 20;
/** Minimum time between two completions of one learner: faster is not reading. */
export const MIN_SECONDS_BETWEEN_COMPLETIONS = 20;
export const MAX_COMPLETIONS_PER_DAY = 200;
/** Slack added to the elapsed time when crediting a report (network jitter, a timer firing late). */
export const REPORT_SLACK_SECONDS = 10;
/** What the very first report of a lesson may credit (no previous report to measure from). */
export const FIRST_REPORT_MAX_SECONDS = 120;

export function requiredWatchSeconds(lesson: { duration: number | null; videoUrl: string | null }): number {
  if (lesson.videoUrl && lesson.duration && lesson.duration > 0) {
    return Math.max(MIN_DWELL_SECONDS, Math.ceil(lesson.duration * REQUIRED_WATCH_RATIO));
  }
  return MIN_DWELL_SECONDS;
}

/**
 * Seconds a report may add: what the page claims, but not more than the time that has passed since the last report of
 * this lesson (`null` when there was none). Never negative, always whole.
 */
export function creditedSeconds(claimed: number, secondsSinceLastReport: number | null): number {
  const cap =
    secondsSinceLastReport === null
      ? FIRST_REPORT_MAX_SECONDS
      : Math.max(0, Math.floor(secondsSinceLastReport)) + REPORT_SLACK_SECONDS;
  return Math.max(0, Math.min(Math.floor(claimed), cap));
}

export type CompletionDecision =
  | { allowed: true }
  | { allowed: false; reason: "WATCH_MORE"; remainingSeconds: number }
  | { allowed: false; reason: "TOO_FAST"; remainingSeconds: number }
  | { allowed: false; reason: "DAILY_LIMIT" };

export function completionDecision(input: {
  watchTime: number;
  requiredSeconds: number;
  /** When the learner last completed ANY lesson (null if never). */
  lastCompletionAt: Date | null;
  completionsLast24h: number;
  now: Date;
}): CompletionDecision {
  const { watchTime, requiredSeconds, lastCompletionAt, completionsLast24h, now } = input;
  if (watchTime < requiredSeconds) {
    return { allowed: false, reason: "WATCH_MORE", remainingSeconds: Math.ceil(requiredSeconds - watchTime) };
  }
  if (lastCompletionAt) {
    const since = (now.getTime() - lastCompletionAt.getTime()) / 1000;
    if (since < MIN_SECONDS_BETWEEN_COMPLETIONS) {
      return { allowed: false, reason: "TOO_FAST", remainingSeconds: Math.ceil(MIN_SECONDS_BETWEEN_COMPLETIONS - since) };
    }
  }
  if (completionsLast24h >= MAX_COMPLETIONS_PER_DAY) return { allowed: false, reason: "DAILY_LIMIT" };
  return { allowed: true };
}

/** What the learner is told when completion is refused. */
export function completionRefusalMessage(decision: Exclude<CompletionDecision, { allowed: true }>): string {
  if (decision.reason === "WATCH_MORE") {
    const seconds = decision.remainingSeconds;
    const when = seconds >= 90 ? `environ ${Math.ceil(seconds / 60)} min` : `${seconds} s`;
    return `Prenez encore ${when} sur cette leçon avant de la marquer comme terminée.`;
  }
  if (decision.reason === "TOO_FAST") {
    return `Vous enchaînez les leçons très vite : réessayez dans ${decision.remainingSeconds} s.`;
  }
  return `Limite de ${MAX_COMPLETIONS_PER_DAY} leçons terminées par jour atteinte : réessayez demain.`;
}
