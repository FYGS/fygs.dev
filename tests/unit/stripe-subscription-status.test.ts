import { describe, it, expect } from "vitest";
import { SubscriptionStatus } from "@/lib/generated/prisma/browser";
import { mapStripeSubscriptionStatus } from "@/lib/stripe-subscription-status";

describe("mapStripeSubscriptionStatus", () => {
  it.each([
    ["active", SubscriptionStatus.ACTIVE],
    ["trialing", SubscriptionStatus.TRIALING],
    ["incomplete", SubscriptionStatus.INCOMPLETE],
    ["past_due", SubscriptionStatus.PAST_DUE],
    ["canceled", SubscriptionStatus.CANCELED],
  ])("keeps the existing mapping for %s", (stripe, ours) => {
    expect(mapStripeSubscriptionStatus(stripe)).toEqual({ status: ours, known: true });
  });

  it.each([
    ["unpaid", SubscriptionStatus.PAST_DUE],
    ["paused", SubscriptionStatus.PAST_DUE],
    ["incomplete_expired", SubscriptionStatus.CANCELED],
  ])("never grants access for %s", (stripe, ours) => {
    const result = mapStripeSubscriptionStatus(stripe);
    expect(result).toEqual({ status: ours, known: true });
    expect(result.status).not.toBe(SubscriptionStatus.ACTIVE);
  });

  it("fails closed on an unknown status", () => {
    expect(mapStripeSubscriptionStatus("something_new")).toEqual({
      status: SubscriptionStatus.PAST_DUE,
      known: false,
    });
  });
});
