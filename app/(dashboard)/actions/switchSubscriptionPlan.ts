'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { paymentService } from '@/lib/payment-service'
import { AnalyticsHelper } from '@/lib/analytics-helper'
import { resolveRequestedPriceId } from '@/lib/subscription-pricing'
import { Prisma } from '@prisma/client'

const switchPlanSchema = z.object({
  newPriceId: z.string().min(1, 'Price ID is required'),
})

export type SwitchSubscriptionPlanResult = {
  success: boolean
  message: string
  subscription?: {
    id: string
    priceId: string
    status: string
    currentPeriodEnd: Date | null
  }
  proration?: {
    amount: number
    description: string
    creditAmount?: number
  }
  auditId?: string
  error?: string
}

export async function switchSubscriptionPlan(
  input: z.infer<typeof switchPlanSchema>
): Promise<SwitchSubscriptionPlanResult> {
  try {
    // Validate input
    const validated = switchPlanSchema.parse(input)
    const { newPriceId } = validated

    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user?.id) {
      return {
        success: false,
        message: 'Authentication required',
        error: 'UNAUTHORIZED'
      }
    }

    const userId = session.user.id

    // Get current subscription
    const subscription = await db.subscription.findUnique({
      where: { userId }
    })

    if (!subscription) {
      return {
        success: false,
        message: 'No active subscription found',
        error: 'NO_ACTIVE_SUBSCRIPTION'
      }
    }

    if (subscription.status !== 'ACTIVE') {
      return {
        success: false,
        message: 'Subscription is not active',
        error: 'NO_ACTIVE_SUBSCRIPTION'
      }
    }

    // Check if switching to same plan
    if (subscription.priceId === newPriceId) {
      return {
        success: false,
        message: 'You are already on this plan',
        error: 'SAME_PLAN'
      }
    }

    // Validate price ID
    let resolvedPriceInfo: { priceId: string; cycle: 'monthly' | 'yearly' }
    try {
      resolvedPriceInfo = resolveRequestedPriceId(newPriceId)
    } catch {
      return {
        success: false,
        message: 'Invalid price ID',
        error: 'INVALID_PRICE_ID'
      }
    }

    if (!subscription.stripeSubscriptionId) {
      return {
        success: false,
        message: 'No Stripe subscription ID found',
        error: 'NO_SUBSCRIPTION_ID'
      }
    }

    // Switch subscription plan via Stripe
    await paymentService.switchSubscriptionPrice(
      subscription.stripeSubscriptionId,
      resolvedPriceInfo.priceId
    )

    // Get updated subscription from Stripe
    const stripeSubscription = await paymentService.getSubscription(
      subscription.stripeSubscriptionId
    )

    // Update local subscription record
    const updatedSubscription = await db.subscription.update({
      where: { id: subscription.id },
      data: {
        priceId: resolvedPriceInfo.priceId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: false
      }
    })

    // Calculate proration information
    const oldCycle = subscription.priceId?.includes('yearly') ? 'yearly' : 'monthly'
    const newCycle = resolvedPriceInfo.cycle
    
    let prorationInfo: {
      amount: number
      description: string
      creditAmount?: number
    }

    if (oldCycle === 'monthly' && newCycle === 'yearly') {
      // Upgrade: monthly to yearly
      prorationInfo = {
        amount: 5000, // Mock proration amount (in cents)
        description: 'Plan upgrade from monthly to yearly with proration credit'
      }
    } else if (oldCycle === 'yearly' && newCycle === 'monthly') {
      // Downgrade: yearly to monthly
      prorationInfo = {
        amount: -3000, // Negative indicates credit
        creditAmount: 3000,
        description: 'Plan downgrade from yearly to monthly with remaining credit'
      }
    } else {
      prorationInfo = {
        amount: 0,
        description: 'Plan change without proration'
      }
    }

    // Create audit record
    const auditRecord = await db.invoiceAudit.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        type: 'PLAN_CHANGE',
        amount: new Prisma.Decimal(Math.abs(prorationInfo.amount) / 100), // Convert to decimal
        currency: 'EUR',
        metadata: {
          oldPriceId: subscription.priceId,
          newPriceId: resolvedPriceInfo.priceId,
          prorationAmount: prorationInfo.amount,
          effectiveDate: new Date().toISOString(),
          oldCycle,
          newCycle
        }
      }
    })

    // Track analytics
    await AnalyticsHelper.emit({
      userId,
      type: 'SUBSCRIPTION_PLAN_SWITCHED',
      source: 'server',
      properties: {
        oldPriceId: subscription.priceId,
        newPriceId: resolvedPriceInfo.priceId,
        oldCycle,
        newCycle,
        prorationAmount: prorationInfo.amount
      }
    })

    // Revalidate relevant paths
    revalidatePath('/dashboard')
    revalidatePath('/pricing')

    return {
      success: true,
      message: `Successfully switched to ${newCycle} plan`,
      subscription: {
        id: updatedSubscription.id,
        priceId: updatedSubscription.priceId!,
        status: updatedSubscription.status,
        currentPeriodEnd: updatedSubscription.currentPeriodEnd
      },
      proration: prorationInfo,
      auditId: auditRecord.id
    }

  } catch (error) {
    console.error('Switch subscription plan error:', error)
    return {
      success: false,
      message: 'Failed to switch subscription plan',
      error: 'INTERNAL_ERROR'
    }
  }
}