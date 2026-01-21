import Stripe from "stripe";
import { stripe } from "./stripe";
import { db } from "./db";
import {
  Prisma,
  SubscriptionPlan,
  PaymentStatus,
  PaymentKind,
  SubscriptionStatus,
} from "@prisma/client";
import { Analytics } from "./analytics";
import { createLogger } from "./structured-logger";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

export interface PaymentProduct {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  currency: string;
  type: "course" | "subscription" | "bundle";
  metadata?: Record<string, string>;
}

export interface CheckoutSessionData {
  productId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  discountCode?: string;
}

export interface SubscriptionData {
  userId: string;
  customerEmail: string;
  priceId: string; // monthly or yearly Stripe price id
  successUrl: string;
  cancelUrl: string;
}

class PaymentService {
  private static instance: PaymentService;

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // Create checkout session for one-time payments (courses)
  async createCheckoutSession(
    data: CheckoutSessionData,
  ): Promise<{ url: string; sessionId: string }> {
    try {
      // Fetch course details to get accurate price and title
      const course = await db.course.findUnique({
        where: { id: data.productId },
        select: { title: true, price: true, slug: true, published: true },
      });

      if (!course || !course.published) {
        throw new Error("Course not found or unpublished");
      }

      const amountCents = Math.max(
        0,
        Math.round(
          (course.price?.toNumber?.() ?? Number(course.price ?? 0)) * 100,
        ),
      );

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        // Explicit list for type safety; Stripe will filter by eligibility
        payment_method_types: [
          "card",
          // "bancontact",
          // "ideal",
          // "sofort",
          // "p24",
          // "eps",
          // "giropay",
          // "alipay",
          "link",
          "paypal",
        ],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `Formation - ${course.title}`,
                description: "Accès à vie à la formation",
              },
              unit_amount: amountCents,
            },
            quantity: 1,
          },
        ],
        customer_email: data.customerEmail,
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        metadata: {
          userId: data.userId,
          productId: data.productId,
          type: "course_purchase",
          courseSlug: course.slug,
        },
        allow_promotion_codes: true,
      });

      if (!session.url) {
        throw new Error("Failed to create checkout session");
      }

      return {
        url: session.url,
        sessionId: session.id,
      };
    } catch (error) {
      console.error("Stripe checkout session creation failed:", error);
      throw new Error("Failed to create payment session");
    }
  }

  // Create subscription checkout session
  async createSubscriptionSession(
    data: SubscriptionData,
  ): Promise<{ url: string; sessionId: string }> {
    try {
      // Determine billing cycle (monthly/yearly) from environment mapping for analytics/metadata
      const monthlyEnv = process.env.STRIPE_MONTHLY_PRICE_ID;
      const yearlyEnv = process.env.STRIPE_YEARLY_PRICE_ID;
      let billingCycle: "monthly" | "yearly" | undefined;
      if (data.priceId === monthlyEnv) billingCycle = "monthly";
      if (data.priceId === yearlyEnv) billingCycle = "yearly";

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: [
          "card",
          // "bancontact",
          // "ideal",
          // "sofort",
          // "p24",
          // "eps",
          // "giropay",
          // "alipay",
          "link",
          "paypal",
        ],
        line_items: [
          {
            price: data.priceId,
            quantity: 1,
          },
        ],
        customer_email: data.customerEmail,
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        metadata: {
          userId: data.userId,
          type: "subscription",
          priceId: data.priceId,
          billingCycle: billingCycle || "unknown",
        },
        subscription_data: {
          metadata: {
            userId: data.userId,
            priceId: data.priceId,
            billingCycle: billingCycle || "unknown",
          },
        },
        allow_promotion_codes: true,
      });

      if (!session.url) {
        throw new Error("Failed to create subscription session");
      }

      return {
        url: session.url,
        sessionId: session.id,
      };
    } catch (error) {
      console.error("Stripe subscription session creation failed:", error);
      throw new Error("Failed to create subscription session");
    }
  }

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

  // Process refund for a one-time course purchase (within 15-day grace period)
  async refundPayment(stripePaymentIntentId: string, amountCents?: number) {
    try {
      await stripe.refunds.create({
        payment_intent: stripePaymentIntentId,
        amount: amountCents,
      });
      // We could log a refund audit if needed in InvoiceAudit (type REFUND_RECORD)
      return true;
    } catch (error) {
      console.error("Refund failed", error);
      throw new Error("REFUND_FAILED");
    }
  }

  // Create Stripe customer
  async createCustomer(
    email: string,
    name?: string,
    userId?: string,
  ): Promise<string> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: userId ? { userId } : {},
      });

      return customer.id;
    } catch (error) {
      console.error("Failed to create Stripe customer:", error);
      throw new Error("Failed to create customer");
    }
  }

  // Get customer by email
  async getCustomerByEmail(email: string): Promise<Stripe.Customer | null> {
    try {
      const customers = await stripe.customers.list({
        email,
        limit: 1,
      });

      return customers.data[0] || null;
    } catch (error) {
      console.error("Failed to get customer:", error);
      return null;
    }
  }

  // Create product in Stripe
  async createProduct(product: PaymentProduct): Promise<string> {
    try {
      const stripeProduct = await stripe.products.create({
        id: product.id,
        name: product.name,
        description: product.description,
        metadata: product.metadata || {},
      });

      // Create price for the product
      await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: product.price,
        currency: product.currency,
        metadata: {
          type: product.type,
        },
      });

      return stripeProduct.id;
    } catch (error) {
      console.error("Failed to create Stripe product:", error);
      throw new Error("Failed to create product");
    }
  }

  // Create subscription price
  async createSubscriptionPrice(
    productId: string,
    amount: number,
    interval: "month" | "year" = "month",
  ): Promise<string> {
    try {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: amount,
        currency: "eur",
        recurring: {
          interval,
        },
        metadata: {
          type: "subscription",
        },
      });

      return price.id;
    } catch (error) {
      console.error("Failed to create subscription price:", error);
      throw new Error("Failed to create subscription price");
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is required");
    }

    try {
      return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      throw new Error("Invalid webhook signature");
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
        // Auto-enroll upon successful purchase to align with enrollment-required gating
        if (session.payment_intent) {
          // First, try to find and update existing pending payment record
          try {
            const existingPayment = await db.payment.findFirst({
              where: {
                userId,
                courseId: productId,
                kind: PaymentKind.COURSE,
                status: PaymentStatus.PENDING,
              },
            });

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
                  stripePaymentIntentId: session.payment_intent as string,
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
                  stripePaymentIntentId: session.payment_intent as string,
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

        const subscriptionId = session.subscription as string;

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

        try {
          // Calculate safe amount
          const amountTotal = session.amount_total || 0;
          const amountDecimal = new Prisma.Decimal(
            (amountTotal / 100).toFixed(2),
          );

          // Find and update existing pending payment record if it exists
          const existingPayment = await db.payment.findFirst({
            where: {
              userId,
              kind: PaymentKind.SUBSCRIPTION,
              status: PaymentStatus.PENDING,
            },
          });

          if (existingPayment) {
            // Update existing payment record
            await db.payment.update({
              where: { id: existingPayment.id },
              data: {
                stripePaymentIntentId: subscriptionId,
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
                stripePaymentIntentId: subscriptionId,
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

  // Grant course access
  async grantCourseAccess(userId: string, courseId: string): Promise<void> {
    console.log(`Granting course access: User ${userId} -> Course ${courseId}`);

    try {
      // Check if enrollment already exists (idempotency)
      const existingEnrollment = await db.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId },
        },
      });

      if (existingEnrollment) {
        console.log(
          `Course access already exists: User ${userId} -> Course ${courseId}`,
        );
        return;
      }

      // Verify course exists and is published
      const course = await db.course.findFirst({
        where: { id: courseId, published: true },
        select: { id: true, title: true },
      });

      if (!course) {
        throw new Error(`Course ${courseId} not found or not published`);
      }

      // Create enrollment record
      await db.enrollment.create({
        data: {
          userId,
          courseId,
          enrolledAt: new Date(),
        },
      });

      console.log(
        `Course access granted: User ${userId} -> Course ${courseId} (${course.title})`,
      );
    } catch (error) {
      console.error(`Failed to grant course access: ${error}`);
      throw error;
    }
  }

  // Grant subscription access
  private async grantSubscriptionAccess(
    userId: string,
    subscriptionId: string,
  ): Promise<void> {
    const logger = createLogger({
      operation: "grant-subscription",
      resourceType: "subscription",
      resourceId: subscriptionId,
    });

    logger.info(`Granting subscription access`, {
      resourceId: subscriptionId,
      metadata: { userId },
    });

    try {
      // Get subscription details from Stripe for more complete data
      const stripeSubscription = await this.getSubscription(subscriptionId);

      if (!stripeSubscription) {
        logger.error(`Subscription not found`, {
          resourceId: subscriptionId,
          metadata: { userId },
        });
        throw new Error(`Stripe subscription ${subscriptionId} not found`);
      }

      // Ensure customer ID is available and valid
      const customerId =
        typeof stripeSubscription.customer === "string"
          ? stripeSubscription.customer
          : stripeSubscription.customer?.id || "unknown";

      if (customerId === "unknown") {
        logger.warn(`Missing customer ID in subscription`, {
          resourceId: subscriptionId,
          metadata: { userId, status: stripeSubscription.status },
        });
      }

      // Map Stripe status to our enum
      const statusMap: Record<string, SubscriptionStatus> = {
        active: SubscriptionStatus.ACTIVE,
        canceled: SubscriptionStatus.CANCELED,
        past_due: SubscriptionStatus.PAST_DUE,
        incomplete: SubscriptionStatus.INCOMPLETE,
        trialing: SubscriptionStatus.TRIALING,
      };

      // Map Stripe status to our enum, defaulting to ACTIVE for successful subscription
      const mappedStatus =
        statusMap[stripeSubscription.status] || SubscriptionStatus.ACTIVE;

      // For subscription created via checkout, always ensure it's set to ACTIVE if Stripe says "active"
      const finalStatus =
        stripeSubscription.status === "active"
          ? SubscriptionStatus.ACTIVE
          : mappedStatus;

      // Cast to access properties potentially missing in the type definition
      const subAny = stripeSubscription as any;

      // Get period dates from subscription_item (items.data[0]) as they are not at root level
      const subscriptionItem = stripeSubscription.items?.data?.[0];
      const itemData = subscriptionItem as any;

      // Safe access to period timestamps with fallbacks to current time
      const now = Date.now();
      const currentPeriodStart = new Date(
        (itemData?.current_period_start ||
          subAny.billing_cycle_anchor ||
          subAny.start_date ||
          Math.floor(now / 1000)) * 1000,
      );

      // Get billing interval to calculate proper fallback period
      const billingInterval =
        subscriptionItem?.price?.recurring?.interval || "month";
      const fallbackPeriodSeconds =
        billingInterval === "year" ? 365 * 24 * 60 * 60 : 30 * 24 * 60 * 60;

      const currentPeriodEnd = new Date(
        (itemData?.current_period_end ||
          Math.floor(now / 1000) + fallbackPeriodSeconds) * 1000,
      );

      // Log period details for debugging
      logger.info("Subscription period from Stripe", {
        resourceId: subscriptionId,
        metadata: {
          userId,
          currentPeriodStartRaw: itemData?.current_period_start,
          currentPeriodEndRaw: itemData?.current_period_end,
          currentPeriodStartDate: currentPeriodStart.toISOString(),
          currentPeriodEndDate: currentPeriodEnd.toISOString(),
          billingInterval,
          status: stripeSubscription.status,
        },
      });

      // Get price ID safely
      const priceId =
        stripeSubscription.items?.data?.[0]?.price?.id ||
        (subAny.plan?.id as string) ||
        null;

      if (!priceId) {
        logger.warn(`No price ID found in subscription`, {
          resourceId: subscriptionId,
          metadata: {
            userId,
            status: stripeSubscription.status,
            hasItems: !!stripeSubscription.items,
          },
        });
      }

      // Create or update subscription record with complete data and fallbacks
      await db.subscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: customerId,
          status: finalStatus,
          priceId: priceId,
          plan: SubscriptionPlan.PREMIUM,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd: !!stripeSubscription.cancel_at_period_end,
        },
        update: {
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: customerId,
          status: finalStatus,
          priceId: priceId,
          plan: SubscriptionPlan.PREMIUM,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd: !!stripeSubscription.cancel_at_period_end,
        },
      });

      logger.info(`Subscription access granted successfully`, {
        resourceId: subscriptionId,
        metadata: {
          userId,
          status: finalStatus,
          periodEnd: currentPeriodEnd.toISOString(),
        },
      });
    } catch (error) {
      logger.error(`Failed to grant subscription access`, {
        resourceId: subscriptionId,
        metadata: {
          userId,
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
        },
      });
      throw error;
    }
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

export const paymentService = PaymentService.getInstance();
