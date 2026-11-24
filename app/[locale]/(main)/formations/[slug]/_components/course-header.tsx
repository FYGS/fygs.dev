import { Calendar, Clock, Star, UserRound, Users } from "lucide-react";
import { CourseThumbnail } from "@/components/marketing/course-thumbnail";
import { Badge } from "@/components/ui/badge";
import { categoryLabel, LEVEL_BADGE_CLASSES, levelLabel } from "@/lib/courses/labels";
import { formatMinutes } from "@/lib/format-duration";
import { formatNumber } from "@/lib/price-format";

interface CourseHeaderProps {
  title: string;
  description: string;
  thumbnail: string | null;
  category: string;
  level: string;
  tags: { name: string; color: string }[];
  enrollmentCount: number;
  averageRating: number;
  reviewCount: number;
  updatedAt: string;
  /** Total of the lesson durations, in minutes (0 when none is announced). */
  minutes: number;
  instructorName: string | null;
  /** Hide the image when the page shows the trailer instead. */
  showThumbnail?: boolean;
}

export function CourseHeader({
  title,
  description,
  thumbnail,
  category,
  level,
  tags,
  enrollmentCount,
  averageRating,
  reviewCount,
  updatedAt,
  minutes,
  instructorName,
  showThumbnail = true,
}: CourseHeaderProps) {
  const duration = formatMinutes(minutes);
  return (
    <div className="space-y-6">
      {showThumbnail && (
        <div className="relative aspect-video overflow-hidden rounded-xl border shadow-sm">
          <CourseThumbnail src={thumbnail} alt="" priority className="h-full w-full rounded-none" />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{categoryLabel(category)}</Badge>
          <Badge variant="secondary" className={LEVEL_BADGE_CLASSES[level as keyof typeof LEVEL_BADGE_CLASSES] ?? ""}>
            {levelLabel(level)}
          </Badge>
          {tags.map((tag) => (
            <Badge key={tag.name} variant="outline" style={{ borderColor: tag.color }}>
              {tag.name}
            </Badge>
          ))}
        </div>

        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">{description}</p>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {instructorName && (
            <li className="flex items-center gap-2">
              <UserRound className="h-4 w-4" aria-hidden /> Par {instructorName}
            </li>
          )}
          {duration && (
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4" aria-hidden /> {duration} de contenu
            </li>
          )}
          <li className="flex items-center gap-2">
            <Users className="h-4 w-4" aria-hidden /> {formatNumber(enrollmentCount)} apprenant{enrollmentCount > 1 ? "s" : ""}
          </li>
          {reviewCount > 0 && (
            <li className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" aria-hidden />
              {averageRating.toFixed(1).replace(".", ",")} ({formatNumber(reviewCount)} avis)
            </li>
          )}
          <li className="flex items-center gap-2">
            <Calendar className="h-4 w-4" aria-hidden /> Mise à jour le{" "}
            {new Date(updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </li>
        </ul>
      </div>
    </div>
  );
}
