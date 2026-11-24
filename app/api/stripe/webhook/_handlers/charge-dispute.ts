import type Stripe from "stripe";
import { db } from "@/lib/db";
import { paymentService } from "@/lib/payment-service";
import { stripe } from "@/lib/stripe";
import { writeAudit } from "@/lib/audit";
import { PaymentKind, PaymentStatus, SubscriptionStatus } from "@/lib/generated/prisma/browser";
import { applySubscriptionEnded } from "@/lib/payments/subscription-state";
import { notifyDispute } from "@/lib/payments/notify";
import { logger } from "../_lib/logger";
import { paymentReferencesFor } from "../_lib/payment-references";

/**
 * A chargeback. The cardholder asks the bank to take the money back; until the bank decides, keeping the access would
 * give the product for free if the dispute is lost.
 *
 *  - opened: the payment becomes DISPUTED (the entitlement rule ignores it: access suspended, progress kept); a
 *    disputed SUBSCRIPTION payment also ends the subscription, so that the card is not billed again;
 *  - closed in our favour (won, or an early warning that closed): back to COMPLETED, access returns;
 *  - closed against us (lost): REFUNDED, the money is gone, so is the access.
 *
 * Every transition is audited. Safe to run twice: only a payment in the expected state is touched.
 */

const WON = new Set(["won", "warning_closed", "prevented"]);
const LOST = new Set(["lost", "charge_refunded"]);

async function paymentsOf(dispute: Stripe.Dispute) {
  const references = await paymentReferencesFor(dispute.payment_intent);
  if (references.length === 0) return [];
  return db.payment.findMany({
    where: { stripePaymentIntentId: { in: references } },
    select: { id: true, userId: true, kind: true, status: true, amount: true, currency: true, course: { select: { title: true } } },
  });
}

export async function handleChargeDisputeCreated(event: Stripe.ChargeDisputeCreatedEvent): Promise<void> {
  try {
    const dispute = event.data.object;
    const payments = await paymentsOf(dispute);
    if (payments.length === 0) {
      // Not "processed": the payment may simply not be recorded yet (a dispute can be opened the instant a charge is
      // made, before checkout.session.completed or invoice.payment_succeeded has settled it). Failing makes Stripe
      // deliver the event again later, when the payment exists; swallowing it would lose the dispute for good.
      logger.warn("Dispute matches no payment yet: Stripe will retry", {
        eventType: "webhook.dispute_unmatched",
        resourceType: "dispute",
        resourceId: dispute.id,
      });
      throw new Error("DISPUTE_PAYMENT_NOT_FOUND");
    }

    // A delivery that comes late (the retry above) may find the dispute already decided: the closing event decides
    // the payment, an opening event must not reopen it
    const live = await stripe.disputes.retrieve(dispute.id).catch(() => null);
    if (live && (WON.has(live.status) || LOST.has(live.status))) {
      logger.info("Dispute already decided when its opening is processed: left to the closing event", {
        eventType: "webhook.dispute_opening_stale",
        resourceType: "dispute",
        resourceId: dispute.id,
        metadata: { status: live.status },
      });
      return;
    }

    for (const payment of payments) {
      const { count } = await db.payment.updateMany({
        where: { id: payment.id, status: PaymentStatus.COMPLETED },
        data: { status: PaymentStatus.DISPUTED },
      });
      if (count === 0) continue; // already refunded, already disputed, or a redelivery

      await db.invoiceAudit.create({
        data: {
          userId: payment.userId,
          paymentId: payment.id,
          type: "DISPUTE_OPENED",
          amount: dispute.amount / 100,
          currency: dispute.currency,
          metadata: { stripeDisputeId: dispute.id, reason: dispute.reason, paymentKind: payment.kind },
        },
      });
      await writeAudit({
        actorId: null,
        action: "payment.disputed",
        targetType: "payment",
        targetId: payment.id,
        metadata: { disputeId: dispute.id, reason: dispute.reason, kind: payment.kind },
      });
      logger.warn("Payment disputed: access suspended", {
        eventType: "payment.disputed",
        userId: payment.userId,
        resourceType: "payment",
        resourceId: payment.id,
        metadata: { disputeId: dispute.id, reason: dispute.reason },
      });

      if (payment.kind === PaymentKind.SUBSCRIPTION) await endSubscriptionAfterDispute(payment.userId, dispute.id);

      await notifyDispute(payment.userId, {
        product: payment.course?.title ? `la formation « ${payment.course.title} »` : "l’abonnement Premium",
      });
    }
  } catch (error) {
    logger.error(
      "Error processing charge.dispute.created",
      { eventType: "webhook.dispute_created_error", resourceType: "dispute" },
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
}

async function endSubscriptionAfterDispute(userId: string, disputeId: string): Promise<void> {
  const subscription = await db.subscription.findUnique({
    where: { userId },
    select: { stripeSubscriptionId: true, status: true },
  });
  if (!subscription?.stripeSubscriptionId || subscription.status === SubscriptionStatus.CANCELED) return;

  // Stripe first: if it fails the webhook fails and Stripe retries (the payment is already DISPUTED, so the step is skipped
  // on the retry; the subscription is therefore also ended from the stored state below, never left running)
  await paymentService.cancelImmediately(subscription.stripeSubscriptionId, {
    idempotencyKey: `dispute-cancel:${disputeId}`,
  });
  await applySubscriptionEnded(subscription.stripeSubscriptionId);
  await writeAudit({
    actorId: null,
    action: "subscription.canceled",
    targetType: "subscription",
    targetId: subscription.stripeSubscriptionId,
    metadata: { reason: "dispute", disputeId, userId },
  });
}

export async function handleChargeDisputeClosed(event: Stripe.ChargeDisputeClosedEvent): Promise<void> {
  try {
    const dispute = event.data.object;
    const won = WON.has(dispute.status);
    const lost = LOST.has(dispute.status);
    if (!won && !lost) {
      logger.warn("Dispute closed with a status that decides nothing", {
        eventType: "webhook.dispute_closed_undecided",
        resourceType: "dispute",
        resourceId: dispute.id,
        metadata: { status: dispute.status },
      });
      return;
    }

    const payments = await paymentsOf(dispute);
    if (payments.length === 0) {
      logger.warn("Closed dispute matches no payment yet: Stripe will retry", {
        eventType: "webhook.dispute_unmatched",
        resourceType: "dispute",
        resourceId: dispute.id,
      });
      throw new Error("DISPUTE_PAYMENT_NOT_FOUND");
    }
    for (const payment of payments) {
      const target = won ? PaymentStatus.COMPLETED : PaymentStatus.REFUNDED;
      // Restoring does not touch the settlement date: the refund window does not reopen. A lost dispute also refunds a
      // payment whose opening was not recorded (events can arrive in any order): the money is gone either way.
      const { count } = await db.payment.updateMany({
        where: {
          id: payment.id,
          status: won ? PaymentStatus.DISPUTED : { in: [PaymentStatus.DISPUTED, PaymentStatus.COMPLETED] },
        },
        data: { status: target },
      });
      if (count === 0) continue;

      await db.invoiceAudit.create({
        data: {
          userId: payment.userId,
          paymentId: payment.id,
          type: won ? "DISPUTE_WON" : "DISPUTE_LOST",
          amount: dispute.amount / 100,
          currency: dispute.currency,
          metadata: { stripeDisputeId: dispute.id, status: dispute.status, paymentKind: payment.kind },
        },
      });
      await writeAudit({
        actorId: null,
        action: "payment.disputed",
        targetType: "payment",
        targetId: payment.id,
        metadata: { disputeId: dispute.id, closedAs: dispute.status, restored: won },
      });
      logger.info(won ? "Dispute won: access restored" : "Dispute lost: payment refunded", {
        eventType: won ? "payment.dispute_won" : "payment.dispute_lost",
        userId: payment.userId,
        resourceType: "payment",
        resourceId: payment.id,
        metadata: { disputeId: dispute.id, status: dispute.status },
      });
    }
  } catch (error) {
    logger.error(
      "Error processing charge.dispute.closed",
      { eventType: "webhook.dispute_closed_error", resourceType: "dispute" },
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
}
