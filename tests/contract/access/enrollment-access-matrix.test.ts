import { describe, test, expect } from "vitest";
import { AccessService, type CourseAccessContext } from "@/lib/access-service";

describe("Enrollment Access Matrix Contract Tests", () => {
  /**
   * Test matrix covering all combinations of:
   * - Enrolled vs Not Enrolled
   * - Free vs Premium course
   * - Subscription Active vs Cancelled
   * - Lifetime Purchase present vs absent
   */

  // Mock contexts for testing
  const createContext = (
    enrolled: boolean,
    courseAccessTier: "FREE" | "PREMIUM",
    subscriptionActive: boolean,
    hasLifetimePurchase: boolean,
    courseId = "course-123"
  ): CourseAccessContext => ({
    enrollment: enrolled
      ? {
          id: "enrollment-123",
          enrolledAt: new Date("2024-01-01"),
        }
      : null,
    course: {
      id: courseId,
      accessTier: courseAccessTier,
      previewEnabled: true,
    },
    subscription: subscriptionActive
      ? {
          id: "sub-123",
          status: "ACTIVE",
          currentPeriodEnd: new Date("2024-12-31"),
        }
      : null,
    payments: hasLifetimePurchase
      ? [
          {
            id: "payment-123",
            kind: "COURSE",
            status: "COMPLETED",
            courseId,
          },
        ]
      : [],
  });

  describe("FREE course access matrix", () => {
    test("enrolled + free course → allowed (FREE_COURSE)", () => {
      const context = createContext(true, "FREE", false, false);
      const result = AccessService.evaluateCourseAccess(context);

      expect(result.allowed).toBe(true);
      expect(result.reason).toBe("FREE_COURSE");
      expect(result.source).toBe("course_tier");
    });

    test("not enrolled + free course → denied (NOT_ENROLLED)", () => {
      const context = createContext(false, "FREE", false, false);
      const result = AccessService.evaluateCourseAccess(context);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("NOT_ENROLLED");
      expect(result.source).toBe("enrollment");
    });

    test("not enrolled + free course + active subscription → denied (NOT_ENROLLED)", () => {
      const context = createContext(false, "FREE", true, false);
      const result = AccessService.evaluateCourseAccess(context);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("NOT_ENROLLED");
      expect(result.source).toBe("enrollment");
    });

    test("not enrolled + free course + lifetime purchase → denied (NOT_ENROLLED)", () => {
      const context = createContext(false, "FREE", false, true);
      const result = AccessService.evaluateCourseAccess(context);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("NOT_ENROLLED");
      expect(result.source).toBe("enrollment");
    });
  });

  describe("PREMIUM course access matrix", () => {
    test("enrolled + premium + active subscription → allowed (ACTIVE_SUBSCRIPTION)", () => {
      const context = createContext(true, "PREMIUM", true, false);
      const result = AccessService.evaluateCourseAccess(context);

      expect(result.allowed).toBe(true);
      expect(result.reason).toBe("ACTIVE_SUBSCRIPTION");
      expect(result.source).toBe("subscription");
    });

    test("enrolled + premium + lifetime purchase → allowed (LIFETIME_PURCHASE)", () => {
      const context = createContext(true, "PREMIUM", false, true);
      const result = AccessService.evaluateCourseAccess(context);

      expect(result.allowed).toBe(true);
      expect(result.reason).toBe("LIFETIME_PURCHASE");
      expect(result.source).toBe("payment");
    });

    test("enrolled + premium + both subscription and purchase → allowed (LIFETIME_PURCHASE precedence)", () => {
      const context = createContext(true, "PREMIUM", true, true);
      const result = AccessService.evaluateCourseAccess(context);

      expect(result.allowed).toBe(true);
      expect(result.reason).toBe("LIFETIME_PURCHASE");
      expect(result.source).toBe("payment");
    });

    test("enrolled + premium + no subscription + no purchase → denied (PREMIUM_LOCKED)", () => {
      const context = createContext(true, "PREMIUM", false, false);
      const result = AccessService.evaluateCourseAccess(context);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("PREMIUM_LOCKED");
      expect(result.source).toBe("enrollment");
    });

    test("not enrolled + premium + active subscription → denied (NOT_ENROLLED)", () => {
      const context = createContext(false, "PREMIUM", true, false);
      const result = AccessService.evaluateCourseAccess(context);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("NOT_ENROLLED");
      expect(result.source).toBe("enrollment");
    });

    test("not enrolled + premium + lifetime purchase → denied (NOT_ENROLLED)", () => {
      const context = createContext(false, "PREMIUM", false, true);
      const result = AccessService.evaluateCourseAccess(context);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("NOT_ENROLLED");
      expect(result.source).toBe("enrollment");
    });

    test("not enrolled + premium + no entitlements → denied (NOT_ENROLLED)", () => {
      const context = createContext(false, "PREMIUM", false, false);
      const result = AccessService.evaluateCourseAccess(context);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("NOT_ENROLLED");
      expect(result.source).toBe("enrollment");
    });
  });

  describe("Edge cases and validation", () => {
    test("cancelled subscription (inactive) + enrolled + premium → denied (PREMIUM_LOCKED)", () => {
      const context = createContext(true, "PREMIUM", false, false);
      // Override subscription to be inactive
      context.subscription = {
        id: "sub-cancelled",
        status: "CANCELED",
        currentPeriodEnd: new Date("2024-01-01"),
      };

      const result = AccessService.evaluateCourseAccess(context);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("PREMIUM_LOCKED");
      expect(result.source).toBe("enrollment");
    });

    test("payment for different course does not grant access", () => {
      const context = createContext(true, "PREMIUM", false, false);
      context.payments = [
        {
          id: "payment-different",
          kind: "COURSE",
          status: "COMPLETED",
          courseId: "different-course-id",
        },
      ];

      const result = AccessService.evaluateCourseAccess(context);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("PREMIUM_LOCKED");
      expect(result.source).toBe("enrollment");
    });

    test("failed payment does not grant access", () => {
      const context = createContext(true, "PREMIUM", false, false);
      context.payments = [
        {
          id: "payment-failed",
          kind: "COURSE",
          status: "FAILED",
          courseId: context.course.id,
        },
      ];

      const result = AccessService.evaluateCourseAccess(context);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("PREMIUM_LOCKED");
      expect(result.source).toBe("enrollment");
    });

    test("subscription payment type does not grant course access", () => {
      const context = createContext(true, "PREMIUM", false, false);
      context.payments = [
        {
          id: "payment-subscription",
          kind: "SUBSCRIPTION",
          status: "COMPLETED",
          courseId: null,
        },
      ];

      const result = AccessService.evaluateCourseAccess(context);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("PREMIUM_LOCKED");
      expect(result.source).toBe("enrollment");
    });
  });

  describe("Access decision consistency", () => {
    test("same context always returns same result (deterministic)", () => {
      const context = createContext(true, "PREMIUM", true, false);

      const result1 = AccessService.evaluateCourseAccess(context);
      const result2 = AccessService.evaluateCourseAccess(context);

      expect(result1).toEqual(result2);
    });

    test("all possible reasons are covered", () => {
      const possibleReasons = [
        "NOT_ENROLLED",
        "FREE_COURSE",
        "LIFETIME_PURCHASE",
        "ACTIVE_SUBSCRIPTION",
        "PREMIUM_LOCKED",
      ];
      const possibleSources = [
        "enrollment",
        "subscription",
        "payment",
        "course_tier",
      ];

      // Test each reason can be produced
      const notEnrolled = AccessService.evaluateCourseAccess(
        createContext(false, "FREE", false, false)
      );
      expect(possibleReasons).toContain(notEnrolled.reason);
      expect(possibleSources).toContain(notEnrolled.source);

      const freeCourse = AccessService.evaluateCourseAccess(
        createContext(true, "FREE", false, false)
      );
      expect(possibleReasons).toContain(freeCourse.reason);
      expect(possibleSources).toContain(freeCourse.source);

      const lifetimePurchase = AccessService.evaluateCourseAccess(
        createContext(true, "PREMIUM", false, true)
      );
      expect(possibleReasons).toContain(lifetimePurchase.reason);
      expect(possibleSources).toContain(lifetimePurchase.source);

      const activeSubscription = AccessService.evaluateCourseAccess(
        createContext(true, "PREMIUM", true, false)
      );
      expect(possibleReasons).toContain(activeSubscription.reason);
      expect(possibleSources).toContain(activeSubscription.source);

      const premiumLocked = AccessService.evaluateCourseAccess(
        createContext(true, "PREMIUM", false, false)
      );
      expect(possibleReasons).toContain(premiumLocked.reason);
      expect(possibleSources).toContain(premiumLocked.source);
    });
  });
});
