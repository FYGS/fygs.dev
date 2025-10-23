import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { db } from '@/lib/db'
import { createTestEnvironment } from '../../utils/test-database'

// Mock Next.js headers at the module level
vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers({
    'user-agent': 'test-agent'
  })))
}))

// Mock Next.js cache revalidation
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

// Mock Better Auth at the module level
let mockAuthSession: any = null

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(() => Promise.resolve(mockAuthSession))
    }
  }
}))

// Import the action after mocking
const { cancelSubscription } = await import('@/app/(main)/dashboard/actions/cancelSubscription')

describe('Cancel Subscription Database Isolation Tests', () => {
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
        plan: 'PREMIUM',
        currentPeriodStart: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        stripeSubscriptionId: `sub_test_${Date.now()}`
      }
    })
    activeSubscriptionId = subscription.id

    // Set up mock auth session
    mockAuthSession = {
      user: {
        id: testUserId,
        email: uniqueEmail,
        name: 'Test User',
        emailVerified: true
      },
      session: {
        id: `session-${testUserId}`,
        userId: testUserId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    }
  })

  afterEach(async () => {
    mockAuthSession = null
    await testEnv.cleanup()
  })

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

  test('handles unauthenticated user', async () => {
    // Clear auth session
    mockAuthSession = null

    const result = await cancelSubscription({ 
      reason: 'too_expensive',
      immediate: true
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('UNAUTHORIZED')
  })

  test('schedules cancellation at period end', async () => {
    const result = await cancelSubscription({ 
      reason: 'too_expensive',
      immediate: false
    })

    expect(result.success).toBe(true)
    expect(result.subscription).toBeDefined()
    expect(result.subscription!.cancelAtPeriodEnd).toBe(true)
  })
})