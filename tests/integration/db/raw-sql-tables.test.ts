import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";

/**
 * Regression: the admin analytics page ran `FROM "User"` in a $queryRaw, but the Prisma
 * model User is mapped to the table "user" (@@map), so the page crashed with
 * `relation "User" does not exist` on a real database. Every table named in a hand-written
 * query must exist in the schema the migrations produce.
 */
const root = path.resolve(__dirname, "../../..");

function sources(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === "generated") continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) sources(full, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(full);
  }
  return out;
}

afterAll(() => db.$disconnect());

describe("hand-written SQL", () => {
  it("only names tables that exist", async () => {
    const tables = new Set(
      (await db.$queryRaw<{ tablename: string }[]>`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`).map(
        (t) => t.tablename,
      ),
    );

    const referenced: { file: string; table: string }[] = [];
    for (const dir of ["app", "lib"]) {
      for (const file of sources(path.join(root, dir))) {
        const src = readFileSync(file, "utf8");
        if (!/\$(queryRaw|executeRaw)/.test(src)) continue;
        for (const m of src.matchAll(/\b(?:FROM|JOIN)\s+"([A-Za-z_]+)"/g)) {
          referenced.push({ file: path.relative(root, file).replace(/\\/g, "/"), table: m[1] });
        }
      }
    }

    expect(referenced.length).toBeGreaterThan(0);
    const missing = referenced.filter((r) => !tables.has(r.table));
    expect(missing).toEqual([]);
  });
});
