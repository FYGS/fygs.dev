#!/usr/bin/env node
/**
 * One-command browser e2e: `pnpm test:e2e [--build] [-- <playwright args>]`
 *
 *   1. starts the disposable embedded PostgreSQL (scripts/test-db.mjs), applies the
 *      real migrations and seeds it (prisma/seed);
 *   2. builds the app against it when there is no build yet (or with --build / E2E_BUILD=1):
 *      static pages are generated from the seeded data;
 *   3. starts `next start` (production build) on a free port with e-mail capture
 *      (lib/emails/service/capture.ts), no AI key (offline assistant), no Redis (memory
 *      rate limiter), and the Stripe TEST key from .env (only used for the checkout smoke);
 *   4. (with --serve: stops here, prints the environment for manual `playwright test` runs and waits for Ctrl+C)
 *      runs Playwright (system Chrome, tests/e2e) and tears everything down, always.
 *
 * Nothing here can reach the remote database of .env: DATABASE_URL is replaced by the
 * embedded one in every child process.
 */
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import net from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { startTestDb } from "./test-db.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const tsxBin = path.join(root, "node_modules", "tsx", "dist", "cli.mjs");
const playwrightCli = path.join(root, "node_modules", "@playwright", "test", "cli.js");

const args = process.argv.slice(2);
// --build / --serve are ours; everything else (with or without a leading "--") goes to Playwright.
const serveOnly = args.includes("--serve");
const forceBuild = args.includes("--build") || process.env.E2E_BUILD === "1";
const playwrightArgs = args.filter((a, i) => a !== "--build" && a !== "--serve" && !(a === "--" && i === args.indexOf("--")));

const BUILD_PORT = 3100; // NEXT_PUBLIC_SITE_URL is inlined at build time

function freePort(preferred) {
  return new Promise((resolve) => {
    const tryPort = (port) => {
      const server = net.createServer();
      server.once("error", () => (port === 0 ? resolve(0) : tryPort(0)));
      server.listen(port, "127.0.0.1", () => {
        const { port: got } = server.address();
        server.close(() => resolve(got));
      });
    };
    tryPort(preferred);
  });
}

function killTree(child) {
  if (!child || child.exitCode !== null) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(child.pid), "/F", "/T"], { stdio: "ignore" });
  } else {
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch {
      child.kill("SIGKILL");
    }
  }
}

function run(label, command, cmdArgs, env) {
  return new Promise((resolve) => {
    console.log(`[e2e] ${label}`);
    const child = spawn(command, cmdArgs, { cwd: root, env, stdio: "inherit" });
    child.on("exit", (code) => resolve(code ?? 1));
    child.on("error", () => resolve(1));
  });
}

async function waitFor(url, timeoutMs, isAlive) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!isAlive()) throw new Error("the server exited before becoming ready");
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.status < 500) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`${url} not ready after ${timeoutMs} ms`);
}

/** STRIPE_* from the environment (CI secrets) or .env, only when the key is a TEST key. */
function stripeTestEnv() {
  const out = {};
  const file = path.join(root, ".env");
  if (existsSync(file)) {
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = /^\s*(STRIPE_[A-Z_]+)\s*=\s*"?([^"#]*?)"?\s*(?:#.*)?$/.exec(line);
      if (m) out[m[1]] = m[2];
    }
  }
  for (const [key, value] of Object.entries(process.env)) if (key.startsWith("STRIPE_") && value) out[key] = value;
  if (!out.STRIPE_SECRET_KEY?.startsWith("sk_test_")) {
    if (out.STRIPE_SECRET_KEY) console.warn("[e2e] STRIPE_SECRET_KEY is not a test key: Stripe variables are NOT passed to the app");
    return { STRIPE_SECRET_KEY: "" }; // the checkout smoke test skips itself
  }
  return out;
}

let db;
let server;
let tmpDir;
let exitCode = 1;

async function cleanup() {
  killTree(server);
  if (db) await db.stop().catch((e) => console.warn("[e2e] db stop:", e.message));
  if (tmpDir) rmSync(tmpDir, { recursive: true, force: true });
  rmSync(path.join(root, ".e2e-serve.json"), { force: true });
}
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, async () => {
    await cleanup();
    process.exit(130);
  });
}

try {
  process.env.TEST_DB_SCHEMA = "migrate"; // the production path: prisma migrate deploy
  db = await startTestDb();
  console.log("[e2e] embedded PostgreSQL ready (migrations applied)");

  tmpDir = mkdtempSync(path.join(tmpdir(), "fygs-e2e-"));
  const mailFile = path.join(tmpDir, "mail.jsonl");
  writeFileSync(mailFile, "");

  const authSecret = randomBytes(36).toString("base64url");
  const port = await freePort(BUILD_PORT);
  const baseURL = `http://localhost:${port}`;

  const appEnv = {
    ...process.env,
    ...stripeTestEnv(),
    DATABASE_URL: db.url,
    DATABASE_URL_UNPOOLED: db.url,
    TEST_DATABASE_URL: db.url,
    // `next start` runs as a production server: it refuses a weak secret (lib/env-guard.ts), so each run draws its own
    BETTER_AUTH_SECRET: authSecret,
    CRON_SECRET: randomBytes(36).toString("base64url"),
    ADMIN_API_KEY: randomBytes(36).toString("base64url"),
    // browsers of the harness do not solve the proof of work (lib/anti-automation): the server does not ask for it
    HUMAN_PROOF_MODE: "off",
    BETTER_AUTH_URL: baseURL,
    NEXT_PUBLIC_SITE_URL: `http://localhost:${BUILD_PORT}`,
    EMAIL_TRANSPORT: "capture",
    // the contact route refuses to run without a mail account; with the capture transport nothing is ever sent
    EMAIL_SERVER_USER: "e2e@example.com",
    EMAIL_SERVER_PASSWORD: "e2e-capture-only",
    E2E_ALLOW_EMAIL_CAPTURE: "yes-this-is-a-disposable-environment",
    EMAIL_CAPTURE_FILE: mailFile,
    REDIS_URL: "", // in-memory rate limiter (and no stats store: lib/redis falls back to these)
    blog_stats_KV_REST_API_URL: "",
    blog_stats_KV_REST_API_TOKEN: "",
    ANTHROPIC_API_KEY: "", // offline AI assistant
    NODE_USE_SYSTEM_CA: "1",
    NEXT_TELEMETRY_DISABLED: "1",
  };
  delete appEnv.PGHOST;
  delete appEnv.POSTGRES_URL;
  delete appEnv.POSTGRES_PRISMA_URL;
  delete appEnv.POSTGRES_URL_NON_POOLING;

  let code = await run("seeding", process.execPath, [tsxBin, "prisma/seed.ts"], appEnv);
  if (code !== 0) throw new Error("seed failed");

  if (forceBuild || !existsSync(path.join(root, ".next", "BUILD_ID"))) {
    code = await run("next build --webpack (slow: 5-13 min)", process.execPath, [nextBin, "build", "--webpack"], appEnv);
    if (code !== 0) throw new Error("build failed");
  } else {
    console.log("[e2e] reusing the existing .next build (use --build to rebuild)");
  }

  server = spawn(process.execPath, [nextBin, "start", "-p", String(port)], {
    cwd: root,
    env: { ...appEnv, NODE_ENV: "production" },
    stdio: ["ignore", "inherit", "inherit"],
    detached: process.platform !== "win32",
  });
  await waitFor(`${baseURL}/api/health`, 120_000, () => server.exitCode === null);
  console.log(`[e2e] app ready on ${baseURL}`);

  // The tests enrol the staff accounts in two-factor authentication with a known TOTP secret, which the server stores
  // encrypted with its own secret: they need it (tests/e2e/support/two-factor.ts)
  const testEnv = { E2E_BASE_URL: baseURL, E2E_MAIL_FILE: mailFile, DATABASE_URL: db.url, E2E_AUTH_SECRET: authSecret };
  if (serveOnly) {
    writeFileSync(path.join(root, ".e2e-serve.json"), JSON.stringify(testEnv, null, 2));
    console.log(`[e2e] --serve: environment written to .e2e-serve.json; Ctrl+C to stop`);
    await new Promise(() => setInterval(() => {}, 1 << 30));
  }
  exitCode = await run("playwright", process.execPath, [playwrightCli, "test", ...playwrightArgs], {
    ...appEnv,
    ...testEnv,
  });
} catch (error) {
  console.error("[e2e]", error instanceof Error ? error.message : error);
  exitCode = 1;
} finally {
  await cleanup();
}
process.exit(exitCode);
