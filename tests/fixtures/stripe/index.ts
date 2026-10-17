/**
 * Real Stripe payloads recorded in TEST mode (ids, emails, urls and account
 * details replaced by stable placeholders) and helpers to derive the shapes an
 * older API version sends.
 *
 * - `event.*`: webhook events as delivered, rendered at API version 2025-08-27.basil
 *   (the version of the test account / endpoint when they were recorded).
 * - `api.*`: objects returned by the SDK on its default version (2026-09-30.endive).
 *
 * Recorded with throwaway scripts against a Stripe TEST account (the flows of
 * scripts/stripe-smoke.mjs, plus a headless browser paying hosted Checkout with the
 * 4242 test card). No secret, real id or personal data may land here.
 */
import checkoutPaymentEvent from "./event.checkout.session.completed.payment.json";
import checkoutFreeEvent from "./event.checkout.session.completed.payment-free.json";
import checkoutSubscriptionEvent from "./event.checkout.session.completed.subscription.json";
import subscriptionCreatedEvent from "./event.customer.subscription.created.json";
import subscriptionUpdatedEvent from "./event.customer.subscription.updated.cancel-at-period-end.json";
import subscriptionDeletedEvent from "./event.customer.subscription.deleted.json";
import invoiceSucceededEvent from "./event.invoice.payment_succeeded.subscription-create.json";
import invoiceFailedEvent from "./event.invoice.payment_failed.json";
import chargeRefundedEvent from "./event.charge.refunded.json";
import subscriptionRetrieved from "./api.subscription.retrieve.expanded.json";
import invoiceRetrieved from "./api.invoice.retrieve.json";
import invoicePaymentsList from "./api.invoice-payments.list.json";
import invoicePreview from "./api.invoice.create-preview.json";
import refundCreated from "./api.refund.create.json";
import checkoutSubscriptionCreated from "./api.checkout-session.create.subscription.json";
import checkoutPaymentCreated from "./api.checkout-session.create.payment.json";
import portalSessionCreated from "./api.billing-portal-session.create.json";

type Json = Record<string, any>;

export const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

export const fixtures = {
  checkoutPaymentEvent,
  checkoutFreeEvent,
  checkoutSubscriptionEvent,
  subscriptionCreatedEvent,
  subscriptionUpdatedEvent,
  subscriptionDeletedEvent,
  invoiceSucceededEvent,
  invoiceFailedEvent,
  chargeRefundedEvent,
  subscriptionRetrieved,
  invoiceRetrieved,
  invoicePaymentsList,
  invoicePreview,
  refundCreated,
  checkoutSubscriptionCreated,
  checkoutPaymentCreated,
  portalSessionCreated,
};

/** Subscription as sent before API 2025-03-31: periods on the subscription itself. */
export function toLegacySubscription<T>(subscription: T): T {
  const sub = clone(subscription) as Json;
  const item = sub.items?.data?.[0];
  if (item) {
    sub.current_period_start = item.current_period_start;
    sub.current_period_end = item.current_period_end;
    for (const it of sub.items.data) {
      delete it.current_period_start;
      delete it.current_period_end;
    }
  }
  return sub as T;
}

/** Invoice as sent before API 2025-03-31: `subscription` at the root, no `parent`. */
export function toLegacyInvoice<T>(invoice: T): T {
  const inv = clone(invoice) as Json;
  inv.subscription = inv.parent?.subscription_details?.subscription ?? null;
  delete inv.parent;
  return inv as T;
}

/** The same event as an endpoint still on a pre-basil API version would send it. */
export function toLegacyEvent<T extends Json>(event: T): T {
  const evt = clone(event) as Json;
  const type: string = evt.type;
  if (type.startsWith("invoice.")) evt.data.object = toLegacyInvoice(evt.data.object);
  else if (type.startsWith("customer.subscription.")) {
    evt.data.object = toLegacySubscription(evt.data.object);
  }
  evt.api_version = "2024-06-20";
  return evt as T;
}
