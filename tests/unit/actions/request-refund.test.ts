import { describe, it, expect, vi, beforeEach } from "vitest";

const m = vi.hoisted(() => ({
  getSession: vi.fn(),
  subscriptionFindUnique: vi.fn(),
  subscriptionUpdate: vi.fn(),
  auditCreate: vi.fn(),
  getLatestSubscriptionPayment: vi.fn(),
  refundPayment: vi.fn(),
  cancelImmediately: vi.fn(),
  recordRefund: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: m.getSession } } }));
vi.mock("next/headers", () => ({ headers: vi.fn(() => Promise.resolve(new Headers())) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    subscription: { findUnique: m.subscriptionFindUnique, update: m.subscriptionUpdate },
    invoiceAudit: { create: m.auditCreate },
    $transaction: vi.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  },
}));
vi.mock("@/lib/payment-service", () => ({
  paymentService: {
    getLatestSubscriptionPayment: m.getLatestSubscriptionPayment,
    refundPayment: m.refundPayment,
    cancelImmediately: m.cancelImmediately,
  },
}));
vi.mock("@/lib/analytics-helper", () => ({ AnalyticsHelper: { recordRefund: m.recordRefund } }));

import { requestRefund } from "@/app/[locale]/(main)/dashboard/actions/requestRefund";

const recentPeriodStart = () => new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
const subscription = (overrides = {}) => ({
  id: "sub-db-1",
  status: "ACTIVE",
  currentPeriodStart: recentPeriodStart(),
  stripeSubscriptionId: "sub_123",
  ...overrides,
});
const input = { subscriptionId: "sub_123" };

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  m.getSession.mockResolvedValue({ user: { id: "user-1" } });
  m.subscriptionFindUnique.mockResolvedValue(subscription());
  m.getLatestSubscriptionPayment.mockResolvedValue({
    paymentIntentId: "pi_999",
    amountPaidCents: 2900,
    currency: "eur",
  });
  m.refundPayment.mockResolvedValue("re_555");
  m.cancelImmediately.mockResolvedValue(true);
  m.subscriptionUpdate.mockResolvedValue({});
  m.auditCreate.mockResolvedValue({});
  m.recordRefund.mockResolvedValue(undefined);
});

describe("requestRefund", () => {
  it("rejects an anonymous caller", async () => {
    m.getSession.mockResolvedValue(null);
    expect(await requestRefund(input)).toMatchObject({ success: false, error: "UNAUTHORIZED" });
    expect(m.refundPayment).not.toHaveBeenCalled();
  });

  it("only looks up the caller's own subscription", async () => {
    await requestRefund(input);
    expect(m.subscriptionFindUnique.mock.calls[0][0].where).toEqual({
      userId: "user-1",
      stripeSubscriptionId: "sub_123",
    });
  });

  it("answers SUBSCRIPTION_NOT_FOUND for someone else's subscription", async () => {
    m.subscriptionFindUnique.mockResolvedValue(null);
    expect(await requestRefund(input)).toMatchObject({ error: "SUBSCRIPTION_NOT_FOUND" });
    expect(m.refundPayment).not.toHaveBeenCalled();
  });

  it("refuses a subscription that is already canceled (no second refund)", async () => {
    m.subscriptionFindUnique.mockResolvedValue(subscription({ status: "CANCELED" }));
    expect(await requestRefund(input)).toMatchObject({ error: "SUBSCRIPTION_NOT_ACTIVE" });
    expect(m.refundPayment).not.toHaveBeenCalled();
  });

  it("refuses after the 14-day window", async () => {
    m.subscriptionFindUnique.mockResolvedValue(
      subscription({ currentPeriodStart: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) }),
    );
    expect(await requestRefund(input)).toMatchObject({ error: "REFUND_PERIOD_EXPIRED" });
    expect(m.refundPayment).not.toHaveBeenCalled();
  });

  it("answers NO_PAYMENT_FOUND when Stripe has no paid invoice", async () => {
    m.getLatestSubscriptionPayment.mockResolvedValue(null);
    expect(await requestRefund(input)).toMatchObject({ error: "NO_PAYMENT_FOUND" });
    expect(m.refundPayment).not.toHaveBeenCalled();
  });

  it("refunds the real PaymentIntent (not the subscription id) for the amount Stripe collected", async () => {
    await requestRefund(input);
    expect(m.getLatestSubscriptionPayment).toHaveBeenCalledWith("sub_123");
    expect(m.refundPayment).toHaveBeenCalledWith("pi_999", 2900, {
      idempotencyKey: "refund:sub-db-1:pi_999",
    });
  });

  it("cancels the Stripe subscription, then records cancellation and audit atomically", async () => {
    const result = await requestRefund({ ...input, reason: "changed my mind" });
    expect(m.cancelImmediately).toHaveBeenCalledWith("sub_123", {
      idempotencyKey: "cancel:sub_123:immediate",
    });
    expect(m.subscriptionUpdate.mock.calls[0][0].data.status).toBe("CANCELED");
    const audit = m.auditCreate.mock.calls[0][0].data;
    expect(audit).toMatchObject({ type: "REFUND_PROCESSED", amount: 29, currency: "eur" });
    expect(audit.metadata).toMatchObject({
      stripeRefundId: "re_555",
      stripePaymentIntentId: "pi_999",
      refundReason: "changed my mind",
    });
    expect(result).toEqual({
      success: true,
      message: expect.stringContaining("Remboursement effectué"),
      refund: { amount: 29, currency: "eur", refundId: "re_555" },
    });
  });

  it("returns the Stripe refund id, not the subscription id", async () => {
    const result = await requestRefund(input);
    expect(result.refund?.refundId).toBe("re_555");
  });

  it("changes nothing in the database when the Stripe refund fails", async () => {
    m.refundPayment.mockRejectedValue(new Error("REFUND_FAILED"));
    expect(await requestRefund(input)).toMatchObject({ error: "STRIPE_REFUND_FAILED" });
    expect(m.cancelImmediately).not.toHaveBeenCalled();
    expect(m.subscriptionUpdate).not.toHaveBeenCalled();
    expect(m.auditCreate).not.toHaveBeenCalled();
  });

  it("keeps the subscription ACTIVE when cancellation fails after the refund (a retry reuses the refund)", async () => {
    m.cancelImmediately.mockRejectedValue(new Error("CANCEL_IMMEDIATE_FAILED"));
    expect(await requestRefund(input)).toMatchObject({ error: "STRIPE_REFUND_FAILED" });
    expect(m.subscriptionUpdate).not.toHaveBeenCalled();
    await requestRefund(input);
    expect(m.refundPayment.mock.calls[1][2]).toEqual(m.refundPayment.mock.calls[0][2]);
  });

  it("does not fail a completed refund when analytics fails", async () => {
    m.recordRefund.mockRejectedValue(new Error("analytics down"));
    expect(await requestRefund(input)).toMatchObject({ success: true });
  });

  it("rejects invalid input", async () => {
    expect(await requestRefund({ subscriptionId: "" })).toMatchObject({ error: "VALIDATION_ERROR" });
  });
});
