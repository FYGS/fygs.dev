import { describe, it, expect, vi, beforeEach } from "vitest";

const m = vi.hoisted(() => ({
  getSession: vi.fn(),
  toggleLike: vi.fn(),
  incrementShareCount: vi.fn(),
  cookieGet: vi.fn(),
  cookieSet: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: m.getSession } } }));
vi.mock("@/lib/reading-stats", () => ({
  toggleLike: m.toggleLike,
  incrementShareCount: m.incrementShareCount,
}));
vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
  cookies: vi.fn(() => Promise.resolve({ get: m.cookieGet, set: m.cookieSet })),
}));

import { handleLike, handleShare } from "@/app/[locale]/(main)/blog/actions/social-interactions";

beforeEach(() => {
  vi.clearAllMocks();
  m.toggleLike.mockResolvedValue(true);
  m.incrementShareCount.mockResolvedValue(1);
  m.getSession.mockResolvedValue(null);
  m.cookieGet.mockReturnValue(undefined);
});

describe("blog likes", () => {
  it("uses the signed-in user id, never a client-supplied one", async () => {
    m.getSession.mockResolvedValue({ user: { id: "u1" } });
    await handleLike("my-post");
    expect(m.toggleLike).toHaveBeenCalledWith("my-post", "user:u1");
    expect(m.cookieSet).not.toHaveBeenCalled();
  });

  it("gives each anonymous browser its own httpOnly visitor id", async () => {
    await handleLike("my-post");
    const [name, value, options] = m.cookieSet.mock.calls[0];
    expect(name).toBe("blog_vid");
    expect(options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
    expect(m.toggleLike).toHaveBeenCalledWith("my-post", `visitor:${value}`);
  });

  it("reuses the visitor id from the cookie", async () => {
    const id = "123e4567-e89b-12d3-a456-426614174000";
    m.cookieGet.mockReturnValue({ value: id });
    await handleLike("my-post");
    expect(m.toggleLike).toHaveBeenCalledWith("my-post", `visitor:${id}`);
    expect(m.cookieSet).not.toHaveBeenCalled();
  });

  it("ignores a malformed visitor cookie and issues a new one", async () => {
    m.cookieGet.mockReturnValue({ value: "../../etc" });
    await handleLike("my-post");
    expect(m.cookieSet).toHaveBeenCalledTimes(1);
  });

  it.each(["", "UPPER", "a/b", "x".repeat(201), "a b"])("rejects slug %j", async (slug) => {
    await expect(handleLike(slug)).rejects.toThrow("Invalid slug");
    await expect(handleShare(slug)).rejects.toThrow("Invalid slug");
    expect(m.toggleLike).not.toHaveBeenCalled();
    expect(m.incrementShareCount).not.toHaveBeenCalled();
  });

  it("counts a share for a valid slug", async () => {
    expect(await handleShare("my-post")).toBe(1);
  });
});
