import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { PaymentKind, PaymentStatus, SubscriptionStatus } from "@/lib/generated/prisma/browser";
import {
  clone,
  fixtures as f,
  toLegacyEvent,
  toLegacySubscription,
} from "../../fixtures/stripe";

/**
 * The webhook route end to end (real handlers, real paymentService) fed with
 * payloads RECORDED from Stripe in test mode (tests/fixtures/stripe), against an
 * in-memory database. Checks what a sequence of deliveries leaves behind, in any
 * order, on the current payload shape and on the shape of an older API version.
 */
const h = vi.hoisted(() => ({
  event: null as unknown,
  subscription: null as unknown,
  retrieveCalls: [] as unknown[],
  mem: null as null | ReturnType<typeof import("../../fixtures/stripe/memory-db").createMemoryDb>,
}));

vi.mock("@/lib/rate-limit", () => ({
  ensureIdempotent: async () => true,
  releaseIdempotent: async () => {},
}));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "stripe-signature": "sig" }),
}));
vi.mock("@/lib/db", async () => {
  const { createMemoryDb } = await import("../../fixtures/stripe/memory-db");
  h.mem = createMemoryDb();
  return { db: h.mem.db };
});
vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: { constructEvent: () => h.event },
    subscriptions: {
      retrieve: async (...args: unknown[]) => {
        h.retrieveCalls.push(args);
        return h.subscription;
      },
    },
  },
}));
vi.mock("@/lib/email-service", () => ({
  emailService: new Proxy({}, { get: () => async () => {} }),
}));
vi.mock("@/lib/analytics-helper", () => ({
  Analytics: new Proxy({}, { get: () => () => {} }),
}));
vi.mock("@/lib/structured-logger", () => {
  const noop = () => {};
  const logger = { debug: noop, info: noop, warn: noop, error: noop };
  return { createLogger: () => logger, logger };
});

import { POST } from "@/app/api/stripe/webhook/route";

const mem = () => h.mem!;
const payments = () => mem().db.payment.rows;
const subs = () => mem().db.subscription.rows;
const asNumber = (v: unknown) => Number(String(v));

async function deliver(event: unknown) {
  h.event = event;
  const res = await POST(
    new NextRequest("http://localhost/api/stripe/webhook", { method: "POST", body: "{}" }),
  );
  return { status: res.status, body: await res.json() };
}

/** The rows the checkout route writes before redirecting to Stripe. */
function seedCheckoutPlaceholders(kind: "course" | "subscription") {
  const sessionId = (kind === "course" ? f.checkoutPaymentEvent : f.checkoutSubscriptionEvent).data
    .object.id;
  if (kind === "course") {
    payments().push({
      id: "pending_course",
      userId: "user_1",
      courseId: "course_1",
      kind: PaymentKind.COURSE,
      status: PaymentStatus.PENDING,
      stripePaymentIntentId: sessionId,
      amount: 49,
    });
  } else {
    payments().push({
      id: "pending_sub",
      userId: "user_1",
      kind: PaymentKind.SUBSCRIPTION,
      status: PaymentStatus.PENDING,
      stripePaymentIntentId: sessionId,
      amount: 12,
    });
    subs().push({ id: "dbsub", userId: "user_1", status: SubscriptionStatus.INCOMPLETE });
  }
}

beforeEach(() => {
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  mem().reset();
  h.retrieveCalls.length = 0;
  h.subscription = clone(f.subscriptionRetrieved);
  mem().db.user.rows.push({ id: "user_1", email: "buyer@example.test", name: "Buyer" });
  mem().db.course.rows.push({ id: "course_1", title: "TS", slug: "ts", published: true });
});

describe("fixtures: the recorded payloads have the shapes the handlers rely on", () => {
  it("subscription-mode session: no PaymentIntent, but an invoice and a subscription", () => {
    const s = f.checkoutSubscriptionEvent.data.object;
    expect(s.mode).toBe("subscription");
    expect(s.payment_intent).toBeNull();
    expect(s.invoice).toMatch(/^in_/);
    expect(s.subscription).toMatch(/^sub_/);
    expect(s.payment_status).toBe("paid");
  });

  it("payment-mode session carries the PaymentIntent, a fully discounted one does not", () => {
    expect(f.checkoutPaymentEvent.data.object.payment_intent).toMatch(/^pi_/);
    const free = f.checkoutFreeEvent.data.object;
    expect(free.payment_status).toBe("paid");
    expect(free.payment_intent).toBeNull();
    expect(free.amount_total).toBe(0);
  });

  it("basil moved subscription fields: invoice.parent, item-level periods", () => {
    const inv = f.invoiceSucceededEvent.data.object as Record<string, any>;
    expect("subscription" in inv).toBe(false);
    expect(inv.parent.subscription_details.subscription).toMatch(/^sub_/);
    const sub = f.subscriptionCreatedEvent.data.object as Record<string, any>;
    expect("current_period_end" in sub).toBe(false);
    expect(typeof sub.items.data[0].current_period_end).toBe("number");
  });
});

describe("checkout.session.completed, one-time purchase", () => {
  it("settles the placeholder row with the PaymentIntent and enrols the buyer", async () => {
    seedCheckoutPlaceholders("course");
    const res = await deliver(f.checkoutPaymentEvent);
    expect(res.status).toBe(200);
    expect(payments()).toHaveLength(1);
    expect(payments()[0]).toMatchObject({
      id: "pending_course",
      status: PaymentStatus.COMPLETED,
      stripePaymentIntentId: f.checkoutPaymentEvent.data.object.payment_intent,
      currency: "eur",
    });
    expect(asNumber(payments()[0].amount)).toBe(49);
    expect(mem().db.enrollment.rows).toEqual([
      expect.objectContaining({ userId: "user_1", courseId: "course_1" }),
    ]);
  });

  it("a 100% promotion code (no PaymentIntent) still records the payment and grants access", async () => {
    seedCheckoutPlaceholders("course");
    const res = await deliver(f.checkoutFreeEvent);
    expect(res.status).toBe(200);
    expect(payments()).toHaveLength(1);
    expect(payments()[0]).toMatchObject({
      status: PaymentStatus.COMPLETED,
      stripePaymentIntentId: f.checkoutFreeEvent.data.object.id,
    });
    expect(asNumber(payments()[0].amount)).toBe(0);
    expect(mem().db.enrollment.rows).toHaveLength(1);
  });

  it("an unpaid session is ignored, the async confirmation fulfils it", async () => {
    seedCheckoutPlaceholders("course");
    const unpaid = clone(f.checkoutPaymentEvent);
    unpaid.data.object.payment_status = "unpaid";
    await deliver(unpaid);
    expect(payments()[0].status).toBe(PaymentStatus.PENDING);
    expect(mem().db.enrollment.rows).toHaveLength(0);

    const confirmed = clone(f.checkoutPaymentEvent);
    confirmed.type = "checkout.session.async_payment_succeeded" as never;
    await deliver(confirmed);
    expect(payments()).toHaveLength(1);
    expect(payments()[0].status).toBe(PaymentStatus.COMPLETED);
    expect(mem().db.enrollment.rows).toHaveLength(1);
  });

  it("a replay of the same purchase does not add a second payment row", async () => {
    seedCheckoutPlaceholders("course");
    await deliver(f.checkoutPaymentEvent);
    await deliver({ ...clone(f.checkoutPaymentEvent), id: "evt_other" });
    expect(payments()).toHaveLength(1);
  });

  it("without any placeholder row (checkout route failed to write it) the payment is created", async () => {
    await deliver(f.checkoutPaymentEvent);
    expect(payments()).toHaveLength(1);
    expect(payments()[0]).toMatchObject({ kind: PaymentKind.COURSE, status: PaymentStatus.COMPLETED });
  });
});

describe("subscription purchase: checkout + first invoice + subscription.created", () => {
  const inv = () => f.invoiceSucceededEvent.data.object;
  const sessionEvent = () => clone(f.checkoutSubscriptionEvent);
  const expectOneSettledPayment = () => {
    expect(payments()).toHaveLength(1);
    expect(payments()[0]).toMatchObject({
      kind: PaymentKind.SUBSCRIPTION,
      status: PaymentStatus.COMPLETED,
      // a subscription session has no PaymentIntent: the invoice is the reference
      stripePaymentIntentId: inv().id,
    });
    expect(asNumber(payments()[0].amount)).toBe(12);
    expect(payments()[0].description).toBe("Abonnement Premium");
  };

  const orders: Record<string, (() => unknown)[]> = {
    "checkout, invoice, subscription": [
      () => sessionEvent(),
      () => f.invoiceSucceededEvent,
      () => f.subscriptionCreatedEvent,
    ],
    "invoice, checkout, subscription": [
      () => f.invoiceSucceededEvent,
      () => sessionEvent(),
      () => f.subscriptionCreatedEvent,
    ],
    "subscription, invoice, checkout": [
      () => f.subscriptionCreatedEvent,
      () => f.invoiceSucceededEvent,
      () => sessionEvent(),
    ],
  };

  for (const [name, order] of Object.entries(orders)) {
    it(`leaves one settled payment row whatever the order (${name})`, async () => {
      seedCheckoutPlaceholders("subscription");
      for (const next of order) expect((await deliver(next())).status).toBe(200);
      expectOneSettledPayment();
      expect(subs()).toHaveLength(1);
      expect(subs()[0]).toMatchObject({
        userId: "user_1",
        status: SubscriptionStatus.ACTIVE,
        stripeSubscriptionId: f.subscriptionCreatedEvent.data.object.id,
      });
    });
  }

  it("same result when the endpoint still sends the pre-basil shapes", async () => {
    seedCheckoutPlaceholders("subscription");
    h.subscription = toLegacySubscription(h.subscription);
    await deliver(toLegacyEvent(f.invoiceSucceededEvent));
    await deliver(sessionEvent());
    await deliver(toLegacyEvent(f.subscriptionCreatedEvent));
    expectOneSettledPayment();
    const periodEnd = f.subscriptionCreatedEvent.data.object.items.data[0].current_period_end;
    expect(subs()[0].currentPeriodEnd).toEqual(new Date(periodEnd * 1000));
  });

  it("a renewal invoice gets its own row, keyed on the invoice", async () => {
    seedCheckoutPlaceholders("subscription");
    await deliver(f.invoiceSucceededEvent);
    const renewal = clone(f.invoiceSucceededEvent);
    renewal.data.object.id = "in_renewal";
    renewal.data.object.billing_reason = "subscription_cycle";
    await deliver({ ...renewal, id: "evt_renewal" });
    expect(payments().map((p) => p.stripePaymentIntentId).sort()).toEqual(
      [inv().id, "in_renewal"].sort(),
    );
    expect(payments().find((p) => p.stripePaymentIntentId === "in_renewal")?.description).toBe(
      "Renouvellement abonnement Premium",
    );
  });

  it("an abandoned checkout's placeholder is not touched by a renewal", async () => {
    seedCheckoutPlaceholders("subscription");
    const renewal = clone(f.invoiceSucceededEvent);
    renewal.data.object.billing_reason = "subscription_cycle";
    await deliver(renewal);
    expect(payments().find((p) => p.id === "pending_sub")?.status).toBe(PaymentStatus.PENDING);
    expect(payments()).toHaveLength(2);
  });
});

describe("customer.subscription.*", () => {
  it("created: period dates come from the subscription item", async () => {
    await deliver(f.subscriptionCreatedEvent);
    const item = f.subscriptionCreatedEvent.data.object.items.data[0];
    expect(subs()[0]).toMatchObject({
      userId: "user_1",
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(item.current_period_start * 1000),
      currentPeriodEnd: new Date(item.current_period_end * 1000),
      cancelAtPeriodEnd: false,
    });
  });

  it("created: pre-basil payloads (periods on the subscription) give the same dates", async () => {
    await deliver(f.subscriptionCreatedEvent);
    const modern = { ...subs()[0] };
    mem().reset();
    mem().db.user.rows.push({ id: "user_1", email: "buyer@example.test", name: "Buyer" });
    await deliver(toLegacyEvent(f.subscriptionCreatedEvent));
    expect(subs()[0].currentPeriodStart).toEqual(modern.currentPeriodStart);
    expect(subs()[0].currentPeriodEnd).toEqual(modern.currentPeriodEnd);
  });

  it("updated (cancel at period end) flags the subscription", async () => {
    subs().push({ id: "dbsub", userId: "user_1", status: SubscriptionStatus.ACTIVE });
    await deliver(f.subscriptionUpdatedEvent);
    expect(subs()[0]).toMatchObject({
      status: SubscriptionStatus.ACTIVE,
      cancelAtPeriodEnd: true,
    });
  });

  it("deleted cancels the subscription", async () => {
    subs().push({ id: "dbsub", userId: "user_1", status: SubscriptionStatus.ACTIVE });
    await deliver(f.subscriptionDeletedEvent);
    expect(subs()[0].status).toBe(SubscriptionStatus.CANCELED);
  });
});

describe("invoice.payment_failed", () => {
  it("marks the subscription past due, on the current and on the legacy invoice shape", async () => {
    for (const evt of [f.invoiceFailedEvent, toLegacyEvent(f.invoiceFailedEvent)]) {
      mem().reset();
      mem().db.user.rows.push({ id: "user_1", email: "buyer@example.test", name: "Buyer" });
      subs().push({
        id: "dbsub",
        userId: "user_1",
        status: SubscriptionStatus.ACTIVE,
        stripeSubscriptionId: f.invoiceFailedEvent.data.object.parent.subscription_details.subscription,
      });
      h.subscription = { ...clone(f.subscriptionRetrieved), metadata: { userId: "user_1" } };
      expect((await deliver(evt)).status).toBe(200);
      expect(subs()[0].status).toBe(SubscriptionStatus.PAST_DUE);
    }
  });
});

describe("charge.refunded (a refund made in the Stripe dashboard)", () => {
  const refundedIntent = f.chargeRefundedEvent.data.object.payment_intent;

  function seedCompletedPurchase(stripePaymentIntentId: string) {
    payments().push({
      id: "paid_course",
      userId: "user_1",
      courseId: "course_1",
      kind: PaymentKind.COURSE,
      status: PaymentStatus.COMPLETED,
      stripePaymentIntentId,
      amount: 9,
    });
  }

  it("marks the matching payment REFUNDED and records an audit row", async () => {
    seedCompletedPurchase(refundedIntent);

    const res = await deliver(f.chargeRefundedEvent);

    expect(res).toEqual({ status: 200, body: { received: true } });
    expect(payments()[0].status).toBe(PaymentStatus.REFUNDED);
    expect(mem().db.invoiceAudit.rows).toHaveLength(1);
    expect(mem().db.invoiceAudit.rows[0]).toMatchObject({
      userId: "user_1",
      paymentId: "paid_course",
      type: "CHARGE_REFUNDED",
      currency: "eur",
    });
  });

  it("acknowledges a refund that matches no payment and changes nothing", async () => {
    seedCompletedPurchase("pi_other");
    const before = JSON.stringify(payments());

    const res = await deliver(f.chargeRefundedEvent);

    expect(res).toEqual({ status: 200, body: { received: true } });
    expect(JSON.stringify(payments())).toBe(before);
    expect(mem().db.invoiceAudit.rows).toHaveLength(0);
  });

  it("a partial refund is audited and leaves the payment COMPLETED", async () => {
    seedCompletedPurchase(refundedIntent);
    const partial = clone(f.chargeRefundedEvent);
    partial.data.object.refunded = false;
    partial.data.object.amount_refunded = 300;

    const res = await deliver(partial);

    expect(res.status).toBe(200);
    expect(payments()[0].status).toBe(PaymentStatus.COMPLETED);
    expect(mem().db.invoiceAudit.rows).toHaveLength(1);
  });
});
