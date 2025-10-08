import { Metadata } from "next";
import { SubscriptionPlansWrapper } from "@/app/_components/payment/subscription-plans-wrapper";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Tarifs | FYGS Learning Platform",
  description: "Choisissez le plan qui vous convient pour accéder à nos formations premium.",
};

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
            select: { status: true },
          },
        },
      });

      const hasActiveSubscription = user?.subscriptions.some(
        (sub) => sub.status === "ACTIVE"
      );

      if (hasActiveSubscription) {
        currentPlan = "premium";
      }
    }
  } catch (error) {
    console.error("Error fetching user subscription:", error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container py-16 max-w-6xl mx-auto">
        <SubscriptionPlansWrapper currentPlan={currentPlan} />
      </div>
    </div>
  );
}
