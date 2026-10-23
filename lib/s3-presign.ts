import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let client: S3Client | null = null;

function s3() {
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

/** Characters that can sit in an object key without surprises. */
export function safeExtension(filename: string, fallback: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return /^[a-z0-9]{1,8}$/.test(ext) ? ext : fallback;
}

/**
 * A one-hour URL the browser PUTs the file to directly (no file goes through the Next.js server),
 * and the public address the file will have afterwards.
 */
export async function presignUpload(options: {
  folder: string;
  userId: string;
  extension: string;
  contentType: string;
  size: number;
}): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const key = `${options.folder}/${options.userId}/${Date.now()}-${crypto.randomUUID()}.${options.extension}`;
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET || "fygs-videos",
    Key: key,
    ContentType: options.contentType,
    ContentLength: options.size,
  });
  const uploadUrl = await getSignedUrl(s3(), command, { expiresIn: 3600 });
  return { uploadUrl, publicUrl: `${process.env.S3_PUBLIC_URL || ""}/${key}`, key };
}
