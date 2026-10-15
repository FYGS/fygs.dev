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
  reason: z.string().max(500).optional(),
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

const fail = (message: string, error: string): RequestRefundResult => ({
  success: false,
  message,
  error,
});

export async function requestRefund(
  input: z.infer<typeof requestRefundSchema>
): Promise<RequestRefundResult> {
  try {
    const validated = requestRefundSchema.parse(input);
    const { subscriptionId, reason } = validated;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return fail("Authentication required", "UNAUTHORIZED");
    }

    const userId = session.user.id;

    // The subscription must belong to the caller
    const subscription = await db.subscription.findUnique({
      where: {
        userId,
        stripeSubscriptionId: subscriptionId,
      },
      select: {
        id: true,
        status: true,
        currentPeriodStart: true,
        stripeSubscriptionId: true,
      },
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      return fail("Subscription not found", "SUBSCRIPTION_NOT_FOUND");
    }

    // A subscription that is already canceled (or not paid) cannot be refunded again
    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      return fail("Subscription is not active", "SUBSCRIPTION_NOT_ACTIVE");
    }

    // Check refund eligibility (14-day window)
    if (!subscription.currentPeriodStart) {
      return fail(
        "Unable to determine subscription start date",
        "INVALID_PERIOD_START"
      );
    }

    const now = new Date();
    if (!isRefundEligible(subscription.currentPeriodStart, now)) {
      return fail("Refund period has expired (14 days)", "REFUND_PERIOD_EXPIRED");
    }

    try {
      // Stripe is the source of truth for what was paid and on which PaymentIntent.
      // (A subscription id is not a PaymentIntent id, so it cannot be refunded directly.)
      const payment = await paymentService.getLatestSubscriptionPayment(
        subscription.stripeSubscriptionId
      );

      if (!payment || payment.amountPaidCents <= 0) {
        return fail("No payment found for refund", "NO_PAYMENT_FOUND");
      }

      // Idempotent: retrying after a later step failed returns the same refund
      const refundId = await paymentService.refundPayment(
        payment.paymentIntentId,
        payment.amountPaidCents,
        { idempotencyKey: `refund:${subscription.id}:${payment.paymentIntentId}` }
      );

      // Stop future billing; otherwise the customer would be refunded and charged again
      await paymentService.cancelImmediately(subscription.stripeSubscriptionId);

      const amount = payment.amountPaidCents / 100;
      const currency = payment.currency;

      await db.$transaction([
        db.subscription.update({
          where: { id: subscription.id },
          data: {
            status: SubscriptionStatus.CANCELED,
            cancelAtPeriodEnd: false,
            updatedAt: now,
          },
        }),
        db.invoiceAudit.create({
          data: {
            userId,
            subscriptionId: subscription.id,
            type: "REFUND_PROCESSED",
            amount,
            currency,
            metadata: {
              refundReason: reason || "User requested refund",
              refundedAt: now.toISOString(),
              stripeRefundId: refundId,
              stripePaymentIntentId: payment.paymentIntentId,
              stripeSubscriptionId: subscription.stripeSubscriptionId,
            },
          },
        }),
      ]);

      // Analytics must never fail a completed refund
      await AnalyticsHelper.recordRefund(userId, {
        originalAmount: amount,
        refundAmount: amount,
        currency: currency.toUpperCase(),
        reason: reason || "User requested refund",
        eligibilityWindow: 14,
        subscriptionId: subscription.id,
        timestamp: now.toISOString(),
      }).catch((error: unknown) => {
        console.warn("Refund analytics failed", error);
      });

      revalidatePath("/dashboard/billing");
      revalidatePath("/dashboard");

      return {
        success: true,
        message:
          "Refund processed successfully. Your subscription has been canceled.",
        refund: { amount, currency, refundId },
      };
    } catch (stripeError) {
      console.error("Stripe refund failed:", stripeError);
      return fail(
        "Failed to process refund with payment provider",
        "STRIPE_REFUND_FAILED"
      );
    }
  } catch (error) {
    console.error("Request refund error:", error);

    if (error instanceof z.ZodError) {
      return fail("Invalid input data", "VALIDATION_ERROR");
    }

    return fail("Failed to process refund request", "INTERNAL_ERROR");
  }
}
