"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentStatusProps {
  type: "success" | "canceled";
  courseTitle: string;
  courseSlug: string;
  /** The access is already open (the payment webhook arrived). */
  unlocked: boolean;
}

const POLL_MS = 2000;
const GIVE_UP_MS = 60_000;

/**
 * Back from Stripe. The access is opened by the payment webhook, which can take a few seconds: until it has, the page
 * says the payment is being confirmed (and the buy button is disabled), then refreshes itself.
 */
export function PaymentStatus({ type, courseTitle, courseSlug, unlocked }: PaymentStatusProps) {
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);
  const waiting = type === "success" && !unlocked;

  useEffect(() => {
    if (!waiting) return;
    const start = Date.now();
    let stopped = false;
    const timer = setInterval(async () => {
      if (stopped) return;
      if (Date.now() - start > GIVE_UP_MS) {
        clearInterval(timer);
        setTimedOut(true);
        return;
      }
      try {
        const res = await fetch(`/api/courses/status?slug=${encodeURIComponent(courseSlug)}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { unlocked?: boolean };
        if (data.unlocked) {
          stopped = true;
          clearInterval(timer);
          router.refresh();
        }
      } catch {
        // offline for a moment: the next tick tries again
      }
    }, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [waiting, courseSlug, router]);

  if (type === "canceled") {
    return (
      <div role="status" className="mb-6 flex flex-wrap items-start gap-3 rounded-lg border bg-muted/40 p-4">
        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Paiement annulé</p>
          <p className="text-sm text-muted-foreground">Aucun montant n’a été débité. Vous pouvez reprendre l’achat quand vous voulez.</p>
        </div>
      </div>
    );
  }

  if (unlocked) {
    return (
      <div
        role="status"
        className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-emerald-600/40 bg-emerald-50 p-4 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-50"
      >
        <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />
        <p className="min-w-0 flex-1">
          <span className="font-semibold">Paiement confirmé.</span> Vous avez accès à « {courseTitle} ».
        </p>
        <Button asChild size="sm">
          <Link href={`/learn/${courseSlug}`}>Commencer la formation</Link>
        </Button>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-6 flex flex-wrap items-start gap-3 rounded-lg border border-amber-600/40 bg-amber-50 p-4 text-amber-950 dark:bg-amber-950/40 dark:text-amber-50"
    >
      {timedOut ? <Clock className="mt-0.5 h-5 w-5 shrink-0" aria-hidden /> : <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin" aria-hidden />}
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-semibold">{timedOut ? "La confirmation prend plus de temps que prévu" : "Paiement en cours de confirmation…"}</p>
        <p className="text-sm">
          {timedOut
            ? "Votre paiement est enregistré par Stripe ; l’accès s’ouvrira dès sa confirmation et vous recevrez un e-mail. Actualisez la page dans quelques minutes."
            : "Votre accès s’ouvre dès que Stripe nous confirme le paiement, en général en quelques secondes."}
        </p>
      </div>
      {timedOut && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => router.refresh()}>
            Actualiser
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/dashboard/billing">Voir mes paiements</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
