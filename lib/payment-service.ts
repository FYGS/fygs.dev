import Stripe from "stripe";
import { stripe } from "./stripe";
import { db } from "./db";
import { Prisma, SubscriptionPlan } from "@prisma/client";
import { Analytics } from "./analytics";

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
  async createCheckoutSession(data: CheckoutSessionData): Promise<{ url: string; sessionId: string }> {
    try {
      // Fetch course details to get accurate price and title
      const course = await db.course.findUnique({
        where: { id: data.productId },
        select: { title: true, price: true, slug: true, published: true },
      });

      if (!course || !course.published) {
        throw new Error("Course not found or unpublished");
      }

      const amountCents = Math.max(0, Math.round((course.price?.toNumber?.() ?? Number(course.price ?? 0)) * 100));

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        // Explicit list for type safety; Stripe will filter by eligibility
        payment_method_types: [
          "card",
          "bancontact",
          "ideal",
          "sofort",
          "p24",
          "eps",
          "giropay",
          "alipay",
          "link",
          "paypal"
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
  async createSubscriptionSession(data: SubscriptionData): Promise<{ url: string; sessionId: string }> {
    try {
      // Determine billing cycle (monthly/yearly) from environment mapping for analytics/metadata
      const monthlyEnv = process.env.STRIPE_MONTHLY_PRICE_ID;
      const yearlyEnv = process.env.STRIPE_YEARLY_PRICE_ID;
      let billingCycle: 'monthly' | 'yearly' | undefined;
      if (data.priceId === monthlyEnv) billingCycle = 'monthly';
      if (data.priceId === yearlyEnv) billingCycle = 'yearly';

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
          "paypal"
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
          billingCycle: billingCycle || 'unknown'
        },
        subscription_data: {
          metadata: {
            userId: data.userId,
            priceId: data.priceId,
            billingCycle: billingCycle || 'unknown'
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
  async switchSubscriptionPrice(stripeSubscriptionId: string, newPriceId: string) {
    try {
      const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      const currentItemId = subscription.items.data[0].id;
      await stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: false,
        proration_behavior: 'create_prorations',
        items: [{ id: currentItemId, price: newPriceId }],
      });
      // Attempt to capture upcoming invoice for audit (proration)
      try {
        // Type casting because Stripe types may not include retrieveUpcoming in current version
        const invoicesAny: any = stripe.invoices as any;
        const upcoming = await invoicesAny.retrieveUpcoming({ subscription: stripeSubscriptionId }).catch(() => null);
        if (upcoming && upcoming.id && db.invoiceAudit) {
          const amountDue = new Prisma.Decimal(((upcoming.amount_due || 0) / 100).toFixed(2));

          // Check if audit already exists
          const existingAudit = await db.invoiceAudit.findFirst({
            where: { stripeInvoiceId: upcoming.id }
          }).catch(() => null);

          if (!existingAudit) {
            await db.invoiceAudit.create({
              data: {
                userId: (subscription as any).metadata?.userId || (subscription.customer as string) || 'unknown',
                stripeInvoiceId: upcoming.id,
                type: 'PRORATION',
                amount: amountDue,
              }
            }).catch(() => { });
          }
        }
      } catch (e) {
        console.warn('Could not log proration invoice', e);
      }
      return true;
    } catch (error) {
      console.error('Failed to switch subscription price', error);
      throw new Error('PRICE_SWITCH_FAILED');
    }
  }

  // Immediate cancellation (not at period end) with optional refund (within grace period logic at caller)
  async cancelImmediately(stripeSubscriptionId: string) {
    try {
      await stripe.subscriptions.cancel(stripeSubscriptionId);
      return true;
    } catch (error) {
      console.error('Immediate cancellation failed', error);
      throw new Error('CANCEL_IMMEDIATE_FAILED');
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
      console.error('Refund failed', error);
      throw new Error('REFUND_FAILED');
    }
  }

  // Create Stripe customer
  async createCustomer(email: string, name?: string, userId?: string): Promise<string> {
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
    interval: "month" | "year" = "month"
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
    const { userId, productId, type } = session.metadata || {};

    if (!userId) {
      console.error("No userId in session metadata");
      return;
    }

    try {
      if (type === "course_purchase" && productId) {
        // Auto-enroll upon successful purchase to align with enrollment-required gating
        try {
          if (session.payment_intent) {
            await db.payment.create({
              data: {
                userId,
                stripePaymentIntentId: session.payment_intent as string,
                amount: new Prisma.Decimal(((session.amount_total || 0) / 100).toFixed(2)),
                currency: (session.currency || 'eur'),
                status: 'COMPLETED',
                description: `Achat formation ${productId}`,
                kind: 'COURSE',
                courseId: productId,
              }
            }).catch(() => { });
            Analytics.coursePurchased(userId, { courseId: productId, amount: (session.amount_total || 0) / 100 });
            // Attempt enrollment (idempotent)
            try { await this.grantCourseAccess(userId, productId); } catch { }
          }
        } catch { }
      } else if (type === "subscription") {
        // Grant subscription access
        await this.grantSubscriptionAccess(userId, session.subscription as string);
        try {
          if (session.subscription && session.amount_total) {
            await db.payment.create({
              data: {
                userId,
                stripePaymentIntentId: session.subscription as string,
                amount: new Prisma.Decimal(((session.amount_total || 0) / 100).toFixed(2)),
                currency: (session.currency || 'eur'),
                status: 'COMPLETED',
                description: 'Abonnement Premium',
                kind: 'SUBSCRIPTION',
              }
            }).catch(() => { });
            Analytics.subscriptionStarted(userId, { priceId: session.metadata?.priceId, billingCycle: (session.metadata as any)?.billingCycle, amount: (session.amount_total || 0) / 100 });
          }
        } catch { }
      }
    } catch (error) {
      console.error("Failed to handle payment success:", error);
    }
  }

  // Grant course access
  async grantCourseAccess(userId: string, courseId: string): Promise<void> {
    console.log(`Granting course access: User ${userId} -> Course ${courseId}`);
    
    try {
      // Check if enrollment already exists (idempotency)
      const existingEnrollment = await db.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId }
        }
      });

      if (existingEnrollment) {
        console.log(`Course access already exists: User ${userId} -> Course ${courseId}`);
        return;
      }

      // Verify course exists and is published
      const course = await db.course.findFirst({
        where: { id: courseId, published: true },
        select: { id: true, title: true }
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

      console.log(`Course access granted: User ${userId} -> Course ${courseId} (${course.title})`);
    } catch (error) {
      console.error(`Failed to grant course access: ${error}`);
      throw error;
    }
  }

  // Grant subscription access
  private async grantSubscriptionAccess(userId: string, subscriptionId: string): Promise<void> {
    console.log(`Granting subscription access: User ${userId} -> Subscription ${subscriptionId}`);
    
    try {
      // Get subscription details from Stripe for more complete data
      const stripeSubscription = await this.getSubscription(subscriptionId);

      if (!stripeSubscription) {
        throw new Error(`Stripe subscription ${subscriptionId} not found`);
      }

      // Map Stripe status to our enum
      const statusMap: Record<string, any> = {
        'active': 'ACTIVE',
        'canceled': 'CANCELED',
        'past_due': 'PAST_DUE',
        'incomplete': 'INCOMPLETE',
        'trialing': 'TRIALING',
      };

      const mappedStatus = statusMap[stripeSubscription.status] || 'ACTIVE';

      // Create or update subscription record with complete data
      await db.subscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: stripeSubscription.customer as string,
          status: mappedStatus,
          priceId: stripeSubscription.items.data[0]?.price?.id,
          plan: SubscriptionPlan.PREMIUM,
          currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
          currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        },
        update: {
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: stripeSubscription.customer as string,
          status: mappedStatus,
          priceId: stripeSubscription.items.data[0]?.price?.id,
          plan: SubscriptionPlan.PREMIUM,
          currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
          currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        },
      });
      
      console.log(`Subscription access granted: User ${userId} -> Subscription ${subscriptionId} (Status: ${mappedStatus})`);
    } catch (error) {
      console.error(`Failed to grant subscription access: ${error}`);
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
    try {
      return await stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      console.error("Failed to get subscription:", error);
      throw new Error("Failed to get subscription");
    }
  }
}

export const paymentService = PaymentService.getInstance();
