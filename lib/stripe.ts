import Stripe from "stripe";

const PINNED_API_VERSION =
  "2025-08-27.basil" as unknown as Stripe.LatestApiVersion;

let _stripe: Stripe | undefined;

export function getStripeServer(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is required");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      // Pinned on purpose: requests and webhook payloads keep the shapes the
      // billing code was written against. Moving to the SDK default is a
      // separate, tested migration (the SDK types follow its own default).
      apiVersion: PINNED_API_VERSION,
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
