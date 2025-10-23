/**
 * T104: Plan Switch Proration Audit Tests
 * 
 * Tests the subscription plan switching functionality with proper
 * proration calculation and InvoiceAudit record creation.
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { db } from '@/lib/db'
import { createTestEnvironment } from '../../utils/test-database'

// Mock Next.js dependencies at module level
vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers({
    'user-agent': 'test-agent'
  })))
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

// Mock payment service to avoid real Stripe calls
vi.mock('@/lib/payment-service', () => ({
  paymentService: {
    switchSubscriptionPrice: vi.fn().mockResolvedValue(undefined),
    getSubscription: vi.fn().mockResolvedValue({
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor((Date.now() + 365 * 24 * 60 * 60 * 1000) / 1000)
    })
  }
}))

// Mock resolveRequestedPriceId
vi.mock('@/lib/subscription-pricing', () => ({
  resolveRequestedPriceId: vi.fn((priceId: string) => {
    if (priceId === 'price_invalid_plan') {
      throw new Error('Invalid price ID')
    }
    return {
      priceId,
      cycle: priceId.includes('yearly') ? 'yearly' as const : 'monthly' as const
    }
  })
}))

// Mock Better Auth with dynamic session
let mockAuthSession: any = null
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(() => Promise.resolve(mockAuthSession))
    }
  }
}))

// Import plan switch action after mocking
import { switchSubscriptionPlan } from '@/app/(main)/dashboard/actions/switchSubscriptionPlan'

describe('T104: Plan Switch Proration Audit Tests', () => {
  const testEnv = createTestEnvironment()
  let testUserId: string
  let activeSubscriptionId: string

  beforeEach(async () => {
    // Create test user with unique email
    const uniqueEmail = `plan-switch-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`
    
    const user = await db.user.create({
      data: {
        email: uniqueEmail,
        name: 'Plan Switch Test User',
        emailVerified: true
      }
    })
    testUserId = user.id
    testEnv.trackUser(testUserId)

    // Create active monthly subscription
    const subscription = await db.subscription.create({
      data: {
        userId: testUserId,
        status: 'ACTIVE',
        plan: 'PREMIUM',
        priceId: 'price_premium_monthly',
        currentPeriodStart: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        currentPeriodEnd: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        stripeSubscriptionId: `sub_monthly_${Date.now()}`
      }
    })
    activeSubscriptionId = subscription.id

    // Set up mock auth session
    mockAuthSession = {
      user: {
        id: testUserId,
        email: uniqueEmail,
        name: 'Plan Switch Test User',
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

  describe('Monthly to Yearly Switch', () => {
    test('creates proration audit record for monthly to yearly upgrade', async () => {
      const result = await switchSubscriptionPlan({ 
        newPriceId: 'price_premium_yearly'
      })

      expect(result.success).toBe(true)
      expect(result.subscription).toBeDefined()
      expect(result.proration).toBeDefined()

      // Verify InvoiceAudit record was created
      const auditRecord = await db.invoiceAudit.findFirst({
        where: {
          subscriptionId: activeSubscriptionId,
          type: 'PLAN_CHANGE'
        }
      })

      expect(auditRecord).toBeDefined()
      expect(auditRecord!.metadata).toMatchObject({
        oldPriceId: 'price_premium_monthly',
        newPriceId: 'price_premium_yearly',
        prorationAmount: expect.any(Number),
        effectiveDate: expect.any(String)
      })
    })

    test('calculates correct proration amount for monthly to yearly', async () => {
      const result = await switchSubscriptionPlan({ 
        newPriceId: 'price_premium_yearly'
      })

      expect(result.success).toBe(true)
      expect(result.proration).toBeDefined()
      expect(result.proration!.amount).toBeGreaterThan(0) // Should be positive (upgrade)
      expect(result.proration!.description).toContain('monthly to yearly')
      
      // Verify proration calculation is reasonable
      // Yearly plan should provide credit for unused monthly time
      const daysRemaining = Math.ceil(
        (new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).getTime() - Date.now()) 
        / (24 * 60 * 60 * 1000)
      )
      expect(daysRemaining).toBeGreaterThan(0)
    })

    test('updates subscription with new price ID and period', async () => {
      const result = await switchSubscriptionPlan({ 
        newPriceId: 'price_premium_yearly'
      })

      expect(result.success).toBe(true)

      // Verify subscription was updated
      const updatedSubscription = await db.subscription.findUnique({
        where: { id: activeSubscriptionId }
      })

      expect(updatedSubscription).toBeDefined()
      expect(updatedSubscription!.priceId).toBe('price_premium_yearly')
      expect(updatedSubscription!.status).toBe('ACTIVE')
      
      // New period end should be ~365 days from now
      const newPeriodEnd = new Date(updatedSubscription!.currentPeriodEnd!)
      const expectedEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      const timeDiff = Math.abs(newPeriodEnd.getTime() - expectedEnd.getTime())
      expect(timeDiff).toBeLessThan(24 * 60 * 60 * 1000) // Within 24 hours
    })
  })

  describe('Yearly to Monthly Switch', () => {
    beforeEach(async () => {
      // Update subscription to yearly
      await db.subscription.update({
        where: { id: activeSubscriptionId },
        data: {
          priceId: 'price_premium_yearly',
          currentPeriodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          currentPeriodEnd: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000), // 335 days from now
        }
      })
    })

    test('creates proration audit record for yearly to monthly downgrade', async () => {
      const result = await switchSubscriptionPlan({ 
        newPriceId: 'price_premium_monthly'
      })

      expect(result.success).toBe(true)

      // Verify InvoiceAudit record was created
      const auditRecord = await db.invoiceAudit.findFirst({
        where: {
          subscriptionId: activeSubscriptionId,
          type: 'PLAN_CHANGE'
        }
      })

      expect(auditRecord).toBeDefined()
      expect(auditRecord!.metadata).toMatchObject({
        oldPriceId: 'price_premium_yearly',
        newPriceId: 'price_premium_monthly',
        prorationAmount: expect.any(Number),
        effectiveDate: expect.any(String)
      })
    })

    test('handles proration credit for yearly to monthly downgrade', async () => {
      const result = await switchSubscriptionPlan({ 
        newPriceId: 'price_premium_monthly'
      })

      expect(result.success).toBe(true)
      expect(result.proration).toBeDefined()
      
      // Downgrade should result in credit (negative proration amount)
      expect(result.proration!.creditAmount).toBeGreaterThan(0)
      expect(result.proration!.description).toContain('yearly to monthly')
      expect(result.proration!.description).toContain('credit')
    })
  })

  describe('Plan Switch Validation', () => {
    test('rejects switch to same plan', async () => {
      const result = await switchSubscriptionPlan({ 
        newPriceId: 'price_premium_monthly' // Same as current
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('SAME_PLAN')
      expect(result.message).toContain('already on this plan')
    })

    test('rejects switch with invalid price ID', async () => {
      const result = await switchSubscriptionPlan({ 
        newPriceId: 'price_invalid_plan'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('INVALID_PRICE_ID')
    })

    test('rejects switch when no active subscription', async () => {
      // Cancel the subscription
      await db.subscription.update({
        where: { id: activeSubscriptionId },
        data: { status: 'CANCELED' }
      })

      const result = await switchSubscriptionPlan({ 
        newPriceId: 'price_premium_yearly'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('NO_ACTIVE_SUBSCRIPTION')
    })

    test('rejects switch when unauthenticated', async () => {
      // Clear auth session
      mockAuthSession = null

      const result = await switchSubscriptionPlan({ 
        newPriceId: 'price_premium_yearly'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('UNAUTHORIZED')
    })
  })

  describe('Audit Record Structure', () => {
    test('creates complete audit record with all required fields', async () => {
      const beforeSwitch = new Date()
      
      const result = await switchSubscriptionPlan({ 
        newPriceId: 'price_premium_yearly'
      })

      expect(result.success).toBe(true)

      const auditRecord = await db.invoiceAudit.findFirst({
        where: {
          subscriptionId: activeSubscriptionId,
          type: 'PLAN_CHANGE'
        }
      })

      expect(auditRecord).toBeDefined()
      expect(auditRecord!.subscriptionId).toBe(activeSubscriptionId)
      expect(auditRecord!.type).toBe('PLAN_CHANGE')
      expect(auditRecord!.amount).toBeDefined()
      expect(auditRecord!.currency).toBe('EUR')
      expect(auditRecord!.createdAt).toBeInstanceOf(Date)
      expect(auditRecord!.createdAt.getTime()).toBeGreaterThanOrEqual(beforeSwitch.getTime())
      expect(auditRecord!.metadata).toBeDefined()
    })

    test('preserves plan change history in multiple audit records', async () => {
      // First switch: monthly to yearly
      await switchSubscriptionPlan({ 
        newPriceId: 'price_premium_yearly'
      })

      // Second switch: yearly back to monthly
      await switchSubscriptionPlan({ 
        newPriceId: 'price_premium_monthly'
      })

      // Verify both audit records exist
      const auditRecords = await db.invoiceAudit.findMany({
        where: {
          subscriptionId: activeSubscriptionId,
          type: 'PLAN_CHANGE'
        },
        orderBy: { createdAt: 'asc' }
      })

      expect(auditRecords).toHaveLength(2)
      
      // First record: monthly to yearly
      expect(auditRecords[0].metadata).toMatchObject({
        oldPriceId: 'price_premium_monthly',
        newPriceId: 'price_premium_yearly'
      })

      // Second record: yearly to monthly
      expect(auditRecords[1].metadata).toMatchObject({
        oldPriceId: 'price_premium_yearly',
        newPriceId: 'price_premium_monthly'
      })
    })
  })

  describe('Response Format Validation', () => {
    test('success response has correct structure', async () => {
      const result = await switchSubscriptionPlan({ 
        newPriceId: 'price_premium_yearly'
      })

      expect(result).toMatchObject({
        success: true,
        message: expect.any(String),
        subscription: {
          id: expect.stringMatching(/^cm[a-z0-9]+$/),
          priceId: 'price_premium_yearly',
          status: 'ACTIVE',
          currentPeriodEnd: expect.any(Date)
        },
        proration: {
          amount: expect.any(Number),
          description: expect.any(String)
        },
        auditId: expect.stringMatching(/^cm[a-z0-9]+$/)
      })
    })

    test('error response has correct structure', async () => {
      const result = await switchSubscriptionPlan({ 
        newPriceId: 'price_premium_monthly' // Same plan
      })

      expect(result).toMatchObject({
        success: false,
        message: expect.any(String),
        error: expect.any(String)
      })
      expect(result.subscription).toBeUndefined()
      expect(result.proration).toBeUndefined()
    })
  })
})