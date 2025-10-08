import { Metadata } from "next";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { UsersHeader } from "./_components/users-header";
import { UsersTable } from "./_components/users-table";
import { UsersStats } from "./_components/users-stats";
import { PaginationService, extractPaginationParams } from "@/lib/pagination-utils";
import { safeNumber } from "@/lib/serialization-utils";

export const metadata: Metadata = {
  title: "Gestion des Utilisateurs | Admin FYGS",
  description: "Interface d'administration pour gérer les utilisateurs",
};

async function getUsersData(searchParams: URLSearchParams) {
  const paginationParams = extractPaginationParams(searchParams);
  
  // Extraire les filtres spécifiques
  const role = searchParams.get('role') || '';
  
  // Construire les filtres
  const filters: any = {};
  if (role && role !== 'all') {
    filters.role = role;
  }
  
  const [usersResult, stats] = await Promise.all([
    // Récupérer les utilisateurs avec pagination
    PaginationService.paginateWithIncludes(
      db.user,
      {
        ...paginationParams,
        filters,
      },
      {
        enrollments: {
          select: { id: true, enrolledAt: true },
        },
        subscriptions: {
          select: { id: true, status: true },
        },
        payments: {
          where: { status: "COMPLETED" },
          select: { amount: true },
        },
        progress: {
          where: { completed: true },
          select: { id: true },
        },
      },
      ['name', 'email'], // Champs de recherche
      {} // Clause WHERE additionnelle
    ),

    // Statistiques globales
    Promise.all([
      db.user.count(),
      db.user.count({ where: { role: "STUDENT" } }),
      db.user.count({ where: { role: "INSTRUCTOR" } }),
      db.user.count({ where: { role: "ADMIN" } }),
      db.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      db.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]).then(([total, students, instructors, admins, weeklyNew, monthlyNew]) => ({
      total,
      students,
      instructors,
      admins,
      weeklyNew,
      monthlyNew,
    })),
  ]);

  // Sérialiser les utilisateurs
  const serializedUsers = usersResult.data.map((user: any) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    enrollmentsCount: user.enrollments.length,
    totalSpent: user.payments.reduce((sum: number, payment: any) => sum + safeNumber(payment.amount), 0),
    completedLessons: user.progress.length,
    hasActiveSubscription: user.subscriptions.some((sub: any) => sub.status === "ACTIVE"),
    lastEnrollment: user.enrollments.length > 0 
      ? user.enrollments.sort((a: any, b: any) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())[0].enrolledAt.toISOString()
      : null,
  }));

  return {
    users: serializedUsers,
    pagination: {
      totalItems: usersResult.totalItems,
      totalPages: usersResult.totalPages,
      currentPage: usersResult.currentPage,
      pageSize: usersResult.pageSize,
      hasNextPage: usersResult.hasNextPage,
      hasPrevPage: usersResult.hasPrevPage,
    },
    stats,
  };
}

function UsersLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-96 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded animate-pulse" />
        ))}
      </div>
      
      <div className="h-96 bg-muted rounded animate-pulse" />
    </div>
  );
}

interface UsersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const resolvedSearchParams = await searchParams;
  const urlSearchParams = new URLSearchParams(resolvedSearchParams as Record<string, string>);

  return (
    <div className="space-y-8">
      <Suspense fallback={<UsersLoading />}>
        <UsersContent searchParams={urlSearchParams} />
      </Suspense>
    </div>
  );
}

async function UsersContent({ searchParams }: { searchParams: URLSearchParams }) {
  const { users, pagination, stats } = await getUsersData(searchParams);

  return (
    <>
      {/* Header avec actions */}
      <UsersHeader />

      {/* Statistiques */}
      <UsersStats stats={stats} />

      {/* Table des utilisateurs */}
      <UsersTable users={users} pagination={pagination} />
    </>
  );
}
