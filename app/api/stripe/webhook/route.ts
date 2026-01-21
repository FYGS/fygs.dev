import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/lib/payment-service";
import { db } from "@/lib/db";
import {
  Prisma,
  SubscriptionPlan,
  PaymentStatus,
  PaymentKind,
  SubscriptionStatus,
} from "@prisma/client";
import { emailService } from "@/lib/email-service";
import { Analytics } from "@/lib/analytics";
import { classifyBillingCycle } from "@/lib/subscription-pricing";
import { createLogger } from "@/lib/structured-logger";

// Disable body parsing for webhooks
export const runtime = "nodejs";

// Create logger for webhook processing
const logger = createLogger({ operation: "stripe-webhook" });

export async function POST(req: NextRequest) {
  let body: string;
  let signature: string | null;

  try {
    body = await req.text();
    const headersList = await headers();
    signature = headersList.get("stripe-signature");

    if (!signature) {
      logger.error("Missing Stripe signature in webhook request", {
        eventType: "webhook.signature_missing",
      });
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }
  } catch (error) {
    logger.error(
      "Error reading webhook request",
      {
        eventType: "webhook.request_read_error",
      },
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const event = paymentService.verifyWebhookSignature(body, signature);
    logger.info("Processing Stripe webhook event", {
      eventType: "webhook.event_received",
      resourceType: "stripe_event",
      resourceId: event.id,
      metadata: { type: event.type },
    });

    // Handle the event with proper error handling for each case

    switch (event.type) {
      case "checkout.session.completed": {
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
                          userEmail: user.email,
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
                      metadata: { userEmail: user.email },
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
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        try {
          const subscription = event.data.object;

          // Webhook is the single source of truth for subscription status updates
          const userId = subscription.metadata?.userId;
          // Log better diagnostics for subscription events
          logger.info("Processing subscription event details", {
            eventType: event.type,
            userId: userId || undefined,
            resourceId: subscription.id,
            resourceType: "subscription",
            metadata: {
              hasMetadata: !!subscription.metadata,
              status: subscription.status,
            },
          });

          if (userId) {
            // Map Stripe status to our enum
            const statusMap: Record<string, SubscriptionStatus> = {
              active: SubscriptionStatus.ACTIVE,
              canceled: SubscriptionStatus.CANCELED,
              past_due: SubscriptionStatus.PAST_DUE,
              incomplete: SubscriptionStatus.INCOMPLETE,
              trialing: SubscriptionStatus.TRIALING,
            };

            const priceItem = subscription.items?.data?.[0];
            const priceId: string | undefined = priceItem?.price?.id;
            // Use metadata.billingCycle as primary source if available
            const billingCycle = subscription.metadata?.billingCycle as
              | "yearly"
              | "monthly"
              | undefined;
            const interval =
              billingCycle ||
              (classifyBillingCycle(priceId) === "yearly"
                ? "yearly"
                : "monthly");

            const mappedStatus =
              statusMap[subscription.status] || SubscriptionStatus.ACTIVE; // Default to ACTIVE for unknown statuses to ensure access

            // Cast subscription to any to safely access properties that might not be in the type definition
            const subData = subscription as any;

            // Get period dates from subscription_item (items.data[0]) as they are not at root level
            const subscriptionItem = subscription.items?.data?.[0];
            const itemData = subscriptionItem as any;

            // Add safe access to period timestamps with fallbacks
            // Period dates are in items.data[0], not at subscription root level
            const currentPeriodStart =
              itemData?.current_period_start ||
              subData.billing_cycle_anchor ||
              subData.start_date ||
              Math.floor(Date.now() / 1000);

            const currentPeriodEnd =
              itemData?.current_period_end ||
              Math.floor(Date.now() / 1000) +
                (interval === "yearly" ? 365 : 30) * 24 * 60 * 60;

            // Log detailed period information for debugging
            logger.info("Subscription period details", {
              eventType: event.type,
              userId,
              resourceId: subscription.id,
              metadata: {
                currentPeriodStartRaw: itemData?.current_period_start,
                currentPeriodEndRaw: itemData?.current_period_end,
                currentPeriodStartDate: new Date(
                  currentPeriodStart * 1000,
                ).toISOString(),
                currentPeriodEndDate: new Date(
                  currentPeriodEnd * 1000,
                ).toISOString(),
                billingCycle: interval,
                priceId,
                status: subscription.status,
              },
            });

            const subscriptionData = {
              userId,
              stripeCustomerId: subscription.customer as string,
              stripeSubscriptionId: subscription.id,
              status: mappedStatus,
              priceId,
              plan: SubscriptionPlan.PREMIUM,
              currentPeriodStart: new Date(currentPeriodStart * 1000),
              currentPeriodEnd: new Date(currentPeriodEnd * 1000),
              cancelAtPeriodEnd: !!subData.cancel_at_period_end,
            };

            await db.subscription.upsert({
              where: { userId },
              create: subscriptionData,
              update: subscriptionData,
            });

            // Send subscription update email for active subscriptions
            if (subscription.status === "active") {
              try {
                const user = await db.user.findUnique({
                  where: { id: userId },
                  select: { email: true, name: true },
                });

                if (user) {
                  if (event.type === "customer.subscription.created") {
                    await emailService.sendPremiumSubscriptionEmail(
                      user.name || "Étudiant",
                      user.email,
                      "Premium",
                      (subscription as any).items.data[0]?.price?.unit_amount /
                        100 || 0,
                      interval,
                    );
                    Analytics.subscriptionStarted(userId, {
                      priceId,
                      billingCycle: interval,
                    });
                    logger.info("Premium subscription welcome email sent", {
                      eventType: "email.subscription_welcome_sent",
                      userId,
                      resourceType: "subscription",
                      resourceId: subscription.id,
                      metadata: { userEmail: user.email, interval },
                    });
                  } else {
                    // Record generic subscription update (status change, price, cycle)
                    Analytics.subscriptionUpdated(userId, {
                      priceId,
                      billingCycle: interval,
                      status: subscription.status,
                    });
                  }
                }
              } catch (emailError) {
                logger.error(
                  "Error sending subscription email",
                  {
                    eventType: "email.send_error",
                    userId,
                    resourceType: "subscription",
                    resourceId: subscription.id,
                  },
                  emailError instanceof Error
                    ? emailError
                    : new Error(String(emailError)),
                );
              }
            }

            logger.info("Subscription updated successfully", {
              eventType: "subscription.updated",
              userId,
              resourceType: "subscription",
              resourceId: subscription.id,
              fromState: undefined,
              toState: subscription.status,
              metadata: { plan: "PREMIUM", interval },
            });
          }
        } catch (error) {
          logger.error(
            "Error processing subscription update",
            {
              eventType: "webhook.subscription_update_error",
              resourceType: "subscription",
            },
            error instanceof Error ? error : new Error(String(error)),
          );
          throw error;
        }
        break;
      }

      case "customer.subscription.deleted": {
        try {
          const subscription = event.data.object;

          // Webhook is the single source of truth for subscription cancellations
          const userId = subscription.metadata?.userId;
          if (userId) {
            await db.subscription.update({
              where: { userId },
              data: {
                status: SubscriptionStatus.CANCELED,
                currentPeriodEnd: new Date(),
              },
            });

            // Send cancellation confirmation email
            try {
              const user = await db.user.findUnique({
                where: { id: userId },
                select: { email: true, name: true },
              });

              if (user) {
                await emailService.sendSubscriptionCanceledEmail(
                  user.name || "Étudiant",
                  user.email,
                );
                // Record cancellation via soft cancel analytics (even if immediate delete event)
                Analytics.subscriptionCanceledSoft(userId, {
                  subscriptionId: subscription.id,
                });
                logger.info("Subscription cancellation email sent", {
                  eventType: "email.subscription_cancellation_sent",
                  userId,
                  resourceType: "subscription",
                  resourceId: subscription.id,
                  metadata: { userEmail: user.email },
                });
              }
            } catch (emailError) {
              logger.error(
                "Error sending cancellation email",
                {
                  eventType: "email.send_error",
                  userId,
                  resourceType: "subscription",
                  resourceId: subscription.id,
                },
                emailError instanceof Error
                  ? emailError
                  : new Error(String(emailError)),
              );
            }

            logger.info("Subscription canceled successfully", {
              eventType: "subscription.canceled",
              userId,
              resourceType: "subscription",
              resourceId: subscription.id,
              fromState: SubscriptionStatus.ACTIVE,
              toState: SubscriptionStatus.CANCELED,
            });
          }
        } catch (error) {
          logger.error(
            "Error processing subscription deletion",
            {
              eventType: "webhook.subscription_deletion_error",
              resourceType: "subscription",
            },
            error instanceof Error ? error : new Error(String(error)),
          );
          throw error;
        }
        break;
      }

      case "invoice.payment_succeeded": {
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
        break;
      }

      case "invoice.payment_failed": {
        try {
          const invoice = event.data.object as any;

          // Webhook is the single source of truth for payment failures
          if (invoice.subscription) {
            const subscription = await paymentService.getSubscription(
              invoice.subscription as string,
            );
            const userId = subscription.metadata?.userId;

            if (userId) {
              // Update subscription status to PAST_DUE
              await db.subscription.updateMany({
                where: {
                  userId,
                  stripeSubscriptionId: invoice.subscription as string,
                },
                data: {
                  status: SubscriptionStatus.PAST_DUE,
                },
              });

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
                    userEmail: user.email,
                    subscriptionId: invoice.subscription,
                  },
                });
                Analytics.subscriptionPaymentFailed(userId, {
                  invoiceId: invoice.id,
                  subscriptionId: invoice.subscription,
                });
              }

              logger.warn("Subscription payment failed", {
                eventType: "payment.failed",
                userId,
                resourceType: "subscription",
                resourceId: invoice.subscription,
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
        break;
      }

      default:
        logger.info("Unhandled Stripe webhook event type", {
          eventType: "webhook.unhandled_event",
          resourceType: "stripe_event",
          resourceId: event.id,
          metadata: { type: event.type },
        });
    }
  } catch (error) {
    // Log the full error details with stack trace
    logger.error("Webhook handler failed", {
      eventType: "webhook.handler_error",
      resourceType: "webhook",
      metadata: {
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      },
    });

    // Return an appropriate error response but don't expose details
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }

  // On success, return a 200 response that Stripe can acknowledge
  logger.info("Webhook processed successfully", {
    eventType: "webhook.processed",
    resourceType: "webhook",
  });
  return NextResponse.json({ received: true });
}
