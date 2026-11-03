/**
 * Builders of the Stripe objects the payment code reads, for DB-backed tests. Only the fields the code uses; periods are
 * on the subscription item, as since API 2025-03-31.
 */
import type Stripe from "stripe";

export const MONTHLY_PRICE = "price_test_monthly";
export const YEARLY_PRICE = "price_test_yearly";

/** Makes the two Premium plans known, as in production. Call in `beforeEach`. */
export function configurePlanPrices() {
  process.env.STRIPE_MONTHLY_PRICE_ID = MONTHLY_PRICE;
  process.env.STRIPE_YEARLY_PRICE_ID = YEARLY_PRICE;
}

const SECOND = 1000;

export function stripeSubscription(
  over: {
    id?: string;
    userId?: string | null;
    status?: string;
    priceId?: string;
    customer?: string;
    start?: Date;
    end?: Date;
    cancelAtPeriodEnd?: boolean;
  } = {},
): Stripe.Subscription {
  const start = over.start ?? new Date("2030-01-01T00:00:00Z");
  const end = over.end ?? new Date(start.getTime() + 30 * 24 * 3600 * SECOND);
  return {
    id: over.id ?? "sub_1",
    object: "subscription",
    status: over.status ?? "active",
    customer: over.customer ?? "cus_1",
    cancel_at_period_end: over.cancelAtPeriodEnd ?? false,
    metadata: over.userId === null ? {} : { userId: over.userId ?? "user_1" },
    items: {
      data: [
        {
          current_period_start: Math.floor(start.getTime() / SECOND),
          current_period_end: Math.floor(end.getTime() / SECOND),
          price: { id: over.priceId ?? MONTHLY_PRICE, unit_amount: 1999, recurring: { interval: "month" } },
        },
      ],
    },
  } as unknown as Stripe.Subscription;
}

export function subscriptionEvent(
  type: "customer.subscription.created" | "customer.subscription.updated" | "customer.subscription.deleted",
  subscription: Stripe.Subscription,
  created: Date,
  id = `evt_${Math.random().toString(36).slice(2, 10)}`,
) {
  return { id, type, created: Math.floor(created.getTime() / SECOND), data: { object: subscription } } as never;
}

export function invoicePaidEvent(over: {
  invoiceId?: string;
  subscriptionId?: string;
  reason?: "subscription_create" | "subscription_cycle" | "subscription_update";
  amountPaid?: number;
  created?: Date;
}) {
  return {
    id: `evt_${Math.random().toString(36).slice(2, 10)}`,
    type: "invoice.payment_succeeded",
    created: Math.floor((over.created ?? new Date()).getTime() / SECOND),
    data: {
      object: {
        id: over.invoiceId ?? "in_1",
        parent: { subscription_details: { subscription: over.subscriptionId ?? "sub_1" } },
        billing_reason: over.reason ?? "subscription_cycle",
        amount_paid: over.amountPaid ?? 1999,
        currency: "eur",
      },
    },
  } as never;
}

export function checkoutSessionCompleted(over: {
  id?: string;
  mode?: "payment" | "subscription";
  userId?: string;
  productId?: string;
  paymentIntent?: string | null;
  subscription?: string | null;
  invoice?: string | null;
  amountTotal?: number;
}) {
  const mode = over.mode ?? "payment";
  return {
    id: `evt_${Math.random().toString(36).slice(2, 10)}`,
    type: "checkout.session.completed",
    created: Math.floor(Date.now() / SECOND),
    data: {
      object: {
        id: over.id ?? "cs_1",
        mode,
        payment_status: "paid",
        created: Math.floor(Date.now() / SECOND),
        customer: "cus_1",
        currency: "eur",
        amount_total: over.amountTotal ?? (mode === "payment" ? 4990 : 1999),
        payment_intent: over.paymentIntent === undefined ? (mode === "payment" ? "pi_1" : null) : over.paymentIntent,
        subscription: over.subscription === undefined ? (mode === "subscription" ? "sub_1" : null) : over.subscription,
        invoice: over.invoice === undefined ? (mode === "subscription" ? "in_1" : null) : over.invoice,
        metadata:
          mode === "payment"
            ? { userId: over.userId ?? "user_1", productId: over.productId ?? "course_1", type: "course_purchase" }
            : { userId: over.userId ?? "user_1", type: "subscription" },
      },
    },
  } as never;
}
