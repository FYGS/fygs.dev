import { Metadata } from "next";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { AnalyticsHeader } from "./_components/analytics-header";
import { AnalyticsOverview } from "./_components/analytics-overview";
import { RevenueAnalytics } from "./_components/revenue-analytics";
import { UserAnalytics } from "./_components/user-analytics";
import { CourseAnalytics } from "./_components/course-analytics";
import { ConversionFunnel } from "./_components/conversion-funnel";
import { serializeRevenueData, serializeUserGrowthData, serializeCourse, safeNumber } from "@/lib/serialization-utils";

export const metadata: Metadata = {
  title: "Analytics & Rapports | Admin FYGS",
  description: "Analyses détaillées et rapports de performance",
};

async function getAnalyticsData() {
  const [
    revenueData,
    userGrowthData,
    coursePerformance,
    conversionData,
    overviewStats
  ] = await Promise.all([
    // Revenus par mois (12 derniers mois)
    db.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM(amount) as revenue,
        COUNT(*) as transactions,
        AVG(amount) as avg_order_value
      FROM "Payment" 
      WHERE status = 'COMPLETED' 
        AND "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `,

    // Croissance utilisateurs par mois
    db.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as new_users,
        SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', "createdAt")) as total_users
      FROM "User"
      WHERE "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `,

    // Performance des cours
    db.course.findMany({
      where: { published: true },
      include: {
        enrollments: {
          select: { enrolledAt: true },
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: {
        enrollments: {
          _count: "desc",
        },
      },
      take: 10,
    }),

    // Données de conversion
    Promise.all([
      db.user.count(), // Visiteurs (approximatif)
      db.enrollment.count(), // Inscriptions
      db.payment.count({ where: { status: "COMPLETED" } }), // Achats
      db.certificate.count(), // Certifications
    ]).then(([visitors, enrollments, purchases, certificates]) => ({
      visitors: visitors * 10, // Estimation: 10 visiteurs par utilisateur inscrit
      signups: visitors,
      enrollments,
      purchases,
      certificates,
    })),

    // Statistiques d'aperçu
    Promise.all([
      // Revenus totaux
      db.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      // Revenus ce mois
      db.payment.aggregate({
        where: {
          status: "COMPLETED",
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { amount: true },
      }),
      // Nouveaux utilisateurs ce mois
      db.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      // Cours les plus vendus ce mois
      db.enrollment.count({
        where: {
          enrolledAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]).then(([totalRevenue, monthlyRevenue, monthlyUsers, monthlyEnrollments]) => ({
      totalRevenue: safeNumber(totalRevenue._sum.amount),
      monthlyRevenue: safeNumber(monthlyRevenue._sum.amount),
      monthlyUsers,
      monthlyEnrollments,
    })),
  ]);

  return {
    revenueData: serializeRevenueData(revenueData as Array<{
      month: Date;
      revenue: number;
      transactions: number;
      avg_order_value?: number;
    }>),
    userGrowthData: serializeUserGrowthData(userGrowthData as Array<{
      month: Date;
      new_users: number;
      total_users: number;
    }>),
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

export default async function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<AnalyticsLoading />}>
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}

async function AnalyticsContent() {
  const { 
    revenueData, 
    userGrowthData, 
    coursePerformance, 
    conversionData, 
    overviewStats 
  } = await getAnalyticsData();

  return (
    <>
      {/* Header */}
      <AnalyticsHeader />

      {/* Vue d'ensemble */}
      <AnalyticsOverview stats={overviewStats} />

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RevenueAnalytics data={revenueData} />
        <UserAnalytics data={userGrowthData} />
      </div>

      {/* Analyses détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CourseAnalytics courses={coursePerformance} />
        <ConversionFunnel data={conversionData} />
      </div>
    </>
  );
}
