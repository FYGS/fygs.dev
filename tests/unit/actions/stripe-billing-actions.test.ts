import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
    subscriptionSchedules: { create: vi.fn(), retrieve: vi.fn(), update: vi.fn(), release: vi.fn() },
  };
  return { stripe: h.stripe, stripeKeyMode: () => "unknown" };
});
vi.mock("@/lib/analytics-helper", async () => {
  const { vi } = await import("vitest");
  h.recordRefund = vi.fn().mockResolvedValue(undefined);
  return { AnalyticsHelper: { recordRefund: h.recordRefund, emit: vi.fn() } };
});
// The purchase lock is a database lock: the in-memory database used here has none, the transaction is the database itself
vi.mock("@/lib/payments/locks", () => ({
  withPurchaseLock: async (_userId: string, _courseId: string | null, fn: (tx: unknown) => unknown) => fn(h.mem!.db),
}));
vi.mock("@/lib/structured-logger", () => {
  const noop = () => {};
  const logger = { debug: noop, info: noop, warn: noop, error: noop };
  return { createLogger: () => logger, logger };
});
vi.spyOn(console, "error").mockImplementation(() => {});
vi.spyOn(console, "warn").mockImplementation(() => {});

import { switchSubscriptionPlan } from "@/app/[locale]/(main)/dashboard/actions/switchSubscriptionPlan";

const mem = () => h.mem!;
const SUB = f.subscriptionRetrieved.id;
const PI = f.invoicePaymentsList.data[0].payment.payment_intent;

beforeEach(() => {
  // The recorded subscription has a fixed billing period (the entitlement rule looks at the clock): stay inside it, or this
  // test would start failing the day the recording is older than the period plus the grace days.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date((f.subscriptionRetrieved.items.data[0].current_period_start + 2 * 24 * 3600) * 1000));
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
  h.stripe.subscriptions.update.mockResolvedValue({ latest_invoice: clone(f.invoiceRetrieved) });
  h.stripe.subscriptions.cancel.mockResolvedValue(clone(f.subscriptionRetrieved));
  h.stripe.invoices.list.mockResolvedValue({ data: [clone(f.invoiceRetrieved)] });
  h.stripe.invoices.createPreview.mockResolvedValue(clone(f.invoicePreview));
  h.stripe.invoicePayments.list.mockResolvedValue(clone(f.invoicePaymentsList));
  h.stripe.refunds.create.mockResolvedValue(clone(f.refundCreated));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("recorded Stripe answers used by the refund", () => {
  // requestRefund itself runs against a real database in tests/integration/db/refund.test.ts and
  // tests/integration/payments/refund-actions.test.ts
  it("the recorded payment is a PaymentIntent payment and the refund is accepted", () => {
    expect(f.invoicePaymentsList.data[0].payment.type).toBe("payment_intent");
    expect(PI).toMatch(/^pi_/);
    expect(f.refundCreated.object).toBe("refund");
    expect(f.refundCreated.payment_intent).toBe(PI);
  });
});

describe("switchSubscriptionPlan (recorded Stripe answers)", () => {
  const item = () => f.subscriptionRetrieved.items.data[0];

  it("swaps the item price, invoices the switch now, audits what was charged, stores the item period", async () => {
    const result = await switchSubscriptionPlan({ newPriceId: "price_yearly" });

    expect(h.stripe.subscriptions.update).toHaveBeenCalledWith(SUB, {
      cancel_at_period_end: false,
      proration_behavior: "always_invoice",
      payment_behavior: "error_if_incomplete",
      items: [{ id: item().id, price: "price_yearly" }],
      expand: ["latest_invoice"],
    });
    expect(h.stripe.invoices.createPreview).not.toHaveBeenCalled();
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
    expect(proration.stripeInvoiceId).toBe(f.invoiceRetrieved.id);
    expect(proration.metadata).toMatchObject({ chargedCents: f.invoiceRetrieved.amount_paid });
    expect(Number(proration.amount)).toBe(f.invoiceRetrieved.amount_paid / 100);
  });

  it("going back to monthly after a switch is scheduled: two plan changes, one invoice audit", async () => {
    h.stripe.subscriptionSchedules.create.mockResolvedValue({
      id: "sub_sched_1",
      phases: [{ start_date: 1, end_date: 2_000_000_000, items: [{ price: "price_yearly", quantity: 1 }] }],
    });
    h.stripe.subscriptionSchedules.update.mockResolvedValue({});
    const first = await switchSubscriptionPlan({ newPriceId: "price_yearly" });
    const second = await switchSubscriptionPlan({ newPriceId: "price_monthly" });
    expect(first.success).toBe(true);
    expect(second).toMatchObject({ success: true, scheduledFor: new Date(2_000_000_000 * 1000) });
    expect(mem().db.invoiceAudit.rows.filter((a) => a.type === "PRORATION")).toHaveLength(1);
    expect(mem().db.invoiceAudit.rows.filter((a) => a.type === "PLAN_CHANGE")).toHaveLength(2);
  });

  it("a subscription in the pre-basil shape (period on the root) gives the same dates", async () => {
    h.stripe.subscriptions.retrieve.mockResolvedValue(toLegacySubscription(f.subscriptionRetrieved));
    const result = await switchSubscriptionPlan({ newPriceId: "price_yearly" });
    expect(result.success).toBe(true);
    expect(mem().db.subscription.rows[0].currentPeriodEnd).toEqual(
      new Date(item().current_period_end * 1000),
    );
  });

  describe("yearly -> monthly waits for the end of the paid year", () => {
    const PERIOD_START = 1_800_000_000;
    const PERIOD_END = 1_831_536_000;
    const yearlySchedule = { id: "sub_sched_1", phases: [{ start_date: PERIOD_START, end_date: PERIOD_END, items: [{ price: "price_yearly", quantity: 1 }] }] };

    beforeEach(() => {
      mem().db.subscription.rows[0].priceId = "price_yearly";
      h.stripe.subscriptionSchedules.create.mockResolvedValue(clone(yearlySchedule));
      h.stripe.subscriptionSchedules.update.mockResolvedValue({});
    });

    it("schedules the monthly price after the current phase: nothing is charged, credited or changed now", async () => {
      const result = await switchSubscriptionPlan({ newPriceId: "price_monthly" });

      expect(result).toMatchObject({ success: true, scheduledFor: new Date(PERIOD_END * 1000) });
      expect(h.stripe.subscriptionSchedules.create).toHaveBeenCalledWith({ from_subscription: SUB });
      expect(h.stripe.subscriptionSchedules.update).toHaveBeenCalledWith("sub_sched_1", {
        end_behavior: "release",
        phases: [
          { items: [{ price: "price_yearly", quantity: 1 }], start_date: PERIOD_START, end_date: PERIOD_END },
          { items: [{ price: "price_monthly", quantity: 1 }], proration_behavior: "none" },
        ],
      });
      expect(h.stripe.subscriptions.update).not.toHaveBeenCalled();
      expect(h.stripe.invoices.createPreview).not.toHaveBeenCalled();
      expect(mem().db.subscription.rows[0]).toMatchObject({ priceId: "price_yearly" });
      const audits = mem().db.invoiceAudit.rows;
      expect(audits.map((a) => a.type)).toEqual(["PLAN_CHANGE"]);
      expect(audits[0].metadata).toMatchObject({ scheduled: true, newCycle: "monthly", effectiveDate: new Date(PERIOD_END * 1000).toISOString() });
    });

    it("reuses the schedule the subscription already has", async () => {
      h.stripe.subscriptions.retrieve.mockResolvedValue({ ...clone(f.subscriptionRetrieved), schedule: "sub_sched_1" });
      h.stripe.subscriptionSchedules.retrieve.mockResolvedValue(clone(yearlySchedule));
      await switchSubscriptionPlan({ newPriceId: "price_monthly" });
      expect(h.stripe.subscriptionSchedules.create).not.toHaveBeenCalled();
      expect(h.stripe.subscriptionSchedules.update).toHaveBeenCalledTimes(1);
    });

    it("choosing the current plan again drops the scheduled change", async () => {
      h.stripe.subscriptions.retrieve.mockResolvedValue({ ...clone(f.subscriptionRetrieved), schedule: "sub_sched_1" });
      h.stripe.subscriptionSchedules.retrieve.mockResolvedValue({
        ...clone(yearlySchedule),
        phases: [...clone(yearlySchedule).phases, { start_date: PERIOD_END, items: [{ price: "price_monthly", quantity: 1 }] }],
      });
      h.stripe.subscriptionSchedules.release.mockResolvedValue({});
      const result = await switchSubscriptionPlan({ newPriceId: "price_yearly" });
      expect(result.success).toBe(true);
      expect(h.stripe.subscriptionSchedules.release).toHaveBeenCalledWith("sub_sched_1");
    });

    it("choosing the current plan with nothing scheduled is still refused", async () => {
      const result = await switchSubscriptionPlan({ newPriceId: "price_yearly" });
      expect(result).toMatchObject({ success: false, error: "SAME_PLAN" });
      expect(h.stripe.subscriptionSchedules.release).not.toHaveBeenCalled();
    });
  });

  it("a refused card fails the switch and changes nothing stored", async () => {
    h.stripe.subscriptions.update.mockRejectedValue(new Error("card_declined"));
    const result = await switchSubscriptionPlan({ newPriceId: "price_yearly" });
    expect(result.success).toBe(false);
    expect(mem().db.subscription.rows[0]).toMatchObject({ priceId: "price_monthly" });
    expect(mem().db.invoiceAudit.rows).toHaveLength(0);
  });

  it("an answer without the invoice never fails the switch (the audit is only a record)", async () => {
    h.stripe.subscriptions.update.mockResolvedValue({});
    expect((await switchSubscriptionPlan({ newPriceId: "price_yearly" })).success).toBe(true);
    expect(mem().db.invoiceAudit.rows.map((a) => a.type)).toEqual(["PLAN_CHANGE"]);
  });
});
