import type Stripe from "stripe";
import { db } from "@/lib/db";
import { SubscriptionPlan, SubscriptionStatus } from "@/lib/generated/prisma/browser";
import { writeAudit } from "@/lib/audit";
import { createLogger } from "@/lib/structured-logger";
import { mapStripeSubscriptionStatus } from "@/lib/stripe-subscription-status";
import { getSubscriptionPeriod, stripeRefId } from "@/lib/stripe-shapes";
import { classifyBillingCycle, isPlanPriceId } from "@/lib/subscription-pricing";
import { withPurchaseLock } from "./locks";

/**
 * The one place that writes the local copy of a Stripe subscription. Three webhook paths used to write it (checkout
 * completed, subscription created/updated, invoice paid), each trusting its own payload; now they all go through here
 * with the state they just read from Stripe, and these rules hold for every write:
 *
 *  - Plans only: a subscription on a price that is not one of the two Premium plans grants nothing.
 *  - One subscription per user: a second ACTIVE one (two checkouts in parallel) is a duplicate to cancel, not a state
 *    to store; an old cancelled subscription never overwrites the current one, and the current one is replaced only
 *    when it is over (CANCELED/INCOMPLETE).
 *  - Order: `lastEventAt` is the moment the stored state was last confirmed with Stripe. A state confirmed earlier is
 *    stale and ignored, so a retried old event cannot bring a cancelled subscription back to life.
 *  - Serialised with the user's other money operations (checkout, refund) by the purchase lock.
 */

export interface SubscriptionStateInput {
  userId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string | null;
  status: SubscriptionStatus;
  priceId: string | null;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  /** When this state was read from Stripe. */
  confirmedAt: Date;
}

export type ApplyOutcome =
  | "applied"
  /** A newer state is already stored. */
  | "stale"
  /** Belongs to a subscription that is not the user's current one (an old cancelled subscription, for instance). */
  | "foreign_subscription"
  /** Not one of the two Premium plans. */
  | "unknown_price"
  /** The user already has another running subscription: this one is a duplicate. */
  | "duplicate_active";

const RUNNING = new Set<SubscriptionStatus>([SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING, SubscriptionStatus.PAST_DUE]);
const REPLACEABLE = new Set<SubscriptionStatus>([SubscriptionStatus.CANCELED, SubscriptionStatus.INCOMPLETE]);

const log = createLogger({ operation: "subscription-state", resourceType: "subscription" });

export async function applySubscriptionState(input: SubscriptionStateInput): Promise<ApplyOutcome> {
  if (!isPlanPriceId(input.priceId)) {
    log.error("Subscription on a price that is not a Premium plan: nothing granted", {
      userId: input.userId,
      resourceId: input.stripeSubscriptionId,
      metadata: { priceId: input.priceId },
    });
    return "unknown_price";
  }

  return withPurchaseLock(input.userId, null, async (tx) => {
    const existing = await tx.subscription.findUnique({ where: { userId: input.userId } });
    const data = {
      stripeSubscriptionId: input.stripeSubscriptionId,
      stripeCustomerId: input.stripeCustomerId,
      status: input.status,
      priceId: input.priceId,
      plan: SubscriptionPlan.PREMIUM,
      currentPeriodStart: input.currentPeriodStart,
      currentPeriodEnd: input.currentPeriodEnd,
      cancelAtPeriodEnd: input.cancelAtPeriodEnd,
      lastEventAt: input.confirmedAt,
    };

    if (!existing) {
      await tx.subscription.create({ data: { userId: input.userId, ...data } });
      return "applied";
    }

    const sameSubscription = !existing.stripeSubscriptionId || existing.stripeSubscriptionId === input.stripeSubscriptionId;
    if (!sameSubscription) {
      const incomingRunning = RUNNING.has(input.status) || input.status === SubscriptionStatus.INCOMPLETE;
      if (REPLACEABLE.has(existing.status)) {
        // The stored one is over: the user subscribed again. An old cancelled subscription must not replace anything.
        if (!incomingRunning) return "foreign_subscription";
      } else {
        return incomingRunning ? "duplicate_active" : "foreign_subscription";
      }
    } else if (existing.lastEventAt && input.confirmedAt.getTime() < existing.lastEventAt.getTime()) {
      return "stale";
    }

    await tx.subscription.update({ where: { userId: input.userId }, data });
    return "applied";
  });
}

/** What a subscription object of Stripe says, in the shape stored locally. */
export function subscriptionStateFromStripe(
  userId: string,
  subscription: Stripe.Subscription,
  confirmedAt: Date = new Date(),
): SubscriptionStateInput {
  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.id ?? ((subscription as unknown as { plan?: { id?: string } }).plan?.id ?? null);
  const { status } = mapStripeSubscriptionStatus(subscription.status);
  const period = getSubscriptionPeriod(subscription);
  const legacy = subscription as unknown as { billing_cycle_anchor?: number; start_date?: number };
  const nowSeconds = Math.floor(confirmedAt.getTime() / 1000);
  const yearly = classifyBillingCycle(priceId ?? undefined) === "yearly" || item?.price?.recurring?.interval === "year";
  const start = period.start || legacy.billing_cycle_anchor || legacy.start_date || nowSeconds;
  const end = period.end || nowSeconds + (yearly ? 365 : 30) * 24 * 60 * 60;
  return {
    userId,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: stripeRefId(subscription.customer),
    status,
    priceId,
    currentPeriodStart: new Date(start * 1000),
    currentPeriodEnd: new Date(end * 1000),
    cancelAtPeriodEnd: !!subscription.cancel_at_period_end,
    confirmedAt,
  };
}

/** The Stripe operations a duplicate needs; the payment service provides them. */
export interface DuplicateCleanup {
  cancelImmediately(subscriptionId: string, options?: { idempotencyKey?: string }): Promise<boolean>;
  getLatestSubscriptionPayment(subscriptionId: string): Promise<{ paymentIntentId: string; amountPaidCents: number } | null>;
  refundPayment(paymentIntentId: string, amountCents?: number, options?: { idempotencyKey?: string }): Promise<string>;
}

/**
 * A second subscription the user paid for while another one runs (two checkouts opened in parallel, both completed):
 * stop it and give the money back, so the card is not billed twice every month. Never throws: the webhook still
 * succeeds, and a failure is logged and audited for a human to finish.
 */
export async function cancelDuplicateSubscription(
  stripeService: DuplicateCleanup,
  userId: string,
  duplicateId: string,
): Promise<void> {
  let refundId: string | null = null;
  try {
    const payment = await stripeService.getLatestSubscriptionPayment(duplicateId);
    if (payment && payment.amountPaidCents > 0) {
      refundId = await stripeService.refundPayment(payment.paymentIntentId, payment.amountPaidCents, {
        idempotencyKey: `duplicate-refund:${duplicateId}`,
      });
    }
    await stripeService.cancelImmediately(duplicateId, { idempotencyKey: `duplicate-cancel:${duplicateId}` });
    await writeAudit({
      actorId: null,
      action: "subscription.canceled",
      targetType: "subscription",
      targetId: duplicateId,
      metadata: { reason: "duplicate_subscription", userId, refundId },
    });
    log.warn("Duplicate subscription cancelled and refunded", { userId, resourceId: duplicateId, metadata: { refundId } });
  } catch (error) {
    log.error("Duplicate subscription could not be cancelled: to finish by hand", {
      userId,
      resourceId: duplicateId,
      metadata: { error: error instanceof Error ? error.message : String(error), refundId },
    });
  }
}

/** Marks the stored subscription cancelled, only if it is the one that Stripe ended. */
export async function applySubscriptionEnded(
  stripeSubscriptionId: string,
  endedAt: Date = new Date(),
): Promise<"applied" | "not_current"> {
  const row = await db.subscription.findFirst({ where: { stripeSubscriptionId }, select: { userId: true } });
  if (!row) return "not_current"; // an old subscription of someone who subscribed again: the current one stays
  const { count } = await db.subscription.updateMany({
    where: { stripeSubscriptionId },
    data: { status: SubscriptionStatus.CANCELED, cancelAtPeriodEnd: false, currentPeriodEnd: endedAt, lastEventAt: endedAt },
  });
  return count > 0 ? "applied" : "not_current";
}
