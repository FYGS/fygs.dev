#!/usr/bin/env node

/**
 * One-off promotion of an existing, verified user to administrator, for the first administrator of a new deployment
 * (the seed is not meant for production).
 *
 *   ADMIN_BOOTSTRAP_EMAIL=you@example.com tsx prisma/bootstrap-admin.ts
 *
 * The person registers and verifies their address in the normal way first; this only changes the role. The administrator
 * must then enrol a second factor (Profil > Sécurité) before the role becomes usable.
 *
 * Break-glass: with ADMIN_BOOTSTRAP_RESET_2FA=1 the second factor of that user is removed (a lost phone with no backup
 * codes). Both operations are written to the audit trail with no actor.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
const reset2fa = process.env.ADMIN_BOOTSTRAP_RESET_2FA === "1";

async function main() {
  if (!email) throw new Error("ADMIN_BOOTSTRAP_EMAIL is not set");
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true, emailVerified: true } });
    if (!user) throw new Error("No user has this address: they must register first");
    if (!user.emailVerified) throw new Error("This address is not verified yet: they must open the verification e-mail first");

    await prisma.$transaction(async (tx) => {
      if (user.role !== "ADMIN") {
        await tx.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
        await tx.auditLog.create({
          data: { action: "user.role_changed", targetType: "user", targetId: user.id, metadata: { from: user.role, to: "ADMIN", via: "bootstrap-admin" } },
        });
      }
      if (reset2fa) {
        await tx.twoFactor.deleteMany({ where: { userId: user.id } });
        await tx.user.update({ where: { id: user.id }, data: { twoFactorEnabled: false } });
        await tx.auditLog.create({
          data: { action: "user.two_factor_disabled", targetType: "user", targetId: user.id, metadata: { via: "bootstrap-admin" } },
        });
      }
    });
    console.log(`Done: ${user.role === "ADMIN" ? "already an administrator" : "promoted to administrator"}${reset2fa ? ", second factor reset" : ""}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
