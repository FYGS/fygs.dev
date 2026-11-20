import { CreateBucketCommand, DeleteObjectCommand, HeadBucketCommand, PutBucketPolicyCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { logger } from "./structured-logger";

/**
 * Public images (covers, avatars, lesson pictures) on any S3-compatible storage (Garage, SeaweedFS, R2, B2, Scaleway, AWS...).
 *
 * Variables (all `S3_*`, shared with the paid-media storage in `lib/s3-presign.ts`):
 * - `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`: the connection (a key of its own for images:
 *   `S3_IMAGES_ACCESS_KEY_ID` / `S3_IMAGES_SECRET_ACCESS_KEY`, which win when both are set);
 * - `S3_IMAGES_BUCKET`: the bucket of the images, `S3_BUCKET` when unset (one bucket for everything is fine: only the image
 *   folders are ever public);
 * - `S3_IMAGES_PUBLIC_URL`: the public base address of that bucket, `S3_PUBLIC_URL` when unset;
 * - `S3_IMAGES_PUBLIC_POLICY=1`: apply a public-read policy to the image folders once (not every provider supports bucket
 *   policies: with R2 or Backblaze, make the bucket public in their console instead).
 */

/** The folders of the image bucket. Only these hold public images; the upload route refuses any other folder. */
export const IMAGE_FOLDERS = ["images", "courses", "lessons", "paths", "avatars"] as const;

const production = () => process.env.NODE_ENV === "production";

export function imagesBucket(): string {
  return process.env.S3_IMAGES_BUCKET || process.env.S3_BUCKET || "fygs-videos";
}

function imagesPublicBase(): string | null {
  const base = (process.env.S3_IMAGES_PUBLIC_URL || process.env.S3_PUBLIC_URL || "").trim().replace(/\/+$/, "");
  return /^https?:\/\//i.test(base) ? base : null;
}

/**
 * Whether images can be stored. In production the endpoint, both keys and an absolute public address must be set (no
 * fallback to development defaults); in development the local defaults apply and an unreachable server is reported by
 * the upload route as "storage not configured".
 */
export function isImageStorageConfigured(): boolean {
  if (!production()) return true;
  const key = process.env.S3_IMAGES_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID;
  const secret = process.env.S3_IMAGES_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY;
  return Boolean(process.env.S3_ENDPOINT && key && secret && imagesPublicBase());
}

export class ImageStorage {
  private client: S3Client | null = null;
  private ready = false;

  private s3(): S3Client {
    this.client ??= new S3Client({
      region: process.env.S3_REGION || "us-east-1",
      endpoint: process.env.S3_ENDPOINT || (production() ? undefined : "http://localhost:9000"),
      credentials: {
        accessKeyId: process.env.S3_IMAGES_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_IMAGES_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY || "",
      },
      forcePathStyle: true,
    });
    return this.client;
  }

  /**
   * Checks the bucket once per process (creating it outside production), then applies the public-read policy of the
   * image folders when the owner asked for it.
   */
  async initialize(): Promise<void> {
    if (this.ready) return;
    const bucket = imagesBucket();
    try {
      // Development convenience only: a restricted production key often cannot list or create buckets, so production
      // trusts that the bucket exists (a missing one shows as an upload error).
      if (!production()) {
        try {
          await this.s3().send(new HeadBucketCommand({ Bucket: bucket }));
        } catch (error) {
          const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
          if (status !== 404) throw error;
          await this.s3().send(new CreateBucketCommand({ Bucket: bucket }));
          logger.info("Image bucket created", { metadata: { bucket } });
        }
      }

      if (process.env.S3_IMAGES_PUBLIC_POLICY === "1") {
        const policy = {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: "*",
              Action: ["s3:GetObject"],
              Resource: IMAGE_FOLDERS.map((folder) => `arn:aws:s3:::${bucket}/${folder}/*`),
            },
          ],
        };
        await this.s3().send(new PutBucketPolicyCommand({ Bucket: bucket, Policy: JSON.stringify(policy) }));
      }
      this.ready = true;
    } catch (error) {
      logger.error("Failed to initialize the image storage", {
        metadata: { error: error instanceof Error ? error.message : String(error) },
      });
      throw error;
    }
  }

  /**
   * Store an image under an object name the caller built (folder and file name never come from the browser). The type is
   * the one detected in the bytes, so it can be neither a script nor a page served as an image.
   */
  async putImage(objectName: string, buffer: Buffer, contentType: string): Promise<string> {
    try {
      await this.s3().send(
        new PutObjectCommand({
          Bucket: imagesBucket(),
          Key: objectName,
          Body: buffer,
          ContentType: contentType,
          CacheControl: "public, max-age=31536000", // 1 year cache
        }),
      );
      logger.info("Image stored", { metadata: { objectName, size: buffer.length } });
      return this.publicUrl(objectName);
    } catch (error) {
      logger.error("Failed to store an image", {
        metadata: { objectName, size: buffer.length, error: error instanceof Error ? error.message : String(error) },
      });
      throw error;
    }
  }

  async deleteFile(objectName: string): Promise<void> {
    try {
      await this.s3().send(new DeleteObjectCommand({ Bucket: imagesBucket(), Key: objectName }));
      logger.info("Image deleted", { metadata: { objectName } });
    } catch (error) {
      logger.error("Failed to delete an image", {
        metadata: { objectName, error: error instanceof Error ? error.message : String(error) },
      });
      throw error;
    }
  }

  /** The public address of an object. Without a configured base (development only) the path-style address of the endpoint. */
  publicUrl(objectName: string): string {
    const base = imagesPublicBase();
    if (base) return `${base}/${objectName}`;
    return `${(process.env.S3_ENDPOINT || "http://localhost:9000").replace(/\/+$/, "")}/${imagesBucket()}/${objectName}`;
  }
}

export const imageStorage = new ImageStorage();
