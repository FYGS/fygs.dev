"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cancelSubscription } from "@/app/[locale]/(main)/dashboard/actions/cancelSubscription";
import { switchSubscriptionPlan } from "@/app/[locale]/(main)/dashboard/actions/switchSubscriptionPlan";

interface BillingActionsProps {
  subscriptionStatus?: string;
  cancelAtPeriodEnd?: boolean;
  /** Formatted end of the current period, shown in the confirmation */
  periodEnd?: string | null;
  /** The billing cycle of the subscription, and the cycles that are configured for sale */
  currentCycle?: "monthly" | "yearly" | "unknown";
  availableCycles?: Array<"monthly" | "yearly">;
}

/** What the user is told when the cancellation did not go through (the server messages are not translated). */
const CANCEL_ERRORS: Record<string, string> = {
  UNAUTHORIZED: "Votre session a expiré, reconnectez-vous.",
  NO_SUBSCRIPTION: "Aucun abonnement trouvé.",
  SUBSCRIPTION_NOT_ACTIVE: "Cet abonnement n'est plus actif.",
  ALREADY_CANCELLED: "L'annulation de cet abonnement est déjà programmée.",
};

/**
 * Subscription management. Plan changes, payment method and resuming a cancelled subscription go through the
 * Stripe customer portal ("Gérer l'abonnement"); the cancellation at the end of the period is handled here.
 */
const SWITCH_ERRORS: Record<string, string> = {
  UNAUTHORIZED: "Votre session a expiré, reconnectez-vous.",
  NO_ACTIVE_SUBSCRIPTION: "Aucun abonnement actif.",
  SAME_PLAN: "Vous êtes déjà sur cette formule.",
  INVALID_PRICE_ID: "Cette formule n'est pas disponible.",
};

const CYCLE_LABEL = { monthly: "mensuelle", yearly: "annuelle" } as const;

export function BillingActions({
  subscriptionStatus,
  cancelAtPeriodEnd,
  periodEnd,
  currentCycle = "unknown",
  availableCycles = [],
}: BillingActionsProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<"portal" | "cancel" | "switch" | null>(null);

  const openPortal = async () => {
    try {
      setLoadingAction("portal");
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Impossible d'ouvrir le portail de facturation");
      }
      const data = await response.json();
      window.location.href = data.url;
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur");
      setLoadingAction(null);
    }
  };

  const cancelAtEndOfPeriod = async () => {
    setLoadingAction("cancel");
    try {
      const result = await cancelSubscription({ immediate: false });
      if (result.success) {
        toast.success("Annulation programmée : vous gardez l'accès jusqu'à la fin de la période.");
        router.refresh();
      } else {
        toast.error(CANCEL_ERRORS[result.error ?? ""] ?? "L'annulation a échoué, réessayez plus tard.");
      }
    } catch {
      toast.error("L'annulation a échoué, réessayez plus tard.");
    } finally {
      setLoadingAction(null);
    }
  };

  const switchTo = async (cycle: "monthly" | "yearly") => {
    setLoadingAction("switch");
    try {
      const result = await switchSubscriptionPlan({ newPriceId: cycle });
      if (result.success) {
        toast.success(`Formule ${CYCLE_LABEL[cycle]} activée.`);
        router.refresh();
      } else {
        toast.error(SWITCH_ERRORS[result.error ?? ""] ?? "Le changement de formule a échoué, réessayez plus tard.");
      }
    } catch {
      toast.error("Le changement de formule a échoué, réessayez plus tard.");
    } finally {
      setLoadingAction(null);
    }
  };

  // A trial is a running subscription too: it can be stopped or switched the same way
  const canCancel = (subscriptionStatus === "ACTIVE" || subscriptionStatus === "TRIALING") && !cancelAtPeriodEnd;
  // the other cycle, when it is on sale and we know which one the subscription is on
  const otherCycle = currentCycle === "monthly" ? "yearly" : currentCycle === "yearly" ? "monthly" : null;
  const canSwitch = canCancel && otherCycle !== null && availableCycles.includes(otherCycle);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          disabled={loadingAction !== null}
          onClick={openPortal}
        >
          {loadingAction === "portal" ? "Redirection..." : "Gérer l'abonnement"}
        </Button>

        {canSwitch && otherCycle && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={loadingAction !== null}>
                Passer à la formule {CYCLE_LABEL[otherCycle]}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Passer à la formule {CYCLE_LABEL[otherCycle]} ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Le changement s&apos;applique tout de suite. Stripe calcule le prorata : le temps déjà payé de votre formule actuelle est déduit de la
                  prochaine facture.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Rester sur la formule actuelle</AlertDialogCancel>
                <AlertDialogAction onClick={() => switchTo(otherCycle)}>Confirmer le changement</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {canCancel && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={loadingAction !== null} className="border-destructive text-destructive hover:bg-destructive/10">
                Annuler l&apos;abonnement
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Annuler votre abonnement ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Vous gardez l&apos;accès Premium jusqu&apos;au {periodEnd ?? "la fin de la période en cours"}, puis l&apos;abonnement
                  s&apos;arrête sans nouveau prélèvement. Vous pourrez le reprendre depuis « Gérer l&apos;abonnement ».
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Garder mon abonnement</AlertDialogCancel>
                <AlertDialogAction onClick={cancelAtEndOfPeriod}>Confirmer l&apos;annulation</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      {cancelAtPeriodEnd && (
        <p className="text-sm text-muted-foreground">
          Pour reprendre votre abonnement avant la fin de la période, utilisez « Gérer l&apos;abonnement ».
        </p>
      )}
    </div>
  );
}
