"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { z } from "zod";
import {
  CourseCategory,
  CourseLevel,
  CourseAccessTier,
  Role,
} from "@prisma/client";
import { CourseData } from "@/types/admin";

const updateCourseSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  slug: z
    .string()
    .min(3, "Le slug doit contenir au moins 3 caractères")
    .regex(
      /^[a-z0-9-]+$/,
      "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets"
    ),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères"),
  category: z.nativeEnum(CourseCategory),
  level: z.nativeEnum(CourseLevel),
  accessTier: z.nativeEnum(CourseAccessTier),
  price: z.number().min(0).nullable(),
  duration: z.number().min(1).nullable(),
  published: z.boolean(),
  featured: z.boolean(),
  previewEnabled: z.boolean(),
  thumbnail: z.string().optional(),
  tags: z.array(z.string()).optional(),
  publicStructure: z.string().optional(),
  publicResources: z.string().optional(),
  publicEvaluation: z.string().optional(),
  publicPrerequisites: z.string().optional(),
});

type UpdateCourseData = z.infer<typeof updateCourseSchema>;

interface UpdateCourseResult {
  success: boolean;
  course?: {
    id: string;
    title: string;
    slug: string;
  };
  error?: string;
}

export async function updateCourse(
  courseId: string,
  data: UpdateCourseData
): Promise<UpdateCourseResult> {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "Vous devez être connecté pour modifier une formation",
      };
    }

    // Vérifier les permissions
    if (
      session.user.role !== Role.ADMIN &&
      session.user.role !== Role.INSTRUCTOR
    ) {
      return {
        success: false,
        error: "Vous n'avez pas les permissions pour modifier une formation",
      };
    }

    // Vérifier que la formation existe et l'accès utilisateur
    const existingCourse = await db.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        slug: true,
        instructorId: true,
      },
    });

    if (!existingCourse) {
      return {
        success: false,
        error: "Formation introuvable",
      };
    }

    // Permission check: ADMIN has almighty power, INSTRUCTOR can only edit their own courses
    if (session.user.role === Role.INSTRUCTOR) {
      if (
        !existingCourse.instructorId ||
        existingCourse.instructorId !== session.user.id
      ) {
        return {
          success: false,
          error:
            "Vous n'avez pas accès à cette formation. Vous ne pouvez modifier que vos propres formations.",
        };
      }
    }
    // ADMIN can edit any course (almighty power preserved)

    // Valider les données
    const validatedData = updateCourseSchema.parse(data);

    // Vérifier l'unicité du slug (si changé)
    if (validatedData.slug !== existingCourse.slug) {
      const slugExists = await db.course.findUnique({
        where: {
          slug: validatedData.slug,
          NOT: { id: courseId },
        },
      });

      if (slugExists) {
        return {
          success: false,
          error: "Ce slug est déjà utilisé par une autre formation",
        };
      }
    }

    // Préparer les données pour la mise à jour
    const courseData: Partial<CourseData> = {
      title: validatedData.title,
      slug: validatedData.slug,
      description: validatedData.description,
      category: validatedData.category,
      level: validatedData.level,
      accessTier: validatedData.accessTier,
      published: validatedData.published,
      featured: validatedData.featured,
      previewEnabled: validatedData.previewEnabled,
      price: validatedData.price,
      duration: validatedData.duration,
      publicStructure: validatedData.publicStructure || null,
      publicResources: validatedData.publicResources || null,
      publicEvaluation: validatedData.publicEvaluation || null,
      publicPrerequisites: validatedData.publicPrerequisites || null,
    };

    // Ajouter la thumbnail si spécifiée
    if (validatedData.thumbnail) {
      courseData.thumbnail = validatedData.thumbnail;
    }

    // Mettre à jour la formation avec gestion des tags
    const course = await db.$transaction(async (tx) => {
      // Supprimer les associations de tags existantes
      await tx.courseTag.deleteMany({
        where: { courseId },
      });

      // Mettre à jour la formation
      const updatedCourse = await tx.course.update({
        where: { id: courseId },
        data: courseData,
      });

      // Ajouter les nouvelles associations de tags
      if (validatedData.tags && validatedData.tags.length > 0) {
        await tx.courseTag.createMany({
          data: validatedData.tags.map((tagId) => ({
            courseId: updatedCourse.id,
            tagId,
          })),
        });
      }

      return updatedCourse;
    });

    // Créer un événement analytics pour le suivi
    await db.analyticsEvent.create({
      data: {
        userId: session.user.id,
        type: "COURSE_UPDATED",
        source: "admin",
        properties: {
          courseId: course.id,
          courseTitle: course.title,
          changes: {
            category: course.category,
            level: course.level,
            accessTier: course.accessTier,
            published: course.published,
            featured: course.featured,
          },
        },
      },
    });

    // Revalider les pages concernées
    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath("/courses");

    if (validatedData.published) {
      revalidatePath("/");
      revalidatePath(`/courses/${course.slug}`);
    }

    return {
      success: true,
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la formation:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error:
          "Données invalides: " + error.errors.map((e) => e.message).join(", "),
      };
    }

    return {
      success: false,
      error: "Une erreur inattendue s'est produite lors de la mise à jour",
    };
  }
}

export async function deleteCourse(
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "Vous devez être connecté pour supprimer une formation",
      };
    }

    // Vérifier les permissions
    if (
      session.user.role !== Role.ADMIN &&
      session.user.role !== Role.INSTRUCTOR
    ) {
      return {
        success: false,
        error: "Vous n'avez pas les permissions pour supprimer une formation",
      };
    }

    // Vérifier que la formation existe
    const existingCourse = await db.course.findUnique({
      where: { id: courseId },
      include: {
        enrollments: true,
        lessons: true,
      },
    });

    if (!existingCourse) {
      return {
        success: false,
        error: "Formation introuvable",
      };
    }

    // Vérifier s'il y a des inscriptions (optionnel - peut être permis selon la logique métier)
    if (existingCourse.enrollments.length > 0) {
      return {
        success: false,
        error: `Impossible de supprimer cette formation car ${existingCourse.enrollments.length} utilisateurs y sont inscrits`,
      };
    }

    // Supprimer la formation et toutes les données associées
    await db.$transaction(async (tx) => {
      // Supprimer les associations de tags
      await tx.courseTag.deleteMany({
        where: { courseId },
      });

      // Supprimer les leçons et leurs données associées
      for (const lesson of existingCourse.lessons) {
        // Supprimer les progrès de leçon
        await tx.progress.deleteMany({
          where: { lessonId: lesson.id },
        });
      }

      // Supprimer les leçons
      await tx.lesson.deleteMany({
        where: { courseId },
      });

      // Supprimer les inscriptions (si elles existent encore)
      await tx.enrollment.deleteMany({
        where: { courseId },
      });

      // Supprimer les avis
      await tx.review.deleteMany({
        where: { courseId },
      });

      // Supprimer la formation
      await tx.course.delete({
        where: { id: courseId },
      });
    });

    // Créer un événement analytics pour le suivi
    await db.analyticsEvent.create({
      data: {
        userId: session.user.id,
        type: "COURSE_DELETED",
        source: "admin",
        properties: {
          courseId: existingCourse.id,
          courseTitle: existingCourse.title,
          category: existingCourse.category,
          enrollmentCount: existingCourse.enrollments.length,
          lessonCount: existingCourse.lessons.length,
        },
      },
    });

    // Revalider les pages concernées
    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    revalidatePath("/");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erreur lors de la suppression de la formation:", error);

    return {
      success: false,
      error: "Une erreur inattendue s'est produite lors de la suppression",
    };
  }
}

/**
 * Create a new module for a course
 */
export async function createModule(
  courseId: string,
  data: { title: string; order: number }
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
      select: { instructorId: true, slug: true },
    });

    if (!course) {
      return { success: false, error: "Formation non trouvée" };
    }

    // Only instructor or admin can create modules
    if (
      session.user.role !== Role.ADMIN &&
      session.user.id !== course.instructorId
    ) {
      return { success: false, error: "Permission refusée" };
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
        order: data.order,
      },
    });

    // Revalidate relevant paths
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath(`/formations/${course.slug}`);

    return { success: true, module: newModule };
  } catch (error) {
    console.error("Error creating module:", error);
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
      include: { course: { select: { instructorId: true, slug: true } } },
    });

    if (!existingModule) {
      return { success: false, error: "Module non trouvé" };
    }

    // Only instructor or admin can update modules
    if (
      session.user.role !== Role.ADMIN &&
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

    // Revalidate relevant paths
    revalidatePath(`/admin/courses/${existingModule.courseId}`);
    revalidatePath(`/formations/${existingModule.course.slug}`);

    return { success: true, module: updatedModule };
  } catch (error) {
    console.error("Error updating module:", error);
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
      include: { course: { select: { instructorId: true, slug: true } } },
    });

    if (!existingModule) {
      return { success: false, error: "Module non trouvé" };
    }

    // Only instructor or admin can delete modules
    if (
      session.user.role !== Role.ADMIN &&
      session.user.id !== existingModule.course.instructorId
    ) {
      return { success: false, error: "Permission refusée" };
    }

    // Delete the module (this will cascade to lessons)
    await db.module.delete({
      where: { id: moduleId },
    });

    // Revalidate relevant paths
    revalidatePath(`/admin/courses/${existingModule.courseId}`);
    revalidatePath(`/formations/${existingModule.course.slug}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting module:", error);
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
      select: { instructorId: true, slug: true },
    });

    if (!course) {
      return { success: false, error: "Formation non trouvée" };
    }

    // Only instructor or admin can reorder modules
    if (
      session.user.role !== Role.ADMIN &&
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

    // Revalidate relevant paths
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath(`/formations/${course.slug}`);

    return { success: true };
  } catch (error) {
    console.error("Error reordering modules:", error);
    return {
      success: false,
      error: "Erreur lors du réordonnancement des modules",
    };
  }
}
