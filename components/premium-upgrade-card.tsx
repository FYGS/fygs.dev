'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Users, Shield, Sparkles, Trophy, Star, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface PremiumUpgradeCardProps {
  hasActiveSubscription: boolean;
  enrolledCourseCount: number;
  totalCourseCount: number;
  subscriptionCancelAtPeriodEnd?: boolean;
}

export function PremiumUpgradeCard({
  hasActiveSubscription,
  enrolledCourseCount,
  totalCourseCount,
  subscriptionCancelAtPeriodEnd = false
}: PremiumUpgradeCardProps) {
  if (hasActiveSubscription) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <Card className="relative overflow-hidden border border-primary/20 bg-linear-to-br from-primary/10 via-background to-background backdrop-blur-xl">
          {/* Ambient glows */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-primary/30 blur-3xl opacity-30 animate-pulse" />
            <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-primary/20 blur-2xl opacity-30" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_60%)]" />
          </div>
          <CardHeader className="relative text-center pb-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 120 }}
              className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 ring-2 ring-primary/30 shadow-lg shadow-primary/10 backdrop-blur-xs"
            >
              <Crown className="h-8 w-8 text-primary drop-shadow-sm" />
            </motion.div>
            <CardTitle className="flex flex-col items-center justify-center gap-2 text-xl">
              <span className="font-semibold tracking-tight bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                FYGS Premium
              </span>
              {subscriptionCancelAtPeriodEnd ? (
                <Badge variant="destructive" className="bg-orange-500/15 text-orange-400 border-orange-500/30">
                  Annulation programmée
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                  Abonnement Actif
                </Badge>
              )}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {subscriptionCancelAtPeriodEnd
                ? "Votre abonnement restera actif jusqu'à la fin de la période en cours"
                : "Merci de soutenir votre progression continue 🚀"}
            </p>
          </CardHeader>
          <CardContent className="relative space-y-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Formations', value: '∞', sub: 'Catalogue complet' },
                { label: 'Support', value: '⚡', sub: 'Prioritaire' },
              ].map(b => (
                <div key={b.label} className="rounded-lg p-3 bg-background/60 border border-border/40 shadow-xs hover:shadow-md transition-all">
                  <div className="font-medium text-foreground/90 text-xs uppercase tracking-wide">{b.label}</div>
                  <div className="text-xl font-semibold text-primary leading-none mt-1">{b.value}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{b.sub}</div>
                </div>
              ))}
            </div>
            {subscriptionCancelAtPeriodEnd && (
              <div className="rounded-md border border-orange-200 bg-orange-50 p-3 text-xs text-left leading-relaxed">
                <p className="text-orange-800 font-medium flex items-center gap-1 mb-1">
                  <AlertCircle className="h-3 w-3" /> Action requise
                </p>
                <p className="text-orange-700">Votre abonnement sera annulé à la fin de la période actuelle. Renouvelez pour continuer à accéder aux formations premium.</p>
              </div>
            )}
            
            <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs text-left leading-relaxed">
              <p className="text-primary font-medium flex items-center gap-1 mb-1"><Sparkles className="h-3 w-3" /> Astuce</p>
              <p>Explorez les nouvelles formations publiées cette semaine pour maximiser votre momentum.</p>
            </div>
            <div className="flex gap-2">
              <Button asChild className="flex-1" variant="outline">
                <Link href="/formations">Découvrir plus</Link>
              </Button>
              <Button asChild className="flex-1" variant="default">
                <Link href="/dashboard/billing">Gérer l&apos;abonnement</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const accessedPercentage = totalCourseCount > 0 ? Math.round((enrolledCourseCount / totalCourseCount) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      <Card className="relative overflow-hidden border border-primary/30 bg-linear-to-br from-background via-background to-background/95 backdrop-blur-xl shadow-[0_0_0_1px_hsl(var(--primary)/0.15),0_4px_30px_-5px_hsl(var(--primary)/0.25)] group">
        {/* Dynamic background ornaments */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-primary/25 blur-3xl opacity-30 group-hover:opacity-40 transition-opacity" />
          <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-primary/15 blur-2xl opacity-40 animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,hsl(var(--primary)/0.18),transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,hsla(var(--primary)/0.12)_40%,transparent_70%)]" />
        </div>
        <CardHeader className="text-center pb-5 relative">
          <motion.div
            initial={{ scale: 0.8, rotate: -4, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120 }}
            className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 ring-2 ring-primary/40 shadow-xl shadow-primary/20 backdrop-blur-xs relative"
          >
            <Crown className="h-8 w-8 text-primary drop-shadow-sm" />
            <Sparkles className="h-4 w-4 text-primary absolute -top-1 -right-1 animate-ping" />
          </motion.div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">Passez à Premium</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            Accédez immédiatement à <strong className="text-primary/90">100% du catalogue</strong>, nouvelles formations chaque mois et un accompagnement prioritaire.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Badge className="bg-primary/15 text-primary border-primary/30">Accès illimité</Badge>
            <Badge className="bg-primary/15 text-primary border-primary/30">Nouvelles sorties</Badge>
            <Badge className="bg-primary/15 text-primary border-primary/30">Support prioritaire</Badge>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-6">
          {/* Progress / FOMO Section */}
          <div className="rounded-xl p-4 bg-background/70 border border-border/50 backdrop-blur-xs relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Votre progression</span>
              <span className="text-xs text-muted-foreground">{enrolledCourseCount}/{totalCourseCount} suivies</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${accessedPercentage}%` }}
                transition={{ delay: 0.2, duration: 0.9, ease: 'easeOut' }}
                className="h-full bg-linear-to-r from-primary via-primary/70 to-primary/40 relative"
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.35)_50%,rgba(255,255,255,0)_100%)] animate-[shimmer_2.2s_infinite]" />
              </motion.div>
            </div>
            <p className="text-[11px] mt-2 text-muted-foreground flex items-center gap-1">
              <Zap className="h-3 w-3 text-primary" /> Vous n&apos;exploitez que {accessedPercentage}% du potentiel actuel.
            </p>
          </div>
          {/* Benefits Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { icon: <InfinityIcon />, label: 'Catalogue complet', sub: 'Toutes les formations' },
              { icon: <Trophy className='h-4 w-4 text-primary' />, label: 'Parcours structuré', sub: 'Progression guidée' },
              { icon: <Users className='h-4 w-4 text-primary' />, label: 'Communauté', sub: 'Accès prioritaire' },
              { icon: <Shield className='h-4 w-4 text-primary' />, label: 'Certificats', sub: 'Illimités' },
              { icon: <Star className='h-4 w-4 text-primary' />, label: 'Nouveautés', sub: 'Accès anticipé' },
              { icon: <Sparkles className='h-4 w-4 text-primary' />, label: 'Mises à jour', sub: 'Continuelles' },
            ].map(item => (
              <div key={item.label} className="group rounded-lg p-3 bg-background/60 border border-border/50 hover:border-primary/40 hover:shadow-md transition-all backdrop-blur-xs">
                <div className="flex items-center gap-2 mb-1">
                  {item.icon}
                  <span className="font-medium text-foreground/90">{item.label}</span>
                </div>
                <div className="text-[11px] text-muted-foreground leading-tight">{item.sub}</div>
              </div>
            ))}
          </div>
          {/* Social proof / Risk reversal */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
                <Shield className="h-4 w-4 text-primary mt-0.5" />
                <p><span className="font-semibold text-primary/90">Garantie 100% satisfaction</span> – annulez à tout moment, aucun engagement.</p>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-background/70 p-3 text-xs">
                <Users className="h-4 w-4 text-primary mt-0.5" />
                <p>Des centaines d&apos;heures de contenu professionnel constamment enrichi.</p>
              </div>
            </div>
          {/* CTA Section */}
          <div className="space-y-3">
            <Button asChild size="lg" className="w-full relative overflow-hidden group/btn bg-linear-to-r from-primary via-primary/80 to-primary/60 hover:from-primary hover:via-primary/90 hover:to-primary shadow-lg shadow-primary/30">
              <Link href="/pricing">
                <span className="relative z-10 flex items-center">
                  <Crown className="h-4 w-4 mr-2" /> Devenir Premium maintenant
                </span>
                <span className="pointer-events-none absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.4),transparent_70%)]" />
              </Link>
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 text-[11px] text-center text-muted-foreground">
              <span>A partir de <strong className="text-primary">29€/mois</strong></span>
              <span className="hidden sm:inline">•</span>
              <span>Annulable à tout moment</span>
              <span className="hidden sm:inline">•</span>
              <span>Nouveaux cursus réguliers</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Local inline icon to avoid extra dependency just for infinity symbol stylization
function InfinityIcon() {
  return (
    <svg
      className="h-4 w-4 text-primary"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 12c0 1.5-1.5 3-3 3s-3-1.5-3-3 1.5-3 3-3 3 1.5 3 3c0 1.5 1.5 3 3 3s3-1.5 3-3-1.5-3-3-3-3 1.5-3 3" />
    </svg>
  );
}