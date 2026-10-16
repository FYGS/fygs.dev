import type Stripe from "stripe";
import { stripe } from "../stripe";
import { db } from "../db";
import { WebhookSignatureError } from "./errors";
import type {
  CheckoutSessionData,
  PaymentProduct,
  SubscriptionData,
} from "./types";

/** Stripe checkout sessions, customers, catalog and webhook signature checks. */
export class StripeBilling {
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
      throw new WebhookSignatureError();
    }
  }
}
