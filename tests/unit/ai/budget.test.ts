import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const redisMock = vi.hoisted(() => ({
  store: new Map<string, number>(),
  evalFn: vi.fn(),
  getFn: vi.fn(),
}));
vi.mock("@/lib/redis", () => ({ default: { eval: redisMock.evalFn, get: redisMock.getFn } }));

import {
  AI_BUDGET_DEFAULTS,
  __resetAiBudget,
  getBudgetConfig,
  getBudgetUsage,
  recordOutputTokens,
  reserveModelRequest,
} from "@/lib/ai/budget";

const cfg = { dailyRequests: 3, dailyOutputTokens: 1000, userDailyRequests: 0, guestDailyRequests: 0 };

beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2026-10-16T12:00:00Z") });
  redisMock.store.clear();
  __resetAiBudget();
  redisMock.evalFn.mockReset();
  redisMock.getFn.mockReset();
  // INCRBY script
  redisMock.evalFn.mockImplementation((_s: string, _n: number, key: string, by: number) => {
    const v = (redisMock.store.get(key) ?? 0) + Number(by);
    redisMock.store.set(key, v);
    return Promise.resolve(v);
  });
  redisMock.getFn.mockImplementation((key: string) =>
    Promise.resolve(redisMock.store.has(key) ? String(redisMock.store.get(key)) : null),
  );
});
afterEach(() => vi.useRealTimers());

describe("getBudgetConfig", () => {
  it("has sane defaults", () => {
    expect(getBudgetConfig({} as NodeJS.ProcessEnv)).toEqual(AI_BUDGET_DEFAULTS);
    expect(AI_BUDGET_DEFAULTS.dailyRequests).toBeGreaterThan(0);
    expect(AI_BUDGET_DEFAULTS.dailyOutputTokens).toBeGreaterThan(0);
  });

  it("reads the environment, accepts 0 to disable, ignores garbage", () => {
    const env = {
      AI_DAILY_REQUEST_BUDGET: "50",
      AI_DAILY_OUTPUT_TOKEN_BUDGET: "0",
      AI_USER_DAILY_REQUESTS: "abc",
      AI_GUEST_DAILY_REQUESTS: "-4",
    } as unknown as NodeJS.ProcessEnv;
    expect(getBudgetConfig(env)).toEqual({
      dailyRequests: 50,
      dailyOutputTokens: 0,
      userDailyRequests: AI_BUDGET_DEFAULTS.userDailyRequests,
      guestDailyRequests: AI_BUDGET_DEFAULTS.guestDailyRequests,
    });
  });
});

describe("reserveModelRequest (Redis)", () => {
  it("allows requests up to the budget, then refuses", async () => {
    const results = [];
    for (let i = 0; i < 5; i++) results.push(await reserveModelRequest(cfg));
    expect(results.map((r) => r.allowed)).toEqual([true, true, true, false, false]);
    expect(results[3]).toMatchObject({ reason: "requests", degraded: false });
  });

  it("refuses once the output-token budget is spent, and says why", async () => {
    await recordOutputTokens(1000);
    expect(await reserveModelRequest(cfg)).toMatchObject({ allowed: false, reason: "output_tokens" });
  });

  it("keeps serving while under the token budget", async () => {
    await recordOutputTokens(999);
    expect((await reserveModelRequest(cfg)).allowed).toBe(true);
  });

  it("starts a new budget at UTC midnight", async () => {
    for (let i = 0; i < 4; i++) await reserveModelRequest(cfg);
    await recordOutputTokens(5000);
    expect((await reserveModelRequest(cfg)).allowed).toBe(false);
    vi.setSystemTime(new Date("2026-10-17T00:00:01Z"));
    expect((await reserveModelRequest(cfg)).allowed).toBe(true);
    expect((await getBudgetUsage()).requests).toBe(1);
  });

  it("sets a TTL on the day key so counters expire by themselves", async () => {
    await reserveModelRequest(cfg);
    const args = redisMock.evalFn.mock.calls[0];
    expect(args[0]).toContain("EXPIRE");
    expect(args[2]).toBe("ai:budget:2026-10-16:requests");
    expect(Number(args[4])).toBeGreaterThanOrEqual(86_400);
  });

  it("0 disables a cap", async () => {
    const off = { ...cfg, dailyRequests: 0, dailyOutputTokens: 0 };
    await recordOutputTokens(10_000_000);
    for (let i = 0; i < 10; i++) expect((await reserveModelRequest(off)).allowed).toBe(true);
  });

  it("ignores nonsense token counts", async () => {
    await recordOutputTokens(-5);
    await recordOutputTokens(Number.NaN);
    expect((await getBudgetUsage()).outputTokens).toBe(0);
  });
});

describe("reserveModelRequest (Redis down)", () => {
  beforeEach(() => {
    redisMock.evalFn.mockRejectedValue(new Error("down"));
    redisMock.getFn.mockRejectedValue(new Error("down"));
  });

  it("falls back to in-process counters and still enforces the budget", async () => {
    const results = [];
    for (let i = 0; i < 5; i++) results.push(await reserveModelRequest(cfg));
    expect(results.map((r) => r.allowed)).toEqual([true, true, true, false, false]);
    expect(results.every((r) => r.degraded)).toBe(true);
  });

  it("falls back on a hang without holding the request", async () => {
    redisMock.evalFn.mockImplementation(() => new Promise(() => {}));
    redisMock.getFn.mockImplementation(() => new Promise(() => {}));
    const pending = reserveModelRequest(cfg);
    await vi.advanceTimersByTimeAsync(1200);
    expect(await pending).toMatchObject({ allowed: true, degraded: true });
  });

  it("counts output tokens locally too", async () => {
    await recordOutputTokens(1000);
    expect(await reserveModelRequest(cfg)).toMatchObject({ allowed: false, reason: "output_tokens", degraded: true });
  });

  it("stops calling Redis for a few seconds after a failure, then retries", async () => {
    await reserveModelRequest(cfg);
    await reserveModelRequest(cfg);
    const calls = redisMock.getFn.mock.calls.length + redisMock.evalFn.mock.calls.length;
    expect(calls).toBeLessThanOrEqual(2);
    vi.advanceTimersByTime(11_000);
    await reserveModelRequest(cfg);
    expect(redisMock.getFn.mock.calls.length + redisMock.evalFn.mock.calls.length).toBeGreaterThan(calls);
  });
});
