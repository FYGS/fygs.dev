import type Stripe from "stripe";
import { stripe } from "../stripe";
import { db } from "../db";
import {
  Prisma,
} from "@prisma/client";
import { createLogger } from "../structured-logger";
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
      await stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: false,
        proration_behavior: "create_prorations",
        items: [{ id: currentItemId, price: newPriceId }],
      });
      // Attempt to capture upcoming invoice for audit (proration)
      try {
        // Type casting because Stripe types may not include retrieveUpcoming in current version
        const invoicesAny: any = stripe.invoices as any;
        const upcoming = await invoicesAny
          .retrieveUpcoming({ subscription: stripeSubscriptionId })
          .catch(() => null);
        if (upcoming && upcoming.id && db.invoiceAudit) {
          const amountDue = new Prisma.Decimal(
            ((upcoming.amount_due || 0) / 100).toFixed(2),
          );

          // Check if audit already exists
          const existingAudit = await db.invoiceAudit
            .findFirst({
              where: { stripeInvoiceId: upcoming.id },
            })
            .catch(() => null);

          if (!existingAudit) {
            await db.invoiceAudit
              .create({
                data: {
                  userId:
                    (subscription as any).metadata?.userId ||
                    (subscription.customer as string) ||
                    "unknown",
                  stripeInvoiceId: upcoming.id,
                  type: "PRORATION",
                  amount: amountDue,
                },
              })
              .catch(() => {});
          }
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
  async cancelImmediately(stripeSubscriptionId: string) {
    try {
      await stripe.subscriptions.cancel(stripeSubscriptionId);
      return true;
    } catch (error) {
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
    amountPaidCents: number;
    currency: string;
  } | null> {
    const invoices = await stripe.invoices.list({
      subscription: stripeSubscriptionId,
      status: "paid",
      limit: 1,
    });
    const invoice = invoices.data[0];
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

    return {
      paymentIntentId,
      amountPaidCents: invoice.amount_paid,
      currency: invoice.currency,
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
