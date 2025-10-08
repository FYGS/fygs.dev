import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { db } from '@/lib/db'
import { cancelSubscription, type CancelSubscriptionResult } from '@/app/(dashboard)/actions/cancelSubscription'
import { createTestEnvironment } from '../../utils/test-database'
import { mockAuthenticatedUser, AuthMock } from '../../utils/auth-mock'

describe('Cancel Subscription Server Action Contract Tests', () => {
  const testEnv = createTestEnvironment()
  let testUserId: string
  let activeSubscriptionId: string

  beforeEach(async () => {
    // Create test user with unique email
    const uniqueEmail = `cancel-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`
    const user = await db.user.create({
      data: {
        email: uniqueEmail,
        name: 'Cancel Test User',
        emailVerified: true
      }
    })
    testUserId = user.id
    testEnv.trackUser(testUserId)

    // Create active subscription
    const subscription = await db.subscription.create({
      data: {
        userId: testUserId,
        status: 'ACTIVE',
        priceId: 'price_premium_monthly',
        currentPeriodStart: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        currentPeriodEnd: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        stripeSubscriptionId: `sub_test_${Date.now()}`
      }
    })
    activeSubscriptionId = subscription.id

    // Mock authentication for this specific user
    mockAuthenticatedUser(testUserId, uniqueEmail)
  })

  afterEach(async () => {
    AuthMock.clearMocks()
    await testEnv.cleanup()
  })

  describe('Input validation', () => {
    test('accepts valid cancellation with immediate flag', async () => {
      const result = await cancelSubscription({ 
        reason: 'too_expensive',
        immediate: true
      })
      
      expect(result).toBeDefined()
      expect(typeof result.success).toBe('boolean')
    })

    test('accepts cancellation with default immediate flag', async () => {
      const result = await cancelSubscription({ 
        immediate: false
      })
      
      expect(result).toBeDefined()
      expect(typeof result.success).toBe('boolean')
    })

    test('accepts required immediate field', async () => {
      const result = await cancelSubscription({ 
        reason: 'not_using',
        immediate: false
      })
      
      expect(result).toBeDefined()
      expect(typeof result.success).toBe('boolean')
    })
  })

  describe('Subscription state validation', () => {
    test('successfully cancels active subscription immediately', async () => {
      const result = await cancelSubscription({ 
        reason: 'not_using',
        immediate: true
      })

      expect(result.success).toBe(true)
      expect(result.subscription).toBeDefined()
      expect(result.subscription!.status).toBe('CANCELED')
      expect(result.subscription!.cancelAtPeriodEnd).toBe(false)
    })

    test('successfully schedules cancellation at period end', async () => {
      const result = await cancelSubscription({ 
        reason: 'too_expensive',
        immediate: false
      })

      expect(result.success).toBe(true)
      expect(result.subscription).toBeDefined()
      expect(result.subscription!.cancelAtPeriodEnd).toBe(true)
      expect(result.subscription!.currentPeriodEnd).toBeInstanceOf(Date)
    })

    test('rejects cancellation when no active subscription exists', async () => {
      // Delete the subscription to simulate no active subscription
      await db.subscription.delete({ where: { id: activeSubscriptionId } })

      const result = await cancelSubscription({ 
        reason: 'not_using',
        immediate: true
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.message).toContain('subscription')
    })

    test('handles already canceled subscription idempotently', async () => {
      // First cancellation
      const result1 = await cancelSubscription({ 
        reason: 'too_expensive',
        immediate: true
      })
      expect(result1.success).toBe(true)

      // Second cancellation attempt (idempotent)
      const result2 = await cancelSubscription({ 
        reason: 'not_using',
        immediate: true
      })

      expect(result2.success).toBe(true)
      expect(result2.subscription!.status).toBe('CANCELED')
    })
  })

  describe('Refund eligibility calculation', () => {
    test('calculates refund eligibility for recent subscription', async () => {
      // Create subscription started 5 days ago (within 15-day refund window)
      await db.subscription.update({
        where: { id: activeSubscriptionId },
        data: {
          currentPeriodStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        }
      })

      const result = await cancelSubscription({ 
        reason: 'not_using',
        immediate: true
      })

      expect(result.success).toBe(true)
      expect(result.refund).toBeDefined()
      expect(result.refund!.eligible).toBe(true)
      if (result.refund!.amount !== undefined) {
        expect(result.refund!.amount).toBeGreaterThan(0)
      }
    })

    test('calculates no refund for old subscription', async () => {
      // Create subscription started 20 days ago (outside 15-day refund window)
      await db.subscription.update({
        where: { id: activeSubscriptionId },
        data: {
          currentPeriodStart: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
        }
      })

      const result = await cancelSubscription({ 
        reason: 'too_expensive',
        immediate: true
      })

      expect(result.success).toBe(true)
      expect(result.refund).toBeDefined()
      expect(result.refund!.eligible).toBe(false)
    })

    test('calculates refund eligibility at exact 15-day boundary', async () => {
      // Create subscription started exactly 15 days ago (boundary test)
      await db.subscription.update({
        where: { id: activeSubscriptionId },
        data: {
          currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // Exactly 15 days ago
        }
      })

      const result = await cancelSubscription({ 
        reason: 'missing_features',
        immediate: true
      })

      expect(result.success).toBe(true)
      expect(result.refund).toBeDefined()
      // At exactly 15 days, should not be eligible (> 15 days = no refund)
      expect(result.refund!.eligible).toBe(false)
    })

    test('calculates refund eligibility just before 15-day boundary', async () => {
      // Create subscription started 14 days and 23 hours ago (just within window)
      const almostFifteenDays = 15 * 24 * 60 * 60 * 1000 - 60 * 60 * 1000 // 15 days minus 1 hour
      await db.subscription.update({
        where: { id: activeSubscriptionId },
        data: {
          currentPeriodStart: new Date(Date.now() - almostFifteenDays)
        }
      })

      const result = await cancelSubscription({ 
        reason: 'other',
        immediate: true
      })

      expect(result.success).toBe(true)
      expect(result.refund).toBeDefined()
      expect(result.refund!.eligible).toBe(true)
    })
  })

  describe('Immediate vs period end cancellation', () => {
    test('immediate cancellation stops access immediately', async () => {
      const result = await cancelSubscription({ 
        reason: 'too_expensive',
        immediate: true
      })

      expect(result.success).toBe(true)
      expect(result.subscription!.status).toBe('CANCELED')
      expect(result.subscription!.cancelAtPeriodEnd).toBe(false)
    })

    test('period end cancellation maintains access until end', async () => {
      const result = await cancelSubscription({ 
        reason: 'not_using',
        immediate: false
      })

      expect(result.success).toBe(true)
      expect(result.subscription!.cancelAtPeriodEnd).toBe(true)
      expect(result.subscription!.currentPeriodEnd).toBeInstanceOf(Date)
      // Status might remain ACTIVE until period end
    })
  })

  describe('Idempotency behavior', () => {
    test('handles concurrent cancellation attempts safely', async () => {
      // Simulate concurrent cancellation attempts
      const promises = Array.from({ length: 3 }, () => 
        cancelSubscription({ 
          reason: 'too_expensive',
          immediate: true
        })
      )

      const results = await Promise.all(promises)

      // All should succeed
      results.forEach(result => {
        expect(result.success).toBe(true)
        expect(result.subscription).toBeDefined()
      })

      // Verify subscription is canceled in database
      const dbSubscription = await db.subscription.findUnique({
        where: { id: activeSubscriptionId }
      })
      expect(dbSubscription!.status).toBe('CANCELED')
    })
  })

  describe('Error handling edge cases', () => {
    test('handles user session validation errors', async () => {
      // Create new isolated test user for this specific test
      const errorTestUser = await db.user.create({
        data: {
          email: `error-test-${Date.now()}@example.com`,
          name: 'Error Test User',
          emailVerified: true
        }
      })
      testEnv.trackUser(errorTestUser.id)

      // Mock session to return null (unauthenticated)
      AuthMock.clearMocks()
      vi.doMock('@/lib/auth', () => ({
        auth: {
          api: {
            getSession: vi.fn(() => Promise.resolve(null))
          }
        }
      }))

      const result = await cancelSubscription({ 
        reason: 'too_expensive',
        immediate: true
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('UNAUTHORIZED')
    })

    test('handles subscription belonging to different user', async () => {
      // Create different user with unique email
      const otherEmail = `other-user-${Date.now()}@example.com`
      const otherUser = await db.user.create({
        data: {
          email: otherEmail,
          name: 'Other User',
          emailVerified: true
        }
      })
      testEnv.trackUser(otherUser.id)

      // Mock authentication as the other user
      mockAuthenticatedUser(otherUser.id, otherEmail)

      const result = await cancelSubscription({ 
        reason: 'not_using',
        immediate: true
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('Response format validation', () => {
    test('success response has correct structure', async () => {
      const result = await cancelSubscription({ 
        reason: 'too_expensive',
        immediate: true
      })

      expect(result).toMatchObject({
        success: true,
        message: expect.any(String),
        subscription: {
          id: expect.stringMatching(/^cm[a-z0-9]+$/),
          status: expect.any(String),
          cancelAtPeriodEnd: expect.any(Boolean),
          currentPeriodEnd: expect.any(Date)
        }
      })

      if (result.refund) {
        expect(result.refund).toMatchObject({
          eligible: expect.any(Boolean),
          reason: expect.any(String)
        })
      }
    })

    test('error response has correct structure', async () => {
      // Delete subscription to trigger error
      await db.subscription.delete({ where: { id: activeSubscriptionId } })

      const result = await cancelSubscription({ 
        reason: 'not_using',
        immediate: true
      })

      expect(result).toMatchObject({
        success: false,
        message: expect.any(String),
        error: expect.any(String)
      })
    })
  })
})