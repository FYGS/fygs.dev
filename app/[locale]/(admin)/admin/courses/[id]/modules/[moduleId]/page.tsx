import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { ModuleEditForm } from "./_components/module-edit-form";

interface ModuleEditPageProps {
  params: Promise<{
    id: string;
    moduleId: string;
  }>;
}

async function getModule(moduleId: string) {
  const moduleData = await db.module.findUnique({
    where: { id: moduleId },
    include: {
      course: {
        select: {
          id: true,
          slug: true,
          title: true,
          instructorId: true,
        },
      },
      lessons: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return moduleData;
}

export default async function ModuleEditPage({ params }: ModuleEditPageProps) {
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

  // Get the module with course info
  const moduleData = await getModule((await params).moduleId);

  if (!moduleData) {
    notFound();
  }

  // Permission check: ADMIN has almighty power, INSTRUCTOR can only edit their own courses
  if (session.user.role === Role.INSTRUCTOR) {
    if (!moduleData.course.instructorId || moduleData.course.instructorId !== session.user.id) {
      redirect("/unauthorized?error=module-access-denied");
    }
  }
  // ADMIN can edit any module (almighty power preserved)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Modifier le module</h1>
            <p className="text-muted-foreground">
              Mettez à jour les informations de votre module
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>ID: {moduleData.id}</span>
          </div>
        </div>
      </div>

      {/* Module Edit Form */}
      <ModuleEditForm module={moduleData} course={moduleData.course} />
    </div>
  );
}