"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/fade-in";
import { notify } from "@/lib/notification-store";
import Link from "next/link";

interface SubscriptionStatusProps {
  type: "success" | "canceled";
  userName?: string;
  cycle?: 'monthly' | 'yearly';
}

export function SubscriptionStatus({ type, userName, cycle = 'monthly' }: SubscriptionStatusProps) {
  useEffect(() => {
    if (type === "success") {
      notify.success(
        "🎉 Abonnement Premium activé !",
        cycle === 'yearly'
          ? "Abonnement annuel confirmé. Vous économisez 2 mois ! Accès complet immédiat à tout le contenu."
          : "Bienvenue dans la communauté Premium ! Vous avez maintenant accès à tous les cours et fonctionnalités exclusives.",
        8000
      );
      
      // Force page reload after short delay to ensure UI updates
      const timeout = setTimeout(() => {
        window.location.reload();
      }, 2000);
      
      return () => clearTimeout(timeout);
    } else if (type === "canceled") {
      notify.warning(
        "Abonnement annulé",
        "Votre abonnement Premium a été annulé. Vous pouvez réessayer à tout moment.",
        6000
      );
    }
  }, [type, cycle]);

  if (type === "success") {
    return (
      <FadeIn className="mb-8">
        <Card className="border-purple-200 bg-linear-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/20 dark:via-indigo-900/20 dark:to-blue-900/20 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-linear-to-r from-purple-500/5 via-indigo-500/5 to-blue-500/5" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-purple-400/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
          
          <CardHeader className="text-center pb-4 relative">
            <div className="mx-auto mb-4 p-4 rounded-full bg-linear-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 w-fit relative">
              <Crown className="h-16 w-16 text-purple-600 dark:text-purple-400" />
              <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-bold bg-linear-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              🎉 Bienvenue Premium !
            </CardTitle>
            <p className="text-lg text-purple-700 dark:text-purple-300 mt-2">
              {userName}, votre abonnement Premium est maintenant actif
            </p>
            {cycle === 'yearly' && (
              <p className="text-sm mt-2 font-medium text-green-600 dark:text-green-400">
                Vous avez choisi l’abonnement annuel (2 mois offerts).
              </p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/30">
                <h4 className="font-bold text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Accès illimité
                </h4>
                <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-2">
                  <li>✨ Tous les cours disponibles</li>
                  <li>✨ Nouveaux cours chaque mois</li>
                  <li>✨ Contenu exclusif Premium</li>
                  <li>✨ Certificats de completion</li>
                </ul>
              </div>
              
              <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/30">
                <h4 className="font-bold text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Avantages Premium
                </h4>
                <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-2">
                  <li>🚀 Support prioritaire</li>
                  <li>🚀 Communauté Discord VIP</li>
                  <li>🚀 Sessions Q&A exclusives</li>
                  <li>🚀 Ressources téléchargeables</li>
                </ul>
              </div>
            </div>

            <div className="text-center bg-linear-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-xl p-6 text-white">
              <h4 className="text-xl font-bold mb-2">
                Votre parcours d&apos;apprentissage commence maintenant ! 🚀
              </h4>
              <p className="text-purple-100 mb-4">
                {cycle === 'yearly' ? 'Profitez d’une année complète de progression continue.' : 'Explorez notre catalogue complet et développez vos compétences.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-purple-50">
                  <Link href="/formations">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Explorer les cours
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
                  <Link href="/dashboard/billing">
                    Gérer mon abonnement
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    );
  }

  if (type === "canceled") {
    return (
      <FadeIn className="mb-8">
        <Card className="border-orange-200 bg-linear-to-br from-orange-50 via-yellow-50 to-amber-50 dark:from-orange-950/20 dark:via-yellow-900/20 dark:to-amber-900/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-3 rounded-full bg-orange-100 dark:bg-orange-900/30 w-fit">
              <XCircle className="h-12 w-12 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-2xl text-orange-800 dark:text-orange-200">
              Abonnement Premium annulé
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-lg text-orange-700 dark:text-orange-300">
                Votre abonnement Premium a été annulé.
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                Aucun montant n&apos;a été débité de votre compte.
              </p>
            </div>
            
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-orange-800 dark:text-orange-200">
                Que faire maintenant ?
              </h4>
              <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1 text-left">
                <li>• Vous pouvez souscrire à tout moment</li>
                <li>• Découvrez nos cours gratuits</li>
                <li>• Achetez des cours individuellement</li>
                <li>• Contactez-nous pour des questions</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link href="/pricing">
                  <Crown className="h-5 w-5 mr-2" />
                  Voir les offres Premium
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/formations">
                  Parcourir les cours
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    );
  }

  return null;
}
