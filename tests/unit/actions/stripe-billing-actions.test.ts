import { beforeEach, describe, expect, it, vi } from "vitest";
import { SubscriptionStatus } from "@/lib/generated/prisma/browser";
import { clone, fixtures as f, toLegacySubscription } from "../../fixtures/stripe";

/**
 * requestRefund and switchSubscriptionPlan through the REAL paymentService, with
 * only the Stripe client replaced by answers recorded from Stripe (tests/fixtures).
 * Pins the calls sent to Stripe and that the refund finds the payment again.
 */
const h = vi.hoisted(() => ({
  session: { user: { id: "user_1" } } as null | { user: { id: string } },
  stripe: null as unknown as Record<string, any>,
  mem: null as null | ReturnType<typeof import("../../fixtures/stripe/memory-db").createMemoryDb>,
  recordRefund: null as unknown as import("vitest").Mock,
}));

vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: async () => h.session } } }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("@/lib/db", async () => {
  const { createMemoryDb } = await import("../../fixtures/stripe/memory-db");
  h.mem = createMemoryDb();
  return {
    db: { ...h.mem.db, $transaction: (ops: Promise<unknown>[]) => Promise.all(ops) },
  };
});
vi.mock("@/lib/stripe", async () => {
  const { vi } = await import("vitest");
  h.stripe = {
    subscriptions: { retrieve: vi.fn(), update: vi.fn(), cancel: vi.fn() },
    invoices: { list: vi.fn(), createPreview: vi.fn() },
    invoicePayments: { list: vi.fn() },
    refunds: { create: vi.fn() },
  };
  return { stripe: h.stripe };
});
vi.mock("@/lib/analytics-helper", async () => {
  const { vi } = await import("vitest");
  h.recordRefund = vi.fn().mockResolvedValue(undefined);
  return { AnalyticsHelper: { recordRefund: h.recordRefund, emit: vi.fn() } };
});
vi.mock("@/lib/structured-logger", () => {
  const noop = () => {};
  const logger = { debug: noop, info: noop, warn: noop, error: noop };
  return { createLogger: () => logger, logger };
});
vi.spyOn(console, "error").mockImplementation(() => {});
vi.spyOn(console, "warn").mockImplementation(() => {});

import { requestRefund } from "@/app/[locale]/(main)/dashboard/actions/requestRefund";
import { switchSubscriptionPlan } from "@/app/[locale]/(main)/dashboard/actions/switchSubscriptionPlan";

const mem = () => h.mem!;
const SUB = f.subscriptionRetrieved.id;
const PI = f.invoicePaymentsList.data[0].payment.payment_intent;

beforeEach(() => {
  mem().reset();
  vi.clearAllMocks();
  h.session = { user: { id: "user_1" } };
  process.env.STRIPE_MONTHLY_PRICE_ID = "price_monthly";
  process.env.STRIPE_YEARLY_PRICE_ID = "price_yearly";
  mem().db.subscription.rows.push({
    id: "dbsub",
    userId: "user_1",
    status: SubscriptionStatus.ACTIVE,
    stripeSubscriptionId: SUB,
    currentPeriodStart: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    priceId: "price_monthly",
  });
  h.stripe.subscriptions.retrieve.mockResolvedValue(clone(f.subscriptionRetrieved));
  h.stripe.subscriptions.update.mockResolvedValue({});
  h.stripe.subscriptions.cancel.mockResolvedValue(clone(f.subscriptionRetrieved));
  h.stripe.invoices.list.mockResolvedValue({ data: [clone(f.invoiceRetrieved)] });
  h.stripe.invoices.createPreview.mockResolvedValue(clone(f.invoicePreview));
  h.stripe.invoicePayments.list.mockResolvedValue(clone(f.invoicePaymentsList));
  h.stripe.refunds.create.mockResolvedValue(clone(f.refundCreated));
});

describe("requestRefund (recorded Stripe answers)", () => {
  it("looks the payment up through the latest paid invoice, refunds its PaymentIntent, cancels", async () => {
    const result = await requestRefund({ subscriptionId: SUB, reason: "changed my mind" });

    expect(h.stripe.invoices.list).toHaveBeenCalledWith({
      subscription: SUB,
      status: "paid",
      limit: 1,
    });
    expect(h.stripe.invoicePayments.list).toHaveBeenCalledWith({
      invoice: f.invoiceRetrieved.id,
      status: "paid",
      limit: 1,
    });
    expect(h.stripe.refunds.create).toHaveBeenCalledWith(
      { payment_intent: PI, amount: f.invoiceRetrieved.amount_paid },
      { idempotencyKey: `refund:dbsub:${PI}` },
    );
    expect(h.stripe.subscriptions.cancel).toHaveBeenCalledWith(SUB, undefined, {
      idempotencyKey: `cancel:${SUB}:immediate`,
    });
    expect(result).toEqual({
      success: true,
      message: expect.stringContaining("Remboursement effectué"),
      refund: {
        amount: f.invoiceRetrieved.amount_paid / 100,
        currency: f.invoiceRetrieved.currency,
        refundId: f.refundCreated.id,
      },
    });
    expect(mem().db.subscription.rows[0].status).toBe(SubscriptionStatus.CANCELED);
    expect(mem().db.invoiceAudit.rows[0]).toMatchObject({
      type: "REFUND_PROCESSED",
      metadata: expect.objectContaining({
        stripeRefundId: f.refundCreated.id,
        stripePaymentIntentId: PI,
        stripeSubscriptionId: SUB,
      }),
    });
  });

  it("the recorded payment is a PaymentIntent payment and the refund is accepted", () => {
    expect(f.invoicePaymentsList.data[0].payment.type).toBe("payment_intent");
    expect(PI).toMatch(/^pi_/);
    expect(f.refundCreated.object).toBe("refund");
    expect(f.refundCreated.payment_intent).toBe(PI);
  });

  it("does not refund twice when Stripe has no paid invoice payment", async () => {
    h.stripe.invoicePayments.list.mockResolvedValue({ data: [] });
    expect(await requestRefund({ subscriptionId: SUB })).toMatchObject({
      success: false,
      error: "NO_PAYMENT_FOUND",
    });
    expect(h.stripe.refunds.create).not.toHaveBeenCalled();
    expect(h.stripe.subscriptions.cancel).not.toHaveBeenCalled();
  });

  it("a Stripe refund failure leaves the subscription active", async () => {
    h.stripe.refunds.create.mockRejectedValue(new Error("charge_already_refunded"));
    expect(await requestRefund({ subscriptionId: SUB })).toMatchObject({
      success: false,
      error: "STRIPE_REFUND_FAILED",
    });
    expect(mem().db.subscription.rows[0].status).toBe(SubscriptionStatus.ACTIVE);
    expect(h.stripe.subscriptions.cancel).not.toHaveBeenCalled();
  });
});

describe("switchSubscriptionPlan (recorded Stripe answers)", () => {
  const item = () => f.subscriptionRetrieved.items.data[0];

  it("swaps the item price, audits the proration with createPreview, stores the item period", async () => {
    const result = await switchSubscriptionPlan({ newPriceId: "price_yearly" });

    expect(h.stripe.subscriptions.update).toHaveBeenCalledWith(SUB, {
      cancel_at_period_end: false,
      proration_behavior: "create_prorations",
      items: [{ id: item().id, price: "price_yearly" }],
    });
    expect(h.stripe.invoices.createPreview).toHaveBeenCalledWith({ subscription: SUB });
    expect(result).toMatchObject({ success: true });
    expect(mem().db.subscription.rows[0]).toMatchObject({
      priceId: "price_yearly",
      currentPeriodStart: new Date(item().current_period_start * 1000),
      currentPeriodEnd: new Date(item().current_period_end * 1000),
      cancelAtPeriodEnd: false,
    });
    const audits = mem().db.invoiceAudit.rows.map((a) => a.type).sort();
    expect(audits).toEqual(["PLAN_CHANGE", "PRORATION"]);
    const proration = mem().db.invoiceAudit.rows.find((a) => a.type === "PRORATION")!;
    expect(proration.userId).toBe("user_1");
    expect(proration.stripeInvoiceId).toBeUndefined();
    expect(proration.metadata).toMatchObject({ previewInvoiceId: f.invoicePreview.id });
  });

  it("two switches leave two proration audits (a preview id is not an invoice id)", async () => {
    await switchSubscriptionPlan({ newPriceId: "price_yearly" });
    await switchSubscriptionPlan({ newPriceId: "price_monthly" });
    expect(mem().db.invoiceAudit.rows.filter((a) => a.type === "PRORATION")).toHaveLength(2);
  });

  it("a subscription in the pre-basil shape (period on the root) gives the same dates", async () => {
    h.stripe.subscriptions.retrieve.mockResolvedValue(toLegacySubscription(f.subscriptionRetrieved));
    const result = await switchSubscriptionPlan({ newPriceId: "price_yearly" });
    expect(result.success).toBe(true);
    expect(mem().db.subscription.rows[0].currentPeriodEnd).toEqual(
      new Date(item().current_period_end * 1000),
    );
  });

  it("the preview failing never fails the switch", async () => {
    h.stripe.invoices.createPreview.mockRejectedValue(new Error("preview"));
    expect((await switchSubscriptionPlan({ newPriceId: "price_yearly" })).success).toBe(true);
    expect(mem().db.invoiceAudit.rows.map((a) => a.type)).toEqual(["PLAN_CHANGE"]);
  });
});
