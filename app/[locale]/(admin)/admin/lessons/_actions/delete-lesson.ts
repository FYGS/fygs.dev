"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Role } from "@prisma/client";

export async function deleteLesson(lessonId: string) {
  try {
    // Verify authentication and permissions
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Non authentifié" };
    }

    if (session.user.role !== Role.ADMIN && session.user.role !== Role.INSTRUCTOR) {
      return { success: false, error: "Permissions insuffisantes" };
    }

    // Check if lesson exists
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: { id: true, title: true, slug: true, instructorId: true },
        },
      },
    });

    if (!lesson) {
      return { success: false, error: "Leçon non trouvée" };
    }

    // Permission check: ADMIN has almighty power, INSTRUCTOR can only delete their own course lessons
    if (session.user.role === Role.INSTRUCTOR) {
      if (!lesson.course.instructorId || lesson.course.instructorId !== session.user.id) {
        return { success: false, error: "Vous n'avez pas accès à cette leçon. Seules les leçons de vos formations peuvent être supprimées." };
      }
    }
    // ADMIN can delete any lesson (almighty power preserved)

    // Delete the lesson
    await db.lesson.delete({
      where: { id: lessonId },
    });

    // Revalidate relevant pages
    revalidatePath("/admin/lessons");
    revalidatePath(`/admin/courses/${lesson.course.id}`);
    revalidatePath(`/formations/${lesson.course.slug}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur lors de la suppression de la leçon" 
    };
  }
}