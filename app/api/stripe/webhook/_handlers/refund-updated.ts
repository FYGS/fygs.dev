import type Stripe from "stripe";
import { db } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { PaymentKind, PaymentStatus } from "@/lib/generated/prisma/browser";
import { logger } from "../_lib/logger";
import { paymentReferencesFor } from "../_lib/payment-references";

/**
 * A refund can fail after we recorded it (closed bank account, card cancelled): Stripe then moves the refund to
 * `failed` or `canceled` and the money stays with the platform. The purchase we marked REFUNDED was therefore NOT
 * given back: a course purchase returns to COMPLETED (the learner paid and keeps the course), and the failure is
 * audited so that support settles it with the customer. A subscription stays cancelled (it was ended on purpose): only
 * the audit trail records the failure.
 *
 * Handles `refund.updated` and `charge.refund.updated`.
 */
export async function handleRefundUpdated(event: Stripe.RefundUpdatedEvent | Stripe.ChargeRefundUpdatedEvent): Promise<void> {
  try {
    const refund = event.data.object as Stripe.Refund;
    if (refund.status !== "failed" && refund.status !== "canceled") return;

    const references = await paymentReferencesFor(refund.payment_intent);
    if (references.length === 0) return;
    const payments = await db.payment.findMany({
      where: { stripePaymentIntentId: { in: references }, status: PaymentStatus.REFUNDED },
      select: { id: true, userId: true, kind: true },
    });

    for (const payment of payments) {
      const alreadyAudited = await db.invoiceAudit.findFirst({
        where: { userId: payment.userId, type: "REFUND_FAILED", metadata: { path: ["stripeRefundId"], equals: refund.id } },
        select: { id: true },
      });
      if (alreadyAudited) continue;

      if (payment.kind === PaymentKind.COURSE) {
        await db.payment.updateMany({ where: { id: payment.id, status: PaymentStatus.REFUNDED }, data: { status: PaymentStatus.COMPLETED } });
      }
      await db.invoiceAudit.create({
        data: {
          userId: payment.userId,
          paymentId: payment.id,
          type: "REFUND_FAILED",
          amount: refund.amount / 100,
          currency: refund.currency,
          metadata: {
            stripeRefundId: refund.id,
            status: refund.status,
            failureReason: refund.failure_reason ?? null,
            paymentKind: payment.kind,
          },
        },
      });
      await writeAudit({
        actorId: null,
        action: "payment.refunded",
        targetType: "payment",
        targetId: payment.id,
        metadata: { refundId: refund.id, failed: true, status: refund.status },
      });
      logger.error("Refund failed after being recorded: to settle with the customer", {
        eventType: "payment.refund_failed",
        userId: payment.userId,
        resourceType: "payment",
        resourceId: payment.id,
        metadata: { refundId: refund.id, status: refund.status, kind: payment.kind },
      });
    }
  } catch (error) {
    logger.error(
      "Error processing refund update",
      { eventType: "webhook.refund_updated_error", resourceType: "refund" },
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
}
