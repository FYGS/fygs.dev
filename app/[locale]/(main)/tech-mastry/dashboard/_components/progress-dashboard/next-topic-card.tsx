import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Compass } from "lucide-react";
import Link from "next/link";
import type { NextTopic } from "../../../_utils/progress-stats";

/** What to do now: the next topic of the path, with its area and how long it takes. */
export function NextTopicCard({ next }: { next: NextTopic }) {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
        <Compass className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{next.kind === "start" ? "Pour commencer" : "Pour continuer"} · {next.area}</p>
          <p className="text-lg font-semibold">{next.title}</p>
          <p className="text-sm text-muted-foreground">Environ {next.minutes} min</p>
        </div>
        <Button asChild>
          <Link href={next.href}>
            {next.kind === "start" ? "Commencer" : "Continuer"}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
