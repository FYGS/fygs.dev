"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { paymentService } from "@/lib/payment-service";
import { isRefundEligible } from "@/lib/refund-policy";
import { AnalyticsHelper } from "@/lib/analytics-helper";
import { SubscriptionStatus } from "@prisma/client";

const requestRefundSchema = z.object({
  subscriptionId: z.string().min(1, "Subscription ID is required"),
  reason: z.string().optional(),
});

export type RequestRefundResult = {
  success: boolean;
  message: string;
  refund?: {
    amount: number;
    currency: string;
    refundId: string;
  };
  error?: string;
};

export async function requestRefund(
  input: z.infer<typeof requestRefundSchema>
): Promise<RequestRefundResult> {
  try {
    // Validate input
    const validated = requestRefundSchema.parse(input);
    const { subscriptionId, reason } = validated;

    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

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
      where: {
        userId,
        stripeSubscriptionId: subscriptionId,
      },
      select: {
        id: true,
        status: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        stripeSubscriptionId: true,
        stripeCustomerId: true,
      },
    });

    if (!subscription) {
      return {
        success: false,
        message: "Subscription not found",
        error: "SUBSCRIPTION_NOT_FOUND",
      };
    }

    // Check refund eligibility (14-day window)
    if (!subscription.currentPeriodStart) {
      return {
        success: false,
        message: "Unable to determine subscription start date",
        error: "INVALID_PERIOD_START",
      };
    }

    const now = new Date();
    const eligible = isRefundEligible(subscription.currentPeriodStart, now);

    if (!eligible) {
      return {
        success: false,
        message: "Refund period has expired (14 days)",
        error: "REFUND_PERIOD_EXPIRED",
      };
    }

    // Get the most recent payment for this subscription
    const recentPayment = await db.payment.findFirst({
      where: {
        userId,
        kind: "SUBSCRIPTION",
        status: "COMPLETED",
        stripePaymentIntentId: subscriptionId,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!recentPayment || !recentPayment.stripePaymentIntentId) {
      return {
        success: false,
        message: "No payment found for refund",
        error: "NO_PAYMENT_FOUND",
      };
    }

    // Calculate refund amount (full refund within 14 days)
    const refundAmount = Math.round(Number(recentPayment.amount) * 100); // Convert to cents

    try {
      // Process refund through Stripe
      await paymentService.refundPayment(
        recentPayment.stripePaymentIntentId,
        refundAmount
      );

      // Update subscription status to canceled
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: SubscriptionStatus.CANCELED,
          cancelAtPeriodEnd: false,
          updatedAt: now,
        },
      });

      // Create audit record
      await db.invoiceAudit.create({
        data: {
          userId,
          subscriptionId: subscription.id,
          type: "REFUND_PROCESSED",
          amount: recentPayment.amount,
          currency: recentPayment.currency,
          metadata: {
            refundReason: reason || "User requested refund",
            refundedAt: now.toISOString(),
            originalPaymentId: recentPayment.id,
            stripeSubscriptionId: subscriptionId,
          },
        },
      });

      // Track analytics
      await AnalyticsHelper.recordRefund(userId, {
        originalAmount: Number(recentPayment.amount),
        refundAmount: Number(recentPayment.amount),
        currency: recentPayment.currency.toUpperCase(),
        reason: reason || "User requested refund",
        eligibilityWindow: 14,
        subscriptionId: subscription.id,
        timestamp: now.toISOString(),
      });

      // Revalidate paths
      revalidatePath("/dashboard/billing");
      revalidatePath("/dashboard");

      return {
        success: true,
        message:
          "Refund processed successfully. Your subscription has been canceled.",
        refund: {
          amount: Number(recentPayment.amount),
          currency: recentPayment.currency,
          refundId: subscriptionId, // Stripe refund ID would be better but this works
        },
      };
    } catch (stripeError) {
      console.error("Stripe refund failed:", stripeError);
      return {
        success: false,
        message: "Failed to process refund with payment provider",
        error: "STRIPE_REFUND_FAILED",
      };
    }
  } catch (error) {
    console.error("Request refund error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Invalid input data",
        error: "VALIDATION_ERROR",
      };
    }

    return {
      success: false,
      message: "Failed to process refund request",
      error: "INTERNAL_ERROR",
    };
  }
}
