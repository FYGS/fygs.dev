import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({ authPost: vi.fn() }));

vi.mock("@/lib/auth", () => ({ auth: {} }));
vi.mock("better-auth/next-js", () => ({
  toNextJsHandler: () => ({
    GET: vi.fn(),
    POST: m.authPost,
  }),
}));

import { POST } from "@/app/api/auth/[...all]/route";
import { __resetRateLimitMemory } from "@/lib/rate-limit";

const post = (path: string, body: unknown, ip = "203.0.113.9") =>
  new NextRequest(`http://localhost/api/auth${path}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
  });

beforeEach(() => {
  __resetRateLimitMemory();
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  m.authPost.mockImplementation(() => Promise.resolve(Response.json({ ok: true })));
});

describe("auth route rate limits", () => {
  it("passes requests through to better-auth within the limit", async () => {
    const res = await POST(post("/sign-in/email", { email: "a@b.co", password: "x" }));
    expect(res.status).toBe(200);
    expect(m.authPost).toHaveBeenCalledTimes(1);
  });

  it("limits sign-in attempts per client: 10 per 5 minutes", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) {
      // a different e-mail each time: only the IP limit can stop this
      statuses.push((await POST(post("/sign-in/email", { email: `u${i}@b.co`, password: "x" }))).status);
    }
    expect(statuses.slice(0, 10).every((s) => s === 200)).toBe(true);
    expect(statuses[10]).toBe(429);
    expect(m.authPost).toHaveBeenCalledTimes(10);
  });

  it("limits attempts on ONE account even when they come from many IPs", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) {
      statuses.push(
        (await POST(post("/sign-in/email", { email: "Victim@Example.com", password: "x" }, `198.51.100.${i + 1}`))).status,
      );
    }
    expect(statuses.slice(0, 10).every((s) => s === 200)).toBe(true);
    expect(statuses[10]).toBe(429);
  });

  it("treats e-mail case and spaces as the same account", async () => {
    for (let i = 0; i < 10; i++) {
      await POST(post("/sign-in/email", { email: i % 2 ? " VICTIM@example.com " : "victim@example.com", password: "x" }, `198.51.100.${i + 1}`));
    }
    const res = await POST(post("/sign-in/email", { email: "victim@example.com", password: "x" }, "192.0.2.77"));
    expect(res.status).toBe(429);
  });

  it("returns Retry-After on a refusal", async () => {
    for (let i = 0; i < 5; i++) await POST(post("/sign-up/email", { email: `n${i}@b.co`, password: "x" }));
    const res = await POST(post("/sign-up/email", { email: "n6@b.co", password: "x" }));
    expect(res.status).toBe(429);
    expect(Number(res.headers.get("Retry-After"))).toBeGreaterThan(0);
  });

  it("limits password-reset requests per e-mail (no inbox flooding)", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 4; i++) {
      statuses.push((await POST(post("/request-password-reset", { email: "x@y.co" }, `198.51.100.${i + 1}`))).status);
    }
    expect(statuses).toEqual([200, 200, 200, 429]);
  });

  it("does not choke on a body that is not JSON", async () => {
    const req = new NextRequest("http://localhost/api/auth/sign-in/email", {
      method: "POST",
      body: "not json",
      headers: { "x-forwarded-for": "203.0.113.9" },
    });
    expect((await POST(req)).status).toBe(200);
  });

  it("other auth paths get a generous general limit", async () => {
    let last = 0;
    for (let i = 0; i < 121; i++) last = (await POST(post("/sign-out", {}))).status;
    expect(last).toBe(429);
  });
});
