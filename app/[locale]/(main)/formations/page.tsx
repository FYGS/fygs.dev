import { CourseGrid } from "./_components/course-grid";
import { CourseFilters } from "./_components/course-filters";
import { CourseHero } from "./_components/course-hero";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AccessService } from "@/lib/access-service";
import { getCachedCourseList } from "@/lib/repositories/course-repository";
import { transformCoursesData } from "./_lib/types"; // using DTO-based transformer
import { serializeCourseSummary } from "@/lib/serializers/course-serializer";
import { CourseSummaryDTO } from "@/types/course";

async function transformCoursesWithAccess(courses: CourseSummaryDTO[], userId: string | null) {
  if (!userId) {
    return transformCoursesData(
      courses.map((c) => {
        const isFree = c.requiredTier === 'FREE' || c.price === 0;
        return {
          ...c,
          isUnlocked: isFree,
          isInSubscription: false,
          isEnrolled: false,
          hasEntitlement: isFree,
          firstLessonSlug: c.firstLessonSlug || null,
        };
      })
    );
  }

  const courseIds = courses.map(c => c.id);
  const accessResults = await AccessService.checkMultipleCoursesAccess(userId, courseIds);
  return transformCoursesData(
    courses.map((c) => {
      const access = accessResults[c.id];
      const isUnlocked = access?.canAccessCourse || false;
      const isInSubscription = !!access?.hasActiveSubscription;
      const isEnrolled = !!access?.isEnrolledInCourse; // explicit enrollment or purchase
      const hasEntitlement = isInSubscription || isEnrolled || (c.price === 0 || c.requiredTier === 'FREE');
      return {
        ...c,
        isUnlocked,
        isInSubscription,
        isEnrolled,
        hasEntitlement,
        firstLessonSlug: c.firstLessonSlug || null,
        unlockedLabel: isInSubscription
          ? 'Inclus avec Premium'
          : isEnrolled
            ? 'Déjà acheté'
            : undefined,
        previewEnabled: access?.canPreviewFirstLesson && c.previewEnabled,
      };
    })
  );
}

export default async function FormationsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; level?: string; search?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const { category, level, search } = resolvedSearchParams;

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id || null;

  // Use cached list (Step 6 caching) – falls back to repository logic under the hood
  const rawCourses = await getCachedCourseList({
    category,
    level,
    search,
    publishedOnly: true,
  });
  const courses = rawCourses.map(serializeCourseSummary);

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <CourseHero />
      <div className="container py-8 max-w-7xl mx-auto">
        <div id="courses" className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Nos Formations</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Découvrez notre catalogue de formations premium conçues pour vous faire progresser rapidement.
            </p>
          </div>
          <CourseFilters />
          <CourseGrid
            courses={await transformCoursesWithAccess(courses, userId)}
          />
        </div>
      </div>
    </div>
  );
}
