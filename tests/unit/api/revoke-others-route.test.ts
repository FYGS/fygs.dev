import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({ getSession: vi.fn(), revoke: vi.fn() }));

vi.mock("@/lib/redis", () => ({
  default: {
    eval: () => Promise.reject(new Error("redis unavailable")),
    setNxEx: () => Promise.reject(new Error("redis unavailable")),
  },
}));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-forwarded-for": "203.0.113.20" }) }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: m.getSession, revokeOtherSessions: m.revoke } } }));

import { POST } from "@/app/api/auth/sessions/revoke-others/route";
import { __resetRateLimitMemory } from "@/lib/rate-limit";

const request = (headers: Record<string, string> = {}) =>
  new NextRequest("http://localhost/api/auth/sessions/revoke-others", { method: "POST", headers: { host: "localhost", ...headers } });

beforeEach(() => {
  __resetRateLimitMemory();
  vi.clearAllMocks();
  m.getSession.mockResolvedValue({ user: { id: "u1" } });
  m.revoke.mockResolvedValue({ status: true });
});

describe("POST /api/auth/sessions/revoke-others", () => {
  it("refuses a request that comes from another site, before touching the session", async () => {
    const response = await POST(request({ origin: "https://evil.example" }));
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "cross_origin_request" });
    expect(m.revoke).not.toHaveBeenCalled();
  });

  it("refuses a request that says it is cross-site through Fetch Metadata", async () => {
    const response = await POST(request({ "sec-fetch-site": "cross-site" }));
    expect(response.status).toBe(403);
    expect(m.revoke).not.toHaveBeenCalled();
  });

  it("asks a visitor to sign in", async () => {
    m.getSession.mockResolvedValue(null);
    const response = await POST(request({ origin: "http://localhost" }));
    expect(response.status).toBe(401);
    expect(m.revoke).not.toHaveBeenCalled();
  });

  it("ends the other sessions of a person who asks from this site", async () => {
    const response = await POST(request({ origin: "http://localhost" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(m.revoke).toHaveBeenCalledTimes(1);
  });
});
