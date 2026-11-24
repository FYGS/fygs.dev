import { db } from "@/lib/db";

/**
 * Durable claims on Stripe events, in the database (`ProcessedStripeEvent`).
 *
 * Stripe delivers at least once and retries any non-2xx answer for days. A claim says "this event id is being, or has
 * been, processed":
 *  - the first delivery inserts the row with a short LEASE and processes the event, then marks it DONE;
 *  - a redelivery of a DONE event is acknowledged without reprocessing;
 *  - a redelivery while the first is still running is refused (409): Stripe retries later, and if the first process
 *    crashed in the meantime its lease expires and the retry takes the event over. The event is therefore never
 *    acknowledged without having been processed (the failure of an in-memory/Redis claim with a long TTL);
 *  - a handler that fails releases the claim so the retry runs at once.
 *
 * Correctness lives here, in the database. Redis is not involved. Times are computed in the application and passed as
 * parameters (the columns are `timestamp without time zone`: comparing with the server clock would depend on its zone).
 */

export const EVENT_LEASE_MS = 5 * 60 * 1000;
const RETENTION_MS = 35 * 24 * 60 * 60 * 1000;

export type ClaimResult =
  /** Process the event. */
  | { state: "claimed" }
  /** Already processed: acknowledge without doing anything. */
  | { state: "duplicate" }
  /** Another delivery is processing it right now: answer with an error so that Stripe retries. */
  | { state: "in_progress" };

export async function claimEvent(eventId: string, type: string, now: Date = new Date()): Promise<ClaimResult> {
  const leaseUntil = new Date(now.getTime() + EVENT_LEASE_MS);

  // One statement: insert, or take over a PROCESSING row whose lease expired. DONE rows and live leases are untouched.
  const taken = await db.$queryRaw<{ id: string }[]>`
    INSERT INTO "ProcessedStripeEvent" ("id", "type", "status", "leaseUntil", "createdAt", "updatedAt")
    VALUES (${eventId}, ${type}, 'PROCESSING'::"ProcessedEventStatus", ${leaseUntil}, ${now}, ${now})
    ON CONFLICT ("id") DO UPDATE
      SET "leaseUntil" = ${leaseUntil}, "updatedAt" = ${now}
      WHERE "ProcessedStripeEvent"."status" = 'PROCESSING'::"ProcessedEventStatus"
        AND "ProcessedStripeEvent"."leaseUntil" < ${now}
    RETURNING "id"`;
  if (taken.length > 0) return { state: "claimed" };

  const existing = await db.processedStripeEvent.findUnique({ where: { id: eventId }, select: { status: true } });
  if (existing?.status === "DONE") return { state: "duplicate" };
  // PROCESSING with a live lease (or the row vanished between the two statements: a retry will sort it out)
  return { state: "in_progress" };
}

/** The event was processed: later deliveries are acknowledged. Also forgets very old events. */
export async function completeEvent(eventId: string, now: Date = new Date()): Promise<void> {
  await db.processedStripeEvent.updateMany({
    where: { id: eventId },
    data: { status: "DONE", leaseUntil: now },
  });
  if (Math.random() < 0.02) {
    await db.processedStripeEvent
      .deleteMany({ where: { status: "DONE", createdAt: { lt: new Date(now.getTime() - RETENTION_MS) } } })
      .catch(() => undefined);
  }
}

/** The handler failed: let the next delivery process the event immediately. */
export async function releaseEvent(eventId: string): Promise<void> {
  await db.processedStripeEvent.deleteMany({ where: { id: eventId, status: "PROCESSING" } });
}
