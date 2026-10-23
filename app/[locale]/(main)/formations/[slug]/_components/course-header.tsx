import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Star, Users } from "lucide-react";
import { CourseThumbnail } from "@/components/marketing/course-thumbnail";
import { formatMinutes } from "@/lib/learning/curriculum-view";

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
  /** Hide the image when the page shows the trailer instead. */
  showThumbnail?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  JAVASCRIPT: "JavaScript",
  TYPESCRIPT: "TypeScript",
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  FULLSTACK: "Fullstack",
  CLOUD: "Cloud",
  AI: "IA",
  DEVOPS: "DevOps",
  PRODUCTIVITY: "Productivité",
};

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Débutant",
  INTERMEDIATE: "Intermédiaire",
  ADVANCED: "Avancé",
  EXPERT: "Expert",
};

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
  showThumbnail = true,
}: CourseHeaderProps) {
  return (
    <div className="space-y-6">
      {showThumbnail && (
        <div className="relative aspect-video overflow-hidden rounded-xl border shadow-sm">
          <CourseThumbnail src={thumbnail} alt={title} priority className="h-full w-full rounded-none" />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{CATEGORY_LABELS[category] ?? category}</Badge>
          <Badge variant="outline">{LEVEL_LABELS[level] ?? level}</Badge>
          {tags.map((tag) => (
            <Badge key={tag.name} variant="outline" style={{ borderColor: tag.color }}>
              {tag.name}
            </Badge>
          ))}
        </div>

        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">{description}</p>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {minutes > 0 && (
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4" aria-hidden /> {formatMinutes(minutes)} de contenu
            </li>
          )}
          <li className="flex items-center gap-2">
            <Users className="h-4 w-4" aria-hidden /> {enrollmentCount} inscrit{enrollmentCount > 1 ? "s" : ""}
          </li>
          {reviewCount > 0 && (
            <li className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden />
              {averageRating.toFixed(1)} ({reviewCount} avis)
            </li>
          )}
          <li className="flex items-center gap-2">
            <Calendar className="h-4 w-4" aria-hidden /> Mis à jour le {new Date(updatedAt).toLocaleDateString("fr-FR")}
          </li>
        </ul>
      </div>
    </div>
  );
}
