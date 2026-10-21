import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecommendationService } from "@/lib/services/recommendation-service";
import { Analytics } from "@/lib/analytics-helper";
import { RecommendedCoursesClient } from './recommended-courses-wrapper';
// Note: File contains both server and client components; the client wrapper is isolated below with a 'use client' pragma.
import { 
  BookOpen, 
  Star, 
  Clock, 
  Users,
  TrendingUp,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface RecommendedCoursesProps {
  userId: string;
}

// Split into server (data) + client (interactive) to avoid passing handlers to server components
async function RecommendedCoursesServer({ userId }: RecommendedCoursesProps) {
  const coursesWithStats = await RecommendationService.recommendCourses(userId, 3);
  if (coursesWithStats.length > 0) {
    // fire-and-forget (no need to await)
    Analytics.recommendationShown(userId, { courseIds: coursesWithStats.map(c => c.id) });
  }

  if (coursesWithStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Recommandations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Explorez notre catalogue pour découvrir des formations adaptées à vos besoins.
            </p>
            <Button asChild>
              <Link href="/formations">
                Parcourir les formations
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Recommandé pour vous
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {coursesWithStats.map((course, idx) => (
          <div
            key={course.id}
            className="group p-4 rounded-lg border hover:shadow-md transition-all duration-200 hover:border-primary/20"
            data-reco-rank={idx + 1}
            data-course-id={course.id}
          >
            <div className="flex gap-3">
              {/* Course Thumbnail */}
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-linear-to-br from-primary/20 to-primary/5">
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary/50" />
                  </div>
                )}
              </div>

              {/* Course Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  {course.featured && (
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Populaire
                    </Badge>
                  )}
                </div>

                {/* Course Stats */}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {course.duration ? course.duration + 'm' : '—'}
                  </div>
                  
                  {course.averageRating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {course.averageRating}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {course.enrollmentCount}
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between mt-3">
                  <div className="text-sm font-semibold text-primary">
                    {/* Show price; Premium users see label on the formations grid */}
                    {Number(course.price) > 0 ? `${course.price}€` : 'Gratuit'}
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/formations/${course.slug}`} prefetch>
                      Voir
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* View All Link */}
        <div className="pt-2 border-t">
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/formations">
              Voir toutes les formations
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export async function RecommendedCourses({ userId }: RecommendedCoursesProps) {
  const server = await RecommendedCoursesServer({ userId });
  return <RecommendedCoursesClient>{server}</RecommendedCoursesClient>;
}
