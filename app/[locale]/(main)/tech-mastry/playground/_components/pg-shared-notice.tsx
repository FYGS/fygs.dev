"use client";

import { AlertTriangle, X } from "lucide-react";
import { usePlaygroundStore } from "../_stores/playground-store";

/**
 * Shown after a `?code=` link was opened. The code was written by someone else: the learner is asked to read it before
 * running it, and the banner stays until they click (it never closes by itself, and nothing runs meanwhile).
 */
export function PgSharedNotice() {
  const notice = usePlaygroundStore((s) => s.sharedNotice);
  const dismiss = usePlaygroundStore((s) => s.dismissSharedNotice);

  if (!notice) return null;
  const invalid = notice.kind === "invalid";

  return (
    <div
      role={invalid ? "alert" : "status"}
      className="flex items-start gap-3 border-b border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-100"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden />
      <div className="min-w-0 flex-1">
        {invalid ? (
          <p>
            <strong className="font-semibold">Lien non ouvert.</strong> {notice.message}
          </p>
        ) : (
          <p>
            <strong className="font-semibold">Code reçu par lien : relisez-le avant de l&apos;exécuter.</strong>{" "}
            {notice.files > 1 ? `${notice.files} fichiers ont été ouverts` : "Un fichier a été ouvert"} à la place de
            votre projet. Il a été écrit par quelqu&apos;un d&apos;autre et n&apos;a pas été lancé.
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-amber-500/40 px-2 text-xs font-medium hover:bg-amber-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
      >
        <X className="h-3 w-3" aria-hidden />
        {invalid ? "Fermer" : "J'ai compris"}
      </button>
    </div>
  );
}
