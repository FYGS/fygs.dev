import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LessonEditForm } from "./_components/lesson-edit-form";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CourseQueryOptions } from "@/types/admin";
import { Role } from "@prisma/client";

export const metadata: Metadata = {
  title: "Modifier la Leçon | Admin FYGS",
  description: "Interface de modification d'une leçon",
};

async function getLesson(lessonId: string) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  if (!lesson) {
    notFound();
  }

  return lesson;
}

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const resolvedParams = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Vérification des permissions
  if (!session) {
    redirect("/auth/login?callbackUrl=/admin/lessons/" + resolvedParams.id);
  }

  if (
    session.user.role !== Role.ADMIN &&
    session.user.role !== Role.INSTRUCTOR
  ) {
    redirect("/dashboard");
  }

  const lesson = await getLesson(resolvedParams.id);

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/lessons">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux leçons
          </Link>
        </Button>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gradient-heading">
            Modifier la leçon
          </h1>
          <p className="text-muted-foreground mt-1">
            Modifiez les informations de votre leçon
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/courses/${lesson.course.id}`}>
              <BookOpen className="h-4 w-4 mr-2" />
              Voir la formation
            </Link>
          </Button>

          {lesson.published && (
            <Button variant="ghost" size="sm" asChild>
              <Link
                href={`/${resolvedParams.locale}/formations/${lesson.course.slug}/lessons/${lesson.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Voir en ligne
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de la leçon</CardTitle>
          <CardDescription>
            Modifiez les détails de votre leçon. Les modifications seront
            sauvegardées automatiquement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LessonEditForm lesson={lesson} courses={courses} />
        </CardContent>
      </Card>
    </div>
  );
}
