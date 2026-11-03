import { createHmac, randomUUID } from "node:crypto";

import { symmetricEncrypt } from "better-auth/crypto";

/**
 * Administrators and instructors must use a second factor, or the application treats them as students (lib/auth-policy.ts).
 * The end-to-end harness therefore enrols its staff accounts for real, with a fixed secret, and the sign-in fixture
 * computes the code like an authenticator application would. There is no switch that turns the rule off: nothing in the
 * server can be configured to skip it, so a test environment can never leave it open in production.
 *
 * The server keeps the secret encrypted with its own application secret, which the harness hands to the tests
 * (E2E_AUTH_SECRET) because it drew it for the run.
 */

/** The authenticator secret of every enrolled staff account of the harness (the string better-auth keeps, not base32). */
export const STAFF_TOTP_SECRET = "e2e-staff-totp-secret-0123456789ab";

/** The 6-digit code an authenticator would show now (RFC 6238: HMAC-SHA1, 30 s, 6 digits). */
export function totpNow(secret = STAFF_TOTP_SECRET, now = Date.now()): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(now / 30_000)));
  const hash = createHmac("sha1", Buffer.from(secret, "utf8")).update(counter).digest();
  const offset = hash[hash.length - 1] & 15;
  const value = ((hash[offset] & 127) << 24) | (hash[offset + 1] << 16) | (hash[offset + 2] << 8) | hash[offset + 3];
  return String(value % 1_000_000).padStart(6, "0");
}

type Sql = (text: string, params?: unknown[]) => Promise<unknown[]>;

/** Gives the user a verified second factor with the harness secret. Idempotent. */
export async function enrollTwoFactor(sql: Sql, userId: string): Promise<void> {
  const key = process.env.E2E_AUTH_SECRET;
  if (!key) throw new Error("E2E_AUTH_SECRET is not set: run the tests through scripts/e2e.mjs");
  const secret = await symmetricEncrypt({ key, data: STAFF_TOTP_SECRET });
  const backupCodes = await symmetricEncrypt({ key, data: JSON.stringify(["e2e-backup-code-1", "e2e-backup-code-2"]) });
  await sql(`DELETE FROM "twoFactor" WHERE "userId" = $1`, [userId]);
  await sql(
    `INSERT INTO "twoFactor" (id, secret, "backupCodes", "userId", verified, "failedVerificationCount") VALUES ($1, $2, $3, $4, true, 0)`,
    [randomUUID(), secret, backupCodes, userId],
  );
  await sql(`UPDATE "user" SET "twoFactorEnabled" = true WHERE id = $1`, [userId]);
}
