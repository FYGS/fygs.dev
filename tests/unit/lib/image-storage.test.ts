import { afterEach, describe, expect, it, vi } from "vitest";

import { IMAGE_FOLDERS, ImageStorage, imagesBucket, isImageStorageConfigured } from "@/lib/image-storage";

const KEYS = [
  "S3_ENDPOINT",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
  "S3_BUCKET",
  "S3_PUBLIC_URL",
  "S3_IMAGES_BUCKET",
  "S3_IMAGES_PUBLIC_URL",
  "S3_IMAGES_ACCESS_KEY_ID",
  "S3_IMAGES_SECRET_ACCESS_KEY",
] as const;

function setEnv(values: Partial<Record<(typeof KEYS)[number] | "NODE_ENV", string>>) {
  for (const key of KEYS) vi.stubEnv(key, "");
  for (const [key, value] of Object.entries(values)) vi.stubEnv(key, value as string);
}

afterEach(() => vi.unstubAllEnvs());

describe("image storage configuration", () => {
  it("is never 'not configured' in development (local defaults apply)", () => {
    setEnv({ NODE_ENV: "development" });
    expect(isImageStorageConfigured()).toBe(true);
  });

  it("needs the endpoint, both keys and an absolute public address in production, with no development default", () => {
    const complete = {
      NODE_ENV: "production",
      S3_ENDPOINT: "https://s3.example.com",
      S3_ACCESS_KEY_ID: "id",
      S3_SECRET_ACCESS_KEY: "secret",
      S3_PUBLIC_URL: "https://cdn.example.com/media",
    };
    setEnv(complete);
    expect(isImageStorageConfigured()).toBe(true);

    for (const missing of ["S3_ENDPOINT", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_PUBLIC_URL"] as const) {
      setEnv({ ...complete, [missing]: "" });
      expect(isImageStorageConfigured(), `without ${missing}`).toBe(false);
    }

    setEnv({ ...complete, S3_PUBLIC_URL: "/relative" });
    expect(isImageStorageConfigured()).toBe(false);
  });

  it("accepts a key of its own for images", () => {
    setEnv({
      NODE_ENV: "production",
      S3_ENDPOINT: "https://s3.example.com",
      S3_IMAGES_ACCESS_KEY_ID: "img-id",
      S3_IMAGES_SECRET_ACCESS_KEY: "img-secret",
      S3_PUBLIC_URL: "https://cdn.example.com/media",
    });
    expect(isImageStorageConfigured()).toBe(true);
  });

  it("uses the media bucket for images unless a bucket of their own is named", () => {
    setEnv({ S3_BUCKET: "media" });
    expect(imagesBucket()).toBe("media");
    setEnv({ S3_BUCKET: "media", S3_IMAGES_BUCKET: "pictures" });
    expect(imagesBucket()).toBe("pictures");
  });
});

describe("image public address", () => {
  it("is the public base followed by the key, without a doubled slash", () => {
    setEnv({ S3_PUBLIC_URL: "https://cdn.example.com/media/" });
    expect(new ImageStorage().publicUrl("courses/a.png")).toBe("https://cdn.example.com/media/courses/a.png");
  });

  it("prefers the image base address when it is set", () => {
    setEnv({ S3_PUBLIC_URL: "https://cdn.example.com/media", S3_IMAGES_PUBLIC_URL: "https://img.example.com" });
    expect(new ImageStorage().publicUrl("avatars/b.webp")).toBe("https://img.example.com/avatars/b.webp");
  });

  it("falls back to the path-style address of the endpoint and bucket", () => {
    setEnv({ S3_ENDPOINT: "http://localhost:9000/", S3_BUCKET: "dev" });
    expect(new ImageStorage().publicUrl("images/c.jpg")).toBe("http://localhost:9000/dev/images/c.jpg");
  });
});

describe("image folders", () => {
  it("are the only public ones", () => {
    expect([...IMAGE_FOLDERS]).toEqual(["images", "courses", "lessons", "paths", "avatars"]);
  });
});
