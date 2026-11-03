import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { isUploadStorageConfigured, mediaBucket, publicBase, s3Client } from "@/lib/s3-presign";

/**
 * Delivery of paid media (lesson videos, downloadable resources, captions). The learner's browser never gets the
 * stored address: it asks the site (which checks the right to open the lesson) and is sent to a short-lived signed
 * address. Keep the bucket private and a copied address stops working after a few minutes; with a public bucket the
 * signed address still works, but so does the plain one (see docs/storage-hardening.md).
 */

/** How long a signed read address lives. The player asks for a new one when it expires. */
export const SIGNED_READ_TTL_SECONDS = 15 * 60;

/** The object key behind a stored address when it belongs to our storage, else null. */
export function storageKeyFromUrl(address: string | null | undefined): string | null {
  const base = publicBase();
  if (!address || !base) return null;
  const prefix = `${base}/`;
  if (!address.startsWith(prefix)) return null;
  let key: string;
  try {
    key = decodeURIComponent(address.slice(prefix.length).split(/[?#]/)[0]);
  } catch {
    return null;
  }
  if (!key || key.includes("..") || key.includes("//") || key.startsWith("/") || key.includes("\\")) return null;
  return key;
}

export interface SignedReadOptions {
  /** Ask the browser to save the file instead of showing it. */
  downloadAs?: string;
  expiresIn?: number;
}

/** A signed address to read one object, or null when the storage is not configured. */
export async function signedReadUrl(key: string, { downloadAs, expiresIn = SIGNED_READ_TTL_SECONDS }: SignedReadOptions = {}): Promise<string | null> {
  if (!isUploadStorageConfigured()) return null;
  const command = new GetObjectCommand({
    Bucket: mediaBucket(),
    Key: key,
    ...(downloadAs && { ResponseContentDisposition: contentDispositionAttachment(downloadAs) }),
  });
  return getSignedUrl(s3Client(), command, { expiresIn });
}

/** `attachment; filename="..."; filename*=UTF-8''...` with a name that cannot break the header. */
export function contentDispositionAttachment(name: string): string {
  const clean = name.replace(/[\u0000-\u001f\u007f"\\/:*?<>|]+/g, "_").trim().slice(0, 120) || "fichier";
  const ascii = clean.replace(/[^\x20-\x7e]/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(clean)}`;
}
