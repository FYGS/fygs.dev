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

interface BillingActionsProps {
  subscriptionStatus?: string;
  cancelAtPeriodEnd?: boolean;
  /** Formatted end of the current period, shown in the confirmation */
  periodEnd?: string | null;
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
export function BillingActions({ subscriptionStatus, cancelAtPeriodEnd, periodEnd }: BillingActionsProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<"portal" | "cancel" | null>(null);

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

  const canCancel = subscriptionStatus === "ACTIVE" && !cancelAtPeriodEnd;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          disabled={loadingAction !== null}
          onClick={openPortal}
          className="border-purple-600 text-purple-400 hover:bg-purple-950"
        >
          {loadingAction === "portal" ? "Redirection..." : "Gérer l'abonnement"}
        </Button>

        {canCancel && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={loadingAction !== null} className="border-red-600 text-red-400 hover:bg-red-950">
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
