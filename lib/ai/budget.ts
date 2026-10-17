import redis from "@/lib/redis";

/**
 * Global daily budget for the AI tutor, so a bug, a bot or a viral day cannot
 * turn into an unbounded model bill.
 *
 * Two counters per UTC day: requests started and output tokens produced. When
 * either reaches its budget the route answers from the local offline analyzer
 * instead of the model (see app/api/ai/assistant/route.ts).
 *
 * Counters live in Redis (shared by every instance, keys expire on their own).
 * If Redis is unreachable they fall back to in-process counters: each instance
 * then enforces the full budget on its own, so the worst case is
 * budget x instances rather than "unlimited".
 *
 * Environment (0 disables the corresponding cap):
 *   AI_DAILY_REQUEST_BUDGET        model requests per UTC day, all users   (default 2000)
 *   AI_DAILY_OUTPUT_TOKEN_BUDGET   output tokens per UTC day, all users    (default 1500000)
 *   AI_USER_DAILY_REQUESTS         per signed-in user per rolling 24 h     (default 150)
 *   AI_GUEST_DAILY_REQUESTS        per visitor IP per rolling 24 h         (default 20)
 */

export interface AiBudgetConfig {
  dailyRequests: number;
  dailyOutputTokens: number;
  userDailyRequests: number;
  guestDailyRequests: number;
}

export const AI_BUDGET_DEFAULTS: AiBudgetConfig = {
  dailyRequests: 2_000,
  dailyOutputTokens: 1_500_000,
  userDailyRequests: 150,
  guestDailyRequests: 20,
};

function readInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  // A typo must not silently remove the cap: invalid values keep the default
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

export function getBudgetConfig(env: NodeJS.ProcessEnv = process.env): AiBudgetConfig {
  return {
    dailyRequests: readInt(env.AI_DAILY_REQUEST_BUDGET, AI_BUDGET_DEFAULTS.dailyRequests),
    dailyOutputTokens: readInt(env.AI_DAILY_OUTPUT_TOKEN_BUDGET, AI_BUDGET_DEFAULTS.dailyOutputTokens),
    userDailyRequests: readInt(env.AI_USER_DAILY_REQUESTS, AI_BUDGET_DEFAULTS.userDailyRequests),
    guestDailyRequests: readInt(env.AI_GUEST_DAILY_REQUESTS, AI_BUDGET_DEFAULTS.guestDailyRequests),
  };
}

const REDIS_TIMEOUT_MS = 500;
const REDIS_RETRY_AFTER_MS = 10_000;
const KEY_TTL_SECONDS = 2 * 24 * 3600;

const INCR_SCRIPT = `
local v = redis.call('INCRBY', KEYS[1], ARGV[1])
if v == tonumber(ARGV[1]) then redis.call('EXPIRE', KEYS[1], ARGV[2]) end
return v
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

function dayKey(kind: "requests" | "output", nowMs: number): string {
  return `ai:budget:${new Date(nowMs).toISOString().slice(0, 10)}:${kind}`;
}

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

/** Drop yesterday's in-process counters. */
function pruneMemory(nowMs: number) {
  const today = new Date(nowMs).toISOString().slice(0, 10);
  for (const key of memory.keys()) {
    if (!key.includes(`:${today}:`)) memory.delete(key);
  }
}

/** Add `by` to a day counter and return its new value; `degraded` tells which store answered. */
async function add(kind: "requests" | "output", by: number, nowMs: number): Promise<{ value: number; degraded: boolean }> {
  const key = dayKey(kind, nowMs);
  if (nowMs >= redisDownUntilMs) {
    try {
      const raw = await withTimeout(redis.eval(INCR_SCRIPT, 1, key, by, KEY_TTL_SECONDS), REDIS_TIMEOUT_MS);
      const value = Number(raw);
      if (!Number.isFinite(value)) throw new Error("Unexpected reply");
      return { value, degraded: false };
    } catch {
      redisDownUntilMs = nowMs + REDIS_RETRY_AFTER_MS;
    }
  }
  pruneMemory(nowMs);
  const value = (memory.get(key) ?? 0) + by;
  memory.set(key, value);
  return { value, degraded: true };
}

async function read(kind: "requests" | "output", nowMs: number): Promise<{ value: number; degraded: boolean }> {
  const key = dayKey(kind, nowMs);
  if (nowMs >= redisDownUntilMs) {
    try {
      const raw = await withTimeout(redis.get(key), REDIS_TIMEOUT_MS);
      return { value: raw ? Number(raw) || 0 : 0, degraded: false };
    } catch {
      redisDownUntilMs = nowMs + REDIS_RETRY_AFTER_MS;
    }
  }
  return { value: memory.get(key) ?? 0, degraded: true };
}

export type BudgetDecision =
  | { allowed: true; degraded: boolean }
  | { allowed: false; reason: "requests" | "output_tokens"; degraded: boolean };

/**
 * Claim one model request against today's budget. Call it right before the
 * upstream call; a refusal means "answer offline instead".
 */
export async function reserveModelRequest(
  config: AiBudgetConfig = getBudgetConfig(),
  nowMs: number = Date.now(),
): Promise<BudgetDecision> {
  if (config.dailyOutputTokens > 0) {
    const out = await read("output", nowMs);
    if (out.value >= config.dailyOutputTokens) {
      return { allowed: false, reason: "output_tokens", degraded: out.degraded };
    }
  }
  if (config.dailyRequests > 0) {
    const req = await add("requests", 1, nowMs);
    if (req.value > config.dailyRequests) {
      return { allowed: false, reason: "requests", degraded: req.degraded };
    }
    return { allowed: true, degraded: req.degraded };
  }
  return { allowed: true, degraded: false };
}

/** Account output tokens after an answer. Best effort: never throws. */
export async function recordOutputTokens(tokens: number, nowMs: number = Date.now()): Promise<void> {
  const n = Math.max(0, Math.floor(tokens));
  if (!n) return;
  try {
    await add("output", n, nowMs);
  } catch {
    /* accounting must never break an answer */
  }
}

/** Counters for today, for logs and diagnostics. */
export async function getBudgetUsage(nowMs: number = Date.now()) {
  const [requests, output] = await Promise.all([read("requests", nowMs), read("output", nowMs)]);
  return { requests: requests.value, outputTokens: output.value, degraded: requests.degraded || output.degraded };
}
