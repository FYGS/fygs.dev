/**
 * Refund policy, the same for the subscription and for a course bought on its own: a refund can be asked for within
 * 14 days (FR-006). For a course, it must not be finished yet (no certificate issued): the course was followed to
 * its end, there is nothing left to give back. Exact timestamp arithmetic, no rounding to days.
 */

export const REFUND_WINDOW_DAYS = 14;
const REFUND_WINDOW_MS = REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000;

/**
 * Whether a refund asked at `requestedAt` is within the window that opened at `windowStart` (the subscription's
 * current period start, or the day a course was bought).
 */
export function isRefundEligible(windowStart: Date, requestedAt: Date): boolean {
  return requestedAt.getTime() < windowStart.getTime() + REFUND_WINDOW_MS;
}

/** The exact moment the refund window that opened at `windowStart` closes. */
export function getRefundDeadline(windowStart: Date): Date {
  return new Date(windowStart.getTime() + REFUND_WINDOW_MS);
}

export type CourseRefundRefusal = "WINDOW_EXPIRED" | "COURSE_COMPLETED" | "NOT_REFUNDABLE";

/** Whether a course purchase can still be refunded, and why not. */
export function courseRefundDecision(input: {
  purchasedAt: Date;
  amount: number;
  completed: boolean;
  now?: Date;
}): { refundable: true } | { refundable: false; reason: CourseRefundRefusal } {
  if (!(input.amount > 0)) return { refundable: false, reason: "NOT_REFUNDABLE" };
  if (!isRefundEligible(input.purchasedAt, input.now ?? new Date())) return { refundable: false, reason: "WINDOW_EXPIRED" };
  if (input.completed) return { refundable: false, reason: "COURSE_COMPLETED" };
  return { refundable: true };
}
