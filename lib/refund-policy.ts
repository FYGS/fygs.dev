/**
 * Refund Policy Implementation
 *
 * Implements 14-day refund window using precise timestamp arithmetic
 * as defined in FR-006 and research decision documents.
 */

/**
 * Calculate refund eligibility based on subscription period start and cancellation timestamps
 *
 * @param subscriptionPeriodStart - The Stripe current_period_start timestamp
 * @param cancellationTimestamp - When the user initiated cancellation
 * @returns true if cancellation occurred within 14 days (14 * 24 * 60 * 60 * 1000 ms) of period start
 */
export function isRefundEligible(
  subscriptionPeriodStart: Date,
  cancellationTimestamp: Date
): boolean {
  // 14 days in milliseconds: 14 * 24 * 60 * 60 * 1000
  const REFUND_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

  const periodStartMs = subscriptionPeriodStart.getTime();
  const cancellationMs = cancellationTimestamp.getTime();
  const refundDeadlineMs = periodStartMs + REFUND_WINDOW_MS;

  return cancellationMs < refundDeadlineMs;
}

/**
 * Calculate the refund deadline for a given subscription period start
 *
 * @param subscriptionPeriodStart - The Stripe current_period_start timestamp
 * @returns The exact timestamp when refund eligibility expires
 */
export function getRefundDeadline(subscriptionPeriodStart: Date): Date {
  const REFUND_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
  return new Date(subscriptionPeriodStart.getTime() + REFUND_WINDOW_MS);
}

/**
 * Get remaining time in refund window
 *
 * @param subscriptionPeriodStart - The Stripe current_period_start timestamp
 * @param currentTimestamp - Current time (defaults to now)
 * @returns Milliseconds remaining in refund window, or 0 if expired
 */
export function getRefundWindowRemaining(
  subscriptionPeriodStart: Date,
  currentTimestamp: Date = new Date()
): number {
  const deadline = getRefundDeadline(subscriptionPeriodStart);
  const remaining = deadline.getTime() - currentTimestamp.getTime();
  return Math.max(0, remaining);
}
