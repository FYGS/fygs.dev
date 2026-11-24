"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/structured-logger";
import { enrollInPath } from "@/lib/paths/enrollment";
import { syncPathCertificates } from "@/lib/paths/certificates";

export interface EnrollInPathActionResult {
  success: boolean;
  message: string;
  enrolledCount?: number;
  needsAccess?: { slug: string; title: string; optional: boolean }[];
}

/** « Commencer le parcours »: enrols the learner in the path and in every course they may take. */
export async function enrollInPathAction(pathId: string): Promise<EnrollInPathActionResult> {
  const parsed = z.string().min(1).max(64).safeParse(pathId);
  if (!parsed.success) return { success: false, message: "Parcours invalide" };

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false, message: "Connectez-vous pour commencer ce parcours" };

  try {
    const result = await enrollInPath(session.user.id, parsed.data);
    if (!result.ok) return { success: false, message: "Ce parcours n'est pas disponible" };

    // courses already completed before enrolling in the path count: the certificate may be due right away
    await syncPathCertificates(session.user.id);

    const path = await db.path.findUnique({ where: { id: parsed.data }, select: { slug: true } });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/my-courses");
    revalidatePath("/parcours");
    if (path) revalidatePath(`/parcours/${path.slug}`);

    const needsAccess = result.needsAccess.map(({ slug, title, optional }) => ({ slug, title, optional }));
    const blocking = needsAccess.filter((c) => !c.optional).length;
    return {
      success: true,
      enrolledCount: result.enrolledCourseIds.length,
      needsAccess,
      message:
        blocking > 0
          ? `Parcours commencé. ${blocking} formation${blocking > 1 ? "s" : ""} du parcours ${blocking > 1 ? "demandent" : "demande"} un abonnement Premium ou un achat.`
          : result.alreadyEnrolled
            ? "Votre inscription au parcours est à jour"
            : "Parcours commencé, bon apprentissage !",
    };
  } catch (error) {
    logger.error("Error enrolling in path", { metadata: { error: error instanceof Error ? error.message : String(error) } });
    return { success: false, message: "Une erreur est survenue, réessayez dans un instant" };
  }
}
