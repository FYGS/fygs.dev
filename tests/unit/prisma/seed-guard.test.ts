import { describe, expect, it } from "vitest";
import { assertSeedAllowed, databaseName, seedRefusal } from "../../../prisma/seed-guard";

const LOCAL = "postgresql://postgres:password@localhost:5432/fygs_test";
const REMOTE = "postgresql://app:pw@db.example.org:5432/fygs";

describe("the seed only runs where demo accounts are harmless", () => {
  it("runs on a local database outside production", () => {
    expect(seedRefusal({ DATABASE_URL: LOCAL })).toBeNull();
    expect(seedRefusal({ DATABASE_URL: LOCAL, NODE_ENV: "development" })).toBeNull();
    expect(seedRefusal({ DATABASE_URL: "postgresql://u:p@127.0.0.1/x", NODE_ENV: "test" })).toBeNull();
    expect(seedRefusal({ DATABASE_URL: "postgresql://u:p@[::1]:5432/x" })).toBeNull();
  });

  it("refuses production, even on a local host", () => {
    expect(seedRefusal({ DATABASE_URL: LOCAL, NODE_ENV: "production" })).toMatch(/NODE_ENV=production/);
  });

  it("refuses a database that is not local", () => {
    expect(seedRefusal({ DATABASE_URL: REMOTE })).toMatch(/db\.example\.org/);
    expect(seedRefusal({ DATABASE_URL: REMOTE, NODE_ENV: "production" })).toMatch(/NODE_ENV=production and host/);
  });

  it("refuses without a usable DATABASE_URL", () => {
    expect(seedRefusal({})).toMatch(/DATABASE_URL/);
    expect(seedRefusal({ DATABASE_URL: "not a url" })).toMatch(/DATABASE_URL/);
  });

  it("needs BOTH variables, and the exact database name, to seed a real one on purpose", () => {
    expect(seedRefusal({ DATABASE_URL: REMOTE, SEED_ALLOW_PROD: "1" })).not.toBeNull();
    expect(seedRefusal({ DATABASE_URL: REMOTE, SEED_CONFIRM_DATABASE: "fygs" })).not.toBeNull();
    expect(seedRefusal({ DATABASE_URL: REMOTE, SEED_ALLOW_PROD: "1", SEED_CONFIRM_DATABASE: "other" })).not.toBeNull();
    expect(seedRefusal({ DATABASE_URL: REMOTE, SEED_ALLOW_PROD: "true", SEED_CONFIRM_DATABASE: "fygs" })).not.toBeNull();
    expect(seedRefusal({ DATABASE_URL: REMOTE, NODE_ENV: "production", SEED_ALLOW_PROD: "1", SEED_CONFIRM_DATABASE: "fygs" })).toBeNull();
  });

  it("tells how to do it on purpose, with the database name", () => {
    expect(seedRefusal({ DATABASE_URL: REMOTE })).toMatch(/SEED_ALLOW_PROD=1 and SEED_CONFIRM_DATABASE=fygs/);
  });

  it("throws, which stops prisma/seed.ts before it connects", () => {
    expect(() => assertSeedAllowed({ DATABASE_URL: REMOTE })).toThrow(/Refusing to seed/);
    expect(() => assertSeedAllowed({ DATABASE_URL: LOCAL })).not.toThrow();
  });

  it("reads the database name", () => {
    expect(databaseName(REMOTE)).toBe("fygs");
    expect(databaseName(undefined)).toBe("");
  });
});
