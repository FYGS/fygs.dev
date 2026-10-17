/**
 * Accessors for Stripe fields whose location depends on the API version, so the
 * same code reads webhook payloads from an endpoint that is still on an older
 * version and objects fetched by the SDK on its current default version.
 */

/** A Stripe reference: an id, an expanded object, or nothing. */
export type StripeRef = string | { id?: string | null } | null | undefined;

/** The id behind a reference, whether or not it was expanded. */
export function stripeRefId(ref: StripeRef): string | null {
  if (!ref) return null;
  return typeof ref === "string" ? ref : (ref.id ?? null);
}

type PeriodCarrier = {
  current_period_start?: number | null;
  current_period_end?: number | null;
};

type SubscriptionLike = PeriodCarrier & {
  items?: { data?: PeriodCarrier[] | null } | null;
};

/**
 * Current billing period of a subscription, in unix seconds.
 *
 * Since API version 2025-03-31 (basil) `current_period_start/end` live on each
 * subscription item (a subscription can hold items with different periods); before
 * that they were on the subscription itself. The first item wins, then the legacy
 * root fields. A missing bound is `undefined`: callers pick their own fallback.
 */
export function getSubscriptionPeriod(subscription: unknown): {
  start: number | undefined;
  end: number | undefined;
} {
  const sub = (subscription ?? {}) as SubscriptionLike;
  const item = sub.items?.data?.[0];
  return {
    start: item?.current_period_start || sub.current_period_start || undefined,
    end: item?.current_period_end || sub.current_period_end || undefined,
  };
}
