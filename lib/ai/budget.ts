import redis from "@/lib/redis";

/**
 * Daily budget for the AI tutor, so a bug, a bot or a viral day cannot turn into an unbounded model bill, and so that
 * no single account or address can use up what everyone else shares.
 *
 * A request is RESERVED before the model is called, atomically (one Redis script, or one synchronous block in the
 * in-process fallback): it must fit in the global budget (requests, input tokens, output tokens) AND in the share of
 * its subject (a signed-in account, a visitor address, or "unknown address"). The output reserved is the worst case
 * (`max_tokens`); when the answer ends the difference is given back (`settleModelRequest`). A refusal means
 * "answer from the local offline analyzer instead" (see app/api/ai/assistant/route.ts).
 *
 * When the shared store (Redis) cannot be reached the budget FAILS CLOSED in production: the request is refused, so the
 * tutor falls back to the offline analyzer instead of spending without a counter. In development and tests an
 * in-process counter is used so the feature works without Redis.
 *
 * Environment (0 disables the corresponding cap):
 *   AI_DAILY_REQUEST_BUDGET        model requests per UTC day, all users          (default 2000)
 *   AI_DAILY_INPUT_TOKEN_BUDGET    input tokens per UTC day, all users, estimated (default 8000000)
 *   AI_DAILY_OUTPUT_TOKEN_BUDGET   output tokens per UTC day, all users           (default 1500000)
 *   AI_USER_SHARE                  share of every global cap one account may use  (default 0.05)
 *   AI_GUEST_SHARE                 share of every global cap one visitor address may use (default 0.01)
 *   AI_USER_DAILY_REQUESTS         per signed-in user per rolling 24 h (rate limit, see the route) (default 150)
 *   AI_GUEST_DAILY_REQUESTS        per visitor IP per rolling 24 h (rate limit, see the route)     (default 20)
 */

export interface AiBudgetConfig {
  dailyRequests: number;
  dailyInputTokens: number;
  dailyOutputTokens: number;
  userShare: number;
  guestShare: number;
  userDailyRequests: number;
  guestDailyRequests: number;
}

export const AI_BUDGET_DEFAULTS: AiBudgetConfig = {
  dailyRequests: 2_000,
  dailyInputTokens: 8_000_000,
  dailyOutputTokens: 1_500_000,
  userShare: 0.05,
  guestShare: 0.01,
  userDailyRequests: 150,
  guestDailyRequests: 20,
};

function readInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  // A typo must not silently remove the cap: invalid values keep the default
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

function readShare(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 && n <= 1 ? n : fallback;
}

export function getBudgetConfig(env: NodeJS.ProcessEnv = process.env): AiBudgetConfig {
  return {
    dailyRequests: readInt(env.AI_DAILY_REQUEST_BUDGET, AI_BUDGET_DEFAULTS.dailyRequests),
    dailyInputTokens: readInt(env.AI_DAILY_INPUT_TOKEN_BUDGET, AI_BUDGET_DEFAULTS.dailyInputTokens),
    dailyOutputTokens: readInt(env.AI_DAILY_OUTPUT_TOKEN_BUDGET, AI_BUDGET_DEFAULTS.dailyOutputTokens),
    userShare: readShare(env.AI_USER_SHARE, AI_BUDGET_DEFAULTS.userShare),
    guestShare: readShare(env.AI_GUEST_SHARE, AI_BUDGET_DEFAULTS.guestShare),
    userDailyRequests: readInt(env.AI_USER_DAILY_REQUESTS, AI_BUDGET_DEFAULTS.userDailyRequests),
    guestDailyRequests: readInt(env.AI_GUEST_DAILY_REQUESTS, AI_BUDGET_DEFAULTS.guestDailyRequests),
  };
}

/** Characters per token used to estimate input (code and French text average a little over 3). */
const CHARS_PER_TOKEN = 3;

/** Rough token count of a text, rounded up: an estimate, used for the budget only. */
export function estimateTokens(chars: number): number {
  return Math.ceil(Math.max(0, chars) / CHARS_PER_TOKEN);
}

export type BudgetSubject =
  | { kind: "user"; id: string }
  | { kind: "guest"; id: string }
  /** The address could not be determined (no trusted proxy header): all such visitors share one small bucket. */
  | { kind: "unknown" };

/** How much of each global cap a subject may use. An unknown address gets a tenth of an ordinary visitor's share. */
function subjectShare(subject: BudgetSubject, config: AiBudgetConfig): number {
  if (subject.kind === "user") return config.userShare;
  if (subject.kind === "guest") return config.guestShare;
  return config.guestShare / 10;
}

function subjectKey(subject: BudgetSubject): string {
  return subject.kind === "unknown" ? "guest:unknown" : `${subject.kind}:${subject.id}`;
}

const REDIS_TIMEOUT_MS = 500;
const REDIS_RETRY_AFTER_MS = 10_000;
const KEY_TTL_SECONDS = 2 * 24 * 3600;

type Counter = "requests" | "input" | "output";
const COUNTERS: Counter[] = ["requests", "input", "output"];

/**
 * KEYS: global requests, input, output, then subject requests, input, output.
 * ARGV: limit x6 (0 = no cap), then request cost (1), input cost, output cost, ttl.
 * Checks every cap first, then increments everything: all or nothing.
 */
const RESERVE_SCRIPT = `
local cost = { tonumber(ARGV[7]), tonumber(ARGV[8]), tonumber(ARGV[9]) }
local names = { 'requests', 'input_tokens', 'output_tokens' }
for i = 1, 6 do
  local limit = tonumber(ARGV[i])
  if limit > 0 then
    local c = cost[((i - 1) % 3) + 1]
    local used = tonumber(redis.call('GET', KEYS[i]) or '0')
    if used + c > limit then
      local scope = 'global'
      if i > 3 then scope = 'subject' end
      return { 0, scope, names[((i - 1) % 3) + 1] }
    end
  end
end
for i = 1, 6 do
  local c = cost[((i - 1) % 3) + 1]
  local v = redis.call('INCRBY', KEYS[i], c)
  if v == c then redis.call('EXPIRE', KEYS[i], ARGV[10]) end
end
return { 1, '', '' }
`;

/** KEYS: the counter keys to correct; ARGV: one signed delta per key. Never goes below zero. */
const ADJUST_SCRIPT = `
for i = 1, #KEYS do
  local d = tonumber(ARGV[i])
  if d ~= 0 then
    local v = redis.call('INCRBY', KEYS[i], d)
    if v < 0 then redis.call('SET', KEYS[i], 0, 'KEEPTTL') end
  end
end
return 1
`;

const memory = new Map<string, number>();
let redisDownUntilMs = 0;
let lastExhaustedLogMs = 0;

/** True at most once a minute: lets callers log "budget exhausted" without flooding. */
export function shouldLogExhaustion(nowMs: number = Date.now()): boolean {
  if (lastExhaustedLogMs && nowMs - lastExhaustedLogMs < 60_000) return false;
  lastExhaustedLogMs = nowMs;
  return true;
}

/** Test helper. */
export function __resetAiBudget() {
  memory.clear();
  redisDownUntilMs = 0;
  lastExhaustedLogMs = 0;
}

const day = (nowMs: number) => new Date(nowMs).toISOString().slice(0, 10);
const globalKey = (counter: Counter, nowMs: number) => `ai:budget:${day(nowMs)}:${counter}`;
const scopedKey = (subject: BudgetSubject, counter: Counter, nowMs: number) =>
  `ai:budget:${day(nowMs)}:${subjectKey(subject)}:${counter}`;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Redis timeout")), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

/** Production fails closed; development and tests count in the process so the tutor works without Redis. */
function memoryFallbackAllowed(): boolean {
  return process.env.NODE_ENV !== "production";
}

function pruneMemory(nowMs: number) {
  const today = day(nowMs);
  for (const key of memory.keys()) {
    if (!key.startsWith(`ai:budget:${today}:`)) memory.delete(key);
  }
}

export type BudgetDenial = "requests" | "input_tokens" | "output_tokens" | "store_unavailable";
export type BudgetScope = "global" | "subject";

export interface Reservation {
  allowed: true;
  /** Which store answered: "memory" is the per-process fallback. */
  store: "redis" | "memory";
  /** Convenience for callers that only care whether the shared store was bypassed. */
  degraded: boolean;
  /** What to give back or add when the answer ends (see `settleModelRequest`). */
  readonly receipt: {
    keys: string[];
    reservedOutput: number;
    store: "redis" | "memory";
  };
}

export type BudgetDecision =
  | Reservation
  | { allowed: false; reason: BudgetDenial; scope: BudgetScope; degraded: boolean };

export interface ReserveInput {
  subject: BudgetSubject;
  /** Estimated input tokens of this request (see `estimateTokens`). */
  inputTokens: number;
  /** Worst case for the answer: the `max_tokens` the model is called with. */
  maxOutputTokens: number;
}

function limits(config: AiBudgetConfig, subject: BudgetSubject): number[] {
  const share = subjectShare(subject, config);
  const part = (total: number) => (total > 0 ? Math.max(1, Math.floor(total * share)) : 0);
  return [
    config.dailyRequests,
    config.dailyInputTokens,
    config.dailyOutputTokens,
    part(config.dailyRequests),
    part(config.dailyInputTokens),
    part(config.dailyOutputTokens),
  ];
}

/**
 * Claim one model request against today's budget and the subject's share. Call it right before the upstream call; a
 * refusal means "answer offline instead".
 */
export async function reserveModelRequest(
  config: AiBudgetConfig,
  input: ReserveInput,
  nowMs: number = Date.now(),
): Promise<BudgetDecision> {
  const cost = [1, Math.max(0, Math.ceil(input.inputTokens)), Math.max(0, Math.ceil(input.maxOutputTokens))];
  const caps = limits(config, input.subject);
  const keys = [
    ...COUNTERS.map((c) => globalKey(c, nowMs)),
    ...COUNTERS.map((c) => scopedKey(input.subject, c, nowMs)),
  ];
  const receiptBase = { keys, reservedOutput: cost[2] };

  if (nowMs >= redisDownUntilMs) {
    try {
      const raw = await withTimeout(
        redis.eval(RESERVE_SCRIPT, keys.length, ...keys, ...caps, ...cost, KEY_TTL_SECONDS) as Promise<unknown>,
        REDIS_TIMEOUT_MS,
      );
      if (!Array.isArray(raw)) throw new Error("Unexpected reply");
      const [ok, scope, counter] = raw as [number, string, string];
      if (Number(ok) === 1) return { allowed: true, store: "redis", degraded: false, receipt: { ...receiptBase, store: "redis" } };
      return {
        allowed: false,
        reason: (counter as BudgetDenial) || "requests",
        scope: scope === "subject" ? "subject" : "global",
        degraded: false,
      };
    } catch {
      redisDownUntilMs = nowMs + REDIS_RETRY_AFTER_MS;
    }
  }

  // The shared store is unavailable
  if (!memoryFallbackAllowed()) {
    return { allowed: false, reason: "store_unavailable", scope: "global", degraded: true };
  }
  pruneMemory(nowMs);
  for (let i = 0; i < keys.length; i++) {
    const cap = caps[i];
    if (cap > 0 && (memory.get(keys[i]) ?? 0) + cost[i % 3] > cap) {
      return {
        allowed: false,
        reason: (["requests", "input_tokens", "output_tokens"] as const)[i % 3],
        scope: i > 2 ? "subject" : "global",
        degraded: true,
      };
    }
  }
  keys.forEach((key, i) => memory.set(key, (memory.get(key) ?? 0) + cost[i % 3]));
  return { allowed: true, store: "memory", degraded: true, receipt: { ...receiptBase, store: "memory" } };
}

/**
 * Give back the output tokens that were reserved but not produced (or add the excess). Best effort: never throws,
 * accounting must never break an answer.
 */
export async function settleModelRequest(reservation: Reservation, actualOutputTokens: number): Promise<void> {
  const produced = Math.max(0, Math.floor(Number.isFinite(actualOutputTokens) ? actualOutputTokens : 0));
  const delta = produced - reservation.receipt.reservedOutput;
  if (delta === 0) return;
  const outputKeys = reservation.receipt.keys.filter((key) => key.endsWith(":output"));
  try {
    if (reservation.receipt.store === "redis") {
      await withTimeout(
        redis.eval(ADJUST_SCRIPT, outputKeys.length, ...outputKeys, ...outputKeys.map(() => delta)) as Promise<unknown>,
        REDIS_TIMEOUT_MS,
      );
    } else {
      for (const key of outputKeys) memory.set(key, Math.max(0, (memory.get(key) ?? 0) + delta));
    }
  } catch {
    /* accounting must never break an answer */
  }
}

/** Counters for today, for logs and diagnostics. */
export async function getBudgetUsage(nowMs: number = Date.now()) {
  const keys = COUNTERS.map((c) => globalKey(c, nowMs));
  if (nowMs >= redisDownUntilMs) {
    try {
      const values = await Promise.all(keys.map((key) => withTimeout(redis.get(key), REDIS_TIMEOUT_MS)));
      const [requests, inputTokens, outputTokens] = values.map((raw) => (raw ? Number(raw) || 0 : 0));
      return { requests, inputTokens, outputTokens, degraded: false };
    } catch {
      redisDownUntilMs = nowMs + REDIS_RETRY_AFTER_MS;
    }
  }
  const [requests, inputTokens, outputTokens] = keys.map((key) => memory.get(key) ?? 0);
  return { requests, inputTokens, outputTokens, degraded: true };
}
