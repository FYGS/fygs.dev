import { createHash, timingSafeEqual } from "node:crypto";

/**
 * `Authorization: Bearer <secret>` checks for machine-to-machine endpoints (cron, maintenance).
 *
 * The comparison is constant-time (both sides are hashed to the same length first, so neither the content nor the
 * length of the expected secret leaks through timing), and a secret that is missing or too short never matches:
 * an operator who forgot to set `CRON_SECRET`, or set it to `1234`, must not open the endpoint to whoever sends
 * the same short string.
 */

/** Shortest secret accepted for a bearer endpoint (`openssl rand -base64 48` gives 64). */
export const BEARER_MIN_LENGTH = 32;

const digest = (value: string) => createHash("sha256").update(value, "utf8").digest();

/** Why `secret` cannot protect an endpoint, or null when it can. */
export function bearerSecretProblem(secret: string | undefined): string | null {
  if (!secret) return "is not set";
  if (secret.length < BEARER_MIN_LENGTH) return `is shorter than ${BEARER_MIN_LENGTH} characters`;
  return null;
}

/** True when the request carries `Authorization: Bearer <secret>` for a usable `secret`. */
export function checkBearer(source: Request | Headers, secret: string | undefined): boolean {
  if (bearerSecretProblem(secret) !== null) return false;
  const headers = source instanceof Headers ? source : source.headers;
  const header = headers.get("authorization");
  if (!header) return false;
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim());
  if (!match) return false;
  return timingSafeEqual(digest(match[1]), digest(secret as string));
}
