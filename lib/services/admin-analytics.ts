import { db } from "@/lib/db";
import { PaymentStatus } from "@/lib/generated/prisma/client";
import { safeNumber, serializeRevenueData, serializeUserGrowthData } from "@/lib/serialization-utils";

/**
 * The figures of the analytics page and of its CSV export. One place, so the page and the file always agree.
 */

export const ANALYTICS_RANGES = [3, 6, 12] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];
export const DEFAULT_RANGE: AnalyticsRange = 12;

/** The period asked for in the URL; anything else is the default. */
export function parseRange(value: string | null | undefined): AnalyticsRange {
  const months = Number(value);
  return ANALYTICS_RANGES.find((range) => range === months) ?? DEFAULT_RANGE;
}

/** First day of the month `months - 1` months ago: the window covers whole months, the current one included. */
export function windowStart(months: number, now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1));
}

export async function getMonthlySeries(months: AnalyticsRange, now: Date = new Date()) {
  const from = windowStart(months, now);

  const [revenue, signups, before] = await Promise.all([
    db.$queryRaw<Array<{ month: Date; revenue: unknown; transactions: unknown }>>`
      SELECT DATE_TRUNC('month', "createdAt") AS month,
             SUM(amount) AS revenue,
             COUNT(*) AS transactions
      FROM "Payment"
      WHERE status = 'COMPLETED' AND "createdAt" >= ${from}
      GROUP BY 1
      ORDER BY 1 ASC
    `,
    db.$queryRaw<Array<{ month: Date; new_users: unknown }>>`
      SELECT DATE_TRUNC('month', "createdAt") AS month, COUNT(*) AS new_users
      FROM "user"
      WHERE "createdAt" >= ${from}
      GROUP BY 1
      ORDER BY 1 ASC
    `,
    // the accounts that already existed when the window opens: the running total starts from them
    db.user.count({ where: { createdAt: { lt: from } } }),
  ]);

  let running = before;
  const users = signups.map((row) => {
    running += safeNumber(row.new_users);
    return { month: row.month, new_users: row.new_users, total_users: running };
  });

  return {
    revenue: serializeRevenueData(revenue),
    users: serializeUserGrowthData(users),
  };
}

/** A real funnel: each step counts distinct people, and each is contained in the one before it. */
export async function getFunnel() {
  const [signups, learners, payers, certified] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { enrollments: { some: {} } } }),
    db.user.count({ where: { payments: { some: { status: PaymentStatus.COMPLETED } } } }),
    db.user.count({ where: { certificates: { some: {} } } }),
  ]);
  return { signups, learners, payers, certified };
}

const csvCell = (value: string | number) => {
  const text = String(value);
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** One row per month of the window, months without activity included. */
export async function monthlyReportCsv(months: AnalyticsRange, now: Date = new Date()): Promise<string> {
  const { revenue, users } = await getMonthlySeries(months, now);
  const key = (date: Date) => date.toISOString().slice(0, 7);
  const revenueBy = new Map(revenue.map((row) => [key(row.month), row]));
  const usersBy = new Map(users.map((row) => [key(row.month), row]));

  const start = windowStart(months, now);
  let total = await db.user.count({ where: { createdAt: { lt: start } } });
  const lines = [["mois", "revenus", "transactions", "nouveaux_utilisateurs", "utilisateurs_total"].join(",")];
  for (let i = 0; i < months; i++) {
    const month = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
    const id = key(month);
    const sales = revenueBy.get(id);
    const signups = usersBy.get(id);
    total = signups ? signups.total_users : total;
    lines.push(
      [id, (sales?.revenue ?? 0).toFixed(2), sales?.transactions ?? 0, signups?.new_users ?? 0, total].map(csvCell).join(","),
    );
  }
  return lines.join("\n") + "\n";
}

/** The headline figures: this month, and the month before it so the page can show a real change. */
export async function getOverview(now: Date = new Date()) {
  const thisMonth = windowStart(1, now);
  const lastMonth = windowStart(2, now);
  const settled = { status: PaymentStatus.COMPLETED };

  const [total, current, previous, usersNow, usersBefore, enrollNow, enrollBefore] = await Promise.all([
    db.payment.aggregate({ where: settled, _sum: { amount: true } }),
    db.payment.aggregate({ where: { ...settled, createdAt: { gte: thisMonth } }, _sum: { amount: true } }),
    db.payment.aggregate({ where: { ...settled, createdAt: { gte: lastMonth, lt: thisMonth } }, _sum: { amount: true } }),
    db.user.count({ where: { createdAt: { gte: thisMonth } } }),
    db.user.count({ where: { createdAt: { gte: lastMonth, lt: thisMonth } } }),
    db.enrollment.count({ where: { enrolledAt: { gte: thisMonth } } }),
    db.enrollment.count({ where: { enrolledAt: { gte: lastMonth, lt: thisMonth } } }),
  ]);

  return {
    totalRevenue: safeNumber(total._sum.amount),
    monthlyRevenue: safeNumber(current._sum.amount),
    previousRevenue: safeNumber(previous._sum.amount),
    monthlyUsers: usersNow,
    previousUsers: usersBefore,
    monthlyEnrollments: enrollNow,
    previousEnrollments: enrollBefore,
  };
}
