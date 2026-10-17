"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Role } from "@/lib/generated/prisma/browser";

// Validation schema aligned with Prisma schema
const lessonSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(255, "Le titre est trop long"),
  slug: z
    .string()
    .min(1, "Le slug est requis")
    .max(255, "Le slug est trop long"),
  description: z.string().optional(),
  content: z.string().optional(), // MDX content
  videoUrl: z.string().url("URL vidéo invalide").optional().or(z.literal("")),
  duration: z.number().int().min(0, "La durée doit être positive").optional(),
  order: z.number().int().min(1, "L'ordre doit être supérieur à 0"),
  published: z.boolean().default(false),
  courseId: z.string().cuid("ID de formation invalide"),
  moduleId: z.string().cuid("ID de module invalide").optional(),
});

export async function createLesson(formData: FormData) {
  // Verify authentication and permissions
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Non authentifié");
  }

  if (
    session.user.role !== Role.ADMIN &&
    session.user.role !== Role.INSTRUCTOR
  ) {
    throw new Error("Permissions insuffisantes");
  }

  try {
    // Parse and validate form data
    const rawData = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      description: (formData.get("description") as string) || undefined,
      content: (formData.get("content") as string) || undefined,
      videoUrl: (formData.get("videoUrl") as string) || undefined,
      duration: formData.get("duration")
        ? parseInt(formData.get("duration") as string)
        : undefined,
      order: parseInt(formData.get("order") as string),
      published: formData.get("published") === "true",
      courseId: formData.get("courseId") as string,
      moduleId: (formData.get("moduleId") as string) || undefined,
    };

    const validatedData = lessonSchema.parse(rawData);

    // Verify the course exists and user has access
    const course = await db.course.findUnique({
      where: { id: validatedData.courseId },
      select: { id: true, title: true, slug: true, instructorId: true },
    });

    if (!course) {
      throw new Error("Formation non trouvée");
    }

    // Permission check: ADMIN has almighty power, INSTRUCTOR can only create lessons in their own courses
    if (session.user.role === Role.INSTRUCTOR) {
      if (!course.instructorId || course.instructorId !== session.user.id) {
        throw new Error(
          "Vous n'avez pas accès à cette formation. Vous ne pouvez créer des leçons que dans vos propres formations."
        );
      }
    }
    // ADMIN can create lessons in any course (almighty power preserved)

    // If moduleId is provided, verify it belongs to the course
    if (validatedData.moduleId) {
      const selectedModule = await db.module.findUnique({
        where: { id: validatedData.moduleId },
        select: { courseId: true },
      });

      if (
        !selectedModule ||
        selectedModule.courseId !== validatedData.courseId
      ) {
        throw new Error(
          "Le module sélectionné n'appartient pas à cette formation"
        );
      }
    }

    // Check if slug is unique within the course
    const existingLesson = await db.lesson.findUnique({
      where: {
        courseId_slug: {
          courseId: validatedData.courseId,
          slug: validatedData.slug,
        },
      },
    });

    if (existingLesson) {
      throw new Error("Ce slug existe déjà pour cette formation");
    }

    // Create the lesson
    const lesson = await db.lesson.create({
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
        moduleId: validatedData.moduleId || null,
      },
      include: {
        course: {
          select: { id: true, title: true, slug: true },
        },
        module: {
          select: { id: true, title: true, order: true },
        },
      },
    });

    // Revalidate relevant pages
    revalidatePath("/admin/lessons");
    revalidatePath(`/admin/courses/${course.id}`);
    revalidatePath(`/formations/${course.slug}`);
    revalidatePath(`/formations/${course.slug}/lessons/${lesson.slug}`);
    revalidatePath("/formations");
    revalidatePath("/sitemap.xml");

    // Create analytics event
    await db.analyticsEvent.create({
      data: {
        userId: session.user.id,
        type: "LESSON_CREATED",
        source: "admin",
        properties: {
          lessonId: lesson.id,
          courseId: course.id,
          title: lesson.title,
          published: lesson.published,
          moduleId: lesson.moduleId,
        },
      },
    });

    // Return success - redirect will be handled by the client
    return { success: true, lessonId: lesson.id };
  } catch (error) {
    console.error("Error creating lesson:", error);
    if (error instanceof z.ZodError) {
      throw new Error(
        `Erreur de validation: ${error.issues.map((e) => e.message).join(", ")}`
      );
    }
    throw new Error(
      error instanceof Error
        ? error.message
        : "Erreur lors de la création de la leçon"
    );
  }
}
