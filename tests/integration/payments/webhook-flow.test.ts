import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { CourseAccessTier, PaymentKind, PaymentStatus, Prisma, SubscriptionStatus } from "@/lib/generated/prisma/client";
import { paymentService } from "@/lib/payment-service";
import { resetDatabase } from "../../support/test-db";
import { createCourse, createUser, createSubscription } from "../../support/factories";
import {
  checkoutSessionCompleted,
  configurePlanPrices,
  invoicePaidEvent,
  stripeSubscription,
  subscriptionEvent,
  YEARLY_PRICE,
} from "../../support/stripe-objects";

vi.mock("@/lib/email-service", () => ({ emailService: new Proxy({}, { get: () => async () => {} }) }));
vi.mock("@/lib/analytics-helper", () => ({ Analytics: new Proxy({}, { get: () => () => {} }) }));
vi.mock("@/lib/structured-logger", () => {
  const noop = () => {};
  const logger = { debug: noop, info: noop, warn: noop, error: noop, withContext: () => logger, businessEvent: noop };
  return { createLogger: () => logger, logger };
});

import { handleSubscriptionUpserted } from "@/app/api/stripe/webhook/_handlers/subscription-upserted";
import { handleSubscriptionDeleted } from "@/app/api/stripe/webhook/_handlers/subscription-deleted";
import { handleInvoicePaymentSucceeded } from "@/app/api/stripe/webhook/_handlers/invoice-payment-succeeded";
import { handleInvoicePaymentFailed } from "@/app/api/stripe/webhook/_handlers/invoice-payment-failed";
import { handleCheckoutSessionCompleted } from "@/app/api/stripe/webhook/_handlers/checkout-session-completed";

/** What Stripe would answer now for a subscription: the test changes it to play the order of events. */
let live: Stripe.Subscription;
const getSubscription = vi.spyOn(paymentService, "getSubscription");
const refundPayment = vi.spyOn(paymentService, "refundPayment");
const cancelImmediately = vi.spyOn(paymentService, "cancelImmediately");
const getLatestSubscriptionPayment = vi.spyOn(paymentService, "getLatestSubscriptionPayment");

beforeEach(async () => {
  await resetDatabase(db);
  configurePlanPrices();
  getSubscription.mockReset().mockImplementation(async () => live);
  refundPayment.mockReset().mockResolvedValue("re_test");
  cancelImmediately.mockReset().mockResolvedValue(true);
  getLatestSubscriptionPayment.mockReset().mockResolvedValue({
    paymentIntentId: "pi_dup",
    invoiceId: "in_dup",
    amountPaidCents: 1999,
    currency: "eur",
    paidAt: new Date(),
  });
});
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

const subscriptionOf = (userId: string) => db.subscription.findUnique({ where: { userId } });
const paymentsOf = (userId: string, kind: PaymentKind) => db.payment.findMany({ where: { userId, kind }, orderBy: { createdAt: "asc" } });

describe("subscription events: Stripe's current state wins, in any order", () => {
  it("created -> updated -> deleted leaves a cancelled subscription", async () => {
    const user = await createUser();
    live = stripeSubscription({ userId: user.id, id: "sub_1" });
    await handleSubscriptionUpserted(subscriptionEvent("customer.subscription.created", live, new Date()));
    expect(await subscriptionOf(user.id)).toMatchObject({ status: SubscriptionStatus.ACTIVE, stripeSubscriptionId: "sub_1" });

    live = stripeSubscription({ userId: user.id, id: "sub_1", cancelAtPeriodEnd: true });
    await handleSubscriptionUpserted(subscriptionEvent("customer.subscription.updated", live, new Date()));
    expect(await subscriptionOf(user.id)).toMatchObject({ cancelAtPeriodEnd: true });

    live = stripeSubscription({ userId: user.id, id: "sub_1", status: "canceled" });
    await handleSubscriptionDeleted(subscriptionEvent("customer.subscription.deleted", live, new Date()));
    expect(await subscriptionOf(user.id)).toMatchObject({ status: SubscriptionStatus.CANCELED, cancelAtPeriodEnd: false });
  });

  it("an 'updated: active' event delivered after the deletion does not bring the subscription back", async () => {
    const user = await createUser();
    live = stripeSubscription({ userId: user.id, id: "sub_1" });
    const oldUpdate = subscriptionEvent("customer.subscription.updated", live, new Date(Date.now() - 3600_000));
    await handleSubscriptionUpserted(subscriptionEvent("customer.subscription.created", live, new Date(Date.now() - 7200_000)));

    live = stripeSubscription({ userId: user.id, id: "sub_1", status: "canceled" });
    await handleSubscriptionDeleted(subscriptionEvent("customer.subscription.deleted", live, new Date()));

    getSubscription.mockClear();
    await handleSubscriptionUpserted(oldUpdate); // retried by Stripe after a 500, long after
    expect((await subscriptionOf(user.id))?.status).toBe(SubscriptionStatus.CANCELED);
    expect(getSubscription).not.toHaveBeenCalled(); // recognised as stale without even asking Stripe
  });

  it("even a recent 'updated' event cannot resurrect it: the state stored is the one read from Stripe now", async () => {
    const user = await createUser();
    live = stripeSubscription({ userId: user.id, id: "sub_1", status: "canceled" });
    await createSubscription(user.id, { stripeSubscriptionId: "sub_1", status: SubscriptionStatus.CANCELED, lastEventAt: new Date(Date.now() - 60_000) });
    await handleSubscriptionUpserted(subscriptionEvent("customer.subscription.updated", stripeSubscription({ userId: user.id, id: "sub_1" }), new Date()));
    expect((await subscriptionOf(user.id))?.status).toBe(SubscriptionStatus.CANCELED);
  });

  it("the deletion of an old subscription leaves the current one alone", async () => {
    const user = await createUser();
    await createSubscription(user.id, { stripeSubscriptionId: "sub_current", status: SubscriptionStatus.ACTIVE });
    await handleSubscriptionDeleted(
      subscriptionEvent("customer.subscription.deleted", stripeSubscription({ userId: user.id, id: "sub_old", status: "canceled" }), new Date()),
    );
    expect(await subscriptionOf(user.id)).toMatchObject({ status: SubscriptionStatus.ACTIVE, stripeSubscriptionId: "sub_current" });
  });

  it("a subscription on a price that is not a Premium plan grants nothing", async () => {
    const user = await createUser();
    live = stripeSubscription({ userId: user.id, id: "sub_x", priceId: "price_test_something_else" });
    await handleSubscriptionUpserted(subscriptionEvent("customer.subscription.created", live, new Date()));
    expect(await subscriptionOf(user.id)).toBeNull();
  });

  it("a second running subscription is cancelled and refunded, the first stays", async () => {
    const user = await createUser();
    await createSubscription(user.id, { stripeSubscriptionId: "sub_first", status: SubscriptionStatus.ACTIVE });
    live = stripeSubscription({ userId: user.id, id: "sub_second", priceId: YEARLY_PRICE });
    await handleSubscriptionUpserted(subscriptionEvent("customer.subscription.created", live, new Date()));

    expect(await subscriptionOf(user.id)).toMatchObject({ stripeSubscriptionId: "sub_first" });
    expect(refundPayment).toHaveBeenCalledWith("pi_dup", 1999, { idempotencyKey: "duplicate-refund:sub_second" });
    expect(cancelImmediately).toHaveBeenCalledWith("sub_second", { idempotencyKey: "duplicate-cancel:sub_second" });
  });

  it("a failed payment moves the subscription to past due, and a late success restores it", async () => {
    const user = await createUser();
    live = stripeSubscription({ userId: user.id, id: "sub_1" });
    await handleSubscriptionUpserted(subscriptionEvent("customer.subscription.created", live, new Date(Date.now() - 5000)));

    live = stripeSubscription({ userId: user.id, id: "sub_1", status: "past_due" });
    await handleInvoicePaymentFailed({ ...invoicePaidEvent({}), type: "invoice.payment_failed" } as never);
    expect((await subscriptionOf(user.id))?.status).toBe(SubscriptionStatus.PAST_DUE);

    live = stripeSubscription({ userId: user.id, id: "sub_1", status: "active" });
    await handleInvoicePaymentSucceeded(invoicePaidEvent({ reason: "subscription_cycle" }));
    expect((await subscriptionOf(user.id))?.status).toBe(SubscriptionStatus.ACTIVE);
  });
});

describe("payments are recorded once, whatever the order and the number of deliveries", () => {
  it("the first invoice and the checkout session settle ONE payment row, in either order", async () => {
    for (const order of [["invoice", "checkout"], ["checkout", "invoice"]] as const) {
      await resetDatabase(db);
      const user = await createUser();
      live = stripeSubscription({ userId: user.id, id: "sub_1" });
      await db.payment.create({
        data: { userId: user.id, kind: PaymentKind.SUBSCRIPTION, status: PaymentStatus.PENDING, amount: "19.99", stripePaymentIntentId: "cs_1" },
      });
      for (const step of order) {
        if (step === "invoice") await handleInvoicePaymentSucceeded(invoicePaidEvent({ reason: "subscription_create", invoiceId: "in_1" }));
        else await handleCheckoutSessionCompleted(checkoutSessionCompleted({ mode: "subscription", userId: user.id, id: "cs_1", invoice: "in_1" }));
      }
      const rows = await paymentsOf(user.id, PaymentKind.SUBSCRIPTION);
      expect(rows, order.join(" then ")).toHaveLength(1);
      expect(rows[0]).toMatchObject({ status: PaymentStatus.COMPLETED, stripePaymentIntentId: "in_1" });
    }
  });

  it("each renewal is its own row, a replayed invoice adds nothing, an adjustment invoice is labelled as such", async () => {
    const user = await createUser();
    live = stripeSubscription({ userId: user.id, id: "sub_1" });
    await handleInvoicePaymentSucceeded(invoicePaidEvent({ invoiceId: "in_1", reason: "subscription_create" }));
    await handleInvoicePaymentSucceeded(invoicePaidEvent({ invoiceId: "in_2", reason: "subscription_cycle" }));
    await handleInvoicePaymentSucceeded(invoicePaidEvent({ invoiceId: "in_2", reason: "subscription_cycle" }));
    await handleInvoicePaymentSucceeded(invoicePaidEvent({ invoiceId: "in_3", reason: "subscription_update", amountPaid: 500 }));

    const rows = await paymentsOf(user.id, PaymentKind.SUBSCRIPTION);
    expect(rows.map((r) => r.stripePaymentIntentId)).toEqual(["in_1", "in_2", "in_3"]);
    expect(rows.map((r) => r.description)).toEqual([
      "Abonnement Premium",
      "Renouvellement abonnement Premium",
      "Ajustement d’abonnement Premium",
    ]);
  });

  it("a checkout paid twice at once (two simultaneous deliveries) leaves one completed payment and one enrolment", async () => {
    const user = await createUser();
    const course = await createCourse({ accessTier: CourseAccessTier.PREMIUM, price: new Prisma.Decimal("49.90") });
    await db.payment.create({
      data: { userId: user.id, courseId: course.id, kind: PaymentKind.COURSE, status: PaymentStatus.PENDING, amount: "49.90", stripePaymentIntentId: "cs_course" },
    });
    const event = () => checkoutSessionCompleted({ id: "cs_course", userId: user.id, productId: course.id, paymentIntent: "pi_course" });
    await Promise.all(Array.from({ length: 6 }, () => handleCheckoutSessionCompleted(event())));

    const rows = await paymentsOf(user.id, PaymentKind.COURSE);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ status: PaymentStatus.COMPLETED, stripePaymentIntentId: "pi_course" });
    expect(await db.enrollment.count({ where: { userId: user.id, courseId: course.id } })).toBe(1);
  });

  it("settlement time is written once, and a replay never brings a refunded or contested purchase back", async () => {
    const user = await createUser();
    const course = await createCourse({ accessTier: CourseAccessTier.PREMIUM, price: new Prisma.Decimal("49.90") });
    await db.payment.create({
      data: { userId: user.id, courseId: course.id, kind: PaymentKind.COURSE, status: PaymentStatus.PENDING, amount: "49.90", stripePaymentIntentId: "cs_c", createdAt: new Date("2020-01-01"), updatedAt: new Date("2020-01-01") },
    });
    const event = () => checkoutSessionCompleted({ id: "cs_c", userId: user.id, productId: course.id, paymentIntent: "pi_c" });

    await handleCheckoutSessionCompleted(event());
    const settled = (await paymentsOf(user.id, PaymentKind.COURSE))[0];
    // the settlement time, not the day the checkout was opened: the refund window runs from here
    expect(Date.now() - settled.updatedAt.getTime()).toBeLessThan(60_000);

    await handleCheckoutSessionCompleted(event());
    expect((await paymentsOf(user.id, PaymentKind.COURSE))[0].updatedAt).toEqual(settled.updatedAt);

    await db.payment.update({ where: { id: settled.id }, data: { status: PaymentStatus.REFUNDED } });
    await handleCheckoutSessionCompleted(event());
    expect((await paymentsOf(user.id, PaymentKind.COURSE))[0].status).toBe(PaymentStatus.REFUNDED);

    await db.payment.update({ where: { id: settled.id }, data: { status: PaymentStatus.DISPUTED } });
    await handleCheckoutSessionCompleted(event());
    expect((await paymentsOf(user.id, PaymentKind.COURSE))[0].status).toBe(PaymentStatus.DISPUTED);
  });

  it("a second payment for a course the buyer already holds is refunded at once", async () => {
    const user = await createUser();
    const course = await createCourse({ accessTier: CourseAccessTier.PREMIUM, price: new Prisma.Decimal("49.90") });
    await db.payment.create({
      data: { userId: user.id, courseId: course.id, kind: PaymentKind.COURSE, status: PaymentStatus.COMPLETED, amount: "49.90", stripePaymentIntentId: "pi_first" },
    });
    await db.payment.create({
      data: { userId: user.id, courseId: course.id, kind: PaymentKind.COURSE, status: PaymentStatus.PENDING, amount: "49.90", stripePaymentIntentId: "cs_second" },
    });
    await handleCheckoutSessionCompleted(checkoutSessionCompleted({ id: "cs_second", userId: user.id, productId: course.id, paymentIntent: "pi_second" }));

    expect(refundPayment).toHaveBeenCalledWith("pi_second", undefined, { idempotencyKey: "duplicate-purchase:pi_second" });
    const rows = await paymentsOf(user.id, PaymentKind.COURSE);
    expect(rows.map((r) => [r.stripePaymentIntentId, r.status])).toEqual([
      ["pi_first", PaymentStatus.COMPLETED],
      ["pi_second", PaymentStatus.REFUNDED],
    ]);
    expect(await db.auditLog.findFirst({ where: { action: "payment.refunded", targetType: "payment" } })).toMatchObject({
      metadata: { reason: "duplicate_purchase" },
    });
  });

  it("a duplicate subscription paid through its own checkout records no payment and keeps the first subscription", async () => {
    const user = await createUser();
    await createSubscription(user.id, { stripeSubscriptionId: "sub_first", status: SubscriptionStatus.ACTIVE });
    live = stripeSubscription({ userId: user.id, id: "sub_second" });
    await handleCheckoutSessionCompleted(checkoutSessionCompleted({ mode: "subscription", userId: user.id, subscription: "sub_second", id: "cs_2", invoice: "in_second" }));

    expect(await subscriptionOf(user.id)).toMatchObject({ stripeSubscriptionId: "sub_first" });
    expect(await paymentsOf(user.id, PaymentKind.SUBSCRIPTION)).toHaveLength(0);
    expect(cancelImmediately).toHaveBeenCalledWith("sub_second", { idempotencyKey: "duplicate-cancel:sub_second" });
  });
});
