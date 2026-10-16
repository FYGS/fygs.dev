"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Role } from "@prisma/client";
import { logger } from "@/lib/structured-logger";

const SUPPORTED_LOCALES = ["fr", "en", "es"] as const;

function revalidateLocalized(pathWithoutLocale: string) {
  revalidatePath(pathWithoutLocale);
  for (const locale of SUPPORTED_LOCALES) {
    revalidatePath(`/${locale}${pathWithoutLocale}`);
  }
}

const inlineLessonSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(255),
  courseId: z.string().cuid(),
  moduleId: z.string().cuid(),
  order: z.number().int().min(1).optional(),
});

export async function createLessonInline(data: {
  title: string;
  courseId: string;
  moduleId: string;
  order?: number;
}) {
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

  try {
    const validated = inlineLessonSchema.parse(data);

    // Verify course access
    const course = await db.course.findUnique({
      where: { id: validated.courseId },
      select: { id: true, slug: true, instructorId: true },
    });

    if (!course) {
      return { success: false, error: "Formation non trouvée" };
    }

    if (session.user.role === Role.INSTRUCTOR) {
      if (!course.instructorId || course.instructorId !== session.user.id) {
        return { success: false, error: "Accès refusé" };
      }
    }

    // Auto-calculate order
    let order = validated.order;
    if (!order) {
      const maxLesson = await db.lesson.findFirst({
        where: { moduleId: validated.moduleId },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      order = (maxLesson?.order ?? 0) + 1;
    }

    // Generate slug
    const slug = validated.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    const lesson = await db.lesson.create({
      data: {
        title: validated.title,
        slug,
        order,
        courseId: validated.courseId,
        moduleId: validated.moduleId,
        published: false,
      },
    });

    revalidatePath(`/admin/courses/${validated.courseId}`);
    if (course.slug) {
      revalidateLocalized(`/formations/${course.slug}`);
      revalidateLocalized(`/learn/${course.slug}`);
    }

    logger.info("Lesson created inline", {
      metadata: {
        lessonId: lesson.id,
        courseId: validated.courseId,
        moduleId: validated.moduleId,
      },
    });

    return { success: true, lesson };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    logger.error("Error creating lesson inline", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return { success: false, error: "Erreur lors de la création de la leçon" };
  }
}

export async function updateLessonInline(
  lessonId: string,
  data: { title?: string; published?: boolean; order?: number },
) {
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

  try {
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: { course: { select: { instructorId: true, slug: true } } },
    });

    if (!lesson) {
      return { success: false, error: "Leçon non trouvée" };
    }

    if (session.user.role === Role.INSTRUCTOR) {
      if (
        !lesson.course.instructorId ||
        lesson.course.instructorId !== session.user.id
      ) {
        return { success: false, error: "Accès refusé" };
      }
    }

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) {
      updateData.title = data.title;
      updateData.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    }
    if (data.published !== undefined) updateData.published = data.published;
    if (data.order !== undefined) updateData.order = data.order;

    const updated = await db.lesson.update({
      where: { id: lessonId },
      data: updateData,
    });

    const previousCourseSlug = lesson.course.slug;
    const previousLessonSlug = lesson.slug;

    revalidatePath(`/admin/courses/${lesson.courseId}`);
    if (lesson.course.slug) {
      revalidateLocalized(`/formations/${lesson.course.slug}`);
      revalidateLocalized(`/learn/${lesson.course.slug}`);

      // Invalidate old and new lesson URLs so slug/title edits never serve stale pages.
      revalidateLocalized(
        `/formations/${previousCourseSlug}/lessons/${previousLessonSlug}`,
      );
      revalidateLocalized(
        `/learn/${previousCourseSlug}/lessons/${previousLessonSlug}`,
      );

      if (updated.slug) {
        revalidateLocalized(
          `/formations/${lesson.course.slug}/lessons/${updated.slug}`,
        );
        revalidateLocalized(
          `/learn/${lesson.course.slug}/lessons/${updated.slug}`,
        );
      }
    }

    return { success: true, lesson: updated };
  } catch (error) {
    logger.error("Error updating lesson inline", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function deleteLessonInline(lessonId: string) {
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

  try {
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: { course: { select: { instructorId: true, slug: true } } },
    });

    if (!lesson) {
      return { success: false, error: "Leçon non trouvée" };
    }

    if (session.user.role === Role.INSTRUCTOR) {
      if (
        !lesson.course.instructorId ||
        lesson.course.instructorId !== session.user.id
      ) {
        return { success: false, error: "Accès refusé" };
      }
    }

    await db.lesson.delete({ where: { id: lessonId } });

    revalidatePath(`/admin/courses/${lesson.courseId}`);
    if (lesson.course.slug) {
      revalidateLocalized(`/formations/${lesson.course.slug}`);
      revalidateLocalized(`/learn/${lesson.course.slug}`);

      revalidateLocalized(
        `/formations/${lesson.course.slug}/lessons/${lesson.slug}`,
      );
      revalidateLocalized(
        `/learn/${lesson.course.slug}/lessons/${lesson.slug}`,
      );
    }

    return { success: true };
  } catch (error) {
    logger.error("Error deleting lesson inline", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

export async function reorderLessons(
  moduleId: string,
  lessonOrders: { id: string; order: number }[],
) {
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

  try {
    // Verify module access
    const mod = await db.module.findUnique({
      where: { id: moduleId },
      include: {
        course: { select: { id: true, instructorId: true, slug: true } },
      },
    });

    if (!mod) {
      return { success: false, error: "Module non trouvé" };
    }

    if (session.user.role === Role.INSTRUCTOR) {
      if (
        !mod.course.instructorId ||
        mod.course.instructorId !== session.user.id
      ) {
        return { success: false, error: "Accès refusé" };
      }
    }

    await Promise.all(
      lessonOrders.map(({ id, order }) =>
        db.lesson.update({ where: { id }, data: { order } }),
      ),
    );

    revalidatePath(`/admin/courses/${mod.course.id}`);
    if (mod.course.slug) {
      revalidateLocalized(`/formations/${mod.course.slug}`);
      revalidateLocalized(`/learn/${mod.course.slug}`);
    }

    return { success: true };
  } catch (error) {
    logger.error("Error reordering lessons", {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return { success: false, error: "Erreur lors du réordonnancement" };
  }
}
