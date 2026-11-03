"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { paymentService } from "@/lib/payment-service";
import { isRefundEligible, REFUND_WINDOW_DAYS } from "@/lib/refund-policy";
import { AnalyticsHelper } from "@/lib/analytics-helper";
import { isSubscriptionActive } from "@/lib/access/entitlement";
import { writeAudit } from "@/lib/audit";
import { withPurchaseLock } from "@/lib/payments/locks";
import { notifyRefund } from "@/lib/payments/notify";
import { CourseAccessTier, PaymentKind, PaymentStatus, SubscriptionStatus } from "@/lib/generated/prisma/browser";

const requestRefundSchema = z.object({
  subscriptionId: z.string().min(1, "Abonnement manquant"),
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

/**
 * Refunds the payment that opened the current period of the Premium subscription and ends the subscription.
 *
 *  - The 14 days run from the day Stripe collected that payment (`paidAt`), not from the period start, which a plan
 *    change moves: a switch can neither reopen the window nor make an older, larger invoice refundable.
 *  - Refused once the learner earned a certificate with the subscription, as for a course bought on its own.
 *  - The whole operation runs under the buyer's purchase lock (shared with certificate issuance and checkout) and the
 *    Stripe calls are made inside the transaction: a failure records nothing, a retry is idempotent (same refund,
 *    "already refunded" counts as done, cancelling a cancelled subscription counts as done).
 *  - A refund starts a 12 months wait before the subscription can be bought again (lib/payments/refund-guard.ts).
 */
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
      return fail("Connectez-vous pour continuer.", "UNAUTHORIZED");
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
        currentPeriodEnd: true,
        stripeSubscriptionId: true,
      },
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      return fail("Abonnement introuvable.", "SUBSCRIPTION_NOT_FOUND");
    }

    // A subscription that is already canceled (or not paid) cannot be refunded again
    if (!isSubscriptionActive(subscription)) {
      return fail("Cet abonnement n’est pas actif.", "SUBSCRIPTION_NOT_ACTIVE");
    }

    const now = new Date();
    const stripeSubscriptionId = subscription.stripeSubscriptionId;

    try {
      // Stripe is the source of truth for what was paid, on which PaymentIntent and WHEN.
      // (A subscription id is not a PaymentIntent id, so it cannot be refunded directly.)
      const payment = await paymentService.getLatestSubscriptionPayment(stripeSubscriptionId);

      if (!payment || payment.amountPaidCents <= 0) {
        return fail("Aucun paiement à rembourser n’a été trouvé.", "NO_PAYMENT_FOUND");
      }
      if (!isRefundEligible(payment.paidAt, now)) {
        return fail(`Le délai de remboursement de ${REFUND_WINDOW_DAYS} jours est dépassé.`, "REFUND_PERIOD_EXPIRED");
      }

      // Under the buyer's purchase lock, the same one certificate issuance takes: either the certificate is issued
      // first (and the refund is refused below) or the refund commits first (and no certificate is issued afterwards).
      const outcome = await withPurchaseLock(userId, null, async (tx) => {
        const fresh = await tx.subscription.findUnique({
          where: { id: subscription.id },
          select: { status: true, currentPeriodEnd: true },
        });
        if (!fresh || !isSubscriptionActive(fresh)) return { ok: false as const, error: "SUBSCRIPTION_NOT_ACTIVE" };

        // A certificate earned with the subscription (premium courses not bought separately) since this payment: the
        // service was delivered, like a finished course bought on its own
        const earned = await tx.certificate.findFirst({
          where: {
            userId,
            issuedAt: { gte: payment.paidAt },
            course: {
              accessTier: CourseAccessTier.PREMIUM,
              payments: { none: { userId, kind: PaymentKind.COURSE, status: PaymentStatus.COMPLETED } },
            },
          },
          select: { id: true },
        });
        if (earned) return { ok: false as const, error: "CERTIFICATE_EARNED" };

        // Idempotent: retrying after a later step failed returns the same refund
        const refundId = await paymentService.refundPayment(payment.paymentIntentId, payment.amountPaidCents, {
          idempotencyKey: `refund:${subscription.id}:${payment.paymentIntentId}`,
        });
        // Stop future billing; otherwise the customer would be refunded and charged again
        await paymentService.cancelImmediately(stripeSubscriptionId, {
          idempotencyKey: `cancel:${stripeSubscriptionId}:immediate`,
        });

        const amount = payment.amountPaidCents / 100;
        await tx.subscription.update({
          where: { id: subscription.id },
          data: { status: SubscriptionStatus.CANCELED, cancelAtPeriodEnd: false, updatedAt: now },
        });
        await tx.payment.updateMany({
          where: {
            userId,
            kind: PaymentKind.SUBSCRIPTION,
            status: PaymentStatus.COMPLETED,
            stripePaymentIntentId: { in: [payment.invoiceId, payment.paymentIntentId] },
          },
          data: { status: PaymentStatus.REFUNDED },
        });
        await tx.invoiceAudit.create({
          data: {
            userId,
            subscriptionId: subscription.id,
            type: "REFUND_PROCESSED",
            amount,
            currency: payment.currency,
            metadata: {
              refundReason: reason || "User requested refund",
              refundedAt: now.toISOString(),
              stripeRefundId: refundId,
              stripePaymentIntentId: payment.paymentIntentId,
              stripeSubscriptionId,
            },
          },
        });
        await writeAudit(
          {
            actorId: userId,
            action: "payment.refunded",
            targetType: "subscription",
            targetId: subscription.id,
            metadata: { refundId, amount, currency: payment.currency },
          },
          tx,
        );
        return { ok: true as const, refundId, amount, currency: payment.currency };
      });

      if (!outcome.ok) {
        return outcome.error === "CERTIFICATE_EARNED"
          ? fail(
              "Vous avez obtenu un certificat avec cet abonnement : le service a été rendu, le remboursement n’est plus possible.",
              "CERTIFICATE_EARNED",
            )
          : fail("Cet abonnement n’est pas actif.", "SUBSCRIPTION_NOT_ACTIVE");
      }

      const { amount, currency, refundId } = outcome;

      // Analytics and the confirmation e-mail must never fail a completed refund
      await Promise.all([
        AnalyticsHelper.recordRefund(userId, {
          originalAmount: amount,
          refundAmount: amount,
          currency: currency.toUpperCase(),
          reason: reason || "User requested refund",
          eligibilityWindow: 14,
          subscriptionId: subscription.id,
          timestamp: now.toISOString(),
        }).catch((error: unknown) => {
          console.warn("Refund analytics failed", error);
        }),
        notifyRefund(userId, { product: "l’abonnement Premium", amount, currency }),
      ]);

      revalidatePath("/dashboard/billing");
      revalidatePath("/dashboard");

      return {
        success: true,
        message: "Remboursement effectué : votre abonnement est arrêté. Le montant revient sur votre moyen de paiement sous 5 à 10 jours.",
        refund: { amount, currency, refundId },
      };
    } catch (stripeError) {
      console.error("Stripe refund failed:", stripeError);
      return fail("Le remboursement n’a pas pu être traité. Réessayez ou contactez le support.", "STRIPE_REFUND_FAILED");
    }
  } catch (error) {
    console.error("Request refund error:", error);

    if (error instanceof z.ZodError) {
      return fail("Données invalides.", "VALIDATION_ERROR");
    }

    return fail("La demande de remboursement a échoué. Réessayez dans un instant.", "INTERNAL_ERROR");
  }
}
