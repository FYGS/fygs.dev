// Server-side subscription pricing helpers
// Keep Stripe price IDs off the client; expose only presence & classification.

export function getSubscriptionPrices() {
  return {
    monthly: process.env.STRIPE_MONTHLY_PRICE_ID || undefined,
    yearly: process.env.STRIPE_YEARLY_PRICE_ID || undefined,
  };
}

export function classifyBillingCycle(priceId?: string): 'monthly' | 'yearly' | 'unknown' {
  if (!priceId) return 'unknown';
  const { monthly, yearly } = getSubscriptionPrices();
  if (priceId === monthly) return 'monthly';
  if (priceId === yearly) return 'yearly';
  return 'unknown';
}

/**
 * Without `strict`, anything unknown falls back to a default (checkout with no choice). With it, a value that is
 * neither a cycle keyword nor a configured price id is refused: switching plan must never land on another plan
 * because of a typo.
 */
export function resolveRequestedPriceId(
  requested?: string,
  options: { strict?: boolean } = {},
): { priceId: string; cycle: 'monthly' | 'yearly' } {
  const { monthly, yearly } = getSubscriptionPrices();
  if (!monthly && !yearly) throw new Error('SUBSCRIPTION_PRICES_NOT_CONFIGURED');

  // Allow sending semantic cycle keyword instead of raw price id from client
  if (requested === 'monthly' && monthly) return { priceId: monthly, cycle: 'monthly' };
  if (requested === 'yearly' && yearly) return { priceId: yearly, cycle: 'yearly' };

  if (requested && (requested === monthly || requested === yearly)) {
    return { priceId: requested, cycle: requested === yearly ? 'yearly' : 'monthly' };
  }

  if (options.strict) throw new Error('UNKNOWN_PRICE');

  // Default preference: monthly then yearly
  if (monthly) return { priceId: monthly, cycle: 'monthly' };
  return { priceId: yearly as string, cycle: 'yearly' };
}
