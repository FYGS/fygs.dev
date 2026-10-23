import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

type LockedReason = "not_enrolled" | "premium_locked" | "unpublished" | string | undefined;

/** Why a lesson link sent the visitor back here, and the one thing to do about it. */
export function LockedNotice({ reason, signedIn }: { reason: LockedReason; signedIn: boolean }) {
  const expired = reason === "premium_locked";
  return (
    <div role="alert" className="flex flex-wrap items-start gap-4 rounded-lg border border-amber-500/50 bg-amber-50 p-4 text-amber-950 dark:bg-amber-950/30 dark:text-amber-50">
      <Lock className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-semibold">{expired ? "Votre accès à cette formation n’est plus actif" : "Cette leçon est réservée aux inscrits"}</p>
        <p className="text-sm">
          {expired
            ? "Votre abonnement n’est plus actif. Réactivez-le pour reprendre la formation là où vous l’avez laissée : votre progression est conservée."
            : signedIn
              ? "Inscrivez-vous à la formation pour suivre toutes les leçons, les quiz et obtenir le certificat."
              : "Connectez-vous et inscrivez-vous à la formation pour suivre toutes les leçons."}
        </p>
      </div>
      {expired ? (
        <Button asChild>
          <Link href="/pricing">Voir les abonnements</Link>
        </Button>
      ) : !signedIn ? (
        <Button asChild>
          <Link href="/auth/login">Se connecter</Link>
        </Button>
      ) : null}
    </div>
  );
}
