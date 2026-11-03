import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { resetDatabase } from "../../support/test-db";
import { createCourse, createSubscription, createUser, enroll } from "../../support/factories";

// A storage that can sign addresses offline (no request is ever sent to it)
process.env.S3_ACCESS_KEY_ID = "AKIDEXAMPLE0000000";
process.env.S3_SECRET_ACCESS_KEY = "secret-for-tests-only-0123456789";
process.env.S3_PUBLIC_URL = "https://media.fygs.test";
process.env.S3_ENDPOINT = "https://s3.fygs.test";
process.env.S3_BUCKET = "paid-media";

const h = vi.hoisted(() => ({
  session: null as { user: { id: string; role?: string; name?: string } } | null,
  deleteFile: vi.fn(async (_key: string) => undefined),
  putImage: vi.fn(async (name: string, _buffer: Buffer, _type: string) => `https://img.fygs.test/${name}`),
}));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn(async () => h.session) } } }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn(async () => ({ allowed: true })), enforceRateLimit: vi.fn(async () => null) }));
vi.mock("@/lib/minio-service", async (original) => ({
  ...(await original<typeof import("@/lib/minio-service")>()),
  isImageStorageConfigured: () => true,
  minioService: { initialize: vi.fn(async () => undefined), putImage: h.putImage, deleteFile: h.deleteFile },
}));

import { QuotaExceededError, mediaUsage, releaseMedia, reserveMedia } from "@/lib/media/quota";
import { authorizeImageDeletion, recordImageDeleted } from "@/lib/media/image-ownership";
import { DELETE as deleteImage, POST as uploadImage } from "@/app/api/upload/image/route";
import { GET as getMedia } from "@/app/api/learn/media/[lessonId]/route";
import { GET as getResource } from "@/app/api/learn/resource/[resourceId]/route";

const GB = 1024 * 1024 * 1024;
const PNG = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

beforeEach(async () => {
  h.session = null;
  h.deleteFile.mockClear();
  h.putImage.mockClear();
  await resetDatabase(db);
});
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

const asUser = (user: { id: string; role?: string }) => {
  h.session = { user };
};

describe("per-user storage quota", () => {
  it("refuses an upload beyond the quota of its kind, counts each kind apart, and exempts administrators", async () => {
    const instructor = await createUser({ role: "INSTRUCTOR" });
    const admin = await createUser({ role: "ADMIN" });
    const reserve = (userId: string, role: string, kind: "VIDEO" | "FILE" | "IMAGE", sizeBytes: number, key: string) =>
      reserveMedia({ key, userId, role, kind, contentType: "video/mp4", sizeBytes });

    // one object is at most 500 MB (the upload limit), so the room is filled with several
    for (let index = 0; index < 5; index++) await reserve(instructor.id, "INSTRUCTOR", "VIDEO", 1 * GB, `videos/a/${index}.mp4`);
    await expect(reserve(instructor.id, "INSTRUCTOR", "VIDEO", 1, "videos/a/over.mp4")).rejects.toBeInstanceOf(QuotaExceededError);
    expect(await db.mediaObject.count({ where: { key: "videos/a/over.mp4" } })).toBe(0);

    // another kind has its own room
    await reserve(instructor.id, "INSTRUCTOR", "FILE", 500 * 1024 * 1024, "resources/a/1.pdf");
    expect(await mediaUsage(instructor.id)).toMatchObject({ VIDEO: 5 * GB, FILE: 500 * 1024 * 1024, IMAGE: 0 });

    // an abandoned reservation is given back
    await releaseMedia("videos/a/0.mp4");
    await reserve(instructor.id, "INSTRUCTOR", "VIDEO", 1 * GB, "videos/a/again.mp4");

    // an administrator has no limit
    for (let index = 0; index < 8; index++) await reserve(admin.id, "ADMIN", "VIDEO", 1 * GB, `videos/b/${index}.mp4`);
    expect((await mediaUsage(admin.id)).VIDEO).toBe(8 * GB);
  });

  it("holds under simultaneous requests: parallel reservations cannot all pass the check", async () => {
    const instructor = await createUser({ role: "INSTRUCTOR" });
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, (_, index) =>
        reserveMedia({ key: `videos/p/${index}.mp4`, userId: instructor.id, role: "INSTRUCTOR", kind: "VIDEO", contentType: "video/mp4", sizeBytes: 1 * GB }),
      ),
    );
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(5);
    expect(results.filter((r) => r.status === "rejected" && r.reason instanceof QuotaExceededError)).toHaveLength(5);
    expect((await mediaUsage(instructor.id)).VIDEO).toBe(5 * GB);
  });
});

describe("who may delete an image", () => {
  async function recordedImage(ownerId: string, key = "courses/course_1_abc.png") {
    await db.mediaObject.create({ data: { key, userId: ownerId, kind: "IMAGE", contentType: "image/png", sizeBytes: 10 } });
    return key;
  }

  it("the owner and an administrator may; another instructor, a legacy object and a bad key may not", async () => {
    const owner = await createUser({ role: "INSTRUCTOR" });
    const other = await createUser({ role: "INSTRUCTOR" });
    const admin = await createUser({ role: "ADMIN" });
    const key = await recordedImage(owner.id);

    expect(await authorizeImageDeletion({ id: owner.id, role: "INSTRUCTOR" }, key)).toEqual({ allowed: true, key });
    expect(await authorizeImageDeletion({ id: other.id, role: "INSTRUCTOR" }, key)).toEqual({ allowed: false, reason: "NOT_OWNER" });
    expect(await authorizeImageDeletion({ id: admin.id, role: "ADMIN" }, key)).toEqual({ allowed: true, key });

    // an object uploaded before owners were recorded: only an administrator
    expect(await authorizeImageDeletion({ id: owner.id, role: "INSTRUCTOR" }, "courses/old_1_x.png")).toEqual({ allowed: false, reason: "NOT_FOUND" });
    expect(await authorizeImageDeletion({ id: admin.id, role: "ADMIN" }, "courses/old_1_x.png")).toEqual({ allowed: true, key: "courses/old_1_x.png" });

    // keys the upload route could never have written, even for an administrator
    for (const bad of ["videos/u1/1-a.mp4", "resources/u1/1.pdf", "../courses/a.png", "courses/../videos/a.mp4", "courses//a.png", "", "courses/a/b.png"]) {
      expect((await authorizeImageDeletion({ id: admin.id, role: "ADMIN" }, bad)).allowed, bad).toBe(false);
    }
  });

  it("a deletion is recorded, audited, and cannot be repeated by the owner", async () => {
    const owner = await createUser({ role: "INSTRUCTOR" });
    const key = await recordedImage(owner.id);
    await recordImageDeleted({ id: owner.id }, key);
    expect((await db.mediaObject.findUniqueOrThrow({ where: { key } })).deletedAt).toBeInstanceOf(Date);
    expect(await db.auditLog.count({ where: { action: "media.deleted", targetId: key, actorId: owner.id } })).toBe(1);
    expect(await authorizeImageDeletion({ id: owner.id, role: "INSTRUCTOR" }, key)).toEqual({ allowed: false, reason: "NOT_FOUND" });
  });
});

/** A multipart request the way a browser sends it, with the announced length. */
async function uploadRequest(file: Uint8Array | string, name: string, type: string, extra: Record<string, string> = {}, announce?: number | null) {
  const form = new FormData();
  form.append("file", new File([file as BlobPart], name, { type }));
  for (const [field, value] of Object.entries(extra)) form.append(field, value);
  const wire = new Response(form);
  const body = await wire.arrayBuffer();
  const headers: Record<string, string> = { "content-type": wire.headers.get("content-type") as string };
  if (announce !== null) headers["content-length"] = String(announce ?? body.byteLength);
  return new NextRequest("http://localhost/api/upload/image", { method: "POST", body, headers });
}

describe("POST /api/upload/image", () => {
  it("is for authors only", async () => {
    expect((await uploadImage(await uploadRequest(PNG, "a.png", "image/png"))).status).toBe(401);
    const student = await createUser();
    asUser({ id: student.id, role: "STUDENT" });
    expect((await uploadImage(await uploadRequest(PNG, "a.png", "image/png"))).status).toBe(403);
    expect(h.putImage).not.toHaveBeenCalled();
  });

  it("decides what the file is from its bytes: a script or an SVG named .png is refused", async () => {
    const author = await createUser({ role: "INSTRUCTOR" });
    asUser({ id: author.id, role: "INSTRUCTOR" });
    for (const content of ['<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>', "<script>alert(1)</script>", "GIF9"]) {
      const response = await uploadImage(await uploadRequest(content, "photo.png", "image/png"));
      expect(response.status, content).toBe(400);
    }
    expect(h.putImage).not.toHaveBeenCalled();
    expect(await db.mediaObject.count()).toBe(0);
  });

  it("stores a real image under a name and type chosen by the server, whatever the client claims", async () => {
    const author = await createUser({ role: "INSTRUCTOR" });
    asUser({ id: author.id, role: "INSTRUCTOR" });
    const response = await uploadImage(await uploadRequest(PNG, "../../evil.svg", "image/svg+xml", { folder: "videos", prefix: "../x" }));
    // the announced type was not an image type, but the bytes are a PNG: it is stored as one
    expect(response.status).toBe(200);
    const [name, , type] = h.putImage.mock.calls[0];
    expect(type).toBe("image/png");
    expect(name).toMatch(/^images\/x_\d+_[0-9a-f]{12}\.png$/); // unknown folder -> images; the prefix is cleaned; extension from the bytes
    expect(await db.mediaObject.findUniqueOrThrow({ where: { key: name } })).toMatchObject({ userId: author.id, kind: "IMAGE", contentType: "image/png" });
  });

  it("refuses an oversized or unannounced body before reading it", async () => {
    const author = await createUser({ role: "INSTRUCTOR" });
    asUser({ id: author.id, role: "INSTRUCTOR" });
    expect((await uploadImage(await uploadRequest(PNG, "a.png", "image/png", {}, 50 * 1024 * 1024))).status).toBe(413);
    expect((await uploadImage(await uploadRequest(PNG, "a.png", "image/png", {}, null))).status).toBe(411);
    expect(h.putImage).not.toHaveBeenCalled();
  });

  it("answers 413 with a French message when the image quota is reached", async () => {
    const author = await createUser({ role: "INSTRUCTOR" });
    asUser({ id: author.id, role: "INSTRUCTOR" });
    await db.mediaObject.create({ data: { key: "images/full.png", userId: author.id, kind: "IMAGE", contentType: "image/png", sizeBytes: 200 * 1024 * 1024 } });
    const response = await uploadImage(await uploadRequest(PNG, "a.png", "image/png"));
    expect(response.status).toBe(413);
    expect(await response.json()).toMatchObject({ code: "QUOTA_EXCEEDED", error: expect.stringContaining("espace d'images") });
  });
});

describe("DELETE /api/upload/image", () => {
  const request = (key: string) => new NextRequest(`http://localhost/api/upload/image?objectName=${encodeURIComponent(key)}`, { method: "DELETE" });

  it("deletes the caller's own image only", async () => {
    const owner = await createUser({ role: "INSTRUCTOR" });
    const other = await createUser({ role: "INSTRUCTOR" });
    const key = "courses/course_1_abc.png";
    await db.mediaObject.create({ data: { key, userId: owner.id, kind: "IMAGE", contentType: "image/png", sizeBytes: 10 } });

    asUser({ id: other.id, role: "INSTRUCTOR" });
    expect((await deleteImage(request(key))).status).toBe(403);
    expect(h.deleteFile).not.toHaveBeenCalled();

    asUser({ id: owner.id, role: "INSTRUCTOR" });
    expect((await deleteImage(request("videos/u1/1-a.mp4"))).status).toBe(400);
    expect((await deleteImage(request(key))).status).toBe(200);
    expect(h.deleteFile).toHaveBeenCalledWith(key);
  });
});

describe("paid media is delivered only to whoever may open the lesson", () => {
  const stored = "https://media.fygs.test/videos/u1/1-a.mp4";

  async function setup() {
    const instructor = await createUser({ role: "INSTRUCTOR" });
    const c = await createCourse({ accessTier: "PREMIUM", price: 49, previewEnabled: false, instructorId: instructor.id });
    const m = await db.module.create({ data: { courseId: c.id, title: "M", slug: "m", order: 1 } });
    const sample = await db.lesson.create({
      data: { courseId: c.id, moduleId: m.id, title: "Intro", slug: "intro", order: 1, published: true, isPreview: true, videoUrl: stored, content: "x" },
    });
    const paid = await db.lesson.create({
      data: { courseId: c.id, moduleId: m.id, title: "Suite", slug: "suite", order: 2, published: true, videoUrl: stored, content: "y" },
    });
    const draft = await db.lesson.create({
      data: { courseId: c.id, moduleId: m.id, title: "Brouillon", slug: "brouillon", order: 3, published: false, videoUrl: stored },
    });
    return { instructor, course: c, sample, paid, draft };
  }
  const media = (lessonId: string) => getMedia(new Request("http://localhost/api/learn/media/x"), { params: Promise.resolve({ lessonId }) });

  it("gives a signed address, never the stored one, to a learner who may watch", async () => {
    const { course: c, paid } = await setup();
    const learner = await createUser();
    await enroll(learner.id, c.id);
    await createSubscription(learner.id); // premium course: an active subscription opens it
    asUser({ id: learner.id });
    const response = await media(paid.id);
    expect(response.status).toBe(302);
    const location = new URL(response.headers.get("location") as string);
    expect(location.origin).toBe("https://s3.fygs.test");
    expect(location.pathname).toBe("/paid-media/videos/u1/1-a.mp4");
    expect(location.searchParams.get("X-Amz-Signature")).toMatch(/^[0-9a-f]{64}$/);
    expect(location.searchParams.get("X-Amz-Expires")).toBe(String(15 * 60));
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("answers 404, as for a lesson that does not exist, to everyone else", async () => {
    const { course: c, paid, draft } = await setup();
    const outsider = await createUser();
    const enrolledNoAccess = await createUser();
    await enroll(enrolledNoAccess.id, c.id); // enrolled in a premium course without a purchase or subscription

    expect((await media(paid.id)).status).toBe(404); // anonymous
    asUser({ id: outsider.id });
    expect((await media(paid.id)).status).toBe(404);
    asUser({ id: enrolledNoAccess.id });
    expect((await media(paid.id)).status).toBe(404);
    expect((await media(draft.id)).status).toBe(404);
    expect((await media("does-not-exist")).status).toBe(404);
  });

  it("shows the free sample without an account, and the author their drafts", async () => {
    const { instructor, sample, draft } = await setup();
    expect((await media(sample.id)).status).toBe(302); // anonymous visitor, free sample
    asUser({ id: instructor.id, role: "INSTRUCTOR" });
    expect((await media(draft.id)).status).toBe(302);
  });

  it("does not follow an address that is not https, and sends an https address elsewhere as it is", async () => {
    const { instructor, sample } = await setup();
    asUser({ id: instructor.id, role: "INSTRUCTOR" });
    await db.lesson.update({ where: { id: sample.id }, data: { videoUrl: "http://plain.example/v.mp4" } });
    expect((await media(sample.id)).status).toBe(404);
    await db.lesson.update({ where: { id: sample.id }, data: { videoUrl: "https://cdn.other.example/v.mp4" } });
    expect((await media(sample.id)).headers.get("location")).toBe("https://cdn.other.example/v.mp4");
    await db.lesson.update({ where: { id: sample.id }, data: { videoUrl: null } });
    expect((await media(sample.id)).status).toBe(404);
  });

  it("serves a lesson file as a download with the same rule, and never redirects a plain link", async () => {
    const { course: c, paid, sample } = await setup();
    const file = await db.lessonResource.create({
      data: { lessonId: paid.id, title: "Support de cours", url: "https://media.fygs.test/resources/u1/1-a.pdf", kind: "FILE", order: 1 },
    });
    const link = await db.lessonResource.create({
      data: { lessonId: paid.id, title: "Un lien", url: "https://example.org/page", kind: "LINK", order: 2 },
    });
    const previewFile = await db.lessonResource.create({
      data: { lessonId: sample.id, title: "Extrait", url: "https://media.fygs.test/resources/u1/2-b.pdf", kind: "FILE", order: 1 },
    });
    const resource = (resourceId: string) => getResource(new Request("http://localhost/api/learn/resource/x"), { params: Promise.resolve({ resourceId }) });

    expect((await resource(file.id)).status).toBe(404); // anonymous, paid lesson
    expect((await resource(previewFile.id)).status).toBe(302); // anonymous, free sample

    const learner = await createUser();
    await enroll(learner.id, c.id);
    await createSubscription(learner.id);
    asUser({ id: learner.id });
    const response = await resource(file.id);
    expect(response.status).toBe(302);
    const location = new URL(response.headers.get("location") as string);
    expect(location.pathname).toBe("/paid-media/resources/u1/1-a.pdf");
    expect(location.searchParams.get("response-content-disposition")).toContain("attachment; filename=\"Support de cours.pdf\"");
    expect((await resource(link.id)).status).toBe(404); // links are opened by the page itself: this route is not a redirector
  });
});

describe("scripts/cleanup-media.mjs (dry run)", () => {
  it("lists the objects nothing refers to, and spares the ones a lesson or a cover still uses", async () => {
    const owner = await createUser({ role: "INSTRUCTOR" });
    const c = await createCourse({ thumbnail: "https://media.fygs.test/videos/u1/cover-in-use.mp4" });
    await db.lesson.create({
      data: { courseId: c.id, title: "L", slug: "l", order: 1, published: true, videoUrl: "https://media.fygs.test/videos/u1/video-in-use.mp4" },
    });
    const longAgo = new Date(Date.now() - 5 * 24 * 3600 * 1000);
    const rows = [
      ["videos/u1/video-in-use.mp4", longAgo],
      ["videos/u1/cover-in-use.mp4", longAgo],
      ["videos/u1/orphan.mp4", longAgo],
      ["videos/u1/too-recent.mp4", new Date()],
    ] as const;
    for (const [key, createdAt] of rows) {
      await db.mediaObject.create({ data: { key, userId: owner.id, kind: "VIDEO", contentType: "video/mp4", sizeBytes: 1000, createdAt } });
    }

    const { stdout } = await promisify(execFile)(process.execPath, ["scripts/cleanup-media.mjs", "--older-than-days=2"], {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL as string },
    });
    expect(stdout).toContain("would remove");
    expect(stdout).toContain("videos/u1/orphan.mp4");
    expect(stdout).not.toContain("video-in-use");
    expect(stdout).not.toContain("cover-in-use");
    expect(stdout).not.toContain("too-recent");
    expect(stdout).toContain("1 unreferenced object(s)");
    // a dry run changes nothing
    expect(await db.mediaObject.count({ where: { deletedAt: null } })).toBe(4);
  });
});
