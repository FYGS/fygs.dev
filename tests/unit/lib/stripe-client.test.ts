import { afterEach, describe, expect, it } from "vitest";
import Stripe from "stripe";
import { getStripeServer, STRIPE_API_VERSION } from "@/lib/stripe";
import { getSubscriptionPeriod, stripeRefId } from "@/lib/stripe-shapes";
import { clone, fixtures as f, toLegacySubscription } from "../../fixtures/stripe";

describe("lib/stripe", () => {
  const saved = process.env.STRIPE_SECRET_KEY;
  afterEach(() => {
    if (saved === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = saved;
  });

  it("sends requests with the API version built into the SDK, not a pinned one", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_unit";
    const client = getStripeServer();
    expect(STRIPE_API_VERSION).toBe(Stripe.API_VERSION);
    expect(client.getApiField("version")).toBe(Stripe.API_VERSION);
    expect(Stripe.API_VERSION).not.toBe("2025-08-27.basil");
  });

  it("is a singleton and requires the key lazily", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_unit";
    expect(getStripeServer()).toBe(getStripeServer());
  });
});

describe("stripeRefId", () => {
  it("reads ids, expanded objects and nothing", () => {
    expect(stripeRefId("pi_1")).toBe("pi_1");
    expect(stripeRefId({ id: "pi_2" })).toBe("pi_2");
    expect(stripeRefId({})).toBeNull();
    expect(stripeRefId(null)).toBeNull();
    expect(stripeRefId(undefined)).toBeNull();
  });
});

describe("getSubscriptionPeriod", () => {
  const item = f.subscriptionRetrieved.items.data[0];

  it("reads the period from the subscription item (API 2025-03-31 and later)", () => {
    expect(getSubscriptionPeriod(f.subscriptionRetrieved)).toEqual({
      start: item.current_period_start,
      end: item.current_period_end,
    });
  });

  it("falls back to the subscription itself (older API versions)", () => {
    expect(getSubscriptionPeriod(toLegacySubscription(f.subscriptionRetrieved))).toEqual({
      start: item.current_period_start,
      end: item.current_period_end,
    });
  });

  it("the item wins when both are present, and nothing yields undefined bounds", () => {
    const both = clone(f.subscriptionRetrieved) as Record<string, any>;
    both.current_period_end = 1;
    expect(getSubscriptionPeriod(both).end).toBe(item.current_period_end);
    expect(getSubscriptionPeriod({})).toEqual({ start: undefined, end: undefined });
    expect(getSubscriptionPeriod(null)).toEqual({ start: undefined, end: undefined });
  });
});
