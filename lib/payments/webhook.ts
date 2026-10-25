import type Stripe from "stripe";
import { db } from "../db";
import {
  Prisma,
  PaymentStatus,
  PaymentKind,
} from "@/lib/generated/prisma/browser";
import { Analytics } from "../analytics-helper";
import { createLogger } from "../structured-logger";
import { stripeRefId } from "../stripe-shapes";
import { AccessGrants } from "./access";
import { syncPathEnrollments } from "../paths/enrollment";

/** Handling of successful Stripe checkout sessions. */
export class PaymentWebhookHandler extends AccessGrants {
  /** The learner's paths take in the courses this payment just opened. Never fails the webhook. */
  private async syncPaths(userId: string, logger: ReturnType<typeof createLogger>): Promise<void> {
    try {
      await syncPathEnrollments(userId);
    } catch (error) {
      logger.error("Failed to sync path enrollments", {
        metadata: { userId, error: error instanceof Error ? error.message : String(error) },
      });
    }
  }

  // Handle successful payment
  async handlePaymentSuccess(session: Stripe.Checkout.Session): Promise<void> {
    // Safely extract metadata with fallbacks
    const metadata = session.metadata || {};
    const userId = metadata.userId;
    const productId = metadata.productId;
    const type = metadata.type;

    const logger = createLogger({
      operation: "payment-webhook",
      resourceType: "payment",
      resourceId: session.id,
    });

    // Log session details for diagnostics
    logger.info("Processing payment success", {
      resourceId: session.id,
      metadata: {
        type: type || "unknown",
        mode: session.mode || "unknown",
        hasUser: !!userId,
        hasProduct: !!productId,
        hasSubscription: !!session.subscription,
        hasPaymentIntent: !!session.payment_intent,
        paymentStatus: session.payment_status || "unknown",
      },
    });

    if (!userId) {
      logger.error("No userId in session metadata", {
        resourceId: session.id,
        metadata: {
          availableMetadata: Object.keys(metadata),
          sessionId: session.id,
          sessionMode: session.mode,
        },
      });
      return;
    }

    try {
      // Handle course purchase
      if (type === "course_purchase" && productId) {
        // Reference stored on the payment row: the PaymentIntent. A session that
        // was fully discounted (100% promotion code) is `paid` with amount 0 and has
        // NO PaymentIntent: the session id is the reference then, otherwise the
        // buyer would pay nothing and get no access.
        const paymentReference =
          stripeRefId(session.payment_intent) ??
          ((session.amount_total ?? 0) === 0 ? session.id : null);

        // Auto-enroll upon successful purchase to align with enrollment-required gating
        if (paymentReference) {
          // First, try to find and update existing pending payment record
          try {
            // The row this very session created (the checkout route stores the session
            // id as placeholder), or one a previous delivery already completed;
            // otherwise fall back to any pending purchase of that course.
            const existingPayment =
              (await db.payment.findFirst({
                where: {
                  userId,
                  courseId: productId,
                  kind: PaymentKind.COURSE,
                  stripePaymentIntentId: { in: [session.id, paymentReference] },
                },
              })) ??
              (await db.payment.findFirst({
                where: {
                  userId,
                  courseId: productId,
                  kind: PaymentKind.COURSE,
                  status: PaymentStatus.PENDING,
                },
              }));

            // Calculate safe amount
            const amountTotal = session.amount_total || 0;
            const amountDecimal = new Prisma.Decimal(
              (amountTotal / 100).toFixed(2),
            );

            if (existingPayment) {
              // Update existing payment record
              await db.payment.update({
                where: { id: existingPayment.id },
                data: {
                  stripePaymentIntentId: paymentReference,
                  amount: amountDecimal,
                  currency: session.currency || "eur",
                  status: PaymentStatus.COMPLETED,
                  description: `Achat formation ${productId}`,
                },
              });
              logger.info(
                `✅ Payment updated to COMPLETED for user ${userId}, course ${productId}`,
              );
            } else {
              // Create new payment record
              await db.payment.create({
                data: {
                  userId,
                  stripePaymentIntentId: paymentReference,
                  amount: amountDecimal,
                  currency: session.currency || "eur",
                  status: PaymentStatus.COMPLETED,
                  description: `Achat formation ${productId}`,
                  kind: PaymentKind.COURSE,
                  courseId: productId,
                },
              });
              logger.info(
                `✅ Payment created for user ${userId}, course ${productId}`,
              );
            }
          } catch (paymentError) {
            logger.error(`❌ Failed to record payment:`, {
              resourceId: session.id,
              metadata: {
                userId,
                productId,
                error:
                  paymentError instanceof Error
                    ? paymentError.message
                    : String(paymentError),
                errorStack:
                  paymentError instanceof Error
                    ? paymentError.stack
                    : undefined,
              },
            });
            throw paymentError; // Critical - don't continue if payment recording fails
          }

          try {
            // Auto-enroll the user (idempotent)
            await this.grantCourseAccess(userId, productId);
            logger.info(
              `✅ User ${userId} auto-enrolled in course ${productId}`,
            );
          } catch (enrollmentError) {
            logger.error(`❌ Failed to auto-enroll user:`, {
              resourceId: session.id,
              metadata: {
                userId,
                productId,
                error:
                  enrollmentError instanceof Error
                    ? enrollmentError.message
                    : String(enrollmentError),
                errorStack:
                  enrollmentError instanceof Error
                    ? enrollmentError.stack
                    : undefined,
              },
            });
            // Don't throw - payment is recorded, enrollment can be retried
          }

          await this.syncPaths(userId, logger);

          try {
            // Track analytics
            Analytics.coursePurchased(userId, {
              courseId: productId,
              amount: (session.amount_total || 0) / 100,
            });
          } catch (analyticsError) {
            logger.error(`❌ Failed to track analytics:`, {
              resourceId: session.id,
              metadata: {
                userId,
                error:
                  analyticsError instanceof Error
                    ? analyticsError.message
                    : String(analyticsError),
              },
            });
            // Don't throw - non-critical
          }
        } else {
          logger.warn(`No payment intent found for course purchase`, {
            resourceId: session.id,
            metadata: { userId, productId },
          });
        }
      }
      // Handle subscription
      else if (type === "subscription") {
        // Check if subscription ID is available
        if (!session.subscription) {
          logger.error(`Missing subscription ID in checkout session`, {
            resourceId: session.id,
            metadata: { userId, type },
          });
          return;
        }

        const subscriptionId = stripeRefId(session.subscription) as string;

        // Grant subscription access
        try {
          await this.grantSubscriptionAccess(userId, subscriptionId);
          logger.info(`✅ Subscription access granted for user ${userId}`, {
            resourceId: session.id,
            metadata: { subscriptionId },
          });
        } catch (subscriptionError) {
          logger.error(`❌ Failed to grant subscription access:`, {
            resourceId: session.id,
            metadata: {
              userId,
              subscriptionId,
              error:
                subscriptionError instanceof Error
                  ? subscriptionError.message
                  : String(subscriptionError),
              errorStack:
                subscriptionError instanceof Error
                  ? subscriptionError.stack
                  : undefined,
            },
          });
          throw subscriptionError; // Critical
        }

        await this.syncPaths(userId, logger);

        try {
          // Calculate safe amount
          const amountTotal = session.amount_total || 0;
          const amountDecimal = new Prisma.Decimal(
            (amountTotal / 100).toFixed(2),
          );

          // One payment row per invoice, like renewals (invoice.payment_succeeded):
          // the first invoice is paid by the checkout, and both events describe the
          // same payment, in any order. A subscription-mode session has no
          // PaymentIntent, so the session's invoice is the reference.
          const paymentReference = stripeRefId(session.invoice) ?? subscriptionId;

          // The row either event already settled, the placeholder this session
          // created at checkout, or else any pending subscription payment.
          const existingPayment =
            (await db.payment.findFirst({
              where: {
                userId,
                kind: PaymentKind.SUBSCRIPTION,
                stripePaymentIntentId: { in: [paymentReference, session.id] },
              },
            })) ??
            (await db.payment.findFirst({
              where: {
                userId,
                kind: PaymentKind.SUBSCRIPTION,
                status: PaymentStatus.PENDING,
              },
            }));

          if (existingPayment) {
            // Update existing payment record
            await db.payment.update({
              where: { id: existingPayment.id },
              data: {
                stripePaymentIntentId: paymentReference,
                amount: amountDecimal,
                currency: session.currency || "eur",
                status: PaymentStatus.COMPLETED,
              },
            });
            logger.info(
              `✅ Subscription payment updated to COMPLETED for user ${userId}`,
              {
                resourceId: session.id,
                metadata: { subscriptionId },
              },
            );
          } else {
            // Create new payment record
            await db.payment.create({
              data: {
                userId,
                stripePaymentIntentId: paymentReference,
                amount: amountDecimal,
                currency: session.currency || "eur",
                status: PaymentStatus.COMPLETED,
                description: "Abonnement Premium",
                kind: PaymentKind.SUBSCRIPTION,
              },
            });
            logger.info(`✅ Subscription payment created for user ${userId}`, {
              resourceId: session.id,
              metadata: { subscriptionId },
            });
          }
        } catch (paymentError) {
          logger.error(`❌ Failed to record subscription payment:`, {
            resourceId: session.id,
            metadata: {
              userId,
              subscriptionId,
              error:
                paymentError instanceof Error
                  ? paymentError.message
                  : String(paymentError),
              errorStack:
                paymentError instanceof Error ? paymentError.stack : undefined,
            },
          });
          // Don't throw - subscription is active, payment recording can be retried
        }

        try {
          // Extract billing cycle with fallback
          let billingCycle = (metadata as any)?.billingCycle || "unknown";

          // If billing cycle not in metadata, try to determine from price ID pattern
          if (billingCycle === "unknown" && metadata?.priceId) {
            const priceId = metadata.priceId;
            if (priceId.includes("monthly") || priceId.includes("month")) {
              billingCycle = "monthly";
            } else if (priceId.includes("yearly") || priceId.includes("year")) {
              billingCycle = "yearly";
            }
          }

          // Track analytics
          Analytics.subscriptionStarted(userId, {
            priceId: metadata?.priceId || "unknown",
            billingCycle,
            amount: (session.amount_total || 0) / 100,
          });

          logger.info(`✅ Subscription analytics tracked`, {
            resourceId: session.id,
            metadata: {
              userId,
              billingCycle,
              priceId: metadata?.priceId || "unknown",
            },
          });
        } catch (analyticsError) {
          logger.error(`❌ Failed to track subscription analytics:`, {
            resourceId: session.id,
            metadata: {
              userId,
              error:
                analyticsError instanceof Error
                  ? analyticsError.message
                  : String(analyticsError),
            },
          });
          // Don't throw - non-critical
        }
      } else {
        logger.warn(`Unhandled payment type: ${type || "unknown"}`, {
          resourceId: session.id,
          metadata: {
            userId,
            mode: session.mode,
            availableMetadata: Object.keys(metadata),
          },
        });
      }
    } catch (error) {
      logger.error("Failed to handle payment success:", {
        resourceId: session.id,
        metadata: {
          userId,
          type: type || "unknown",
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
        },
      });
      throw error; // Rethrow to trigger webhook retry
    }
  }
}
