import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { toCourseCards } from "@/lib/access/course-cards";
import {
  CATALOG_ACCESS,
  CATALOG_SORTS,
  getCachedCatalogPage,
  type CatalogAccess,
  type CatalogSort,
} from "@/lib/repositories/course-repository";
import { serializeCourseSummary } from "@/lib/serializers/course-serializer";
import { Button } from "@/components/ui/button";
import { CourseGrid } from "./_components/course-grid";
import { CourseFilters } from "./_components/course-filters";
import { CourseHero, type CatalogStats } from "./_components/course-hero";
import { CatalogPager } from "./_components/catalog-pager";
import { FormationsCta } from "@/components/formations/formations-cta";

interface FormationsPageProps {
  searchParams: Promise<{ category?: string; level?: string; access?: string; search?: string; sort?: string; page?: string }>;
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
  const { category, level, access: rawAccess, search, sort, page } = await searchParams;
  const access = CATALOG_ACCESS.includes(rawAccess as CatalogAccess) ? (rawAccess as CatalogAccess) : undefined;

  const session = await auth.api.getSession({ headers: await headers() });
  const viewer = session?.user ? { id: session.user.id, role: session.user.role } : null;

  const catalog = await getCachedCatalogPage({
    category,
    level,
    access,
    search: search?.trim() || undefined,
    sort: CATALOG_SORTS.includes(sort as CatalogSort) ? (sort as CatalogSort) : "relevance",
    page: Number.parseInt(page ?? "1", 10) || 1,
  });
  // Offer, where this viewer stands and the button of each card: one rule (lib/access/entitlement.ts)
  const [courses, stats] = await Promise.all([
    toCourseCards(viewer, catalog.items.map(serializeCourseSummary)),
    getCatalogStats(),
  ]);

  const filtersInUse = !!(category || level || access || search);

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
              <CatalogPager page={catalog.page} pageCount={catalog.pageCount} params={{ category, level, access, search, sort }} />
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
        <FormationsCta other="parcours" />
      </div>
    </div>
  );
}
