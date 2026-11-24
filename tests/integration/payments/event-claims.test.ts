import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { claimEvent, completeEvent, EVENT_LEASE_MS, releaseEvent } from "@/lib/payments/event-claims";
import { resetDatabase } from "../../support/test-db";

beforeEach(async () => {
  await resetDatabase(db);
});
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

const T0 = new Date("2030-01-01T10:00:00Z");
const after = (ms: number) => new Date(T0.getTime() + ms);

describe("durable claims on Stripe events", () => {
  it("the first delivery is claimed, a redelivery of a processed event is a duplicate", async () => {
    expect(await claimEvent("evt_1", "invoice.payment_succeeded", T0)).toEqual({ state: "claimed" });
    await completeEvent("evt_1", after(1000));
    expect(await claimEvent("evt_1", "invoice.payment_succeeded", after(2000))).toEqual({ state: "duplicate" });
    // still a duplicate long after the lease: a DONE event is never taken over
    expect(await claimEvent("evt_1", "invoice.payment_succeeded", after(EVENT_LEASE_MS * 10))).toEqual({ state: "duplicate" });
  });

  it("a delivery that arrives while the first is running is refused, so Stripe retries", async () => {
    await claimEvent("evt_2", "charge.refunded", T0);
    expect(await claimEvent("evt_2", "charge.refunded", after(60_000))).toEqual({ state: "in_progress" });
  });

  it("a crash mid-way (no 'done', no release) lets the retry take the event over once the lease expired", async () => {
    await claimEvent("evt_3", "checkout.session.completed", T0);
    expect(await claimEvent("evt_3", "checkout.session.completed", after(EVENT_LEASE_MS - 1))).toEqual({ state: "in_progress" });
    expect(await claimEvent("evt_3", "checkout.session.completed", after(EVENT_LEASE_MS + 1))).toEqual({ state: "claimed" });
    // the new holder has a fresh lease
    expect(await claimEvent("evt_3", "checkout.session.completed", after(EVENT_LEASE_MS + 2))).toEqual({ state: "in_progress" });
  });

  it("a failed handler releases the claim: the retry is processed at once", async () => {
    await claimEvent("evt_4", "customer.subscription.updated", T0);
    await releaseEvent("evt_4");
    expect(await claimEvent("evt_4", "customer.subscription.updated", after(1))).toEqual({ state: "claimed" });
  });

  it("releasing never forgets an event that was processed", async () => {
    await claimEvent("evt_5", "charge.dispute.created", T0);
    await completeEvent("evt_5", after(10));
    await releaseEvent("evt_5");
    expect(await claimEvent("evt_5", "charge.dispute.created", after(20))).toEqual({ state: "duplicate" });
  });

  it("two simultaneous deliveries: exactly one processes the event", async () => {
    const results = await Promise.all(Array.from({ length: 12 }, () => claimEvent("evt_6", "invoice.payment_failed")));
    expect(results.filter((r) => r.state === "claimed")).toHaveLength(1);
    expect(results.filter((r) => r.state === "in_progress")).toHaveLength(11);
  });

  it("different events do not interfere", async () => {
    const [a, b] = await Promise.all([claimEvent("evt_a", "x"), claimEvent("evt_b", "x")]);
    expect([a.state, b.state]).toEqual(["claimed", "claimed"]);
  });
});
