import { unstable_cache } from "next/cache";
import { stripe } from "@/lib/stripe";
import { getSubscriptionPrices } from "@/lib/subscription-pricing";

export interface PlanPrice {
  cycle: "monthly" | "yearly";
  /** In the currency's main unit (29.9, not 2990). */
  amount: number;
  currency: string;
}

/**
 * The prices of the Premium plans as Stripe will charge them, read from the configured Stripe prices (cached for an
 * hour). A plan whose price cannot be read is `null`: the page then shows no figure rather than an invented one.
 */
export const getPlanPrices = unstable_cache(
  async (): Promise<{ monthly: PlanPrice | null; yearly: PlanPrice | null }> => {
    const ids = getSubscriptionPrices();
    const read = async (cycle: "monthly" | "yearly"): Promise<PlanPrice | null> => {
      const id = ids[cycle];
      if (!id) return null;
      try {
        const price = await stripe.prices.retrieve(id);
        if (!price.active || price.unit_amount === null) return null;
        return { cycle, amount: price.unit_amount / 100, currency: price.currency };
      } catch {
        return null;
      }
    };
    const [monthly, yearly] = await Promise.all([read("monthly"), read("yearly")]);
    return { monthly, yearly };
  },
  ["premium-plan-prices"],
  { revalidate: 3600 },
);
