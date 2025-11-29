import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LessonEditForm } from "../_components/lesson-edit-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseQueryOptions } from "@/types/admin";
import { Role } from "@prisma/client";

interface EditLessonPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLessonPage({ params }: EditLessonPageProps) {
  const { id } = await params;

  // Verify authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Check authentication
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/admin/lessons/" + id + "/edit");
  }

  // Check authorization
  if (!session.user.role || !["ADMIN", "INSTRUCTOR"].includes(session.user.role)) {
    redirect("/unauthorized");
  }

  // Fetch lesson data
  const lesson = await db.lesson.findUnique({
    where: { id },
    include: {
      course: {
        select: { id: true, title: true, slug: true },
      },
    },
  });

  if (!lesson) {
    notFound();
  }

  // Fetch available courses for form - ADMIN sees all, INSTRUCTOR sees only their own
  const coursesQuery: CourseQueryOptions = {
    select: {
      id: true,
      title: true,
      slug: true,
      instructorId: true,
    },
    orderBy: { title: "asc" },
  };

  if (session.user.role === Role.INSTRUCTOR) {
    coursesQuery.where = {
      instructorId: session.user.id,
    };
  }

  const courses = await db.course.findMany(coursesQuery);

  // Serialize lesson data to avoid Decimal/Date issues
  const serializedLesson = {
    ...lesson,
    duration: lesson.duration ? Number(lesson.duration) : null,
    createdAt: lesson.createdAt.toISOString(),
    updatedAt: lesson.updatedAt.toISOString(),
    course: {
      ...lesson.course,
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Modifier la leçon</h1>
        <p className="text-muted-foreground">Modification de: {lesson.title}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la leçon</CardTitle>
        </CardHeader>
        <CardContent>
          <LessonEditForm lesson={serializedLesson} courses={courses} />
        </CardContent>
      </Card>
    </div>
  );
}
