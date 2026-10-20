"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { moderateReviewAction } from "../_actions/moderate-review";

/** Decision on one review, with the optional note that goes into its moderation history. */
export function ReviewDecision({ reviewId, status }: { reviewId: string; status: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  const decide = (decision: "APPROVE" | "REJECT") =>
    startTransition(async () => {
      const result = await moderateReviewAction({ reviewId, decision, note: note.trim() || undefined });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast[result.changed ? "success" : "info"](
        result.changed ? (decision === "APPROVE" ? "Avis approuvé" : "Avis rejeté") : "Cet avis avait déjà ce statut",
      );
      setNote("");
      router.refresh();
    });

  return (
    <div className="space-y-3">
      <label htmlFor="moderation-note" className="text-sm font-medium">
        Note de modération (facultative)
      </label>
      <textarea
        id="moderation-note"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        maxLength={500}
        rows={3}
        placeholder="Pourquoi cette décision ? Elle sera conservée dans l'historique."
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      <div className="flex flex-col gap-2">
        <Button size="sm" disabled={pending || status === "APPROVED"} onClick={() => decide("APPROVE")}>
          <CheckCircle className="h-4 w-4 mr-2" aria-hidden="true" />
          Approuver
        </Button>
        <Button variant="destructive" size="sm" disabled={pending || status === "REJECTED"} onClick={() => decide("REJECT")}>
          <XCircle className="h-4 w-4 mr-2" aria-hidden="true" />
          Rejeter
        </Button>
      </div>
    </div>
  );
}
