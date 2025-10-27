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

const createCourseSchema = z.object({
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
  price: z.number().min(0).optional(),
  duration: z.number().min(1).optional(), // Duration in minutes (aligned with schema)
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  previewEnabled: z.boolean().default(true),
  thumbnail: z.string().optional(),
  tags: z.array(z.string()).optional(),
  publicStructure: z.string().optional(),
  publicResources: z.string().optional(),
  publicEvaluation: z.string().optional(),
  publicPrerequisites: z.string().optional(),
});

type CreateCourseData = z.infer<typeof createCourseSchema>;

interface CreateCourseResult {
  success: boolean;
  course?: {
    id: string;
    title: string;
    slug: string;
  };
  error?: string;
}

export async function createCourse(
  data: CreateCourseData
): Promise<CreateCourseResult> {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "Vous devez être connecté pour créer une formation",
      };
    }

    // Vérifier les permissions
    if (
      session.user.role !== Role.ADMIN &&
      session.user.role !== Role.INSTRUCTOR
    ) {
      return {
        success: false,
        error: "Vous n'avez pas les permissions pour créer une formation",
      };
    }

    // Valider les données
    const validatedData = createCourseSchema.parse(data);

    // Vérifier l'unicité du slug
    const existingCourse = await db.course.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingCourse) {
      return {
        success: false,
        error: "Ce slug est déjà utilisé par une autre formation",
      };
    }

    // Préparer les données pour la création
    const courseData: CourseData = {
      title: validatedData.title,
      slug: validatedData.slug,
      description: validatedData.description,
      category: validatedData.category,
      level: validatedData.level,
      accessTier: validatedData.accessTier,
      published: validatedData.published,
      featured: validatedData.featured,
      previewEnabled: validatedData.previewEnabled,
      // Set instructor ownership - INSTRUCTOR gets auto-assigned, ADMIN can create unassigned courses
      instructorId:
        session.user.role === Role.INSTRUCTOR ? session.user.id : null,
      publicStructure: validatedData.publicStructure || null,
      publicResources: validatedData.publicResources || null,
      publicEvaluation: validatedData.publicEvaluation || null,
      publicPrerequisites: validatedData.publicPrerequisites || null,
    };

    // Ajouter le prix si spécifié
    if (validatedData.price !== undefined) {
      courseData.price = validatedData.price;
    }

    // Ajouter la durée si spécifiée
    if (validatedData.duration !== undefined) {
      courseData.duration = validatedData.duration;
    }

    // Ajouter la thumbnail si spécifiée
    if (validatedData.thumbnail) {
      courseData.thumbnail = validatedData.thumbnail;
    }

    // Créer la formation avec les tags
    const course = await db.course.create({
      data: {
        ...courseData,
        // Associer les tags si fournis
        ...(validatedData.tags &&
          validatedData.tags.length > 0 && {
            tags: {
              create: validatedData.tags.map((tagId) => ({
                tag: {
                  connect: { id: tagId },
                },
              })),
            },
          }),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Créer un événement analytics pour le suivi
    await db.analyticsEvent.create({
      data: {
        userId: session.user.id,
        type: "COURSE_CREATED",
        source: "admin",
        properties: {
          courseId: course.id,
          courseTitle: course.title,
          category: course.category,
          level: course.level,
          accessTier: course.accessTier,
          published: course.published,
          featured: course.featured,
        },
      },
    });

    // Revalider les pages concernées
    revalidatePath("/admin/courses");
    revalidatePath("/courses");

    if (validatedData.published) {
      revalidatePath("/");
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
    console.error("Erreur lors de la création de la formation:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error:
          "Données invalides: " + error.errors.map((e) => e.message).join(", "),
      };
    }

    return {
      success: false,
      error: "Une erreur inattendue s'est produite lors de la création",
    };
  }
}

// Action pour vérifier la disponibilité du slug
export async function checkSlugAvailability(slug: string): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return false;
    }

    const existingCourse = await db.course.findUnique({
      where: { slug },
    });

    return !existingCourse;
  } catch (error) {
    console.error("Erreur lors de la vérification du slug:", error);
    return false;
  }
}

// Action pour créer un nouveau tag rapidement
export async function createQuickTag(
  name: string,
  color: string = "#3B82F6"
): Promise<{
  success: boolean;
  tag?: { id: string; name: string; color: string };
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "Vous devez être connecté",
      };
    }

    if (
      session.user.role !== Role.ADMIN &&
      session.user.role !== Role.INSTRUCTOR
    ) {
      return {
        success: false,
        error: "Permissions insuffisantes",
      };
    }

    // Vérifier si le tag existe déjà
    const existingTag = await db.tag.findUnique({
      where: { name: name.trim() },
    });

    if (existingTag) {
      return {
        success: false,
        error: "Ce tag existe déjà",
      };
    }

    // Créer le nouveau tag
    const tag = await db.tag.create({
      data: {
        name: name.trim(),
        color: color,
      },
    });

    revalidatePath("/admin/courses/new");
    revalidatePath("/admin/tags");

    return {
      success: true,
      tag: {
        id: tag.id,
        name: tag.name,
        color: tag.color,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la création du tag:", error);
    return {
      success: false,
      error: "Erreur lors de la création du tag",
    };
  }
}
