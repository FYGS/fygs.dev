"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { Play, Clock, Users, Star, Crown, Lock, Shield } from "lucide-react";
import { formatEuro, formatNumber } from "@/lib/price-format";
import { useEffect } from "react";
import { enqueueAnalytics } from "@/lib/analytics-batch";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useIntlayer } from "next-intlayer";

// Access state model centralization
export type CourseAccessState = "LOCKED" | "ENROLLED" | "FREE";

export interface SharedCourseCardCourseLike {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  level: string;
  category?: string;
  tags: Array<{ id: string; name: string; color?: string }>;
  duration?: number | null; // minutes
  enrollmentCount?: number;
  averageRating?: number;
  featured?: boolean;
  thumbnail?: string | null;
  firstLessonSlug?: string | null;
  previewEnabled?: boolean;
  requiredTier?: string | null;
  isUnlocked?: boolean; // legacy flag; prefer accessState
  unlockedLabel?: string | null;
}

export interface CourseCardSharedProps {
  course: SharedCourseCardCourseLike;
  accessState: CourseAccessState; // computed server side (entitlement + enrollment)
  showPreviewCTA?: boolean;
  className?: string;
  size?: "default" | "compact";
}

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "bg-green-900 text-green-300",
  INTERMEDIATE: "bg-blue-900 text-blue-300",
  ADVANCED: "bg-orange-900 text-orange-300",
  EXPERT: "bg-red-900 text-red-300",
};

export function CourseCardShared({
  course,
  accessState,
  showPreviewCTA,
  size = "default",
  className,
}: CourseCardSharedProps) {
  const content = useIntlayer("course-card-shared");
  const { data: session } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    enqueueAnalytics({
      type: "COURSE_CARD_VIEWED",
      userId,
      context: { courseId: course.id, accessState },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.id]);
  const minutes = course.duration || 0;
  const hours = minutes > 0 ? Math.max(1, Math.round(minutes / 60)) : 0;
  const enrollmentCount = course.enrollmentCount ?? 0;
  const rating = course.averageRating ?? 0;

  const level =
    content.levels[course.level as keyof typeof content.levels]?.value ||
    course.level;

  const accessBadge = (state: CourseAccessState) => {
    switch (state) {
      case "ENROLLED":
        return (
          <Badge className="bg-green-600 hover:bg-green-600 text-white">
            {content.badges.enrolled.value}
          </Badge>
        );
      case "FREE":
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-900 text-emerald-300"
          >
            {content.badges.free.value}
          </Badge>
        );
      case "LOCKED":
      default:
        return null;
    }
  };

  const primaryCTA = (() => {
    switch (accessState) {
      case "ENROLLED":
        return {
          href: course.firstLessonSlug
            ? `/formations/${course.slug}/lessons/${course.firstLessonSlug}`
            : `/formations/${course.slug}`,
          label: content.cta.continue.value,
          icon: <Play className="h-4 w-4" />,
        };
      case "FREE":
        // Free course still requires explicit enrollment now
        return {
          href: `/formations/${course.slug}`,
          label: content.cta.enroll.value,
          icon: <Play className="h-4 w-4" />,
        };
      case "LOCKED":
      default:
        return {
          href: `/formations/${course.slug}`,
          label: content.cta.discover.value,
          icon: <Lock className="h-4 w-4" />,
        };
    }
  })();

  return (
    <Card
      className={cn(
        "group overflow-hidden hover:shadow-md transition-all",
        className
      )}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/15 to-primary/5">
              <Play className="h-10 w-10 text-primary/40" />
            </div>
          )}
          <div className="absolute top-2 left-2 flex gap-2 flex-wrap">
            {course.featured && (
              <Badge className="bg-primary text-primary-foreground">
                {content.badges.popular.value}
              </Badge>
            )}
            {accessBadge(accessState)}
            {course.requiredTier &&
              course.requiredTier !== "FREE" &&
              accessState === "LOCKED" && (
                <Badge className="bg-amber-700 text-white flex items-center gap-1">
                  <Shield className="h-3 w-3" /> {content.badges.premium.value}
                </Badge>
              )}
          </div>
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className={LEVEL_COLORS[course.level] || ""}
            >
              {level}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent
        className={cn("space-y-3", size === "compact" ? "p-4" : "p-6")}
      >
        <Link
          href={`/formations/${course.slug}`}
          className="block group/title"
        >
          <h3
            className={cn(
              "font-semibold leading-tight line-clamp-2 group-hover/title:text-primary transition-colors",
              size === "compact" ? "text-sm" : "text-lg"
            )}
          >
            {course.title}
          </h3>
        </Link>
        <p
          className={cn(
            "text-muted-foreground line-clamp-2",
            size === "compact" ? "text-xs" : "text-sm"
          )}
        >
          {course.description}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {hours}h
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {formatNumber(enrollmentCount)}
          </span>
          {rating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className={cn(size === "compact" ? "p-4 pt-0" : "p-6 pt-0")}>
        <div className="w-full flex items-end justify-between gap-3">
          <div className="space-y-0.5">
            <div
              className={cn(
                "font-bold",
                size === "compact" ? "text-sm" : "text-xl"
              )}
            >
              {course.price === 0
                ? content.freePrice.value
                : formatEuro(course.price)}
            </div>
            {accessState === "LOCKED" &&
              course.requiredTier &&
              course.requiredTier !== "FREE" && (
                <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1 tracking-tight">
                  <Crown className="h-3 w-3 text-amber-500" />{" "}
                  {content.includedWith.value}{" "}
                  <span className="underline decoration-dotted">
                    {content.badges.premium.value}
                  </span>
                </p>
              )}
          </div>
          <div className="flex gap-2">
            {showPreviewCTA &&
              course.previewEnabled &&
              course.firstLessonSlug && (
                <Button
                  asChild
                  variant="outline"
                  size={size === "compact" ? "sm" : "default"}
                >
                  <Link
                    href={`/formations/${course.slug}/lessons/${course.firstLessonSlug}?preview=1`}
                  >
                    <Play className="h-4 w-4 mr-1" />{" "}
                    {content.cta.preview.value}
                  </Link>
                </Button>
              )}
            <Button
              asChild
              size={size === "compact" ? "sm" : "default"}
              onClick={() =>
                enqueueAnalytics({
                  type: "COURSE_CARD_CTA_CLICKED",
                  userId,
                  context: {
                    courseId: course.id,
                    accessState,
                    cta: primaryCTA.label,
                  },
                })
              }
            >
              <Link href={primaryCTA.href} className="flex items-center gap-2">
                {primaryCTA.icon}
                <span>{primaryCTA.label}</span>
              </Link>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

// Skeleton placeholders for loading states
export function CourseCardSkeleton({
  count = 1,
  size = "default",
}: {
  count?: number;
  size?: "default" | "compact";
}) {
  return (
    <div
      className={cn(
        "grid gap-6",
        size === "compact"
          ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="aspect-video">
            <Skeleton className="w-full h-full" />
          </div>
          <div
            className={cn(
              size === "compact" ? "p-4 space-y-3" : "p-6 space-y-4"
            )}
          >
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-10" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
