import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import redis from "@/lib/redis";
import { deriveKey } from "@/lib/secret";
import { heat, ipBucketOf } from "./hot-buckets";
import { HUMAN_PROOF_ACTIONS, type HumanProofAction } from "./types";

/**
 * Self-hosted proof-of-work (hashcash style), the cheap cost a script has to pay on every sensitive request.
 *
 *  1. GET /api/pow?action=sign-up gives a CHALLENGE: a token signed with the server (HMAC, key derived from the
 *     application secret for this purpose only) that carries the action, the network (/24 or /64) it was issued to,
 *     its issue and expiry time, the difficulty and a random nonce.
 *  2. The browser looks for a counter such that SHA-256(`<token>:<counter>`) starts with `difficulty` zero bits. That
 *     takes a fraction of a second for one visitor, and a script that opens thousands of accounts pays it thousands of times.
 *  3. The request carries `proof = <token>~<counter>` in the `x-human-proof` header. The server checks the signature,
 *     the action, the network, the expiry, the minimum age (a script that answers instantly is refused), the work,
 *     and that this challenge was never used before.
 *
 * It does not replace the rate limits or the validation of the request: it raises the price of automation, nothing more.
 * A network that was just refused by a rate limit is asked for more work (`heat`, see hot-buckets.ts).
 */

export const POW_TTL_MS = 120_000;
const MAX_DIFFICULTY = 26;
const MAX_PROOF_LENGTH = 400;
const CLOCK_SKEW_MS = 5_000;

/** Leading zero bits asked for each action when the network is calm. 2^bits hashes on average. */
export const BASE_DIFFICULTY: Record<HumanProofAction, number> = {
  "sign-up": 18,
  contact: 18,
  "ai-guest": 18,
  "password-reset": 17,
  review: 16,
  "community-post": 16,
  // A returning user typing a password: a light cost, the per-account limits do the rest
  "sign-in": 14,
};

/** A challenge answered faster than this was not read by a human (the client waits for it, so a person never sees it). */
export const MIN_AGE_MS: Record<HumanProofAction, number> = {
  "sign-up": 2_000,
  contact: 2_000,
  "ai-guest": 1_500,
  "password-reset": 2_000,
  review: 2_000,
  "community-post": 2_000,
  "sign-in": 1_000,
};

export function isHumanProofAction(value: unknown): value is HumanProofAction {
  return typeof value === "string" && (HUMAN_PROOF_ACTIONS as readonly string[]).includes(value);
}

/** Two more zero bits (four times the work) for each notch of heat of the client's network, up to a ceiling. */
export function difficultyFor(action: HumanProofAction, ip: string, nowMs = Date.now()): number {
  return Math.min(MAX_DIFFICULTY, BASE_DIFFICULTY[action] + 2 * heat(ipBucketOf(ip), nowMs));
}

const b64url = (buffer: Buffer) => buffer.toString("base64url");
const key = () => deriveKey("pow");

function bucketTag(ip: string): string {
  return b64url(createHmac("sha256", key()).update(`bucket:${ipBucketOf(ip)}`).digest().subarray(0, 8));
}

function sign(payload: string): string {
  return b64url(createHmac("sha256", key()).update(payload).digest());
}

export interface Challenge {
  token: string;
  difficulty: number;
  minAgeMs: number;
  ttlMs: number;
}

export function issueChallenge(action: HumanProofAction, ip: string, nowMs = Date.now()): Challenge {
  const difficulty = difficultyFor(action, ip, nowMs);
  const payload = ["p1", action, bucketTag(ip), nowMs, nowMs + POW_TTL_MS, difficulty, b64url(randomBytes(16))].join(".");
  return { token: `${payload}.${sign(payload)}`, difficulty, minAgeMs: MIN_AGE_MS[action], ttlMs: POW_TTL_MS };
}

/** Number of leading zero bits of a digest. */
export function leadingZeroBits(digest: Uint8Array): number {
  let bits = 0;
  for (const byte of digest) {
    if (byte === 0) {
      bits += 8;
      continue;
    }
    bits += Math.clz32(byte) - 24;
    break;
  }
  return bits;
}

export function proofHash(token: string, counter: string): Buffer {
  return createHash("sha256").update(`${token}:${counter}`, "utf8").digest();
}

// ─── Single use ──────────────────────────────────────────────────────────────

const used = new Map<string, number>();
const USED_SOFT_LIMIT = 20_000;

/** True the first time a challenge is presented. Shared across instances through Redis, per process when Redis is down. */
async function claimOnce(id: string, ttlMs: number, nowMs: number): Promise<boolean> {
  try {
    const claimed = await Promise.race([
      redis.setNxEx(`pow:${id}`, "1", Math.max(1, Math.ceil(ttlMs / 1000))),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Redis timeout")), 500)),
    ]);
    return claimed;
  } catch {
    // Per-process fallback: a replay can only succeed on another instance, within the challenge's two minutes
    for (const [existing, expiresAt] of used) {
      if (expiresAt <= nowMs) used.delete(existing);
      if (used.size < USED_SOFT_LIMIT) break;
    }
    if ((used.get(id) ?? 0) > nowMs) return false;
    used.set(id, nowMs + ttlMs);
    return true;
  }
}

/** Test helper. */
export function __resetProofReplayStore(): void {
  used.clear();
}

// ─── Verification ────────────────────────────────────────────────────────────

export type ProofFailure =
  | "malformed"
  | "bad_signature"
  | "wrong_action"
  | "wrong_network"
  | "expired"
  | "too_fast"
  | "weak"
  | "insufficient_work"
  | "replayed";

export type ProofVerdict = { ok: true } | { ok: false; reason: ProofFailure };

const PROOF_SHAPE = /^p1\.[a-z-]+\.[A-Za-z0-9_-]+\.\d{10,16}\.\d{10,16}\.\d{1,2}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+~\d{1,12}$/;

export async function verifyProof(
  proof: string,
  action: HumanProofAction,
  ip: string,
  nowMs = Date.now(),
): Promise<ProofVerdict> {
  if (proof.length > MAX_PROOF_LENGTH || !PROOF_SHAPE.test(proof)) return { ok: false, reason: "malformed" };

  const [token, counter] = proof.split("~") as [string, string];
  const parts = token.split(".");
  const signature = parts.pop() as string;
  const payload = parts.join(".");

  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return { ok: false, reason: "bad_signature" };

  const [, tokenAction, tag, issuedRaw, expiresRaw, difficultyRaw] = parts;
  const issuedAt = Number(issuedRaw);
  const expiresAt = Number(expiresRaw);
  const difficulty = Number(difficultyRaw);

  if (tokenAction !== action) return { ok: false, reason: "wrong_action" };
  const wanted = Buffer.from(bucketTag(ip));
  const have = Buffer.from(tag);
  if (wanted.length !== have.length || !timingSafeEqual(wanted, have)) return { ok: false, reason: "wrong_network" };

  if (nowMs > expiresAt || issuedAt - CLOCK_SKEW_MS > nowMs) return { ok: false, reason: "expired" };
  if (nowMs - issuedAt < MIN_AGE_MS[action]) return { ok: false, reason: "too_fast" };
  if (difficulty < BASE_DIFFICULTY[action] || difficulty > MAX_DIFFICULTY) return { ok: false, reason: "weak" };

  if (leadingZeroBits(proofHash(token, counter)) < difficulty) return { ok: false, reason: "insufficient_work" };

  const firstUse = await claimOnce(createHash("sha256").update(token).digest("base64url"), expiresAt - nowMs + 5_000, nowMs);
  if (!firstUse) return { ok: false, reason: "replayed" };
  return { ok: true };
}
