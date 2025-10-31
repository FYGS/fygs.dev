"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { paymentService } from "@/lib/payment-service";
import { isRefundEligible } from "@/lib/refund-policy";
import { AnalyticsHelper } from "@/lib/analytics-helper";
import { auth } from "@/lib/auth";
import { SubscriptionStatus } from "@prisma/client";

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

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
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

    // Call Stripe API for cancellation
    if (shouldCancelImmediately) {
      await paymentService.cancelImmediately(
        subscription.stripeSubscriptionId!
      );
    } else {
      await paymentService.cancelSubscription(
        subscription.stripeSubscriptionId!
      );
    }

    // Use transaction for atomic updates
    const result = await db.$transaction(async (tx) => {
      // Update subscription
      const updatedSubscription = await tx.subscription.update({
        where: { id: subscription.id },
        data: shouldCancelImmediately
          ? {
              status: SubscriptionStatus.CANCELED,
              cancelAtPeriodEnd: false,
              updatedAt: cancelTimestamp,
            }
          : {
              cancelAtPeriodEnd: true,
              updatedAt: cancelTimestamp,
            },
        select: {
          id: true,
          status: true,
          cancelAtPeriodEnd: true,
          currentPeriodEnd: true,
        },
      });

      // Log analytics event
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
          },
        },
      });

      // Log refund analytics
      if (refundInfo.eligible) {
        await AnalyticsHelper.recordRefund(userId, {
          originalAmount: 0, // TODO: Get actual amount from subscription
          refundAmount: 0, // TODO: Calculate refund amount
          currency: "EUR",
          reason: reason || "User initiated",
          eligibilityWindow: 14,
          subscriptionId: subscription.id,
          timestamp: cancelTimestamp.toISOString(),
        });
      }

      return updatedSubscription;
    });

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
