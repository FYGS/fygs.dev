"use server";

import { db } from "@/lib/db";
import { logger } from "@/lib/structured-logger";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Create a new visual support for a course module
 */
export async function createVisualSupport(
  courseId: string,
  data: {
    moduleId: number;
    title: string;
    order?: number;
    content: any;
  }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Non authentifié" };
    }

    // Check if user has permission to edit this course
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });

    if (!course) {
      return { success: false, error: "Formation non trouvée" };
    }

    // Only instructor or admin can create visual supports
    if (
      session.user.role !== "ADMIN" &&
      session.user.id !== course.instructorId
    ) {
      return { success: false, error: "Permission refusée" };
    }

    // Auto-calculate order if not provided
    let order = data.order;
    if (order === undefined) {
      // Get the highest order number for this course and module
      const maxOrderSupport = await db.visualSupport.findFirst({
        where: { courseId, moduleId: data.moduleId },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      order = (maxOrderSupport?.order ?? 0) + 1;
    }

    // Create the visual support
    const visualSupport = await db.visualSupport.create({
      data: {
        courseId,
        moduleId: data.moduleId,
        title: data.title,
        content: data.content,
        order,
      },
    });

    // Get course slug for revalidation
    const courseSlug = await db.course.findUnique({
      where: { id: courseId },
      select: { slug: true },
    });

    // Revalidate all relevant paths
    revalidatePath(`/admin/courses/${courseId}`);
    if (courseSlug?.slug) {
      revalidatePath(`/formations/${courseSlug.slug}`);
      revalidatePath(`/formations/${courseSlug.slug}/visual-supports`);
      revalidatePath(`/formations/${courseSlug.slug}/details`);
    }
    revalidatePath("/formations");
    revalidatePath("/sitemap.xml");

    // Create analytics event
    await db.analyticsEvent.create({
      data: {
        userId: session.user.id,
        type: "VISUAL_SUPPORT_CREATED",
        source: "admin",
        properties: {
          courseId,
          visualSupportId: visualSupport.id,
          moduleId: data.moduleId,
          title: data.title,
        },
      },
    });

    return { success: true, visualSupport };
  } catch (error) {
    logger.error("Error creating visual support", {
      metadata: {
        courseId,
        moduleId: data.moduleId,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return {
      success: false,
      error: "Erreur lors de la création du support visuel",
    };
  }
}

/**
 * Update an existing visual support
 */
export async function updateVisualSupport(
  visualSupportId: string,
  data: {
    title?: string;
    order?: number;
    content?: any;
  }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Non authentifié" };
    }

    // Get the visual support with course info
    const existingVisualSupport = await db.visualSupport.findUnique({
      where: { id: visualSupportId },
      include: { course: { select: { instructorId: true } } },
    });

    if (!existingVisualSupport) {
      return { success: false, error: "Support visuel non trouvé" };
    }

    // Only instructor or admin can update visual supports
    if (
      session.user.role !== "ADMIN" &&
      session.user.id !== existingVisualSupport.course.instructorId
    ) {
      return { success: false, error: "Permission refusée" };
    }

    // Update the visual support
    const updatedVisualSupport = await db.visualSupport.update({
      where: { id: visualSupportId },
      data: {
        title: data.title,
        order: data.order,
        content: data.content,
      },
    });

    // Get course slug for revalidation
    const courseSlug = await db.course.findUnique({
      where: { id: existingVisualSupport.courseId },
      select: { slug: true },
    });

    // Revalidate all relevant paths
    revalidatePath(`/admin/courses/${existingVisualSupport.courseId}`);
    if (courseSlug?.slug) {
      revalidatePath(`/formations/${courseSlug.slug}`);
      revalidatePath(`/formations/${courseSlug.slug}/visual-supports`);
      revalidatePath(`/formations/${courseSlug.slug}/details`);
    }
    revalidatePath("/formations");

    // Create analytics event
    await db.analyticsEvent.create({
      data: {
        userId: session.user.id,
        type: "VISUAL_SUPPORT_UPDATED",
        source: "admin",
        properties: {
          courseId: existingVisualSupport.courseId,
          visualSupportId,
          changes: data,
        },
      },
    });

    return { success: true, visualSupport: updatedVisualSupport };
  } catch (error) {
    logger.error("Error updating visual support", {
      metadata: {
        visualSupportId,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return {
      success: false,
      error: "Erreur lors de la mise à jour du support visuel",
    };
  }
}

/**
 * Delete a visual support
 */
export async function deleteVisualSupport(visualSupportId: string) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Non authentifié" };
    }

    // Get the visual support with course info
    const existingVisualSupport = await db.visualSupport.findUnique({
      where: { id: visualSupportId },
      include: { course: { select: { instructorId: true } } },
    });

    if (!existingVisualSupport) {
      return { success: false, error: "Support visuel non trouvé" };
    }

    // Only instructor or admin can delete visual supports
    if (
      session.user.role !== "ADMIN" &&
      session.user.id !== existingVisualSupport.course.instructorId
    ) {
      return { success: false, error: "Permission refusée" };
    }

    // Delete the visual support
    await db.visualSupport.delete({
      where: { id: visualSupportId },
    });

    // Get course slug for revalidation
    const courseSlug = await db.course.findUnique({
      where: { id: existingVisualSupport.courseId },
      select: { slug: true },
    });

    // Revalidate all relevant paths
    revalidatePath(`/admin/courses/${existingVisualSupport.courseId}`);
    if (courseSlug?.slug) {
      revalidatePath(`/formations/${courseSlug.slug}`);
      revalidatePath(`/formations/${courseSlug.slug}/visual-supports`);
      revalidatePath(`/formations/${courseSlug.slug}/details`);
    }
    revalidatePath("/formations");

    // Create analytics event
    await db.analyticsEvent.create({
      data: {
        userId: session.user.id,
        type: "VISUAL_SUPPORT_DELETED",
        source: "admin",
        properties: {
          courseId: existingVisualSupport.courseId,
          visualSupportId,
          moduleId: existingVisualSupport.moduleId,
        },
      },
    });

    return { success: true };
  } catch (error) {
    logger.error("Error deleting visual support", {
      metadata: {
        visualSupportId,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return {
      success: false,
      error: "Erreur lors de la suppression du support visuel",
    };
  }
}
