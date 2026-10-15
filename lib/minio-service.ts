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

export class MinIOService {
  private client: Client;
  private bucketName: string;
  private logger = logger;

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

      // Set bucket policy to allow public read access for images
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
          },
        ],
      };

      await this.client.setBucketPolicy(
        this.bucketName,
        JSON.stringify(policy)
      );
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
   * Upload an image with optimization and validation
   */
  async uploadImage(
    file: File | Buffer,
    fileName: string,
    folder: string = "images"
  ): Promise<string> {
    try {
      let buffer: Buffer;
      let size: number;

      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
        size = file.size;
      } else {
        buffer = file;
        size = buffer.length;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (size > maxSize) {
        throw new Error("File size exceeds 5MB limit");
      }

      // Generate unique object name
      const timestamp = Date.now();
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const objectName = `${folder}/${timestamp}_${sanitizedFileName}`;

      // Set metadata
      const metaData = {
        "Content-Type": this.getContentType(fileName),
        "Cache-Control": "public, max-age=31536000", // 1 year cache
        "X-Upload-Date": new Date().toISOString(),
      };

      return await this.uploadFile(objectName, buffer, size, metaData);
    } catch (error) {
      this.logger.error("Failed to upload image", {
        metadata: {
          fileName,
          folder,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
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

  /**
   * Get content type based on file extension
   */
  private getContentType(fileName: string): string {
    const extension = fileName.split(".").pop()?.toLowerCase();

    const contentTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
      pdf: "application/pdf",
      mp4: "video/mp4",
      webm: "video/webm",
    };

    return contentTypes[extension || ""] || "application/octet-stream";
  }

  /**
   * Validate file type for images
   */
  static isValidImageFile(fileName: string): boolean {
    const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const extension = fileName.split(".").pop()?.toLowerCase();
    return allowedExtensions.includes(extension || "");
  }

  /**
   * Generate a safe file name
   */
  static generateSafeFileName(originalName: string, prefix?: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split(".").pop()?.toLowerCase();
    const baseName = originalName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9]/g, "_");

    const fileName = prefix
      ? `${prefix}_${timestamp}_${randomString}_${baseName}.${extension}`
      : `${timestamp}_${randomString}_${baseName}.${extension}`;

    return fileName;
  }
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
