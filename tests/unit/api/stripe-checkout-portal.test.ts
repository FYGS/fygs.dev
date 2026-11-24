import { beforeEach, describe, expect, it, vi } from "vitest";
import { clone, fixtures as f } from "../../fixtures/stripe";

/**
 * /api/stripe/portal with Stripe mocked: the parameters sent to Stripe and what the route answers from the REAL
 * response shapes. The checkout route runs against a real database: tests/integration/payments/checkout.test.ts.
 */
const h = vi.hoisted(() => ({
  session: null as null | { user: { id: string; email: string } },
  create: null as unknown as import("vitest").Mock,
  priceRetrieve: null as unknown as import("vitest").Mock,
  portalCreate: null as unknown as import("vitest").Mock,
  mem: null as null | ReturnType<typeof import("../../fixtures/stripe/memory-db").createMemoryDb>,
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: async () => h.session } },
}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit: async () => null }));
vi.mock("@/lib/db", async () => {
  const { createMemoryDb } = await import("../../fixtures/stripe/memory-db");
  h.mem = createMemoryDb();
  return { db: h.mem.db };
});
vi.mock("@/lib/stripe", async () => {
  const { vi } = await import("vitest");
  h.create = vi.fn();
  h.priceRetrieve = vi.fn();
  h.portalCreate = vi.fn();
  return {
    stripe: {
      checkout: { sessions: { create: h.create } },
      prices: { retrieve: h.priceRetrieve },
      billingPortal: { sessions: { create: h.portalCreate } },
    },
  };
});
vi.mock("@/lib/structured-logger", () => {
  const noop = () => {};
  const logger = { debug: noop, info: noop, warn: noop, error: noop };
  return { createLogger: () => logger, logger };
});
vi.spyOn(console, "error").mockImplementation(() => {});

import { POST as portalPost, GET as portalGet } from "@/app/api/stripe/portal/route";

const mem = () => h.mem!;
beforeEach(() => {
  mem().reset();
  h.create.mockReset();
  h.priceRetrieve.mockReset();
  h.portalCreate.mockReset();
  h.session = { user: { id: "user_1", email: "buyer@example.test" } };
});

describe("/api/stripe/portal", () => {
  const withCustomer = (customerId: string | null) =>
    mem().db.user.rows.push({
      id: "user_1",
      subscriptions: customerId ? { stripeCustomerId: customerId } : null,
    });

  it("POST: creates a portal session for the stored customer and returns its url", async () => {
    withCustomer("cus_fixture1");
    h.portalCreate.mockResolvedValue(clone(f.portalSessionCreated));
    const res = await portalPost();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ url: f.portalSessionCreated.url });
    expect(h.portalCreate).toHaveBeenCalledWith({
      customer: "cus_fixture1",
      return_url: "http://localhost:3000/dashboard/billing",
    });
  });

  it("POST: anonymous 401, unknown user 404, no Stripe customer 400, Stripe failure 500", async () => {
    h.session = null;
    expect((await portalPost()).status).toBe(401);
    h.session = { user: { id: "user_1", email: "buyer@example.test" } };
    expect((await portalPost()).status).toBe(404);
    withCustomer(null);
    expect((await portalPost()).status).toBe(400);
    mem().db.user.rows.length = 0;
    withCustomer("cus_fixture1");
    h.portalCreate.mockRejectedValue(new Error("stripe"));
    expect((await portalPost()).status).toBe(500);
  });

  it("GET: redirects to the portal url, or back to billing with an error", async () => {
    withCustomer("cus_fixture1");
    h.portalCreate.mockResolvedValue(clone(f.portalSessionCreated));
    const ok = await portalGet();
    expect(ok.status).toBe(307);
    expect(ok.headers.get("location")).toBe(f.portalSessionCreated.url);

    mem().db.user.rows.length = 0;
    withCustomer(null);
    const none = await portalGet();
    expect(none.headers.get("location")).toBe(
      "http://localhost:3000/dashboard/billing?error=no-subscription",
    );

    h.session = null;
    expect((await portalGet()).headers.get("location")).toBe("http://localhost:3000/auth/login");
  });
});
