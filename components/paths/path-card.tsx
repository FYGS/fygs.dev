import Link from "next/link";
import { Award, BookOpen, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CourseThumbnail } from "@/components/marketing/course-thumbnail";
import { LEVEL_LABELS } from "@/lib/courses/labels";
import { formatMinutes } from "@/lib/format-duration";
import type { PathSummary } from "@/lib/paths/queries";

export interface PathCardProgress {
  percent: number;
  isComplete: boolean;
}

/** A path in a grid: cover, level, what it contains, and the learner's progress when enrolled. */
export function PathCard({ path, progress }: { path: PathSummary; progress?: PathCardProgress | null }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-shadow focus-within:ring-2 focus-within:ring-ring hover:shadow-md">
      <CourseThumbnail src={path.thumbnail} alt="" className="aspect-video w-full rounded-none" width={640} height={360} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{LEVEL_LABELS[path.level]}</Badge>
          {path.featured && <Badge>À la une</Badge>}
          {progress?.isComplete && (
            <Badge variant="outline" className="gap-1 border-emerald-600 text-emerald-700 dark:text-emerald-400">
              <Award className="h-3 w-3" aria-hidden /> Terminé
            </Badge>
          )}
        </div>
        <h3 className="text-lg font-semibold leading-snug">
          {/* the whole card is the link: one tab stop, one name for assistive technology */}
          <Link href={`/parcours/${path.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {path.title}
          </Link>
        </h3>
        <p className="line-clamp-3 text-sm text-muted-foreground">{path.description}</p>
        <ul className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" aria-hidden />
            {path.courseCount} formation{path.courseCount > 1 ? "s" : ""}
          </li>
          <li className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" aria-hidden />
            {formatMinutes(path.minutes) || "—"}
          </li>
        </ul>
        {progress && (
          <div className="space-y-1">
            <Progress value={progress.percent} aria-label={`Progression dans le parcours ${path.title}`} />
            <p className="text-xs text-muted-foreground">{progress.percent} % accompli</p>
          </div>
        )}
      </div>
    </article>
  );
}
