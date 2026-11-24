"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { requestRefund } from "@/app/[locale]/(main)/dashboard/actions/requestRefund";
import { requestCourseRefund } from "@/app/[locale]/(main)/dashboard/actions/requestCourseRefund";

type RefundTarget =
  | { kind: "subscription"; subscriptionId: string }
  | { kind: "course"; paymentId: string; courseTitle: string };

/** "Demander un remboursement", with a confirmation that says what stops. */
export function RefundButton({ target, className }: { target: RefundTarget; className?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const confirmRefund = () =>
    startTransition(async () => {
      const result =
        target.kind === "subscription"
          ? await requestRefund({ subscriptionId: target.subscriptionId, reason: "Demande depuis la page Facturation" })
          : await requestCourseRefund({ paymentId: target.paymentId });
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error("Remboursement impossible", { description: result.message });
      }
    });

  const consequence =
    target.kind === "subscription"
      ? "Votre abonnement s’arrête tout de suite et les formations Premium se ferment. Votre progression est conservée."
      : `L’accès à « ${target.courseTitle} » se ferme tout de suite. Votre progression est conservée si vous la rachetez.`;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={pending} className={className}>
          <RotateCcw className={`mr-2 h-4 w-4 ${pending ? "animate-spin" : ""}`} aria-hidden />
          {pending ? "Remboursement en cours…" : "Demander un remboursement"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Demander le remboursement ?</AlertDialogTitle>
          <AlertDialogDescription>
            {consequence} Le montant revient sur votre moyen de paiement sous 5 à 10 jours.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={confirmRefund}>Confirmer le remboursement</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
