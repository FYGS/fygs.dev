
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
/** Slack allowed on top of the time limit for latency and the page being slow to submit. */
export const EXAM_GRACE_SECONDS = 60;

export type ExamRetakeDecision =
  | { allowed: true }
  | { allowed: false; reason: "PASSED" }
  | { allowed: false; reason: "COOLDOWN"; retryAt: Date };

/** Whether a new sitting may start, from the last recorded one (`null` when never sat). */
export function examRetakeDecision(
  last: { completedAt: Date; passed: boolean } | null,
  now: Date,
): ExamRetakeDecision {
  if (!last) return { allowed: true };
  if (last.passed) return { allowed: false, reason: "PASSED" };
  const retryAt = new Date(last.completedAt.getTime() + EXAM_RETAKE_COOLDOWN_MINUTES * 60_000);
  return retryAt.getTime() > now.getTime() ? { allowed: false, reason: "COOLDOWN", retryAt } : { allowed: true };
}

/** Whether a sitting started at `startedAt` may still be submitted at `now` (no limit: always). */
export function withinTimeLimit(startedAt: number, now: number, timeLimitMinutes: number | null): boolean {
  if (!timeLimitMinutes) return true;
  return now - startedAt <= timeLimitMinutes * 60_000 + EXAM_GRACE_SECONDS * 1000;
}
