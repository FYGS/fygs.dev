"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Award,
  BookOpen,
  CircleHelp,
  CreditCard,
  Crown,
  FileDown,
  GraduationCap,
  Infinity as InfinityIcon,
  Loader2,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { enrollCourse } from "@/app/[locale]/(main)/dashboard/actions/enrollCourse";
import type { CourseOffer } from "@/lib/access/offer";
import { LAPSED_REASON_TEXT } from "@/lib/access/offer";
import type { EntitlementSource, LapsedReason } from "@/lib/access/entitlement";
import { enqueueAnalytics } from "@/lib/analytics-batch";
import { formatMinutes } from "@/lib/format-duration";
import { formatPrice } from "@/lib/price-format";
import { REFUND_WINDOW_DAYS } from "@/lib/refund-policy";

/** Where the viewer stands, decided on the server by `lib/access/entitlement.ts`. */
export type OfferViewerState =
  /** Not signed in. */
  | "anonymous"
  /** Signed in, no right yet. */
  | "none"
  /** Holds a right (subscription, purchase, granted access) but did not start the course yet. */
  | "eligible"
  /** Following the course. */
  | "entitled"
  /** Enrolled, the right ended. */
  | "lapsed"
  /** Author or administrator. */
  | "staff";

export interface CourseOfferPanelProps {
  course: { id: string; slug: string; title: string };
  offer: CourseOffer;
  state: OfferViewerState;
  source: EntitlementSource | null;
  lapsed: LapsedReason | null;
  /** The next step of an entitled learner ("Continuer"), or the course home. */
  continueHref: string;
  continueLabel: string;
  hasPreview: boolean;
  /** Back from Stripe and the access is not confirmed yet: buying again is disabled. */
  paymentPending: boolean;
  includes: {
    lessons: number;
    minutes: number;
    resources: number;
    quizzes: number;
    hasExam: boolean;
  };
}

function loginHref(slug: string) {
  return `/auth/login?callbackUrl=${encodeURIComponent(`/formations/${slug}`)}`;
}

export function CourseOfferPanel({
  course,
  offer,
  state,
  source,
  lapsed,
  continueHref,
  continueLabel,
  hasPreview,
  paymentPending,
  includes,
}: CourseOfferPanelProps) {
  const router = useRouter();
  const [enrolling, startEnrolling] = useTransition();
  const [buying, setBuying] = useState(false);
  const busy = enrolling || buying;

  const enrol = () =>
    startEnrolling(async () => {
      const result = await enrollCourse({ courseId: course.id });
      if (result.success) {
        toast.success(result.alreadyEnrolled ? "Vous suivez déjà cette formation" : "Inscription confirmée", {
          description: result.alreadyEnrolled ? undefined : result.message,
        });
        router.push(`/learn/${course.slug}`);
      } else {
        toast.error("Inscription impossible", { description: result.message });
      }
    });

  const buy = async () => {
    setBuying(true);
    enqueueAnalytics({ type: "COURSE_CARD_CTA_CLICKED", context: { courseId: course.id, cta: "buy" } });
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "course", courseId: course.id, slug: course.slug }),
      });
      const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (response.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      toast.error("Le paiement n’a pas pu démarrer", { description: data.error ?? "Réessayez dans un instant." });
      if (response.status === 409) router.refresh();
    } catch {
      toast.error("Le paiement n’a pas pu démarrer", { description: "Vérifiez votre connexion et réessayez." });
    }
    setBuying(false);
  };

  const purchasable = offer.kind === "premium" && offer.price !== null;
  const priceText = offer.kind === "free" ? "Gratuite" : offer.price !== null ? formatPrice(offer.price, { freeLabel: false }) : "Premium";

  const accessLine = (() => {
    if (state === "entitled" || state === "eligible") {
      if (source === "purchase") return "Accès à vie : vous avez acheté cette formation.";
      if (source === "subscription") return "Incluse dans votre abonnement Premium, tant qu’il est actif.";
      if (source === "grant") return "Accès offert par l’équipe pédagogique.";
      if (source === "free") return "Formation gratuite.";
    }
    if (state === "staff") return "Vous êtes l’auteur de cette formation (ou administrateur).";
    return null;
  })();

  const included = [
    includes.lessons > 0 && {
      icon: BookOpen,
      text: `${includes.lessons} leçon${includes.lessons > 1 ? "s" : ""}${includes.minutes > 0 ? ` · ${formatMinutes(includes.minutes)}` : ""}`,
    },
    includes.quizzes > 0 && { icon: CircleHelp, text: `${includes.quizzes} quiz pour vérifier vos acquis` },
    includes.hasExam && { icon: GraduationCap, text: "Un examen final" },
    includes.resources > 0 && {
      icon: FileDown,
      text: `${includes.resources} ressource${includes.resources > 1 ? "s" : ""} à télécharger`,
    },
    includes.lessons > 0 && { icon: Award, text: "Un certificat vérifiable à la fin" },
    offer.kind === "free"
      ? { icon: InfinityIcon, text: "Gratuite, sans limite de durée" }
      : purchasable
        ? { icon: InfinityIcon, text: "À l’achat : accès à vie · avec Premium : tant que l’abonnement est actif" }
        : { icon: Crown, text: "Réservée aux abonnés Premium" },
  ].filter(Boolean) as { icon: typeof BookOpen; text: string }[];

  const primary = (() => {
    if (paymentPending) {
      return (
        <Button className="h-12 w-full text-base" disabled>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden /> Paiement en cours de confirmation…
        </Button>
      );
    }
    switch (state) {
      case "entitled":
      case "staff":
        return (
          <Button asChild className="h-12 w-full text-base">
            <Link href={continueHref}>
              <PlayCircle className="mr-2 h-5 w-5" aria-hidden /> {state === "staff" ? "Parcourir comme un apprenant" : continueLabel}
            </Link>
          </Button>
        );
      case "eligible":
        return (
          <Button className="h-12 w-full text-base" onClick={enrol} disabled={busy}>
            {enrolling ? <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden /> : <PlayCircle className="mr-2 h-5 w-5" aria-hidden />}
            Commencer la formation
          </Button>
        );
      case "anonymous":
        return (
          <Button asChild className="h-12 w-full text-base">
            <Link href={loginHref(course.slug)}>
              {offer.kind === "free" ? "Se connecter pour s’inscrire" : purchasable ? "Se connecter pour acheter" : "Se connecter"}
            </Link>
          </Button>
        );
      default:
        if (offer.kind === "free") {
          return (
            <Button className="h-12 w-full text-base" onClick={enrol} disabled={busy}>
              {enrolling ? <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden /> : <PlayCircle className="mr-2 h-5 w-5" aria-hidden />}
              {state === "lapsed" ? "Reprendre la formation" : "S’inscrire gratuitement"}
            </Button>
          );
        }
        if (purchasable) {
          return (
            <Button className="h-12 w-full text-base" onClick={buy} disabled={busy}>
              {buying ? <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden /> : <CreditCard className="mr-2 h-5 w-5" aria-hidden />}
              {state === "lapsed" ? "Racheter" : "Acheter"} · {priceText}
            </Button>
          );
        }
        return (
          <Button asChild className="h-12 w-full text-base">
            <Link href="/pricing">
              <Crown className="mr-2 h-5 w-5" aria-hidden /> {state === "lapsed" ? "Se réabonner" : "S’abonner à Premium"}
            </Link>
          </Button>
        );
    }
  })();

  const showSubscriptionOffer = offer.kind === "premium" && (state === "none" || state === "anonymous" || state === "lapsed") && purchasable;

  return (
    <Card className="border-2 shadow-lg">
      {state === "lapsed" && lapsed && (
        <div role="note" className="border-b bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-50">
          <p className="font-semibold">{LAPSED_REASON_TEXT[lapsed].title}</p>
          <p>{LAPSED_REASON_TEXT[lapsed].body}</p>
        </div>
      )}
      <CardHeader className="space-y-2 text-center">
        {state === "entitled" || state === "staff" ? (
          <p className="text-lg font-semibold">Vous suivez cette formation</p>
        ) : (
          <p className="text-4xl font-bold">{priceText}</p>
        )}
        {offer.kind === "premium" && offer.price !== null && state !== "entitled" && state !== "staff" && state !== "eligible" && (
          <p className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden /> ou incluse dans l’abonnement Premium
          </p>
        )}
        {accessLine && <p className="text-sm text-muted-foreground">{accessLine}</p>}
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-3">
          {primary}
          {showSubscriptionOffer && (
            <Button asChild variant="outline" className="w-full">
              <Link href="/pricing">
                <Crown className="mr-2 h-4 w-4" aria-hidden /> {state === "lapsed" ? "Se réabonner à Premium" : "Voir l’abonnement Premium"}
              </Link>
            </Button>
          )}
          {hasPreview && state !== "entitled" && state !== "staff" && (
            <Button asChild variant="secondary" className="w-full">
              <Link href={`/learn/${course.slug}`}>
                <PlayCircle className="mr-2 h-4 w-4" aria-hidden /> Regarder l’aperçu gratuit
              </Link>
            </Button>
          )}
        </div>

        {purchasable && state !== "entitled" && state !== "staff" && (
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden />
            Paiement sécurisé par Stripe. Remboursement sur demande sous {REFUND_WINDOW_DAYS} jours, depuis la page Facturation,
            tant que la formation n’est pas terminée.
          </p>
        )}

        {included.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h2 className="text-sm font-semibold">Cette formation comprend</h2>
              <ul className="space-y-2.5">
                {included.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-sm">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
