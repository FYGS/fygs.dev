import { describe, test, expect } from 'vitest'
import { isRefundEligible, getRefundDeadline, getRefundWindowRemaining } from '@/lib/refund-policy'

describe('Refund Eligibility Contract Tests', () => {
  /**
   * 14-day refund window using precise timestamp arithmetic.
   *
   * The window is 14 days everywhere the product states it: the terms of sale
   * (app/[locale]/(main)/terms), the billing page, the refund and cancellation
   * actions and the Stripe-backed integration test (tests/integration/db/refund.test.ts).
   * The original spec said 15 days; the shipped policy is 14.
   *
   * Window: cancellationTimestamp < (subscriptionPeriodStartAnchor + 14 * 24 * 60 * 60 * 1000)
   */

  const DAY_MS = 24 * 60 * 60 * 1000
  const FOURTEEN_DAYS_MS = 14 * DAY_MS

  describe('Exact boundary testing', () => {
    test('cancellation at 13 days 23:59:59.999 → eligible', () => {
      const periodStart = new Date('2024-01-01T00:00:00.000Z')
      const cancellation = new Date('2024-01-14T23:59:59.999Z') // 1ms before deadline

      expect(isRefundEligible(periodStart, cancellation)).toBe(true)
    })

    test('cancellation at exactly 14 days 00:00:00.000 → ineligible', () => {
      const periodStart = new Date('2024-01-01T00:00:00.000Z')
      const cancellation = new Date('2024-01-15T00:00:00.000Z') // Exactly at deadline

      expect(isRefundEligible(periodStart, cancellation)).toBe(false)
    })

    test('cancellation at 14 days 00:00:00.001 → ineligible', () => {
      const periodStart = new Date('2024-01-01T00:00:00.000Z')
      const cancellation = new Date('2024-01-15T00:00:00.001Z') // 1ms after deadline

      expect(isRefundEligible(periodStart, cancellation)).toBe(false)
    })

    test('boundary calculation precision verification', () => {
      const periodStart = new Date('2024-01-01T00:00:00.000Z')
      const expectedDeadline = new Date(periodStart.getTime() + FOURTEEN_DAYS_MS)

      expect(expectedDeadline.toISOString()).toBe('2024-01-15T00:00:00.000Z')

      // Verify our function calculates same deadline
      const calculatedDeadline = getRefundDeadline(periodStart)
      expect(calculatedDeadline.getTime()).toBe(expectedDeadline.getTime())
    })
  })

  describe('Various time scenarios', () => {
    test('immediate cancellation → eligible', () => {
      const periodStart = new Date('2024-01-01T12:00:00.000Z')
      const cancellation = new Date('2024-01-01T12:00:00.001Z') // 1ms after start

      expect(isRefundEligible(periodStart, cancellation)).toBe(true)
    })

    test('cancellation before subscription start → eligible', () => {
      const periodStart = new Date('2024-01-01T12:00:00.000Z')
      const cancellation = new Date('2024-01-01T11:59:59.999Z') // Before start

      expect(isRefundEligible(periodStart, cancellation)).toBe(true)
    })

    test('cancellation at 1 day → eligible', () => {
      const periodStart = new Date('2024-01-01T00:00:00.000Z')
      const cancellation = new Date('2024-01-02T00:00:00.000Z')

      expect(isRefundEligible(periodStart, cancellation)).toBe(true)
    })

    test('cancellation at 7 days → eligible', () => {
      const periodStart = new Date('2024-01-01T00:00:00.000Z')
      const cancellation = new Date('2024-01-08T00:00:00.000Z')

      expect(isRefundEligible(periodStart, cancellation)).toBe(true)
    })

    test('cancellation at 13 days → eligible', () => {
      const periodStart = new Date('2024-01-01T00:00:00.000Z')
      const cancellation = new Date('2024-01-14T00:00:00.000Z')

      expect(isRefundEligible(periodStart, cancellation)).toBe(true)
    })

    test('cancellation at 14 days → ineligible', () => {
      const periodStart = new Date('2024-01-01T00:00:00.000Z')
      const cancellation = new Date('2024-01-15T00:00:00.000Z')

      expect(isRefundEligible(periodStart, cancellation)).toBe(false)
    })

    test('cancellation at 15 days → ineligible (the old 15-day window is gone)', () => {
      const periodStart = new Date('2024-01-01T00:00:00.000Z')
      const cancellation = new Date('2024-01-16T00:00:00.000Z')

      expect(isRefundEligible(periodStart, cancellation)).toBe(false)
    })

    test('cancellation at 16 days → ineligible', () => {
      const periodStart = new Date('2024-01-01T00:00:00.000Z')
      const cancellation = new Date('2024-01-17T00:00:00.000Z')

      expect(isRefundEligible(periodStart, cancellation)).toBe(false)
    })

    test('cancellation at 30 days → ineligible', () => {
      const periodStart = new Date('2024-01-01T00:00:00.000Z')
      const cancellation = new Date('2024-01-31T00:00:00.000Z')

      expect(isRefundEligible(periodStart, cancellation)).toBe(false)
    })
  })

  describe('Edge cases and special dates', () => {
    test('leap year February boundary', () => {
      const periodStart = new Date('2024-02-20T00:00:00.000Z') // 2024 is leap year
      const cancellation = new Date('2024-03-04T23:59:59.999Z') // 14 days less 1ms (crossing Feb 29)

      expect(isRefundEligible(periodStart, cancellation)).toBe(true)

      const cancellationAtDeadline = new Date('2024-03-05T00:00:00.000Z') // Exactly 14 days
      expect(isRefundEligible(periodStart, cancellationAtDeadline)).toBe(false)
    })

    test('non-leap year February boundary', () => {
      const periodStart = new Date('2023-02-20T00:00:00.000Z') // 2023 is not leap year
      const cancellation = new Date('2023-03-05T23:59:59.999Z') // 14 days less 1ms

      expect(isRefundEligible(periodStart, cancellation)).toBe(true)

      const cancellationAtDeadline = new Date('2023-03-06T00:00:00.000Z') // Exactly 14 days
      expect(isRefundEligible(periodStart, cancellationAtDeadline)).toBe(false)
    })

    test('month boundary crossing', () => {
      const periodStart = new Date('2024-01-25T00:00:00.000Z')
      const deadline = getRefundDeadline(periodStart)

      expect(deadline.toISOString()).toBe('2024-02-08T00:00:00.000Z')

      const eligibleCancellation = new Date('2024-02-07T23:59:59.999Z')
      const ineligibleCancellation = new Date('2024-02-08T00:00:00.000Z')

      expect(isRefundEligible(periodStart, eligibleCancellation)).toBe(true)
      expect(isRefundEligible(periodStart, ineligibleCancellation)).toBe(false)
    })

    test('year boundary crossing', () => {
      const periodStart = new Date('2023-12-25T00:00:00.000Z')
      const deadline = getRefundDeadline(periodStart)

      expect(deadline.toISOString()).toBe('2024-01-08T00:00:00.000Z')

      const eligibleCancellation = new Date('2024-01-07T23:59:59.999Z')
      const ineligibleCancellation = new Date('2024-01-08T00:00:00.000Z')

      expect(isRefundEligible(periodStart, eligibleCancellation)).toBe(true)
      expect(isRefundEligible(periodStart, ineligibleCancellation)).toBe(false)
    })

    test('daylight saving time transition (if applicable)', () => {
      // The window is plain UTC arithmetic: a DST change in a local zone
      // (US spring forward on 2024-03-10) does not move the deadline
      const periodStart = new Date('2024-03-01T12:00:00.000Z')
      const cancellation = new Date('2024-03-15T11:59:59.999Z') // Should be eligible

      expect(isRefundEligible(periodStart, cancellation)).toBe(true)

      const cancellationAfter = new Date('2024-03-15T12:00:00.000Z') // Should be ineligible
      expect(isRefundEligible(periodStart, cancellationAfter)).toBe(false)
    })
  })

  describe('Timezone independence', () => {
    test('same UTC moment in different timezone representations → same result', () => {
      // Same moment represented in different ways
      const periodStart1 = new Date('2024-01-01T00:00:00.000Z')
      const periodStart2 = new Date('2024-01-01T05:00:00.000+05:00') // Same moment in UTC+5

      const cancellation1 = new Date('2024-01-14T23:59:59.999Z')
      const cancellation2 = new Date('2024-01-15T04:59:59.999+05:00') // Same moment in UTC+5

      expect(periodStart1.getTime()).toBe(periodStart2.getTime())
      expect(cancellation1.getTime()).toBe(cancellation2.getTime())

      expect(isRefundEligible(periodStart1, cancellation1)).toBe(true)
      expect(isRefundEligible(periodStart2, cancellation2)).toBe(true)
      expect(isRefundEligible(periodStart1, cancellation2)).toBe(true)
      expect(isRefundEligible(periodStart2, cancellation1)).toBe(true)
    })
  })

  describe('Refund window remaining calculation', () => {
    test('remaining time calculation at various points', () => {
      const periodStart = new Date('2024-01-01T00:00:00.000Z')

      // At start: full 14 days remaining
      const atStart = getRefundWindowRemaining(periodStart, periodStart)
      expect(atStart).toBe(FOURTEEN_DAYS_MS)

      // After 1 day: 13 days remaining
      const after1Day = new Date('2024-01-02T00:00:00.000Z')
      const remaining1Day = getRefundWindowRemaining(periodStart, after1Day)
      expect(remaining1Day).toBe(13 * DAY_MS)

      // After 13 days: 1 day remaining
      const after13Days = new Date('2024-01-14T00:00:00.000Z')
      const remaining13Days = getRefundWindowRemaining(periodStart, after13Days)
      expect(remaining13Days).toBe(1 * DAY_MS)

      // At deadline: 0 remaining
      const atDeadline = new Date('2024-01-15T00:00:00.000Z')
      const remainingAtDeadline = getRefundWindowRemaining(periodStart, atDeadline)
      expect(remainingAtDeadline).toBe(0)

      // After deadline: 0 remaining (not negative)
      const afterDeadline = new Date('2024-01-17T00:00:00.000Z')
      const remainingAfterDeadline = getRefundWindowRemaining(periodStart, afterDeadline)
      expect(remainingAfterDeadline).toBe(0)
    })

    test('remaining time with default current time', () => {
      // Test with current time (using recent past to ensure positive remaining)
      const recentPast = new Date(Date.now() - (5 * DAY_MS)) // 5 days ago
      const remaining = getRefundWindowRemaining(recentPast)

      // Should be approximately 9 days remaining (allowing for small timing differences)
      const expectedRemaining = 9 * DAY_MS
      const tolerance = 60 * 1000 // 1 minute tolerance

      expect(remaining).toBeGreaterThan(expectedRemaining - tolerance)
      expect(remaining).toBeLessThan(expectedRemaining + tolerance)
    })
  })

  describe('Function consistency and reliability', () => {
    test('repeated calls with same inputs return same results', () => {
      const periodStart = new Date('2024-01-01T00:00:00.000Z')
      const cancellation = new Date('2024-01-10T12:30:45.123Z')

      const result1 = isRefundEligible(periodStart, cancellation)
      const result2 = isRefundEligible(periodStart, cancellation)
      const result3 = isRefundEligible(periodStart, cancellation)

      expect(result1).toBe(result2)
      expect(result2).toBe(result3)
      expect(result1).toBe(true) // Should be eligible
    })

    test('function handles invalid dates gracefully', () => {
      const validDate = new Date('2024-01-01T00:00:00.000Z')
      const invalidDate = new Date('invalid')

      // Should not throw errors, but results may be invalid
      expect(() => isRefundEligible(validDate, invalidDate)).not.toThrow()
      expect(() => isRefundEligible(invalidDate, validDate)).not.toThrow()
      expect(() => getRefundDeadline(invalidDate)).not.toThrow()

      // An invalid date never makes a refund eligible
      expect(isRefundEligible(validDate, invalidDate)).toBe(false)
      expect(isRefundEligible(invalidDate, validDate)).toBe(false)
    })

    test('millisecond precision is maintained throughout calculations', () => {
      const periodStart = new Date('2024-01-01T12:34:56.789Z')
      const deadline = getRefundDeadline(periodStart)

      // Deadline should maintain the exact millisecond timing
      expect(deadline.getMilliseconds()).toBe(789)
      expect(deadline.getSeconds()).toBe(56)
      expect(deadline.getMinutes()).toBe(34)
      expect(deadline.getUTCHours()).toBe(12)

      // Just before deadline should be eligible
      const justBefore = new Date(deadline.getTime() - 1)
      expect(isRefundEligible(periodStart, justBefore)).toBe(true)

      // At deadline should be ineligible
      expect(isRefundEligible(periodStart, deadline)).toBe(false)
    })
  })
})
