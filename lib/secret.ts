import { createHmac } from "node:crypto";

/**
 * The application secret, and keys derived from it. One place decides whether a secret is acceptable, so that no module
 * invents its own fallback.
 *
 * `next build` imports server modules without the runtime secret, so a placeholder is allowed during the build phase
 * only. A running production server with a missing, short or well-known secret refuses to start (see `assertSecretStrength`),
 * because anyone could then forge the values it signs (sessions, exam tokens, proof-of-work challenges).
 */

const BUILD_PLACEHOLDER = "build-time-placeholder-secret-not-for-production";
export const MIN_SECRET_LENGTH = 32;

/** Values copied from documentation or examples: never acceptable outside a build or a test. */
const KNOWN_WEAK = [
  BUILD_PLACEHOLDER,
  "your-32-character-secret-key-here",
  "your-secret-key",
  "changeme",
  "secret",
  "password",
];

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build";
}

/** Why a secret is not acceptable, or null when it is. */
export function secretProblem(value: string | undefined): string | null {
  if (!value) return "is not set";
  if (value.length < MIN_SECRET_LENGTH) return `is shorter than ${MIN_SECRET_LENGTH} characters`;
  const lower = value.toLowerCase();
  if (KNOWN_WEAK.some((weak) => lower.includes(weak))) return "contains a well-known placeholder";
  if (new Set(value).size < 8) return "has too little variety (use a random value, e.g. `openssl rand -base64 48`)";
  return null;
}

/** Throws when a running production server has a weak `BETTER_AUTH_SECRET`. Call it at startup. */
export function assertSecretStrength(): void {
  if (!isProductionRuntime()) return;
  const problem = secretProblem(process.env.BETTER_AUTH_SECRET);
  if (problem) throw new Error(`BETTER_AUTH_SECRET ${problem}`);
}

/**
 * The application secret. During a build, a test or development a placeholder is returned; in a running production
 * server a weak secret throws. Never cache the result at module load in code that is imported during the build.
 */
export function getAppSecret(): string {
  const value = process.env.BETTER_AUTH_SECRET;
  if (isProductionRuntime()) {
    const problem = secretProblem(value);
    if (problem) throw new Error(`BETTER_AUTH_SECRET ${problem}`);
    return value as string;
  }
  return value || BUILD_PLACEHOLDER;
}

/**
 * A key for one purpose, derived from the application secret (HMAC-SHA256 with the purpose as label). Compromising a
 * value signed for one purpose (an exam token) then says nothing about the others (sessions, proof-of-work).
 */
export function deriveKey(purpose: string): Buffer {
  if (!purpose) throw new Error("deriveKey needs a purpose");
  return createHmac("sha256", getAppSecret()).update(`fygs:${purpose}:v1`).digest();
}
