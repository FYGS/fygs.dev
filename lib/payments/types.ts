export interface CheckoutSessionData {
  productId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  discountCode?: string;
}

export interface SubscriptionData {
  userId: string;
  customerEmail: string;
  priceId: string; // monthly or yearly Stripe price id
  successUrl: string;
  cancelUrl: string;
}
