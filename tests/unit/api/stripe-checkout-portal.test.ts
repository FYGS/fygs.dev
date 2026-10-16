import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { PaymentKind, PaymentStatus, Prisma, SubscriptionStatus } from "@prisma/client";
import { clone, fixtures as f } from "../../fixtures/stripe";

/**
 * POST /api/stripe/checkout and /api/stripe/portal with Stripe mocked: the exact
 * parameters sent to Stripe (they must be valid on the SDK's API version), what the
 * routes answer from the REAL response shapes, and the rows they write.
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

import { POST as checkout } from "@/app/api/stripe/checkout/route";
import { POST as portalPost, GET as portalGet } from "@/app/api/stripe/portal/route";

const mem = () => h.mem!;
const post = (body: unknown) =>
  checkout(
    new NextRequest("http://localhost/api/stripe/checkout", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );

beforeEach(() => {
  mem().reset();
  h.create.mockReset();
  h.priceRetrieve.mockReset();
  h.portalCreate.mockReset();
  h.session = { user: { id: "user_1", email: "buyer@example.test" } };
  process.env.STRIPE_MONTHLY_PRICE_ID = "price_monthly";
  process.env.STRIPE_YEARLY_PRICE_ID = "price_yearly";
  mem().db.course.rows.push({
    id: "course_1",
    title: "TypeScript",
    slug: "ts",
    published: true,
    price: new Prisma.Decimal("49.90"),
  });
});

describe("POST /api/stripe/checkout", () => {
  it("rejects anonymous callers before touching Stripe", async () => {
    h.session = null;
    expect((await post({ type: "course", courseId: "course_1", slug: "ts" })).status).toBe(401);
    expect(h.create).not.toHaveBeenCalled();
  });

  it("one-time course purchase: exact Checkout Session parameters, placeholder row", async () => {
    h.create.mockResolvedValue(f.checkoutPaymentCreated);
    const res = await post({ type: "course", courseId: "course_1", slug: "ts" });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ url: f.checkoutPaymentCreated.url });
    expect(h.create).toHaveBeenCalledTimes(1);
    // no ui_mode (hosted is the default on every version), no subscription fields
    expect(h.create.mock.calls[0]).toEqual([
      {
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "Formation - TypeScript",
                description: "Accès à vie à la formation",
              },
              unit_amount: 4990,
            },
            quantity: 1,
          },
        ],
        customer_email: "buyer@example.test",
        // origin without the trailing slash `String(new URL(...))` would add
        success_url: "http://localhost:3000/formations/ts?success=true",
        cancel_url: "http://localhost:3000/formations/ts?canceled=true",
        metadata: {
          userId: "user_1",
          productId: "course_1",
          type: "course_purchase",
          courseSlug: "ts",
        },
        allow_promotion_codes: true,
      },
    ]);

    // the webhook finds this row by the session id and replaces it with the PaymentIntent
    expect(mem().db.payment.rows).toEqual([
      expect.objectContaining({
        userId: "user_1",
        courseId: "course_1",
        kind: PaymentKind.COURSE,
        status: PaymentStatus.PENDING,
        stripePaymentIntentId: f.checkoutPaymentCreated.id,
      }),
    ]);
  });

  it("the metadata Stripe stores on the created session is what the webhook receives back", () => {
    expect(f.checkoutPaymentCreated.metadata).toEqual(f.checkoutPaymentEvent.data.object.metadata);
    expect(f.checkoutSubscriptionCreated.metadata).toEqual(
      f.checkoutSubscriptionEvent.data.object.metadata,
    );
  });

  it("course: validates input and the course", async () => {
    expect((await post({ type: "course", slug: "ts" })).status).toBe(400);
    expect((await post({ type: "course", courseId: "nope", slug: "ts" })).status).toBe(404);
    expect((await post({ type: "other" })).status).toBe(400);
    expect(h.create).not.toHaveBeenCalled();
  });

  it("subscription: exact parameters, response and placeholder rows", async () => {
    h.create.mockResolvedValue(f.checkoutSubscriptionCreated);
    h.priceRetrieve.mockResolvedValue({ unit_amount: 1200, currency: "eur" });
    const res = await post({ type: "subscription", priceId: "yearly" });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      url: f.checkoutSubscriptionCreated.url,
      priceId: "price_yearly",
      cycle: "yearly",
    });
    expect(h.create.mock.calls[0]).toEqual([
      {
        mode: "subscription",
        line_items: [{ price: "price_yearly", quantity: 1 }],
        customer_email: "buyer@example.test",
        success_url: "http://localhost:3000/dashboard?subscription=success&cycle=yearly",
        cancel_url: "http://localhost:3000/dashboard?subscription=canceled",
        // the webhooks read userId on both the session and the subscription
        metadata: {
          userId: "user_1",
          type: "subscription",
          priceId: "price_yearly",
          billingCycle: "yearly",
        },
        subscription_data: {
          metadata: { userId: "user_1", priceId: "price_yearly", billingCycle: "yearly" },
        },
        allow_promotion_codes: true,
      },
    ]);
    expect(h.priceRetrieve).toHaveBeenCalledWith("price_yearly");

    expect(mem().db.payment.rows).toEqual([
      expect.objectContaining({
        kind: PaymentKind.SUBSCRIPTION,
        status: PaymentStatus.PENDING,
        stripePaymentIntentId: f.checkoutSubscriptionCreated.id,
        currency: "eur",
      }),
    ]);
    expect(mem().db.subscription.rows).toEqual([
      expect.objectContaining({
        userId: "user_1",
        status: SubscriptionStatus.INCOMPLETE,
        priceId: "price_yearly",
      }),
    ]);
  });

  it("subscription: a member who already has access keeps it while a new checkout is open", async () => {
    h.create.mockResolvedValue(f.checkoutSubscriptionCreated);
    h.priceRetrieve.mockResolvedValue({ unit_amount: 1200, currency: "eur" });
    mem().db.subscription.rows.push({
      id: "dbsub",
      userId: "user_1",
      status: SubscriptionStatus.ACTIVE,
      priceId: "price_monthly",
    });
    expect((await post({ type: "subscription", priceId: "yearly" })).status).toBe(200);
    expect(mem().db.subscription.rows[0]).toMatchObject({
      status: SubscriptionStatus.ACTIVE,
      priceId: "price_monthly",
    });
  });

  it("subscription: an unknown price falls back to monthly; no configured price is a 400", async () => {
    h.create.mockResolvedValue(f.checkoutSubscriptionCreated);
    h.priceRetrieve.mockResolvedValue({ unit_amount: 900, currency: "eur" });
    const ok = await post({ type: "subscription", priceId: "price_unknown" });
    expect((await ok.json()).cycle).toBe("monthly");

    delete process.env.STRIPE_MONTHLY_PRICE_ID;
    delete process.env.STRIPE_YEARLY_PRICE_ID;
    expect((await post({ type: "subscription" })).status).toBe(400);
  });

  it("a Stripe failure is a 500, no placeholder row", async () => {
    h.create.mockRejectedValue(new Error("stripe down"));
    const res = await post({ type: "course", courseId: "course_1", slug: "ts" });
    expect(res.status).toBe(500);
    expect(mem().db.payment.rows).toHaveLength(0);
  });
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
