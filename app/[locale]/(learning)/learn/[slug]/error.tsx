"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportClientError } from "@/lib/report-error";

/** A step that failed to show, inside the learning shell: the plan stays, progress is kept, the learner can retry. */
export default function LearningError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const params = useParams<{ slug: string }>();
  useEffect(() => {
    console.error(error);
    void reportClientError(error);
  }, [error]);

  return (
    <div role="alert" className="space-y-4 rounded-lg border p-8 text-center">
      <AlertTriangle className="mx-auto h-10 w-10 text-amber-600 dark:text-amber-400" aria-hidden />
      <h1 className="text-2xl font-bold">Cette étape n’a pas pu s’afficher</h1>
      <p className="text-muted-foreground">Votre progression est conservée. Réessayez, ou choisissez une autre étape dans le plan.</p>
      {error.digest && <p className="text-xs text-muted-foreground">Référence : {error.digest}</p>}
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Réessayer</Button>
        {params?.slug && (
          <Button variant="outline" asChild>
            <Link href={`/formations/${params.slug}`}>Page de la formation</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
