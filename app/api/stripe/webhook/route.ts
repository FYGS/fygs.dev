import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/lib/payment-service";
import { db } from "@/lib/db";
import { SubscriptionPlan } from "@prisma/client";
import { emailService } from "@/lib/email-service";
import { Analytics } from "@/lib/analytics";
import { classifyBillingCycle } from "@/lib/subscription-pricing";
import { createLogger } from "@/lib/structured-logger";

// Disable body parsing for webhooks
export const runtime = 'nodejs';

// Create logger for webhook processing
const logger = createLogger({ operation: 'stripe-webhook' });

export async function POST(req: NextRequest) {
  let body: string;
  let signature: string | null;

  try {
    body = await req.text();
    const headersList = await headers();
    signature = headersList.get("stripe-signature");

    if (!signature) {
      logger.error("Missing Stripe signature in webhook request", {
        eventType: 'webhook.signature_missing'
      });
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }
  } catch (error) {
    logger.error("Error reading webhook request", {
      eventType: 'webhook.request_read_error'
    }, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const event = paymentService.verifyWebhookSignature(body, signature);
    logger.info("Processing Stripe webhook event", {
      eventType: 'webhook.event_received',
      resourceType: 'stripe_event',
      resourceId: event.id,
      metadata: { type: event.type }
    });

    // Handle the event with proper error handling for each case

    switch (event.type) {
      case "checkout.session.completed": {
        try {
          const session = event.data.object;
          
          if (session.payment_status === "paid") {
            await paymentService.handlePaymentSuccess(session);
            
            // Send email based on purchase type
            const { userId, productId, type } = session.metadata || {};
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
                      select: { title: true, description: true },
                    });

                    if (course) {
                      await emailService.sendCoursePurchaseEmail(
                        user.name || "Étudiant",
                        user.email,
                        course.title,
                        productId,
                        session.amount_total ? session.amount_total / 100 : undefined
                      );
                      logger.info("Course purchase email sent", {
                        eventType: 'email.course_purchase_sent',
                        userId,
                        resourceType: 'course',
                        resourceId: productId,
                        metadata: { courseTitle: course.title, userEmail: user.email }
                      });
                    }
                  } else if (type === "premium_subscription") {
                    // Premium subscription welcome email
                    await emailService.sendPremiumSubscriptionEmail(
                      user.name || "Étudiant",
                      user.email,
                      "Premium",
                      session.amount_total ? session.amount_total / 100 : 0,
                      "monthly"
                    );
                    logger.info("Premium subscription email sent", {
                      eventType: 'email.subscription_welcome_sent',
                      userId,
                      resourceType: 'subscription',
                      metadata: { userEmail: user.email }
                    });
                  }
                }
              } catch (emailError) {
                logger.error("Error sending purchase email", {
                  eventType: 'email.send_error',
                  userId,
                  resourceType: 'email'
                }, emailError instanceof Error ? emailError : new Error(String(emailError)));
                // Don't fail the webhook for email errors
              }
            }
          }
        } catch (error) {
          logger.error("Error processing checkout.session.completed", {
            eventType: 'webhook.checkout_session_error',
            resourceType: 'checkout_session'
          }, error instanceof Error ? error : new Error(String(error)));
          throw error; // Re-throw to trigger webhook retry
        }
        break;
      }
      
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        try {
          const subscription = event.data.object;
          
          // Update user subscription status in database
          const userId = subscription.metadata?.userId;
          if (userId) {
            // Map Stripe status to our enum
            const statusMap: Record<string, any> = {
              'active': 'ACTIVE',
              'canceled': 'CANCELED',
              'past_due': 'PAST_DUE',
              'incomplete': 'INCOMPLETE',
              'trialing': 'TRIALING',
            };

            const priceItem = subscription.items?.data?.[0];
            const priceId: string | undefined = priceItem?.price?.id;
            const interval = classifyBillingCycle(priceId) === 'yearly' ? 'yearly' : 'monthly';
            const subscriptionData = {
              userId,
              stripeCustomerId: subscription.customer as string,
              stripeSubscriptionId: subscription.id,
              status: statusMap[subscription.status] || 'ACTIVE',
              priceId,
              plan: SubscriptionPlan.PREMIUM,
              currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
              currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
              cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
            };

            await db.subscription.upsert({
              where: { userId },
              create: subscriptionData,
              update: subscriptionData,
            });

            // Send subscription update email for active subscriptions
            if (subscription.status === 'active') {
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
                      (subscription as any).items.data[0]?.price?.unit_amount / 100 || 0,
                      interval
                    );
                    Analytics.subscriptionStarted(userId, { priceId, billingCycle: interval });
                    logger.info("Premium subscription welcome email sent", {
                      eventType: 'email.subscription_welcome_sent',
                      userId,
                      resourceType: 'subscription',
                      resourceId: subscription.id,
                      metadata: { userEmail: user.email, interval }
                    });
                  } else {
                    // Record generic subscription update (status change, price, cycle)
                    Analytics.subscriptionUpdated(userId, { priceId, billingCycle: interval, status: subscription.status });
                  }
                }
              } catch (emailError) {
                logger.error("Error sending subscription email", {
                  eventType: 'email.send_error',
                  userId,
                  resourceType: 'subscription',
                  resourceId: subscription.id
                }, emailError instanceof Error ? emailError : new Error(String(emailError)));
              }
            }

            logger.info("Subscription updated successfully", {
              eventType: 'subscription.updated',
              userId,
              resourceType: 'subscription',
              resourceId: subscription.id,
              fromState: undefined,
              toState: subscription.status,
              metadata: { plan: 'PREMIUM', interval }
            });
          }
        } catch (error) {
          logger.error("Error processing subscription update", {
            eventType: 'webhook.subscription_update_error',
            resourceType: 'subscription'
          }, error instanceof Error ? error : new Error(String(error)));
          throw error;
        }
        break;
      }
      
      case "customer.subscription.deleted": {
        try {
          const subscription = event.data.object;
          
          const userId = subscription.metadata?.userId;
          if (userId) {
            await db.subscription.update({
              where: { userId },
              data: {
                status: 'CANCELED',
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
                  user.email
                );
                // Record cancellation via soft cancel analytics (even if immediate delete event)
                Analytics.subscriptionCanceledSoft(userId, { subscriptionId: subscription.id });
                logger.info("Subscription cancellation email sent", {
                  eventType: 'email.subscription_cancellation_sent',
                  userId,
                  resourceType: 'subscription',
                  resourceId: subscription.id,
                  metadata: { userEmail: user.email }
                });
              }
            } catch (emailError) {
              logger.error("Error sending cancellation email", {
                eventType: 'email.send_error',
                userId,
                resourceType: 'subscription',
                resourceId: subscription.id
              }, emailError instanceof Error ? emailError : new Error(String(emailError)));
            }

            logger.info("Subscription canceled successfully", {
              eventType: 'subscription.canceled',
              userId,
              resourceType: 'subscription',
              resourceId: subscription.id,
              fromState: 'ACTIVE',
              toState: 'CANCELED'
            });
          }
        } catch (error) {
          logger.error("Error processing subscription deletion", {
            eventType: 'webhook.subscription_deletion_error',
            resourceType: 'subscription'
          }, error instanceof Error ? error : new Error(String(error)));
          throw error;
        }
        break;
      }
      
      case "invoice.payment_failed": {
        try {
          const invoice = event.data.object as any;

          // Handle failed payment
          if (invoice.subscription) {
            const subscription = await paymentService.getSubscription(invoice.subscription as string);
            const userId = subscription.metadata?.userId;

            if (userId) {
              // Update subscription status to PAST_DUE
              await db.subscription.updateMany({
                where: {
                  userId,
                  stripeSubscriptionId: invoice.subscription as string
                },
                data: {
                  status: 'PAST_DUE',
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
                  user.email
                );
                logger.info("Payment failed email sent", {
                  eventType: 'email.payment_failed_sent',
                  userId,
                  resourceType: 'invoice',
                  resourceId: invoice.id,
                  metadata: { userEmail: user.email, subscriptionId: invoice.subscription }
                });
                Analytics.subscriptionPaymentFailed(userId, { invoiceId: invoice.id, subscriptionId: invoice.subscription });
              }

              logger.warn("Subscription payment failed", {
                eventType: 'payment.failed',
                userId,
                resourceType: 'subscription',
                resourceId: invoice.subscription,
                fromState: 'ACTIVE',
                toState: 'PAST_DUE',
                metadata: { invoiceId: invoice.id }
              });
            }
          }
        } catch (error) {
          logger.error("Error processing payment failure", {
            eventType: 'webhook.payment_failure_error',
            resourceType: 'invoice'
          }, error instanceof Error ? error : new Error(String(error)));
          throw error;
        }
        break;
      }
      
      default:
        logger.info("Unhandled Stripe webhook event type", {
          eventType: 'webhook.unhandled_event',
          resourceType: 'stripe_event',
          resourceId: event.id,
          metadata: { type: event.type }
        });
    }
  } catch (error) {
    logger.error("Webhook handler failed", {
      eventType: 'webhook.handler_error',
      resourceType: 'webhook'
    }, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
