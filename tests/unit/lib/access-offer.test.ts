import { describe, expect, it } from "vitest";
import { courseOffer, offerPriceLabel, primaryAction, viewerStatus } from "@/lib/access/offer";
import type { CourseEntitlement } from "@/lib/access/entitlement";
import { formatCents, formatNumber, formatPrice } from "@/lib/price-format";

// Intl puts a narrow no-break space before "€" and between thousands
const plain = (text: string) => text.replace(/[  ]/g, " ");

describe("formatPrice: the amount charged, never rounded", () => {
  it("keeps the cents when there are some, drops ,00", () => {
    expect(plain(formatPrice(49.99))).toBe("49,99 €");
    expect(plain(formatPrice(50))).toBe("50 €");
    expect(plain(formatPrice("29.9"))).toBe("29,90 €");
    expect(plain(formatPrice(1234.5))).toBe("1 234,50 €");
  });
  it("shows 0 as free unless asked otherwise, and handles another currency", () => {
    expect(formatPrice(0)).toBe("Gratuit");
    expect(plain(formatPrice(0, { freeLabel: false }))).toBe("0 €");
    expect(plain(formatPrice(12, { currency: "usd" }))).toBe("12 $US");
    expect(plain(formatCents(4990))).toBe("49,90 €");
  });
  it("counts", () => {
    expect(plain(formatNumber(12345))).toBe("12 345");
  });
});

describe("courseOffer", () => {
  it("the tier decides, a leftover price on a free course is ignored", () => {
    expect(courseOffer("FREE", 49)).toEqual({ kind: "free" });
    expect(courseOffer("PREMIUM", "49.90")).toEqual({ kind: "premium", price: 49.9 });
  });
  it("a premium course under the Stripe minimum is not for sale on its own", () => {
    expect(courseOffer("PREMIUM", 0)).toEqual({ kind: "premium", price: null });
    expect(courseOffer("PREMIUM", 0.3)).toEqual({ kind: "premium", price: null });
    expect(courseOffer("PREMIUM", null)).toEqual({ kind: "premium", price: null });
    expect(offerPriceLabel({ kind: "premium", price: null })).toBe("Inclus dans Premium");
    expect(offerPriceLabel({ kind: "free" })).toBe("Gratuite");
  });
});

const entitlement = (over: Partial<CourseEntitlement>): CourseEntitlement => ({
  courseId: "c",
  tier: "PREMIUM",
  published: true,
  previewEnabled: false,
  enrolled: false,
  granted: false,
  purchased: false,
  isStaff: false,
  eligible: false,
  entitled: false,
  source: null,
  lapsed: null,
  ...over,
});

describe("viewerStatus and primaryAction", () => {
  const premium = { kind: "premium", price: 49 } as const;
  it("a visitor or a learner without a right discovers (premium) or enrols (free)", () => {
    expect(viewerStatus(null)).toBe("none");
    expect(primaryAction("react", null, premium)).toEqual({ href: "/formations/react", kind: "discover" });
    expect(primaryAction("react", null, { kind: "free" })).toEqual({ href: "/formations/react", kind: "enroll" });
  });
  it("an entitled learner continues in the learning area", () => {
    const e = entitlement({ enrolled: true, eligible: true, entitled: true, source: "purchase", purchased: true });
    expect(viewerStatus(e)).toBe("purchased");
    expect(primaryAction("react", e, premium)).toEqual({ href: "/learn/react", kind: "continue" });
  });
  it("a subscriber who did not start is one click away", () => {
    const e = entitlement({ eligible: true, source: "subscription" });
    expect(viewerStatus(e)).toBe("subscription");
    expect(primaryAction("react", e, premium).kind).toBe("start");
  });
  it("a lapsed learner is told so", () => {
    const e = entitlement({ enrolled: true, lapsed: "refunded" });
    expect(viewerStatus(e)).toBe("lapsed");
    expect(primaryAction("react", e, premium).kind).toBe("renew");
  });
  it("free enrolment, granted access and staff have their own status", () => {
    expect(viewerStatus(entitlement({ tier: "FREE", enrolled: true, eligible: true, entitled: true, source: "free" }))).toBe("enrolled");
    expect(viewerStatus(entitlement({ tier: "FREE", eligible: true, source: "free" }))).toBe("none");
    expect(viewerStatus(entitlement({ enrolled: true, eligible: true, entitled: true, source: "grant", granted: true }))).toBe("granted");
    expect(viewerStatus(entitlement({ entitled: true, source: "staff", isStaff: true }))).toBe("staff");
  });
});
