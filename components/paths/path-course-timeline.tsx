import Link from "next/link";
import { CheckCircle2, Circle, CircleDot, Lock, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { courseOffer } from "@/lib/access/offer";
import { LEVEL_LABELS } from "@/lib/courses/labels";
import { formatPrice } from "@/lib/price-format";
import { formatMinutes } from "@/lib/format-duration";
import {
  PATH_COURSE_STATUS_LABELS,
  pathCourseStatus,
  type PathCourseStatus,
} from "@/lib/paths/rules";
import type { PathCourseView } from "@/lib/paths/queries";
import type { PathCourseProgressView } from "@/lib/paths/progress";

type Row = PathCourseView & Partial<Pick<PathCourseProgressView, "status" | "percent" | "href" | "entitled">>;

const ICONS: Record<PathCourseStatus, typeof Circle> = {
  completed: CheckCircle2,
  in_progress: CircleDot,
  not_started: Circle,
  needs_access: Lock,
  unavailable: TriangleAlert,
};

/** What opens the course, in words: shown for every course of the programme. */
function offerText(course: Pick<PathCourseView, "accessTier" | "price">): string {
  const offer = courseOffer(course.accessTier, course.price);
  if (offer.kind === "free") return "Gratuite";
  return offer.price === null
    ? "Incluse dans l’abonnement Premium"
    : `${formatPrice(offer.price, { freeLabel: false })} ou incluse dans l’abonnement Premium`;
}

function actionLabel(status: PathCourseStatus, signedIn: boolean) {
  switch (status) {
    case "completed":
      return "Revoir";
    case "in_progress":
      return "Continuer";
    case "needs_access":
      return "Voir les offres";
    default:
      return signedIn ? "Commencer" : "Voir la formation";
  }
}

/**
 * The ordered courses of a path. For a signed-in learner each row carries a status and a button;
 * for a visitor it is the programme (no progress, access tier shown).
 */
export function PathCourseTimeline({
  courses,
  signedIn,
  nextCourseId,
}: {
  courses: Row[];
  signedIn: boolean;
  nextCourseId?: string | null;
}) {
  return (
    <ol className="space-y-3" aria-label="Formations du parcours">
      {courses.map((course, index) => {
        const status =
          course.status ??
          pathCourseStatus({ available: course.available, entitled: true, enrolled: false, percent: 0, isComplete: false });
        const Icon = ICONS[status];
        const isNext = course.courseId === nextCourseId;
        const href = course.href ?? `/formations/${course.slug}`;
        return (
          <li
            key={course.courseId}
            className={`relative flex gap-4 rounded-xl border bg-card p-4 sm:p-5 ${isNext ? "border-primary ring-1 ring-primary/40" : ""}`}
            aria-current={isNext ? "step" : undefined}
          >
            <div className="flex flex-col items-center">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold ${
                  status === "completed" ? "border-emerald-600 bg-emerald-600 text-white" : "bg-background"
                }`}
                aria-hidden
              >
                {status === "completed" ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
              </span>
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold leading-snug">{course.title}</h3>
                {course.optional && <Badge variant="outline">Facultative</Badge>}
                <Badge variant={course.accessTier === "PREMIUM" ? "secondary" : "outline"}>{offerText(course)}</Badge>
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
              <p className="text-xs text-muted-foreground">
                {LEVEL_LABELS[course.level]} · {course.lessonsCount} leçon{course.lessonsCount > 1 ? "s" : ""} ·{" "}
                {formatMinutes(course.minutes) || "—"}
              </p>
              {signedIn && course.status && (
                <div className="space-y-1">
                  <p className="flex items-center gap-1.5 text-sm font-medium">
                    <Icon className="h-4 w-4" aria-hidden />
                    {PATH_COURSE_STATUS_LABELS[status]}
                    {status === "in_progress" && <span className="font-normal text-muted-foreground">· {course.percent} %</span>}
                  </p>
                  {(status === "in_progress" || status === "completed") && (
                    <Progress value={course.percent ?? 0} aria-label={`Progression dans ${course.title}`} className="h-1.5" />
                  )}
                </div>
              )}
            </div>
            {status !== "unavailable" && (
              <div className="flex shrink-0 items-start">
                <Button asChild size="sm" variant={isNext ? "default" : "outline"}>
                  <Link href={href}>
                    {actionLabel(status, signedIn)}
                    <span className="sr-only"> : {course.title}</span>
                  </Link>
                </Button>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
