import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

/**
 * Characterisation of POST /api/stripe/webhook: every external call (db, email,
 * analytics, paymentService, logger) and the HTTP response are recorded in one
 * ordered log per scenario and pinned by snapshot.
 */
const h = vi.hoisted(() => ({
  log: [] as unknown[],
  dbRec: null as null | ReturnType<typeof import("../lib/services/db-recorder").createDbRecorder>,
  headers: { mode: "sig" as "sig" | "nosig" | "throw" },
  verify: { event: null as unknown, error: null as unknown },
  pay: { successError: null as unknown, getSub: null as unknown, getSubError: null as unknown },
  emailFail: new Set<string>(),
  SigError: class SigError extends Error {},
}));

const SigError = h.SigError;

vi.mock("next/headers", () => ({
  headers: async () => {
    if (h.headers.mode === "throw") throw new Error("headers boom");
    return new Headers(h.headers.mode === "sig" ? { "stripe-signature": "sig_x" } : {});
  },
}));

vi.mock("@/lib/db", async () => {
  const { createDbRecorder } = await import("../lib/services/db-recorder");
  h.dbRec = createDbRecorder(h.log);
  return { db: h.dbRec.db };
});

vi.mock("@/lib/payment-service", () => ({
  WebhookSignatureError: h.SigError,
  paymentService: {
    verifyWebhookSignature: (body: string, sig: string) => {
      h.log.push(["pay.verifyWebhookSignature", body, sig]);
      if (h.verify.error) throw h.verify.error;
      return h.verify.event;
    },
    handlePaymentSuccess: async (s: unknown) => {
      h.log.push(["pay.handlePaymentSuccess", s]);
      if (h.pay.successError) throw h.pay.successError;
    },
    getSubscription: async (id: string) => {
      h.log.push(["pay.getSubscription", id]);
      if (h.pay.getSubError) throw h.pay.getSubError;
      return h.pay.getSub;
    },
  },
}));

vi.mock("@/lib/email-service", () => ({
  emailService: new Proxy(
    {},
    {
      get: (_t, name: string) => async (...a: unknown[]) => {
        h.log.push([`email.${name}`, a]);
        if (h.emailFail.has(name)) throw new Error(`email ${name} failed`);
      },
    },
  ),
}));

vi.mock("@/lib/analytics-helper", () => ({
  Analytics: new Proxy(
    {},
    {
      get: (_t, name: string) => (...a: unknown[]) => {
        h.log.push([`analytics.${name}`, a]);
      },
    },
  ),
}));

vi.mock("@/lib/structured-logger", () => {
  const logger = Object.fromEntries(
    ["debug", "info", "warn", "error"].map((lvl) => [
      lvl,
      (...a: unknown[]) =>
        h.log.push([`log.${lvl}`, a.map((x) => (x instanceof Error ? x.message : x))]),
    ]),
  );
  return { createLogger: () => logger, logger };
});

import { POST } from "@/app/api/stripe/webhook/route";

const norm = (v: unknown) =>
  JSON.parse(
    JSON.stringify(v, function (this: unknown, k, x) {
      if (k === "errorStack") return "<stack>";
      if (x instanceof Error) return { __error: x.message };
      return x;
    }) ?? "null",
  );

type Setup = {
  db?: Record<string, unknown>;
  mode?: "sig" | "nosig" | "throw";
  verifyError?: unknown;
  successError?: unknown;
  getSub?: unknown;
  getSubError?: unknown;
  emailFail?: string[];
};

async function run(event: unknown, s: Setup = {}) {
  h.log.length = 0;
  h.dbRec!.state.mode = "empty";
  h.dbRec!.state.overrides = { ...(s.db ?? {}) };
  h.headers.mode = s.mode ?? "sig";
  h.verify.event = event;
  h.verify.error = s.verifyError ?? null;
  h.pay.successError = s.successError ?? null;
  h.pay.getSub = s.getSub ?? null;
  h.pay.getSubError = s.getSubError ?? null;
  h.emailFail = new Set(s.emailFail ?? []);
  const res = await POST(
    new NextRequest("http://localhost/api/stripe/webhook", { method: "POST", body: '{"raw":1}' }),
  );
  return norm({ status: res.status, body: await res.json(), log: h.log });
}

const user = { email: "a@x.test", name: "Alice" };
const userOnly = { "user.findUnique": user };
const noName = { "user.findUnique": { email: "n@x.test", name: null } };
const ev = (type: string, object: unknown) => ({ id: "evt_1", type, data: { object } });

const session = (over: Record<string, unknown> = {}) => ({
  id: "cs_1",
  payment_status: "paid",
  mode: "payment",
  created: 1900000000,
  customer: "cus_1",
  subscription: null,
  payment_intent: "pi_1",
  invoice: null,
  amount_total: 4990,
  metadata: { userId: "u1", productId: "c1", type: "course_purchase" },
  ...over,
});
const subMeta = { userId: "u1" };
const sub = (over: Record<string, unknown> = {}) => ({
  id: "sub_1",
  status: "active",
  customer: "cus_1",
  metadata: subMeta,
  cancel_at_period_end: false,
  billing_cycle_anchor: 1800000000,
  start_date: 1700000000,
  items: {
    data: [
      {
        current_period_start: 1900000000,
        current_period_end: 1902592000,
        price: { id: "price_x", unit_amount: 1999 },
      },
    ],
  },
  ...over,
});
const invoice = (over: Record<string, unknown> = {}) => ({
  id: "in_1",
  subscription: "sub_1",
  amount_paid: 1999,
  currency: "eur",
  ...over,
});
const course = { "course.findUnique": { title: "TS", description: "d", slug: "ts" } };

const scenarios: Record<string, () => Promise<unknown>> = {
  // request / signature paths
  missingSignature: () => run(null, { mode: "nosig" }),
  headersThrow: () => run(null, { mode: "throw" }),
  invalidSignature: () => run(null, { verifyError: new SigError("bad") }),
  verificationOtherError: () => run(null, { verifyError: new Error("no secret") }),
  verificationNonError: () => run(null, { verifyError: "weird" }),
  unhandled: () => run(ev("customer.created", {})),

  // checkout.session.completed
  checkoutCourse: () => run(ev("checkout.session.completed", session()), { db: { ...userOnly, ...course } }),
  checkoutCourseNoAmount: () =>
    run(ev("checkout.session.completed", session({ amount_total: 0 })), { db: { ...noName, ...course } }),
  checkoutCourseMissing: () => run(ev("checkout.session.completed", session()), { db: userOnly }),
  checkoutCourseNoProduct: () =>
    run(ev("checkout.session.completed", session({ metadata: { userId: "u1", type: "course_purchase" } })), {
      db: userOnly,
    }),
  checkoutUserMissing: () => run(ev("checkout.session.completed", session())),
  checkoutPremium: () =>
    run(
      ev(
        "checkout.session.completed",
        session({ metadata: { userId: "u1", type: "premium_subscription" }, mode: "subscription", subscription: "sub_1" }),
      ),
      { db: userOnly },
    ),
  checkoutSubscriptionType: () =>
    run(
      ev(
        "checkout.session.completed",
        session({ metadata: { userId: "u1", type: "subscription" }, mode: "subscription", subscription: "sub_1" }),
      ),
      { db: userOnly },
    ),
  checkoutSubscriptionUpdateFails: () =>
    run(
      ev(
        "checkout.session.completed",
        session({ metadata: { userId: "u1", type: "subscription" }, mode: "subscription", subscription: "sub_1" }),
      ),
      { db: { ...userOnly, "subscription.updateMany": new Error("db down") } },
    ),
  checkoutCustomerObject: () =>
    run(ev("checkout.session.completed", session({ customer: { id: "cus_o" }, metadata: null })), {}),
  checkoutCustomerNull: () =>
    run(ev("checkout.session.completed", session({ customer: null, metadata: {} })), {}),
  checkoutUnpaid: () => run(ev("checkout.session.completed", session({ payment_status: "unpaid" }))),
  checkoutPaymentSuccessFails: () =>
    run(ev("checkout.session.completed", session()), { successError: new Error("ledger") }),
  checkoutPaymentSuccessFailsNonError: () =>
    run(ev("checkout.session.completed", session()), { successError: "str" }),
  checkoutEmailFails: () =>
    run(ev("checkout.session.completed", session()), {
      db: { ...userOnly, ...course },
      emailFail: ["sendCoursePurchaseEmail"],
    }),
  checkoutDbUserFails: () =>
    run(ev("checkout.session.completed", session()), { db: { "user.findUnique": new Error("db") } }),
  checkoutBadCreated: () =>
    run(ev("checkout.session.completed", session({ created: Number.NaN })), {}),

  // customer.subscription.created / updated
  subCreatedActive: () => run(ev("customer.subscription.created", sub()), { db: userOnly }),
  subCreatedYearlyMeta: () =>
    run(ev("customer.subscription.created", sub({ metadata: { userId: "u1", billingCycle: "yearly" } })), {
      db: userOnly,
    }),
  subCreatedUserMissing: () => run(ev("customer.subscription.created", sub())),
  subCreatedNoPrice: () =>
    run(ev("customer.subscription.created", sub({ items: { data: [] } })), { db: noName }),
  subCreatedNoItemsAtAll: () =>
    run(ev("customer.subscription.created", sub({ items: undefined, cancel_at_period_end: true })), { db: userOnly }),
  subCreatedFallbackDates: () =>
    run(
      ev("customer.subscription.created", sub({ items: { data: [{ price: { id: "price_y" } }] } })),
      { db: userOnly },
    ),
  subUpdatedActive: () => run(ev("customer.subscription.updated", sub()), { db: userOnly }),
  subUpdatedIncomplete: () => run(ev("customer.subscription.updated", sub({ status: "incomplete" })), { db: userOnly }),
  subUpdatedPastDue: () => run(ev("customer.subscription.updated", sub({ status: "past_due", cancel_at_period_end: true }))),
  subUpdatedUnknownStatus: () => run(ev("customer.subscription.updated", sub({ status: "mystery" }))),
  subUpdatedNoUserId: () => run(ev("customer.subscription.updated", sub({ metadata: {} }))),
  subUpdatedNoMetadata: () => run(ev("customer.subscription.updated", sub({ metadata: undefined }))),
  subUpsertFails: () =>
    run(ev("customer.subscription.created", sub()), { db: { "subscription.upsert": new Error("upsert") } }),
  subEmailFails: () =>
    run(ev("customer.subscription.created", sub()), { db: userOnly, emailFail: ["sendPremiumSubscriptionEmail"] }),
  subUpdatedUserLookupFails: () =>
    run(ev("customer.subscription.updated", sub()), { db: { "user.findUnique": new Error("db") } }),

  // customer.subscription.deleted
  subDeleted: () => run(ev("customer.subscription.deleted", sub()), { db: userOnly }),
  subDeletedNoName: () => run(ev("customer.subscription.deleted", sub()), { db: noName }),
  subDeletedUserMissing: () => run(ev("customer.subscription.deleted", sub())),
  subDeletedNoUserId: () => run(ev("customer.subscription.deleted", sub({ metadata: {} }))),
  subDeletedUpdateFails: () =>
    run(ev("customer.subscription.deleted", sub()), { db: { "subscription.update": new Error("nf") } }),
  subDeletedEmailFails: () =>
    run(ev("customer.subscription.deleted", sub()), { db: userOnly, emailFail: ["sendSubscriptionCanceledEmail"] }),

  // invoice.payment_succeeded
  invoicePaidNew: () =>
    run(ev("invoice.payment_succeeded", invoice()), { getSub: { metadata: subMeta } }),
  invoicePaidExisting: () =>
    run(ev("invoice.payment_succeeded", invoice({ amount_paid: undefined, currency: undefined })), {
      getSub: { metadata: subMeta },
      db: { "payment.findFirst": { id: "pay_1" } },
    }),
  invoicePaidNoSubscription: () => run(ev("invoice.payment_succeeded", invoice({ subscription: null }))),
  invoicePaidNoUser: () =>
    run(ev("invoice.payment_succeeded", invoice()), { getSub: { metadata: {} } }),
  invoicePaidRecordFails: () =>
    run(ev("invoice.payment_succeeded", invoice()), {
      getSub: { metadata: subMeta },
      db: { "payment.create": new Error("dup") },
    }),
  invoicePaidRecordFailsNonError: () =>
    run(ev("invoice.payment_succeeded", invoice()), {
      getSub: { metadata: subMeta },
      db: { "payment.findFirst": "x" as unknown as Error },
    }),
  invoicePaidUpdateManyFails: () =>
    run(ev("invoice.payment_succeeded", invoice()), {
      getSub: { metadata: subMeta },
      db: { "subscription.updateMany": new Error("db") },
    }),
  invoicePaidGetSubFails: () =>
    run(ev("invoice.payment_succeeded", invoice()), { getSubError: new Error("stripe") }),

  // invoice.payment_failed
  invoiceFailed: () =>
    run(ev("invoice.payment_failed", invoice()), { getSub: { metadata: subMeta }, db: userOnly }),
  invoiceFailedNoName: () =>
    run(ev("invoice.payment_failed", invoice()), { getSub: { metadata: subMeta }, db: noName }),
  invoiceFailedUserMissing: () =>
    run(ev("invoice.payment_failed", invoice()), { getSub: { metadata: subMeta } }),
  invoiceFailedNoSubscription: () => run(ev("invoice.payment_failed", invoice({ subscription: null }))),
  invoiceFailedNoUser: () => run(ev("invoice.payment_failed", invoice()), { getSub: { metadata: {} } }),
  invoiceFailedEmailFails: () =>
    run(ev("invoice.payment_failed", invoice()), {
      getSub: { metadata: subMeta },
      db: userOnly,
      emailFail: ["sendPaymentFailedEmail"],
    }),
  invoiceFailedGetSubFails: () =>
    run(ev("invoice.payment_failed", invoice()), { getSubError: new Error("stripe") }),
};

describe("POST /api/stripe/webhook (pinned behaviour)", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2030-06-15T10:20:30Z"));
  });

  for (const [name, fn] of Object.entries(scenarios)) {
    it(name, async () => {
      expect(await fn()).toMatchSnapshot();
    });
  }
});
