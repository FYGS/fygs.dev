"use client";

import { useState, useTransition, useOptimistic } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LessonProgressButtonProps {
  lessonId: string;
  initialCompleted: boolean;
  onMarkComplete: (lessonId: string) => Promise<{ success: boolean }>;
}

export function LessonProgressButton({
  lessonId,
  initialCompleted,
  onMarkComplete,
}: LessonProgressButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [completed, setCompleted] = useState(initialCompleted);
  const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(
    completed,
    (_current, next: boolean) => next,
  );
  const [error, setError] = useState(false);

  const handleClick = () => {
    if (optimisticCompleted) return;
    setError(false);

    startTransition(async () => {
      setOptimisticCompleted(true);
      const result = await onMarkComplete(lessonId);
      if (result.success) {
        setCompleted(true);
      } else {
        setOptimisticCompleted(false);
        setError(true);
      }
    });
  };

  return (
    <Button
      variant={optimisticCompleted ? "secondary" : "default"}
      size="sm"
      onClick={handleClick}
      disabled={optimisticCompleted || isPending}
      className={cn(
        "gap-2 transition-all",
        optimisticCompleted &&
          "bg-green-500/10 text-green-600 border-green-500/30",
        error && "bg-destructive/10 text-destructive",
      )}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : optimisticCompleted ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <Circle className="h-4 w-4" />
      )}
      {optimisticCompleted ? "Terminée" : "Marquer comme terminée"}
      {error && <span className="text-xs">(erreur)</span>}
    </Button>
  );
}
