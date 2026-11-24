import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { classifyBillingCycle, resolveRequestedPriceId } from "@/lib/subscription-pricing";

const KEYS = ["STRIPE_MONTHLY_PRICE_ID", "STRIPE_YEARLY_PRICE_ID"] as const;
const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of KEYS) saved[key] = process.env[key];
  process.env.STRIPE_MONTHLY_PRICE_ID = "price_m";
  process.env.STRIPE_YEARLY_PRICE_ID = "price_y";
});
afterEach(() => {
  for (const key of KEYS) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
});

describe("resolveRequestedPriceId", () => {
  it("accepts a cycle keyword or a configured price id", () => {
    expect(resolveRequestedPriceId("monthly")).toEqual({ priceId: "price_m", cycle: "monthly" });
    expect(resolveRequestedPriceId("yearly")).toEqual({ priceId: "price_y", cycle: "yearly" });
    expect(resolveRequestedPriceId("price_y")).toEqual({ priceId: "price_y", cycle: "yearly" });
  });

  it("falls back to monthly for an unknown value, as checkout expects", () => {
    expect(resolveRequestedPriceId("whatever")).toEqual({ priceId: "price_m", cycle: "monthly" });
    expect(resolveRequestedPriceId(undefined)).toEqual({ priceId: "price_m", cycle: "monthly" });
  });

  it("in strict mode, refuses an unknown value instead of landing on another plan", () => {
    expect(() => resolveRequestedPriceId("price_typo", { strict: true })).toThrow("UNKNOWN_PRICE");
    expect(() => resolveRequestedPriceId(undefined, { strict: true })).toThrow("UNKNOWN_PRICE");
    expect(resolveRequestedPriceId("yearly", { strict: true }).cycle).toBe("yearly");
  });

  it("refuses everything when no price is configured", () => {
    delete process.env.STRIPE_MONTHLY_PRICE_ID;
    delete process.env.STRIPE_YEARLY_PRICE_ID;
    expect(() => resolveRequestedPriceId("monthly")).toThrow("SUBSCRIPTION_PRICES_NOT_CONFIGURED");
  });
});

describe("classifyBillingCycle", () => {
  it("names the cycle of a configured price, and 'unknown' otherwise", () => {
    expect(classifyBillingCycle("price_m")).toBe("monthly");
    expect(classifyBillingCycle("price_y")).toBe("yearly");
    expect(classifyBillingCycle("price_other")).toBe("unknown");
    expect(classifyBillingCycle(undefined)).toBe("unknown");
  });
});
