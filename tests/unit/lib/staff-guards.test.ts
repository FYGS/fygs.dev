import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/navigation", () => ({
  // like Next.js: redirect() never returns
  redirect: (to: string) => {
    throw new Error(`REDIRECT:${to}`);
  },
}));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: m.getSession } } }));
vi.mock("@/lib/db", () => ({ db: {} }));

import { requireAdminPage } from "@/lib/admin-guard";
import { requireAuthor } from "@/lib/curriculum/guard";
import { STAFF_TWO_FACTOR_SETUP_HREF } from "@/lib/staff-2fa";

const asSession = (user: Record<string, unknown>) => ({ user: { id: "u1", pendingStaffRole: null, ...user }, session: {} });

beforeEach(() => vi.clearAllMocks());

describe("requireAdminPage", () => {
  it("sends a visitor to sign in", async () => {
    m.getSession.mockResolvedValue(null);
    await expect(requireAdminPage()).rejects.toThrow("REDIRECT:/auth/login?callbackUrl=/admin");
  });

  it("sends an administrator who has no second factor to set it up, not into the back office", async () => {
    // the session reports such an account as a student, with the real role beside it
    m.getSession.mockResolvedValue(asSession({ role: "STUDENT", pendingStaffRole: "ADMIN" }));
    await expect(requireAdminPage()).rejects.toThrow(`REDIRECT:${STAFF_TWO_FACTOR_SETUP_HREF}`);
  });

  it("lets an administrator who has one in", async () => {
    m.getSession.mockResolvedValue(asSession({ role: "ADMIN" }));
    await expect(requireAdminPage()).resolves.toMatchObject({ user: { role: "ADMIN" } });
  });

  it("keeps an instructor and a learner out of administrator pages", async () => {
    m.getSession.mockResolvedValue(asSession({ role: "INSTRUCTOR" }));
    await expect(requireAdminPage()).rejects.toThrow("REDIRECT:/admin");
    m.getSession.mockResolvedValue(asSession({ role: "STUDENT" }));
    await expect(requireAdminPage()).rejects.toThrow("REDIRECT:/admin");
  });
});

describe("requireAuthor", () => {
  it("refuses an instructor who has no second factor, and says what to do", async () => {
    m.getSession.mockResolvedValue(asSession({ role: "STUDENT", pendingStaffRole: "INSTRUCTOR" }));
    const result = await requireAuthor();
    expect(result).toMatchObject({ ok: false });
    expect((result as { error: string }).error).toMatch(/double authentification/i);
  });

  it("lets an administrator and an instructor who have one author", async () => {
    m.getSession.mockResolvedValue(asSession({ role: "ADMIN" }));
    await expect(requireAuthor()).resolves.toMatchObject({ ok: true, user: { id: "u1", role: "ADMIN" } });
    m.getSession.mockResolvedValue(asSession({ role: "INSTRUCTOR" }));
    await expect(requireAuthor()).resolves.toMatchObject({ ok: true, user: { role: "INSTRUCTOR" } });
  });

  it("refuses a learner and a visitor", async () => {
    m.getSession.mockResolvedValue(asSession({ role: "STUDENT" }));
    await expect(requireAuthor()).resolves.toMatchObject({ ok: false });
    m.getSession.mockResolvedValue(null);
    await expect(requireAuthor()).resolves.toMatchObject({ ok: false });
  });
});
