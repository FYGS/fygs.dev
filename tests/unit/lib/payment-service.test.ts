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
  "subscriptions.update": {},
  "subscriptions.cancel": {},
  // invoices.retrieveUpcoming no longer exists (removed in API 2025-03-31): the
  // preview is what Stripe really returns (see tests/fixtures/stripe)
  "invoices.createPreview": {
    id: "upcoming_in_1",
    amount_due: 1234,
    currency: "eur",
    lines: {
      data: [
        { amount: -500, parent: { subscription_item_details: { proration: true } } },
        { amount: 1734, parent: { subscription_item_details: { proration: false } } },
      ],
    },
  },
  "invoices.list": { data: [{ id: "in_1", amount_paid: 999, currency: "eur" }] },
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
  return { stripe: make([]) };
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
const sessionBase = {
  id: "cs_1",
  mode: "payment",
  currency: "eur",
  amount_total: 4990,
  payment_status: "paid",
  payment_intent: "pi_1",
  metadata: { userId: "u1", productId: "c1", type: "course_purchase" },
};

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
    switchOkNoAudit: () => scenario({}, () => p.switchSubscriptionPrice("sub_1", "price_y")),
    switchNoPreview: () => scenario({ stripe: { "invoices.createPreview": null } }, () => p.switchSubscriptionPrice("sub_1", "price_y")),
    switchPreviewFails: () =>
      scenario({ stripe: { "invoices.createPreview": new Error("no preview") } }, () => p.switchSubscriptionPrice("sub_1", "price_y")),
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
    createCustomerOk: () => scenario({}, () => p.createCustomer("a@b.c", "Al", "u1")),
    createCustomerMin: () => scenario({}, () => p.createCustomer("a@b.c")),
    createCustomerFail: () => scenario({ stripe: { "customers.create": new Error("x") } }, () => p.createCustomer("a@b.c")),
    customerByEmailFound: () => scenario({}, () => p.getCustomerByEmail("a@b.c")),
    customerByEmailNone: () => scenario({ stripe: { "customers.list": { data: [] } } }, () => p.getCustomerByEmail("a@b.c")),
    customerByEmailFail: () => scenario({ stripe: { "customers.list": new Error("x") } }, () => p.getCustomerByEmail("a@b.c")),
    createProductOk: () =>
      scenario({}, () => p.createProduct({ id: "p1", name: "N", description: "D", price: 1000, currency: "eur", type: "course", metadata: { a: "b" } })),
    createProductFail: () =>
      scenario({ stripe: { "prices.create": new Error("x") } }, () => p.createProduct({ id: "p1", name: "N", description: "D", price: 1000, currency: "eur", type: "bundle" })),
    createSubPriceMonth: () => scenario({}, () => p.createSubscriptionPrice("prod_1", 900)),
    createSubPriceYear: () => scenario({}, () => p.createSubscriptionPrice("prod_1", 9000, "year")),
    createSubPriceFail: () => scenario({ stripe: { "prices.create": new Error("x") } }, () => p.createSubscriptionPrice("prod_1", 900)),
    verifyOk: () => scenario({ env: { STRIPE_WEBHOOK_SECRET: "whsec" } }, () => p.verifyWebhookSignature("{}", "sig")),
    verifyNoSecret: () => scenario({ env: { STRIPE_WEBHOOK_SECRET: undefined } }, () => p.verifyWebhookSignature("{}", "sig")),
    verifyBadSig: () =>
      scenario(
        { env: { STRIPE_WEBHOOK_SECRET: "whsec" }, stripe: { "webhooks.constructEvent": () => { throw new Error("bad"); } } },
        () => p.verifyWebhookSignature("{}", "sig"),
      ),
    // handlePaymentSuccess
    hpsNoUser: () => scenario({}, () => p.handlePaymentSuccess({ id: "cs_1", mode: "payment", metadata: {} } as never)),
    hpsNoMetadata: () => scenario({}, () => p.handlePaymentSuccess({ id: "cs_1" } as never)),
    hpsCourseNew: () =>
      scenario(
        { db: { "payment.findFirst": null, "enrollment.findUnique": null, "course.findFirst": { id: "c1", title: "React" } } },
        () => p.handlePaymentSuccess(sessionBase as never),
      ),
    hpsCoursePending: () =>
      scenario(
        { db: { "payment.findFirst": { id: "pay1" }, "enrollment.findUnique": { id: "e1" } } },
        () => p.handlePaymentSuccess(sessionBase as never),
      ),
    hpsCourseNoIntent: () => scenario({}, () => p.handlePaymentSuccess({ ...sessionBase, payment_intent: null } as never)),
    hpsCoursePaymentFails: () =>
      scenario({ db: { "payment.findFirst": new Error("db down") } }, () => p.handlePaymentSuccess(sessionBase as never)),
    hpsCourseEnrollFails: () =>
      scenario(
        { db: { "payment.findFirst": null, "enrollment.findUnique": null, "course.findFirst": null } },
        () => p.handlePaymentSuccess(sessionBase as never),
      ),
    hpsCourseAnalyticsFails: () =>
      scenario(
        { db: { "payment.findFirst": null, "enrollment.findUnique": { id: "e" } }, analytics: { coursePurchased: new Error("an") } },
        () => p.handlePaymentSuccess(sessionBase as never),
      ),
    hpsSubNoId: () =>
      scenario({}, () => p.handlePaymentSuccess({ ...sessionBase, mode: "subscription", subscription: null, metadata: { userId: "u1", type: "subscription" } } as never)),
    hpsSubNew: () =>
      scenario(
        { db: { "payment.findFirst": null } },
        () =>
          p.handlePaymentSuccess({
            ...sessionBase, mode: "subscription", subscription: "sub_1", payment_intent: null,
            metadata: { userId: "u1", type: "subscription", priceId: "price_monthly_x" },
          } as never),
      ),
    hpsSubPendingYearly: () =>
      scenario(
        { db: { "payment.findFirst": { id: "pay1" } } },
        () =>
          p.handlePaymentSuccess({
            ...sessionBase, mode: "subscription", subscription: "sub_1",
            metadata: { userId: "u1", type: "subscription", priceId: "price_yearly_x", billingCycle: "unknown" },
          } as never),
      ),
    hpsSubExplicitCycle: () =>
      scenario(
        { db: { "payment.findFirst": null } },
        () =>
          p.handlePaymentSuccess({
            ...sessionBase, mode: "subscription", subscription: "sub_1",
            metadata: { userId: "u1", type: "subscription", priceId: "zzz", billingCycle: "yearly" },
          } as never),
      ),
    hpsSubGrantFails: () =>
      scenario(
        { stripe: { "subscriptions.retrieve": new Error("stripe down") } },
        () =>
          p.handlePaymentSuccess({
            ...sessionBase, mode: "subscription", subscription: "sub_1",
            metadata: { userId: "u1", type: "subscription" },
          } as never),
      ),
    hpsSubPaymentRecordFails: () =>
      scenario(
        { db: { "payment.findFirst": new Error("db") } },
        () =>
          p.handlePaymentSuccess({
            ...sessionBase, mode: "subscription", subscription: "sub_1",
            metadata: { userId: "u1", type: "subscription" },
          } as never),
      ),
    hpsSubAnalyticsFails: () =>
      scenario(
        { db: { "payment.findFirst": null }, analytics: { subscriptionStarted: new Error("an") } },
        () =>
          p.handlePaymentSuccess({
            ...sessionBase, mode: "subscription", subscription: "sub_1",
            metadata: { userId: "u1", type: "subscription" },
          } as never),
      ),
    hpsUnknownType: () =>
      scenario({}, () => p.handlePaymentSuccess({ ...sessionBase, metadata: { userId: "u1", type: "weird" } } as never)),
    hpsCourseNoProduct: () =>
      scenario({}, () => p.handlePaymentSuccess({ ...sessionBase, metadata: { userId: "u1", type: "course_purchase" } } as never)),
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

  // grantSubscriptionAccess is private; exercise its variants via handlePaymentSuccess
  const subSession = {
    ...sessionBase, mode: "subscription", subscription: "sub_1",
    metadata: { userId: "u1", type: "subscription" },
  };
  const grantVariants: Record<string, Record<string, unknown>> = {
    customerObject: subscriptionFixture({ customer: { id: "cus_obj" } }),
    customerMissing: subscriptionFixture({ customer: null }),
    pastDue: subscriptionFixture({ status: "past_due" }),
    canceled: subscriptionFixture({ status: "canceled", cancel_at_period_end: true }),
    unknownStatus: subscriptionFixture({ status: "something_new" }),
    noItems: subscriptionFixture({ items: undefined, plan: { id: "plan_legacy" }, billing_cycle_anchor: 1690000000 }),
    yearlyNoPeriod: subscriptionFixture({
      items: { data: [{ id: "si", price: { id: "price_y", recurring: { interval: "year" } } }] },
      start_date: 1690000001,
    }),
    emptyItemsNoPrice: subscriptionFixture({ items: { data: [] } }),
  };
  for (const [name, sub] of Object.entries(grantVariants)) {
    cases[`grantSub-${name}`] = () =>
      scenario(
        { db: { "payment.findFirst": null }, stripe: { "subscriptions.retrieve": sub } },
        () => p.handlePaymentSuccess(subSession as never),
      );
  }

  for (const [name, run] of Object.entries(cases)) {
    it(name, async () => {
      expect(await run()).toMatchSnapshot();
    });
  }
});
