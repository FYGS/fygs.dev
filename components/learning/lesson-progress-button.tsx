"use client";

import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLessonSession } from "./lesson-session";

/** Marks the lesson as done. The lesson counts at once; the server confirms (or the button comes back). */
export function LessonProgressButton({ className }: { className?: string }) {
  const { completed, completing, complete, recording } = useLessonSession();

  if (!recording) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        Aperçu : la progression n’est pas enregistrée.
      </p>
    );
  }

  return (
    <Button
      type="button"
      variant={completed ? "secondary" : "default"}
      onClick={() => void complete()}
      disabled={completed || completing}
      aria-pressed={completed}
      className={cn(
        "gap-2",
        completed && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 disabled:opacity-100",
        className,
      )}
    >
      {completing ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : completed ? (
        <CheckCircle2 className="h-4 w-4" aria-hidden />
      ) : (
        <Circle className="h-4 w-4" aria-hidden />
      )}
      {completed ? "Terminée" : "Marquer comme terminée"}
    </Button>
  );
}
