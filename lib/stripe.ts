import Stripe from "stripe";

/**
 * API version used for every request this app makes: the one built into the
 * installed SDK (stripe-node ships the typings for exactly that version, so
 * types and runtime agree). It moves when the SDK major is upgraded.
 *
 * Webhook payloads are NOT governed by this: they use the API version of the
 * endpoint configured in the Stripe dashboard. Handlers therefore accept the
 * shapes of both old and new versions (see docs/modernization-2026-10.md).
 */
export const STRIPE_API_VERSION: string = Stripe.API_VERSION;

export type StripeKeyMode = "live" | "test" | "unknown";

/** `live` or `test`, from the prefix of the secret key (`sk_live_`, `rk_live_`, `sk_test_`, `rk_test_`). */
export function stripeKeyMode(key: string | undefined = process.env.STRIPE_SECRET_KEY): StripeKeyMode {
  if (!key) return "unknown";
  if (/^(sk|rk)_live_/.test(key)) return "live";
  if (/^(sk|rk)_test_/.test(key)) return "test";
  return "unknown";
}

/**
 * Fails when the key is not of the mode the deployment expects. Set `STRIPE_EXPECT_MODE=live` in production (and
 * `test` elsewhere): a test key left in production would take no real money, a live key left in a test environment
 * would charge real cards. Run at startup by the environment guard and before an event is processed.
 */
export function assertStripeKeyMode(): void {
  const expected = process.env.STRIPE_EXPECT_MODE;
  if (expected !== "live" && expected !== "test") return;
  const actual = stripeKeyMode();
  if (actual !== expected) {
    throw new Error(`STRIPE_SECRET_KEY is a ${actual} key but STRIPE_EXPECT_MODE is ${expected}`);
  }
}

let _stripe: Stripe | undefined;

export function getStripeServer(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is required");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      // No `apiVersion` option: the SDK default (see STRIPE_API_VERSION).
      typescript: true,
    });
  }
  return _stripe;
}

// Lazy proxy so imports don't crash at build time
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop: string | symbol) {
    const instance = getStripeServer();
    const value = (instance as unknown as Record<string | symbol, unknown>)[
      prop
    ];
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});

export const getStripe = () => {
  if (typeof window === "undefined") return null;

  const stripePromise = import("@stripe/stripe-js").then(({ loadStripe }) =>
    loadStripe(process.env.STRIPE_PUBLISHABLE_KEY!),
  );

  return stripePromise;
};
