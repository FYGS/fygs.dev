'use server'

import { z } from 'zod'
import { isSubscriptionActive } from "@/lib/access/entitlement";
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { paymentService } from '@/lib/payment-service'
import { AnalyticsHelper } from '@/lib/analytics-helper'
import { getSubscriptionPeriod } from '@/lib/stripe-shapes'
import { resolveRequestedPriceId } from '@/lib/subscription-pricing'
import { withPurchaseLock } from '@/lib/payments/locks'

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

    // ACTIVE or TRIALING: a trial is a running subscription (lib/access/entitlement.ts)
    if (!isSubscriptionActive(subscription)) {
      return {
        success: false,
        message: "Subscription is not active",
        error: "NO_ACTIVE_SUBSCRIPTION",
      };
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
      resolvedPriceInfo = resolveRequestedPriceId(newPriceId, { strict: true })
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

    // Under the buyer's purchase lock (shared with refunds and checkout): a refund that ends the subscription and a
    // plan change cannot interleave. The state stored is the one Stripe reports after the change.
    const updatedSubscription = await withPurchaseLock(userId, null, async (tx) => {
      const fresh = await tx.subscription.findUnique({ where: { id: subscription.id } })
      if (!fresh || !isSubscriptionActive(fresh)) return null

      await paymentService.switchSubscriptionPrice(
        fresh.stripeSubscriptionId!,
        resolvedPriceInfo.priceId
      )

      const stripeSubscription = await paymentService.getSubscription(
        fresh.stripeSubscriptionId!
      )

      // The period lives on the subscription item (since API 2025-03-31 there is no root current_period_*): reading
      // the root gave NaN dates and failed the update after Stripe had already switched.
      const period = getSubscriptionPeriod(stripeSubscription)
      return tx.subscription.update({
        where: { id: subscription.id },
        data: {
          priceId: resolvedPriceInfo.priceId,
          ...(period.start ? { currentPeriodStart: new Date(period.start * 1000) } : {}),
          ...(period.end ? { currentPeriodEnd: new Date(period.end * 1000) } : {}),
          cancelAtPeriodEnd: false,
          lastEventAt: new Date(),
        },
      })
    })

    if (!updatedSubscription) {
      return {
        success: false,
        message: "Subscription is not active",
        error: "NO_ACTIVE_SUBSCRIPTION",
      }
    }

    // Only two cycles exist and the plan is different from the current one
    const newCycle = resolvedPriceInfo.cycle
    const oldCycle = newCycle === 'yearly' ? 'monthly' : 'yearly'

    // The change itself. The amounts Stripe computed for it are audited by paymentService
    // (type PRORATION, from the invoice preview): nothing is estimated here.
    const auditRecord = await db.invoiceAudit.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        type: 'PLAN_CHANGE',
        currency: 'EUR',
        metadata: {
          oldPriceId: subscription.priceId,
          newPriceId: resolvedPriceInfo.priceId,
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
        newCycle
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