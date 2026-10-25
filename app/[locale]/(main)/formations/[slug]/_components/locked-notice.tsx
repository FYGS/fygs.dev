import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LAPSED_REASON_TEXT } from "@/lib/access/offer";
import type { LapsedReason } from "@/lib/access/entitlement";

export interface LockedNoticeProps {
  signedIn: boolean;
  /** Free course: enrolling is enough. */
  free: boolean;
  /** Holds a right but did not start the course yet. */
  eligible: boolean;
  lapsed: LapsedReason | null;
  unpublished: boolean;
  /** Where to come back after signing in (the step that was asked for). */
  returnTo: string;
}

/**
 * Why a link to the learning area brought the visitor back to the course page, and the one thing to do about it.
 * The reason comes from the visitor's entitlement (lib/access/entitlement.ts), not from the URL.
 */
export function LockedNotice({ signedIn, free, eligible, lapsed, unpublished, returnTo }: LockedNoticeProps) {
  const { title, body, action } = (() => {
    if (unpublished) {
      return { title: "Cette formation n’est plus proposée", body: "Elle a été retirée du catalogue. Votre progression est conservée.", action: null };
    }
    if (!signedIn) {
      return {
        title: "Connectez-vous pour continuer",
        body: free
          ? "Cette formation est gratuite : connectez-vous (ou créez un compte) et inscrivez-vous pour suivre toutes les étapes."
          : "Connectez-vous pour suivre cette formation, ou regardez les leçons d’aperçu gratuit.",
        action: { href: `/auth/login?callbackUrl=${encodeURIComponent(returnTo)}`, label: "Se connecter" },
      };
    }
    if (lapsed) return { ...LAPSED_REASON_TEXT[lapsed], action: null };
    if (eligible) {
      return { title: "Commencez la formation pour y accéder", body: "Elle vous est ouverte : un clic sur « Commencer la formation » et vous y êtes.", action: null };
    }
    return free
      ? { title: "Inscrivez-vous pour suivre cette étape", body: "La formation est gratuite : inscrivez-vous pour suivre toutes les leçons, les quiz et obtenir le certificat.", action: null }
      : { title: "Cette étape est réservée aux apprenants de la formation", body: "Achetez la formation ou abonnez-vous à Premium pour suivre toutes les étapes et obtenir le certificat.", action: null };
  })();

  return (
    <div
      role="alert"
      className="flex flex-wrap items-start gap-4 rounded-lg border border-amber-600/40 bg-amber-50 p-4 text-amber-950 dark:bg-amber-950/40 dark:text-amber-50"
    >
      <Lock className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm">{body}</p>
      </div>
      {action && (
        <Button asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
