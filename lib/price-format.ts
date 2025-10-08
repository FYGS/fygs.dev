// Centralized price & currency formatting utilities
// Keep presentation logic consistent across components (cards, analytics, payment forms)

const EURO_LOCALE = 'fr-FR';
const EURO_CURRENCY = 'EUR';

export interface FormatPriceOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  showFreeLabel?: boolean; // if true, 0 becomes 'Gratuit'
  freeLabel?: string;
}

export function formatPrice(amount: number, opts: FormatPriceOptions = {}) {
  const {
    currency = EURO_CURRENCY,
    locale = EURO_LOCALE,
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    showFreeLabel = true,
    freeLabel = 'Gratuit',
  } = opts;

  if (amount === 0 && showFreeLabel) return freeLabel;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

// Lightweight formatter for plain numbers (enrollments, counts, etc.)
export function formatNumber(n: number, locale: string = EURO_LOCALE) {
  return new Intl.NumberFormat(locale).format(n);
}

// Shorthand specifically for euro amounts without decimals (e.g., 49€)
export function formatEuro(amount: number) {
  if (amount === 0) return 'Gratuit';
  return `${Math.round(amount)}€`;
}

// Attempt to parse a price string back to number (best effort)
export function parsePriceToNumber(input: string): number | null {
  if (!input) return null;
  const cleaned = input
    .replace(/[^0-9,\.]/g, '')
    .replace(',', '.');
  const num = Number.parseFloat(cleaned);
  return Number.isFinite(num) ? num : null;
}

export const priceFormat = { formatPrice, formatNumber, formatEuro, parsePriceToNumber };
