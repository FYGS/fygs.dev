import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AccessService } from "@/lib/access-service";
import {
  CATALOG_SORTS,
  getCachedCatalogPage,
  type CatalogSort,
} from "@/lib/repositories/course-repository";
import { serializeCourseSummary } from "@/lib/serializers/course-serializer";
import { Button } from "@/components/ui/button";
import { CourseGrid } from "./_components/course-grid";
import { CourseFilters } from "./_components/course-filters";
import { CourseHero, type CatalogStats } from "./_components/course-hero";
import { CatalogPager } from "./_components/catalog-pager";

interface FormationsPageProps {
  searchParams: Promise<{ category?: string; level?: string; search?: string; sort?: string; page?: string }>;
}

async function getCatalogStats(): Promise<CatalogStats> {
  const [courses, learners, certificates, ratings] = await Promise.all([
    db.course.count({ where: { published: true } }),
    db.enrollment.groupBy({ by: ["userId"], where: { course: { published: true } } }).then((rows) => rows.length),
    db.certificate.count({ where: { course: { published: true } } }),
    db.review.aggregate({ where: { status: "APPROVED", course: { published: true } }, _avg: { rating: true }, _count: true }),
  ]);
  return { courses, learners, certificates, rating: ratings._count > 0 ? (ratings._avg.rating ?? null) : null };
}

export default async function FormationsPage({ searchParams }: FormationsPageProps) {
  const { category, level, search, sort, page } = await searchParams;

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;

  const catalog = await getCachedCatalogPage({
    category,
    level,
    search: search?.trim() || undefined,
    sort: CATALOG_SORTS.includes(sort as CatalogSort) ? (sort as CatalogSort) : "relevance",
    page: Number.parseInt(page ?? "1", 10) || 1,
  });
  const summaries = catalog.items.map(serializeCourseSummary);
  const stats = await getCatalogStats();

  // What this visitor already has: enrolled, included in their subscription, free
  const access = userId ? await AccessService.checkMultipleCoursesAccess(userId, summaries.map((c) => c.id)) : {};
  const courses = summaries.map((course) => {
    const isFree = course.requiredTier === "FREE" || course.price === 0;
    const a = access[course.id];
    const isEnrolled = !!a?.isEnrolledInCourse;
    const isInSubscription = !!a?.hasActiveSubscription;
    return {
      ...course,
      isUnlocked: userId ? !!a?.canAccessCourse : isFree,
      isInSubscription,
      isEnrolled,
      hasEntitlement: isInSubscription || isEnrolled || isFree,
      unlockedLabel: isInSubscription ? "Inclus avec Premium" : isEnrolled ? "Déjà acheté" : undefined,
      previewEnabled: userId ? !!a?.canPreviewFirstLesson && course.previewEnabled : course.previewEnabled,
    };
  });

  const filtersInUse = !!(category || level || search);

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <CourseHero stats={stats} />
      <div className="container mx-auto max-w-7xl py-8">
        <div id="courses" className="space-y-8">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-bold">Nos formations</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Des formations pratiques, avec exercices, quiz et certificat à la fin.
            </p>
          </div>

          <CourseFilters />

          <p aria-live="polite" className="text-center text-sm text-muted-foreground">
            {catalog.total === 0
              ? "Aucune formation"
              : `${catalog.total} formation${catalog.total > 1 ? "s" : ""}${catalog.pageCount > 1 ? ` · page ${catalog.page} sur ${catalog.pageCount}` : ""}`}
          </p>

          {courses.length > 0 ? (
            <>
              <CourseGrid courses={courses} />
              <CatalogPager page={catalog.page} pageCount={catalog.pageCount} params={{ category, level, search, sort }} />
            </>
          ) : (
            <div className="space-y-3 py-12 text-center">
              <h3 className="text-lg font-semibold">Aucune formation trouvée</h3>
              <p className="text-muted-foreground">
                {filtersInUse ? "Aucune formation ne correspond à ces critères." : "Le catalogue se remplit : revenez bientôt."}
              </p>
              {filtersInUse && (
                <Button asChild variant="outline">
                  <Link href="/formations#courses">Voir toutes les formations</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
