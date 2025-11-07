import { SubscriptionPlansWrapper } from "@/app/_components/payment/subscription-plans-wrapper";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { SubscriptionStatus } from "@prisma/client";

// Force dynamic rendering since we need user-specific data
export const dynamic = 'force-dynamic';

export default async function PricingPage() {
  let currentPlan: "free" | "premium" = "free";

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session) {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
          subscriptions: {
            select: { status: true, cancelAtPeriodEnd: true },
          },
        },
      });

      const hasActiveSubscription = user?.subscriptions?.status === SubscriptionStatus.ACTIVE && !user?.subscriptions?.cancelAtPeriodEnd;

      if (hasActiveSubscription) {
        currentPlan = "premium";
      }
    }
  } catch (error) {
    console.error("Error fetching user subscription:", error);
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="container py-16 max-w-6xl mx-auto">
        <SubscriptionPlansWrapper currentPlan={currentPlan} />
      </div>
    </div>
  );
}
