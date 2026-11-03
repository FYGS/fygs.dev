import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let client: S3Client | null = null;

/** The S3-compatible client (MinIO included), created once. */
export function s3Client() {
  client ??= new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    },
    forcePathStyle: true, // required for MinIO
  });
  return client;
}

export const mediaBucket = () => process.env.S3_BUCKET || "fygs-videos";

/** What the author reads when files cannot be stored: they can still paste an address. */
export const STORAGE_UNAVAILABLE_MESSAGE =
  "Stockage non configuré : l'envoi de fichiers n'est pas disponible. Collez l'adresse du fichier à la place.";

/** Thrown when the object storage is not configured; the upload routes answer 503 with the message above. */
export class StorageUnavailableError extends Error {
  constructor() {
    super(STORAGE_UNAVAILABLE_MESSAGE);
    this.name = "StorageUnavailableError";
  }
}

/** Public base address of the stored files, without trailing slash, or null when it is missing or not absolute. */
export function publicBase(): string | null {
  const base = process.env.S3_PUBLIC_URL?.trim().replace(/\/+$/, "");
  return base && /^https?:\/\//i.test(base) ? base : null;
}

/** Credentials and an absolute public address are needed: without them an upload could only fail or give a relative link. */
export function isUploadStorageConfigured(): boolean {
  return Boolean(process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY && publicBase());
}

/** How long an upload address stays valid: long enough for a large file on a slow line, short enough to be of no use later. */
export const UPLOAD_URL_TTL_SECONDS = 15 * 60;

/**
 * The object key for an upload: `folder/<user>/<time>-<random>.<extension>`. Built here, never from anything the
 * browser sent, and the extension comes from the content type the upload was accepted for.
 */
export function buildObjectKey(options: { folder: string; userId: string; extension: string }): string {
  if (!/^[a-z0-9]{1,8}$/.test(options.extension)) throw new Error("Unsafe extension");
  if (!/^[a-z0-9-]+$/i.test(options.userId) || !/^[a-z]+$/.test(options.folder)) throw new Error("Unsafe key part");
  return `${options.folder}/${options.userId}/${Date.now()}-${crypto.randomUUID()}.${options.extension}`;
}

/**
 * A short-lived URL the browser PUTs the file to directly (no file goes through the Next.js server), and the public
 * address the file will have afterwards. The content type and the exact length are part of the signature: the storage
 * refuses a PUT that announces another type or another size.
 */
export async function presignUpload(options: {
  key: string;
  contentType: string;
  size: number;
}): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const base = publicBase();
  if (!isUploadStorageConfigured() || !base) throw new StorageUnavailableError();
  const command = new PutObjectCommand({
    Bucket: mediaBucket(),
    Key: options.key,
    ContentType: options.contentType,
    ContentLength: options.size,
  });
  const uploadUrl = await getSignedUrl(s3Client(), command, {
    expiresIn: UPLOAD_URL_TTL_SECONDS,
    // Sign these two headers explicitly, so that they cannot be changed on the way to the storage
    signableHeaders: new Set(["content-type", "content-length"]),
  });
  return { uploadUrl, publicUrl: `${base}/${options.key}`, key: options.key };
}
