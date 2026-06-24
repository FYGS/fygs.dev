// TODO: Plan switching and cancellation UI will be implemented when Stripe integration is mature.
// For now, only "Gérer l'abonnement" (portal redirect) is exposed.
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BillingActionsProps {
  currentPriceId?: string | null;
  availablePrices: { id: string; label: string; amount?: number }[];
  subscriptionStatus?: string;
  cancelAtPeriodEnd?: boolean;
  currentCycle?: "monthly" | "yearly" | "unknown";
}

export function BillingActions(props: BillingActionsProps) {
  void props;
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const callManage = async (payload: { action: string }) => {
    try {
      setLoadingAction(payload.action);

      // Handle portal navigation separately
      if (payload.action === "manage_subscription") {
        const response = await fetch("/api/stripe/portal", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create portal session");
        }

        const data = await response.json();
        window.location.href = data.url;
        return;
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erreur";
      toast.error(message);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          disabled={loadingAction === "manage_subscription"}
          onClick={() => callManage({ action: "manage_subscription" })}
          className="border-purple-600 text-purple-400 hover:bg-purple-950"
        >
          {loadingAction === "manage_subscription"
            ? "Redirection..."
            : "Gérer l'abonnement"}
        </Button>
      </div>
    </div>
  );
}
