/**
 * The subscription an invoice belongs to.
 *
 * Since API version 2025-03-31 (basil) Stripe no longer sends `invoice.subscription`:
 * it lives in `invoice.parent.subscription_details.subscription`. The old field is
 * still read so events created under an older version keep working.
 */
export function getInvoiceSubscriptionId(invoice: unknown): string | null {
  const inv = invoice as {
    subscription?: string | { id?: string } | null;
    parent?: {
      subscription_details?: { subscription?: string | { id?: string } | null } | null;
    } | null;
  };
  const ref = inv.parent?.subscription_details?.subscription ?? inv.subscription ?? null;
  if (!ref) return null;
  return typeof ref === "string" ? ref : (ref.id ?? null);
}
