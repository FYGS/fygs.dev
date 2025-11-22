"use server";

import { db } from "@/lib/db";
import { logger } from "@/lib/structured-logger";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Get all modules for a course
 */
export async function getModulesByCourse(courseId: string) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return { success: false, error: "Non authentifié" };
    }

    // Check if user has permission to view this course's modules
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });

    if (!course) {
      return { success: false, error: "Formation non trouvée" };
    }

    // Only instructor or admin can view modules
    if (
      session.user.role !== "ADMIN" &&
      session.user.id !== course.instructorId
    ) {
      return { success: false, error: "Permission refusée" };
    }

    // Fetch modules for the course
    const modules = await db.module.findMany({
      where: { courseId },
      select: {
        id: true,
        title: true,
        order: true,
        courseId: true,
      },
      orderBy: { order: "asc" },
    });

    return { success: true, modules };
  } catch (error) {
    logger.error("Error fetching modules", {
      metadata: {
        courseId,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return {
      success: false,
      error: "Erreur lors de la récupération des modules",
    };
  }
}

/**
 * Create a new module for a course
 */
export async function createModule(
  courseId: string,
  data: { title: string; order?: number }
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

    // Only instructor or admin can create modules
    if (
      session.user.role !== "ADMIN" &&
      session.user.id !== course.instructorId
    ) {
      return { success: false, error: "Permission refusée" };
    }

    // Auto-calculate order if not provided
    let order = data.order;
    if (order === undefined) {
      // Get the highest order number for this course
      const maxOrderModule = await db.module.findFirst({
        where: { courseId },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      order = (maxOrderModule?.order ?? 0) + 1;
    }

    // Generate slug from title
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Create the module
    const newModule = await db.module.create({
      data: {
        courseId,
        title: data.title,
        slug,
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
      revalidatePath(`/formations/${courseSlug.slug}/details`);
    }
    revalidatePath("/formations");
    revalidatePath("/sitemap.xml");

    // Create analytics event
    await db.analyticsEvent.create({
      data: {
        userId: session.user.id,
        type: "MODULE_CREATED",
        source: "admin",
        properties: {
          courseId,
          moduleId: newModule.id,
          title: data.title,
          order,
        },
      },
    });

    return { success: true, module: newModule };
  } catch (error) {
    logger.error("Error creating module", {
      metadata: {
        courseId,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return { success: false, error: "Erreur lors de la création du module" };
  }
}

/**
 * Update an existing module
 */
export async function updateModule(
  moduleId: string,
  data: { title?: string; order?: number }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return { success: false, error: "Non authentifié" };
    }

    // Get the module with course info
    const existingModule = await db.module.findUnique({
      where: { id: moduleId },
      include: { course: { select: { instructorId: true } } },
    });

    if (!existingModule) {
      return { success: false, error: "Module non trouvé" };
    }

    // Only instructor or admin can update modules
    if (
      session.user.role !== "ADMIN" &&
      session.user.id !== existingModule.course.instructorId
    ) {
      return { success: false, error: "Permission refusée" };
    }

    // Generate new slug if title is updated
    let slug = undefined;
    if (data.title) {
      slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    }

    // Update the module
    const updatedModule = await db.module.update({
      where: { id: moduleId },
      data: {
        title: data.title,
        slug,
        order: data.order,
      },
    });

    // Get course slug for revalidation
    const courseSlug = await db.course.findUnique({
      where: { id: existingModule.courseId },
      select: { slug: true },
    });

    // Revalidate all relevant paths
    revalidatePath(`/admin/courses/${existingModule.courseId}`);
    if (courseSlug?.slug) {
      revalidatePath(`/formations/${courseSlug.slug}`);
      revalidatePath(`/formations/${courseSlug.slug}/details`);
    }
    revalidatePath("/formations");

    // Create analytics event
    await db.analyticsEvent.create({
      data: {
        userId: session.user.id,
        type: "MODULE_UPDATED",
        source: "admin",
        properties: {
          courseId: existingModule.courseId,
          moduleId,
          changes: data,
        },
      },
    });

    return { success: true, module: updatedModule };
  } catch (error) {
    logger.error("Error updating module", {
      metadata: {
        moduleId,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return { success: false, error: "Erreur lors de la mise à jour du module" };
  }
}

/**
 * Delete a module
 */
export async function deleteModule(moduleId: string) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return { success: false, error: "Non authentifié" };
    }

    // Get the module with course info
    const existingModule = await db.module.findUnique({
      where: { id: moduleId },
      include: { course: { select: { instructorId: true } } },
    });

    if (!existingModule) {
      return { success: false, error: "Module non trouvé" };
    }

    // Only instructor or admin can delete modules
    if (
      session.user.role !== "ADMIN" &&
      session.user.id !== existingModule.course.instructorId
    ) {
      return { success: false, error: "Permission refusée" };
    }

    // Delete the module (this will cascade to lessons)
    await db.module.delete({
      where: { id: moduleId },
    });

    // Get course slug for revalidation
    const courseSlug = await db.course.findUnique({
      where: { id: existingModule.courseId },
      select: { slug: true },
    });

    // Revalidate all relevant paths
    revalidatePath(`/admin/courses/${existingModule.courseId}`);
    if (courseSlug?.slug) {
      revalidatePath(`/formations/${courseSlug.slug}`);
      revalidatePath(`/formations/${courseSlug.slug}/details`);
    }
    revalidatePath("/formations");

    // Create analytics event
    await db.analyticsEvent.create({
      data: {
        userId: session.user.id,
        type: "MODULE_DELETED",
        source: "admin",
        properties: {
          courseId: existingModule.courseId,
          moduleId,
        },
      },
    });

    return { success: true };
  } catch (error) {
    logger.error("Error deleting module", {
      metadata: {
        moduleId,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return { success: false, error: "Erreur lors de la suppression du module" };
  }
}

/**
 * Reorder modules within a course
 */
export async function reorderModules(
  courseId: string,
  moduleOrders: { id: string; order: number }[]
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

    // Only instructor or admin can reorder modules
    if (
      session.user.role !== "ADMIN" &&
      session.user.id !== course.instructorId
    ) {
      return { success: false, error: "Permission refusée" };
    }

    // Update the order of each module
    await Promise.all(
      moduleOrders.map(({ id, order }) =>
        db.module.update({
          where: { id },
          data: { order },
        })
      )
    );

    // Get course slug for revalidation
    const courseSlug = await db.course.findUnique({
      where: { id: courseId },
      select: { slug: true },
    });

    // Revalidate all relevant paths
    revalidatePath(`/admin/courses/${courseId}`);
    if (courseSlug?.slug) {
      revalidatePath(`/formations/${courseSlug.slug}`);
      revalidatePath(`/formations/${courseSlug.slug}/details`);
    }
    revalidatePath("/formations");

    // Create analytics event
    await db.analyticsEvent.create({
      data: {
        userId: session.user.id,
        type: "MODULES_REORDERED",
        source: "admin",
        properties: {
          courseId,
          moduleCount: moduleOrders.length,
        },
      },
    });

    return { success: true };
  } catch (error) {
    logger.error("Error reordering modules", {
      metadata: {
        courseId,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return {
      success: false,
      error: "Erreur lors du réordonnancement des modules",
    };
  }
}
