import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
  typescript: true,
});

export const getStripe = () => {
  if (typeof window === "undefined") return null;
  
  const stripePromise = import("@stripe/stripe-js").then(({ loadStripe }) =>
    loadStripe(process.env.STRIPE_PUBLISHABLE_KEY!)
  );
  
  return stripePromise;
};
