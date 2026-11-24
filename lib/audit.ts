import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { logger } from "@/lib/structured-logger";

/**
 * Append-only trail of privileged actions: who did what to which object. Call it for role changes, bans, access grants
 * and removals, refunds, publication and deletion of courses and paths, account erasure, moderation decisions, two-factor
 * changes, sign-in policy changes.
 *
 * Pass the transaction (`tx`) when the audited change is made in one: the entry is then committed or rolled back with
 * it. Without `tx` the entry is written on its own and a failure is logged loudly instead of blocking the action.
 * Never put secrets or personal data in `metadata` (ids, old and new values of non-personal fields, reasons).
 */

export type AuditAction =
  | "user.role_changed"
  | "user.banned"
  | "user.unbanned"
  | "user.deleted"
  | "user.email_changed"
  | "user.two_factor_enabled"
  | "user.two_factor_disabled"
  | "access.granted"
  | "access.revoked"
  | "course.published"
  | "course.unpublished"
  | "course.deleted"
  | "course.duplicated"
  | "path.published"
  | "path.unpublished"
  | "path.deleted"
  | "payment.refunded"
  | "payment.disputed"
  | "subscription.canceled"
  | "review.moderated"
  | "content.moderated"
  | "tag.changed"
  | "media.deleted";

export interface AuditEntry {
  actorId?: string | null;
  action: AuditAction;
  targetType: string;
  targetId?: string | null;
  metadata?: Prisma.InputJsonValue;
}

export async function writeAudit(entry: AuditEntry, tx?: Prisma.TransactionClient): Promise<void> {
  const data = {
    actorId: entry.actorId ?? null,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId ?? null,
    ...(entry.metadata !== undefined && { metadata: entry.metadata }),
  };
  if (tx) {
    await tx.auditLog.create({ data });
    return;
  }
  try {
    await db.auditLog.create({ data });
  } catch (error) {
    // The action already happened: report the gap where operators look, do not undo the action
    logger.error("audit.write_failed", {
      metadata: { action: entry.action, targetType: entry.targetType, error: error instanceof Error ? error.message : String(error) },
    });
  }
}
