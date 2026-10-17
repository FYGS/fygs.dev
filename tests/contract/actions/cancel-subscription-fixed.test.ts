import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { db } from "@/lib/db";
import { cancelSubscription } from "@/app/[locale]/(main)/dashboard/actions/cancelSubscription";
import { createTestEnvironment } from "../../utils/test-database";
import { mockAuthenticatedUser, AuthMock } from "../../utils/auth-mock";

describe("Cancel Subscription Server Action Fixed Tests", () => {
  const testEnv = createTestEnvironment();
  let testUserId: string;
  let activeSubscriptionId: string;

  beforeEach(async () => {
    // Create test user with unique email
    const uniqueEmail = `cancel-test-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}@example.com`;
    const user = await db.user.create({
      data: {
        email: uniqueEmail,
        name: "Cancel Test User",
        emailVerified: true,
      },
    });
    testUserId = user.id;
    testEnv.trackUser(testUserId);

    // Create active subscription
    const subscription = await db.subscription.create({
      data: {
        userId: testUserId,
        status: "ACTIVE",
        plan: "PREMIUM",
        currentPeriodStart: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        stripeSubscriptionId: `sub_test_${Date.now()}`,
      },
    });
    activeSubscriptionId = subscription.id;

    // Mock authentication for this specific user
    mockAuthenticatedUser(testUserId, uniqueEmail);
  });

  afterEach(async () => {
    AuthMock.clearMocks();
    await testEnv.cleanup();
  });

  test("successfully cancels active subscription immediately", async () => {
    const result = await cancelSubscription({
      reason: "not_using",
      immediate: true,
    });

    expect(result.success).toBe(true);
    expect(result.subscription).toBeDefined();
    expect(result.subscription!.status).toBe("CANCELED");
    expect(result.subscription!.cancelAtPeriodEnd).toBe(false);
  });

  test("rejects cancellation when no active subscription exists", async () => {
    // Delete the subscription to simulate no active subscription
    await db.subscription.delete({ where: { id: activeSubscriptionId } });

    const result = await cancelSubscription({
      reason: "not_using",
      immediate: true,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.message).toContain("subscription");
  });

  test("handles unauthenticated user", async () => {
    // Clear current auth and mock unauthenticated state
    AuthMock.clearMocks();
    AuthMock.mockNoAuth();

    const result = await cancelSubscription({
      reason: "too_expensive",
      immediate: true,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("UNAUTHORIZED");
  });
});
