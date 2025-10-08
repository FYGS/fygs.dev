"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Validation schema aligned with Prisma schema
const lessonSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(255, "Le titre est trop long"),
  slug: z.string().min(1, "Le slug est requis").max(255, "Le slug est trop long"),
  description: z.string().optional(),
  content: z.string().optional(), // MDX content
  videoUrl: z.string().url("URL vidéo invalide").optional().or(z.literal("")),
  duration: z.number().int().min(0, "La durée doit être positive").optional(),
  order: z.number().int().min(1, "L'ordre doit être supérieur à 0"),
  published: z.boolean().default(false),
});

export async function editLesson(lessonId: string, formData: FormData) {
  try {
    // Verify authentication and permissions
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Non authentifié");
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
      throw new Error("Permissions insuffisantes");
    }

    // Verify the lesson exists
    const existingLesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    if (!existingLesson) {
      throw new Error("Leçon non trouvée");
    }

    // Parse and validate form data
    const rawData = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string || undefined,
      content: formData.get("content") as string || undefined,
      videoUrl: formData.get("videoUrl") as string || undefined,
      duration: formData.get("duration") ? parseInt(formData.get("duration") as string) : undefined,
      order: parseInt(formData.get("order") as string),
      published: formData.get("published") === "true",
    };

    const validatedData = lessonSchema.parse(rawData);

    // Check if slug is unique within the course (excluding current lesson)
    if (validatedData.slug !== existingLesson.slug) {
      const conflictingLesson = await db.lesson.findUnique({
        where: {
          courseId_slug: {
            courseId: existingLesson.courseId,
            slug: validatedData.slug,
          },
        },
      });

      if (conflictingLesson && conflictingLesson.id !== lessonId) {
        throw new Error("Ce slug existe déjà pour cette formation");
      }
    }

    // Update the lesson
    const updatedLesson = await db.lesson.update({
      where: { id: lessonId },
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        description: validatedData.description,
        content: validatedData.content,
        videoUrl: validatedData.videoUrl || null,
        duration: validatedData.duration || null,
        order: validatedData.order,
        published: validatedData.published,
      },
      include: {
        course: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    // Revalidate relevant pages
    revalidatePath("/admin/lessons");
    revalidatePath(`/admin/lessons/${lessonId}`);
    revalidatePath(`/admin/courses/${existingLesson.course.id}`);
    revalidatePath(`/formations/${existingLesson.course.slug}`);
    if (validatedData.published) {
      revalidatePath(`/formations/${existingLesson.course.slug}/lessons/${validatedData.slug}`);
    }

    return { success: true, lesson: updatedLesson };
  } catch (error) {
    console.error("Error updating lesson:", error);
    if (error instanceof z.ZodError) {
      throw new Error(`Erreur de validation: ${error.errors.map(e => e.message).join(", ")}`);
    }
    throw new Error(error instanceof Error ? error.message : "Erreur lors de la mise à jour de la leçon");
  }
}