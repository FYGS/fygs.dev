import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Characterisation tests for lib/payment-service.ts (Stripe billing).
 * Every collaborator (db, stripe, logger, analytics, console) is recorded into
 * one ordered log so call order, arguments and results are all pinned.
 */
const h = vi.hoisted(() => ({
  log: [] as unknown[],
  stripeOverrides: {} as Record<string, unknown>,
  dbRec: null as null | ReturnType<typeof import("./services/db-recorder").createDbRecorder>,
}));

vi.mock("@/lib/db", async () => {
  const { createDbRecorder } = await import("./services/db-recorder");
  h.dbRec = createDbRecorder(h.log);
  return { db: h.dbRec.db };
});

const subscriptionFixture = (over: Record<string, unknown> = {}) => ({
  id: "sub_1",
  status: "active",
  customer: "cus_1",
  cancel_at_period_end: false,
  metadata: { userId: "u1" },
  items: {
    data: [
      {
        id: "si_1",
        current_period_start: 1700000000,
        current_period_end: 1702600000,
        price: { id: "price_m", recurring: { interval: "month" } },
      },
    ],
  },
  ...over,
});

const stripeDefaults: Record<string, unknown> = {
  "checkout.sessions.create": { id: "cs_1", url: "https://stripe.test/pay" },
  "subscriptions.retrieve": subscriptionFixture(),
  // A plan switch is invoiced at once ("always_invoice"): the update answers with the invoice it created
  // (credit of the unused monthly time + the yearly price, as observed on Stripe in test mode)
  "subscriptions.update": {
    latest_invoice: {
      id: "in_switch",
      amount_paid: 26100,
      currency: "eur",
      lines: {
        data: [
          { amount: -2900, parent: { subscription_item_details: { proration: true } } },
          { amount: 29000, parent: { subscription_item_details: { proration: false } } },
        ],
      },
    },
  },
  "subscriptions.cancel": {},
  "invoices.list": {
    data: [
      // a plan-change adjustment is skipped: the payment that opened the period is the one to refund
      { id: "in_adjust", amount_paid: 50, currency: "eur", billing_reason: "subscription_update", created: 1700000500 },
      {
        id: "in_1",
        amount_paid: 999,
        currency: "eur",
        billing_reason: "subscription_create",
        created: 1700000000,
        status_transitions: { paid_at: 1700000100 },
      },
    ],
  },
  "invoicePayments.list": {
    data: [{ payment: { type: "payment_intent", payment_intent: "pi_1" } }],
  },
  "refunds.create": { id: "re_1" },
  "customers.create": { id: "cus_new" },
  "customers.list": { data: [{ id: "cus_1", email: "a@b.c" }] },
  "products.create": { id: "prod_1" },
  "prices.create": { id: "price_new" },
  "webhooks.constructEvent": { id: "evt_1", type: "checkout.session.completed" },
};

vi.mock("@/lib/stripe", () => {
  const make = (path: string[]): unknown =>
    new Proxy(function () {}, {
      get: (_t, prop: string) => make([...path, prop]),
      apply: (_t, _this, args: unknown[]) => {
        const key = path.join(".");
        h.log.push([`stripe.${key}`, args]);
        const o = key in h.stripeOverrides ? h.stripeOverrides[key] : stripeDefaults[key];
        // webhooks.constructEvent is synchronous in the real SDK; the rest is async
        const sync = key === "webhooks.constructEvent";
        const exec = () => {
          if (o instanceof Error) throw o;
          if (typeof o === "function") return (o as (...a: unknown[]) => unknown)(...args);
          return o;
        };
        return sync ? exec() : (async () => exec())();
      },
    });
  return { stripe: make([]), stripeKeyMode: () => "unknown" };
});

vi.mock("@/lib/structured-logger", () => ({
  createLogger: (ctx: unknown) => {
    h.log.push(["createLogger", ctx]);
    return Object.fromEntries(
      ["debug", "info", "warn", "error"].map((lvl) => [
        lvl,
        (...a: unknown[]) => h.log.push([`log.${lvl}`, a]),
      ]),
    );
  },
}));

const analyticsOverrides: Record<string, unknown> = {};
vi.mock("@/lib/analytics-helper", () => ({
  Analytics: new Proxy(
    {},
    {
      get: (_t, name: string) => (...args: unknown[]) => {
        h.log.push([`analytics.${name}`, args]);
        if (analyticsOverrides[name] instanceof Error) throw analyticsOverrides[name];
      },
    },
  ),
}));

import {
  paymentService as p,
  WebhookSignatureError,
} from "@/lib/payment-service";

const norm = (v: unknown) =>
  JSON.parse(
    JSON.stringify(v, (_k, x) =>
      x instanceof Error
        ? { __error: x.message, name: x.name }
        : typeof x === "string" && x.includes("\n    at ")
          ? `${x.split("\n")[0]} <stack>`
          : x,
    ) ?? "null",
  );

async function scenario(
  setup: {
    db?: Record<string, unknown>;
    stripe?: Record<string, unknown>;
    analytics?: Record<string, unknown>;
    env?: Record<string, string | undefined>;
  },
  run: () => unknown,
) {
  h.log.length = 0;
  h.dbRec!.state.overrides = setup.db ?? {};
  h.stripeOverrides = setup.stripe ?? {};
  for (const k of Object.keys(analyticsOverrides)) delete analyticsOverrides[k];
  Object.assign(analyticsOverrides, setup.analytics ?? {});
  const saved: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(setup.env ?? {})) {
    saved[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  let outcome: unknown;
  try {
    outcome = { value: await run() };
  } catch (e) {
    outcome = {
      thrown: (e as Error).message,
      name: (e as Error).name,
      instanceOfWebhook: e instanceof WebhookSignatureError,
    };
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
  return norm({ outcome, log: h.log });
}

const decimalLike = (n: number) => ({ toNumber: () => n });
describe("paymentService (pinned behaviour)", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2030-06-15T10:20:30Z"));
    vi.spyOn(console, "log").mockImplementation((...a) => void h.log.push(["console.log", a]));
    vi.spyOn(console, "warn").mockImplementation((...a) => void h.log.push(["console.warn", a]));
    vi.spyOn(console, "error").mockImplementation(
      (...a) => void h.log.push(["console.error", a.map((x) => (x instanceof Error ? x.message : x))]),
    );
  });

  it("is a singleton with the expected API", async () => {
    const mod = await import("@/lib/payment-service");
    expect(mod.paymentService).toBe(p);
    const proto = Object.getPrototypeOf(p);
    const names = new Set<string>();
    for (let o = proto; o && o !== Object.prototype; o = Object.getPrototypeOf(o)) {
      Object.getOwnPropertyNames(o).filter((n) => n !== "constructor").forEach((n) => names.add(n));
    }
    expect([...names].sort()).toMatchSnapshot();
    expect(new WebhookSignatureError().message).toBe("Invalid webhook signature");
    expect(new WebhookSignatureError("x").name).toBe("WebhookSignatureError");
    expect(new WebhookSignatureError()).toBeInstanceOf(Error);
  });

  const cases: Record<string, () => Promise<unknown>> = {
    checkoutOk: () =>
      scenario(
        { db: { "course.findUnique": { title: "React", price: decimalLike(49.9), slug: "react", published: true } } },
        () => p.createCheckoutSession({ productId: "c1", userId: "u1", successUrl: "s", cancelUrl: "c", customerEmail: "a@b.c" }),
      ),
    checkoutPlainNumberPrice: () =>
      scenario(
        { db: { "course.findUnique": { title: "React", price: 10, slug: "react", published: true } } },
        () => p.createCheckoutSession({ productId: "c1", userId: "u1", successUrl: "s", cancelUrl: "c" }),
      ),
    checkoutUnpublished: () =>
      scenario(
        { db: { "course.findUnique": { title: "React", price: 10, slug: "react", published: false } } },
        () => p.createCheckoutSession({ productId: "c1", userId: "u1", successUrl: "s", cancelUrl: "c" }),
      ),
    checkoutNoUrl: () =>
      scenario(
        {
          db: { "course.findUnique": { title: "React", price: null, slug: "react", published: true } },
          stripe: { "checkout.sessions.create": { id: "cs_x", url: null } },
        },
        () => p.createCheckoutSession({ productId: "c1", userId: "u1", successUrl: "s", cancelUrl: "c" }),
      ),
    subSessionMonthly: () =>
      scenario(
        { env: { STRIPE_MONTHLY_PRICE_ID: "price_m", STRIPE_YEARLY_PRICE_ID: "price_y" } },
        () => p.createSubscriptionSession({ userId: "u1", customerEmail: "a@b.c", priceId: "price_m", successUrl: "s", cancelUrl: "c" }),
      ),
    subSessionYearly: () =>
      scenario(
        { env: { STRIPE_MONTHLY_PRICE_ID: "price_m", STRIPE_YEARLY_PRICE_ID: "price_y" } },
        () => p.createSubscriptionSession({ userId: "u1", customerEmail: "a@b.c", priceId: "price_y", successUrl: "s", cancelUrl: "c" }),
      ),
    subSessionUnknown: () =>
      scenario(
        { env: { STRIPE_MONTHLY_PRICE_ID: undefined, STRIPE_YEARLY_PRICE_ID: undefined } },
        () => p.createSubscriptionSession({ userId: "u1", customerEmail: "a@b.c", priceId: "price_z", successUrl: "s", cancelUrl: "c" }),
      ),
    subSessionNoUrl: () =>
      scenario(
        { stripe: { "checkout.sessions.create": { id: "cs_x" } } },
        () => p.createSubscriptionSession({ userId: "u1", customerEmail: "a@b.c", priceId: "price_z", successUrl: "s", cancelUrl: "c" }),
      ),
    switchOkAuditsTheInvoice: () => scenario({}, () => p.switchSubscriptionPrice("sub_1", "price_y")),
    switchAnswerWithoutInvoice: () =>
      scenario({ stripe: { "subscriptions.update": {} } }, () => p.switchSubscriptionPrice("sub_1", "price_y")),
    switchAuditCreateFails: () =>
      scenario(
        { db: { "invoiceAudit.create": new Error("db") } },
        () => p.switchSubscriptionPrice("sub_1", "price_y"),
      ),
    switchUpdateFails: () =>
      scenario({ stripe: { "subscriptions.update": new Error("stripe") } }, () => p.switchSubscriptionPrice("sub_1", "price_y")),
    cancelImmediatelyOk: () => scenario({}, () => p.cancelImmediately("sub_1")),
    cancelImmediatelyFail: () => scenario({ stripe: { "subscriptions.cancel": new Error("x") } }, () => p.cancelImmediately("sub_1")),
    refundFull: () => scenario({}, () => p.refundPayment("pi_1")),
    refundPartialKey: () => scenario({}, () => p.refundPayment("pi_1", 500, { idempotencyKey: "k1" })),
    refundFail: () => scenario({ stripe: { "refunds.create": new Error("x") } }, () => p.refundPayment("pi_1", 5)),
    latestPaymentOk: () => scenario({}, () => p.getLatestSubscriptionPayment("sub_1")),
    latestPaymentObjectPi: () =>
      scenario(
        { stripe: { "invoicePayments.list": { data: [{ payment: { type: "payment_intent", payment_intent: { id: "pi_obj" } } }] } } },
        () => p.getLatestSubscriptionPayment("sub_1"),
      ),
    latestPaymentNoInvoice: () => scenario({ stripe: { "invoices.list": { data: [] } } }, () => p.getLatestSubscriptionPayment("sub_1")),
    latestPaymentNotPi: () =>
      scenario(
        { stripe: { "invoicePayments.list": { data: [{ payment: { type: "charge" } }] } } },
        () => p.getLatestSubscriptionPayment("sub_1"),
      ),
    latestPaymentNone: () => scenario({ stripe: { "invoicePayments.list": { data: [] } } }, () => p.getLatestSubscriptionPayment("sub_1")),
    verifyOk: () => scenario({ env: { STRIPE_WEBHOOK_SECRET: "whsec" } }, () => p.verifyWebhookSignature("{}", "sig")),
    verifyNoSecret: () => scenario({ env: { STRIPE_WEBHOOK_SECRET: undefined } }, () => p.verifyWebhookSignature("{}", "sig")),
    verifyBadSig: () =>
      scenario(
        { env: { STRIPE_WEBHOOK_SECRET: "whsec" }, stripe: { "webhooks.constructEvent": () => { throw new Error("bad"); } } },
        () => p.verifyWebhookSignature("{}", "sig"),
      ),
    // handlePaymentSuccess and the subscription grants are tested against a real database:
    // tests/integration/payments/webhook-flow.test.ts, subscription-state.test.ts
    // access grants
    grantCourseExisting: () => scenario({ db: { "enrollment.findUnique": { id: "e1" } } }, () => p.grantCourseAccess("u1", "c1")),
    grantCourseOk: () =>
      scenario({ db: { "enrollment.findUnique": null, "course.findFirst": { id: "c1", title: "React" } } }, () => p.grantCourseAccess("u1", "c1")),
    grantCourseMissing: () =>
      scenario({ db: { "enrollment.findUnique": null, "course.findFirst": null } }, () => p.grantCourseAccess("u1", "c1")),
    // subscriptions
    cancelSubOk: () => scenario({}, () => p.cancelSubscription("sub_1")),
    cancelSubFail: () => scenario({ stripe: { "subscriptions.update": new Error("x") } }, () => p.cancelSubscription("sub_1")),
    getSubOk: () => scenario({}, () => p.getSubscription("sub_1")),
    getSubFail: () => scenario({ stripe: { "subscriptions.retrieve": new Error("nope") } }, () => p.getSubscription("sub_1")),
    getSubEmpty: () => scenario({ stripe: { "subscriptions.retrieve": null } }, () => p.getSubscription("sub_1")),
  };

  for (const [name, run] of Object.entries(cases)) {
    it(name, async () => {
      expect(await run()).toMatchSnapshot();
    });
  }
});
