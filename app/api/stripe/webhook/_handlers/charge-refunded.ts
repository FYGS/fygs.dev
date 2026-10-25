import type Stripe from "stripe";
import { db } from "@/lib/db";
import { PaymentStatus } from "@/lib/generated/prisma/browser";
import { logger } from "../_lib/logger";

const refId = (ref: string | { id: string } | null | undefined): string | null =>
  typeof ref === "string" ? ref : (ref?.id ?? null);

/**
 * A refund made outside the app (Stripe dashboard, support) reaches us only through
 * `charge.refunded`. A FULL refund marks the payment REFUNDED, which is what ends
 * the lifetime-purchase entitlement (`lib/access/entitlement.ts`); the
 * enrollment and the learner's progress are kept. A partial refund is recorded in the
 * audit trail but leaves access untouched. The subscription itself is never cancelled
 * here: stopping future billing stays an explicit decision in Stripe.
 *
 * Idempotent: a second delivery (or the refund the app itself issued through
 * `requestRefund`) changes nothing and writes no second audit row.
 */
export async function handleChargeRefunded(
  event: Stripe.ChargeRefundedEvent,
): Promise<void> {
  try {
    const charge = event.data.object;
    const paymentIntentId = refId(charge.payment_intent);
    // Subscription payments are keyed by invoice (see lib/payments/webhook.ts); the
    // field is absent from the newest API versions.
    const invoiceId = refId((charge as { invoice?: string | { id: string } | null }).invoice);
    const references = [paymentIntentId, invoiceId].filter(
      (reference): reference is string => !!reference,
    );

    const payments = references.length
      ? await db.payment.findMany({
          where: { stripePaymentIntentId: { in: references } },
          select: { id: true, userId: true, kind: true, status: true },
        })
      : [];

    if (payments.length === 0) {
      logger.warn("Refunded charge matches no payment, nothing to revoke", {
        eventType: "webhook.refund_unmatched",
        resourceType: "charge",
        resourceId: charge.id,
        metadata: { paymentIntentId, invoiceId },
      });
      return;
    }

    // Stripe sets `refunded` only when the whole charge has been refunded
    const fullyRefunded = charge.refunded === true;

    for (const payment of payments) {
      if (fullyRefunded && payment.status !== PaymentStatus.REFUNDED) {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.REFUNDED },
        });
      }

      const alreadyAudited = await db.invoiceAudit.findFirst({
        where: {
          userId: payment.userId,
          type: "CHARGE_REFUNDED",
          AND: [
            { metadata: { path: ["stripeChargeId"], equals: charge.id } },
            { metadata: { path: ["amountRefundedCents"], equals: charge.amount_refunded } },
          ],
        },
        select: { id: true },
      });
      if (alreadyAudited) continue;

      await db.invoiceAudit.create({
        data: {
          userId: payment.userId,
          paymentId: payment.id,
          type: "CHARGE_REFUNDED",
          amount: charge.amount_refunded / 100,
          currency: charge.currency,
          metadata: {
            stripeChargeId: charge.id,
            stripePaymentIntentId: paymentIntentId,
            amountRefundedCents: charge.amount_refunded,
            amountCents: charge.amount,
            fullyRefunded,
            paymentKind: payment.kind,
          },
        },
      });

      logger.info(
        fullyRefunded ? "Payment refunded, access revoked" : "Payment partially refunded",
        {
          eventType: fullyRefunded ? "payment.refunded" : "payment.partially_refunded",
          userId: payment.userId,
          resourceType: "payment",
          resourceId: payment.id,
          metadata: { chargeId: charge.id, kind: payment.kind },
        },
      );
    }
  } catch (error) {
    logger.error(
      "Error processing charge.refunded",
      { eventType: "webhook.charge_refunded_error", resourceType: "charge" },
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error; // Stripe retries; the idempotency claim is released by the route
  }
}
