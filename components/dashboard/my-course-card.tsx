import Image from "next/image";
import Link from "next/link";
import { Award, BookOpen, Clock, Crown, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LAPSED_REASON_TEXT } from "@/lib/access/offer";
import { categoryLabel, levelLabel } from "@/lib/courses/labels";
import { formatSeconds } from "@/lib/format-duration";
import type { CourseProgressSummary } from "@/lib/progress-summary";

/** Where the learner stands in the course, in words: the badge on the card. */
export function courseStatusLabel(course: CourseProgressSummary): string | null {
  if (!course.published) return "Formation retirée du catalogue";
  if (!course.hasAccess) return "Accès expiré";
  if (course.isComplete || course.hasCertificate) return "Terminée";
  return null;
}

/** A course of « Mon apprentissage »: its progress, its next step, and what to do. */
export function MyCourseCard({ course, lifetime }: { course: CourseProgressSummary; lifetime: boolean }) {
  const status = courseStatusLabel(course);
  const finished = course.isComplete || course.hasCertificate;
  const action = !course.hasAccess
    ? "Voir comment reprendre"
    : finished
      ? "Revoir"
      : course.done === 0
        ? "Commencer"
        : "Continuer";

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="relative h-36 bg-muted">
        {course.thumbnail ? (
          <Image src={course.thumbnail} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-10 w-10 text-muted-foreground" aria-hidden />
          </div>
        )}
        {lifetime && course.hasAccess && (
          <Badge className="absolute right-3 top-3 gap-1">
            <Crown className="h-3 w-3" aria-hidden /> Achetée à vie
          </Badge>
        )}
      </div>
      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{categoryLabel(course.category)}</Badge>
            <Badge variant="secondary">{levelLabel(course.level)}</Badge>
            {status && <Badge variant={course.hasAccess ? "default" : "destructive"}>{status}</Badge>}
          </div>
          <h3 className="text-lg font-bold leading-snug">
            <Link href={`/formations/${course.slug}`} className="hover:underline">
              {course.title}
            </Link>
          </h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {course.total === 0 ? "Pas encore d’étape publiée" : `${course.done} / ${course.total} étapes`}
            </span>
            {course.total > 0 && <span className="font-medium">{course.percent} %</span>}
          </div>
          <Progress value={course.percent} aria-label={`Progression dans ${course.title}`} className="h-2" />
          {course.nextStepTitle && (
            <p className="text-sm">
              <span className="text-muted-foreground">Prochaine étape : </span>
              {course.nextStepTitle}
            </p>
          )}
          {!course.hasAccess && course.lapsed && <p className="text-sm text-muted-foreground">{LAPSED_REASON_TEXT[course.lapsed].title}. Votre progression est conservée.</p>}
        </div>

        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          {course.totalDurationSec > 0 ? (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden /> {formatSeconds(course.totalDurationSec)}
            </span>
          ) : (
            <span />
          )}
          <span>Dernière activité : {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(course.lastActivityAt)}</span>
        </div>

        <div className="mt-auto flex gap-2">
          <Button asChild className="flex-1" variant={finished || !course.hasAccess ? "outline" : "default"}>
            <Link href={course.continueHref}>
              <Play className="mr-2 h-4 w-4" aria-hidden />
              {action}
              <span className="sr-only"> : {course.title}</span>
            </Link>
          </Button>
          {course.hasCertificate && (
            <Button asChild variant="outline">
              <Link href={`/certificates/${course.courseId}`}>
                <Award className="mr-2 h-4 w-4" aria-hidden /> Certificat
                <span className="sr-only"> de {course.title}</span>
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
