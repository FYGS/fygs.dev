import { db } from "@/lib/db";
import { Role } from "@/lib/generated/prisma/client";

/**
 * Changes to another account made by an administrator: its role, and its ban from the community.
 * The rules live here so every entry point (back-office pages, community moderation) applies the same ones.
 */

export const ASSIGNABLE_ROLES = [Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN] as const;

export type UserAdminError =
  | "INVALID_ROLE"
  | "NOT_FOUND"
  /** An administrator cannot change their own role or ban themselves: they would lock themselves out */
  | "SELF"
  /** The last administrator cannot be demoted: nobody could manage the platform any more */
  | "LAST_ADMIN"
  /** An administrator account cannot be banned: demote it first */
  | "PROTECTED_ADMIN";

export type UserAdminResult = { ok: true } | { ok: false; code: UserAdminError };

const ADMIN_LOCK = 7_301_001;

export const USER_ADMIN_MESSAGES: Record<UserAdminError, string> = {
  INVALID_ROLE: "Rôle inconnu.",
  NOT_FOUND: "Utilisateur introuvable.",
  SELF: "Vous ne pouvez pas modifier votre propre compte ici.",
  LAST_ADMIN: "C'est le dernier administrateur : il ne peut pas être rétrogradé.",
  PROTECTED_ADMIN: "Un administrateur ne peut pas être suspendu : changez d'abord son rôle.",
};

export async function changeUserRole(actorId: string, targetId: string, role: string): Promise<UserAdminResult> {
  if (!(ASSIGNABLE_ROLES as readonly string[]).includes(role)) return { ok: false, code: "INVALID_ROLE" };
  if (actorId === targetId) return { ok: false, code: "SELF" };

  return db.$transaction(async (tx) => {
    // Two administrators demoting each other at the same time must not leave the platform without one
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${ADMIN_LOCK})`;

    const target = await tx.user.findUnique({ where: { id: targetId }, select: { role: true } });
    if (!target) return { ok: false, code: "NOT_FOUND" } as const;
    if (target.role === role) return { ok: true } as const;

    if (target.role === Role.ADMIN) {
      const otherAdmins = await tx.user.count({ where: { role: Role.ADMIN, id: { not: targetId } } });
      if (otherAdmins === 0) return { ok: false, code: "LAST_ADMIN" } as const;
    }

    await tx.user.update({ where: { id: targetId }, data: { role: role as Role } });
    return { ok: true } as const;
  });
}

export async function setUserBan(actorId: string, targetId: string, banned: boolean): Promise<UserAdminResult> {
  if (actorId === targetId) return { ok: false, code: "SELF" };

  const target = await db.user.findUnique({ where: { id: targetId }, select: { role: true } });
  if (!target) return { ok: false, code: "NOT_FOUND" };
  if (banned && target.role === Role.ADMIN) return { ok: false, code: "PROTECTED_ADMIN" };

  await db.user.update({ where: { id: targetId }, data: { isBanned: banned } });
  return { ok: true };
}
