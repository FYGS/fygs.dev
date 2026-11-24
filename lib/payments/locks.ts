import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * The purchase lock: what makes "refund" and "earn a certificate" mutually exclusive, and what serialises two
 * checkouts of the same buyer.
 *
 * It is a PostgreSQL transaction-level advisory lock taken on the BUYER (not on the course): a subscription refund
 * concerns every course the learner followed, and a learner has few purchases, so one lock per user costs nothing and
 * cannot be forgotten for one product. `courseId` is accepted so call sites read as what they protect; it is part of
 * the log context only.
 *
 *   await withPurchaseLock(userId, courseId, async (tx) => {
 *     // read the purchase and the certificate, decide, write, all under the lock
 *   });
 *
 * Whoever holds the lock sees the committed state of the previous holder. The refund holds it across the Stripe call
 * (a failure rolls everything back); certificate issuance takes it before checking that the learner is still entitled.
 * Exactly one of the two wins: a certificate issued first makes the refund refuse, a refund committed first makes
 * issuance find no entitlement.
 */

/** Transaction options: the lock is held across a Stripe call, so the default 5 s is too short. */
export const PURCHASE_LOCK_OPTIONS = { maxWait: 10_000, timeout: 45_000 } as const;

export async function withPurchaseLock<T>(
  userId: string,
  courseId: string | null,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`purchase:${userId}`}, 0))`;
    return fn(tx);
  }, PURCHASE_LOCK_OPTIONS);
}
