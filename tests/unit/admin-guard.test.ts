import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ getSession: vi.fn(), redirect: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: m.getSession } } }));
vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("next/navigation", () => ({
  // Next's redirect() never returns: it throws
  redirect: (url: string) => {
    m.redirect(url);
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

import { requireAdminPage } from "@/lib/admin-guard";

beforeEach(() => vi.clearAllMocks());

describe("requireAdminPage", () => {
  it("lets an admin through and returns the session", async () => {
    const session = { user: { id: "u1", role: "ADMIN" } };
    m.getSession.mockResolvedValue(session);

    await expect(requireAdminPage()).resolves.toBe(session);
    expect(m.redirect).not.toHaveBeenCalled();
  });

  it("sends an anonymous visitor to the login and keeps the back office as the destination", async () => {
    m.getSession.mockResolvedValue(null);

    await expect(requireAdminPage()).rejects.toThrow("NEXT_REDIRECT:/auth/login?callbackUrl=/admin");
  });

  it.each(["INSTRUCTOR", "STUDENT", undefined, "admin"])("sends a %s back to the back office home, not further", async (role) => {
    m.getSession.mockResolvedValue({ user: { id: "u1", role } });

    await expect(requireAdminPage()).rejects.toThrow("NEXT_REDIRECT:/admin");
  });
});
