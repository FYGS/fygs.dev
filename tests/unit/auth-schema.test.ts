import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { getAuthTables } from "better-auth/db";

vi.mock("@/lib/db", () => ({ db: {} }));

import { auth } from "@/lib/auth";

// better-auth stores users, sessions, accounts and verifications through Prisma:
// after an upgrade, every column it expects must still exist in schema.prisma.
describe("better-auth tables match the Prisma schema", () => {
  const schema = readFileSync("prisma/schema.prisma", "utf8");

  const model = (name: string) => {
    const blocks = [...schema.matchAll(/model (\w+) \{([\s\S]*?)\n\}/g)];
    const found = blocks.find(
      ([, n, body]) => n.toLowerCase() === name.toLowerCase() || body.includes(`@@map("${name}")`),
    );
    return found ? found[2] : "";
  };

  for (const [key, table] of Object.entries(getAuthTables(auth.options))) {
    it(`${key}`, () => {
      const body = model(table.modelName);
      expect(body, `model ${table.modelName} missing`).not.toBe("");
      for (const [field, def] of Object.entries(table.fields)) {
        const column = (def as { fieldName?: string }).fieldName ?? field;
        expect(body, `${table.modelName}.${column}`).toMatch(new RegExp(`^\\s*${column}\\s`, "m"));
      }
    });
  }
});
