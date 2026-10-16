import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const h = vi.hoisted(() => ({
  claimed: new Set<string>(),
  released: [] as string[],
  handled: [] as string[],
  failHandler: false,
  event: { id: "evt_dup", type: "customer.subscription.deleted", data: { object: {} } } as unknown,
}));

vi.mock("@/lib/rate-limit", () => ({
  ensureIdempotent: async (id: string) => {
    if (h.claimed.has(id)) return false;
    h.claimed.add(id);
    return true;
  },
  releaseIdempotent: async (id: string) => {
    h.released.push(id);
    h.claimed.delete(id);
  },
}));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "stripe-signature": "sig" }) }));
vi.mock("@/lib/payment-service", () => ({
  WebhookSignatureError: class extends Error {},
  paymentService: { verifyWebhookSignature: () => h.event },
}));
vi.mock("@/lib/structured-logger", () => {
  const noop = () => {};
  const logger = { debug: noop, info: noop, warn: noop, error: noop };
  return { createLogger: () => logger, logger };
});
vi.mock("@/app/api/stripe/webhook/_handlers/subscription-deleted", () => ({
  handleSubscriptionDeleted: async (event: { id: string }) => {
    if (h.failHandler) throw new Error("db down");
    h.handled.push(event.id);
  },
}));
// the other handlers are not reached by these tests
vi.mock("@/app/api/stripe/webhook/_handlers/checkout-session-completed", () => ({ handleCheckoutSessionCompleted: vi.fn() }));
vi.mock("@/app/api/stripe/webhook/_handlers/subscription-upserted", () => ({ handleSubscriptionUpserted: vi.fn() }));
vi.mock("@/app/api/stripe/webhook/_handlers/invoice-payment-succeeded", () => ({ handleInvoicePaymentSucceeded: vi.fn() }));
vi.mock("@/app/api/stripe/webhook/_handlers/invoice-payment-failed", () => ({ handleInvoicePaymentFailed: vi.fn() }));

import { POST } from "@/app/api/stripe/webhook/route";

const post = () =>
  POST(new NextRequest("http://localhost/api/stripe/webhook", { method: "POST", body: "{}" }));

describe("Stripe webhook: duplicate deliveries", () => {
  beforeEach(() => {
    h.claimed.clear();
    h.released.length = 0;
    h.handled.length = 0;
    h.failHandler = false;
  });

  it("processes an event id once and acknowledges the redelivery without reprocessing", async () => {
    const first = await post();
    expect(first.status).toBe(200);
    expect(await first.json()).toEqual({ received: true });

    const second = await post();
    expect(second.status).toBe(200);
    expect(await second.json()).toEqual({ received: true, duplicate: true });

    expect(h.handled).toEqual(["evt_dup"]);
  });

  it("releases the claim when the handler fails, so Stripe's retry is processed", async () => {
    h.failHandler = true;
    const failed = await post();
    expect(failed.status).toBe(500);
    expect(h.released).toEqual(["stripe-event:evt_dup"]);

    h.failHandler = false;
    const retry = await post();
    expect(retry.status).toBe(200);
    expect(await retry.json()).toEqual({ received: true });
    expect(h.handled).toEqual(["evt_dup"]);
  });
});
