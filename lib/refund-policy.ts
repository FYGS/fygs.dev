/**
 * Refund Policy Implementation
 * 
 * Implements 15-day refund window using precise timestamp arithmetic
 * as defined in FR-006 and research decision documents.
 */

/**
 * Calculate refund eligibility based on subscription period start and cancellation timestamps
 * 
 * @param subscriptionPeriodStart - The Stripe current_period_start timestamp
 * @param cancellationTimestamp - When the user initiated cancellation
 * @returns true if cancellation occurred within 15 days (15 * 24 * 60 * 60 * 1000 ms) of period start
 */
export function isRefundEligible(
  subscriptionPeriodStart: Date,
  cancellationTimestamp: Date
): boolean {
  // 15 days in milliseconds: 15 * 24 * 60 * 60 * 1000
  const REFUND_WINDOW_MS = 15 * 24 * 60 * 60 * 1000;
  
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
  const REFUND_WINDOW_MS = 15 * 24 * 60 * 60 * 1000;
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

// Boundary tests colocated as per task requirements
// Note: These tests are intended for runtime via test framework
export const boundaryTests = {
  'exact 15-day boundary - eligible at 14 days 23:59:59': () => {
    const start = new Date('2024-01-01T00:00:00.000Z');
    const cancel = new Date('2024-01-15T23:59:59.999Z'); // 1ms before deadline
    return isRefundEligible(start, cancel) === true;
  },
  
  'exact 15-day boundary - ineligible at 15 days 00:00:00': () => {
    const start = new Date('2024-01-01T00:00:00.000Z');
    const cancel = new Date('2024-01-16T00:00:00.000Z'); // Exactly at deadline
    return isRefundEligible(start, cancel) === false;
  },
  
  'immediate cancellation is eligible': () => {
    const start = new Date('2024-01-01T12:00:00.000Z');
    const cancel = new Date('2024-01-01T12:00:00.001Z'); // 1ms after start
    return isRefundEligible(start, cancel) === true;
  },
  
  'cancellation before subscription start is eligible': () => {
    const start = new Date('2024-01-01T12:00:00.000Z');
    const cancel = new Date('2024-01-01T11:59:59.999Z'); // Before start
    return isRefundEligible(start, cancel) === true;
  },
  
  'leap year boundary handling': () => {
    const start = new Date('2024-02-20T00:00:00.000Z'); // 2024 is leap year
    const cancel = new Date('2024-03-05T23:59:59.999Z'); // 14 days later
    return isRefundEligible(start, cancel) === true;
  },
  
  'getRefundDeadline precision': () => {
    const start = new Date('2024-01-01T00:00:00.000Z');
    const deadline = getRefundDeadline(start);
    return deadline.toISOString() === '2024-01-16T00:00:00.000Z';
  },
  
  'getRefundWindowRemaining at various points': () => {
    const start = new Date('2024-01-01T00:00:00.000Z');
    const oneDay = new Date('2024-01-02T00:00:00.000Z');
    const deadline = new Date('2024-01-16T00:00:00.000Z');
    const past = new Date('2024-01-17T00:00:00.000Z');
    
    const oneDayRemaining = getRefundWindowRemaining(start, oneDay);
    const atDeadline = getRefundWindowRemaining(start, deadline);
    const pastDeadline = getRefundWindowRemaining(start, past);
    
    return oneDayRemaining === 14 * 24 * 60 * 60 * 1000 && 
           atDeadline === 0 && 
           pastDeadline === 0;
  },
};