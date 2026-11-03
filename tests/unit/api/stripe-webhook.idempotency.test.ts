import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

/** The route's handling of Stripe's at-least-once delivery, with the claim store simulated (the store itself: integration/payments/event-claims). */
const h = vi.hoisted(() => ({
  claims: new Map<string, "processing" | "done">(),
  released: [] as string[],
  completed: [] as string[],
  handled: [] as string[],
  failHandler: false,
  completeFails: false,
  signatureError: false,
  event: { id: "evt_dup", type: "customer.subscription.deleted", data: { object: {} } } as unknown,
}));

vi.mock("@/lib/payments/event-claims", () => ({
  claimEvent: async (id: string) => {
    const state = h.claims.get(id);
    if (state === "done") return { state: "duplicate" };
    if (state === "processing") return { state: "in_progress" };
    h.claims.set(id, "processing");
    return { state: "claimed" };
  },
  completeEvent: async (id: string) => {
    if (h.completeFails) throw new Error("db down");
    h.claims.set(id, "done");
    h.completed.push(id);
  },
  releaseEvent: async (id: string) => {
    h.released.push(id);
    h.claims.delete(id);
  },
}));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "stripe-signature": "sig" }) }));
vi.mock("@/lib/payment-service", () => {
  class WebhookSignatureError extends Error {}
  return {
    WebhookSignatureError,
    paymentService: {
      verifyWebhookSignature: () => {
        if (h.signatureError) throw new WebhookSignatureError("bad");
        return h.event;
      },
    },
  };
});
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
vi.mock("@/app/api/stripe/webhook/_handlers/charge-dispute", () => ({
  handleChargeDisputeCreated: vi.fn(),
  handleChargeDisputeClosed: vi.fn(),
}));
vi.mock("@/app/api/stripe/webhook/_handlers/refund-updated", () => ({ handleRefundUpdated: vi.fn() }));

import { POST } from "@/app/api/stripe/webhook/route";

const post = (body = "{}", headers: Record<string, string> = {}) =>
  POST(new NextRequest("http://localhost/api/stripe/webhook", { method: "POST", body, headers }));

describe("Stripe webhook: at-least-once delivery", () => {
  beforeEach(() => {
    h.claims.clear();
    h.released.length = 0;
    h.completed.length = 0;
    h.handled.length = 0;
    h.failHandler = false;
    h.completeFails = false;
    h.signatureError = false;
  });

  it("processes an event id once and acknowledges the redelivery without reprocessing", async () => {
    const first = await post();
    expect(first.status).toBe(200);
    expect(await first.json()).toEqual({ received: true });
    expect(h.completed).toEqual(["evt_dup"]);

    const second = await post();
    expect(second.status).toBe(200);
    expect(await second.json()).toEqual({ received: true, duplicate: true });

    expect(h.handled).toEqual(["evt_dup"]);
  });

  it("releases the claim when the handler fails, so Stripe's retry is processed", async () => {
    h.failHandler = true;
    const failed = await post();
    expect(failed.status).toBe(500);
    expect(h.released).toEqual(["evt_dup"]);
    expect(h.completed).toEqual([]);

    h.failHandler = false;
    const retry = await post();
    expect(retry.status).toBe(200);
    expect(await retry.json()).toEqual({ received: true });
    expect(h.handled).toEqual(["evt_dup"]);
  });

  it("refuses (409) a delivery that arrives while the first one is still running: Stripe retries, nothing is lost", async () => {
    h.claims.set("evt_dup", "processing");
    const res = await post();
    expect(res.status).toBe(409);
    expect(h.handled).toEqual([]);
  });

  it("does not fail an event that was processed when only the 'done' mark could not be written", async () => {
    h.completeFails = true;
    const res = await post();
    expect(res.status).toBe(200);
    expect(h.handled).toEqual(["evt_dup"]);
  });

  it("refuses an invalid signature without claiming anything", async () => {
    h.signatureError = true;
    const res = await post();
    expect(res.status).toBe(400);
    expect(h.claims.size).toBe(0);
  });

  it("refuses a body larger than the limit without reading it all (declared or streamed)", async () => {
    const declared = await post("{}", { "content-length": "5000000" });
    expect(declared.status).toBe(413);

    const streamed = await post("x".repeat(1_100_000));
    expect(streamed.status).toBe(413);
    expect(h.claims.size).toBe(0);
  });
});
