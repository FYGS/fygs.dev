"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Crown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notify } from "@/lib/notification-store";

interface SubscriptionStatusProps {
  /** `success`: back from a paid checkout; `canceled`: the checkout was left before paying. */
  type: "success" | "canceled";
  userName?: string;
  cycle?: "monthly" | "yearly";
}

/** Drops the checkout return parameters from the address, so a reload does not show the message again. */
function cleanAddress() {
  const url = new URL(window.location.href);
  url.searchParams.delete("subscription");
  url.searchParams.delete("cycle");
  window.history.replaceState({}, "", url.toString());
}

/**
 * The dashboard after the subscription checkout: what Premium opens (and nothing it does not), or that the payment
 * was interrupted and nothing was charged.
 */
export function SubscriptionStatus({ type, userName, cycle = "monthly" }: SubscriptionStatusProps) {
  const router = useRouter();

  useEffect(() => {
    const key = `subscription-${type}-${cycle}-shown`;
    if (!sessionStorage.getItem(key)) {
      if (type === "success") {
        notify.success("Abonnement Premium activé", "Toutes les formations Premium vous sont ouvertes.", 8000);
        // the access comes with the payment confirmation: fresh server data
        router.refresh();
      } else {
        notify.info("Paiement interrompu", "Aucun montant n’a été débité.", 6000);
      }
      sessionStorage.setItem(key, "true");
    }
    const timeout = setTimeout(cleanAddress, 1000);
    return () => clearTimeout(timeout);
  }, [type, cycle, router]);

  if (type === "success") {
    return (
      <Card className="border-primary/30">
        <CardHeader className="flex flex-row items-start gap-3 space-y-0">
          <Crown className="mt-1 h-6 w-6 shrink-0 text-primary" aria-hidden />
          <div className="space-y-1">
            <CardTitle as="h2" className="text-xl">
              {userName ? `${userName}, votre abonnement Premium est actif` : "Votre abonnement Premium est actif"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {cycle === "yearly" ? "Abonnement annuel." : "Abonnement mensuel."} Vous le gérez à tout moment depuis la facturation.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="grid gap-2 text-sm sm:grid-cols-3">
            {[
              "Toutes les formations Premium ouvertes tant que l’abonnement est actif",
              "Les certificats des formations que vous terminez",
              "Votre progression conservée, sur tous vos appareils",
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden />
                {benefit}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/formations">Choisir une formation</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/billing">Gérer mon abonnement</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <Info className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
        <div className="space-y-1">
          <CardTitle as="h2" className="text-lg">
            Paiement interrompu
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Aucun montant n’a été débité. Vous pouvez vous abonner quand vous le souhaitez, ou suivre les formations gratuites.
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/pricing">Voir les formules</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/formations">Parcourir les formations</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
