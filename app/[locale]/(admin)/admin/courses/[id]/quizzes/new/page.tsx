import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { QuizCreateForm } from "./_components/quiz-create-form";

interface QuizCreatePageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getCourse(id: string) {
  const course = await db.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return course;
}

export default async function QuizCreatePage({ params }: QuizCreatePageProps) {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  if (session.user.role !== Role.ADMIN && session.user.role !== Role.INSTRUCTOR) {
    redirect("/unauthorized");
  }

  // Get the course with modules
  const course = await getCourse((await params).id);

  if (!course) {
    notFound();
  }

  // Permission check: ADMIN has almighty power, INSTRUCTOR can only edit their own courses
  if (session.user.role === Role.INSTRUCTOR) {
    if (!course.instructorId || course.instructorId !== session.user.id) {
      redirect("/unauthorized?error=course-access-denied");
    }
  }
  // ADMIN can edit any course (almighty power preserved)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Créer un nouveau quiz</h1>
            <p className="text-muted-foreground">
              Ajoutez un quiz interactif à votre formation
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Formation: {course.title}</span>
          </div>
        </div>
      </div>

      {/* Quiz Create Form */}
      <QuizCreateForm course={course} />
    </div>
  );
}