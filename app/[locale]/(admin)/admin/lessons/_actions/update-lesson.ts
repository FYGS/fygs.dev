"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Role } from "@prisma/client";

const SUPPORTED_LOCALES = ["fr", "en", "es"] as const;

function revalidateLocalized(pathWithoutLocale: string) {
  revalidatePath(pathWithoutLocale);
  for (const locale of SUPPORTED_LOCALES) {
    revalidatePath(`/${locale}${pathWithoutLocale}`);
  }
}

// Validation schema for updating lessons
const updateLessonSchema = z.object({
  id: z.string().cuid("ID de leçon invalide"),
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(255, "Le titre est trop long"),
  slug: z
    .string()
    .min(1, "Le slug est requis")
    .max(255, "Le slug est trop long")
    .regex(
      /^[a-z0-9-]+$/,
      "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets",
    ),
  description: z.string().optional(),
  content: z.string().optional(),
  videoUrl: z.string().url("URL vidéo invalide").optional().or(z.literal("")),
  duration: z.number().int().min(0, "La durée doit être positive").optional(),
  order: z.number().int().min(1, "L'ordre doit être supérieur à 0"),
  published: z.boolean().default(false),
  courseId: z.string().cuid("ID de formation invalide"),
});

export async function updateLesson(formData: FormData) {
  try {
    // Verify authentication and permissions
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Non authentifié" };
    }

    if (
      session.user.role !== Role.ADMIN &&
      session.user.role !== Role.INSTRUCTOR
    ) {
      return { success: false, error: "Permissions insuffisantes" };
    }

    // Parse and validate form data
    const rawContent = formData.get("content");

    const rawData = {
      id: formData.get("id") as string,
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      description: (formData.get("description") as string) || undefined,
      content:
        typeof rawContent === "string" && rawContent.trim().length > 0
          ? rawContent
          : undefined,
      videoUrl: (formData.get("videoUrl") as string) || undefined,
      duration: formData.get("duration")
        ? parseInt(formData.get("duration") as string)
        : undefined,
      order: parseInt(formData.get("order") as string),
      published: formData.get("published") === "true",
      courseId: formData.get("courseId") as string,
    };

    const validatedData = updateLessonSchema.parse(rawData);

    // Check if lesson exists and user has access
    const existingLesson = await db.lesson.findUnique({
      where: { id: validatedData.id },
      include: {
        course: {
          select: { id: true, title: true, slug: true, instructorId: true },
        },
      },
    });

    if (!existingLesson) {
      return { success: false, error: "Leçon non trouvée" };
    }

    const previousCourseSlug = existingLesson.course.slug;
    const previousLessonSlug = existingLesson.slug;

    // Check permissions: ADMIN can edit all lessons, INSTRUCTOR can only edit their own courses
    if (session.user.role === Role.INSTRUCTOR) {
      if (
        !existingLesson.course.instructorId ||
        existingLesson.course.instructorId !== session.user.id
      ) {
        return { success: false, error: "Vous n'avez pas accès à cette leçon" };
      }
    }

    // Check if slug is unique within the course (excluding current lesson)
    if (
      validatedData.slug !== existingLesson.slug ||
      validatedData.courseId !== existingLesson.courseId
    ) {
      const conflictingLesson = await db.lesson.findFirst({
        where: {
          courseId: validatedData.courseId,
          slug: validatedData.slug,
          NOT: { id: validatedData.id },
        },
      });

      if (conflictingLesson) {
        return {
          success: false,
          error: "Ce slug existe déjà pour cette formation",
        };
      }
    }

    // Verify the target course exists
    const course = await db.course.findUnique({
      where: { id: validatedData.courseId },
      select: { id: true, title: true, slug: true, instructorId: true },
    });

    if (!course) {
      return { success: false, error: "Formation non trouvée" };
    }

    // An instructor may only move a lesson into a course they own
    if (
      session.user.role === Role.INSTRUCTOR &&
      course.instructorId !== session.user.id
    ) {
      return { success: false, error: "Vous n'avez pas accès à cette formation" };
    }

    // Update the lesson
    const lesson = await db.lesson.update({
      where: { id: validatedData.id },
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        description: validatedData.description,
        content: validatedData.content,
        videoUrl: validatedData.videoUrl || null,
        duration: validatedData.duration || null,
        order: validatedData.order,
        published: validatedData.published,
        courseId: validatedData.courseId,
      },
      include: {
        course: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    // Revalidate relevant pages
    revalidatePath("/admin/lessons");
    revalidatePath(`/admin/lessons/${lesson.id}`);
    revalidatePath(`/admin/lessons/${lesson.id}/edit`);
    revalidatePath(`/admin/courses/${lesson.course.id}`);

    revalidateLocalized("/formations");
    revalidateLocalized(`/formations/${previousCourseSlug}`);
    revalidateLocalized(`/formations/${lesson.course.slug}`);
    revalidateLocalized(
      `/formations/${previousCourseSlug}/lessons/${previousLessonSlug}`,
    );
    revalidateLocalized(
      `/formations/${lesson.course.slug}/lessons/${lesson.slug}`,
    );

    revalidateLocalized(`/learn/${previousCourseSlug}`);
    revalidateLocalized(`/learn/${lesson.course.slug}`);
    revalidateLocalized(
      `/learn/${previousCourseSlug}/lessons/${previousLessonSlug}`,
    );
    revalidateLocalized(`/learn/${lesson.course.slug}/lessons/${lesson.slug}`);

    revalidatePath("/sitemap.xml");

    // Create analytics event
    await db.analyticsEvent.create({
      data: {
        userId: session.user.id,
        type: "LESSON_UPDATED",
        source: "admin",
        properties: {
          lessonId: lesson.id,
          courseId: lesson.course.id,
          title: lesson.title,
          published: lesson.published,
        },
      },
    });

    return { success: true, lessonId: lesson.id };
  } catch (error) {
    console.error("Error updating lesson:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Erreur de validation: ${error.errors
          .map((e) => e.message)
          .join(", ")}`,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour de la leçon",
    };
  }
}
