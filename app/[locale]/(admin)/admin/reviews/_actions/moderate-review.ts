"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { Role } from "@/lib/generated/prisma/client";
import { moderateReview } from "@/lib/services/review-moderation";

const schema = z.object({
  reviewId: z.string().min(1).max(64),
  decision: z.enum(["APPROVE", "REJECT"]),
  note: z.string().max(500).optional(),
});

export type ModerateReviewResult =
  | { success: true; status: "APPROVED" | "REJECTED"; changed: boolean }
  | { success: false; error: string };

/** Approve or reject a review. Admins only: the check is made here, not left to the page that shows the button. */
export async function moderateReviewAction(input: z.infer<typeof schema>): Promise<ModerateReviewResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Demande invalide" };

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: "Non authentifié" };
  if (session.user.role !== Role.ADMIN) return { success: false, error: "Accès refusé" };

  const outcome = await moderateReview({ ...parsed.data, moderatorId: session.user.id });
  if (!outcome.ok) return { success: false, error: "Avis introuvable" };

  revalidatePath("/admin/reviews");
  revalidatePath("/admin/reviews/moderation");
  return { success: true, status: outcome.status as "APPROVED" | "REJECTED", changed: outcome.changed };
}
