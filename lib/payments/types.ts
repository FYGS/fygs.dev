export interface PaymentProduct {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  currency: string;
  type: "course" | "subscription" | "bundle";
  metadata?: Record<string, string>;
}

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
