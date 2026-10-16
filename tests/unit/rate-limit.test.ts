import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const redisMock = vi.hoisted(() => ({
  store: new Map<string, number>(),
  evalFn: vi.fn(),
  setNxEx: vi.fn(),
}));

vi.mock("@/lib/redis", () => ({
  default: { eval: redisMock.evalFn, setNxEx: redisMock.setNxEx },
}));

import {
  rateLimit,
  getClientIp,
  enforceRateLimit,
  ensureIdempotent,
  rateLimitHeaders,
  __resetRateLimitMemory,
  getRateLimitStatus,
} from "@/lib/rate-limit";

/** Behaves like the Lua script: INCR current, GET previous. */
function fakeRedisEval(_script: string, _n: number, current: string, previous: string) {
  const value = (redisMock.store.get(current) ?? 0) + 1;
  redisMock.store.set(current, value);
  return Promise.resolve([value, redisMock.store.get(previous) ?? 0]);
}

beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2025-01-01T00:00:10Z") }); // 10s into a minute
  redisMock.store.clear();
  redisMock.evalFn.mockReset();
  redisMock.evalFn.mockImplementation(fakeRedisEval);
  redisMock.setNxEx.mockReset();
  __resetRateLimitMemory();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
});

describe("rateLimit (Redis available)", () => {
  it("allows up to the limit then refuses", async () => {
    const results = [];
    for (let i = 0; i < 4; i++) results.push(await rateLimit("k", 3, 60));
    expect(results.map((r) => r.allowed)).toEqual([true, true, true, false]);
    expect(results[0]).toMatchObject({ limit: 3, remaining: 2, degraded: false, retryAfter: 0 });
    expect(results[3]).toMatchObject({ remaining: 0 });
    expect(results[3].retryAfter).toBeGreaterThanOrEqual(1);
  });

  it("uses one atomic Lua call with a TTL covering two windows", async () => {
    await rateLimit("k", 3, 60);
    expect(redisMock.evalFn).toHaveBeenCalledTimes(1);
    const args = redisMock.evalFn.mock.calls[0];
    expect(args[0]).toContain("INCR");
    expect(args[0]).toContain("EXPIRE");
    expect(args[1]).toBe(2);
    expect(args[4]).toBe(120);
  });

  it("keeps separate budgets per key", async () => {
    await rateLimit("a", 1, 60);
    expect((await rateLimit("a", 1, 60)).allowed).toBe(false);
    expect((await rateLimit("b", 1, 60)).allowed).toBe(true);
  });

  it("weights the previous window so the budget cannot be doubled at the boundary", async () => {
    // 9 requests late in a window...
    vi.setSystemTime(new Date("2025-01-01T00:00:55Z"));
    for (let i = 0; i < 9; i++) await rateLimit("k", 10, 60);
    // ...then 5s into the next window the previous one still counts ~92%
    vi.setSystemTime(new Date("2025-01-01T00:01:05Z"));
    const a = await rateLimit("k", 10, 60);
    const b = await rateLimit("k", 10, 60);
    expect(a.allowed).toBe(true);
    expect(b.allowed).toBe(false);
  });

  it("forgets the past once the previous window no longer overlaps", async () => {
    for (let i = 0; i < 3; i++) await rateLimit("k", 3, 60);
    vi.setSystemTime(new Date("2025-01-01T00:03:00Z"));
    expect((await rateLimit("k", 3, 60)).allowed).toBe(true);
  });

  it("reports when the window ends", async () => {
    const result = await rateLimit("k", 1, 60);
    expect(result.reset).toBe(Math.ceil(new Date("2025-01-01T00:01:00Z").getTime() / 1000));
  });
});

describe("rateLimit (Redis unavailable)", () => {
  beforeEach(() => {
    redisMock.evalFn.mockRejectedValue(new Error("ECONNREFUSED"));
  });

  it("does NOT fail open: the in-process limiter still enforces the limit", async () => {
    const results = [];
    for (let i = 0; i < 4; i++) results.push(await rateLimit("k", 3, 60));
    expect(results.map((r) => r.allowed)).toEqual([true, true, true, false]);
    expect(results.every((r) => r.degraded)).toBe(true);
  });

  it("failMode 'closed' refuses outright", async () => {
    const result = await rateLimit("k", 100, 60, { failMode: "closed" });
    expect(result).toMatchObject({ allowed: false, degraded: true });
    expect(result.retryAfter).toBeGreaterThanOrEqual(1);
  });

  it("falls back when Redis hangs instead of holding the request", async () => {
    redisMock.evalFn.mockImplementation(() => new Promise(() => {}));
    const pending = rateLimit("k", 3, 60);
    await vi.advanceTimersByTimeAsync(600);
    expect(await pending).toMatchObject({ allowed: true, degraded: true });
  });

  it("falls back on an unexpected reply", async () => {
    redisMock.evalFn.mockResolvedValue("garbage");
    expect(await rateLimit("k", 3, 60)).toMatchObject({ allowed: true, degraded: true });
  });

  it("logs the outage at most once a minute", async () => {
    for (let i = 0; i < 5; i++) await rateLimit(`k${i}`, 3, 60);
    expect(console.error).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(61_000);
    await rateLimit("again", 3, 60);
    expect(console.error).toHaveBeenCalledTimes(2);
  });

  it("stays bounded when flooded with distinct keys", async () => {
    for (let i = 0; i < 12_000; i++) await rateLimit(`flood-${i}`, 5, 60);
    // Still answering, and still limiting a repeated key
    for (let i = 0; i < 6; i++) await rateLimit("same", 5, 60);
    expect((await rateLimit("same", 5, 60)).allowed).toBe(false);
  });
});

describe("circuit breaker", () => {
  it("stops waiting on Redis for 10 seconds after a failure", async () => {
    redisMock.evalFn.mockRejectedValue(new Error("ECONNREFUSED"));
    for (let i = 0; i < 5; i++) await rateLimit(`k${i}`, 3, 60);
    expect(redisMock.evalFn).toHaveBeenCalledTimes(1);
  });

  it("keeps enforcing limits while the breaker is open", async () => {
    redisMock.evalFn.mockRejectedValue(new Error("ECONNREFUSED"));
    const results = [];
    for (let i = 0; i < 4; i++) results.push(await rateLimit("same", 3, 60));
    expect(results.map((r) => r.allowed)).toEqual([true, true, true, false]);
  });

  it("failMode 'closed' also refuses without calling Redis while open", async () => {
    redisMock.evalFn.mockRejectedValue(new Error("down"));
    await rateLimit("a", 3, 60);
    const result = await rateLimit("b", 3, 60, { failMode: "closed" });
    expect(result).toMatchObject({ allowed: false, degraded: true });
    expect(redisMock.evalFn).toHaveBeenCalledTimes(1);
  });

  it("tries Redis again after the pause and recovers", async () => {
    redisMock.evalFn.mockRejectedValueOnce(new Error("blip"));
    expect((await rateLimit("k", 3, 60)).degraded).toBe(true);
    vi.advanceTimersByTime(11_000);
    const back = await rateLimit("k2", 3, 60);
    expect(back.degraded).toBe(false);
    expect(redisMock.evalFn).toHaveBeenCalledTimes(2);
  });

  it("applies to idempotency checks too", async () => {
    redisMock.setNxEx.mockRejectedValue(new Error("down"));
    await ensureIdempotent("a");
    await ensureIdempotent("b");
    expect(redisMock.setNxEx).toHaveBeenCalledTimes(1);
  });
});

describe("getClientIp", () => {
  const h = (init: Record<string, string>) => new Headers(init);

  it("takes the address the proxy appended, not what the client sent", () => {
    expect(getClientIp(h({ "x-forwarded-for": "6.6.6.6, 203.0.113.9" }), 1)).toBe("203.0.113.9");
  });

  it("cannot be steered by a spoofed leftmost entry", () => {
    const real = getClientIp(h({ "x-forwarded-for": "203.0.113.9" }), 1);
    const spoofed = getClientIp(h({ "x-forwarded-for": "1.1.1.1, 2.2.2.2, 203.0.113.9" }), 1);
    expect(spoofed).toBe(real);
  });

  it("honours several trusted proxies", () => {
    expect(getClientIp(h({ "x-forwarded-for": "9.9.9.9, 203.0.113.9, 10.0.0.2" }), 2)).toBe("203.0.113.9");
  });

  it("falls back to x-real-ip", () => {
    expect(getClientIp(h({ "x-real-ip": "198.51.100.4" }), 1)).toBe("198.51.100.4");
  });

  it("understands IPv6", () => {
    expect(getClientIp(h({ "x-forwarded-for": "2001:db8::1" }), 1)).toBe("2001:db8::1");
  });

  it("returns 'unknown' for junk or missing headers and when no proxy is trusted", () => {
    expect(getClientIp(h({ "x-forwarded-for": "<script>" }), 1)).toBe("unknown");
    expect(getClientIp(h({}), 1)).toBe("unknown");
    expect(getClientIp(h({ "x-forwarded-for": "203.0.113.9" }), 0)).toBe("unknown");
  });

  it("reads TRUSTED_PROXY_HOPS from the environment", () => {
    vi.stubEnv("TRUSTED_PROXY_HOPS", "2");
    expect(getClientIp(h({ "x-forwarded-for": "9.9.9.9, 203.0.113.9, 10.0.0.2" }))).toBe("203.0.113.9");
    vi.unstubAllEnvs();
  });
});

describe("enforceRateLimit", () => {
  const request = () =>
    new Request("http://localhost/api/x", { headers: { "x-forwarded-for": "203.0.113.9" } });

  it("returns null while within the limit", async () => {
    expect(await enforceRateLimit(request(), "contact", { limit: 2, windowSeconds: 60 })).toBeNull();
  });

  it("returns a 429 with Retry-After and rate-limit headers when over", async () => {
    await enforceRateLimit(request(), "contact", { limit: 1, windowSeconds: 60 });
    const response = await enforceRateLimit(request(), "contact", { limit: 1, windowSeconds: 60 });
    expect(response?.status).toBe(429);
    expect(Number(response?.headers.get("Retry-After"))).toBeGreaterThanOrEqual(1);
    expect(response?.headers.get("X-RateLimit-Limit")).toBe("1");
    expect(response?.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(await response?.json()).toMatchObject({ error: "Too many requests" });
  });

  it("limits per subject: two users behind one IP do not share a budget", async () => {
    const opts = { limit: 1, windowSeconds: 60 };
    await enforceRateLimit(request(), "quiz", { ...opts, subject: "user:a" });
    expect(await enforceRateLimit(request(), "quiz", { ...opts, subject: "user:a" })).not.toBeNull();
    expect(await enforceRateLimit(request(), "quiz", { ...opts, subject: "user:b" })).toBeNull();
  });

  it("limits per route name", async () => {
    await enforceRateLimit(request(), "a", { limit: 1, windowSeconds: 60 });
    expect(await enforceRateLimit(request(), "b", { limit: 1, windowSeconds: 60 })).toBeNull();
  });

  it("accepts bare Headers (server actions)", async () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.9" });
    expect(await enforceRateLimit(headers, "like", { limit: 1, windowSeconds: 60 })).toBeNull();
    expect(await enforceRateLimit(headers, "like", { limit: 1, windowSeconds: 60 })).not.toBeNull();
  });

  it("rateLimitHeaders omits Retry-After when allowed", () => {
    const h = rateLimitHeaders({ allowed: true, limit: 5, remaining: 4, reset: 1, retryAfter: 0, degraded: false });
    expect(h["Retry-After"]).toBeUndefined();
  });
});

describe("ensureIdempotent", () => {
  it("is true for the first caller and false for the next", async () => {
    redisMock.setNxEx.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    expect(await ensureIdempotent("evt_1", 120)).toBe(true);
    expect(await ensureIdempotent("evt_1", 120)).toBe(false);
    expect(redisMock.setNxEx).toHaveBeenCalledWith("idem:evt_1", "1", 120);
  });

  it("lets the work run when Redis is down (callers must be safe to repeat)", async () => {
    redisMock.setNxEx.mockRejectedValue(new Error("down"));
    expect(await ensureIdempotent("evt_2")).toBe(true);
  });
});

describe("degraded-mode alerting", () => {
  const events = (spy: { mock: { calls: unknown[][] } }) =>
    spy.mock.calls.map((c) => (c[1] as { message: string } | undefined)?.message);

  it("starts with an unknown, non-degraded status", () => {
    expect(getRateLimitStatus()).toEqual({
      mode: "unknown",
      degraded: false,
      degradedSince: null,
      degradedTransitions: 0,
      fallbackDecisions: 0,
    });
  });

  it("reports redis mode after a successful check", async () => {
    await rateLimit("k", 3, 60);
    expect(getRateLimitStatus()).toMatchObject({ mode: "redis", degraded: false });
  });

  it("logs rate_limit.degraded once at error level when the breaker opens, with no error text", async () => {
    redisMock.evalFn.mockRejectedValue(new Error("connect ECONNREFUSED 10.0.0.5:6379"));
    for (let i = 0; i < 20; i++) await rateLimit(`k${i}`, 3, 60);
    const spy = console.error as unknown as { mock: { calls: unknown[][] } };
    expect(events(spy)).toEqual(["rate_limit.degraded"]);
    const ctx = spy.mock.calls[0][1] as { context?: unknown; eventType?: string; metadata: Record<string, unknown> };
    expect(ctx.eventType).toBe("rate_limit.degraded");
    expect(JSON.stringify(spy.mock.calls[0])).not.toContain("10.0.0.5");
    expect(ctx.metadata.reason).toBe("Error");
    expect(getRateLimitStatus()).toMatchObject({
      mode: "memory-fallback",
      degraded: true,
      degradedTransitions: 1,
      degradedSince: "2025-01-01T00:00:10.000Z",
    });
    // the first call hit Redis and failed; the other 19 were served by the open breaker
    expect(getRateLimitStatus().fallbackDecisions).toBe(20);
  });

  it("repeats a reminder at most once a minute while the outage lasts", async () => {
    redisMock.evalFn.mockRejectedValue(new Error("down"));
    await rateLimit("a", 3, 60);
    for (let i = 0; i < 6; i++) {
      vi.advanceTimersByTime(11_000); // breaker closes, Redis tried (and fails) again
      await rateLimit(`b${i}`, 3, 60);
    }
    const spy = console.error as unknown as { mock: { calls: unknown[][] } };
    // 66 s elapsed: the first line plus one reminder, not seven
    expect(events(spy)).toHaveLength(2);
    expect((spy.mock.calls[1][1] as { metadata: { ongoing: boolean } }).metadata.ongoing).toBe(true);
    expect(getRateLimitStatus().degradedTransitions).toBe(1);
  });

  it("logs rate_limit.recovered when Redis comes back and clears the degraded flag", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    redisMock.evalFn.mockRejectedValueOnce(new Error("blip"));
    await rateLimit("k", 3, 60);
    vi.advanceTimersByTime(30_000);
    await rateLimit("k2", 3, 60);
    expect(events(info)).toEqual(["rate_limit.recovered"]);
    const ctx = info.mock.calls[0][1] as { duration: number };
    expect(ctx.duration).toBe(30_000);
    expect(getRateLimitStatus()).toMatchObject({ mode: "redis", degraded: false, degradedSince: null, degradedTransitions: 1 });
    info.mockRestore();
  });

  it("counts a new transition when Redis fails again after recovering", async () => {
    redisMock.evalFn.mockRejectedValueOnce(new Error("one"));
    await rateLimit("a", 3, 60);
    vi.advanceTimersByTime(11_000);
    await rateLimit("b", 3, 60); // recovers
    redisMock.evalFn.mockRejectedValueOnce(new Error("two"));
    vi.advanceTimersByTime(11_000);
    await rateLimit("c", 3, 60);
    expect(getRateLimitStatus()).toMatchObject({ degraded: true, degradedTransitions: 2 });
  });

  it("idempotency checks also drive the status", async () => {
    redisMock.setNxEx.mockRejectedValueOnce(new Error("down"));
    await ensureIdempotent("x");
    expect(getRateLimitStatus().degraded).toBe(true);
    vi.advanceTimersByTime(11_000);
    redisMock.setNxEx.mockResolvedValueOnce(true);
    await ensureIdempotent("y");
    expect(getRateLimitStatus().degraded).toBe(false);
  });
});
