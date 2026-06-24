"use client";

import { Check, Loader2, AlertCircle, CloudOff } from "lucide-react";

interface AutoSaveIndicatorProps {
  status: "idle" | "saving" | "saved" | "error";
  lastSaved: Date | null;
}

export function AutoSaveIndicator({
  status,
  lastSaved,
}: AutoSaveIndicatorProps) {
  if (status === "idle" && !lastSaved) return null;

  return (
    <div className="flex items-center gap-1.5 text-caption text-muted-foreground">
      {status === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Sauvegarde...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="h-3 w-3 text-green-500" />
          <span className="text-green-500">Sauvegardé</span>
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="h-3 w-3 text-destructive" />
          <span className="text-destructive">Erreur de sauvegarde</span>
        </>
      )}
      {status === "idle" && lastSaved && (
        <>
          <CloudOff className="h-3 w-3" />
          <span>
            Dernière sauvegarde{" "}
            {lastSaved.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </>
      )}
    </div>
  );
}
