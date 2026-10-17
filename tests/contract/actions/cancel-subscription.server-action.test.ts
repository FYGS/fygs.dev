import { describe, test, expect, beforeEach, vi, afterAll } from "vitest";
import { db } from "@/lib/db";
import { SubscriptionStatus } from "@/lib/generated/prisma/client";
import { createSubscription, createUser } from "../../support/factories";
import { resetDatabase } from "../../support/test-db";
import { mockAuthenticatedUser, AuthMock } from "../../utils/auth-mock";

// Better Auth: the session is whatever the test selected with mockAuthenticatedUser
vi.mock("@/lib/auth", async () =>
  (await import("../../utils/auth-mock")).authModuleMock()
);

// Stripe is the only thing replaced: subscription, audit and analytics rows are real
const stripe = vi.hoisted(() => ({
  cancelImmediately: vi.fn(),
  cancelSubscription: vi.fn(),
}));
vi.mock("@/lib/payment-service", () => ({ paymentService: stripe }));

import { cancelSubscription } from "@/app/[locale]/(main)/dashboard/actions/cancelSubscription";

const DAY = 24 * 60 * 60 * 1000;

// leave an empty database for the suites that run next
afterAll(async () => {
  await resetDatabase(db);
});

describe("Cancel Subscription Server Action Contract Tests", () => {
  let user: Awaited<ReturnType<typeof createUser>>;
  let activeSubscriptionId: string;

  /** Moves the start of the current billing period `ms` into the past. */
  const startedAgo = (ms: number) =>
    db.subscription.update({
      where: { id: activeSubscriptionId },
      data: { currentPeriodStart: new Date(Date.now() - ms) },
    });

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    stripe.cancelImmediately.mockResolvedValue(true);
    stripe.cancelSubscription.mockResolvedValue(true);
    await resetDatabase(db);

    user = await createUser();
    const subscription = await createSubscription(user.id, {
      priceId: "price_premium_monthly",
      currentPeriodStart: new Date(Date.now() - 10 * DAY), // 10 days ago
      currentPeriodEnd: new Date(Date.now() + 20 * DAY), // 20 days from now
    });
    activeSubscriptionId = subscription.id;

    mockAuthenticatedUser(user.id, user.email);
  });

  describe("Input validation", () => {
    test("accepts valid cancellation with immediate flag", async () => {
      const result = await cancelSubscription({
        reason: "too_expensive",
        immediate: true,
      });

      expect(result.success).toBe(true);
    });

    test("accepts cancellation without a reason", async () => {
      const result = await cancelSubscription({ immediate: false });

      expect(result.success).toBe(true);
    });

    test("rejects an input that does not match the schema", async () => {
      const result = await cancelSubscription({
        reason: 42,
        immediate: "yes",
      } as never);

      expect(result).toMatchObject({
        success: false,
        error: "VALIDATION_ERROR",
      });
      expect(stripe.cancelImmediately).not.toHaveBeenCalled();
      expect(stripe.cancelSubscription).not.toHaveBeenCalled();
    });
  });

  describe("Subscription state validation", () => {
    test("successfully cancels active subscription immediately", async () => {
      const result = await cancelSubscription({
        reason: "not_using",
        immediate: true,
      });

      expect(result.success).toBe(true);
      expect(result.subscription).toBeDefined();
      expect(result.subscription!.status).toBe("CANCELED");
      expect(result.subscription!.cancelAtPeriodEnd).toBe(false);

      const stored = await db.subscription.findUniqueOrThrow({
        where: { id: activeSubscriptionId },
      });
      expect(stored.status).toBe(SubscriptionStatus.CANCELED);
      expect(stripe.cancelImmediately).toHaveBeenCalledTimes(1);
      expect(stripe.cancelImmediately).toHaveBeenCalledWith(
        stored.stripeSubscriptionId
      );
      expect(stripe.cancelSubscription).not.toHaveBeenCalled();
    });

    test("successfully schedules cancellation at period end", async () => {
      const result = await cancelSubscription({
        reason: "too_expensive",
        immediate: false,
      });

      expect(result.success).toBe(true);
      expect(result.subscription).toBeDefined();
      expect(result.subscription!.cancelAtPeriodEnd).toBe(true);
      expect(result.subscription!.currentPeriodEnd).toBeInstanceOf(Date);

      // still ACTIVE: access lasts until the end of the paid period
      const stored = await db.subscription.findUniqueOrThrow({
        where: { id: activeSubscriptionId },
      });
      expect(stored.status).toBe(SubscriptionStatus.ACTIVE);
      expect(stripe.cancelSubscription).toHaveBeenCalledTimes(1);
      expect(stripe.cancelImmediately).not.toHaveBeenCalled();
    });

    test("rejects cancellation when no subscription exists", async () => {
      await db.subscription.delete({ where: { id: activeSubscriptionId } });

      const result = await cancelSubscription({
        reason: "not_using",
        immediate: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("NO_SUBSCRIPTION");
      expect(result.message).toContain("subscription");
      expect(stripe.cancelImmediately).not.toHaveBeenCalled();
    });

    test("rejects cancellation of a subscription that is not active", async () => {
      await db.subscription.update({
        where: { id: activeSubscriptionId },
        data: { status: SubscriptionStatus.PAST_DUE },
      });

      const result = await cancelSubscription({
        reason: "not_using",
        immediate: true,
      });

      expect(result).toMatchObject({
        success: false,
        error: "SUBSCRIPTION_NOT_ACTIVE",
      });
      expect(stripe.cancelImmediately).not.toHaveBeenCalled();
    });

    test("a second cancellation of an already canceled subscription is refused without touching Stripe again", async () => {
      // First cancellation
      const result1 = await cancelSubscription({
        reason: "too_expensive",
        immediate: true,
      });
      expect(result1.success).toBe(true);

      // Second attempt: nothing left to cancel
      const result2 = await cancelSubscription({
        reason: "not_using",
        immediate: true,
      });

      expect(result2).toMatchObject({
        success: false,
        error: "SUBSCRIPTION_NOT_ACTIVE",
      });
      expect(stripe.cancelImmediately).toHaveBeenCalledTimes(1);
      expect(
        (
          await db.subscription.findUniqueOrThrow({
            where: { id: activeSubscriptionId },
          })
        ).status
      ).toBe(SubscriptionStatus.CANCELED);
    });

    test("scheduling the period-end cancellation twice is refused", async () => {
      expect(
        (await cancelSubscription({ immediate: false })).success
      ).toBe(true);

      const again = await cancelSubscription({ immediate: false });

      expect(again).toMatchObject({
        success: false,
        error: "ALREADY_CANCELLED",
      });
      expect(stripe.cancelSubscription).toHaveBeenCalledTimes(1);
    });
  });

  // The refund window is 14 days (terms of sale, billing page, requestRefund)
  describe("Refund eligibility calculation", () => {
    test("calculates refund eligibility for recent subscription", async () => {
      await startedAgo(5 * DAY);

      const result = await cancelSubscription({
        reason: "not_using",
        immediate: true,
      });

      expect(result.success).toBe(true);
      expect(result.refund).toMatchObject({ eligible: true });
      expect(result.subscription!.status).toBe("CANCELED");
      const audit = await db.invoiceAudit.findFirstOrThrow({
        where: { userId: user.id },
      });
      expect(audit.type).toBe("REFUND_ELIGIBLE");
    });

    test("calculates no refund for old subscription (and keeps the paid period)", async () => {
      await startedAgo(20 * DAY);

      const result = await cancelSubscription({
        reason: "too_expensive",
        immediate: true,
      });

      expect(result.success).toBe(true);
      expect(result.refund).toMatchObject({ eligible: false });
      // outside the refund window an "immediate" request only ends the renewal
      expect(result.subscription).toMatchObject({
        status: "ACTIVE",
        cancelAtPeriodEnd: true,
      });
      expect(stripe.cancelImmediately).not.toHaveBeenCalled();
      expect(stripe.cancelSubscription).toHaveBeenCalledTimes(1);
      const audit = await db.invoiceAudit.findFirstOrThrow({
        where: { userId: user.id },
      });
      expect(audit.type).toBe("REFUND_INELIGIBLE");
    });

    test("calculates refund eligibility at exact 14-day boundary", async () => {
      await startedAgo(14 * DAY);

      const result = await cancelSubscription({
        reason: "missing_features",
        immediate: true,
      });

      expect(result.success).toBe(true);
      // at 14 days (and a few ms: the clock moves on) the window is closed
      expect(result.refund!.eligible).toBe(false);
    });

    test("calculates refund eligibility just before 14-day boundary", async () => {
      await startedAgo(14 * DAY - 60 * 60 * 1000); // 14 days minus 1 hour

      const result = await cancelSubscription({
        reason: "other",
        immediate: true,
      });

      expect(result.success).toBe(true);
      expect(result.refund!.eligible).toBe(true);
      expect(result.subscription!.status).toBe("CANCELED");
    });

    test("a period-end cancellation never reports a refund", async () => {
      await startedAgo(3 * DAY);

      const result = await cancelSubscription({ immediate: false });

      // refund eligibility is only evaluated for immediate cancellations
      expect(result.success).toBe(true);
      expect(result.refund).toMatchObject({ eligible: false });
      expect(result.subscription!.cancelAtPeriodEnd).toBe(true);
    });
  });

  describe("Immediate vs period end cancellation", () => {
    test("immediate cancellation stops access immediately", async () => {
      const result = await cancelSubscription({
        reason: "too_expensive",
        immediate: true,
      });

      expect(result.success).toBe(true);
      expect(result.subscription!.status).toBe("CANCELED");
      expect(result.subscription!.cancelAtPeriodEnd).toBe(false);
    });

    test("period end cancellation maintains access until end", async () => {
      const result = await cancelSubscription({
        reason: "not_using",
        immediate: false,
      });

      expect(result.success).toBe(true);
      expect(result.subscription!.status).toBe("ACTIVE");
      expect(result.subscription!.cancelAtPeriodEnd).toBe(true);
      expect(result.subscription!.currentPeriodEnd).toBeInstanceOf(Date);
    });
  });

  describe("Concurrency", () => {
    test("concurrent cancellation attempts leave the subscription canceled and never crash", async () => {
      const results = await Promise.all(
        Array.from({ length: 3 }, () =>
          cancelSubscription({ reason: "too_expensive", immediate: true })
        )
      );

      // at least one request wins; the others either also complete or are
      // refused cleanly, none of them ends in an internal error
      expect(results.some((r) => r.success)).toBe(true);
      results.forEach((result) => {
        expect(result.error).not.toBe("INTERNAL_ERROR");
      });

      const stored = await db.subscription.findUniqueOrThrow({
        where: { id: activeSubscriptionId },
      });
      expect(stored.status).toBe(SubscriptionStatus.CANCELED);
      expect(await db.subscription.count({ where: { userId: user.id } })).toBe(
        1
      );
    });
  });

  describe("Error handling edge cases", () => {
    test("handles unauthenticated user", async () => {
      AuthMock.mockNoAuth();

      const result = await cancelSubscription({
        reason: "too_expensive",
        immediate: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("UNAUTHORIZED");
      expect(stripe.cancelImmediately).not.toHaveBeenCalled();
      expect(
        (
          await db.subscription.findUniqueOrThrow({
            where: { id: activeSubscriptionId },
          })
        ).status
      ).toBe(SubscriptionStatus.ACTIVE);
    });

    test("never cancels the subscription of a different user", async () => {
      const other = await createUser();
      mockAuthenticatedUser(other.id, other.email);

      const result = await cancelSubscription({
        reason: "not_using",
        immediate: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("NO_SUBSCRIPTION");
      expect(
        (
          await db.subscription.findUniqueOrThrow({
            where: { id: activeSubscriptionId },
          })
        ).status
      ).toBe(SubscriptionStatus.ACTIVE);
      expect(stripe.cancelImmediately).not.toHaveBeenCalled();
    });

    test("reports a Stripe failure without changing the subscription", async () => {
      stripe.cancelImmediately.mockRejectedValue(
        new Error("CANCEL_IMMEDIATE_FAILED")
      );

      const result = await cancelSubscription({
        reason: "not_using",
        immediate: true,
      });

      expect(result).toMatchObject({
        success: false,
        error: "INTERNAL_ERROR",
      });
      expect(
        (
          await db.subscription.findUniqueOrThrow({
            where: { id: activeSubscriptionId },
          })
        ).status
      ).toBe(SubscriptionStatus.ACTIVE);
    });
  });

  describe("Response format validation", () => {
    test("success response has correct structure", async () => {
      const result = await cancelSubscription({
        reason: "too_expensive",
        immediate: true,
      });

      expect(result).toMatchObject({
        success: true,
        message: expect.any(String),
        subscription: {
          id: activeSubscriptionId,
          status: expect.any(String),
          cancelAtPeriodEnd: expect.any(Boolean),
          currentPeriodEnd: expect.any(Date),
        },
        refund: {
          eligible: expect.any(Boolean),
          reason: expect.any(String),
        },
      });
    });

    test("error response has correct structure", async () => {
      await db.subscription.delete({ where: { id: activeSubscriptionId } });

      const result = await cancelSubscription({
        reason: "not_using",
        immediate: true,
      });

      expect(result).toMatchObject({
        success: false,
        message: expect.any(String),
        error: expect.any(String),
      });
    });
  });
});
