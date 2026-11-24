"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/structured-logger";
import {
  deletePath,
  isPathSlugAvailable,
  savePath,
  setPathPublished,
  type Actor,
  type SavePathResult,
} from "@/lib/paths/admin";
import { PATH_SLUG_PATTERN, RESERVED_SLUGS, type PathInput } from "@/lib/paths/schema";

const LOCALES = ["fr", "en", "es"] as const;

function revalidateLocalized(path: string) {
  revalidatePath(path);
  for (const locale of LOCALES) revalidatePath(`/${locale}${path}`);
}

function revalidatePublic(...slugs: (string | undefined)[]) {
  revalidateLocalized("/parcours");
  for (const slug of new Set(slugs)) if (slug) revalidateLocalized(`/parcours/${slug}`);
  revalidatePath("/sitemap.xml");
}

async function currentActor(): Promise<Actor | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session ? { id: session.user.id, role: session.user.role } : null;
}

const UNAUTHENTICATED = { success: false, error: "Non authentifié" } as const;

async function slugOf(id: string) {
  return (await db.path.findUnique({ where: { id }, select: { slug: true } }))?.slug;
}

/** Creates (`id` null) or saves a path. Returns the id so the editor can move to /admin/paths/[id]. */
export async function savePathAction(id: string | null, input: PathInput): Promise<SavePathResult> {
  const actor = await currentActor();
  if (!actor) return UNAUTHENTICATED;
  try {
    const previousSlug = id ? await slugOf(id) : undefined;
    const result = await savePath(actor, id, input);
    if (result.success) {
      revalidatePath("/admin/paths");
      revalidatePath(`/admin/paths/${result.id}`);
      revalidatePublic(previousSlug, result.slug);
    }
    return result;
  } catch (error) {
    logger.error("Error saving path", { metadata: { error: error instanceof Error ? error.message : String(error) } });
    return { success: false, error: "Erreur lors de l'enregistrement du parcours" };
  }
}

export async function setPathPublishedAction(id: string, published: boolean): Promise<SavePathResult> {
  const actor = await currentActor();
  if (!actor) return UNAUTHENTICATED;
  try {
    const result = await setPathPublished(actor, id, published);
    if (result.success) {
      revalidatePath("/admin/paths");
      revalidatePath(`/admin/paths/${id}`);
      revalidatePublic(result.slug);
    }
    return result;
  } catch (error) {
    logger.error("Error publishing path", { metadata: { error: error instanceof Error ? error.message : String(error) } });
    return { success: false, error: "Erreur lors du changement de statut" };
  }
}

export async function deletePathAction(id: string): Promise<{ success: boolean; error?: string }> {
  const actor = await currentActor();
  if (!actor) return UNAUTHENTICATED;
  try {
    const result = await deletePath(actor, id);
    if (result.success) {
      revalidatePath("/admin/paths");
      revalidatePublic(result.slug);
      return { success: true };
    }
    return result;
  } catch (error) {
    logger.error("Error deleting path", { metadata: { error: error instanceof Error ? error.message : String(error) } });
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

/** For the editor: is this slug free? Only an admin gets an answer. */
export async function checkPathSlugAction(slug: string, exceptId?: string): Promise<{ available: boolean; valid: boolean }> {
  const actor = await currentActor();
  const valid = PATH_SLUG_PATTERN.test(slug) && !RESERVED_SLUGS.includes(slug) && slug.length >= 3 && slug.length <= 80;
  if (!actor || actor.role !== "ADMIN" || !valid) return { available: false, valid };
  return { available: await isPathSlugAvailable(slug, exceptId), valid };
}
