import { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { CoursesHeader } from "./_components/courses-header";
import { CoursesTable } from "./_components/courses-table";
import { CoursesStats } from "./_components/courses-stats";
import { PaginationService, extractPaginationParams } from "@/lib/pagination-utils";
import { serializeCourse } from "@/lib/serialization-utils";
import { Prisma, Role } from "@prisma/client";

type AdminCourseRow = Prisma.CourseGetPayload<{
  include: {
    lessons: { select: { id: true; published: true } };
    enrollments: { select: { id: true } };
    reviews: { select: { rating: true } };
    tags: { include: { tag: { select: { name: true; color: true } } } };
  };
}>;

export const metadata: Metadata = {
  title: "Gestion des Formations | Admin FYGS",
  description: "Interface d'administration pour gérer les formations",
};

async function getCoursesData(searchParams: URLSearchParams, session: { user: { id: string; role: string | null | undefined } }) {
  const paginationParams = extractPaginationParams(searchParams);
  
  // Extraire les filtres spécifiques
  const category = searchParams.get('category') || '';
  const level = searchParams.get('level') || '';
  const status = searchParams.get('status') || '';
  
  // Construire les filtres
  const filters: Record<string, unknown> = {};
  if (category && category !== 'all') {
    filters.category = category;
  }
  if (level && level !== 'all') {
    filters.level = level;
  }
  if (status === 'published') {
    filters.published = true;
  } else if (status === 'draft') {
    filters.published = false;
  }

  // Add instructor ownership filter - ADMIN sees all, INSTRUCTOR sees only their own
  if (session.user.role === Role.INSTRUCTOR) {
    filters.instructorId = session.user.id;
  }
  
  const [coursesResult, stats] = await Promise.all([
    // Récupérer les cours avec pagination
    PaginationService.paginateWithIncludes<AdminCourseRow>(
      db.course,
      {
        ...paginationParams,
        filters,
      },
      {
        lessons: {
          select: { id: true, published: true },
        },
        enrollments: {
          select: { id: true },
        },
        reviews: {
          select: { rating: true },
        },
        tags: {
          include: {
            tag: {
              select: { name: true, color: true },
            },
          },
        },
      },
      ['title', 'description'], // Champs de recherche
      {} // Clause WHERE additionnelle
    ),

    // Statistiques globales - filtered by instructor ownership
    Promise.all([
      // Total courses
      session.user.role === Role.INSTRUCTOR
        ? db.course.count({ where: { instructorId: session.user.id } })
        : db.course.count(),
      // Published courses
      session.user.role === Role.INSTRUCTOR
        ? db.course.count({ where: { published: true, instructorId: session.user.id } })
        : db.course.count({ where: { published: true } }),
      // Featured courses
      session.user.role === Role.INSTRUCTOR
        ? db.course.count({ where: { featured: true, instructorId: session.user.id } })
        : db.course.count({ where: { featured: true } }),
      // Total lessons
      session.user.role === Role.INSTRUCTOR
        ? db.lesson.count({ where: { course: { instructorId: session.user.id } } })
        : db.lesson.count(),
      // Total enrollments
      session.user.role === Role.INSTRUCTOR
        ? db.enrollment.count({ where: { course: { instructorId: session.user.id } } })
        : db.enrollment.count(),
    ]).then(([total, published, featured, totalLessons, totalEnrollments]) => ({
      total,
      published,
      featured,
      draft: total - published,
      totalLessons,
      totalEnrollments,
    })),
  ]);

  // Sérialiser les cours et fournir les champs que CoursesTable affiche
  const serializedCourses = coursesResult.data.map((course) => ({
    ...serializeCourse(course),
    lessonsCount: course.lessons.length,
    publishedLessonsCount: course.lessons.filter((l) => l.published).length,
    enrollmentsCount: course.enrollments.length,
    tags: course.tags.map(({ tag }) => ({ name: tag.name, color: tag.color })),
  }));

  return {
    courses: serializedCourses,
    pagination: {
      totalItems: coursesResult.totalItems,
      totalPages: coursesResult.totalPages,
      currentPage: coursesResult.currentPage,
      pageSize: coursesResult.pageSize,
      hasNextPage: coursesResult.hasNextPage,
      hasPrevPage: coursesResult.hasPrevPage,
    },
    stats,
  };
}

function CoursesLoading() {
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

interface CoursesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  // Authentication and permission check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.role || !["ADMIN", "INSTRUCTOR"].includes(session.user.role)) {
    redirect("/unauthorized");
  }

  // Resolve the Promise for searchParams
  const resolvedSearchParams = await searchParams;
  const urlSearchParams = new URLSearchParams(resolvedSearchParams as Record<string, string>);

  return (
    <div className="space-y-8">
      <Suspense fallback={<CoursesLoading />}>
        <CoursesContent searchParams={urlSearchParams} session={session} />
      </Suspense>
    </div>
  );
}

async function CoursesContent({
  searchParams,
  session
}: {
  searchParams: URLSearchParams;
  session: { user: { id: string; role: string | null | undefined } };
}) {
  const { courses, pagination, stats } = await getCoursesData(searchParams, session);

  return (
    <>
      {/* Header avec actions */}
      <CoursesHeader />

      {/* Statistiques */}
      <CoursesStats stats={stats} />

      {/* Table des cours */}
      <CoursesTable courses={courses} pagination={pagination} />
    </>
  );
}
