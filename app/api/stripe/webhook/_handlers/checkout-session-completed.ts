import type Stripe from "stripe";
import { paymentService } from "@/lib/payment-service";
import { db } from "@/lib/db";
import { SubscriptionStatus } from "@prisma/client";
import { emailService } from "@/lib/email-service";
import { logger } from "../_lib/logger";

export async function handleCheckoutSessionCompleted(event: Stripe.CheckoutSessionCompletedEvent): Promise<void> {
  try {
    const session = event.data.object;

    // Add better diagnostics for checkout session
    logger.info("Processing checkout.session.completed", {
      resourceId: session.id,
      resourceType: "checkout_session",
      metadata: {
        paymentStatus: session.payment_status,
        hasMetadata: !!session.metadata,
        sessionMetadata: session.metadata || {},
        hasSubscription: !!session.subscription,
        mode: session.mode,
        invoice: session.invoice || null,
        customer:
          typeof session.customer === "string"
            ? session.customer
            : typeof session.customer === "object"
              ? session.customer?.id
              : null,
        createdAt: new Date(session.created * 1000).toISOString(),
        hasPaymentIntent: !!session.payment_intent,
      },
    });

    // Double-check payment status before processing
    if (session.payment_status === "paid") {
      // Webhook is the single source of truth for payment success
      try {
        // Handle payment success with proper error catching
        await paymentService.handlePaymentSuccess(session);

        // Log successful payment processing
        logger.info("Successfully processed payment", {
          resourceId: session.id,
          resourceType: "checkout_session",
          metadata: {
            subscription: session.subscription || null,
            customer: session.customer || null,
            paymentStatus: session.payment_status,
            mode: session.mode,
          },
        });
      } catch (paymentError) {
        logger.error("Failed in handlePaymentSuccess", {
          resourceId: session.id,
          resourceType: "checkout_session",
          metadata: {
            error:
              paymentError instanceof Error
                ? paymentError.message
                : String(paymentError),
            errorStack:
              paymentError instanceof Error
                ? paymentError.stack
                : undefined,
            sessionData: {
              id: session.id,
              mode: session.mode,
              paymentStatus: session.payment_status,
              hasSubscription: !!session.subscription,
              hasPaymentIntent: !!session.payment_intent,
            },
          },
        });
        throw paymentError; // Re-throw to retry
      }

      // Extract metadata once to avoid redeclaration
      const { userId, productId, type } = session.metadata || {};

      // Explicitly ensure subscription status is updated to ACTIVE for subscription checkouts
      if (userId && type === "subscription" && session.subscription) {
        try {
          // Double-check that subscription status is properly set to ACTIVE
          await db.subscription.updateMany({
            where: {
              userId,
              status: SubscriptionStatus.INCOMPLETE, // Only update if still in INCOMPLETE status
            },
            data: {
              status: SubscriptionStatus.ACTIVE,
            },
          });
          logger.info(
            "Subscription status explicitly updated to ACTIVE",
            {
              userId,
              resourceType: "subscription",
              resourceId: session.subscription as string,
            },
          );
        } catch (subscriptionError) {
          logger.error(
            "Failed to update subscription status",
            {
              eventType: "webhook.subscription_update_error",
              userId,
              resourceType: "subscription",
            },
            subscriptionError instanceof Error
              ? subscriptionError
              : new Error(String(subscriptionError)),
          );
        }
      }

      // Send email based on purchase type
      if (userId) {
        try {
          const user = await db.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
          });

          if (user) {
            if (type === "course_purchase" && productId) {
              // Individual course purchase email
              const course = await db.course.findUnique({
                where: { id: productId },
                select: { title: true, description: true, slug: true },
              });

              if (course) {
                await emailService.sendCoursePurchaseEmail(
                  user.name || "Étudiant",
                  user.email,
                  course.title,
                  course.slug,
                  session.amount_total
                    ? session.amount_total / 100
                    : undefined,
                );
                logger.info("Course purchase email sent", {
                  eventType: "email.course_purchase_sent",
                  userId,
                  resourceType: "course",
                  resourceId: productId,
                  metadata: {
                    courseTitle: course.title,
                  },
                });
              }
            } else if (type === "premium_subscription") {
              // Premium subscription welcome email
              await emailService.sendPremiumSubscriptionEmail(
                user.name || "Étudiant",
                user.email,
                "Premium",
                session.amount_total ? session.amount_total / 100 : 0,
                "monthly",
              );
              logger.info("Premium subscription email sent", {
                eventType: "email.subscription_welcome_sent",
                userId,
                resourceType: "subscription",
                metadata: {},
              });
            }
          }
        } catch (emailError) {
          logger.error(
            "Error sending purchase email",
            {
              eventType: "email.send_error",
              userId,
              resourceType: "email",
            },
            emailError instanceof Error
              ? emailError
              : new Error(String(emailError)),
          );
          // Don't fail the webhook for email errors
        }
      }
    }
  } catch (error) {
    logger.error(
      "Error processing checkout.session.completed",
      {
        eventType: "webhook.checkout_session_error",
        resourceType: "checkout_session",
      },
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error; // Re-throw to trigger webhook retry
  }
}
