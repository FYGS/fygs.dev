import { spawnSync } from "node:child_process";
import path from "node:path";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { resetDatabase } from "../../support/test-db";
import { createUser } from "../../support/factories";

/** The first administrator of a new deployment: an existing, verified user is promoted by the script, with a trace. */
const root = path.resolve(__dirname, "../../..");
const tsx = path.join(root, "node_modules", "tsx", "dist", "cli.mjs");

function bootstrap(env: Record<string, string>) {
  const result = spawnSync(process.execPath, [tsx, "prisma/bootstrap-admin.ts"], {
    cwd: root,
    env: { ...process.env, ...env },
    encoding: "utf8",
    timeout: 60_000,
  });
  return { code: result.status, out: `${result.stdout}${result.stderr}` };
}

beforeEach(() => resetDatabase(db));
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

describe("prisma/bootstrap-admin.ts", () => {
  it("promotes a verified user and writes it in the audit trail", async () => {
    const user = await createUser({ email: "boss@example.test" });
    const run = bootstrap({ ADMIN_BOOTSTRAP_EMAIL: "Boss@Example.test " });
    expect(run.code, run.out).toBe(0);
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).role).toBe("ADMIN");
    const [entry] = await db.auditLog.findMany({ where: { targetId: user.id } });
    expect(entry).toMatchObject({ action: "user.role_changed", metadata: { from: "STUDENT", to: "ADMIN", via: "bootstrap-admin" } });
  });

  it("does nothing twice", async () => {
    const user = await createUser({ email: "boss@example.test", role: "ADMIN" });
    expect(bootstrap({ ADMIN_BOOTSTRAP_EMAIL: "boss@example.test" }).code).toBe(0);
    expect(await db.auditLog.count({ where: { targetId: user.id } })).toBe(0);
  });

  it("refuses an unknown address and an address nobody verified", async () => {
    await createUser({ email: "new@example.test", emailVerified: false });
    const unknown = bootstrap({ ADMIN_BOOTSTRAP_EMAIL: "nobody@example.test" });
    expect(unknown.code).toBe(1);
    expect(unknown.out).toMatch(/must register first/);
    const unverified = bootstrap({ ADMIN_BOOTSTRAP_EMAIL: "new@example.test" });
    expect(unverified.code).toBe(1);
    expect(unverified.out).toMatch(/not verified/);
    expect((await db.user.findUniqueOrThrow({ where: { email: "new@example.test" } })).role).toBe("STUDENT");
  });

  it("needs the address", async () => {
    const run = bootstrap({ ADMIN_BOOTSTRAP_EMAIL: "" });
    expect(run.code).toBe(1);
    expect(run.out).toMatch(/ADMIN_BOOTSTRAP_EMAIL/);
  });

  it("break-glass: removes a lost second factor, with a trace", async () => {
    const user = await createUser({ email: "boss@example.test", role: "ADMIN", twoFactorEnabled: true });
    await db.twoFactor.create({ data: { userId: user.id, secret: "s", backupCodes: "b" } });
    const run = bootstrap({ ADMIN_BOOTSTRAP_EMAIL: "boss@example.test", ADMIN_BOOTSTRAP_RESET_2FA: "1" });
    expect(run.code, run.out).toBe(0);
    expect(await db.twoFactor.count({ where: { userId: user.id } })).toBe(0);
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).twoFactorEnabled).toBe(false);
    expect((await db.auditLog.findMany({ where: { targetId: user.id } })).map((a) => a.action)).toEqual(["user.two_factor_disabled"]);
  });
});
