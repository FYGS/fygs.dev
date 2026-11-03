import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { detectImageType, extensionFor } from "@/lib/media/image-signature";
import { isImageObjectKey } from "@/lib/media/image-ownership";
import { MEDIA_QUOTAS, quotaMessage } from "@/lib/media/quota";

const bytes = (...values: number[]) => Uint8Array.from(values);
const ascii = (text: string) => Array.from(text).map((c) => c.charCodeAt(0));

describe("detectImageType: the bytes decide, not the name or the announced type", () => {
  it("recognises PNG, JPEG, GIF and WebP", () => {
    expect(detectImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0))).toBe("image/png");
    expect(detectImageType(bytes(0xff, 0xd8, 0xff, 0xe0, 0))).toBe("image/jpeg");
    expect(detectImageType(bytes(...ascii("GIF89a"), 1, 0))).toBe("image/gif");
    expect(detectImageType(bytes(...ascii("GIF87a"), 1, 0))).toBe("image/gif");
    expect(detectImageType(bytes(...ascii("RIFF"), 1, 2, 3, 4, ...ascii("WEBP"), 0))).toBe("image/webp");
  });

  it("refuses everything else: SVG, HTML, scripts, archives, empty and truncated input", () => {
    const refused = [
      ascii('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>'),
      ascii("<!DOCTYPE html><script>alert(1)</script>"),
      ascii("<?xml version='1.0'?><svg/>"),
      ascii("#!/bin/sh\nrm -rf /"),
      [0x50, 0x4b, 0x03, 0x04], // zip
      [0x25, 0x50, 0x44, 0x46], // pdf
      ascii("RIFF....WAVE"), // RIFF but not WebP
      ascii("GIF90a"),
      [0x89, 0x50, 0x4e],
      [],
    ];
    for (const content of refused) expect(detectImageType(bytes(...content)), String.fromCharCode(...content.slice(0, 12))).toBeNull();
  });

  it("gives the extension from the detected type", () => {
    expect(extensionFor("image/jpeg")).toBe("jpg");
    expect(extensionFor("image/webp")).toBe("webp");
  });
});

describe("isImageObjectKey: only a key the upload route could have written", () => {
  it("accepts folder/file in the image folders", () => {
    expect(isImageObjectKey("courses/course_1731000000000_ab12cd34ef56.png")).toBe(true);
    expect(isImageObjectKey("avatars/image_1_a.webp")).toBe(true);
  });

  it("refuses traversal, other folders, premium media prefixes, encodings and odd shapes", () => {
    const refused = [
      "videos/u1/123-uuid.mp4",
      "resources/u1/123-uuid.pdf",
      "captions/u1/123.vtt",
      "../courses/a.png",
      "courses/../videos/a.mp4",
      "courses//a.png",
      "courses/a/b.png",
      "courses/",
      "/courses/a.png",
      "courses\\a.png",
      "courses/%2e%2e%2fa.png",
      "courses/a.png?x=1",
      "courses/a b.png",
      "",
      "x".repeat(400),
    ];
    for (const key of refused) expect(isImageObjectKey(key), key).toBe(false);
  });
});

describe("quota messages", () => {
  it("states the limit in French", () => {
    expect(quotaMessage("VIDEO", MEDIA_QUOTAS.VIDEO)).toContain("5 Go");
    expect(quotaMessage("IMAGE", MEDIA_QUOTAS.IMAGE)).toContain("200 Mo");
  });
});

describe("storage addresses", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("S3_ACCESS_KEY_ID", "AKIDEXAMPLE0000000");
    vi.stubEnv("S3_SECRET_ACCESS_KEY", "secret-for-tests-only-0123456789");
    vi.stubEnv("S3_PUBLIC_URL", "https://media.fygs.test/");
    vi.stubEnv("S3_ENDPOINT", "https://s3.fygs.test");
    vi.stubEnv("S3_BUCKET", "paid-media");
    vi.stubEnv("S3_REGION", "us-east-1");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("finds the object key behind a stored address, and only for our storage", async () => {
    const { storageKeyFromUrl } = await import("@/lib/media/storage");
    expect(storageKeyFromUrl("https://media.fygs.test/videos/u1/1-a.mp4")).toBe("videos/u1/1-a.mp4");
    expect(storageKeyFromUrl("https://media.fygs.test/videos/u1/1-a.mp4?x=1#t")).toBe("videos/u1/1-a.mp4");
    expect(storageKeyFromUrl("https://media.fygs.test/resources/u1/mon%20fichier.pdf")).toBe("resources/u1/mon fichier.pdf");
    for (const other of [
      "https://evil.test/videos/u1/1-a.mp4",
      "https://media.fygs.test.evil.test/videos/a.mp4",
      "http://media.fygs.test/videos/a.mp4",
      "https://media.fygs.test/../etc/passwd",
      "https://media.fygs.test/videos/%2e%2e/secret",
      "https://media.fygs.test//videos/a.mp4",
      "https://media.fygs.test/",
      "",
      null,
    ]) {
      expect(storageKeyFromUrl(other as string | null), String(other)).toBeNull();
    }
  });

  it("signs a read address that expires and, for a download, asks the browser to save the file", async () => {
    const { signedReadUrl } = await import("@/lib/media/storage");
    const watch = new URL((await signedReadUrl("videos/u1/1-a.mp4")) as string);
    expect(watch.origin).toBe("https://s3.fygs.test");
    expect(watch.pathname).toBe("/paid-media/videos/u1/1-a.mp4");
    expect(Number(watch.searchParams.get("X-Amz-Expires"))).toBe(15 * 60);
    expect(watch.searchParams.get("X-Amz-Signature")).toMatch(/^[0-9a-f]{64}$/);

    const download = new URL((await signedReadUrl("resources/u1/1-a.pdf", { downloadAs: 'Mon "cours".pdf' })) as string);
    expect(download.searchParams.get("response-content-disposition")).toMatch(/^attachment; filename="Mon _cours_\.pdf"; filename\*=UTF-8''/);
  });

  it("a download name cannot break out of the header", async () => {
    const { contentDispositionAttachment } = await import("@/lib/media/storage");
    const header = contentDispositionAttachment('a"\r\nSet-Cookie: x=1;\\../é.pdf');
    expect(header).not.toMatch(/[\r\n]/);
    expect(header.startsWith("attachment; filename=")).toBe(true);
    expect(header).not.toContain('"\r');
    expect(contentDispositionAttachment("")).toContain('filename="fichier"');
  });

  it("says nothing can be signed when the storage is not configured", async () => {
    vi.stubEnv("S3_ACCESS_KEY_ID", "");
    const { signedReadUrl } = await import("@/lib/media/storage");
    expect(await signedReadUrl("videos/u1/1-a.mp4")).toBeNull();
  });
});

describe("upload addresses", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("S3_ACCESS_KEY_ID", "AKIDEXAMPLE0000000");
    vi.stubEnv("S3_SECRET_ACCESS_KEY", "secret-for-tests-only-0123456789");
    vi.stubEnv("S3_PUBLIC_URL", "https://media.fygs.test");
    vi.stubEnv("S3_ENDPOINT", "https://s3.fygs.test");
    vi.stubEnv("S3_BUCKET", "paid-media");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("builds the key on the server, from safe parts only", async () => {
    const { buildObjectKey } = await import("@/lib/s3-presign");
    expect(buildObjectKey({ folder: "videos", userId: "cmabc123", extension: "mp4" })).toMatch(/^videos\/cmabc123\/\d+-[0-9a-f-]{36}\.mp4$/);
    for (const bad of [
      { folder: "videos", userId: "u1", extension: "mp4/../x" },
      { folder: "videos", userId: "../u1", extension: "mp4" },
      { folder: "videos/../x", userId: "u1", extension: "mp4" },
      { folder: "videos", userId: "u1", extension: "html<" },
      { folder: "videos", userId: "u1", extension: "" },
      { folder: "videos", userId: "u1", extension: "toolongext" },
    ]) {
      expect(() => buildObjectKey(bad), JSON.stringify(bad)).toThrow();
    }
  });

  it("signs the content type and the exact length: the storage refuses another type or size", async () => {
    const { presignUpload, UPLOAD_URL_TTL_SECONDS } = await import("@/lib/s3-presign");
    const { uploadUrl, publicUrl, key } = await presignUpload({ key: "videos/u1/1-a.mp4", contentType: "video/mp4", size: 1234 });
    const url = new URL(uploadUrl);
    const signed = (url.searchParams.get("X-Amz-SignedHeaders") ?? "").split(";");
    expect(signed).toContain("content-type");
    expect(signed).toContain("content-length");
    expect(Number(url.searchParams.get("X-Amz-Expires"))).toBe(UPLOAD_URL_TTL_SECONDS);
    expect(UPLOAD_URL_TTL_SECONDS).toBeLessThanOrEqual(15 * 60);
    expect(publicUrl).toBe("https://media.fygs.test/videos/u1/1-a.mp4");
    expect(key).toBe("videos/u1/1-a.mp4");
  });

  it("refuses to issue an address when the storage is not configured", async () => {
    vi.stubEnv("S3_PUBLIC_URL", "");
    const { presignUpload, StorageUnavailableError } = await import("@/lib/s3-presign");
    await expect(presignUpload({ key: "videos/u1/1-a.mp4", contentType: "video/mp4", size: 1 })).rejects.toBeInstanceOf(StorageUnavailableError);
  });
});
