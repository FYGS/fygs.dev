import type Stripe from "stripe";
import { stripe } from "../stripe";
import { db } from "../db";
import {
  Prisma,
} from "@/lib/generated/prisma/browser";
import { createLogger } from "../structured-logger";
import { stripeRefId } from "../stripe-shapes";
import { StripeBilling } from "./billing";

/** Subscription lifecycle on Stripe: price switch, cancellation, refunds, retrieval. */
export class SubscriptionManagement extends StripeBilling {
  // Switch subscription price (monthly <-> yearly)
  async switchSubscriptionPrice(
    stripeSubscriptionId: string,
    newPriceId: string,
  ) {
    try {
      const subscription =
        await stripe.subscriptions.retrieve(stripeSubscriptionId);
      const currentItemId = subscription.items.data[0].id;
      // A switch between a monthly and a yearly price changes the billing interval, so Stripe restarts the cycle today.
      // "create_prorations" only queued the credit and the new price and left a period of zero length: a 551 EUR invoice
      // (261 of proration + a whole year again) fell due minutes later, and the learner had the yearly plan for nothing
      // meanwhile. "always_invoice" credits the unused time and charges the new price now (261 EUR for a switch three
      // minutes after a 29 EUR month), "error_if_incomplete" makes the switch fail, with nothing changed, if the card
      // is refused.
      const updated = await stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: false,
        proration_behavior: "always_invoice",
        payment_behavior: "error_if_incomplete",
        items: [{ id: currentItemId, price: newPriceId }],
        expand: ["latest_invoice"],
      });
      // The invoice of the switch is a real one: audit what was actually charged, not a preview of the next invoice
      // (its amount mixed the proration with the next renewal).
      try {
        const invoice =
          updated.latest_invoice && typeof updated.latest_invoice === "object"
            ? updated.latest_invoice
            : null;
        if (db.invoiceAudit && invoice) {
          const prorationCents = (invoice.lines?.data ?? [])
            .filter((line) => line.parent?.subscription_item_details?.proration)
            .reduce((sum, line) => sum + line.amount, 0);
          await db.invoiceAudit
            .create({
              data: {
                userId:
                  subscription.metadata?.userId ||
                  stripeRefId(subscription.customer) ||
                  "unknown",
                stripeInvoiceId: invoice.id ?? null,
                type: "PRORATION",
                amount: new Prisma.Decimal(
                  ((invoice.amount_paid || 0) / 100).toFixed(2),
                ),
                currency: invoice.currency,
                metadata: {
                  chargedCents: invoice.amount_paid ?? 0,
                  creditedCents: prorationCents,
                  stripeSubscriptionId,
                  newPriceId,
                },
              },
            })
            .catch(() => {});
        }
      } catch (e) {
        console.warn("Could not log proration invoice", e);
      }
      return true;
    } catch (error) {
      console.error("Failed to switch subscription price", error);
      throw new Error("PRICE_SWITCH_FAILED");
    }
  }

  // Immediate cancellation (not at period end) with optional refund (within grace period logic at caller)
  async cancelImmediately(
    stripeSubscriptionId: string,
    options: { idempotencyKey?: string } = {},
  ) {
    try {
      if (options.idempotencyKey) {
        await stripe.subscriptions.cancel(stripeSubscriptionId, undefined, {
          idempotencyKey: options.idempotencyKey,
        });
      } else {
        await stripe.subscriptions.cancel(stripeSubscriptionId);
      }
      return true;
    } catch (error) {
      // Cancelled meanwhile (the idempotency key expired, a dispute or another tab did it): the goal is reached
      const current = await stripe.subscriptions.retrieve(stripeSubscriptionId).catch(() => null);
      if (current?.status === "canceled") return true;
      console.error("Immediate cancellation failed", error);
      throw new Error("CANCEL_IMMEDIATE_FAILED");
    }
  }

  /**
   * Refund a PaymentIntent. Pass an idempotency key so that retrying the same
   * logical refund (double click, retry after a later step failed) returns the
   * original refund instead of creating or failing a second one.
   * Returns the Stripe refund id.
   */
  async refundPayment(
    stripePaymentIntentId: string,
    amountCents?: number,
    options: { idempotencyKey?: string } = {},
  ): Promise<string> {
    try {
      const refund = await stripe.refunds.create(
        {
          payment_intent: stripePaymentIntentId,
          amount: amountCents,
        },
        options.idempotencyKey
          ? { idempotencyKey: options.idempotencyKey }
          : undefined,
      );
      return refund.id;
    } catch (error) {
      // A retry after the idempotency key expired (24 h) finds the charge already refunded: that is success, the
      // caller goes on to the rest of the operation instead of leaving it half done
      if ((error as { code?: string } | null)?.code === "charge_already_refunded") {
        const existing = await stripe.refunds
          .list({ payment_intent: stripePaymentIntentId, limit: 1 })
          .catch(() => null);
        return existing?.data[0]?.id ?? "already_refunded";
      }
      console.error("Refund failed", error);
      throw new Error("REFUND_FAILED");
    }
  }

  /**
   * PaymentIntent behind the most recent paid invoice of a subscription, with
   * the amount actually paid. A subscription id (sub_...) is not a PaymentIntent
   * id, so refunds must go through the invoice.
   */
  async getLatestSubscriptionPayment(
    stripeSubscriptionId: string,
  ): Promise<{
    paymentIntentId: string;
    invoiceId: string;
    amountPaidCents: number;
    currency: string;
    /** When Stripe collected it: the refund window runs from here. */
    paidAt: Date;
  } | null> {
    const invoices = await stripe.invoices.list({
      subscription: stripeSubscriptionId,
      status: "paid",
      limit: 10,
    });
    // The payment that opened the period (first invoice or renewal). A plan switch produces small adjustment
    // invoices: they neither are what the learner asks to get back nor re-open a refund window.
    const invoice = invoices.data.find(
      (candidate) =>
        !!candidate.id &&
        candidate.amount_paid > 0 &&
        (candidate.billing_reason === "subscription_create" ||
          candidate.billing_reason === "subscription_cycle"),
    );
    if (!invoice?.id) return null;

    const payments = await stripe.invoicePayments.list({
      invoice: invoice.id,
      status: "paid",
      limit: 1,
    });
    const payment = payments.data[0]?.payment;
    if (!payment || payment.type !== "payment_intent" || !payment.payment_intent) {
      return null;
    }
    const paymentIntentId =
      typeof payment.payment_intent === "string"
        ? payment.payment_intent
        : payment.payment_intent.id;

    const paidAtSeconds = invoice.status_transitions?.paid_at ?? invoice.created;
    return {
      paymentIntentId,
      invoiceId: invoice.id,
      amountPaidCents: invoice.amount_paid,
      currency: invoice.currency,
      paidAt: new Date(paidAtSeconds * 1000),
    };
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      throw new Error("Failed to cancel subscription");
    }
  }

  // Get subscription details
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    const logger = createLogger({
      operation: "get-subscription",
      resourceType: "subscription",
      resourceId: subscriptionId,
    });

    try {
      // Attempt to retrieve the subscription with expanded items
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ["items.data.price", "latest_invoice"],
      });

      if (!subscription) {
        logger.error("Subscription not found", {
          resourceId: subscriptionId,
        });
        throw new Error(`Subscription with ID ${subscriptionId} not found`);
      }

      logger.info("Successfully retrieved subscription", {
        resourceId: subscriptionId,
        metadata: {
          status: subscription.status,
          hasItems: subscription.items.data.length > 0,
        },
      });

      return subscription;
    } catch (error) {
      logger.error("Failed to get subscription", {
        resourceId: subscriptionId,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
        },
      });

      // Preserve the original error message in the thrown error
      throw new Error(
        `Failed to get subscription: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
