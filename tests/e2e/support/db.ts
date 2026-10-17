import { randomUUID } from "node:crypto";

import { hashPassword } from "better-auth/crypto";
import { Pool } from "pg";

// Plain `pg` on purpose: Playwright loads test files as CommonJS and the generated Prisma
// client is ESM-only (import.meta), so the tests talk SQL to the disposable database.

export const PASSWORD = "E2e-Passw0rd!x";

let pool: Pool | undefined;

function getPool(): Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    const parsed = url ? new URL(url) : null;
    if (!parsed || !["localhost", "127.0.0.1"].includes(parsed.hostname) || !/test/i.test(parsed.pathname)) {
      throw new Error("e2e must run against the disposable database (use pnpm test:e2e)");
    }
    pool = new Pool({ connectionString: url, max: 2 });
  }
  return pool;
}

/** Runs a query on the disposable database (the one the app under test uses). */
export async function sql<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const result = await getPool().query(text, params);
  return result.rows as T[];
}

export async function closeDb() {
  await pool?.end();
  pool = undefined;
}

export function uniqueEmail(label = "user"): string {
  return `e2e-${label}-${randomUUID().slice(0, 8)}@example.com`;
}

/** Gives each test its own rate-limit bucket (the app trusts the last X-Forwarded-For hop). */
export function uniqueIp(): string {
  const bytes = randomUUID().replace(/-/g, "");
  const n = (i: number) => (parseInt(bytes.slice(i * 2, i * 2 + 2), 16) % 250) + 1;
  return `10.${n(0)}.${n(1)}.${n(2)}`;
}

export async function addPassword(userId: string, password = PASSWORD) {
  await sql(
    `INSERT INTO account (id, "userId", "accountId", "providerId", password, "updatedAt")
     VALUES ($1, $2, $2, 'credential', $3, now())`,
    [randomUUID(), userId, await hashPassword(password)],
  );
}

/** A verified e-mail/password user, created straight in the database. */
export async function createUser(options: { email?: string; name?: string; role?: "STUDENT" | "ADMIN" | "INSTRUCTOR"; password?: string } = {}) {
  const email = options.email ?? uniqueEmail();
  const id = randomUUID();
  await sql(
    `INSERT INTO "user" (id, name, email, "emailVerified", role, "updatedAt")
     VALUES ($1, $2, $3, true, $4::"Role", now())`,
    [id, options.name ?? "E2E Learner", email, options.role ?? "STUDENT"],
  );
  const password = options.password ?? PASSWORD;
  await addPassword(id, password);
  return { id, email, password };
}
