import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * Serialises work on one logical object inside a transaction: the lock is held until the transaction ends, and a second
 * transaction asking for the same key waits. Used where a rule reads state and then writes (sittings of an exam or a quiz,
 * completions of a learner): without it two parallel requests both read "allowed" and both write.
 */
export async function advisoryLock(tx: Prisma.TransactionClient, key: string): Promise<void> {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key}, 0))`;
}
