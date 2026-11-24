import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const redisMock = vi.hoisted(() => ({ evalFn: vi.fn(), setNxEx: vi.fn() }));

vi.mock("@/lib/redis", () => ({
  default: { eval: redisMock.evalFn, setNxEx: redisMock.setNxEx },
}));

import { checkRateLimit, enforceRateLimit, __resetRateLimitMemory } from "@/lib/rate-limit";
import { __resetHotBuckets, heat, ipBucketOf } from "@/lib/anti-automation/hot-buckets";

const request = (headers: Record<string, string> = { "x-forwarded-for": "203.0.113.9" }) =>
  new Request("http://localhost/api/x", { headers });

beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2025-01-01T00:00:10Z") });
  redisMock.evalFn.mockReset();
  redisMock.evalFn.mockRejectedValue(new Error("redis is down"));
  __resetRateLimitMemory();
  __resetHotBuckets();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("failMode closed", () => {
  it("answers 503 with Retry-After (not 429) when a configured shared store is down", async () => {
    vi.stubEnv("REDIS_URL", "redis://redis.invalid:6379");
    const response = await enforceRateLimit(request(), "sign-in", { limit: 10, windowSeconds: 300, failMode: "closed" });
    expect(response?.status).toBe(503);
    expect(Number(response?.headers.get("Retry-After"))).toBeGreaterThanOrEqual(1);
    expect(response?.headers.get("Cache-Control")).toBe("no-store");
    expect(await response?.json()).toMatchObject({ error: "Service temporarily unavailable" });
  });

  it("keeps limiting in memory when no shared store is configured (single instance by design)", async () => {
    vi.stubEnv("REDIS_URL", "");
    vi.stubEnv("blog_stats_KV_REST_API_URL", "");
    const options = { limit: 2, windowSeconds: 60, failMode: "closed" as const };
    expect(await enforceRateLimit(request(), "sign-in", options)).toBeNull();
    expect(await enforceRateLimit(request(), "sign-in", options)).toBeNull();
    expect((await enforceRateLimit(request(), "sign-in", options))?.status).toBe(429);
  });

  it("keeps limiting in memory by default, and answers 429 once over the limit", async () => {
    vi.stubEnv("REDIS_URL", "redis://redis.invalid:6379");
    const options = { limit: 1, windowSeconds: 60 };
    expect(await enforceRateLimit(request(), "x", options)).toBeNull();
    expect((await enforceRateLimit(request(), "x", options))?.status).toBe(429);
  });
});

describe("the shared 'unknown' bucket", () => {
  it("gets a fifth of the budget in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const headers = {}; // no proxy header: the client cannot be told apart from anybody else
    let allowed = 0;
    for (let i = 0; i < 20; i++) {
      const result = await checkRateLimit(request(headers), "contact", { limit: 10, windowSeconds: 60 });
      if (result.allowed) allowed += 1;
    }
    expect(allowed).toBe(2);
  });

  it("keeps the full budget for a known address and outside production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    let known = 0;
    for (let i = 0; i < 20; i++) {
      if ((await checkRateLimit(request(), "contact", { limit: 10, windowSeconds: 60 })).allowed) known += 1;
    }
    expect(known).toBe(10);

    __resetRateLimitMemory();
    vi.stubEnv("NODE_ENV", "test");
    let dev = 0;
    for (let i = 0; i < 20; i++) {
      if ((await checkRateLimit(request({}), "contact", { limit: 10, windowSeconds: 60 })).allowed) dev += 1;
    }
    expect(dev).toBe(10);
  });
});

describe("a refused network gets hotter", () => {
  it("is reported to the proof-of-work difficulty, by /24", async () => {
    const options = { limit: 1, windowSeconds: 60 };
    await checkRateLimit(request(), "pw", options);
    expect(heat(ipBucketOf("203.0.113.77"))).toBe(0);
    await checkRateLimit(request(), "pw", options);
    expect(heat(ipBucketOf("203.0.113.77"))).toBe(1);
    for (let i = 0; i < 6; i++) await checkRateLimit(request(), "pw", options);
    expect(heat("203.0.113")).toBe(2);
  });
});

describe("ipBucketOf", () => {
  it("groups IPv4 by /24 and IPv6 by /64, whatever the shorthand", () => {
    expect(ipBucketOf("192.0.2.7")).toBe("192.0.2");
    expect(ipBucketOf("2001:db8:1:2:3:4:5:6")).toBe("2001:db8:1:2");
    expect(ipBucketOf("2001:db8::1")).toBe("2001:db8:0:0");
    expect(ipBucketOf("2001:0DB8:0:0:0:0:0:1")).toBe("2001:db8:0:0");
    expect(ipBucketOf("unknown")).toBe("unknown");
    expect(ipBucketOf("<script>")).toBe("unknown");
  });
});
