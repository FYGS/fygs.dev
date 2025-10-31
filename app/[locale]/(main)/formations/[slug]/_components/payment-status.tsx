"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, ArrowRight, RefreshCw, Crown, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/fade-in";
import { notify } from "@/lib/notification-store";
import Link from "next/link";
import { useState } from "react";

interface PaymentStatusProps {
  type: "success" | "canceled";
  courseTitle: string;
  courseSlug: string;
}

export function PaymentStatus({ type, courseTitle, courseSlug }: PaymentStatusProps) {
  const [redirecting, setRedirecting] = useState(false);
  useEffect(() => {
    if (type === "success") {
      notify.success(
        "Paiement réussi !",
        `Vous avez maintenant accès au cours "${courseTitle}". Commencez votre apprentissage dès maintenant !`,
        8000
      );
      
      
      // Poll unlock state and redirect to first lesson when ready
      const start = Date.now();
      const interval = setInterval(async () => {
        if (Date.now() - start > 15000 || redirecting) {
          clearInterval(interval);
          return;
        }
        try {
          const res = await fetch(`/api/courses/status?slug=${encodeURIComponent(courseSlug)}`, { cache: 'no-store' });
          if (!res.ok) return;
          const data = await res.json();
          if (data.unlocked) {
            clearInterval(interval);
            setRedirecting(true);
            const next = data.firstLessonSlug
              ? `/formations/${courseSlug}/lessons/${data.firstLessonSlug}`
              : `/formations/${courseSlug}`;
            window.location.href = next;
          }
        } catch {}
      }, 1500);
      return () => clearInterval(interval);
    } else if (type === "canceled") {
      notify.warning(
        "Paiement annulé",
        "Votre paiement a été annulé. Vous pouvez réessayer à tout moment.",
        6000
      );
    }
  }, [type, courseTitle, courseSlug, redirecting]);

  // Stripe webhooks handle access provisioning; no client-side capture needed.

  if (type === "success") {
    return (
      <FadeIn className="mb-8">
        <Card className="border-green-200 bg-linear-to-br from-green-50 via-green-50 to-emerald-50 dark:from-green-950/20 dark:via-green-900/20 dark:to-emerald-900/20 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-linear-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-green-400/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
          
          <CardHeader className="text-center pb-4 relative">
            <div className="mx-auto mb-4 p-4 rounded-full bg-linear-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 w-fit relative">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
              <div className="absolute -top-1 -right-1 animate-bounce">
                🎉
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-linear-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Félicitations !
            </CardTitle>
            <p className="text-lg text-green-700 dark:text-green-300 mt-2">
              Votre accès au cours est maintenant actif
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6 relative">
            <div className="text-center">
              <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
                {courseTitle}
              </h3>
              <p className="text-green-600 dark:text-green-400">
                Prêt à commencer votre apprentissage ?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4 border border-green-200/50 dark:border-green-700/30">
                <h4 className="font-bold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Accès débloqué
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-2">
                  <li>✨ Accès à vie au contenu</li>
                  <li>✨ Mises à jour gratuites</li>
                  <li>✨ Support communautaire</li>
                  <li>✨ Certificat de réussite</li>
                </ul>
              </div>
              
              <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4 border border-green-200/50 dark:border-green-700/30">
                <h4 className="font-bold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Pour commencer
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-2">
                  <li>🚀 Explorez le programme</li>
                  <li>🚀 Suivez votre progression</li>
                  <li>🚀 Pratiquez avec les exercices</li>
                  <li>🚀 Interagissez avec la communauté</li>
                </ul>
              </div>
            </div>

            <div className="text-center bg-linear-to-r from-green-500 via-emerald-500 to-teal-500 rounded-xl p-6 text-white">
              <h4 className="text-xl font-bold mb-2">
                Commencez votre apprentissage ! 🚀
              </h4>
              <p className="text-green-100 mb-4">
                Tout est prêt pour votre première leçon. Prenez votre temps et progressez à votre rythme.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-green-50">
                  <Link href={`/formations/${courseSlug}`}>
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Commencer le cours
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
                  <Link href="/dashboard">
                    Voir mon tableau de bord
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
        <Card className="border-orange-200 bg-linear-to-br from-orange-50 via-yellow-50 to-amber-50 dark:from-orange-950/20 dark:via-yellow-900/20 dark:to-amber-900/20 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-linear-to-r from-orange-500/5 via-yellow-500/5 to-amber-500/5" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-orange-400/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
          
          <CardHeader className="text-center pb-4 relative">
            <div className="mx-auto mb-4 p-4 rounded-full bg-linear-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 w-fit">
              <XCircle className="h-12 w-12 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-3xl font-bold bg-linear-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
              Paiement annulé
            </CardTitle>
            <p className="text-lg text-orange-700 dark:text-orange-300 mt-2">
              Pas de soucis ! Vous pouvez réessayer à tout moment
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6 relative">
            <div className="text-center">
              <h3 className="text-xl font-bold text-orange-800 dark:text-orange-200 mb-2">
                {courseTitle}
              </h3>
              <p className="text-orange-600 dark:text-orange-400">
                Ce cours est toujours disponible pour vous
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4 border border-orange-200/50 dark:border-orange-700/30">
                <h4 className="font-bold text-orange-800 dark:text-orange-200 mb-3 flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Options disponibles
                </h4>
                <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-2">
                  <li>🔄 Réessayer le paiement</li>
                  <li>🔄 Explorer d&apos;autres cours</li>
                  <li>🔄 Voir nos offres groupées</li>
                  <li>🔄 Contacter le support</li>
                </ul>
              </div>
              
              <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4 border border-orange-200/50 dark:border-orange-700/30">
                <h4 className="font-bold text-orange-800 dark:text-orange-200 mb-3 flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Abonnement Premium
                </h4>
                <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-2">
                  <li>⭐️ Accès à tous les cours</li>
                  <li>⭐️ Prix avantageux</li>
                  <li>⭐️ Contenu exclusif</li>
                  <li>⭐️ Support prioritaire</li>
                </ul>
              </div>
            </div>

            <div className="text-center bg-linear-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-xl p-6 text-white">
              <h4 className="text-xl font-bold mb-2">
                Vous avez des options ! 🌟
              </h4>
              <p className="text-orange-100 mb-4">
                Choisissez la solution qui vous convient le mieux pour accéder à nos formations de qualité.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-orange-50">
                  <Link href={`/formations/${courseSlug}`}>
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Réessayer
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
                  <Link href="/pricing">
                    <Crown className="h-5 w-5 mr-2" />
                    Voir Premium
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    );
  }

  return null;
}
