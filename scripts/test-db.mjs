#!/usr/bin/env node
/**
 * Disposable PostgreSQL for tests (local and CI).
 *
 * Starts a REAL PostgreSQL server (binaries from the `embedded-postgres` npm
 * package: no Docker, no installed Postgres, works on Windows/macOS/Linux),
 * applies the real Prisma schema with `prisma db push`, and hands out a
 * connection string. Nothing outside a temp directory is touched.
 *
 *   node scripts/test-db.mjs run -- <command...>   start, push schema, run, tear down (exit code is the command's)
 *   node scripts/test-db.mjs start                 start + push schema and stay up until Ctrl+C (prints the URL)
 *
 * If TEST_DATABASE_URL is set (CI service container, docker-compose.test.yml)
 * that server is used instead of an embedded one: same schema push, same tests.
 *
 * Safety: tests wipe and rewrite their data, so the target must be
 * a local server and its database name must contain "test". The remote dev
 * database from `.env` can never be reached through this script.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import net from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

const DB_NAME = "fygs_test";
const DB_USER = "postgres";
const DB_PASSWORD = "password";

/** Throws unless the URL points to a local server and a database named *test*. */
export function assertDisposableDatabase(url) {
  const parsed = new URL(url);
  const local = ["localhost", "127.0.0.1", "[::1]", "::1"].includes(parsed.hostname);
  const dbName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (!local || !/test/i.test(dbName)) {
    throw new Error(
      `Refusing to reset "${parsed.hostname}/${dbName}": the test database must be local and its name must contain "test".`,
    );
  }
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

function removeDir(dir) {
  // Windows keeps file handles a moment after postgres exits.
  rmSync(dir, { recursive: true, force: true, maxRetries: 20, retryDelay: 250 });
}

/** Applies prisma/schema.prisma to `url` (a freshly created, empty database). */
export function pushSchema(url) {
  assertDisposableDatabase(url);
  const prismaCli = require.resolve("prisma/build/index.js");
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [prismaCli, "db", "push"],
      {
        cwd: root,
        env: { ...process.env, DATABASE_URL: url },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    let output = "";
    child.stdout.on("data", (d) => (output += d));
    child.stderr.on("data", (d) => (output += d));
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`prisma db push failed (${code})\n${output}`)),
    );
  });
}

/**
 * Returns `{ url, stop }`. Uses TEST_DATABASE_URL when set, otherwise boots an
 * embedded PostgreSQL on a free port in a throw-away data directory.
 * The schema is pushed before returning unless `{ pushSchema: false }`.
 */
export async function startTestDb(options = {}) {
  const external = process.env.TEST_DATABASE_URL;
  if (external) {
    assertDisposableDatabase(external);
    if (options.pushSchema !== false) await pushSchema(external);
    return { url: external, embedded: false, stop: async () => {} };
  }

  const { default: EmbeddedPostgres } = await import("embedded-postgres");
  const dataDir = mkdtempSync(path.join(tmpdir(), "fygs-test-db-"));
  const port = options.port ?? (await freePort());
  const server = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: DB_USER,
    password: DB_PASSWORD,
    port,
    // UTF8 explicitly: the Windows default (WIN1252) rejects emoji in the seed data.
    // --no-sync: the database is disposable, so skip fsync for speed.
    initdbFlags: ["--encoding=UTF8", "--locale=C", "--no-sync"],
    postgresFlags: ["-c", "fsync=off", "-c", "synchronous_commit=off", "-c", "full_page_writes=off"],
    persistent: true, // we remove the directory ourselves (retrying on Windows)
    onLog: () => {},
    onError: () => {},
  });

  let started = false;
  const stop = async () => {
    try {
      if (started) await server.stop();
    } finally {
      started = false;
      removeDir(dataDir);
    }
  };

  try {
    await server.initialise();
    await server.start();
    started = true;
    await server.createDatabase(DB_NAME);
    const url = `postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${port}/${DB_NAME}`;
    if (options.pushSchema !== false) await pushSchema(url);
    return { url, embedded: true, stop };
  } catch (error) {
    await stop().catch(() => {});
    throw error;
  }
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);

  if (command === "run") {
    const separator = rest.indexOf("--");
    const argv = separator === -1 ? rest : rest.slice(separator + 1);
    if (argv.length === 0) throw new Error("usage: test-db.mjs run -- <command...>");

    const db = await startTestDb();
    console.log(`[test-db] ${db.embedded ? "embedded PostgreSQL" : "external PostgreSQL"} ready, schema pushed`);
    const code = await new Promise((resolve) => {
      // `shell` so that package.json binaries (vitest, tsx) resolve through PATH.
      const child = spawn(argv.join(" "), {
        cwd: root,
        shell: true,
        stdio: "inherit",
        env: {
          ...process.env,
          DATABASE_URL: db.url,
          TEST_DATABASE_URL: db.url,
          // globalSetup sees the DB already exists and must not start another.
          TEST_DB_PROVIDED: "1",
          PATH: `${path.join(root, "node_modules", ".bin")}${path.delimiter}${process.env.PATH}`,
        },
      });
      child.on("exit", (c, signal) => resolve(c ?? (signal ? 1 : 0)));
      child.on("error", () => resolve(1));
    });
    await db.stop();
    process.exit(code);
  }

  if (command === "start") {
    const db = await startTestDb({ port: Number(process.env.TEST_DB_PORT) || 54329 });
    console.log(`[test-db] ready: ${db.url}`);
    console.log("[test-db] Ctrl+C to stop and delete the database");
    const shutdown = async () => {
      await db.stop();
      process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    setInterval(() => {}, 1 << 30);
    return;
  }

  console.error("usage: node scripts/test-db.mjs <run -- cmd... | start>");
  process.exit(2);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
