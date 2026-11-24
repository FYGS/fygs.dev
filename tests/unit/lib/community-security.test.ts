import { describe, expect, it, vi } from "vitest";
import { clampPaging } from "@/lib/services/community/pagination";
import { httpsUrlOrNull, withSafeLinks, PRIVATE_USER_KEYS, PUBLIC_USER_SELECT } from "@/lib/services/community/public-user";
import { updateProfileSchema } from "@/types/community";
import { isValidBlogSlug } from "@/lib/blog-slug";
import { sanitizeClientEvents, sanitizeEventContext, MAX_EVENTS_PER_BATCH } from "@/lib/analytics-client-events";

vi.mock("server-only", () => ({}));

describe("clampPaging", () => {
  it("brings untrusted numbers back into range", () => {
    expect(clampPaging(1, 20)).toEqual({ page: 1, limit: 20, skip: 0 });
    expect(clampPaging(3, 10)).toEqual({ page: 3, limit: 10, skip: 20 });
    expect(clampPaging(-4, -10)).toEqual({ page: 1, limit: 1, skip: 0 });
    expect(clampPaging(0, 0)).toEqual({ page: 1, limit: 20, skip: 0 });
    expect(clampPaging(Number.NaN, Number.NaN)).toEqual({ page: 1, limit: 20, skip: 0 });
    expect(clampPaging("abc", undefined)).toEqual({ page: 1, limit: 20, skip: 0 });
    expect(clampPaging(2.9, 1_000_000)).toEqual({ page: 2, limit: 50, skip: 50 });
    expect(clampPaging(Number.MAX_SAFE_INTEGER, 50).page).toBe(10_000);
  });
});

describe("public user fields", () => {
  it("the public select holds none of the private keys", () => {
    for (const key of PRIVATE_USER_KEYS) {
      // `updatedAt` is a user timestamp here, and the public select does not contain it either
      expect(Object.keys(PUBLIC_USER_SELECT), key).not.toContain(key);
    }
    expect(Object.keys(PUBLIC_USER_SELECT)).toEqual(
      expect.arrayContaining(["id", "name", "image", "role", "bio", "communityPoints", "communityLevel"]),
    );
  });

  it("profile links are https addresses or nothing", () => {
    expect(httpsUrlOrNull("https://example.com/me")).toBe("https://example.com/me");
    for (const bad of ["javascript:alert(1)", "http://example.com", "data:text/html,x", "//evil.tld", "", null, undefined, "not a url"]) {
      expect(httpsUrlOrNull(bad as string | null | undefined), String(bad)).toBeNull();
    }
    expect(withSafeLinks({ githubUrl: "javascript:1", linkedinUrl: "https://linkedin.com/in/x", websiteUrl: null })).toEqual({
      githubUrl: null,
      linkedinUrl: "https://linkedin.com/in/x",
      websiteUrl: null,
    });
  });

  it("the profile schema refuses everything but https, accepts the empty string (clear) and caps the length", () => {
    expect(updateProfileSchema.safeParse({ websiteUrl: "https://example.com" }).success).toBe(true);
    expect(updateProfileSchema.safeParse({ websiteUrl: "" }).success).toBe(true);
    for (const bad of ["javascript:alert(1)", "http://example.com", "ftp://example.com", "https://" + "a".repeat(300) + ".com"]) {
      expect(updateProfileSchema.safeParse({ githubUrl: bad }).success, bad).toBe(false);
    }
  });
});

describe("blog slugs", () => {
  it("accepts plain slugs", () => {
    for (const slug of ["react-19", "a", "nextjs-16-cache-components"]) expect(isValidBlogSlug(slug), slug).toBe(true);
  });
  it("refuses anything that could leave the blog folder or become a odd Redis key", () => {
    for (const slug of ["../../package", "..%2f..%2fetc", "a/b", "a\\b", "A-Upper", "-start", "end-", "a--b", "", "x".repeat(200), "a b", "a\0b", null, 42]) {
      expect(isValidBlogSlug(slug), String(slug)).toBe(false);
    }
  });
  it("getBlogPost answers null for them without touching the file system", async () => {
    const { getBlogPost, blogPostExists } = await import("@/lib/mdx");
    for (const slug of ["../../package", "..\\..\\package", "a/b", "ABC", "does-not-exist-xyz"]) {
      expect(await getBlogPost(slug), slug).toBeNull();
      expect(await blogPostExists(slug), slug).toBe(false);
    }
  });
});

describe("analytics events sent by a browser", () => {
  const now = Date.parse("2026-11-02T10:00:00Z");

  it("keeps interface events and drops those that mean money or learning", () => {
    const events = sanitizeClientEvents(
      [
        { type: "COURSE_CARD_VIEWED", context: { courseId: "c1" } },
        { type: "COURSE_PURCHASED", context: { amount: 999 } },
        { type: "SUBSCRIPTION_STARTED" },
        { type: "REFUND_ISSUED" },
        { type: "CERTIFICATE_ISSUED" },
        { type: "LESSON_COMPLETED" },
        { type: "ENROLLMENT_CREATED" },
        { type: "ADMIN_OVERRIDE" },
        { type: 42 },
        null,
        "COURSE_CARD_VIEWED",
        { type: "SUBSCRIPTION_CYCLE_TOGGLED", context: { to: "yearly" } },
      ],
      now,
    );
    expect(events.map((e) => e.type)).toEqual(["COURSE_CARD_VIEWED", "SUBSCRIPTION_CYCLE_TOGGLED"]);
  });

  it("reduces the context to a few flat primitive values", () => {
    const context = sanitizeEventContext({
      courseId: "c1",
      count: 3,
      ok: true,
      nested: { a: 1 },
      list: [1, 2],
      fn: () => 1,
      infinity: Number.POSITIVE_INFINITY,
      "bad key!": "x",
      long: "x".repeat(5000),
      ["__proto__"]: { polluted: true },
      constructor: "x",
    });
    expect(Object.keys(context).sort()).toEqual(["count", "courseId", "long", "ok"]);
    expect((context.long as string).length).toBe(200);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(sanitizeEventContext("not an object")).toEqual({});
    expect(sanitizeEventContext([1, 2])).toEqual({});
    expect(Object.keys(sanitizeEventContext(Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`k${i}`, i])))).length).toBe(12);
  });

  it("bounds the batch and replaces a forged time by the server's", () => {
    const many = Array.from({ length: 500 }, () => ({ type: "COURSE_CARD_VIEWED" }));
    expect(sanitizeClientEvents(many, now).length).toBe(MAX_EVENTS_PER_BATCH);
    expect(sanitizeClientEvents("nope", now)).toEqual([]);
    const [forged] = sanitizeClientEvents([{ type: "COURSE_CARD_VIEWED", ts: Date.parse("1999-01-01") }], now);
    expect(forged.timestamp).toBe(new Date(now).toISOString());
    const [fine] = sanitizeClientEvents([{ type: "COURSE_CARD_VIEWED", ts: now - 60_000 }], now);
    expect(fine.timestamp).toBe(new Date(now - 60_000).toISOString());
  });
});
