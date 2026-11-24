import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { SubscriptionStatus } from "@/lib/generated/prisma/client";
import { resetDatabase } from "../../support/test-db";
import { createSubscription, createUser, sessionFor } from "../../support/factories";

const h = vi.hoisted(() => ({
  session: null as { user: { id: string } } | null,
  stripe: {
    getRefundableSubscriptionPayments: vi.fn(),
    refundPayment: vi.fn(),
    cancelImmediately: vi.fn(),
  },
}));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn(async () => h.session) } } }));
// Stripe is the only thing replaced: the subscription, audit and analytics rows are real.
vi.mock("@/lib/payment-service", () => ({ paymentService: h.stripe }));
vi.mock("@/lib/payments/notify", () => ({ notifyRefund: vi.fn(async () => {}), notifyDispute: vi.fn(async () => {}) }));

import { requestRefund } from "@/app/[locale]/(main)/dashboard/actions/requestRefund";

const DAY = 24 * 3600 * 1000;
const payment = { paymentIntentId: "pi_123", invoiceId: "in_123", amountPaidCents: 1990, currency: "eur" };

beforeEach(async () => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  h.session = null;
  h.stripe.refundPayment.mockResolvedValue("re_123");
  h.stripe.cancelImmediately.mockResolvedValue(undefined);
  await resetDatabase(db);
});
afterAll(async () => {
  await resetDatabase(db); // leave an empty database for the suites that run next
  await db.$disconnect();
});

/** A subscriber whose last period was paid `paidAgoMs` ago: the refund window runs from that payment. */
async function subscribed(paidAgoMs: number, data = {}) {
  const user = await createUser();
  const sub = await createSubscription(user.id, { ...data });
  const paidAt = new Date(Date.now() - paidAgoMs);
  h.stripe.getRefundableSubscriptionPayments.mockResolvedValue({ windowStart: paidAt, payments: [{ ...payment, paidAt }] });
  h.session = sessionFor(user.id);
  return { user, sub };
}

describe("requestRefund (real database, Stripe mocked)", () => {
  it("refunds inside the 14-day window: Stripe is called once, the subscription is canceled and audited", async () => {
    const { user, sub } = await subscribed(13 * DAY + 23 * 3600 * 1000);

    const result = await requestRefund({ subscriptionId: sub.stripeSubscriptionId!, reason: "changed my mind" });

    expect(result).toMatchObject({ success: true, refund: { amount: 19.9, currency: "eur", refundId: "re_123" } });
    expect(h.stripe.refundPayment).toHaveBeenCalledWith("pi_123", 1990, {
      idempotencyKey: `refund:${sub.id}:pi_123`,
    });
    expect(h.stripe.cancelImmediately).toHaveBeenCalledWith(sub.stripeSubscriptionId, {
      idempotencyKey: `cancel:${sub.stripeSubscriptionId}:immediate`,
    });

    expect((await db.subscription.findUniqueOrThrow({ where: { id: sub.id } })).status).toBe(SubscriptionStatus.CANCELED);
    const audit = await db.invoiceAudit.findFirstOrThrow({ where: { userId: user.id } });
    expect(audit.type).toBe("REFUND_PROCESSED");
    expect(Number(audit.amount)).toBe(19.9);
    expect(audit.metadata).toMatchObject({
      refundReason: "changed my mind",
      stripeRefundId: "re_123",
      stripePaymentIntentId: "pi_123",
    });
    expect(await db.analyticsEvent.count({ where: { userId: user.id, type: "REFUND_ISSUED" } })).toBe(1);
  });

  it("refuses after the window and leaves everything untouched", async () => {
    const { sub } = await subscribed(14 * DAY + 1000);
    const result = await requestRefund({ subscriptionId: sub.stripeSubscriptionId! });

    expect(result).toMatchObject({ success: false, error: "REFUND_PERIOD_EXPIRED" });
    expect(h.stripe.refundPayment).not.toHaveBeenCalled();
    expect((await db.subscription.findUniqueOrThrow({ where: { id: sub.id } })).status).toBe(SubscriptionStatus.ACTIVE);
    expect(await db.invoiceAudit.count()).toBe(0);
  });

  it("only the owner can refund a subscription, and only while it is ACTIVE", async () => {
    const { sub } = await subscribed(DAY);
    const stranger = await createUser();

    h.session = sessionFor(stranger.id);
    expect(await requestRefund({ subscriptionId: sub.stripeSubscriptionId! }))
      .toMatchObject({ success: false, error: "SUBSCRIPTION_NOT_FOUND" });

    h.session = null;
    expect(await requestRefund({ subscriptionId: sub.stripeSubscriptionId! }))
      .toMatchObject({ success: false, error: "UNAUTHORIZED" });

    const { sub: canceled } = await subscribed(DAY, { status: SubscriptionStatus.CANCELED });
    expect(await requestRefund({ subscriptionId: canceled.stripeSubscriptionId! }))
      .toMatchObject({ success: false, error: "SUBSCRIPTION_NOT_ACTIVE" });
    expect(h.stripe.refundPayment).not.toHaveBeenCalled();
  });

  it("after a plan switch it gives back every invoice of the period, each on its own payment", async () => {
    const { user, sub } = await subscribed(DAY);
    const opening = { paymentIntentId: "pi_open", invoiceId: "in_open", amountPaidCents: 2900, currency: "eur", paidAt: new Date(Date.now() - 2 * DAY) };
    const upgrade = { paymentIntentId: "pi_up", invoiceId: "in_up", amountPaidCents: 26100, currency: "eur", paidAt: new Date(Date.now() - DAY) };
    h.stripe.getRefundableSubscriptionPayments.mockResolvedValue({ windowStart: opening.paidAt, payments: [opening, upgrade] });
    h.stripe.refundPayment.mockResolvedValueOnce("re_open").mockResolvedValueOnce("re_up");
    await db.payment.createMany({
      data: [
        { userId: user.id, kind: "SUBSCRIPTION", status: "COMPLETED", amount: "29", stripePaymentIntentId: "in_open", description: "Abonnement Premium" },
        { userId: user.id, kind: "SUBSCRIPTION", status: "COMPLETED", amount: "261", stripePaymentIntentId: "in_up", description: "Ajustement d’abonnement Premium" },
      ],
    });

    const result = await requestRefund({ subscriptionId: sub.stripeSubscriptionId! });

    expect(result).toMatchObject({ success: true, refund: { amount: 290, currency: "eur", refundId: "re_open" } });
    expect(h.stripe.refundPayment).toHaveBeenCalledTimes(2);
    expect(h.stripe.refundPayment).toHaveBeenCalledWith("pi_open", 2900, { idempotencyKey: `refund:${sub.id}:pi_open` });
    expect(h.stripe.refundPayment).toHaveBeenCalledWith("pi_up", 26100, { idempotencyKey: `refund:${sub.id}:pi_up` });
    expect(await db.payment.count({ where: { userId: user.id, status: "REFUNDED" } })).toBe(2);
    const audit = await db.invoiceAudit.findFirstOrThrow({ where: { userId: user.id } });
    expect(Number(audit.amount)).toBe(290);
    expect(audit.metadata).toMatchObject({ stripeRefundIds: ["re_open", "re_up"], stripePaymentIntentIds: ["pi_open", "pi_up"] });
  });

  it("the window runs from the opening payment: an adjustment invoice does not reopen it", async () => {
    const { sub } = await subscribed(DAY);
    const opening = { paymentIntentId: "pi_open", invoiceId: "in_open", amountPaidCents: 2900, currency: "eur", paidAt: new Date(Date.now() - 15 * DAY) };
    const upgrade = { paymentIntentId: "pi_up", invoiceId: "in_up", amountPaidCents: 26100, currency: "eur", paidAt: new Date(Date.now() - DAY) };
    h.stripe.getRefundableSubscriptionPayments.mockResolvedValue({ windowStart: opening.paidAt, payments: [opening, upgrade] });

    expect(await requestRefund({ subscriptionId: sub.stripeSubscriptionId! }))
      .toMatchObject({ success: false, error: "REFUND_PERIOD_EXPIRED" });
    expect(h.stripe.refundPayment).not.toHaveBeenCalled();
  });

  it("validates the input", async () => {
    expect(await requestRefund({ subscriptionId: "" })).toMatchObject({ error: "VALIDATION_ERROR" });
  });

  it("reports a missing payment and a Stripe failure without changing the subscription", async () => {
    const { sub } = await subscribed(DAY);

    h.stripe.getRefundableSubscriptionPayments.mockResolvedValueOnce({ windowStart: new Date(), payments: [{ ...payment, amountPaidCents: 0, paidAt: new Date() }] });
    expect(await requestRefund({ subscriptionId: sub.stripeSubscriptionId! }))
      .toMatchObject({ success: false, error: "NO_PAYMENT_FOUND" });

    h.stripe.refundPayment.mockRejectedValueOnce(new Error("card_declined"));
    expect(await requestRefund({ subscriptionId: sub.stripeSubscriptionId! }))
      .toMatchObject({ success: false, error: "STRIPE_REFUND_FAILED" });

    expect((await db.subscription.findUniqueOrThrow({ where: { id: sub.id } })).status).toBe(SubscriptionStatus.ACTIVE);
    expect(h.stripe.cancelImmediately).not.toHaveBeenCalled();
    expect(await db.invoiceAudit.count()).toBe(0);
  });
});
