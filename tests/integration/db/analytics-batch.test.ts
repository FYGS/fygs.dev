import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { __resetRateLimitMemory } from "@/lib/rate-limit";
import { resetDatabase } from "../../support/test-db";
import { createUser } from "../../support/factories";

const h = vi.hoisted(() => ({ session: null as { user: { id: string; role: string } } | null }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn(async () => h.session) } } }));
vi.mock("next/headers", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/headers")>()),
  headers: vi.fn(async () => new Headers()),
}));
vi.mock("@/lib/redis", () => ({ default: { eval: vi.fn(async () => { throw new Error("redis down"); }) } }));

import { POST as batch } from "@/app/api/analytics/batch/route";
import { POST as recommendationClick } from "@/app/api/analytics/recommendation-click/route";

const post = (handler: (r: NextRequest) => Promise<Response>, body: unknown, raw?: string) =>
  handler(new NextRequest("http://localhost/api/analytics/x", { method: "POST", headers: { "content-type": "application/json" }, body: raw ?? JSON.stringify(body) }));

beforeEach(async () => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  __resetRateLimitMemory();
  h.session = null;
  await resetDatabase(db);
});
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

describe("POST /api/analytics/batch", () => {
  it("needs a session", async () => {
    expect((await post(batch, { events: [{ type: "COURSE_CARD_VIEWED" }] })).status).toBe(401);
    expect(await db.analyticsEvent.count()).toBe(0);
  });

  it("records interface events for the signed-in user, never money or learning events, never on behalf of someone else", async () => {
    const user = await createUser();
    const victim = await createUser();
    h.session = { user: { id: user.id, role: "STUDENT" } };
    const response = await post(batch, {
      events: [
        { type: "COURSE_CARD_VIEWED", userId: victim.id, context: { courseId: "c1", nested: { a: 1 }, __proto__: { x: 1 } } },
        { type: "COURSE_PURCHASED", context: { amount: 99999, currency: "eur" } },
        { type: "SUBSCRIPTION_STARTED", context: { plan: "yearly" } },
        { type: "REFUND_ISSUED", context: { refundAmount: 5000 } },
        { type: "CERTIFICATE_ISSUED" },
      ],
    });
    expect(await response.json()).toEqual({ ok: true, count: 1 });
    const rows = await db.analyticsEvent.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ userId: user.id, type: "COURSE_CARD_VIEWED", source: "web" });
    expect(JSON.stringify(rows[0].properties)).not.toContain("nested");
    expect(rows[0].properties).toMatchObject({ courseId: expect.any(String) });
  });

  it("refuses a malformed or oversized body", async () => {
    const user = await createUser();
    h.session = { user: { id: user.id, role: "STUDENT" } };
    expect((await post(batch, null, "{not json")).status).toBe(400);
    expect((await post(batch, { events: "nope" })).status).toBe(400);
    const huge = { events: [{ type: "COURSE_CARD_VIEWED", context: { text: "x".repeat(100) } }].concat(Array.from({ length: 2000 }, () => ({ type: "COURSE_CARD_VIEWED", context: { text: "x".repeat(100) } }))) };
    expect((await post(batch, huge)).status).toBe(413);
    expect(await db.analyticsEvent.count()).toBe(0);
  });
});

describe("POST /api/analytics/recommendation-click", () => {
  it("only takes a course id string and a small integer rank", async () => {
    const user = await createUser();
    h.session = { user: { id: user.id, role: "STUDENT" } };
    expect((await post(recommendationClick, { courseId: { $ne: "" }, rank: 1 })).status).toBe(400);
    expect((await post(recommendationClick, { courseId: "x".repeat(100), rank: 1 })).status).toBe(400);
    const ok = await post(recommendationClick, { courseId: "course-1", rank: 10 ** 9 });
    expect(ok.status).toBe(200);
    const [row] = await db.analyticsEvent.findMany();
    expect(row.properties).not.toHaveProperty("rank", 10 ** 9);
  });
});
