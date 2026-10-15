import { SubscriptionStatus } from "@prisma/client";

const STATUS_MAP: Record<string, SubscriptionStatus> = {
  active: SubscriptionStatus.ACTIVE,
  trialing: SubscriptionStatus.TRIALING,
  incomplete: SubscriptionStatus.INCOMPLETE,
  past_due: SubscriptionStatus.PAST_DUE,
  // Not paid: the subscription still exists in Stripe but must not grant access.
  unpaid: SubscriptionStatus.PAST_DUE,
  paused: SubscriptionStatus.PAST_DUE,
  canceled: SubscriptionStatus.CANCELED,
  incomplete_expired: SubscriptionStatus.CANCELED,
};

/**
 * Map a Stripe subscription status to ours. Access is granted only for ACTIVE,
 * so an unknown status fails closed (PAST_DUE) instead of granting access.
 */
export function mapStripeSubscriptionStatus(status: string): {
  status: SubscriptionStatus;
  known: boolean;
} {
  const mapped = STATUS_MAP[status];
  return mapped
    ? { status: mapped, known: true }
    : { status: SubscriptionStatus.PAST_DUE, known: false };
}
