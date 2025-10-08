import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthSession } from "@/types/admin";

import { LessonsHeader } from "./_components/lessons-header";
import { LessonsStats } from "./_components/lessons-stats";
import { LessonsTable } from "./_components/lessons-table";
import {
  LessonsHeaderSkeleton,
  LessonsStatsSkeleton,
  LessonsTableSkeleton
} from "./_components/lessons-skeletons";

async function LessonsContent({ session }: { session: AuthSession }) {
  // Build query based on user role - ADMIN sees all, INSTRUCTOR sees only their courses
  const lessonsQuery = {
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          level: true,
          instructorId: true,
        },
      },
      _count: {
        select: {
          progress: true,
        },
      },
    },
    orderBy: [
      { course: { title: "asc" as const } },
      { order: "asc" as const },
    ],
    where: session.user.role === "INSTRUCTOR" ? {
      course: {
        instructorId: session.user.id
      }
    } : undefined,
  };

  const lessons = await db.lesson.findMany(lessonsQuery);

  // Count courses with lessons - filtered by instructor if needed
  const coursesQuery = {
    where: {
      lessons: {
        some: {},
      },
      ...(session.user.role === "INSTRUCTOR" ? { instructorId: session.user.id } : {}),
    },
  };

  const coursesWithLessons = await db.course.count(coursesQuery);

  // Count total progress - filtered by instructor if needed
  const progressQuery = { 
    where: session.user.role === "INSTRUCTOR" ? {
      lesson: {
        course: {
          instructorId: session.user.id
        }
      }
    } : undefined 
  };

  const totalProgress = await db.progress.count(progressQuery);

  // Calculate stats
  const totalLessons = lessons.length;
  const publishedLessons = lessons.filter(l => l.published).length;
  const totalDuration = lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
  const averageLessonDuration = totalLessons > 0 ? Math.round(totalDuration / totalLessons) : 0;

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <LessonsHeader 
        totalLessons={totalLessons}
        publishedLessons={publishedLessons}
      />

      {/* Detailed Stats */}
      <LessonsStats 
        totalLessons={totalLessons}
        publishedLessons={publishedLessons}
        totalDuration={totalDuration}
        totalProgress={totalProgress}
        coursesWithLessons={coursesWithLessons}
        averageLessonDuration={averageLessonDuration}
      />

      {/* Lessons Table */}
      <LessonsTable lessons={lessons} />
    </div>
  );
}

export default async function LessonsPage() {
  // Vérifier l'authentification et les permissions
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    redirect("/unauthorized");
  }

  // Type-safe session for AuthSession interface
  const authSession: AuthSession = {
    user: {
      id: session.user.id,
      role: session.user.role as 'ADMIN' | 'INSTRUCTOR' | 'STUDENT',
      email: session.user.email,
      name: session.user.name || 'User'
    }
  };

  return (
    <Suspense fallback={
      <div className="space-y-8">
        <LessonsHeaderSkeleton />
        <LessonsStatsSkeleton />
        <LessonsTableSkeleton />
      </div>
    }>
      <LessonsContent session={authSession} />
    </Suspense>
  );
}