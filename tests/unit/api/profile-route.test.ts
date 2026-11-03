import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({
  getSession: vi.fn(),
  verifyTOTP: vi.fn(),
  verifyPassword: vi.fn(),
  userUpdate: vi.fn(),
  userFindUnique: vi.fn(),
  accountFindFirst: vi.fn(),
  erasureBlocker: vi.fn(),
  eraseAccount: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit: async () => null }));
vi.mock("@/lib/auth", () => ({
  auth: {
    api: { getSession: m.getSession, verifyTOTP: m.verifyTOTP },
    $context: Promise.resolve({ password: { verify: m.verifyPassword } }),
  },
}));
vi.mock("@/lib/db", () => ({
  db: {
    user: { update: m.userUpdate, findUnique: m.userFindUnique },
    account: { findFirst: m.accountFindFirst },
  },
}));
vi.mock("@/lib/account-erasure", () => ({ erasureBlocker: m.erasureBlocker, eraseAccount: m.eraseAccount }));
vi.mock("@/lib/email-service", () => ({
  emailService: { accountDeleted: () => ({ subject: "s", html: "h" }), sendEmail: m.sendEmail },
}));

import { DELETE, PATCH } from "@/app/api/profile/route";

const request = (method: string, body: unknown) =>
  new NextRequest("http://localhost/api/profile", {
    method,
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });

const session = (createdAgoMs = 0) => ({
  user: { id: "u1", role: "STUDENT" },
  session: { createdAt: new Date(Date.now() - createdAgoMs) },
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  m.getSession.mockResolvedValue(session());
  m.userUpdate.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({ id: "u1", email: "ada@example.com", ...data }));
  m.erasureBlocker.mockResolvedValue(null);
  m.eraseAccount.mockResolvedValue({ ok: true });
  m.accountFindFirst.mockResolvedValue({ password: "hash" });
  m.verifyPassword.mockResolvedValue(true);
  m.userFindUnique.mockResolvedValue({ twoFactorEnabled: false, name: "Ada", email: "ada@example.com" });
  m.sendEmail.mockResolvedValue(true);
});

describe("PATCH /api/profile: the name, and nothing else", () => {
  it("changes the name, cleaned", async () => {
    const res = await PATCH(request("PATCH", { name: "  Ada\u202E   Lovelace " }));
    expect(res.status).toBe(200);
    expect(m.userUpdate).toHaveBeenCalledTimes(1);
    expect(m.userUpdate.mock.calls[0][0].data).toEqual({ name: "Ada Lovelace" });
  });

  it("refuses an e-mail address in the body: it moves through the confirmed flow only", async () => {
    const res = await PATCH(request("PATCH", { name: "Ada", email: "victim@example.com" }));
    expect(res.status).toBe(400);
    expect(m.userUpdate).not.toHaveBeenCalled();
  });

  it.each([{ name: "Ada", role: "ADMIN" }, { name: "Ada", emailVerified: true }, { name: "Ada", isBanned: false }, { name: "Ada", image: "https://evil.example/x" }])(
    "refuses any other field: %j",
    async (body) => {
      expect((await PATCH(request("PATCH", body))).status).toBe(400);
      expect(m.userUpdate).not.toHaveBeenCalled();
    },
  );

  it("refuses a name that is too short once cleaned, or too long", async () => {
    expect((await PATCH(request("PATCH", { name: "\u200B" }))).status).toBe(400);
    expect((await PATCH(request("PATCH", { name: "x".repeat(101) }))).status).toBe(400);
    expect(m.userUpdate).not.toHaveBeenCalled();
  });

  it("needs a session", async () => {
    m.getSession.mockResolvedValue(null);
    expect((await PATCH(request("PATCH", { name: "Ada" }))).status).toBe(401);
  });
});

describe("DELETE /api/profile: erasing the account", () => {
  const body = { confirmation: "SUPPRIMER", password: "correct" };

  it("erases after the confirmation word and the password", async () => {
    const res = await DELETE(request("DELETE", body));
    expect(res.status).toBe(200);
    expect(m.eraseAccount).toHaveBeenCalledWith("u1");
    expect(m.verifyPassword).toHaveBeenCalledWith({ hash: "hash", password: "correct" });
  });

  it("needs a session", async () => {
    m.getSession.mockResolvedValue(null);
    expect((await DELETE(request("DELETE", body))).status).toBe(401);
    expect(m.eraseAccount).not.toHaveBeenCalled();
  });

  it.each([{}, { confirmation: "supprimer" }, { confirmation: "OUI", password: "correct" }, "not json"])("refuses without the exact confirmation word: %j", async (bad) => {
    expect((await DELETE(request("DELETE", bad))).status).toBe(400);
    expect(m.eraseAccount).not.toHaveBeenCalled();
  });

  it("refuses a wrong or missing password", async () => {
    m.verifyPassword.mockResolvedValue(false);
    expect((await DELETE(request("DELETE", body))).status).toBe(403);
    expect((await DELETE(request("DELETE", { confirmation: "SUPPRIMER" }))).status).toBe(403);
    expect(m.eraseAccount).not.toHaveBeenCalled();
  });

  it("refuses an extra field", async () => {
    expect((await DELETE(request("DELETE", { ...body, userId: "someone-else" }))).status).toBe(400);
    expect(m.eraseAccount).not.toHaveBeenCalled();
  });

  it("asks a recent sign-in from an account that has no password", async () => {
    m.accountFindFirst.mockResolvedValue(null);
    m.getSession.mockResolvedValue(session(30 * 60 * 1000));
    expect((await DELETE(request("DELETE", { confirmation: "SUPPRIMER" }))).status).toBe(403);
    m.getSession.mockResolvedValue(session(60 * 1000));
    expect((await DELETE(request("DELETE", { confirmation: "SUPPRIMER" }))).status).toBe(200);
  });

  it("asks the second-factor code when the account has one", async () => {
    m.userFindUnique.mockResolvedValue({ twoFactorEnabled: true, name: "Ada", email: "ada@example.com" });
    expect((await DELETE(request("DELETE", body))).status).toBe(403);
    m.verifyTOTP.mockRejectedValueOnce(new Error("invalid"));
    expect((await DELETE(request("DELETE", { ...body, code: "000000" }))).status).toBe(403);
    expect(m.eraseAccount).not.toHaveBeenCalled();
    m.verifyTOTP.mockResolvedValueOnce({ status: true });
    expect((await DELETE(request("DELETE", { ...body, code: "123 456" }))).status).toBe(200);
    expect(m.verifyTOTP.mock.calls.at(-1)?.[0].body).toEqual({ code: "123456" });
  });

  it("answers 409 with the reason when the account cannot be erased yet", async () => {
    m.erasureBlocker.mockResolvedValue({ ok: false, code: "ACTIVE_SUBSCRIPTION", message: "Résiliez d'abord votre abonnement" });
    const res = await DELETE(request("DELETE", body));
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ code: "ACTIVE_SUBSCRIPTION" });
    expect(m.eraseAccount).not.toHaveBeenCalled();
  });

  it("tells the person by e-mail, at the address the account had", async () => {
    await DELETE(request("DELETE", body));
    expect(m.sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: "ada@example.com" }));
  });
});
