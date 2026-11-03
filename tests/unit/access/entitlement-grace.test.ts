import { describe, expect, it } from "vitest";
import { CourseAccessTier, SubscriptionStatus } from "@/lib/generated/prisma/browser";
import { decideEntitlement, isSubscriptionActive, SUBSCRIPTION_GRACE_DAYS } from "@/lib/access/entitlement";

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date("2030-06-15T12:00:00Z");
const endedDaysAgo = (days: number) => ({ status: SubscriptionStatus.ACTIVE, currentPeriodEnd: new Date(NOW.getTime() - days * DAY) });

describe("subscription grace period", () => {
  it("keeps the access open for the grace period after the end of the period, then closes it", () => {
    expect(isSubscriptionActive(endedDaysAgo(SUBSCRIPTION_GRACE_DAYS - 1), NOW)).toBe(true);
    expect(isSubscriptionActive(endedDaysAgo(SUBSCRIPTION_GRACE_DAYS + 1), NOW)).toBe(false);
  });

  it("a running period, or a status-only caller, is active; a cancelled or unpaid subscription never is", () => {
    expect(isSubscriptionActive({ status: SubscriptionStatus.ACTIVE, currentPeriodEnd: new Date(NOW.getTime() + DAY) }, NOW)).toBe(true);
    expect(isSubscriptionActive({ status: SubscriptionStatus.TRIALING }, NOW)).toBe(true);
    expect(isSubscriptionActive({ status: SubscriptionStatus.CANCELED, currentPeriodEnd: new Date(NOW.getTime() + DAY) }, NOW)).toBe(false);
    expect(isSubscriptionActive({ status: SubscriptionStatus.PAST_DUE }, NOW)).toBe(false);
    expect(isSubscriptionActive(null, NOW)).toBe(false);
  });
});

describe("lapsed reasons", () => {
  const base = { tier: CourseAccessTier.PREMIUM, enrolled: true, granted: false, purchased: false, refunded: false, subscription: null, isStaff: false };

  it("a contested purchase is 'disputed', a refunded one 'refunded', a dispute wins over a refund", () => {
    expect(decideEntitlement({ ...base, disputed: true })).toMatchObject({ entitled: false, lapsed: "disputed" });
    expect(decideEntitlement({ ...base, refunded: true })).toMatchObject({ entitled: false, lapsed: "refunded" });
    expect(decideEntitlement({ ...base, refunded: true, disputed: true })).toMatchObject({ lapsed: "disputed" });
  });

  it("a purchase that counts, or an administrator's grant, opens the course whatever the rest", () => {
    expect(decideEntitlement({ ...base, purchased: true })).toMatchObject({ entitled: true, source: "purchase" });
    expect(decideEntitlement({ ...base, granted: true, disputed: true })).toMatchObject({ entitled: true, source: "grant" });
  });
});
