
/**
 * Final exam rules, kept pure so they can be tested without a database. The questions live in
 * `FinalExam.questions` (JSON); the right answers never leave the server before an attempt is graded.
 */

export interface ExamQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

/** The questions as stored, minus any malformed entry. */
export function parseExamQuestions(json: unknown): ExamQuestion[] {
  if (!Array.isArray(json)) return [];
  const questions: ExamQuestion[] = [];
  for (const raw of json) {
    if (!raw || typeof raw !== "object") continue;
    const q = raw as Record<string, unknown>;
    if (typeof q.question !== "string" || !Array.isArray(q.options)) continue;
    const options = q.options.filter((o): o is string => typeof o === "string");
    const correct = typeof q.correct === "number" ? q.correct : Number.NaN;
    if (options.length < 2 || !Number.isInteger(correct) || correct < 0 || correct >= options.length) continue;
    questions.push({
      question: q.question,
      options,
      correct,
      explanation: typeof q.explanation === "string" ? q.explanation : "",
    });
  }
  return questions;
}

export interface ExamReviewItem {
  index: number;
  isCorrect: boolean;
  selected: number | null;
  correctOption: number;
  explanation: string;
}

export interface ExamGrade {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  review: ExamReviewItem[];
}

/** `answers[i]` is the option chosen for question i, or null/-1 when left blank (counted wrong). */
export function gradeExam(
  questions: ExamQuestion[],
  answers: (number | null)[],
  passingScore: number,
): ExamGrade {
  const review = questions.map((q, index) => {
    const picked = answers[index];
    const selected = typeof picked === "number" && picked >= 0 && picked < q.options.length ? picked : null;
    return { index, isCorrect: selected === q.correct, selected, correctOption: q.correct, explanation: q.explanation };
  });
  const score = review.filter((r) => r.isCorrect).length;
  const total = questions.length;
  const percentage = total === 0 ? 0 : Math.round((score / total) * 100);
  return { score, total, percentage, passed: total > 0 && percentage >= passingScore, review };
}

/** Wait between a failed sitting and the next one. */
export const EXAM_RETAKE_COOLDOWN_MINUTES = 15;
/** Sittings graded in any 24 hours: each failed one tells the learner which questions were missed. */
export const EXAM_MAX_SITTINGS_PER_DAY = 3;
/** Slack allowed on top of the time limit for latency and the page being slow to submit. */
export const EXAM_GRACE_SECONDS = 60;
/** How long a sitting of an exam without time limit stays open before it counts as abandoned. */
export const EXAM_OPEN_SITTING_MAX_HOURS = 24;

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

/** How long a sitting can be submitted after it started (time limit plus grace, or the open-sitting maximum). */
export function examSittingWindowMs(timeLimitMinutes: number | null): number {
  return timeLimitMinutes ? timeLimitMinutes * MINUTE_MS + EXAM_GRACE_SECONDS * 1000 : EXAM_OPEN_SITTING_MAX_HOURS * HOUR_MS;
}

/** Whether a sitting started at `startedAt` may still be submitted at `now`. */
export function withinTimeLimit(startedAt: number, now: number, timeLimitMinutes: number | null): boolean {
  return now - startedAt <= examSittingWindowMs(timeLimitMinutes);
}

export type ExamSittingDecision =
  | { allowed: true }
  | { allowed: false; reason: "PASSED" }
  | { allowed: false; reason: "COOLDOWN" | "DAILY_LIMIT"; retryAt: Date };

/**
 * Whether a new sitting may start (and whether a submitted one may still be graded), from the history of the learner:
 * `passedBefore` is true once any sitting was passed, `recent` are the end times of the sittings graded in the last
 * 24 hours (abandoned ones included: a sitting that was started counts).
 */
export function examSittingDecision(
  history: { passedBefore: boolean; recent: Date[] },
  now: Date,
): ExamSittingDecision {
  if (history.passedBefore) return { allowed: false, reason: "PASSED" };
  const recent = history.recent.filter((date) => now.getTime() - date.getTime() < 24 * HOUR_MS);
  if (recent.length === 0) return { allowed: true };

  const last = new Date(Math.max(...recent.map((date) => date.getTime())));
  const cooldownEnd = new Date(last.getTime() + EXAM_RETAKE_COOLDOWN_MINUTES * MINUTE_MS);
  if (cooldownEnd.getTime() > now.getTime()) return { allowed: false, reason: "COOLDOWN", retryAt: cooldownEnd };

  if (recent.length >= EXAM_MAX_SITTINGS_PER_DAY) {
    const oldest = new Date(Math.min(...recent.map((date) => date.getTime())));
    return { allowed: false, reason: "DAILY_LIMIT", retryAt: new Date(oldest.getTime() + 24 * HOUR_MS) };
  }
  return { allowed: true };
}

/** What the learner is told when a sitting cannot start (the delay is formatted by the caller). */
export function examBlockMessage(decision: Exclude<ExamSittingDecision, { allowed: true }>, when: string): string {
  if (decision.reason === "PASSED") return "Vous avez déjà réussi cet examen.";
  if (decision.reason === "COOLDOWN") return `Vous pourrez repasser l’examen ${when}.`;
  return `Limite de ${EXAM_MAX_SITTINGS_PER_DAY} passages par jour atteinte : réessayez ${when}.`;
}

/** What the browser gets back for one question of a FAILED sitting: right or wrong, and its own answer. Nothing else. */
export interface ExamOutcomeItem {
  index: number;
  isCorrect: boolean;
  selected: number | null;
}

/**
 * The correction shown after grading. Passing reveals everything (right answers and explanations: the learner has
 * nothing left to gain from hiding them), and so does the author previewing their own exam. A failed sitting only says which questions were missed, so that failing
 * on purpose is not a way to read the answers before the next sitting.
 */
export type ExamReview =
  | { revealed: true; items: ExamReviewItem[] }
  | { revealed: false; items: ExamOutcomeItem[] };

export function projectReview(grade: ExamGrade, staff = false): ExamReview {
  if (staff || grade.passed) return { revealed: true, items: grade.review };
  return {
    revealed: false,
    items: grade.review.map(({ index, isCorrect, selected }) => ({ index, isCorrect, selected })),
  };
}
