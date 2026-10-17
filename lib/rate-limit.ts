import { NextResponse } from "next/server";
import redis from "./redis";
import { logger } from "./structured-logger";

/**
 * Rate limiting.
 *
 * - Sliding-window counter (previous window weighted by how much of it still
 *   overlaps), so a client cannot double its budget across a window boundary.
 * - One atomic Lua call to Redis per check (INCR + EXPIRE cannot be split by a
 *   crash, and there is a single round trip).
 * - Never fails open. If Redis is unreachable or slow, the check falls back to
 *   an in-process limiter (per instance, still enforced). Sensitive callers can
 *   choose failMode "closed" to refuse instead.
 */

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** Epoch seconds at which the current window ends. */
  reset: number;
  /** Seconds the caller should wait before retrying (0 when allowed). */
  retryAfter: number;
  /** True when Redis could not be used and the fallback decided. */
  degraded: boolean;
}

export interface RateLimitOptions {
  /**
   * What to do when Redis is unavailable: "memory" (default) keeps limiting in
   * this process; "closed" refuses the request.
   */
  failMode?: "memory" | "closed";
}

const REDIS_TIMEOUT_MS = 500;
// Circuit breaker: once Redis has failed, stop waiting on it for a few seconds.
// Without this every request would pay the timeout while Redis is down.
const REDIS_RETRY_AFTER_MS = 10_000;
let redisDownUntilMs = 0;

/**
 * Degraded-mode bookkeeping, exposed through getRateLimitStatus() (health
 * endpoint). Counters are per process: sum them across instances when alerting.
 */
export const RATE_LIMIT_DEGRADED_EVENT = "rate_limit.degraded";
export const RATE_LIMIT_RECOVERED_EVENT = "rate_limit.recovered";
/** While an outage lasts, repeat the error line at most this often. */
const DEGRADED_LOG_INTERVAL_MS = 60_000;
let degradedSinceMs: number | null = null;
let degradedTransitions = 0;
let fallbackDecisions = 0;
let lastRedisSuccessMs: number | null = null;
let lastRecoveredLogMs = 0;

const SLIDING_WINDOW_SCRIPT = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
local previous = tonumber(redis.call('GET', KEYS[2]) or '0')
return {current, previous}
`;

function decide(
  limit: number,
  windowSeconds: number,
  nowMs: number,
  current: number,
  previous: number,
  degraded: boolean,
): RateLimitResult {
  const windowMs = windowSeconds * 1000;
  const windowIndex = Math.floor(nowMs / windowMs);
  const elapsedFraction = (nowMs % windowMs) / windowMs;
  const estimated = previous * (1 - elapsedFraction) + current;
  const allowed = estimated <= limit;
  const windowEndMs = (windowIndex + 1) * windowMs;
  return {
    allowed,
    limit,
    remaining: Math.max(0, Math.floor(limit - estimated)),
    reset: Math.ceil(windowEndMs / 1000),
    retryAfter: allowed ? 0 : Math.max(1, Math.ceil((windowEndMs - nowMs) / 1000)),
    degraded,
  };
}

// ─── In-process fallback ─────────────────────────────────────────────────────

interface MemoryEntry {
  windowIndex: number;
  current: number;
  previous: number;
  expiresAtMs: number;
}

const MEMORY_SOFT_LIMIT = 5_000;
const MEMORY_HARD_LIMIT = 10_000;
const memory = new Map<string, MemoryEntry>();
let lastDegradedLogMs = 0;

function pruneMemory(nowMs: number) {
  if (memory.size <= MEMORY_SOFT_LIMIT) return;
  for (const [key, entry] of memory) {
    if (entry.expiresAtMs <= nowMs) memory.delete(key);
  }
  // Still too large (a flood of distinct keys): drop the oldest entries
  for (const key of memory.keys()) {
    if (memory.size <= MEMORY_HARD_LIMIT / 2) break;
    memory.delete(key);
  }
}

function memoryCheck(
  key: string,
  limit: number,
  windowSeconds: number,
  nowMs: number,
  degraded: boolean,
): RateLimitResult {
  const windowMs = windowSeconds * 1000;
  const windowIndex = Math.floor(nowMs / windowMs);
  const entry = memory.get(key);

  let current = 1;
  let previous = 0;
  if (entry) {
    if (entry.windowIndex === windowIndex) {
      current = entry.current + 1;
      previous = entry.previous;
    } else if (entry.windowIndex === windowIndex - 1) {
      previous = entry.current;
    }
  }
  memory.set(key, {
    windowIndex,
    current,
    previous,
    expiresAtMs: (windowIndex + 2) * windowMs,
  });
  pruneMemory(nowMs);
  return decide(limit, windowSeconds, nowMs, current, previous, degraded);
}

/** Test helper. */
export function __resetRateLimitMemory() {
  memory.clear();
  lastDegradedLogMs = 0;
  redisDownUntilMs = 0;
  degradedSinceMs = null;
  degradedTransitions = 0;
  fallbackDecisions = 0;
  lastRedisSuccessMs = null;
  lastRecoveredLogMs = 0;
}

export interface RateLimitStatus {
  /** "redis": shared counters; "memory-fallback": per-process counters; "unknown": no check yet. */
  mode: "redis" | "memory-fallback" | "unknown";
  degraded: boolean;
  /** ISO time the current outage began, null when healthy. */
  degradedSince: string | null;
  /** How many times this process entered degraded mode. */
  degradedTransitions: number;
  /** Requests decided by the in-process fallback (or refused) since start. */
  fallbackDecisions: number;
}

/** Cheap, in-memory snapshot; never touches Redis and exposes no error detail. */
export function getRateLimitStatus(): RateLimitStatus {
  const degraded = degradedSinceMs !== null;
  return {
    mode: degraded ? "memory-fallback" : lastRedisSuccessMs === null ? "unknown" : "redis",
    degraded,
    degradedSince: degradedSinceMs === null ? null : new Date(degradedSinceMs).toISOString(),
    degradedTransitions,
    fallbackDecisions,
  };
}

// ─── Redis path ──────────────────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Redis timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/** Redis failed: enter (or stay in) degraded mode, logging at a bounded rate. */
function logDegraded(error: unknown, nowMs: number) {
  const entering = degradedSinceMs === null;
  if (entering) {
    degradedSinceMs = nowMs;
    degradedTransitions += 1;
  }
  // Entering and reminders share one budget: a flapping Redis cannot flood the logs
  if (lastDegradedLogMs && nowMs - lastDegradedLogMs < DEGRADED_LOG_INTERVAL_MS) return;
  lastDegradedLogMs = nowMs;
  logger.error(RATE_LIMIT_DEGRADED_EVENT, {
    eventType: RATE_LIMIT_DEGRADED_EVENT,
    operation: "rate-limit",
    metadata: {
      // The error text can name hosts; keep only its class
      reason: error instanceof Error ? error.name : "unknown",
      ongoing: !entering,
      sinceMs: nowMs - (degradedSinceMs ?? nowMs),
      transitions: degradedTransitions,
      fallbackDecisions,
      impact: "Limits are enforced per instance only, not shared across instances",
    },
  });
}

/** Redis answered: leave degraded mode if we were in it. */
function markRedisHealthy(nowMs: number) {
  lastRedisSuccessMs = nowMs;
  if (degradedSinceMs === null) return;
  const durationMs = nowMs - degradedSinceMs;
  degradedSinceMs = null;
  if (lastRecoveredLogMs && nowMs - lastRecoveredLogMs < DEGRADED_LOG_INTERVAL_MS) return;
  lastRecoveredLogMs = nowMs;
  logger.info(RATE_LIMIT_RECOVERED_EVENT, {
    eventType: RATE_LIMIT_RECOVERED_EVENT,
    operation: "rate-limit",
    duration: durationMs,
    metadata: { transitions: degradedTransitions, fallbackDecisions },
  });
}

function refuse(limit: number, nowMs: number): RateLimitResult {
  return {
    allowed: false,
    limit,
    remaining: 0,
    reset: Math.ceil((nowMs + 1000) / 1000),
    retryAfter: 1,
    degraded: true,
  };
}

/**
 * Count one request against `key` and say whether it is within `limit`
 * requests per `windowSeconds`.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
  options: RateLimitOptions = {},
): Promise<RateLimitResult> {
  const nowMs = Date.now();
  const windowIndex = Math.floor(nowMs / (windowSeconds * 1000));
  const currentKey = `rl:${key}:${windowIndex}`;
  const previousKey = `rl:${key}:${windowIndex - 1}`;

  if (nowMs < redisDownUntilMs) {
    fallbackDecisions += 1;
    return options.failMode === "closed"
      ? refuse(limit, nowMs)
      : memoryCheck(key, limit, windowSeconds, nowMs, true);
  }

  try {
    const raw = await withTimeout(
      redis.eval(
        SLIDING_WINDOW_SCRIPT,
        2,
        currentKey,
        previousKey,
        windowSeconds * 2,
      ),
      REDIS_TIMEOUT_MS,
    );
    if (!Array.isArray(raw) || raw.length < 2) throw new Error("Unexpected reply");
    markRedisHealthy(nowMs);
    return decide(limit, windowSeconds, nowMs, Number(raw[0]), Number(raw[1]), false);
  } catch (error) {
    redisDownUntilMs = nowMs + REDIS_RETRY_AFTER_MS;
    fallbackDecisions += 1;
    logDegraded(error, nowMs);
    if (options.failMode === "closed") return refuse(limit, nowMs);
    return memoryCheck(key, limit, windowSeconds, nowMs, true);
  }
}

// ─── Request helpers ─────────────────────────────────────────────────────────

const IP_PATTERN = /^[0-9a-fA-F:.]{3,45}$/;

/**
 * Client IP behind reverse proxies. Each trusted proxy appends the address it
 * received the request from, so the client is the entry `TRUSTED_PROXY_HOPS`
 * from the right (default 1: a single proxy such as Traefik/Coolify). Taking the
 * leftmost entry would let a client choose its own bucket by sending the header.
 * Returns "unknown" when no trustworthy address is available (local dev).
 */
export function getClientIp(
  headers: Headers,
  trustedHops = Number(process.env.TRUSTED_PROXY_HOPS ?? 1),
): string {
  if (!Number.isInteger(trustedHops) || trustedHops < 1) return "unknown";

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    const candidate = parts[Math.max(0, parts.length - trustedHops)];
    if (candidate && IP_PATTERN.test(candidate)) return candidate;
  }
  const real = headers.get("x-real-ip")?.trim();
  if (real && IP_PATTERN.test(real)) return real;
  return "unknown";
}

export interface EnforceOptions extends RateLimitOptions {
  limit: number;
  windowSeconds: number;
  /** Who is limited. Defaults to the client IP; pass `user:<id>` once signed in. */
  subject?: string;
}

/** Headers that tell the client where it stands. */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
  };
  if (!result.allowed) headers["Retry-After"] = String(result.retryAfter);
  return headers;
}

/**
 * Count one request for `name` + subject (client IP by default) and return the
 * decision. Use it where a Response cannot be returned, e.g. server actions.
 */
export async function checkRateLimit(
  source: Request | Headers,
  name: string,
  options: EnforceOptions,
): Promise<RateLimitResult> {
  const headers = source instanceof Headers ? source : source.headers;
  const subject = options.subject ?? `ip:${getClientIp(headers)}`;
  return rateLimit(`${name}:${subject}`, options.limit, options.windowSeconds, {
    failMode: options.failMode,
  });
}

/**
 * For route handlers: returns a 429 NextResponse when the caller is over the limit,
 * otherwise null.
 *
 *   const limited = await enforceRateLimit(req, "contact", { limit: 5, windowSeconds: 3600 });
 *   if (limited) return limited;
 */
export async function enforceRateLimit(
  source: Request | Headers,
  name: string,
  options: EnforceOptions,
): Promise<NextResponse | null> {
  const result = await checkRateLimit(source, name, options);
  if (result.allowed) return null;
  return NextResponse.json(
    { error: "Too many requests", retryAfter: result.retryAfter },
    { status: 429, headers: rateLimitHeaders(result) },
  );
}

/**
 * Atomic "first caller wins": true when `id` was not seen in the last
 * `ttlSeconds`. Uses a single SET NX EX, so a crash cannot leave a key without a
 * TTL. If Redis is unavailable it answers true (the work is allowed to run):
 * callers of this helper must be safe to run twice.
 */
export async function ensureIdempotent(id: string, ttlSeconds = 60): Promise<boolean> {
  const nowMs = Date.now();
  if (nowMs < redisDownUntilMs) return true;
  try {
    const claimed = await withTimeout(redis.setNxEx(`idem:${id}`, "1", ttlSeconds), REDIS_TIMEOUT_MS);
    markRedisHealthy(nowMs);
    return claimed;
  } catch (error) {
    redisDownUntilMs = nowMs + REDIS_RETRY_AFTER_MS;
    logDegraded(error, nowMs);
    return true;
  }
}

/**
 * Give back a claim made with ensureIdempotent, so that a retry may run the work
 * again (used when the work failed). Best effort: if Redis is down the claim
 * simply expires with its TTL.
 */
export async function releaseIdempotent(id: string): Promise<void> {
  if (Date.now() < redisDownUntilMs) return;
  try {
    await withTimeout(redis.del(`idem:${id}`), REDIS_TIMEOUT_MS);
  } catch {
    /* the claim expires on its own */
  }
}
