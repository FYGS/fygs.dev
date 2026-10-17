/**
 * Helpers for tests that talk to the disposable PostgreSQL (see scripts/test-db.mjs).
 * DATABASE_URL is set by tests/support/global-setup.ts before any worker starts.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { assertDisposableDatabase } from "../../scripts/test-db.mjs";

/** The connection string of the test database (throws if it is not a disposable one). */
export function testDatabaseUrl(): string {
  const url = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error("No test database: run through `pnpm test:integration`.");
  assertDisposableDatabase(url);
  return url;
}

/** A new Prisma client on the test database; call `$disconnect()` when done. */
export function createTestClient(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: testDatabaseUrl() }),
  });
}

/** Empties every table (keeps the schema). Cheap enough to call in `beforeEach`. */
export async function resetDatabase(client: PrismaClient): Promise<void> {
  assertDisposableDatabase(testDatabaseUrl());
  const tables = await client.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename NOT LIKE '\_prisma%'`;
  if (tables.length === 0) return;
  const list = tables.map((t) => `"public"."${t.tablename}"`).join(", ");
  await client.$executeRawUnsafe(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`);
}
