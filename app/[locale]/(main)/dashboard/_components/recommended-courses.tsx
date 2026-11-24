import Image from "next/image";
import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { categoryLabel, levelLabel } from "@/lib/courses/labels";
import { suggestNextCourses } from "@/lib/learning/recommendations";
import { Analytics } from "@/lib/analytics-helper";
import { RecommendedCoursesClient } from "./recommended-courses-wrapper";

/** Three courses to take next, from what the learner follows (lib/learning/recommendations.ts). */
export async function RecommendedCourses({ userId }: { userId: string }) {
  const courses = await suggestNextCourses(userId);
  if (courses.length > 0) {
    // fire-and-forget: the recommendation is shown whether or not the event is stored
    void Analytics.recommendationShown(userId, { courseIds: courses.map((c) => c.id) });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2" className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden /> Pour continuer
        </CardTitle>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <div className="py-6 text-center">
            <p className="mb-4 text-muted-foreground">Vous suivez déjà toutes nos formations publiées. Retrouvez les nouveautés dans le catalogue.</p>
            <Button asChild variant="outline">
              <Link href="/formations">Voir le catalogue</Link>
            </Button>
          </div>
        ) : (
          <RecommendedCoursesClient>
            <ul className="grid gap-4 sm:grid-cols-3">
              {courses.map((course, rank) => (
                <li key={course.id} data-course-id={course.id} data-reco-rank={rank} className="flex flex-col overflow-hidden rounded-lg border">
                  <div className="relative h-28 bg-muted">
                    {course.thumbnail ? (
                      <Image src={course.thumbnail} alt="" fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-8 w-8 text-muted-foreground" aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <p className="text-xs text-muted-foreground">
                      {categoryLabel(course.category)} · {levelLabel(course.level)}
                    </p>
                    <h3 className="font-medium leading-snug">
                      <Link href={`/formations/${course.slug}`} className="hover:underline">
                        {course.title}
                      </Link>
                    </h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </RecommendedCoursesClient>
        )}
      </CardContent>
    </Card>
  );
}
