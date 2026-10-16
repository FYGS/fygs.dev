import { describe, it, expect, vi, beforeEach } from "vitest";

const redisMock = vi.hoisted(() => ({ evalFn: vi.fn(), setNxEx: vi.fn() }));
vi.mock("@/lib/redis", () => ({ default: { eval: redisMock.evalFn, setNxEx: redisMock.setNxEx } }));

import { GET, HEAD } from "@/app/api/health/route";
import { rateLimit, __resetRateLimitMemory } from "@/lib/rate-limit";

beforeEach(() => {
  __resetRateLimitMemory();
  redisMock.evalFn.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
});

describe("GET /api/health", () => {
  it("is ok and does not call Redis itself", async () => {
    const res = GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.json()).toEqual({
      status: "ok",
      rateLimiter: { mode: "unknown", degraded: false, degradedSince: null, degradedTransitions: 0, fallbackDecisions: 0 },
    });
    expect(redisMock.evalFn).not.toHaveBeenCalled();
  });

  it("reports degraded with counters, still 200, and leaks no error detail", async () => {
    redisMock.evalFn.mockRejectedValue(new Error("connect ECONNREFUSED redis.internal:6379 password=hunter2"));
    await rateLimit("k", 3, 60);
    const res = GET();
    expect(res.status).toBe(200);
    const text = JSON.stringify(await res.json());
    expect(text).toContain('"status":"degraded"');
    expect(text).toContain('"mode":"memory-fallback"');
    expect(text).toContain('"degradedTransitions":1');
    expect(text).not.toMatch(/redis\.internal|hunter2|ECONNREFUSED/);
  });

  it("answers HEAD", () => {
    expect(HEAD().status).toBe(200);
  });
});
