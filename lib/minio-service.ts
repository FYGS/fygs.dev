import { Client } from "minio";
import { logger } from "./structured-logger";

interface MinIOConfig {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucketName: string;
}

/** The folders of the image bucket. Only these hold public images; the upload route refuses any other folder. */
export const IMAGE_FOLDERS = ["images", "courses", "lessons", "paths", "avatars"] as const;

export class MinIOService {
  private client: Client;
  private bucketName: string;
  private logger = logger;
  private publicPolicyApplied = false;

  constructor(config: MinIOConfig) {
    this.client = new Client({
      endPoint: config.endPoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
    });
    this.bucketName = config.bucketName;
  }

  /**
   * Initialize the MinIO service and ensure bucket exists
   */
  async initialize(): Promise<void> {
    try {
      const bucketExists = await this.client.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.client.makeBucket(this.bucketName, "us-east-1");
        this.logger.info("MinIO bucket created", {
          metadata: { bucketName: this.bucketName },
        });
      }

      // Public read is applied once, only to the image folders, and only when the owner asked for it
      // (MINIO_PUBLIC_IMAGES=1): the rest of the bucket, if it holds anything else, is never made public here.
      if (process.env.MINIO_PUBLIC_IMAGES === "1" && !this.publicPolicyApplied) {
        const policy = {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: "*",
              Action: ["s3:GetObject"],
              Resource: IMAGE_FOLDERS.map((folder) => `arn:aws:s3:::${this.bucketName}/${folder}/*`),
            },
          ],
        };
        await this.client.setBucketPolicy(this.bucketName, JSON.stringify(policy));
        this.publicPolicyApplied = true;
      }
      this.logger.info("MinIO service initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize MinIO service", {
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  }

  /**
   * Upload a file to MinIO
   */
  async uploadFile(
    objectName: string,
    buffer: Buffer,
    size: number,
    metaData: Record<string, any> = {}
  ): Promise<string> {
    try {
      const uploadInfo = await this.client.putObject(
        this.bucketName,
        objectName,
        buffer,
        size,
        metaData
      );

      this.logger.info("File uploaded successfully to MinIO", {
        metadata: {
          objectName,
          size,
          etag: uploadInfo.etag,
          bucketName: this.bucketName,
        },
      });

      return this.getPublicUrl(objectName);
    } catch (error) {
      this.logger.error("Failed to upload file to MinIO", {
        metadata: {
          objectName,
          size,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  }

  /**
   * Store an image under an object name the caller built (folder and file name never come from the browser). The
   * type is the one detected in the bytes, so it can be neither a script nor a page served as an image.
   */
  async putImage(objectName: string, buffer: Buffer, contentType: string): Promise<string> {
    return this.uploadFile(objectName, buffer, buffer.length, {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000", // 1 year cache
    });
  }

  /**
   * Delete a file from MinIO
   */
  async deleteFile(objectName: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucketName, objectName);
      this.logger.info("File deleted successfully from MinIO", {
        metadata: { objectName, bucketName: this.bucketName },
      });
    } catch (error) {
      this.logger.error("Failed to delete file from MinIO", {
        metadata: {
          objectName,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  }

  /**
   * Get public URL for an object
   */
  getPublicUrl(objectName: string): string {
    const apiUrl = process.env.MINIO_API_URL;

    if (apiUrl) {
      // Use the API URL directly if provided
      return `${apiUrl}/${this.bucketName}/${objectName}`;
    }

    // Fallback to constructed URL
    const protocol = process.env.MINIO_USE_SSL === "true" ? "https" : "http";
    const endpoint = process.env.MINIO_ENDPOINT || "localhost:9000";
    return `${protocol}://${endpoint}/${this.bucketName}/${objectName}`;
  }

  /**
   * Generate a presigned URL for secure uploads
   */
  async getPresignedUploadUrl(
    objectName: string,
    expiry: number = 3600
  ): Promise<string> {
    try {
      const presignedUrl = await this.client.presignedPutObject(
        this.bucketName,
        objectName,
        expiry
      );

      this.logger.info("Presigned upload URL generated", {
        metadata: { objectName, expiry },
      });

      return presignedUrl;
    } catch (error) {
      this.logger.error("Failed to generate presigned upload URL", {
        metadata: {
          objectName,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  }

  /**
   * List objects in a folder
   */
  async listObjects(prefix?: string): Promise<string[]> {
    try {
      const objects: string[] = [];
      const stream = this.client.listObjects(this.bucketName, prefix, true);

      return new Promise((resolve, reject) => {
        stream.on("data", (obj) => {
          if (obj.name) {
            objects.push(obj.name);
          }
        });

        stream.on("end", () => {
          resolve(objects);
        });

        stream.on("error", (error) => {
          reject(error);
        });
      });
    } catch (error) {
      this.logger.error("Failed to list objects", {
        metadata: {
          prefix,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  }
}

/**
 * Whether images can be stored. In production the address and both keys must be set (no fallback to the
 * development defaults); in development the local MinIO defaults apply, and an unreachable server is reported
 * by the upload route as "storage not configured".
 */
export function isImageStorageConfigured(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return Boolean(
    (process.env.MINIO_API_URL || process.env.MINIO_ENDPOINT) && process.env.MINIO_ACCESS_KEY && process.env.MINIO_SECRET_KEY,
  );
}

// Create singleton instance
const minioConfig: MinIOConfig = {
  endPoint:
    process.env.MINIO_API_URL?.replace(/^https?:\/\//, "") ||
    process.env.MINIO_ENDPOINT ||
    "localhost",
  port: process.env.MINIO_USE_SSL === "true" ? 443 : 80,
  useSSL: process.env.MINIO_USE_SSL === "true",
  // The well-known minioadmin defaults are for local development only; in
  // production a missing key must fail authentication rather than fall back.
  accessKey:
    process.env.MINIO_ACCESS_KEY ??
    (process.env.NODE_ENV === "production" ? "" : "minioadmin"),
  secretKey:
    process.env.MINIO_SECRET_KEY ??
    (process.env.NODE_ENV === "production" ? "" : "minioadmin"),
  bucketName: process.env.MINIO_BUCKET_NAME || "fygs-dev",
};

export const minioService = new MinIOService(minioConfig);

// // Initialize the service on startup
// minioService.initialize().catch((error) => {
//   logger.error("Failed to initialize MinIO service at startup", {
//     metadata: { error: error instanceof Error ? error.message : String(error) },
//   });
// });
