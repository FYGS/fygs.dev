import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ getSession: vi.fn(), moderateReview: vi.fn(), revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: m.getSession } } }));
vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("next/cache", () => ({ revalidatePath: m.revalidatePath }));
vi.mock("@/lib/services/review-moderation", () => ({ moderateReview: m.moderateReview }));

import { moderateReviewAction } from "@/app/[locale]/(admin)/admin/reviews/_actions/moderate-review";

beforeEach(() => {
  vi.clearAllMocks();
  m.moderateReview.mockResolvedValue({ ok: true, status: "APPROVED", changed: true });
});

const input = { reviewId: "r1", decision: "APPROVE" as const };

describe("moderateReviewAction", () => {
  it("lets an admin decide, and refreshes both pages", async () => {
    m.getSession.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });

    expect(await moderateReviewAction(input)).toEqual({ success: true, status: "APPROVED", changed: true });
    expect(m.moderateReview).toHaveBeenCalledWith({ reviewId: "r1", decision: "APPROVE", moderatorId: "admin-1" });
    expect(m.revalidatePath).toHaveBeenCalledWith("/admin/reviews");
    expect(m.revalidatePath).toHaveBeenCalledWith("/admin/reviews/moderation");
  });

  it.each(["INSTRUCTOR", "STUDENT", undefined])("refuses a %s, whatever the page showed them", async (role) => {
    m.getSession.mockResolvedValue({ user: { id: "u1", role } });

    expect(await moderateReviewAction(input)).toEqual({ success: false, error: "Accès refusé" });
    expect(m.moderateReview).not.toHaveBeenCalled();
  });

  it("refuses an anonymous caller", async () => {
    m.getSession.mockResolvedValue(null);

    expect(await moderateReviewAction(input)).toEqual({ success: false, error: "Non authentifié" });
    expect(m.moderateReview).not.toHaveBeenCalled();
  });

  it.each([
    { reviewId: "", decision: "APPROVE" },
    { reviewId: "r1", decision: "DELETE" },
    { reviewId: "r1", decision: "APPROVE", note: "x".repeat(501) },
    null,
    "approve",
  ])("rejects malformed input %j before looking at the session", async (bad) => {
    m.getSession.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });

    expect(await moderateReviewAction(bad as never)).toEqual({ success: false, error: "Demande invalide" });
    expect(m.getSession).not.toHaveBeenCalled();
    expect(m.moderateReview).not.toHaveBeenCalled();
  });

  it("says so when the review does not exist (any more)", async () => {
    m.getSession.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    m.moderateReview.mockResolvedValue({ ok: false, error: "NOT_FOUND" });

    expect(await moderateReviewAction(input)).toEqual({ success: false, error: "Avis introuvable" });
    expect(m.revalidatePath).not.toHaveBeenCalled();
  });

  it("tells the page when somebody else had already decided", async () => {
    m.getSession.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    m.moderateReview.mockResolvedValue({ ok: true, status: "APPROVED", changed: false });

    expect(await moderateReviewAction(input)).toEqual({ success: true, status: "APPROVED", changed: false });
  });
});
