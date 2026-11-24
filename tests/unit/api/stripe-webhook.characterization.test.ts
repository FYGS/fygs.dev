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

// Duplicate-delivery handling has its own tests (stripe-webhook.idempotency.test.ts, integration/payments/event-claims).
vi.mock("@/lib/payments/event-claims", () => ({
  claimEvent: async () => ({ state: "claimed" }),
  completeEvent: async () => {},
  releaseEvent: async () => {},
}));

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
      return { duplicatePurchase: false };
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

  // The subscription and invoice handlers read Stripe's current state and store it through the central rules
  // (lib/payments/subscription-state.ts): their behaviour is tested against a real database in
  // tests/integration/payments/*.
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
