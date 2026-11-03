import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { CourseAccessTier, PaymentKind, PaymentStatus, SubscriptionStatus } from "@/lib/generated/prisma/client";
import { clone, fixtures as f, toLegacyEvent, toLegacySubscription } from "../../fixtures/stripe";
import { createCourse, createUser } from "../../support/factories";
import { resetDatabase } from "../../support/test-db";

/**
 * The webhook route end to end (real handlers, real paymentService, real claims) fed with payloads RECORDED from Stripe
 * in test mode (tests/fixtures/stripe), against the real test database. Checks what a sequence of deliveries leaves
 * behind, in any order, on the current payload shape and on the shape of an older API version.
 */
const h = vi.hoisted(() => ({ event: null as unknown, subscription: null as unknown }));

vi.mock("next/headers", () => ({ headers: async () => new Headers({ "stripe-signature": "sig" }) }));
vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: { constructEvent: () => h.event },
    subscriptions: { retrieve: async () => h.subscription },
  },
  stripeKeyMode: () => "unknown",
  assertStripeKeyMode: () => {},
}));
vi.mock("@/lib/email-service", () => ({ emailService: new Proxy({}, { get: () => async () => {} }) }));
vi.mock("@/lib/analytics-helper", () => ({ Analytics: new Proxy({}, { get: () => () => {} }) }));
vi.mock("@/lib/structured-logger", () => {
  const noop = () => {};
  const logger = { debug: noop, info: noop, warn: noop, error: noop, withContext: () => logger, businessEvent: noop };
  return { createLogger: () => logger, logger };
});

import { POST } from "@/app/api/stripe/webhook/route";

/** The recorded events carry the time they were recorded; deliver them as if Stripe had just created them. */
let sequence = 0;
const fresh = <T extends { created?: number; id?: string; type?: string }>(event: T): T => ({
  ...clone(event),
  // the recordings all carry the same event id: give each delivery its own
  id: `evt_${event.type ?? "x"}_${++sequence}`,
  created: Math.floor(Date.now() / 1000),
});

async function deliver(event: unknown) {
  h.event = event;
  const res = await POST(new NextRequest("http://localhost/api/stripe/webhook", { method: "POST", body: "{}" }));
  return { status: res.status, body: await res.json() };
}

const payments = () => db.payment.findMany({ orderBy: { createdAt: "asc" } });
const subs = () => db.subscription.findMany();

/** The rows the checkout route writes before redirecting to Stripe. */
async function seedCheckoutPlaceholders(kind: "course" | "subscription") {
  const sessionId = (kind === "course" ? f.checkoutPaymentEvent : f.checkoutSubscriptionEvent).data.object.id;
  if (kind === "course") {
    await db.payment.create({
      data: { id: "pending_course", userId: "user_1", courseId: "course_1", kind: PaymentKind.COURSE, status: PaymentStatus.PENDING, stripePaymentIntentId: sessionId, amount: 49 },
    });
  } else {
    await db.payment.create({
      data: { id: "pending_sub", userId: "user_1", kind: PaymentKind.SUBSCRIPTION, status: PaymentStatus.PENDING, stripePaymentIntentId: sessionId, amount: 12 },
    });
    await db.subscription.create({ data: { id: "dbsub", userId: "user_1", status: SubscriptionStatus.INCOMPLETE } });
  }
}

beforeEach(async () => {
  await resetDatabase(db);
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  const price = f.subscriptionRetrieved.items.data[0].price.id;
  process.env.STRIPE_MONTHLY_PRICE_ID = price;
  process.env.STRIPE_YEARLY_PRICE_ID = "price_fixture_yearly";
  h.subscription = clone(f.subscriptionRetrieved);
  await createUser({ id: "user_1", email: "buyer@example.test", name: "Buyer" });
  await createCourse({ id: "course_1", title: "TS", slug: "ts", accessTier: CourseAccessTier.PREMIUM });
});
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

describe("checkout.session.completed, one-time purchase", () => {
  it("settles the placeholder row with the PaymentIntent and enrols the buyer", async () => {
    await seedCheckoutPlaceholders("course");
    const res = await deliver(f.checkoutPaymentEvent);
    expect(res.status).toBe(200);
    const rows = await payments();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: "pending_course",
      status: PaymentStatus.COMPLETED,
      stripePaymentIntentId: f.checkoutPaymentEvent.data.object.payment_intent,
      currency: "eur",
    });
    expect(Number(rows[0].amount)).toBe(49);
    expect(await db.enrollment.findMany()).toEqual([expect.objectContaining({ userId: "user_1", courseId: "course_1" })]);
  });

  it("a 100% promotion code (no PaymentIntent) still records the payment and grants access", async () => {
    await seedCheckoutPlaceholders("course");
    const res = await deliver(f.checkoutFreeEvent);
    expect(res.status).toBe(200);
    const rows = await payments();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ status: PaymentStatus.COMPLETED, stripePaymentIntentId: f.checkoutFreeEvent.data.object.id });
    expect(Number(rows[0].amount)).toBe(0);
    expect(await db.enrollment.count()).toBe(1);
  });

  it("an unpaid session is ignored, the async confirmation fulfils it", async () => {
    await seedCheckoutPlaceholders("course");
    const unpaid = clone(f.checkoutPaymentEvent);
    unpaid.data.object.payment_status = "unpaid";
    await deliver(unpaid);
    expect((await payments())[0].status).toBe(PaymentStatus.PENDING);
    expect(await db.enrollment.count()).toBe(0);

    const confirmed = { ...clone(f.checkoutPaymentEvent), id: "evt_async", type: "checkout.session.async_payment_succeeded" };
    await deliver(confirmed);
    expect(await payments()).toHaveLength(1);
    expect((await payments())[0].status).toBe(PaymentStatus.COMPLETED);
    expect(await db.enrollment.count()).toBe(1);
  });

  it("a redelivery of the same event is acknowledged without reprocessing; the same purchase under another event id adds no row", async () => {
    await seedCheckoutPlaceholders("course");
    expect((await deliver(f.checkoutPaymentEvent)).body).toEqual({ received: true });
    expect((await deliver(f.checkoutPaymentEvent)).body).toEqual({ received: true, duplicate: true });
    await deliver({ ...clone(f.checkoutPaymentEvent), id: "evt_other" });
    expect(await payments()).toHaveLength(1);
  });

  it("without any placeholder row (checkout route failed to write it) the payment is created", async () => {
    await deliver(f.checkoutPaymentEvent);
    const rows = await payments();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ kind: PaymentKind.COURSE, status: PaymentStatus.COMPLETED });
  });
});

describe("subscription purchase: checkout + first invoice + subscription.created", () => {
  const inv = () => f.invoiceSucceededEvent.data.object;
  const sessionEvent = () => fresh(f.checkoutSubscriptionEvent);
  const expectOneSettledPayment = async () => {
    const rows = await payments();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      kind: PaymentKind.SUBSCRIPTION,
      status: PaymentStatus.COMPLETED,
      // a subscription session has no PaymentIntent: the invoice is the reference
      stripePaymentIntentId: inv().id,
    });
    expect(Number(rows[0].amount)).toBe(12);
    expect(rows[0].description).toBe("Abonnement Premium");
  };

  const orders: Record<string, (() => unknown)[]> = {
    "checkout, invoice, subscription": [() => sessionEvent(), () => fresh(f.invoiceSucceededEvent), () => fresh(f.subscriptionCreatedEvent)],
    "invoice, checkout, subscription": [() => fresh(f.invoiceSucceededEvent), () => sessionEvent(), () => fresh(f.subscriptionCreatedEvent)],
    "subscription, invoice, checkout": [() => fresh(f.subscriptionCreatedEvent), () => fresh(f.invoiceSucceededEvent), () => sessionEvent()],
  };

  for (const [name, order] of Object.entries(orders)) {
    it(`leaves one settled payment row whatever the order (${name})`, async () => {
      await seedCheckoutPlaceholders("subscription");
      for (const next of order) expect((await deliver(next())).status).toBe(200);
      await expectOneSettledPayment();
      const rows = await subs();
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        userId: "user_1",
        status: SubscriptionStatus.ACTIVE,
        stripeSubscriptionId: f.subscriptionCreatedEvent.data.object.id,
      });
    });
  }

  it("same result when the endpoint still sends the pre-basil shapes", async () => {
    await seedCheckoutPlaceholders("subscription");
    h.subscription = toLegacySubscription(h.subscription);
    await deliver(fresh(toLegacyEvent(f.invoiceSucceededEvent)));
    await deliver(sessionEvent());
    await deliver(fresh(toLegacyEvent(f.subscriptionCreatedEvent)));
    await expectOneSettledPayment();
    const periodEnd = f.subscriptionRetrieved.items.data[0].current_period_end;
    expect((await subs())[0].currentPeriodEnd).toEqual(new Date(periodEnd * 1000));
  });

  it("a renewal invoice gets its own row, keyed on the invoice", async () => {
    await seedCheckoutPlaceholders("subscription");
    await deliver(fresh(f.invoiceSucceededEvent));
    const renewal = fresh(f.invoiceSucceededEvent);
    renewal.data.object.id = "in_renewal";
    renewal.data.object.billing_reason = "subscription_cycle";
    await deliver({ ...renewal, id: "evt_renewal" });
    const rows = await payments();
    expect(rows.map((p) => p.stripePaymentIntentId).sort()).toEqual([inv().id, "in_renewal"].sort());
    expect(rows.find((p) => p.stripePaymentIntentId === "in_renewal")?.description).toBe("Renouvellement abonnement Premium");
  });

  it("an abandoned checkout's placeholder is not touched by a renewal", async () => {
    await seedCheckoutPlaceholders("subscription");
    const renewal = fresh(f.invoiceSucceededEvent);
    renewal.data.object.billing_reason = "subscription_cycle";
    await deliver(renewal);
    const rows = await payments();
    expect(rows.find((p) => p.id === "pending_sub")?.status).toBe(PaymentStatus.PENDING);
    expect(rows).toHaveLength(2);
  });
});

describe("customer.subscription.*", () => {
  it("created: period dates come from the subscription item", async () => {
    await deliver(fresh(f.subscriptionCreatedEvent));
    const item = f.subscriptionRetrieved.items.data[0]; // the state is read from Stripe, not from the event
    expect((await subs())[0]).toMatchObject({
      userId: "user_1",
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(item.current_period_start * 1000),
      currentPeriodEnd: new Date(item.current_period_end * 1000),
      cancelAtPeriodEnd: false,
    });
  });

  it("created: pre-basil payloads (periods on the subscription) give the same dates", async () => {
    await deliver(fresh(f.subscriptionCreatedEvent));
    const modern = (await subs())[0];
    await db.subscription.deleteMany();
    h.subscription = toLegacySubscription(h.subscription);
    await deliver({ ...fresh(toLegacyEvent(f.subscriptionCreatedEvent)), id: "evt_legacy" });
    const legacy = (await subs())[0];
    expect(legacy.currentPeriodStart).toEqual(modern.currentPeriodStart);
    expect(legacy.currentPeriodEnd).toEqual(modern.currentPeriodEnd);
  });

  it("updated (cancel at period end) flags the subscription", async () => {
    await db.subscription.create({
      data: { userId: "user_1", status: SubscriptionStatus.ACTIVE, stripeSubscriptionId: f.subscriptionRetrieved.id },
    });
    h.subscription = { ...clone(f.subscriptionRetrieved), cancel_at_period_end: true };
    await deliver(fresh(f.subscriptionUpdatedEvent));
    expect((await subs())[0]).toMatchObject({ status: SubscriptionStatus.ACTIVE, cancelAtPeriodEnd: true });
  });

  it("deleted cancels the subscription", async () => {
    await db.subscription.create({
      data: { userId: "user_1", status: SubscriptionStatus.ACTIVE, stripeSubscriptionId: f.subscriptionDeletedEvent.data.object.id },
    });
    await deliver(fresh(f.subscriptionDeletedEvent));
    expect((await subs())[0].status).toBe(SubscriptionStatus.CANCELED);
  });
});

describe("invoice.payment_failed", () => {
  it("marks the subscription past due, on the current and on the legacy invoice shape", async () => {
    for (const evt of [f.invoiceFailedEvent, toLegacyEvent(f.invoiceFailedEvent)]) {
      await db.subscription.deleteMany();
      await db.subscription.create({
        data: {
          userId: "user_1",
          status: SubscriptionStatus.ACTIVE,
          stripeSubscriptionId: f.invoiceFailedEvent.data.object.parent.subscription_details.subscription,
        },
      });
      h.subscription = { ...clone(f.subscriptionRetrieved), status: "past_due", metadata: { userId: "user_1" } };
      expect((await deliver({ ...fresh(evt), id: `evt_failed_${Math.random()}` })).status).toBe(200);
      expect((await subs())[0].status).toBe(SubscriptionStatus.PAST_DUE);
    }
  });
});

describe("charge.refunded (a refund made in the Stripe dashboard)", () => {
  const refundedIntent = f.chargeRefundedEvent.data.object.payment_intent;

  const seedCompletedPurchase = (stripePaymentIntentId: string) =>
    db.payment.create({
      data: { id: "paid_course", userId: "user_1", courseId: "course_1", kind: PaymentKind.COURSE, status: PaymentStatus.COMPLETED, stripePaymentIntentId, amount: 9 },
    });

  it("marks the matching payment REFUNDED and records an audit row", async () => {
    await seedCompletedPurchase(refundedIntent);
    expect(await deliver(f.chargeRefundedEvent)).toEqual({ status: 200, body: { received: true } });
    expect((await payments())[0].status).toBe(PaymentStatus.REFUNDED);
    const audits = await db.invoiceAudit.findMany();
    expect(audits).toHaveLength(1);
    expect(audits[0]).toMatchObject({ userId: "user_1", paymentId: "paid_course", type: "CHARGE_REFUNDED", currency: "eur" });
  });

  it("acknowledges a refund that matches no payment and changes nothing", async () => {
    await seedCompletedPurchase("pi_other");
    expect(await deliver(f.chargeRefundedEvent)).toEqual({ status: 200, body: { received: true } });
    expect((await payments())[0].status).toBe(PaymentStatus.COMPLETED);
    expect(await db.invoiceAudit.count()).toBe(0);
  });

  it("a partial refund is audited and leaves the payment COMPLETED", async () => {
    await seedCompletedPurchase(refundedIntent);
    const partial = clone(f.chargeRefundedEvent);
    partial.data.object.refunded = false;
    partial.data.object.amount_refunded = 300;
    expect((await deliver(partial)).status).toBe(200);
    expect((await payments())[0].status).toBe(PaymentStatus.COMPLETED);
    expect(await db.invoiceAudit.count()).toBe(1);
  });
});
