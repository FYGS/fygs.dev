import { Metadata } from "next";
import { db } from "@/lib/db";
import { AdminDashboardStats } from "./_components/admin-dashboard-stats";
import { RecentActivity } from "./_components/recent-activity";
import { getRecentActivity } from "@/lib/services/admin-activity";
import { RevenueChart } from "./_components/revenue-chart";
import { PopularCourses } from "./_components/popular-courses";
import { UserGrowthChart } from "./_components/user-growth-chart";
import { QuickActions } from "./_components/quick-actions";
import {
  serializeRevenueData,
  serializeCourse,
  safeNumber,
} from "@/lib/serialization-utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PaymentStatus } from "@/lib/generated/prisma/browser";

export const metadata: Metadata = {
  title: "Dashboard Admin | FYGS Learning Platform",
  description: "Vue d'ensemble de l'administration de la plateforme",
};

async function getAdminStats() {
  const [
    totalUsers,
    totalCourses,
    totalEnrollments,
    totalRevenue,
    recentUsers,
    recentEnrollments,
    popularCourses,
    monthlyRevenue,
  ] = await Promise.all([
    // Total des utilisateurs
    db.user.count(),

    // Total des cours
    db.course.count({ where: { published: true } }),

    // Total des inscriptions
    db.enrollment.count(),

    // Revenus totaux
    db.payment.aggregate({
      where: { status: PaymentStatus.COMPLETED },
      _sum: { amount: true },
    }),

    // Nouveaux utilisateurs (7 derniers jours)
    db.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),

    // Nouvelles inscriptions (7 derniers jours)
    db.enrollment.count({
      where: {
        enrolledAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),

    // Cours les plus populaires
    db.course.findMany({
      where: { published: true },
      include: {
        enrollments: { select: { id: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: {
        enrollments: {
          _count: "desc",
        },
      },
      take: 5,
    }),

    // Revenus mensuels (12 derniers mois)
    db.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM(amount) as revenue,
        COUNT(*) as transactions
      FROM "Payment" 
      WHERE status = 'COMPLETED' 
        AND "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `,
  ]);

  return {
    totalUsers,
    totalCourses,
    totalEnrollments,
    totalRevenue: safeNumber(totalRevenue._sum.amount),
    recentUsers,
    recentEnrollments,
    popularCourses: popularCourses.map(serializeCourse),
    monthlyRevenue: serializeRevenueData(
      monthlyRevenue as Array<{
        month: Date;
        revenue: any;
        transactions: any;
      }>,
    ),
  };
}

export default async function AdminDashboardPage() {
  const [stats, recentActivity] = await Promise.all([getAdminStats(), getRecentActivity()]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gradient-heading">
          Dashboard Admin
        </h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble des performances de la plateforme FYGS Learning
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Stats Cards */}
      <AdminDashboardStats
        totalUsers={stats.totalUsers}
        totalCourses={stats.totalCourses}
        totalEnrollments={stats.totalEnrollments}
        totalRevenue={stats.totalRevenue}
        recentUsers={stats.recentUsers}
        recentEnrollments={stats.recentEnrollments}
      />

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <RevenueChart data={stats.monthlyRevenue} />

        {/* User Growth Chart */}
        <UserGrowthChart />
      </div>

      {/* Popular Courses and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Courses */}
        <ScrollArea className="h-[500px] rounded-md border">
          <PopularCourses courses={stats.popularCourses} />
        </ScrollArea>

        {/* Recent Activity */}
        <ScrollArea className="h-[500px] rounded-md border">
          <RecentActivity activities={recentActivity} />
        </ScrollArea>
      </div>
    </div>
  );
}
