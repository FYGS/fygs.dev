"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { z } from "zod";
import { Role } from "@prisma/client";

const createTagSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Format de couleur invalide (ex: #3B82F6)"),
});

const updateTagSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Format de couleur invalide (ex: #3B82F6)")
    .optional(),
});

type CreateTagData = z.infer<typeof createTagSchema>;
type UpdateTagData = z.infer<typeof updateTagSchema>;

interface TagActionResult {
  success: boolean;
  tag?: {
    id: string;
    name: string;
    color: string;
  };
  error?: string;
}

export async function createTag(data: CreateTagData): Promise<TagActionResult> {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "Vous devez être connecté pour créer un tag",
      };
    }

    // Vérifier les permissions
    if (
      session.user.role !== Role.ADMIN &&
      session.user.role !== Role.INSTRUCTOR
    ) {
      return {
        success: false,
        error: "Vous n'avez pas les permissions pour créer un tag",
      };
    }

    // Valider les données
    const validatedData = createTagSchema.parse(data);

    // Vérifier l'unicité du nom
    const existingTag = await db.tag.findUnique({
      where: { name: validatedData.name },
    });

    if (existingTag) {
      return {
        success: false,
        error: "Un tag avec ce nom existe déjà",
      };
    }

    // Créer le tag
    const tag = await db.tag.create({
      data: {
        name: validatedData.name,
        color: validatedData.color,
      },
    });

    // Créer un événement analytics pour le suivi
    await db.analyticsEvent.create({
      data: {
        userId: session.user.id,
        type: "TAG_CREATED",
        source: "admin",
        properties: {
          tagId: tag.id,
          tagName: tag.name,
          tagColor: tag.color,
        },
      },
    });

    // Revalider les pages concernées
    revalidatePath("/admin/tags");
    revalidatePath("/admin/courses/new");

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

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error:
          "Données invalides: " + error.issues.map((e) => e.message).join(", "),
      };
    }

    return {
      success: false,
      error: "Une erreur inattendue s'est produite lors de la création",
    };
  }
}

export async function updateTag(
  tagId: string,
  data: UpdateTagData
): Promise<TagActionResult> {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "Vous devez être connecté pour modifier un tag",
      };
    }

    // Vérifier les permissions
    if (
      session.user.role !== Role.ADMIN &&
      session.user.role !== Role.INSTRUCTOR
    ) {
      return {
        success: false,
        error: "Vous n'avez pas les permissions pour modifier un tag",
      };
    }

    // Vérifier que le tag existe
    const existingTag = await db.tag.findUnique({
      where: { id: tagId },
    });

    if (!existingTag) {
      return {
        success: false,
        error: "Tag non trouvé",
      };
    }

    // Valider les données
    const validatedData = updateTagSchema.parse(data);

    // Vérifier l'unicité du nom si il a changé
    if (validatedData.name && validatedData.name !== existingTag.name) {
      const nameExists = await db.tag.findUnique({
        where: { name: validatedData.name },
      });

      if (nameExists) {
        return {
          success: false,
          error: "Un tag avec ce nom existe déjà",
        };
      }
    }

    // Mettre à jour le tag
    const tag = await db.tag.update({
      where: { id: tagId },
      data: validatedData,
    });

    // Créer un événement analytics pour le suivi
    await db.analyticsEvent.create({
      data: {
        userId: session.user.id,
        type: "TAG_UPDATED",
        source: "admin",
        properties: {
          tagId: tag.id,
          tagName: tag.name,
          tagColor: tag.color,
          changes: validatedData,
        },
      },
    });

    // Revalider les pages concernées
    revalidatePath("/admin/tags");
    revalidatePath("/admin/courses/new");
    revalidatePath(`/admin/tags/${tagId}`);

    return {
      success: true,
      tag: {
        id: tag.id,
        name: tag.name,
        color: tag.color,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du tag:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error:
          "Données invalides: " + error.issues.map((e) => e.message).join(", "),
      };
    }

    return {
      success: false,
      error: "Une erreur inattendue s'est produite lors de la mise à jour",
    };
  }
}

export async function deleteTag(
  tagId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "Vous devez être connecté pour supprimer un tag",
      };
    }

    // Vérifier les permissions
    if (
      session.user.role !== Role.ADMIN &&
      session.user.role !== Role.INSTRUCTOR
    ) {
      return {
        success: false,
        error: "Vous n'avez pas les permissions pour supprimer un tag",
      };
    }

    // Vérifier que le tag existe et qu'il n'est pas utilisé
    const existingTag = await db.tag.findUnique({
      where: { id: tagId },
      include: {
        courses: true,
      },
    });

    if (!existingTag) {
      return {
        success: false,
        error: "Tag non trouvé",
      };
    }

    // Vérifier si le tag est utilisé par des formations
    if (existingTag.courses.length > 0) {
      return {
        success: false,
        error: `Impossible de supprimer ce tag car il est utilisé par ${existingTag.courses.length} formation(s)`,
      };
    }

    // Supprimer le tag
    await db.tag.delete({
      where: { id: tagId },
    });

    // Créer un événement analytics pour le suivi
    await db.analyticsEvent.create({
      data: {
        userId: session.user.id,
        type: "TAG_DELETED",
        source: "admin",
        properties: {
          tagId: existingTag.id,
          tagName: existingTag.name,
          tagColor: existingTag.color,
        },
      },
    });

    // Revalider les pages concernées
    revalidatePath("/admin/tags");
    revalidatePath("/admin/courses/new");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erreur lors de la suppression du tag:", error);

    return {
      success: false,
      error: "Une erreur inattendue s'est produite lors de la suppression",
    };
  }
}

// Fonction pour récupérer tous les tags (utile pour les sélecteurs)
export async function getAllTags() {
  try {
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

    const tags = await db.tag.findMany({
      orderBy: { name: "asc" },
    });

    return { success: true, tags };
  } catch (error) {
    console.error("Erreur lors de la récupération des tags:", error);
    return { success: false, error: "Erreur lors de la récupération des tags" };
  }
}
