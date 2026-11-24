"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Award, BookOpen, Check, Crown, Loader2, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { enqueueAnalytics } from "@/lib/analytics-batch";
import type { PlanPrice } from "@/lib/payments/plan-prices";
import { formatPrice } from "@/lib/price-format";

/** Where the visitor stands with the subscription, decided on the server. */
export type PlanViewerState = "anonymous" | "free" | "premium" | "ending" | "past_due";

interface SubscriptionPlansProps {
  state: PlanViewerState;
  monthly: PlanPrice | null;
  yearly: PlanPrice | null;
  defaultCycle: "monthly" | "yearly";
  /** Published premium courses the subscription opens. */
  premiumCourses: number;
  refundDays: number;
}

export function SubscriptionPlans({ state, monthly, yearly, defaultCycle, premiumCourses, refundDays }: SubscriptionPlansProps) {
  const [cycle, setCycle] = useState<"monthly" | "yearly">(defaultCycle === "yearly" && yearly ? "yearly" : monthly ? "monthly" : "yearly");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const price = cycle === "yearly" ? yearly : monthly;
  const saving =
    monthly && yearly && monthly.currency === yearly.currency ? Math.round((1 - yearly.amount / (monthly.amount * 12)) * 100) : 0;

  const subscribe = async () => {
    if (state === "anonymous") {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    setLoading(true);
    enqueueAnalytics({ type: "SUBSCRIPTION_CYCLE_TOGGLED", context: { to: cycle, location: "pricing-subscribe" } });
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "subscription", priceId: cycle }),
      });
      const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (response.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      toast.error("L’abonnement n’a pas pu démarrer", { description: data.error ?? "Réessayez dans un instant." });
    } catch {
      toast.error("L’abonnement n’a pas pu démarrer", { description: "Vérifiez votre connexion et réessayez." });
    }
    setLoading(false);
  };

  const premiumFeatures = [
    premiumCourses > 0
      ? `Les ${premiumCourses} formation${premiumCourses > 1 ? "s" : ""} Premium du catalogue, et celles qui s’y ajoutent`
      : "Toutes les formations Premium du catalogue",
    "Les formations gratuites, bien sûr",
    "Quiz, examens finaux et certificats vérifiables",
    "Les parcours complets, certificat de parcours compris",
    "Ressources téléchargeables des leçons",
  ];
  const freeFeatures = [
    "Toutes les formations gratuites",
    "Quiz, examens et certificats des formations gratuites",
    "Leçons d’aperçu des formations Premium",
    "Formations Premium à l’unité, à vie",
  ];

  const premiumAction = (() => {
    if (state === "premium") return <Button className="h-12 w-full text-base" variant="outline" disabled>Votre formule actuelle</Button>;
    if (state === "ending" || state === "past_due") {
      return (
        <Button asChild className="h-12 w-full text-base">
          <Link href="/dashboard/billing">{state === "ending" ? "Réactiver mon abonnement" : "Mettre à jour mon paiement"}</Link>
        </Button>
      );
    }
    return (
      <Button className="h-12 w-full text-base font-semibold" onClick={subscribe} disabled={loading || (!price && state !== "anonymous")}>
        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden /> : null}
        Commencer maintenant
      </Button>
    );
  })();

  return (
    <div className="space-y-10">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold">Choisissez votre plan</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Les formations gratuites restent ouvertes à tous. Premium ouvre l’ensemble du catalogue, sans achat formation par formation.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="border">
          <CardHeader className="space-y-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <Zap className="h-6 w-6 text-muted-foreground" aria-hidden />
              <CardTitle as="h2" className="text-2xl">
                Gratuit
              </CardTitle>
            </div>
            <p className="text-4xl font-bold">0 €</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>
            {state === "anonymous" ? (
              <Button asChild variant="outline" className="h-12 w-full text-base">
                <Link href="/auth/register">Créer un compte</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="h-12 w-full text-base">
                <Link href="/formations?access=free">Voir les formations gratuites</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="relative border-2 border-primary shadow-lg">
          <CardHeader className="space-y-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <Crown className="h-6 w-6 text-primary" aria-hidden />
              <CardTitle as="h2" className="text-2xl">
                Premium
              </CardTitle>
              {state === "premium" && <Badge>Votre formule</Badge>}
            </div>

            {monthly && yearly && (
              <div role="radiogroup" aria-label="Fréquence de paiement" className="flex items-center justify-center gap-2">
                {(["monthly", "yearly"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={cycle === value}
                    onClick={() => setCycle(value)}
                    className={`rounded-full border px-3 py-1 text-sm ${cycle === value ? "border-primary bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    {value === "monthly" ? "Mensuel" : `Annuel${saving > 0 ? ` (−${saving} %)` : ""}`}
                  </button>
                ))}
              </div>
            )}

            {price ? (
              <p className="text-4xl font-bold">
                {formatPrice(price.amount, { currency: price.currency, freeLabel: false })}
                <span className="text-lg font-normal text-muted-foreground">{price.cycle === "monthly" ? " / mois" : " / an"}</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">L’abonnement n’est pas disponible pour le moment.</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {premiumFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>
            {premiumAction}
            <p className="text-center text-xs text-muted-foreground">
              Sans engagement : arrêtez quand vous voulez depuis la page Facturation. Remboursement sur demande sous {refundDays} jours.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 rounded-lg bg-muted/30 p-6 md:grid-cols-2">
        <div className="flex items-start gap-3">
          <BookOpen className="mt-1 h-6 w-6 shrink-0 text-primary" aria-hidden />
          <div>
            <h3 className="font-semibold">Une formation seulement ?</h3>
            <p className="text-sm text-muted-foreground">
              Chaque formation Premium s’achète aussi à l’unité, avec un accès à vie, depuis sa page.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Award className="mt-1 h-6 w-6 shrink-0 text-primary" aria-hidden />
          <div>
            <h3 className="font-semibold">Des certificats vérifiables</h3>
            <p className="text-sm text-muted-foreground">
              Chaque certificat porte un code que n’importe qui peut vérifier en ligne, sur toutes les formations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
