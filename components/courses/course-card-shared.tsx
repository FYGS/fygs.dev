"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Clock, Crown, Play, Star, Users } from "lucide-react";
import { useIntlayer } from "next-intlayer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { enqueueAnalytics } from "@/lib/analytics-batch";
import type { CourseCardData } from "@/lib/access/course-cards";
import { useSession } from "@/lib/auth-client";
import { LEVEL_BADGE_CLASSES } from "@/lib/courses/labels";
import { formatMinutes } from "@/lib/format-duration";
import { formatNumber, formatPrice } from "@/lib/price-format";
import { cn } from "@/lib/utils";

export interface CourseCardSharedProps {
  course: CourseCardData;
  className?: string;
  size?: "default" | "compact";
}

const STATUS_CLASSES = {
  enrolled: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  purchased: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  subscription: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  granted: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  lapsed: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200",
  staff: "bg-muted text-foreground",
} as const;

/** A course in the catalog or on the home page. Offer, status and button come from `toCourseCards` (server). */
export function CourseCardShared({ course, size = "default", className }: CourseCardSharedProps) {
  const content = useIntlayer("course-card-shared");
  const { data: session } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    enqueueAnalytics({ type: "COURSE_CARD_VIEWED", userId, context: { courseId: course.id, status: course.status } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.id]);

  const compact = size === "compact";
  const level = content.levels[course.level as keyof typeof content.levels]?.value ?? course.level;
  const levelClass = LEVEL_BADGE_CLASSES[course.level as keyof typeof LEVEL_BADGE_CLASSES] ?? "";
  const duration = formatMinutes(course.minutes);
  const { offer, status } = course;

  const priceLabel =
    offer.kind === "free"
      ? content.price.free.value
      : offer.price === null
        ? content.price.subscriptionOnly.value
        : formatPrice(offer.price, { freeLabel: false });
  // A bought or enrolled course no longer shows a price to pay
  const showPrice = status === "none" || status === "lapsed";

  return (
    <Card className={cn("group relative flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md", className)}>
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/15 to-primary/5">
              <Play className="h-10 w-10 text-primary/40" aria-hidden />
            </div>
          )}
          <div className="absolute left-2 top-2 flex flex-wrap gap-2">
            {course.featured && <Badge className="bg-primary text-primary-foreground">{content.badges.popular.value}</Badge>}
            {status !== "none" ? (
              <Badge variant="secondary" className={STATUS_CLASSES[status]}>
                {content.status[status].value}
              </Badge>
            ) : offer.kind === "premium" ? (
              <Badge className="flex items-center gap-1 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                <Crown className="h-3 w-3" aria-hidden /> {content.badges.premium.value}
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                {content.badges.free.value}
              </Badge>
            )}
          </div>
          <div className="absolute right-2 top-2">
            <Badge variant="secondary" className={levelClass}>
              {level}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn("flex-1 space-y-3", compact ? "p-4" : "p-6")}>
        <h3 className={cn("font-semibold leading-tight line-clamp-2", compact ? "text-sm" : "text-lg")}>
          <Link href={`/formations/${course.slug}`} className="hover:text-primary focus-visible:underline">
            {course.title}
          </Link>
        </h3>
        <p className={cn("text-muted-foreground line-clamp-2", compact ? "text-xs" : "text-sm")}>{course.description}</p>
        <dl className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {duration && (
            <div className="flex items-center gap-1">
              <dt className="sr-only">{content.a11y.duration.value}</dt>
              <Clock className="h-3 w-3" aria-hidden />
              <dd>{duration}</dd>
            </div>
          )}
          <div className="flex items-center gap-1">
            <dt className="sr-only">{content.a11y.learners.value}</dt>
            <Users className="h-3 w-3" aria-hidden />
            <dd>{formatNumber(course.enrollmentCount)}</dd>
          </div>
          {course.averageRating > 0 && (
            <div className="flex items-center gap-1">
              <dt className="sr-only">{content.a11y.rating.value}</dt>
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" aria-hidden />
              <dd>{course.averageRating.toFixed(1).replace(".", ",")}</dd>
            </div>
          )}
        </dl>
      </CardContent>

      <CardFooter className={cn(compact ? "p-4 pt-0" : "p-6 pt-0")}>
        <div className="flex w-full flex-wrap items-end justify-between gap-3">
          <div className="space-y-0.5">
            {showPrice && <p className={cn("font-bold", compact ? "text-sm" : "text-xl")}>{priceLabel}</p>}
            {showPrice && offer.kind === "premium" && offer.price !== null && (
              <p className="flex items-center gap-1 text-xs font-medium text-amber-800 dark:text-amber-200">
                <Crown className="h-3 w-3" aria-hidden /> {content.price.orPremium.value}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {course.hasPreview && (
              <Button asChild variant="outline" size={compact ? "sm" : "default"}>
                <Link href={`/learn/${course.slug}`} aria-label={`${content.cta.preview.value} : ${course.title}`}>
                  <Play className="mr-1 h-4 w-4" aria-hidden /> {content.cta.preview.value}
                </Link>
              </Button>
            )}
            <Button asChild size={compact ? "sm" : "default"}>
              <Link
                href={course.action.href}
                aria-label={`${content.cta[course.action.kind].value} : ${course.title}`}
                onClick={() =>
                  enqueueAnalytics({
                    type: "COURSE_CARD_CTA_CLICKED",
                    userId,
                    context: { courseId: course.id, status, cta: course.action.kind },
                  })
                }
              >
                {content.cta[course.action.kind].value}
              </Link>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
