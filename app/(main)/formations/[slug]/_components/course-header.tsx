import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, Calendar } from "lucide-react";
import Image from "next/image";
import { SerializedCourse } from "../types";

interface CourseHeaderProps {
  course: SerializedCourse;
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

export function CourseHeader({ course }: CourseHeaderProps) {
  const totalDuration = course.lessons.reduce(
    (acc, lesson) => acc + (lesson.duration || 0),
    0
  );
  const totalHours = Math.round(totalDuration / 3600);
  const enrollmentCount = course.enrollments.length;
  const averageRating = course.reviews.length > 0
    ? course.reviews.reduce((acc, review) => acc + review.rating, 0) / course.reviews.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Video/Thumbnail */}
      <div className="aspect-video relative overflow-hidden rounded-lg">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎓</div>
              <p className="text-lg text-muted-foreground">Aperçu de la formation</p>
            </div>
          </div>
        )}
      </div>

      {/* Course Info */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {CATEGORY_LABELS[course.category]}
          </Badge>
          <Badge variant="outline">
            {LEVEL_LABELS[course.level]}
          </Badge>
          {course.tags.map((courseTag) => (
            <Badge
              key={courseTag.tag.name}
              variant="outline"
              style={{ borderColor: courseTag.tag.color }}
            >
              {courseTag.tag.name}
            </Badge>
          ))}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {course.title}
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed">
          {course.description}
        </p>

        {/* Stats */}
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{totalHours} heures de contenu</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{enrollmentCount} étudiants inscrits</span>
          </div>
          {averageRating > 0 && (
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{averageRating.toFixed(1)} ({course.reviews.length} avis)</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Mis à jour le {new Date(course.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
