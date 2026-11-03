"use server";

import { z } from "zod";
import { isSubscriptionActive } from "@/lib/access/entitlement";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { paymentService } from "@/lib/payment-service";
import { isRefundEligible } from "@/lib/refund-policy";
import { AnalyticsHelper } from "@/lib/analytics-helper";
import { auth } from "@/lib/auth";
import { SubscriptionStatus } from "@/lib/generated/prisma/browser";
import { writeAudit } from "@/lib/audit";

const cancelSubscriptionSchema = z.object({
  reason: z.string().optional(),
  immediate: z.boolean().default(false), // Cancel immediately vs at period end
});

export type CancelSubscriptionResult = {
  success: boolean;
  message: string;
  subscription?: {
    id: string;
    status: string;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: Date | null;
  };
  refund?: {
    eligible: boolean;
    reason: string;
    amount?: number;
  };
  /** True when a concurrent request had already cancelled the subscription */
  alreadyCancelled?: boolean;
  error?: string;
};

export async function cancelSubscription(
  input: z.infer<typeof cancelSubscriptionSchema>
): Promise<CancelSubscriptionResult> {
  try {
    // Validate input
    const { reason, immediate } = cancelSubscriptionSchema.parse(input);

    // Get authenticated user
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Authentication required",
        error: "UNAUTHORIZED",
      };
    }

    const userId = session.user.id;

    // Get current subscription
    const subscription = await db.subscription.findUnique({
      where: { userId },
      select: {
        id: true,
        status: true,
        plan: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        stripeSubscriptionId: true,
      },
    });

    if (!subscription) {
      return {
        success: false,
        message: "No active subscription found",
        error: "NO_SUBSCRIPTION",
      };
    }

    // ACTIVE or TRIALING: a trial is a running subscription (lib/access/entitlement.ts)
    if (!isSubscriptionActive(subscription)) {
      return {
        success: false,
        message: "Subscription is not active",
        error: "SUBSCRIPTION_NOT_ACTIVE",
      };
    }

    if (subscription.cancelAtPeriodEnd && !immediate) {
      return {
        success: false,
        message: "Subscription is already scheduled for cancellation",
        error: "ALREADY_CANCELLED",
      };
    }

    const cancelTimestamp = new Date();
    let refundInfo = {
      eligible: false,
      reason: "Not eligible",
    };

    // Check if subscription is in trial period (within 14 days of start)
    const isInTrialPeriod =
      subscription.currentPeriodStart &&
      isRefundEligible(subscription.currentPeriodStart, cancelTimestamp);

    // For immediate cancellation, check refund eligibility (14-day window)
    if (immediate && subscription.currentPeriodStart) {
      const eligible = isRefundEligible(
        subscription.currentPeriodStart,
        cancelTimestamp
      );

      refundInfo = {
        eligible,
        reason: eligible
          ? "Within 14-day refund window"
          : "Outside 14-day refund window",
      };
    }

    // Determine cancellation behavior based on trial status
    const shouldCancelImmediately =
      immediate && (isInTrialPeriod || refundInfo.eligible);

    // Serialize concurrent requests on the subscription row. The conditional
    // update is the claim: it takes the row lock, so a second request blocks
    // until the first commits, re-evaluates the WHERE clause, and matches
    // nothing. Stripe is only called by the claim winner; if Stripe fails the
    // transaction rolls the claim back so the user can retry.
    const outcome = await db.$transaction(
      async (tx) => {
        const claim = await tx.subscription.updateMany({
          where: shouldCancelImmediately
            ? { id: subscription.id, status: SubscriptionStatus.ACTIVE }
            : {
                id: subscription.id,
                status: SubscriptionStatus.ACTIVE,
                cancelAtPeriodEnd: false,
              },
          data: shouldCancelImmediately
            ? {
                status: SubscriptionStatus.CANCELED,
                cancelAtPeriodEnd: false,
                updatedAt: cancelTimestamp,
              }
            : { cancelAtPeriodEnd: true, updatedAt: cancelTimestamp },
        });

        if (claim.count === 0) {
          return { claimed: false as const };
        }

        // Stripe is the only side effect with a cost: the key makes a retry
        // (e.g. commit failed after Stripe succeeded) return the first result.
        if (shouldCancelImmediately) {
          await paymentService.cancelImmediately(
            subscription.stripeSubscriptionId!,
            { idempotencyKey: `cancel:${subscription.id}:immediate` }
          );
        } else {
          await paymentService.cancelSubscription(
            subscription.stripeSubscriptionId!
          );
        }

        // Create audit log for refund decision
        await tx.invoiceAudit.create({
          data: {
            userId,
            subscriptionId: subscription.id,
            type: refundInfo.eligible ? "REFUND_ELIGIBLE" : "REFUND_INELIGIBLE",
            metadata: {
              cancelTimestamp: cancelTimestamp.toISOString(),
              periodStart: subscription.currentPeriodStart?.toISOString(),
              reason: refundInfo.reason,
              immediate: shouldCancelImmediately,
              inTrialPeriod: isInTrialPeriod,
              userReason: reason ?? null,
            },
          },
        });

        await writeAudit(
          {
            actorId: userId,
            action: "subscription.canceled",
            targetType: "subscription",
            targetId: subscription.id,
            metadata: { immediate: shouldCancelImmediately, atPeriodEnd: !shouldCancelImmediately },
          },
          tx,
        );

        return { claimed: true as const };
      },
      { maxWait: 5000, timeout: 20000 }
    );

    const result = await db.subscription.findUniqueOrThrow({
      where: { id: subscription.id },
      select: {
        id: true,
        status: true,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: true,
      },
    });

    if (!outcome.claimed) {
      // A concurrent request already did the work: same end state, no new Stripe call
      return {
        success: true,
        message: "Subscription is already cancelled",
        alreadyCancelled: true,
        subscription: result,
        refund: refundInfo,
      };
    }

    // Analytics must never fail a completed cancellation
    try {
      await AnalyticsHelper.recordSubscriptionEvent(
        userId,
        "SUBSCRIPTION_CANCELED",
        {
          subscriptionId: subscription.id,
          plan: subscription.plan as "monthly" | "yearly" | "lifetime",
          status: shouldCancelImmediately ? "canceled" : "active",
          timestamp: cancelTimestamp.toISOString(),
        }
      );
      // No refund event here: this action never refunds, requestRefund does (and records the real amount)
    } catch (analyticsError) {
      console.warn("Cancellation analytics failed", analyticsError);
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/billing");

    const message = shouldCancelImmediately
      ? isInTrialPeriod
        ? "Subscription cancelled immediately (trial period)"
        : "Subscription cancelled immediately with refund eligibility"
      : "Subscription will be cancelled at the end of current period";

    return {
      success: true,
      message,
      subscription: result,
      refund: refundInfo,
    };
  } catch (error) {
    console.error("Subscription cancellation failed:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Invalid input data",
        error: "VALIDATION_ERROR",
      };
    }

    return {
      success: false,
      message: "Failed to cancel subscription",
      error: "INTERNAL_ERROR",
    };
  }
}
