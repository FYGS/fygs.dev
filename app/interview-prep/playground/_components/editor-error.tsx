"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { glassCard } from "@/app/_lib/theme-utils";

interface EditorErrorProps {
  reset: () => void;
  error?: Error & { digest?: string };
}

export function EditorError({ reset, error }: EditorErrorProps) {
  return (
    <Card className={`${glassCard} p-8 space-y-4 text-center`}>
      <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
      <h2 className="text-xl font-semibold">Something went wrong!</h2>
      <p className="text-muted-foreground">
        {error?.message || "There was an error loading the editor."}
      </p>
      <Button onClick={reset}>Try again</Button>
    </Card>
  );
}
