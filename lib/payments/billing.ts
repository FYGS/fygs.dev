import type Stripe from "stripe";
import { stripe } from "../stripe";
import { db } from "../db";
import { WebhookSignatureError } from "./errors";
import type { CheckoutSessionData, SubscriptionData } from "./types";

/** Stripe checkout sessions and webhook signature checks. */
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
        // A one-time payment gets a real invoice (PDF from the receipt link on the billing page)
        invoice_creation: {
          enabled: true,
          invoice_data: { description: `Formation « ${course.title} »` },
        },
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
