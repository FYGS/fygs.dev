import type { Metadata } from "next";
import { SubscriptionPlansWrapper } from "@/app/_components/payment/subscription-plans-wrapper";

export const metadata: Metadata = {
  title: "Formules et abonnement | FYGS",
  description: "Formations gratuites pour tous, abonnement Premium pour tout le catalogue, ou achat d’une formation à l’unité.",
};

// The plans depend on the visitor (subscribed or not)
export const dynamic = "force-dynamic";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="container mx-auto max-w-6xl py-16">
        <SubscriptionPlansWrapper />
      </div>
    </div>
  );
}
