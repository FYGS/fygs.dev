import { db } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { IMAGE_FOLDERS } from "@/lib/image-storage";

/**
 * Who may delete an image from the image storage. An object is deleted only if its key is one the upload route could
 * have produced (an image folder, no traversal), and only by its owner, recorded when it was uploaded, or by an
 * administrator. Objects uploaded before owners were recorded can only be deleted by an administrator.
 */

const FOLDERS = new Set<string>(IMAGE_FOLDERS);

/** `folder/file`: one allowed folder, one plain file name; nothing that climbs, doubles a slash or hides in encoding. */
export function isImageObjectKey(key: string): boolean {
  if (key.length > 300 || key.includes("..") || key.includes("//") || key.includes("\\") || key.includes("%")) return false;
  const parts = key.split("/");
  return parts.length === 2 && FOLDERS.has(parts[0]) && /^[A-Za-z0-9._-]+$/.test(parts[1]);
}

export type ImageDeletion =
  | { allowed: true; key: string }
  | { allowed: false; reason: "INVALID_KEY" | "NOT_FOUND" | "NOT_OWNER" };

/** Whether `actor` may delete the image at `key`. */
export async function authorizeImageDeletion(actor: { id: string; role?: string | null }, rawKey: string): Promise<ImageDeletion> {
  const key = rawKey.trim();
  if (!isImageObjectKey(key)) return { allowed: false, reason: "INVALID_KEY" };
  const recorded = await db.mediaObject.findUnique({ where: { key }, select: { userId: true, kind: true, deletedAt: true } });
  if (actor.role === "ADMIN") return { allowed: true, key };
  if (!recorded || recorded.kind !== "IMAGE" || recorded.deletedAt) return { allowed: false, reason: "NOT_FOUND" };
  if (recorded.userId !== actor.id) return { allowed: false, reason: "NOT_OWNER" };
  return { allowed: true, key };
}

/** To call once the object is gone from the storage. */
export async function recordImageDeleted(actor: { id: string }, key: string): Promise<void> {
  await db.mediaObject.updateMany({ where: { key, deletedAt: null }, data: { deletedAt: new Date() } });
  await writeAudit({ actorId: actor.id, action: "media.deleted", targetType: "media", targetId: key });
}
