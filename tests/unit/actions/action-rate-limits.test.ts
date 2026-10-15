import { describe, it, expect, vi, beforeEach } from "vitest";

// The real limiter runs (no REDIS_URL -> in-process fallback).
const m = vi.hoisted(() => ({ getSession: vi.fn(), toggleLike: vi.fn() }));

vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: m.getSession } } }));
vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers({ "x-forwarded-for": "203.0.113.9" }))),
  cookies: vi.fn(() => Promise.resolve({ get: () => undefined, set: () => {} })),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/reading-stats", () => ({
  toggleLike: m.toggleLike,
  incrementShareCount: vi.fn().mockResolvedValue(1),
}));
vi.mock("@/lib/access-service", () => ({
  AccessService: { checkCourseAccess: vi.fn().mockResolvedValue({ canAccessCourse: true }) },
}));
vi.mock("@/lib/structured-logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));
vi.mock("@/lib/db", () => {
  const model = () =>
    new Proxy({}, { get: () => () => Promise.resolve(null) });
  return { db: new Proxy({}, { get: () => model() }) };
});

import { toggleBookmark } from "@/app/actions/community/bookmarks";
import { handleLike, handleShare } from "@/app/[locale]/(main)/blog/actions/social-interactions";
import { checkQuizAnswer } from "@/app/actions/quiz-actions";
import { __resetRateLimitMemory } from "@/lib/rate-limit";

beforeEach(() => {
  __resetRateLimitMemory();
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  m.toggleLike.mockResolvedValue(true);
  m.getSession.mockResolvedValue({ user: { id: "user-1", role: "USER" } });
});

describe("community writes", () => {
  it("allows 30 writes a minute per user, then answers 'Too many requests'", async () => {
    const results = [];
    for (let i = 0; i < 31; i++) results.push(await toggleBookmark("d1"));
    expect(results.slice(0, 30).every((r) => r.error !== "Too many requests")).toBe(true);
    expect(results[30]).toEqual({ success: false, error: "Too many requests" });
  });

  it("budgets are per user, not shared", async () => {
    for (let i = 0; i < 31; i++) await toggleBookmark("d1");
    m.getSession.mockResolvedValue({ user: { id: "user-2", role: "USER" } });
    expect((await toggleBookmark("d1")).error).not.toBe("Too many requests");
  });
});

describe("blog interactions", () => {
  it("allows 30 likes/shares a minute per client, then throws", async () => {
    for (let i = 0; i < 30; i++) await handleLike("my-post");
    await expect(handleLike("my-post")).rejects.toThrow("Too many requests");
    await expect(handleShare("my-post")).rejects.toThrow("Too many requests");
    expect(m.toggleLike).toHaveBeenCalledTimes(30);
  });
});

describe("quiz answers", () => {
  it("allows 120 checks a minute per user, then asks to retry", async () => {
    const input = { quizId: "quiz-1", questionId: "q1", selectedOption: 0 };
    let last: Awaited<ReturnType<typeof checkQuizAnswer>> | undefined;
    for (let i = 0; i < 121; i++) last = await checkQuizAnswer(input);
    expect(last).toEqual({
      success: false,
      error: "Trop de requêtes, réessayez dans un instant",
    });
  });
});
