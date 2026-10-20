"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { moderateReviewAction } from "../_actions/moderate-review";

/** Approve / reject buttons of one review. The server action checks the role again and applies the decision. */
export function ModerationActions({
  reviewId,
  status,
  author,
  courseTitle,
}: {
  reviewId: string;
  status: string;
  author: string;
  courseTitle: string;
}) {
  const [pending, startTransition] = useTransition();
  const about = `l'avis de ${author} sur ${courseTitle}`;

  const decide = (decision: "APPROVE" | "REJECT") =>
    startTransition(async () => {
      const result = await moderateReviewAction({ reviewId, decision });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      if (!result.changed) toast.info("Cet avis avait déjà été traité");
      else toast.success(decision === "APPROVE" ? "Avis approuvé" : "Avis rejeté");
    });

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="text-green-400 hover:text-green-300"
        disabled={pending || status === "APPROVED"}
        onClick={() => decide("APPROVE")}
        aria-label={`Approuver ${about}`}
      >
        <CheckCircle className="h-4 w-4 mr-1" aria-hidden="true" />
        Approuver
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-red-400 hover:text-red-300"
        disabled={pending || status === "REJECTED"}
        onClick={() => decide("REJECT")}
        aria-label={`Rejeter ${about}`}
      >
        <XCircle className="h-4 w-4 mr-1" aria-hidden="true" />
        Rejeter
      </Button>
    </div>
  );
}
