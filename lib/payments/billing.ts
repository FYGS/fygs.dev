import type Stripe from "stripe";
import { stripe, stripeKeyMode } from "../stripe";
import { db } from "../db";
import { WebhookSignatureError } from "./errors";
import type { CheckoutSessionData, SubscriptionData } from "./types";

/**
 * Promotion codes in Checkout are off unless STRIPE_ALLOW_PROMOTION_CODES=true. A code that makes the total 0 grants
 * the access for free by design (the payment is recorded with the session as reference); enable them knowingly, and
 * restrict each coupon to the product and a maximum number of redemptions in the Stripe dashboard.
 */
export function promotionCodesAllowed(): boolean {
  return process.env.STRIPE_ALLOW_PROMOTION_CODES === "true";
}

/** Webhook secrets in the order they are tried: the current one, then the previous one during a rotation. */
export function webhookSecrets(): string[] {
  return [process.env.STRIPE_WEBHOOK_SECRET, process.env.STRIPE_WEBHOOK_SECRET_PREVIOUS].filter(
    (secret): secret is string => !!secret,
  );
}

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

      const session = await stripe.checkout.sessions.create(
        {
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
          allow_promotion_codes: promotionCodesAllowed(),
          // A one-time payment gets a real invoice (PDF from the receipt link on the billing page)
          invoice_creation: {
            enabled: true,
            invoice_data: { description: `Formation « ${course.title} »` },
          },
        },
        data.idempotencyKey ? { idempotencyKey: data.idempotencyKey } : undefined,
      );

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

      const session = await stripe.checkout.sessions.create(
        {
          mode: "subscription",
          line_items: [
            {
              price: data.priceId,
              quantity: 1,
            },
          ],
          // One Stripe customer per person (a new one for every checkout let the same buyer collect a new trial or
          // coupon each time); the e-mail only seeds a customer that does not exist yet
          ...(data.customerId ? { customer: data.customerId } : { customer_email: data.customerEmail }),
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
          allow_promotion_codes: promotionCodesAllowed(),
        },
        data.idempotencyKey ? { idempotencyKey: data.idempotencyKey } : undefined,
      );

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

  /**
   * Verifies the signature on the RAW body, against the current secret and, during a rotation, the previous one.
   * An event from the other mode than the configured key (a test event reaching a live deployment, or the reverse)
   * is refused as if unsigned: it must never grant or revoke anything.
   */
  verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    const secrets = webhookSecrets();
    if (secrets.length === 0) {
      throw new Error("STRIPE_WEBHOOK_SECRET is required");
    }

    let event: Stripe.Event | undefined;
    for (const secret of secrets) {
      try {
        event = stripe.webhooks.constructEvent(payload, signature, secret);
        break;
      } catch {
        // try the next secret
      }
    }
    if (!event) {
      console.error("Webhook signature verification failed");
      throw new WebhookSignatureError();
    }

    const mode = stripeKeyMode();
    if (mode !== "unknown" && event.livemode !== (mode === "live")) {
      console.error(`Webhook event ${event.id} is a ${event.livemode ? "live" : "test"} event but the key is a ${mode} key`);
      throw new WebhookSignatureError("Webhook event of another mode");
    }
    return event;
  }
}
