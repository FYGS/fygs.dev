import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { CourseEditForm } from "./_components/course-edit-form";
import { Role } from "@prisma/client";

interface CourseEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getCourse(id: string) {
  const course = await db.course.findUnique({
    where: { id },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      lessons: {
        orderBy: {
          order: "asc",
        },
      },
      _count: {
        select: {
          enrollments: true,
          lessons: true,
        },
      },
    },
  });

  return course;
}

async function getAllTags() {
  const tags = await db.tag.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return tags;
}

export default async function CourseEditPage({ params }: CourseEditPageProps) {
  // Vérifier l'authentification et les permissions
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  if (session.user.role !== Role.ADMIN && session.user.role !== Role.INSTRUCTOR) {
    redirect("/unauthorized");
  }

  // Récupérer les données
  const [course, tags] = await Promise.all([
    getCourse((await params).id),
    getAllTags(),
  ]);

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

  // Convert Prisma types to expected types for the form
  const courseForForm = {
    ...course,
    price: course.price ? Number(course.price) : null,
    duration: course.duration ? Number(course.duration) : null,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Modifier la formation</h1>
            <p className="text-muted-foreground">
              Mettez à jour les informations de votre formation
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>ID: {course.id}</span>
            {course.published && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                Publié
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-2xl font-bold">{course._count.enrollments}</div>
          <div className="text-sm text-muted-foreground">Inscrits</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-2xl font-bold">{course._count.lessons}</div>
          <div className="text-sm text-muted-foreground">Leçons</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-2xl font-bold">{course.duration || 0}h</div>
          <div className="text-sm text-muted-foreground">Durée</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-2xl font-bold">{course.price ? Number(course.price) : 0}€</div>
          <div className="text-sm text-muted-foreground">Prix</div>
        </div>
      </div>

      {/* Form */}
      <CourseEditForm course={courseForForm} tags={tags} />
    </div>
  );
}