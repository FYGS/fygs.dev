import type Stripe from "stripe";
import { paymentService } from "@/lib/payment-service";
import { db } from "@/lib/db";
import { Prisma, PaymentStatus, PaymentKind, SubscriptionStatus } from "@/lib/generated/prisma/browser";
import { Analytics } from "@/lib/analytics-helper";
import { logger } from "../_lib/logger";
import { getInvoiceSubscriptionId } from "../_lib/invoice";

export async function handleInvoicePaymentSucceeded(event: Stripe.InvoicePaymentSucceededEvent): Promise<void> {
  try {
    const invoice = event.data.object as any;

    const subscriptionId = getInvoiceSubscriptionId(invoice);

    // Webhook is the single source of truth for successful subscription payments
    if (subscriptionId) {
      const subscription = await paymentService.getSubscription(subscriptionId);
      const userId = subscription.metadata?.userId;

      if (userId) {
        // Ensure subscription status is ACTIVE
        await db.subscription.updateMany({
          where: {
            userId,
            stripeSubscriptionId: subscriptionId,
          },
          data: {
            status: SubscriptionStatus.ACTIVE,
          },
        });

        // Update/Create payment record for this invoice
        try {
          // One payment row per invoice (the reference column holds the invoice id):
          // keying on the subscription id made every renewal overwrite the same row.
          //
          // The FIRST invoice of a subscription is the payment the checkout already
          // announced (checkout.session.completed settles the same payment, in any
          // order): settle the placeholder row the checkout route created instead of
          // adding a second row for one payment.
          const isFirstInvoice = invoice.billing_reason === "subscription_create";
          const existingPayment =
            (await db.payment.findFirst({
              where: {
                userId,
                stripePaymentIntentId: invoice.id,
                kind: PaymentKind.SUBSCRIPTION,
              },
            })) ??
            (isFirstInvoice
              ? await db.payment.findFirst({
                  where: {
                    userId,
                    kind: PaymentKind.SUBSCRIPTION,
                    status: PaymentStatus.PENDING,
                  },
                })
              : null);

          const paymentData = {
            userId,
            stripePaymentIntentId: invoice.id,
            amount: new Prisma.Decimal(
              ((invoice.amount_paid || 0) / 100).toFixed(2),
            ),
            currency: invoice.currency || "eur",
            status: PaymentStatus.COMPLETED,
            description: isFirstInvoice
              ? "Abonnement Premium"
              : "Renouvellement abonnement Premium",
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
          resourceId: subscriptionId,
          metadata: { invoiceId: invoice.id },
        });

        // Track analytics for renewal
        Analytics.subscriptionRenewed(userId, {
          invoiceId: invoice.id,
          subscriptionId,
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
