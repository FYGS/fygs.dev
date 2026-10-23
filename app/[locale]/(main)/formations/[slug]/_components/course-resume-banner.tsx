import Link from "next/link";
import { ArrowRight, Award, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface CourseResumeBannerProps {
  percent: number;
  done: number;
  total: number;
  /** Title and link of the next step, null when everything is done. */
  next: { title: string; href: string } | null;
  completedHref: string;
  hasCertificate: boolean;
}

/** For an enrolled learner: where they are and the one button that continues. */
export function CourseResumeBanner({ percent, done, total, next, completedHref, hasCertificate }: CourseResumeBannerProps) {
  const started = done > 0;
  return (
    <section aria-label="Votre progression" className="space-y-3 rounded-xl border bg-primary/5 p-5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">
          {done} étape{done > 1 ? "s" : ""} sur {total}
        </span>
        <span className="text-muted-foreground">{percent}%</span>
      </div>
      <Progress value={percent} aria-label="Progression dans la formation" className="h-2" />
      {next ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="min-w-0 text-sm text-muted-foreground">
            {started ? "Prochaine étape" : "Pour commencer"} : <span className="font-medium text-foreground">{next.title}</span>
          </p>
          <Button asChild>
            <Link href={next.href}>
              <Play className="mr-2 h-4 w-4" aria-hidden /> {started ? "Reprendre" : "Commencer"} <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium">Formation terminée.</p>
          <Button asChild variant="outline">
            <Link href={completedHref}>
              <Award className="mr-2 h-4 w-4" aria-hidden /> {hasCertificate ? "Voir mon certificat" : "Voir le bilan"}
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}
