import { describe, test, expect } from "vitest";
import { decideEntitlement, isSubscriptionActive, previewLessonIds, type EntitlementFacts } from "@/lib/access/entitlement";
import { CourseAccessTier, SubscriptionStatus } from "@/lib/generated/prisma/browser";

/**
 * The access rule of the platform (lib/access/entitlement.ts), every combination of: enrolled or not, free or
 * premium, subscription (active, trialing, ended), lifetime purchase (completed, refunded), access granted, staff.
 */
const facts = (over: Partial<EntitlementFacts> = {}): EntitlementFacts => ({
  tier: CourseAccessTier.PREMIUM,
  enrolled: true,
  granted: false,
  purchased: false,
  refunded: false,
  subscription: null,
  isStaff: false,
  ...over,
});
const sub = (status: SubscriptionStatus) => ({ status, cancelAtPeriodEnd: false, currentPeriodEnd: null });

describe("free course", () => {
  test("open once enrolled", () => {
    expect(decideEntitlement(facts({ tier: CourseAccessTier.FREE }))).toEqual({ eligible: true, entitled: true, source: "free", lapsed: null });
  });
  test("eligible but not entitled before the enrolment, whatever else the learner holds", () => {
    for (const extra of [{}, { subscription: sub(SubscriptionStatus.ACTIVE) }, { purchased: true }]) {
      expect(decideEntitlement(facts({ tier: CourseAccessTier.FREE, enrolled: false, ...extra }))).toMatchObject({
        eligible: true,
        entitled: false,
        lapsed: null,
      });
    }
  });
});

describe("premium course", () => {
  test("a lifetime purchase opens it, and wins over the subscription", () => {
    expect(decideEntitlement(facts({ purchased: true }))).toMatchObject({ entitled: true, source: "purchase" });
    expect(decideEntitlement(facts({ purchased: true, subscription: sub(SubscriptionStatus.ACTIVE) }))).toMatchObject({ source: "purchase" });
  });
  test("an active or trialing subscription opens it", () => {
    expect(decideEntitlement(facts({ subscription: sub(SubscriptionStatus.ACTIVE) }))).toMatchObject({ entitled: true, source: "subscription" });
    expect(decideEntitlement(facts({ subscription: sub(SubscriptionStatus.TRIALING) }))).toMatchObject({ entitled: true, source: "subscription" });
  });
  test("an access granted by an administrator opens it, on any tier", () => {
    expect(decideEntitlement(facts({ granted: true }))).toMatchObject({ entitled: true, source: "grant" });
    expect(decideEntitlement(facts({ granted: true, tier: CourseAccessTier.FREE }))).toMatchObject({ source: "grant" });
  });
  test("a right without the enrolment makes the learner eligible, one click away", () => {
    expect(decideEntitlement(facts({ enrolled: false, subscription: sub(SubscriptionStatus.ACTIVE) }))).toEqual({
      eligible: true,
      entitled: false,
      source: "subscription",
      lapsed: null,
    });
  });
  test("nothing: neither eligible nor lapsed when not enrolled", () => {
    expect(decideEntitlement(facts({ enrolled: false }))).toEqual({ eligible: false, entitled: false, source: null, lapsed: null });
  });
});

describe("lapsed learners say why", () => {
  test("subscription ended (cancelled, unpaid, not finalised)", () => {
    for (const status of [SubscriptionStatus.CANCELED, SubscriptionStatus.PAST_DUE, SubscriptionStatus.INCOMPLETE]) {
      expect(decideEntitlement(facts({ subscription: sub(status) }))).toMatchObject({ entitled: false, lapsed: "subscription_ended" });
    }
  });
  test("purchase refunded", () => {
    expect(decideEntitlement(facts({ refunded: true }))).toMatchObject({ entitled: false, lapsed: "refunded" });
  });
  test("course turned premium after a free enrolment", () => {
    expect(decideEntitlement(facts())).toMatchObject({ entitled: false, lapsed: "premium_required" });
  });
});

describe("staff", () => {
  test("the author or an admin sees everything, recorded as staff when they hold no real right", () => {
    expect(decideEntitlement(facts({ enrolled: false, isStaff: true }))).toEqual({ eligible: false, entitled: true, source: "staff", lapsed: null });
  });
  test("a real right wins: the work of a staff member who follows the course is recorded", () => {
    expect(decideEntitlement(facts({ isStaff: true, tier: CourseAccessTier.FREE }))).toMatchObject({ source: "free" });
  });
});

test("only ACTIVE and TRIALING count as an active subscription", () => {
  expect(Object.values(SubscriptionStatus).filter((status) => isSubscriptionActive({ status }))).toEqual([
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.TRIALING,
  ]);
  expect(isSubscriptionActive(null)).toBe(false);
});

describe("free sample lessons", () => {
  const lessons = [
    { id: "l1", isPreview: false },
    { id: "l2", isPreview: true },
    { id: "l3", isPreview: false },
  ];
  test("flagged lessons, plus the first one when the course offers it", () => {
    expect([...previewLessonIds({ published: true, previewEnabled: true }, lessons)].sort()).toEqual(["l1", "l2"]);
    expect([...previewLessonIds({ published: true, previewEnabled: false }, lessons)]).toEqual(["l2"]);
  });
  test("an unpublished course has none, an empty one has none", () => {
    expect(previewLessonIds({ published: false, previewEnabled: true }, lessons).size).toBe(0);
    expect(previewLessonIds({ published: true, previewEnabled: true }, []).size).toBe(0);
  });
});
