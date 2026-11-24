// Staff accounts (ADMIN, INSTRUCTOR) hold their role only with a second factor (lib/auth-policy.ts). The audits sign in as
// them, so on the disposable server they are enrolled with a known secret and the sign-in answers the challenge like an
// authenticator application would. Same idea as tests/e2e/support/two-factor.ts.
//
// The server keeps the secret encrypted with its own application secret, which scripts/e2e.mjs draws for the run and
// writes to .e2e-serve.json (E2E_AUTH_SECRET) when started with --serve.
import { createHmac, randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { symmetricEncrypt } from "better-auth/crypto";

const root = path.resolve(import.meta.dirname, "../..");
export const AUDIT_TOTP_SECRET = "audit-staff-totp-secret-0123456789a";

function authSecret() {
  if (process.env.E2E_AUTH_SECRET) return process.env.E2E_AUTH_SECRET;
  const file = path.join(root, ".e2e-serve.json");
  if (existsSync(file)) {
    const value = JSON.parse(readFileSync(file, "utf8")).E2E_AUTH_SECRET;
    if (value) return value;
  }
  throw new Error("E2E_AUTH_SECRET is not set and .e2e-serve.json has none: start the server with `node scripts/e2e.mjs --serve`");
}

/** The 6-digit code an authenticator would show now (RFC 6238: HMAC-SHA1, 30 s, 6 digits). */
export function totpNow(secret = AUDIT_TOTP_SECRET, now = Date.now()) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(now / 30_000)));
  const hash = createHmac("sha1", Buffer.from(secret, "utf8")).update(counter).digest();
  const offset = hash[hash.length - 1] & 15;
  const value = ((hash[offset] & 127) << 24) | (hash[offset + 1] << 16) | (hash[offset + 2] << 8) | hash[offset + 3];
  return String(value % 1_000_000).padStart(6, "0");
}

/** Gives a staff user a verified second factor with the audit secret. `pool` is a pg Pool on the disposable database. */
export async function enrollStaff(pool, userId) {
  const key = authSecret();
  const secret = await symmetricEncrypt({ key, data: AUDIT_TOTP_SECRET });
  const backupCodes = await symmetricEncrypt({ key, data: JSON.stringify(["audit-backup-code-1"]) });
  await pool.query(`DELETE FROM "twoFactor" WHERE "userId" = $1`, [userId]);
  await pool.query(
    `INSERT INTO "twoFactor" (id, secret, "backupCodes", "userId", verified, "failedVerificationCount") VALUES ($1, $2, $3, $4, true, 0)`,
    [randomUUID(), secret, backupCodes, userId],
  );
  await pool.query(`UPDATE "user" SET "twoFactorEnabled" = true WHERE id = $1`, [userId]);
}

/** Signs in with the e-mail and password, then answers the second-factor challenge when the server asks for one. */
export async function signInWithSecondFactor(context, base, email, password) {
  const ip = () => `10.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 1}`;
  const headers = () => ({ origin: new URL(base).origin, "x-forwarded-for": ip() });
  const signIn = await context.request.post(`${base}/api/auth/sign-in/email`, { data: { email, password }, headers: headers() });
  if (!signIn.ok()) throw new Error(`sign-in as ${email} answered ${signIn.status()}`);
  if ((await signIn.json().catch(() => null))?.twoFactorRedirect) {
    const verified = await context.request.post(`${base}/api/auth/two-factor/verify-totp`, { data: { code: totpNow() }, headers: headers() });
    if (!verified.ok()) throw new Error(`second factor of ${email} answered ${verified.status()}`);
  }
}
