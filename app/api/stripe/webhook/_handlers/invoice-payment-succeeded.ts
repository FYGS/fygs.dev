import type Stripe from "stripe";
import { paymentService } from "@/lib/payment-service";
import { PaymentKind } from "@/lib/generated/prisma/browser";
import { Analytics } from "@/lib/analytics-helper";
import { settlePayment } from "@/lib/payments/settle";
import {
  applySubscriptionState,
  cancelDuplicateSubscription,
  subscriptionStateFromStripe,
} from "@/lib/payments/subscription-state";
import { logger } from "../_lib/logger";
import { getInvoiceSubscriptionId } from "../_lib/invoice";

const DESCRIPTIONS: Record<string, string> = {
  subscription_create: "Abonnement Premium",
  subscription_cycle: "Renouvellement abonnement Premium",
};

export async function handleInvoicePaymentSucceeded(event: Stripe.InvoicePaymentSucceededEvent): Promise<void> {
  try {
    const invoice = event.data.object as unknown as {
      id: string;
      billing_reason?: string;
      amount_paid?: number;
      currency?: string;
    };

    const subscriptionId = getInvoiceSubscriptionId(invoice);
    if (!subscriptionId) return;

    // Stripe's current state of the subscription, stored through the central rules (Premium plans only, one per user)
    const subscription = await paymentService.getSubscription(subscriptionId);
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    const outcome = await applySubscriptionState(subscriptionStateFromStripe(userId, subscription));
    if (outcome === "duplicate_active") {
      await cancelDuplicateSubscription(paymentService, userId, subscriptionId);
      return;
    }
    if (outcome === "unknown_price") return;

    // One payment row per invoice (the reference column holds the invoice id): keying on the subscription id made
    // every renewal overwrite the same row. The FIRST invoice is the payment the checkout already announced
    // (checkout.session.completed settles the same payment, in any order): that placeholder row is settled instead of
    // adding a second row for one payment.
    try {
      const isFirstInvoice = invoice.billing_reason === "subscription_create";
      await settlePayment({
        userId,
        kind: PaymentKind.SUBSCRIPTION,
        knownReferences: [invoice.id],
        reference: invoice.id,
        amountCents: invoice.amount_paid || 0,
        currency: invoice.currency || "eur",
        description: DESCRIPTIONS[invoice.billing_reason ?? ""] ?? "Ajustement d’abonnement Premium",
        adoptPending: isFirstInvoice,
      });
    } catch (paymentError) {
      logger.error("Error recording subscription payment", {
        eventType: "webhook.payment_recording_error",
        userId,
        resourceType: "payment",
        metadata: { error: paymentError instanceof Error ? paymentError.message : String(paymentError) },
      });
    }

    logger.info("Subscription payment succeeded", {
      eventType: "payment.succeeded",
      userId,
      resourceType: "subscription",
      resourceId: subscriptionId,
      metadata: { invoiceId: invoice.id },
    });

    Analytics.subscriptionRenewed(userId, {
      invoiceId: invoice.id,
      subscriptionId,
      amount: (invoice.amount_paid || 0) / 100,
    });
  } catch (error) {
    logger.error(
      "Error processing payment success",
      { eventType: "webhook.payment_success_error", resourceType: "invoice" },
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
}
