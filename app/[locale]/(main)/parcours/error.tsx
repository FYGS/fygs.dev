"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { reportClientError } from "@/lib/report-error";

export default function PathsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    void reportClientError(error);
  }, [error]);

  return (
    <div className="container mx-auto max-w-xl py-16">
      <Card role="alert" className="space-y-4 p-8 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <h1 className="text-2xl font-bold">Ce parcours n&apos;a pas pu s&apos;afficher</h1>
        <p className="text-muted-foreground">Votre progression est conservée. Vous pouvez réessayer ou revenir au catalogue.</p>
        {error.digest && <p className="text-xs text-muted-foreground">Référence : {error.digest}</p>}
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Réessayer</Button>
          <Button variant="outline" asChild>
            <Link href="/parcours">Tous les parcours</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
