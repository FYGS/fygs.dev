import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isSubscriptionActive } from "@/lib/access/entitlement";
import { getPlanPrices } from "@/lib/payments/plan-prices";
import { classifyBillingCycle } from "@/lib/subscription-pricing";
import { REFUND_WINDOW_DAYS } from "@/lib/refund-policy";
import { SubscriptionPlans, type PlanViewerState } from "./subscription-plans";

/** The plans with the real Stripe prices and where the visitor stands (subscribed, ending, past due...). */
export async function SubscriptionPlansWrapper() {
  const [session, prices, premiumCourses] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getPlanPrices(),
    db.course.count({ where: { published: true, accessTier: "PREMIUM" } }),
  ]);

  let state: PlanViewerState = session ? "free" : "anonymous";
  let currentCycle: "monthly" | "yearly" | "unknown" = "unknown";
  if (session) {
    const subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
      select: { status: true, cancelAtPeriodEnd: true, priceId: true },
    });
    if (subscription) {
      currentCycle = classifyBillingCycle(subscription.priceId ?? undefined);
      if (isSubscriptionActive(subscription)) state = subscription.cancelAtPeriodEnd ? "ending" : "premium";
      else if (subscription.status === "PAST_DUE") state = "past_due";
    }
  }

  return (
    <SubscriptionPlans
      state={state}
      monthly={prices.monthly}
      yearly={prices.yearly}
      defaultCycle={currentCycle === "yearly" ? "yearly" : "monthly"}
      premiumCourses={premiumCourses}
      refundDays={REFUND_WINDOW_DAYS}
    />
  );
}
