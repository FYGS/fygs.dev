#!/usr/bin/env node
/**
 * Staging admin session helper (recette only): enrols the admin's TOTP once, then signs in (password + TOTP) and writes a
 * cookie file that curl, Playwright or an agent can reuse.
 *
 *   node scripts/ops/staging-admin.mjs enroll        enrol the second factor, keep the secret in the credentials file
 *   node scripts/ops/staging-admin.mjs login [file]  sign in, write the cookies (default: ./staging-admin.cookies) and print the check
 *
 * Credentials live OUTSIDE the repository: ~/.config/fygs-dev/staging-admin.env (STAGING_URL, STAGING_ADMIN_EMAIL,
 * STAGING_ADMIN_PASSWORD, and after `enroll` STAGING_ADMIN_TOTP_SECRET). Nothing secret is ever printed.
 */
import { createHmac } from "node:crypto";
import { readFileSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const ENV_FILE = process.env.STAGING_ADMIN_ENV || join(homedir(), ".config", "fygs-dev", "staging-admin.env");

function readEnv() {
  if (!existsSync(ENV_FILE)) throw new Error(`missing ${ENV_FILE}`);
  const out = {};
  for (const line of readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
    const i = line.indexOf("=");
    if (i > 0 && !line.startsWith("#")) out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return out;
}

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32Decode(input) {
  let bits = "";
  for (const ch of input.replace(/=+$/, "").toUpperCase()) bits += BASE32.indexOf(ch).toString(2).padStart(5, "0");
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

/** RFC 6238, SHA-1, 6 digits, 30 s: what authenticator apps and better-auth use by default. */
function totp(secretBase32, now = Date.now()) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(now / 1000 / 30)));
  const hmac = createHmac("sha1", base32Decode(secretBase32)).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return String(code).padStart(6, "0");
}

class Client {
  constructor(base) {
    this.base = base;
    this.jar = new Map();
  }
  cookieHeader() {
    return [...this.jar].map(([k, v]) => `${k}=${v}`).join("; ");
  }
  async post(path, body) {
    const res = await fetch(this.base + path, {
      method: "POST",
      headers: { "content-type": "application/json", origin: this.base, cookie: this.cookieHeader() },
      body: JSON.stringify(body),
      redirect: "manual",
    });
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [pair] = c.split(";");
      const i = pair.indexOf("=");
      const name = pair.slice(0, i);
      const value = pair.slice(i + 1);
      if (/max-age=0|expires=thu, 01 jan 1970/i.test(c) || value === "") this.jar.delete(name);
      else this.jar.set(name, value);
    }
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {}
    return { status: res.status, json };
  }
  async get(path) {
    const res = await fetch(this.base + path, { headers: { cookie: this.cookieHeader() }, redirect: "manual" });
    return { status: res.status, location: res.headers.get("location"), text: await res.text() };
  }
}

async function signIn(env) {
  const c = new Client(env.STAGING_URL);
  const r = await c.post("/api/auth/sign-in/email", { email: env.STAGING_ADMIN_EMAIL, password: env.STAGING_ADMIN_PASSWORD });
  if (r.status !== 200) throw new Error(`sign-in refused (HTTP ${r.status})`);
  return { c, twoFactor: Boolean(r.json?.twoFactorRedirect) };
}

async function enroll() {
  const env = readEnv();
  if (env.STAGING_ADMIN_TOTP_SECRET) return console.log("already enrolled (STAGING_ADMIN_TOTP_SECRET present)");
  const { c, twoFactor } = await signIn(env);
  if (twoFactor) throw new Error("a second factor is already set on the account but its secret is not in the credentials file");
  const enable = await c.post("/api/auth/two-factor/enable", { password: env.STAGING_ADMIN_PASSWORD });
  const uri = enable.json?.totpURI;
  const secret = uri && new URL(uri).searchParams.get("secret");
  if (!secret) throw new Error(`enable failed (HTTP ${enable.status})`);
  const verify = await c.post("/api/auth/two-factor/verify-totp", { code: totp(secret) });
  if (verify.status !== 200) throw new Error(`verification failed (HTTP ${verify.status})`);
  appendFileSync(
    ENV_FILE,
    `STAGING_ADMIN_TOTP_SECRET=${secret}\n${enable.json.backupCodes?.length ? `STAGING_ADMIN_BACKUP_CODES=${enable.json.backupCodes.join(",")}\n` : ""}`,
  );
  console.log("second factor enrolled; secret and backup codes saved in the credentials file");
}

async function login(cookieFile = "staging-admin.cookies") {
  const env = readEnv();
  if (!env.STAGING_ADMIN_TOTP_SECRET) throw new Error("run `enroll` first");
  const { c, twoFactor } = await signIn(env);
  if (twoFactor) {
    const v = await c.post("/api/auth/two-factor/verify-totp", { code: totp(env.STAGING_ADMIN_TOTP_SECRET) });
    if (v.status !== 200) throw new Error(`second factor refused (HTTP ${v.status})`);
  }
  writeFileSync(cookieFile, c.cookieHeader(), { mode: 0o600 });
  const session = await c.get("/api/auth/get-session");
  const user = JSON.parse(session.text || "null")?.user;
  const admin = await c.get("/fr/admin");
  console.log(
    `signed in as role=${user?.role ?? "?"}; /fr/admin -> HTTP ${admin.status}${admin.location ? ` -> ${admin.location}` : ""}; cookies in ${cookieFile} (use: curl -H "Cookie: $(cat ${cookieFile})" …)`,
  );
}

const [cmd, arg] = process.argv.slice(2);
try {
  if (cmd === "enroll") await enroll();
  else if (cmd === "login") await login(arg);
  else console.log("usage: staging-admin.mjs enroll | login [cookie-file]");
} catch (e) {
  console.error("error:", e.message);
  process.exit(1);
}
