import { stripe } from "@/lib/stripe";
import { stripeRefId, type StripeRef } from "@/lib/stripe-shapes";

/**
 * The references under which a payment of ours may be stored for a Stripe PaymentIntent: the PaymentIntent id (a
 * course bought on its own), and the id of the invoice it paid (a subscription payment is keyed by invoice, see
 * lib/payments/settle.ts). Since API version 2025-03-31 a charge no longer names its invoice, so the invoice is looked
 * up through the invoice payments of the PaymentIntent. A failed lookup only narrows the references to the PaymentIntent.
 */
export async function paymentReferencesFor(paymentIntent: StripeRef): Promise<string[]> {
  const paymentIntentId = stripeRefId(paymentIntent);
  if (!paymentIntentId) return [];
  const references = [paymentIntentId];
  try {
    const found = await stripe.invoicePayments.list({
      payment: { type: "payment_intent", payment_intent: paymentIntentId },
      limit: 1,
    });
    const invoiceId = stripeRefId(found.data[0]?.invoice as StripeRef);
    if (invoiceId) references.push(invoiceId);
  } catch {
    // keep the PaymentIntent reference only
  }
  return references;
}
