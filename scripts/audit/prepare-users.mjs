// Gives a password to seeded users so the accessibility audit can sign in as them.
// Usage: DATABASE_URL=<disposable test database> node scripts/audit/prepare-users.mjs
// Prints one `role|email|password` line per user: the admin, the most active student, an instructor.
// Refuses any database that is not local and named "test" (the seed's users are fake, but the habit matters).
import { randomUUID } from "node:crypto";

import { hashPassword } from "better-auth/crypto";
import pg from "pg";

const url = process.env.DATABASE_URL;
const parsed = url ? new URL(url) : null;
if (!parsed || !["localhost", "127.0.0.1"].includes(parsed.hostname) || !/test/i.test(parsed.pathname)) {
  throw new Error("Refusing to run: DATABASE_URL must be the local disposable test database");
}

export const AUDIT_PASSWORD = "Audit-Passw0rd!x";
const pool = new pg.Pool({ connectionString: url, max: 2 });

async function withPassword(user) {
  const [existing] = (await pool.query(`SELECT 1 FROM account WHERE "userId" = $1 AND "providerId" = 'credential'`, [user.id])).rows;
  if (!existing) {
    await pool.query(
      `INSERT INTO account (id, "userId", "accountId", "providerId", password, "updatedAt") VALUES ($1, $2, $2, 'credential', $3, now())`,
      [randomUUID(), user.id, await hashPassword(AUDIT_PASSWORD)],
    );
  }
  console.log(`${user.role}|${user.email}|${AUDIT_PASSWORD}`);
}

const pick = async (sql) => (await pool.query(sql)).rows[0];

const admin = await pick(`SELECT id, email, role FROM "user" WHERE role = 'ADMIN' ORDER BY "createdAt" LIMIT 1`);
const student = await pick(`
  SELECT u.id, u.email, u.role FROM "user" u
  JOIN "Enrollment" e ON e."userId" = u.id
  WHERE u.role = 'STUDENT'
  GROUP BY u.id ORDER BY count(*) DESC, u.email LIMIT 1`);
const instructor = await pick(`SELECT id, email, role FROM "user" WHERE role = 'INSTRUCTOR' ORDER BY "createdAt" LIMIT 1`);

for (const user of [admin, student, instructor]) if (user) await withPassword(user);
await pool.end();
