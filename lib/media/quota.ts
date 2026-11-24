import { db } from "@/lib/db";
import type { MediaKind } from "@/lib/generated/prisma/client";

/**
 * What each author may keep in the storage. Every upload is recorded in MediaObject when its address is issued, so the
 * total is known without asking the storage, abandoned uploads count until they are cleaned up, and a given object has
 * an owner (only the owner or an administrator deletes it).
 */

const MB = 1024 * 1024;
const GB = 1024 * MB;

/** Bytes an INSTRUCTOR may hold per kind. An ADMIN has no limit. */
export const MEDIA_QUOTAS: Record<MediaKind, number> = {
  IMAGE: 200 * MB,
  VIDEO: 5 * GB,
  FILE: 1 * GB,
  CAPTIONS: 50 * MB,
};

export class QuotaExceededError extends Error {
  constructor(
    readonly kind: MediaKind,
    readonly limit: number,
  ) {
    super(`Quota exceeded for ${kind}`);
    this.name = "QuotaExceededError";
  }
}

export interface MediaReservation {
  key: string;
  userId: string;
  role?: string | null;
  kind: MediaKind;
  contentType: string;
  sizeBytes: number;
}

/**
 * Checks the author's quota and records the object in ONE transaction, serialised per user: two simultaneous requests
 * cannot both pass the check and exceed the limit together. Throws QuotaExceededError.
 */
export async function reserveMedia({ key, userId, role, kind, contentType, sizeBytes }: MediaReservation): Promise<void> {
  await db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`media:${userId}`}))`;
    if (role !== "ADMIN") {
      const used = await tx.mediaObject.aggregate({
        where: { userId, kind, deletedAt: null },
        _sum: { sizeBytes: true },
      });
      if ((used._sum.sizeBytes ?? 0) + sizeBytes > MEDIA_QUOTAS[kind]) throw new QuotaExceededError(kind, MEDIA_QUOTAS[kind]);
    }
    await tx.mediaObject.create({ data: { key, userId, kind, contentType, sizeBytes } });
  });
}

/** Forgets a reservation whose upload address could not be issued. */
export async function releaseMedia(key: string): Promise<void> {
  await db.mediaObject.deleteMany({ where: { key } });
}

/** The caller's usage per kind, in bytes. */
export async function mediaUsage(userId: string): Promise<Record<MediaKind, number>> {
  const rows = await db.mediaObject.groupBy({
    by: ["kind"],
    where: { userId, deletedAt: null },
    _sum: { sizeBytes: true },
  });
  const usage: Record<MediaKind, number> = { IMAGE: 0, VIDEO: 0, FILE: 0, CAPTIONS: 0 };
  for (const row of rows) usage[row.kind] = row._sum.sizeBytes ?? 0;
  return usage;
}

/** French sentence for the author when a quota is reached. */
export function quotaMessage(kind: MediaKind, limit: number): string {
  const label = { IMAGE: "d'images", VIDEO: "de vidéos", FILE: "de fichiers", CAPTIONS: "de sous-titres" }[kind];
  const size = limit >= GB ? `${limit / GB} Go` : `${Math.round(limit / MB)} Mo`;
  return `Vous avez atteint votre espace ${label} (${size}). Supprimez des fichiers inutilisés ou contactez un administrateur.`;
}
