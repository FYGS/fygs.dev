import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { SubscriptionStatus } from "@/lib/generated/prisma/client";
import {
  applySubscriptionEnded,
  applySubscriptionState,
  cancelDuplicateSubscription,
  subscriptionStateFromStripe,
} from "@/lib/payments/subscription-state";
import { resetDatabase } from "../../support/test-db";
import { createUser } from "../../support/factories";
import { configurePlanPrices, MONTHLY_PRICE, stripeSubscription, YEARLY_PRICE } from "../../support/stripe-objects";

beforeEach(async () => {
  await resetDatabase(db);
  configurePlanPrices();
});
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

const T = (minutes: number) => new Date(Date.UTC(2030, 0, 1, 10, minutes));

async function state(userId: string, over: Parameters<typeof stripeSubscription>[0], at: Date) {
  return subscriptionStateFromStripe(userId, stripeSubscription({ userId, ...over }), at);
}

describe("the stored subscription follows Stripe's state, under the central rules", () => {
  it("stores a Premium subscription, and nothing for a price that is not a Premium plan", async () => {
    const user = await createUser();
    expect(await applySubscriptionState(await state(user.id, { id: "sub_x", priceId: "price_someone_elses" }, T(0)))).toBe(
      "unknown_price",
    );
    expect(await db.subscription.findUnique({ where: { userId: user.id } })).toBeNull();

    expect(await applySubscriptionState(await state(user.id, { id: "sub_a", priceId: YEARLY_PRICE }, T(1)))).toBe("applied");
    expect(await db.subscription.findUnique({ where: { userId: user.id } })).toMatchObject({
      stripeSubscriptionId: "sub_a",
      status: SubscriptionStatus.ACTIVE,
      priceId: YEARLY_PRICE,
      plan: "PREMIUM",
    });
  });

  it("a state confirmed earlier than the stored one is stale: a cancelled subscription is never brought back to life", async () => {
    const user = await createUser();
    await applySubscriptionState(await state(user.id, { id: "sub_a", status: "active" }, T(0)));
    expect(await applySubscriptionState(await state(user.id, { id: "sub_a", status: "canceled" }, T(10)))).toBe("applied");

    // a retried 'active' state, read before the cancellation, arrives late
    expect(await applySubscriptionState(await state(user.id, { id: "sub_a", status: "active" }, T(5)))).toBe("stale");
    expect((await db.subscription.findUniqueOrThrow({ where: { userId: user.id } })).status).toBe(SubscriptionStatus.CANCELED);
  });

  it("a second running subscription is a duplicate, an old cancelled one is foreign: the current one is untouched", async () => {
    const user = await createUser();
    await applySubscriptionState(await state(user.id, { id: "sub_current" }, T(0)));

    expect(await applySubscriptionState(await state(user.id, { id: "sub_second" }, T(1)))).toBe("duplicate_active");
    expect(await applySubscriptionState(await state(user.id, { id: "sub_old", status: "canceled" }, T(2)))).toBe(
      "foreign_subscription",
    );
    expect(await db.subscription.findUniqueOrThrow({ where: { userId: user.id } })).toMatchObject({
      stripeSubscriptionId: "sub_current",
      status: SubscriptionStatus.ACTIVE,
    });
  });

  it("someone who cancelled and subscribes again gets the new subscription stored", async () => {
    const user = await createUser();
    await applySubscriptionState(await state(user.id, { id: "sub_old" }, T(0)));
    await applySubscriptionEnded("sub_old", T(5));

    expect(await applySubscriptionState(await state(user.id, { id: "sub_new" }, T(10)))).toBe("applied");
    expect(await db.subscription.findUniqueOrThrow({ where: { userId: user.id } })).toMatchObject({
      stripeSubscriptionId: "sub_new",
      status: SubscriptionStatus.ACTIVE,
    });
  });

  it("the end of an OLD subscription does not cancel the current one", async () => {
    const user = await createUser();
    await applySubscriptionState(await state(user.id, { id: "sub_old" }, T(0)));
    await applySubscriptionEnded("sub_old", T(5));
    await applySubscriptionState(await state(user.id, { id: "sub_new" }, T(10)));

    expect(await applySubscriptionEnded("sub_old", T(20))).toBe("not_current");
    expect((await db.subscription.findUniqueOrThrow({ where: { userId: user.id } })).status).toBe(SubscriptionStatus.ACTIVE);
    expect(await applySubscriptionEnded("sub_new", T(30))).toBe("applied");
    expect((await db.subscription.findUniqueOrThrow({ where: { userId: user.id } })).status).toBe(SubscriptionStatus.CANCELED);
  });

  it("two checkouts completed at once: exactly one subscription is stored, the other is the duplicate", async () => {
    const user = await createUser();
    const outcomes = await Promise.all([
      applySubscriptionState(await state(user.id, { id: "sub_p1", priceId: MONTHLY_PRICE }, T(0))),
      applySubscriptionState(await state(user.id, { id: "sub_p2", priceId: MONTHLY_PRICE }, T(0))),
      applySubscriptionState(await state(user.id, { id: "sub_p3", priceId: YEARLY_PRICE }, T(0))),
    ]);
    expect(outcomes.filter((o) => o === "applied")).toHaveLength(1);
    expect(outcomes.filter((o) => o === "duplicate_active")).toHaveLength(2);
    expect(await db.subscription.count({ where: { userId: user.id } })).toBe(1);
  });

  it("an unpaid or unknown Stripe status never opens access", async () => {
    const user = await createUser();
    await applySubscriptionState(await state(user.id, { id: "sub_a", status: "unpaid" }, T(0)));
    expect((await db.subscription.findUniqueOrThrow({ where: { userId: user.id } })).status).toBe(SubscriptionStatus.PAST_DUE);
    await applySubscriptionState(await state(user.id, { id: "sub_a", status: "mystery" }, T(1)));
    expect((await db.subscription.findUniqueOrThrow({ where: { userId: user.id } })).status).toBe(SubscriptionStatus.PAST_DUE);
  });
});

describe("a duplicate subscription is cancelled and refunded", () => {
  it("refunds its paid invoice, then cancels it", async () => {
    const calls: string[] = [];
    const service = {
      getLatestSubscriptionPayment: vi.fn(async () => ({ paymentIntentId: "pi_dup", amountPaidCents: 1999 })),
      refundPayment: vi.fn(async () => (calls.push("refund"), "re_1")),
      cancelImmediately: vi.fn(async () => (calls.push("cancel"), true)),
    };
    await cancelDuplicateSubscription(service, "user_1", "sub_dup");
    expect(calls).toEqual(["refund", "cancel"]);
    expect(service.refundPayment).toHaveBeenCalledWith("pi_dup", 1999, { idempotencyKey: "duplicate-refund:sub_dup" });
    expect(await db.auditLog.findFirst({ where: { action: "subscription.canceled", targetId: "sub_dup" } })).toMatchObject({
      metadata: { reason: "duplicate_subscription", refundId: "re_1" },
    });
  });

  it("never throws: a Stripe failure is logged for a human to finish", async () => {
    const service = {
      getLatestSubscriptionPayment: vi.fn(async () => {
        throw new Error("stripe down");
      }),
      refundPayment: vi.fn(),
      cancelImmediately: vi.fn(),
    };
    await expect(cancelDuplicateSubscription(service, "user_1", "sub_dup")).resolves.toBeUndefined();
    expect(service.cancelImmediately).not.toHaveBeenCalled();
  });
});
