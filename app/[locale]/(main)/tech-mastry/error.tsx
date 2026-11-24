"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { reportClientError } from "@/lib/report-error";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

/** A lesson that fails to render keeps the sidebar and the header: only the content area is replaced. */
export default function TechMasteryError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    void reportClientError(error);
  }, [error]);

  return (
    <Card role="alert" className="mx-auto max-w-xl space-y-4 p-8 text-center">
      <AlertTriangle className="mx-auto h-10 w-10 text-amber-600 dark:text-amber-400" aria-hidden="true" />
      <h1 className="text-2xl font-bold">Ce sujet n&apos;a pas pu s&apos;afficher</h1>
      <p className="text-muted-foreground">
        Une erreur est survenue en affichant cette page. Votre progression est conservée. Vous pouvez réessayer ou choisir un autre sujet dans le menu.
      </p>
      {error.digest && <p className="text-xs text-muted-foreground">Référence : {error.digest}</p>}
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Réessayer</Button>
        <Button variant="outline" asChild>
          <Link href="/tech-mastry">Retour à TechMastery</Link>
        </Button>
      </div>
    </Card>
  );
}
