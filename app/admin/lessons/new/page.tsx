import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LessonCreateForm } from "./_components/lesson-create-form";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CourseQueryOptions, AuthSession } from "@/types/admin";

export const metadata: Metadata = {
  title: "Créer une Leçon | Admin FYGS",
  description: "Interface de création d'une nouvelle leçon",
};

async function getFormData(session: AuthSession) {
  // ADMIN can see all courses (almighty power), INSTRUCTOR sees only their own
  const coursesQuery: CourseQueryOptions = {
    select: {
      id: true,
      title: true,
      slug: true,
      instructorId: true,
    },
    orderBy: { title: 'asc' }
  };

  if (session.user.role === "INSTRUCTOR") {
    coursesQuery.where = {
      instructorId: session.user.id
    };
  }

  const courses = await db.course.findMany(coursesQuery);

  return { courses };
}

export default async function CreateLessonPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Vérification des permissions
  if (!session) {
    redirect("/auth/login?callbackUrl=/admin/lessons/new");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    redirect("/dashboard");
  }

  // Create AuthSession for type compatibility
  const authSession: AuthSession = {
    user: {
      id: session.user.id,
      role: session.user.role as 'ADMIN' | 'INSTRUCTOR' | 'STUDENT',
      email: session.user.email,
      name: session.user.name || 'User'
    }
  };

  const { courses } = await getFormData(authSession);

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Créer une nouvelle leçon
          </h1>
          <p className="text-muted-foreground mt-1">
            Remplissez les informations ci-dessous pour créer votre leçon
          </p>
        </div>
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de la leçon</CardTitle>
          <CardDescription>
            Configurez les détails de votre leçon. Vous pourrez modifier le contenu après la création.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LessonCreateForm 
            courses={courses}
            selectedCourseId={resolvedSearchParams.courseId}
          />
        </CardContent>
      </Card>
    </div>
  );
}