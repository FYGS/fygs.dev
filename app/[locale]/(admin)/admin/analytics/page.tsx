import { Metadata } from "next";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { AnalyticsHeader } from "./_components/analytics-header";
import { AnalyticsOverview } from "./_components/analytics-overview";
import { RevenueAnalytics } from "./_components/revenue-analytics";
import { UserAnalytics } from "./_components/user-analytics";
import { CourseAnalytics } from "./_components/course-analytics";
import { ConversionFunnel } from "./_components/conversion-funnel";
import { serializeCourse } from "@/lib/serialization-utils";
import { requireAdminPage } from "@/lib/admin-guard";
import { getFunnel, getMonthlySeries, getOverview, parseRange, type AnalyticsRange } from "@/lib/services/admin-analytics";

export const metadata: Metadata = {
  title: "Analytics & Rapports | Admin FYGS",
  description: "Analyses détaillées et rapports de performance",
};

async function getAnalyticsData(range: AnalyticsRange) {
  const [series, coursePerformance, conversionData, overviewStats] = await Promise.all([
    getMonthlySeries(range),
    db.course.findMany({
      where: { published: true },
      include: {
        enrollments: { select: { enrolledAt: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { enrollments: { _count: "desc" } },
      take: 10,
    }),
    getFunnel(),
    getOverview(),
  ]);

  return {
    revenueData: series.revenue,
    userGrowthData: series.users,
    coursePerformance: coursePerformance.map(serializeCourse),
    conversionData,
    overviewStats,
  };
}

function AnalyticsLoading() {
  return (
    <div className="space-y-8">
      <div className="h-16 bg-muted rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-80 bg-muted rounded animate-pulse" />
        <div className="h-80 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminPage();
  const raw = (await searchParams).range;
  const range = parseRange(Array.isArray(raw) ? raw[0] : raw);
  return (
    <div className="space-y-8">
      <Suspense fallback={<AnalyticsLoading />}>
        <AnalyticsContent range={range} />
      </Suspense>
    </div>
  );
}

async function AnalyticsContent({ range }: { range: AnalyticsRange }) {
  const { revenueData, userGrowthData, coursePerformance, conversionData, overviewStats } = await getAnalyticsData(range);

  return (
    <>
      {/* Header */}
      <AnalyticsHeader range={range} />

      {/* Vue d'ensemble */}
      <AnalyticsOverview stats={overviewStats} />

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RevenueAnalytics data={revenueData} />
        <UserAnalytics data={userGrowthData} months={range} />
      </div>

      {/* Analyses détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CourseAnalytics courses={coursePerformance} />
        <ConversionFunnel data={conversionData} />
      </div>
    </>
  );
}
