import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const redisMock = vi.hoisted(() => ({
  evalFn: vi.fn(),
  getFn: vi.fn(),
}));
vi.mock("@/lib/redis", () => ({ default: { eval: redisMock.evalFn, get: redisMock.getFn } }));

import {
  AI_BUDGET_DEFAULTS,
  __resetAiBudget,
  estimateTokens,
  getBudgetConfig,
  getBudgetUsage,
  reserveModelRequest,
  settleModelRequest,
  type AiBudgetConfig,
  type BudgetSubject,
} from "@/lib/ai/budget";

const cfg: AiBudgetConfig = {
  dailyRequests: 100,
  dailyInputTokens: 100_000,
  dailyOutputTokens: 10_000,
  userShare: 0.05,
  guestShare: 0.01,
  userDailyRequests: 0,
  guestDailyRequests: 0,
};
const user = (id: string): BudgetSubject => ({ kind: "user", id });
const guest = (id: string): BudgetSubject => ({ kind: "guest", id });
const ask = (subject: BudgetSubject, inputTokens = 10, maxOutputTokens = 10, config = cfg) =>
  reserveModelRequest(config, { subject, inputTokens, maxOutputTokens });

beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2026-10-16T12:00:00Z") });
  __resetAiBudget();
  redisMock.evalFn.mockReset();
  redisMock.getFn.mockReset();
  // Redis unreachable unless a test says otherwise: the in-process counters answer (non-production)
  redisMock.evalFn.mockRejectedValue(new Error("down"));
  redisMock.getFn.mockRejectedValue(new Error("down"));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("getBudgetConfig", () => {
  it("has sane defaults", () => {
    expect(getBudgetConfig({} as NodeJS.ProcessEnv)).toEqual(AI_BUDGET_DEFAULTS);
    expect(AI_BUDGET_DEFAULTS.dailyRequests).toBeGreaterThan(0);
    expect(AI_BUDGET_DEFAULTS.dailyInputTokens).toBeGreaterThan(0);
    expect(AI_BUDGET_DEFAULTS.dailyOutputTokens).toBeGreaterThan(0);
    expect(AI_BUDGET_DEFAULTS.guestShare).toBeLessThan(AI_BUDGET_DEFAULTS.userShare);
  });

  it("reads the environment, accepts 0 to disable a cap, ignores garbage", () => {
    const env = {
      AI_DAILY_REQUEST_BUDGET: "50",
      AI_DAILY_OUTPUT_TOKEN_BUDGET: "0",
      AI_USER_DAILY_REQUESTS: "abc",
      AI_GUEST_DAILY_REQUESTS: "-4",
      AI_USER_SHARE: "2",
      AI_GUEST_SHARE: "0.5",
    } as unknown as NodeJS.ProcessEnv;
    expect(getBudgetConfig(env)).toEqual({
      ...AI_BUDGET_DEFAULTS,
      dailyRequests: 50,
      dailyOutputTokens: 0,
      guestShare: 0.5,
    });
  });
});

describe("estimateTokens", () => {
  it("rounds up and never goes negative", () => {
    expect(estimateTokens(0)).toBe(0);
    expect(estimateTokens(1)).toBe(1);
    expect(estimateTokens(10)).toBe(4);
    expect(estimateTokens(-5)).toBe(0);
  });
});

describe("reserveModelRequest (shared store)", () => {
  it("sends one atomic script with every counter key and the caps", async () => {
    redisMock.evalFn.mockResolvedValue([1, "", ""]);
    const decision = await ask(user("u1"), 30, 20);
    expect(decision).toMatchObject({ allowed: true, store: "redis", degraded: false });
    const [script, count, ...rest] = redisMock.evalFn.mock.calls[0];
    expect(script).toContain("INCRBY");
    expect(script).toContain("EXPIRE");
    expect(count).toBe(6);
    const keys = rest.slice(0, 6) as string[];
    expect(keys[0]).toBe("ai:budget:2026-10-16:requests");
    expect(keys[3]).toBe("ai:budget:2026-10-16:user:u1:requests");
    // caps: global x3 then the user's share x3
    expect(rest.slice(6, 12)).toEqual([100, 100_000, 10_000, 5, 5_000, 500]);
    // cost: 1 request, the input estimate, the worst-case output, then the TTL
    expect(rest.slice(12, 15)).toEqual([1, 30, 20]);
    expect(Number(rest[15])).toBeGreaterThanOrEqual(86_400);
  });

  it("reports which cap refused, and whether it was the global one or the subject's share", async () => {
    redisMock.evalFn.mockResolvedValueOnce([0, "subject", "output_tokens"]);
    expect(await ask(user("u1"))).toMatchObject({ allowed: false, reason: "output_tokens", scope: "subject", degraded: false });
    redisMock.evalFn.mockResolvedValueOnce([0, "global", "requests"]);
    expect(await ask(user("u1"))).toMatchObject({ allowed: false, reason: "requests", scope: "global" });
  });

  it("starts a new budget at UTC midnight (the keys carry the date)", async () => {
    redisMock.evalFn.mockResolvedValue([1, "", ""]);
    await ask(user("u1"));
    vi.setSystemTime(new Date("2026-10-17T00:00:01Z"));
    await ask(user("u1"));
    expect(redisMock.evalFn.mock.calls[0][2]).toBe("ai:budget:2026-10-16:requests");
    expect(redisMock.evalFn.mock.calls[1][2]).toBe("ai:budget:2026-10-17:requests");
  });

  it("gives the unreserved output back when the answer ends", async () => {
    redisMock.evalFn.mockResolvedValue([1, "", ""]);
    const decision = await ask(user("u1"), 10, 800);
    if (!decision.allowed) throw new Error("expected a reservation");
    redisMock.evalFn.mockClear();
    await settleModelRequest(decision, 100);
    const [script, count, ...rest] = redisMock.evalFn.mock.calls[0];
    expect(script).toContain("INCRBY");
    expect(count).toBe(2);
    expect((rest.slice(0, 2) as string[]).every((key) => key.endsWith(":output"))).toBe(true);
    expect(rest.slice(2)).toEqual([-700, -700]);
  });

  it("does nothing when the answer used exactly what was reserved, and never throws", async () => {
    redisMock.evalFn.mockResolvedValue([1, "", ""]);
    const decision = await ask(user("u1"), 10, 50);
    if (!decision.allowed) throw new Error("expected a reservation");
    redisMock.evalFn.mockClear();
    await settleModelRequest(decision, 50);
    expect(redisMock.evalFn).not.toHaveBeenCalled();
    redisMock.evalFn.mockRejectedValue(new Error("down"));
    await expect(settleModelRequest(decision, 0)).resolves.toBeUndefined();
  });
});

describe("reserveModelRequest (production, store unreachable)", () => {
  it("fails closed: no counter, no spending", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(await ask(user("u1"))).toMatchObject({ allowed: false, reason: "store_unavailable", degraded: true });
    expect(await ask(guest("1.2.3.4"))).toMatchObject({ allowed: false, reason: "store_unavailable" });
  });

  it("retries the store after a few seconds", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await ask(user("u1"));
    const calls = redisMock.evalFn.mock.calls.length;
    await ask(user("u1"));
    expect(redisMock.evalFn.mock.calls.length).toBe(calls);
    vi.advanceTimersByTime(11_000);
    redisMock.evalFn.mockResolvedValue([1, "", ""]);
    expect(await ask(user("u1"))).toMatchObject({ allowed: true, store: "redis" });
  });
});

describe("reserveModelRequest (in-process fallback outside production)", () => {
  it("enforces the global request cap", async () => {
    const small = { ...cfg, dailyRequests: 3, userShare: 1, guestShare: 1 };
    const results = [];
    for (let i = 0; i < 5; i++) results.push(await ask(user(`u${i}`), 1, 1, small));
    expect(results.map((r) => r.allowed)).toEqual([true, true, true, false, false]);
    expect(results[3]).toMatchObject({ reason: "requests", scope: "global", degraded: true });
  });

  it("enforces each subject's share so one account cannot drain the shared budget", async () => {
    // 5 % of 100 requests = 5 for a signed-in user
    const results = [];
    for (let i = 0; i < 7; i++) results.push(await ask(user("greedy"), 1, 1));
    expect(results.filter((r) => r.allowed)).toHaveLength(5);
    expect(results[5]).toMatchObject({ allowed: false, reason: "requests", scope: "subject" });
    // the others are not affected
    expect((await ask(user("other"), 1, 1)).allowed).toBe(true);
  });

  it("gives a visitor address a smaller share than an account, and an unknown address a tenth of that", async () => {
    const big = { ...cfg, dailyRequests: 1000, dailyInputTokens: 0, dailyOutputTokens: 0 };
    let guests = 0;
    while ((await ask(guest("9.9.9.9"), 1, 1, big)).allowed) guests++;
    expect(guests).toBe(10); // 1 % of 1000
    let unknown = 0;
    while ((await ask({ kind: "unknown" }, 1, 1, big)).allowed) unknown++;
    expect(unknown).toBe(1); // 0.1 % of 1000
  });

  it("counts input and output tokens against their caps", async () => {
    const tokens = { ...cfg, dailyRequests: 0, userShare: 1, guestShare: 1, dailyInputTokens: 100, dailyOutputTokens: 100 };
    expect((await ask(user("a"), 60, 10, tokens)).allowed).toBe(true);
    expect(await ask(user("a"), 60, 10, tokens)).toMatchObject({ allowed: false, reason: "input_tokens" });
    expect(await ask(user("a"), 10, 95, tokens)).toMatchObject({ allowed: false, reason: "output_tokens" });
  });

  it("is all or nothing: a refusal consumes nothing", async () => {
    const tokens = { ...cfg, dailyRequests: 10, userShare: 1, dailyInputTokens: 100, dailyOutputTokens: 0 };
    await ask(user("a"), 1000, 0, tokens);
    expect((await getBudgetUsage()).requests).toBe(0);
  });

  it("holds under concurrent reservations", async () => {
    const small = { ...cfg, dailyRequests: 20, userShare: 1, guestShare: 1 };
    const results = await Promise.all(Array.from({ length: 100 }, (_, i) => ask(user(`u${i}`), 1, 1, small)));
    expect(results.filter((r) => r.allowed)).toHaveLength(20);
  });

  it("makes room again when the answer is shorter than the worst case", async () => {
    const tokens = { ...cfg, dailyRequests: 0, userShare: 1, dailyInputTokens: 0, dailyOutputTokens: 100 };
    const first = await ask(user("a"), 1, 80, tokens);
    if (!first.allowed) throw new Error("expected a reservation");
    expect((await ask(user("a"), 1, 80, tokens)).allowed).toBe(false);
    await settleModelRequest(first, 10);
    expect((await ask(user("a"), 1, 80, tokens)).allowed).toBe(true);
  });

  it("0 disables a cap", async () => {
    const off = { ...cfg, dailyRequests: 0, dailyInputTokens: 0, dailyOutputTokens: 0 };
    for (let i = 0; i < 20; i++) expect((await ask(user("a"), 1_000_000, 1_000_000, off)).allowed).toBe(true);
  });

  it("starts a new budget at UTC midnight", async () => {
    const small = { ...cfg, dailyRequests: 1, userShare: 1 };
    expect((await ask(user("a"), 1, 1, small)).allowed).toBe(true);
    expect((await ask(user("a"), 1, 1, small)).allowed).toBe(false);
    vi.setSystemTime(new Date("2026-10-17T00:00:01Z"));
    expect((await ask(user("a"), 1, 1, small)).allowed).toBe(true);
    expect((await getBudgetUsage()).requests).toBe(1);
  });

  it("falls back on a hang without holding the request", async () => {
    redisMock.evalFn.mockImplementation(() => new Promise(() => {}));
    const pending = ask(user("a"));
    await vi.advanceTimersByTimeAsync(1200);
    expect(await pending).toMatchObject({ allowed: true, degraded: true });
  });
});
