import type Stripe from "stripe";
import { paymentService } from "@/lib/payment-service";
import { db } from "@/lib/db";
import { SubscriptionStatus } from "@/lib/generated/prisma/browser";
import { applySubscriptionState, subscriptionStateFromStripe } from "@/lib/payments/subscription-state";
import { emailService } from "@/lib/email-service";
import { Analytics } from "@/lib/analytics-helper";
import { logger } from "../_lib/logger";
import { getInvoiceSubscriptionId } from "../_lib/invoice";

export async function handleInvoicePaymentFailed(event: Stripe.InvoicePaymentFailedEvent): Promise<void> {
  try {
    const invoice = event.data.object as any;

    const subscriptionId = getInvoiceSubscriptionId(invoice);

    // Webhook is the single source of truth for payment failures
    if (subscriptionId) {
      const subscription = await paymentService.getSubscription(subscriptionId);
      const userId = subscription.metadata?.userId;

      if (userId) {
        // Stripe's current state (past_due, or already cancelled after the retries), stored through the central rules
        const outcome = await applySubscriptionState(subscriptionStateFromStripe(userId, subscription));
        if (outcome !== "applied") {
          logger.info("Payment failure not applied to the stored subscription", {
            eventType: "payment.failed_not_applied",
            userId,
            resourceType: "subscription",
            resourceId: subscriptionId,
            metadata: { outcome },
          });
          return;
        }

        const user = await db.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true },
        });

        if (user) {
          // Send payment failed notification email using modern template
          await emailService.sendPaymentFailedEmail(
            user.name || "Étudiant",
            user.email,
          );
          logger.info("Payment failed email sent", {
            eventType: "email.payment_failed_sent",
            userId,
            resourceType: "invoice",
            resourceId: invoice.id,
            metadata: {
              subscriptionId,
            },
          });
          Analytics.subscriptionPaymentFailed(userId, {
            invoiceId: invoice.id,
            subscriptionId,
          });
        }

        logger.warn("Subscription payment failed", {
          eventType: "payment.failed",
          userId,
          resourceType: "subscription",
          resourceId: subscriptionId,
          fromState: SubscriptionStatus.ACTIVE,
          toState: SubscriptionStatus.PAST_DUE,
          metadata: { invoiceId: invoice.id },
        });
      }
    }
  } catch (error) {
    logger.error(
      "Error processing payment failure",
      {
        eventType: "webhook.payment_failure_error",
        resourceType: "invoice",
      },
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
}
