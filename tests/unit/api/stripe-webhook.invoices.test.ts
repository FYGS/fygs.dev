import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const h = vi.hoisted(() => ({
  payments: [] as Record<string, unknown>[],
  subUpdates: [] as unknown[],
  event: null as unknown,
}));

vi.mock("@/lib/rate-limit", () => ({
  ensureIdempotent: async () => true,
  releaseIdempotent: async () => {},
}));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "stripe-signature": "sig" }) }));
vi.mock("@/lib/payment-service", () => ({
  WebhookSignatureError: class extends Error {},
  paymentService: {
    verifyWebhookSignature: () => h.event,
    getSubscription: async (id: string) => ({ id, metadata: { userId: "user_1" } }),
  },
}));
vi.mock("@/lib/db", () => ({
  db: {
    subscription: {
      updateMany: async (arg: unknown) => void h.subUpdates.push(arg),
    },
    payment: {
      findFirst: async ({ where }: { where: { stripePaymentIntentId: string } }) =>
        h.payments.find((p) => p.stripePaymentIntentId === where.stripePaymentIntentId) ?? null,
      create: async ({ data }: { data: Record<string, unknown> }) => void h.payments.push({ id: `p${h.payments.length}`, ...data }),
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const row = h.payments.find((p) => p.id === where.id)!;
        Object.assign(row, data);
      },
    },
    user: { findUnique: async () => ({ email: "a@x.test", name: "Ada" }) },
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
import { getInvoiceSubscriptionId } from "@/app/api/stripe/webhook/_lib/invoice";

const send = (event: unknown) => {
  h.event = event;
  return POST(new NextRequest("http://localhost/api/stripe/webhook", { method: "POST", body: "{}" }));
};

// Shape sent under API version 2025-08-27.basil: no invoice.subscription
const basilInvoice = (id: string, amount: number) => ({
  id,
  amount_paid: amount,
  currency: "eur",
  parent: { subscription_details: { subscription: "sub_1" } },
});

describe("getInvoiceSubscriptionId", () => {
  it("reads the basil location, the legacy field and expanded objects", () => {
    expect(getInvoiceSubscriptionId(basilInvoice("in_1", 1))).toBe("sub_1");
    expect(getInvoiceSubscriptionId({ subscription: "sub_old" })).toBe("sub_old");
    expect(getInvoiceSubscriptionId({ subscription: { id: "sub_obj" } })).toBe("sub_obj");
    expect(getInvoiceSubscriptionId({ parent: { subscription_details: { subscription: { id: "sub_x" } } } })).toBe("sub_x");
    expect(getInvoiceSubscriptionId({})).toBeNull();
    expect(getInvoiceSubscriptionId({ parent: null, subscription: null })).toBeNull();
  });
});

describe("invoice webhooks", () => {
  beforeEach(() => {
    h.payments.length = 0;
    h.subUpdates.length = 0;
  });

  it("records one payment per renewal invoice instead of overwriting a single row", async () => {
    await send({ id: "evt_1", type: "invoice.payment_succeeded", data: { object: basilInvoice("in_1", 900) } });
    await send({ id: "evt_2", type: "invoice.payment_succeeded", data: { object: basilInvoice("in_2", 900) } });

    expect(h.payments.map((p) => p.stripePaymentIntentId)).toEqual(["in_1", "in_2"]);
    expect(h.payments.every((p) => p.status === "COMPLETED" && p.kind === "SUBSCRIPTION")).toBe(true);
    expect(h.subUpdates).toHaveLength(2);
  });

  it("is idempotent for the same invoice (a replayed event updates its own row)", async () => {
    await send({ id: "evt_1", type: "invoice.payment_succeeded", data: { object: basilInvoice("in_1", 900) } });
    await send({ id: "evt_3", type: "invoice.payment_succeeded", data: { object: basilInvoice("in_1", 1000) } });

    expect(h.payments).toHaveLength(1);
    expect(String(h.payments[0].amount)).toBe("10");
  });

  it("marks the subscription PAST_DUE on a failed payment with the basil shape", async () => {
    await send({ id: "evt_4", type: "invoice.payment_failed", data: { object: basilInvoice("in_9", 900) } });
    expect(h.subUpdates).toHaveLength(1);
    expect(h.subUpdates[0]).toMatchObject({
      where: { userId: "user_1", stripeSubscriptionId: "sub_1" },
      data: { status: "PAST_DUE" },
    });
  });
});
