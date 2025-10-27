'use server';

import { db } from "@/lib/db";
import { logger } from "@/lib/structured-logger";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Create a new visual support for a course module
 */
export async function createVisualSupport(courseId: string, data: { 
  moduleId: number; 
  title: string; 
  order: number;
  content: any;
}) {
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
      select: { instructorId: true }
    });

    if (!course) {
      return { success: false, error: "Formation non trouvée" };
    }

    // Only instructor or admin can create visual supports
    if (session.user.role !== "ADMIN" && session.user.id !== course.instructorId) {
      return { success: false, error: "Permission refusée" };
    }

    // Create the visual support
    const visualSupport = await db.visualSupport.create({
      data: {
        courseId,
        moduleId: data.moduleId,
        title: data.title,
        content: data.content,
        order: data.order,
      }
    });

    return { success: true, visualSupport };
  } catch (error) {
    logger.error("Error creating visual support", {
      metadata: {
        courseId,
        moduleId: data.moduleId,
        error: error instanceof Error ? error.message : String(error)
      }
    });
    return { success: false, error: "Erreur lors de la création du support visuel" };
  }
}

/**
 * Update an existing visual support
 */
export async function updateVisualSupport(visualSupportId: string, data: { 
  title?: string; 
  order?: number;
  content?: any;
}) {
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
      include: { course: { select: { instructorId: true } } }
    });

    if (!existingVisualSupport) {
      return { success: false, error: "Support visuel non trouvé" };
    }

    // Only instructor or admin can update visual supports
    if (session.user.role !== "ADMIN" && session.user.id !== existingVisualSupport.course.instructorId) {
      return { success: false, error: "Permission refusée" };
    }

    // Update the visual support
    const updatedVisualSupport = await db.visualSupport.update({
      where: { id: visualSupportId },
      data: {
        title: data.title,
        order: data.order,
        content: data.content,
      }
    });

    return { success: true, visualSupport: updatedVisualSupport };
  } catch (error) {
    logger.error("Error updating visual support", {
      metadata: {
        visualSupportId,
        error: error instanceof Error ? error.message : String(error)
      }
    });
    return { success: false, error: "Erreur lors de la mise à jour du support visuel" };
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
      include: { course: { select: { instructorId: true } } }
    });

    if (!existingVisualSupport) {
      return { success: false, error: "Support visuel non trouvé" };
    }

    // Only instructor or admin can delete visual supports
    if (session.user.role !== "ADMIN" && session.user.id !== existingVisualSupport.course.instructorId) {
      return { success: false, error: "Permission refusée" };
    }

    // Delete the visual support
    await db.visualSupport.delete({
      where: { id: visualSupportId }
    });

    return { success: true };
  } catch (error) {
    logger.error("Error deleting visual support", {
      metadata: {
        visualSupportId,
        error: error instanceof Error ? error.message : String(error)
      }
    });
    return { success: false, error: "Erreur lors de la suppression du support visuel" };
  }
}