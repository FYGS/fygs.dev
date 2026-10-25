/**
 * Prices and counts as shown everywhere (catalog, course page, billing, paths). An amount is shown exactly as it is
 * charged: "49,99 €", "50 €" for a whole amount, never rounded.
 */

const LOCALE = "fr-FR";

/** Smallest amount Stripe charges in euros; a premium course must cost at least this. */
export const MIN_COURSE_PRICE_EUR = 0.5;

export interface FormatPriceOptions {
  /** ISO currency code, as Stripe returns it ("eur") or upper case. Default EUR. */
  currency?: string;
  /** Show 0 as "Gratuit" (default) instead of "0 €". */
  freeLabel?: string | false;
}

/** "49,99 €", "50 €", "Gratuit". */
export function formatPrice(amount: number | string | { toString(): string } | null | undefined, opts: FormatPriceOptions = {}): string {
  const value = Number(amount ?? 0);
  const { currency = "EUR", freeLabel = "Gratuit" } = opts;
  if ((!Number.isFinite(value) || value === 0) && freeLabel !== false) return freeLabel;
  const whole = Number.isInteger(Math.round(value * 100) / 100);
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

/** Amount in cents (Stripe) as a price. */
export function formatCents(cents: number, currency = "EUR"): string {
  return formatPrice(cents / 100, { currency, freeLabel: false });
}

/** Plain numbers (enrolments, counts): "1 234". */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat(LOCALE).format(n);
}
