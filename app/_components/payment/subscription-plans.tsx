"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Star,
  Zap,
  Crown,
  BookOpen,
  Award,
  Headphones,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

import { enqueueAnalytics } from "@/lib/analytics-batch";

interface SubscriptionPlansProps {
  currentPlan?: "free" | "premium";
  hasMonthly?: boolean;
  hasYearly?: boolean;
  defaultCycle?: "monthly" | "yearly";
  currentCycle?: "monthly" | "yearly" | "unknown";
  previousCycleDerived?: boolean; // true when defaultCycle came from prior subscription (for badge)
}

export function SubscriptionPlans({
  currentPlan = "free",
  hasYearly = false,
  defaultCycle = "monthly",
  previousCycleDerived = false,
}: SubscriptionPlansProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    defaultCycle
  );
  const yearlyConfigured = hasYearly;
  const effectiveBillingCycle = yearlyConfigured ? billingCycle : "monthly";

  const handleSubscribe = async (planType: "premium") => {
    if (!session) {
      // Redirect to login with callback to return to pricing page
      const callbackUrl = encodeURIComponent(window.location.pathname);
      window.location.href = new URL(`/auth/login?callbackUrl=${callbackUrl}`, window.location.origin).href;
      return;
    }

    setLoading(planType);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "subscription",
          courseId: "premium-subscription",
          // send the semantic cycle; server maps to actual price id
          priceId: effectiveBillingCycle,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Erreur lors de la création de l'abonnement", {
          description:
            data.error || "Erreur lors de la création de l'abonnement",
        });
      }
    } catch (subscriptionError) {
      console.error("Subscription creation error:", subscriptionError);
      toast.error("Erreur lors de la création de l'abonnement", {
        description:
          "Une erreur est survenue lors de la création de l'abonnement",
      });
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      id: "free",
      name: "Gratuit",
      price: 0,
      period: "",
      description: "Parfait pour commencer",
      features: [
        "Accès aux formations gratuites",
        "Suivi de progression basique",
        "Support communautaire",
        "Ressources de base",
      ],
      limitations: [
        "Formations premium verrouillées",
        "Pas de certificats",
        "Support limité",
      ],
      buttonText: "Plan actuel",
      buttonVariant: "outline" as const,
      popular: false,
    },
    {
      id: "premium",
      name: "Premium",
      price: billingCycle === "monthly" ? 29 : 290,
      period: billingCycle === "monthly" ? "/mois" : "/an",
      description: "Accès illimité à tout le contenu",
      features: [
        "Accès illimité à toutes les formations",
        "Nouveaux cours chaque mois",
        "Certificats de completion",
        "Support prioritaire 24/7",
        "Ressources téléchargeables",
        "Accès aux projets pratiques",
        "Communauté Discord privée",
        "Sessions Q&A en direct",
        "Code source complet",
        "Mises à jour à vie",
      ],
      buttonText: "Commencer maintenant",
      buttonVariant: "default" as const,
      popular: true,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Choisissez votre plan</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Accédez à notre catalogue complet de formations premium et accélérez
          votre carrière en développement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${
              plan.popular
                ? "border-primary shadow-lg scale-105"
                : "border-border"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Plus populaire
                </Badge>
              </div>
            )}

            <CardHeader className="text-center space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  {plan.id === "premium" ? (
                    <Crown className="h-6 w-6 text-primary" />
                  ) : (
                    <Zap className="h-6 w-6 text-muted-foreground" />
                  )}
                  <CardTitle as="h2" className="text-2xl">{plan.name}</CardTitle>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              <div className="space-y-2">
                {plan.id === "premium" && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setBillingCycle("monthly");
                        enqueueAnalytics({
                          type: "SUBSCRIPTION_CYCLE_TOGGLED",
                          context: {
                            to: "monthly",
                            from: billingCycle,
                            location: "pricing",
                          },
                        });
                      }}
                      className={`px-3 py-1 text-xs rounded-full border ${
                        effectiveBillingCycle === "monthly"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted"
                      }`}
                    >
                      Mensuel
                    </button>
                    <button
                      onClick={() =>
                        yearlyConfigured &&
                        (setBillingCycle("yearly"),
                        enqueueAnalytics({
                          type: "SUBSCRIPTION_CYCLE_TOGGLED",
                          context: {
                            to: "yearly",
                            from: billingCycle,
                            location: "pricing",
                          },
                        }))
                      }
                      disabled={!yearlyConfigured}
                      className={`px-3 py-1 text-xs rounded-full border ${
                        effectiveBillingCycle === "yearly"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted"
                      } ${
                        !yearlyConfigured ? "opacity-40 cursor-not-allowed" : ""
                      }`}
                    >
                      Annuel -2 mois
                    </button>
                  </div>
                )}
                <div className="text-4xl font-bold">
                  {plan.price === 0 ? "Gratuit" : `${plan.price}€`}
                  <span className="text-lg font-normal text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                {plan.id === "premium" &&
                  effectiveBillingCycle === "yearly" && (
                    <p className="text-xs text-green-600">Économisez 2 mois</p>
                  )}
                {plan.id === "premium" &&
                  previousCycleDerived &&
                  defaultCycle === "yearly" && (
                    <p className="text-[10px] text-primary font-medium uppercase tracking-wide">
                      Basé sur votre précédent abonnement
                    </p>
                  )}
                {plan.id === "premium" && !yearlyConfigured && (
                  <p className="text-xs text-muted-foreground">
                    (Annuel bientôt disponible)
                  </p>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}

                {plan.limitations &&
                  plan.limitations.map((limitation, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3"
                    >
                      <div className="h-5 w-5 shrink-0 mt-0.5 flex items-center justify-center opacity-60">
                        <div className="h-2 w-2 bg-muted-foreground rounded-full" />
                      </div>
                      <span className="text-sm text-muted-foreground line-through">
                        {limitation}
                      </span>
                    </div>
                  ))}
              </div>

              <Button
                className="w-full h-12 text-lg font-semibold"
                variant={plan.buttonVariant}
                size="lg"
                onClick={() =>
                  plan.id === "premium" && handleSubscribe("premium")
                }
                disabled={
                  loading === plan.id ||
                  (plan.id === "free" && currentPlan === "free") ||
                  (plan.id === "premium" && currentPlan === "premium")
                }
              >
                {loading === plan.id ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Traitement...</span>
                  </div>
                ) : currentPlan === plan.id ? (
                  "Plan actuel"
                ) : (
                  plan.buttonText
                )}
              </Button>

              {plan.id === "premium" && (
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    ✨ Garantie satisfait ou remboursé 30 jours
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Annulez à tout moment
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Comparison */}
      <div className="bg-muted/30 rounded-lg p-6 max-w-4xl mx-auto">
        <h3 className="text-xl font-semibold text-center mb-6">
          Pourquoi choisir Premium ?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-2">
            <BookOpen className="h-8 w-8 text-primary mx-auto" />
            <h4 className="font-semibold">50+ Formations</h4>
            <p className="text-sm text-muted-foreground">
              Accès illimité à toutes nos formations premium
            </p>
          </div>
          <div className="text-center space-y-2">
            <Award className="h-8 w-8 text-primary mx-auto" />
            <h4 className="font-semibold">Certificats</h4>
            <p className="text-sm text-muted-foreground">
              Certificats reconnus pour votre CV
            </p>
          </div>
          <div className="text-center space-y-2">
            <Headphones className="h-8 w-8 text-primary mx-auto" />
            <h4 className="font-semibold">Support 24/7</h4>
            <p className="text-sm text-muted-foreground">
              Support prioritaire et communauté exclusive
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
