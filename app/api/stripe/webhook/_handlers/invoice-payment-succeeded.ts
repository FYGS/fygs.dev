import type Stripe from "stripe";
import { paymentService } from "@/lib/payment-service";
import { db } from "@/lib/db";
import { Prisma, PaymentStatus, PaymentKind, SubscriptionStatus } from "@prisma/client";
import { Analytics } from "@/lib/analytics-helper";
import { logger } from "../_lib/logger";

export async function handleInvoicePaymentSucceeded(event: Stripe.InvoicePaymentSucceededEvent): Promise<void> {
  try {
    const invoice = event.data.object as any;

    // Webhook is the single source of truth for successful subscription payments
    if (invoice.subscription) {
      const subscription = await paymentService.getSubscription(
        invoice.subscription as string,
      );
      const userId = subscription.metadata?.userId;

      if (userId) {
        // Ensure subscription status is ACTIVE
        await db.subscription.updateMany({
          where: {
            userId,
            stripeSubscriptionId: invoice.subscription as string,
          },
          data: {
            status: SubscriptionStatus.ACTIVE,
          },
        });

        // Update/Create payment record for this invoice
        try {
          const existingPayment = await db.payment.findFirst({
            where: {
              userId,
              stripePaymentIntentId: invoice.subscription,
              kind: PaymentKind.SUBSCRIPTION,
            },
          });

          const paymentData = {
            userId,
            stripePaymentIntentId: invoice.subscription,
            amount: new Prisma.Decimal(
              ((invoice.amount_paid || 0) / 100).toFixed(2),
            ),
            currency: invoice.currency || "eur",
            status: PaymentStatus.COMPLETED,
            description: "Renouvellement abonnement Premium",
            kind: PaymentKind.SUBSCRIPTION,
          };

          if (existingPayment) {
            await db.payment.update({
              where: { id: existingPayment.id },
              data: paymentData,
            });
          } else {
            await db.payment.create({ data: paymentData });
          }
        } catch (paymentError) {
          logger.error("Error recording subscription payment", {
            eventType: "webhook.payment_recording_error",
            userId,
            resourceType: "payment",
            metadata: {
              error:
                paymentError instanceof Error
                  ? paymentError.message
                  : String(paymentError),
            },
          });
          // Don't fail the webhook for payment recording errors
        }

        logger.info("Subscription payment succeeded", {
          eventType: "payment.succeeded",
          userId,
          resourceType: "subscription",
          resourceId: invoice.subscription,
          metadata: { invoiceId: invoice.id },
        });

        // Track analytics for renewal
        Analytics.subscriptionRenewed(userId, {
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription,
          amount: (invoice.amount_paid || 0) / 100,
        });
      }
    }
  } catch (error) {
    logger.error(
      "Error processing payment success",
      {
        eventType: "webhook.payment_success_error",
        resourceType: "invoice",
      },
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
}
