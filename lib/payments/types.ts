export interface CheckoutSessionData {
  productId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  discountCode?: string;
  /**
   * Makes a repeated call return the same Checkout Session (two clicks, two tabs) instead of creating a second one.
   * Must change when the parameters change (Stripe refuses a key reused with other parameters).
   */
  idempotencyKey?: string;
}

export interface SubscriptionData {
  userId: string;
  customerEmail: string;
  /** The Stripe customer of this user, when there is one: one customer per person, not one per checkout. */
  customerId?: string;
  idempotencyKey?: string;
  priceId: string; // monthly or yearly Stripe price id
  successUrl: string;
  cancelUrl: string;
}
