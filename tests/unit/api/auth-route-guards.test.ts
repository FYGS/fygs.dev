import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({
  authPost: vi.fn(),
  proof: vi.fn(),
}));

// Redis is unreachable: the limiter runs on its in-process fallback, whatever the environment
vi.mock("@/lib/redis", () => ({
  default: {
    eval: () => Promise.reject(new Error("redis unavailable")),
    setNxEx: () => Promise.reject(new Error("redis unavailable")),
  },
}));
vi.mock("@/lib/auth", () => ({ auth: {} }));
vi.mock("better-auth/next-js", () => ({ toNextJsHandler: () => ({ GET: vi.fn(), POST: m.authPost }) }));
vi.mock("@/lib/anti-automation", () => ({ verifyHumanProof: m.proof }));

import { POST } from "@/app/api/auth/[...all]/route";
import { __resetRateLimitMemory } from "@/lib/rate-limit";

const post = (path: string, body: unknown, headers: Record<string, string> = {}, ip = "203.0.113.9") =>
  new NextRequest(`http://localhost/api/auth${path}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json", "x-forwarded-for": ip, ...headers },
  });

beforeEach(() => {
  __resetRateLimitMemory();
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  m.authPost.mockImplementation(() => Promise.resolve(Response.json({ ok: true })));
  m.proof.mockResolvedValue({ ok: true });
});

describe("a variant of the path does not skip the limits", () => {
  it.each(["/sign-in/email/", "/Sign-In/Email", "//sign-in//email", "/SIGN-IN/EMAIL///"])("%s is limited like /sign-in/email", async (variant) => {
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) statuses.push((await POST(post(variant, { email: `u${i}@b.co`, password: "x" }))).status);
    expect(statuses.slice(0, 10).every((s) => s === 200)).toBe(true);
    expect(statuses[10]).toBe(429);
  });
});

describe("one account behind many e-mail spellings", () => {
  it("counts +tags and case as the same account", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) {
      statuses.push((await POST(post("/sign-in/email", { email: `Victim+${i}@Example.com`, password: "x" }, {}, `198.51.100.${i + 1}`))).status);
    }
    expect(statuses.slice(0, 10).every((s) => s === 200)).toBe(true);
    expect(statuses[10]).toBe(429);
  });

  it("limits sign-ups to ONE address (each one sends a message): 3 an hour, from any number of IPs", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 4; i++) {
      statuses.push((await POST(post("/sign-up/email", { email: "victim@example.com", password: "x", name: "Ada" }, {}, `198.51.100.${i + 1}`))).status);
    }
    expect(statuses).toEqual([200, 200, 200, 429]);
  });
});

describe("second-factor and e-mail change endpoints are limited too", () => {
  it.each([
    ["/two-factor/verify-totp", 10],
    ["/two-factor/verify-backup-code", 10],
    ["/two-factor/enable", 5],
    ["/two-factor/disable", 5],
    ["/change-email", 5],
  ])("%s answers 429 after %i attempts from one address", async (path, limit) => {
    let last = 0;
    for (let i = 0; i <= limit; i++) last = (await POST(post(path, { code: "000000" }))).status;
    expect(last).toBe(429);
    expect(m.authPost).toHaveBeenCalledTimes(limit);
  });
});

describe("honeypot", () => {
  it("answers as if it worked and does nothing when the hidden field was filled", async () => {
    const res = await POST(post("/sign-up/email", { email: "bot@example.com", password: "x", name: "Bot" }, { "x-fx-trap": "http://spam.example" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: true });
    expect(m.authPost).not.toHaveBeenCalled();
  });

  it("lets an empty trap through", async () => {
    await POST(post("/sign-up/email", { email: "ada@example.com", password: "x", name: "Ada" }, { "x-fx-trap": "  " }));
    expect(m.authPost).toHaveBeenCalledTimes(1);
  });
});

describe("proof of work", () => {
  it.each([
    ["/sign-in/email", "sign-in"],
    ["/sign-up/email", "sign-up"],
    ["/request-password-reset", "password-reset"],
    ["/send-verification-email", "sign-up"],
  ])("%s asks for a %s proof, and refuses without it", async (path, action) => {
    m.proof.mockResolvedValueOnce({ ok: false, status: 403, error: "human_proof_invalid" });
    const res = await POST(post(path, { email: "ada@example.com", password: "x" }));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "human_proof_invalid" });
    expect(m.proof).toHaveBeenCalledWith(expect.anything(), action);
    expect(m.authPost).not.toHaveBeenCalled();
  });

  it("does not ask for one on other endpoints", async () => {
    await POST(post("/sign-out", {}));
    await POST(post("/two-factor/verify-totp", { code: "123456" }));
    expect(m.proof).not.toHaveBeenCalled();
  });
});

describe("disposable addresses", () => {
  it("cannot sign up", async () => {
    const res = await POST(post("/sign-up/email", { email: "someone@mailinator.com", password: "x", name: "Ada" }));
    expect(res.status).toBe(400);
    expect(m.authPost).not.toHaveBeenCalled();
  });

  it("can still sign in (an existing account stays reachable)", async () => {
    const res = await POST(post("/sign-in/email", { email: "someone@mailinator.com", password: "x" }));
    expect(res.status).toBe(200);
  });
});

describe("body size", () => {
  it("refuses a body that is not a form", async () => {
    const res = await POST(
      new NextRequest("http://localhost/api/auth/sign-in/email", {
        method: "POST",
        body: "x",
        headers: { "content-length": String(1024 * 1024), "x-forwarded-for": "203.0.113.9" },
      }),
    );
    expect(res.status).toBe(413);
    expect(m.authPost).not.toHaveBeenCalled();
  });
});
