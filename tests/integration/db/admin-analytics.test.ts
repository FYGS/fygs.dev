import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { PaymentKind, PaymentStatus } from "@/lib/generated/prisma/client";
import { getFunnel, getMonthlySeries, getOverview, monthlyReportCsv, parseRange } from "@/lib/services/admin-analytics";
import { percentChange } from "@/lib/percent-change";
import { resetDatabase } from "../../support/test-db";
import { createCourse, createUser, enroll } from "../../support/factories";

const h = vi.hoisted(() => ({ session: null as { user: { id: string; role: string } } | null }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn(async () => h.session) } } }));

import { GET } from "@/app/api/admin/analytics/export/route";

// "now" is mid-October 2026: the 3-month window opens on 1 August
const NOW = new Date("2026-10-15T12:00:00Z");
const at = (iso: string) => new Date(iso);

beforeEach(async () => {
  h.session = null;
  await resetDatabase(db);
});
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

const pay = (userId: string, amount: string, createdAt: Date, status: PaymentStatus = PaymentStatus.COMPLETED) =>
  db.payment.create({ data: { userId, amount, status, kind: PaymentKind.COURSE, createdAt } });

describe("parseRange", () => {
  it("accepts the offered periods and falls back to 12 months for anything else", () => {
    expect([parseRange("3"), parseRange("6"), parseRange("12")]).toEqual([3, 6, 12]);
    for (const bad of [null, undefined, "", "7", "-3", "abc", "12; DROP TABLE"]) expect(parseRange(bad)).toBe(12);
  });
});

describe("percentChange", () => {
  it("is a real comparison, one decimal, and nothing when there is no reference", () => {
    expect(percentChange(150, 100)).toBe(50);
    expect(percentChange(50, 100)).toBe(-50);
    expect(percentChange(100, 100)).toBe(0);
    expect(percentChange(10, 0)).toBeNull();
    expect(percentChange(0, 0)).toBeNull();
    expect(percentChange(1, 3)).toBe(-66.7);
  });
});

describe("getMonthlySeries", () => {
  it("is empty on an empty platform", async () => {
    expect(await getMonthlySeries(3, NOW)).toEqual({ revenue: [], users: [] });
  });

  it("sums settled payments per month inside the window only", async () => {
    const user = await createUser({ createdAt: at("2026-01-10T00:00:00Z") });
    await pay(user.id, "50", at("2026-08-05T10:00:00Z"));
    await pay(user.id, "30", at("2026-08-20T10:00:00Z"));
    await pay(user.id, "100", at("2026-10-02T10:00:00Z"));
    await pay(user.id, "999", at("2026-09-10T10:00:00Z"), PaymentStatus.FAILED); // not settled
    await pay(user.id, "500", at("2026-05-10T10:00:00Z")); // before the window

    const { revenue } = await getMonthlySeries(3, NOW);

    expect(revenue.map((row) => [row.month.toISOString().slice(0, 7), row.revenue, row.transactions])).toEqual([
      ["2026-08", 80, 2],
      ["2026-10", 100, 1],
    ]);
  });

  it("starts the running user total from the accounts that already existed", async () => {
    await createUser({ createdAt: at("2026-01-10T00:00:00Z") });
    await createUser({ createdAt: at("2026-03-10T00:00:00Z") });
    await createUser({ createdAt: at("2026-08-10T00:00:00Z") });
    await createUser({ createdAt: at("2026-10-01T00:00:00Z") });
    await createUser({ createdAt: at("2026-10-09T00:00:00Z") });

    const { users } = await getMonthlySeries(3, NOW);

    expect(users.map((row) => [row.month.toISOString().slice(0, 7), row.new_users, row.total_users])).toEqual([
      ["2026-08", 1, 3],
      ["2026-10", 2, 5],
    ]);
  });
});

describe("getOverview", () => {
  it("compares this month with the previous one", async () => {
    const user = await createUser({ createdAt: at("2026-09-03T00:00:00Z") });
    await createUser({ createdAt: at("2026-10-03T00:00:00Z") });
    await pay(user.id, "40", at("2026-09-12T10:00:00Z"));
    await pay(user.id, "60", at("2026-10-12T10:00:00Z"));
    const course = await createCourse();
    await enroll(user.id, course.id);

    const overview = await getOverview(NOW);

    expect(overview).toMatchObject({
      totalRevenue: 100,
      monthlyRevenue: 60,
      previousRevenue: 40,
      monthlyUsers: 1,
      previousUsers: 1,
    });
  });
});

describe("getFunnel", () => {
  it("counts distinct people at each step", async () => {
    const a = await createUser();
    const b = await createUser();
    await createUser();
    const course = await createCourse();
    const other = await createCourse();
    await enroll(a.id, course.id);
    await enroll(a.id, other.id); // twice: still one person
    await enroll(b.id, course.id);
    await pay(a.id, "10", NOW);
    await pay(a.id, "10", NOW); // twice: still one payer
    await pay(b.id, "10", NOW, PaymentStatus.PENDING); // not settled

    expect(await getFunnel()).toEqual({ signups: 3, learners: 2, payers: 1, certified: 0 });
  });
});

describe("monthlyReportCsv", () => {
  it("has one row per month of the window, empty months included", async () => {
    const user = await createUser({ createdAt: at("2026-08-10T00:00:00Z") });
    await pay(user.id, "49.9", at("2026-10-02T10:00:00Z"));

    const lines = (await monthlyReportCsv(3, NOW)).trim().split("\n");

    expect(lines).toEqual([
      "mois,revenus,transactions,nouveaux_utilisateurs,utilisateurs_total",
      "2026-08,0.00,0,1,1",
      "2026-09,0.00,0,0,1",
      "2026-10,49.90,1,0,1",
    ]);
  });
});

describe("the export route", () => {
  const call = (range = "3") => GET(new Request(`http://localhost/api/admin/analytics/export?range=${range}`));

  it("is closed to visitors and to anyone who is not an administrator", async () => {
    expect((await call()).status).toBe(401);

    h.session = { user: { id: "u1", role: "INSTRUCTOR" } };
    expect((await call()).status).toBe(403);
    h.session = { user: { id: "u2", role: "STUDENT" } };
    expect((await call()).status).toBe(403);
  });

  it("gives an administrator a CSV file named after the period", async () => {
    h.session = { user: { id: "a1", role: "ADMIN" } };

    const response = await call("6");

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/csv");
    expect(response.headers.get("content-disposition")).toContain("fygs-analytics-6-mois.csv");
    expect((await response.text()).split("\n")[0]).toBe("mois,revenus,transactions,nouveaux_utilisateurs,utilisateurs_total");
  });
});
