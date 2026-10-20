import { db } from "@/lib/db";
import {
  PaymentKind,
  PaymentStatus,
  ReviewStatus,
  Role,
  SubscriptionStatus,
  type Prisma,
} from "@/lib/generated/prisma/browser";

/**
 * Read-only listings for the back office: payments, subscriptions, enrollments, certificates.
 * Plain, paginated queries on the real tables; filters come from the URL, so every value is
 * checked against what the schema allows and anything else is ignored.
 */

export const PAGE_SIZE = 25;

export interface Page<T> {
  rows: T[];
  total: number;
  page: number;
  pages: number;
  pageSize: number;
}

export interface ListQuery {
  page?: number;
  /** Matches the person (name or e-mail) */
  q?: string;
  status?: string;
  kind?: string;
}

const clampPage = (page: number | undefined, pages: number) => Math.min(Math.max(1, Math.floor(page || 1)), Math.max(1, pages));

function pageOf<T>(rows: T[], total: number, requested: number): Page<T> {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return { rows, total, page: requested, pages, pageSize: PAGE_SIZE };
}

const oneOf = <T extends string>(allowed: readonly T[], value: string | undefined): T | undefined =>
  allowed.find((candidate) => candidate === value);

/**
 * The search text, cut to a sane length and with the LIKE wildcards neutralised: Prisma's
 * `contains` hands `%` and `_` to the database as they are, so "%" would match everything.
 */
const trimmed = (q: string | undefined) =>
  (q ?? "")
    .trim()
    .slice(0, 100)
    .replace(/[\\%_]/g, (character) => `\\${character}`);

const personFilter = (q: string): Prisma.UserWhereInput | undefined =>
  q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : undefined;

const person = { select: { id: true, name: true, email: true } } as const;

// ── payments ────────────────────────────────────────────────────────────────

export const PAYMENT_STATUSES = Object.values(PaymentStatus);
export const PAYMENT_KINDS = Object.values(PaymentKind);

export interface PaymentRow {
  id: string;
  createdAt: Date;
  user: { id: string; name: string; email: string };
  kind: PaymentKind;
  status: PaymentStatus;
  amount: number;
  currency: string;
  courseTitle: string | null;
  stripeReference: string | null;
}

export interface PaymentTotals {
  /** Settled payments, minus nothing: refunds are counted apart */
  collected: number;
  refunded: number;
  pending: number;
  failed: number;
}

export async function listPayments(query: ListQuery): Promise<Page<PaymentRow> & { totals: PaymentTotals }> {
  const q = trimmed(query.q);
  const status = oneOf(PAYMENT_STATUSES, query.status);
  const kind = oneOf(PAYMENT_KINDS, query.kind);
  const where: Prisma.PaymentWhereInput = {
    ...(status ? { status } : {}),
    ...(kind ? { kind } : {}),
    ...(q ? { user: personFilter(q) } : {}),
  };

  const total = await db.payment.count({ where });
  const requested = clampPage(query.page, Math.ceil(total / PAGE_SIZE));

  const [rows, sums] = await Promise.all([
    db.payment.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (requested - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        createdAt: true,
        kind: true,
        status: true,
        amount: true,
        currency: true,
        stripePaymentIntentId: true,
        user: person,
        course: { select: { title: true } },
      },
    }),
    // the totals describe the whole filtered set, not the page
    db.payment.groupBy({ by: ["status"], where, _sum: { amount: true } }),
  ]);

  const sum = (wanted: PaymentStatus) => Number(sums.find((entry) => entry.status === wanted)?._sum.amount ?? 0);
  return {
    ...pageOf(
      rows.map((row) => ({
        id: row.id,
        createdAt: row.createdAt,
        user: row.user,
        kind: row.kind,
        status: row.status,
        amount: Number(row.amount),
        currency: row.currency,
        courseTitle: row.course?.title ?? null,
        stripeReference: row.stripePaymentIntentId,
      })),
      total,
      requested,
    ),
    totals: {
      collected: sum(PaymentStatus.COMPLETED),
      refunded: sum(PaymentStatus.REFUNDED),
      pending: sum(PaymentStatus.PENDING),
      failed: sum(PaymentStatus.FAILED),
    },
  };
}

// ── subscriptions ───────────────────────────────────────────────────────────

export const SUBSCRIPTION_STATUSES = Object.values(SubscriptionStatus);

export interface SubscriptionRow {
  id: string;
  user: { id: string; name: string; email: string };
  status: SubscriptionStatus;
  plan: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: Date | null;
  createdAt: Date;
}

export async function listSubscriptions(query: ListQuery): Promise<Page<SubscriptionRow>> {
  const q = trimmed(query.q);
  const status = oneOf(SUBSCRIPTION_STATUSES, query.status);
  const where: Prisma.SubscriptionWhereInput = {
    ...(status ? { status } : {}),
    ...(q ? { user: personFilter(q) } : {}),
  };

  const total = await db.subscription.count({ where });
  const requested = clampPage(query.page, Math.ceil(total / PAGE_SIZE));
  const rows = await db.subscription.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (requested - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      status: true,
      plan: true,
      cancelAtPeriodEnd: true,
      currentPeriodEnd: true,
      createdAt: true,
      user: person,
    },
  });
  return pageOf(rows, total, requested);
}

// ── enrollments ─────────────────────────────────────────────────────────────

export interface EnrollmentRow {
  id: string;
  user: { id: string; name: string; email: string };
  courseTitle: string;
  accessTier: string;
  enrolledAt: Date;
  completedAt: Date | null;
}

export async function listEnrollments(query: ListQuery & { completed?: string }): Promise<Page<EnrollmentRow>> {
  const q = trimmed(query.q);
  const where: Prisma.EnrollmentWhereInput = {
    ...(query.completed === "yes" ? { completedAt: { not: null } } : {}),
    ...(query.completed === "no" ? { completedAt: null } : {}),
    ...(q ? { OR: [{ user: personFilter(q) }, { course: { title: { contains: q, mode: "insensitive" } } }] } : {}),
  };

  const total = await db.enrollment.count({ where });
  const requested = clampPage(query.page, Math.ceil(total / PAGE_SIZE));
  const rows = await db.enrollment.findMany({
    where,
    orderBy: [{ enrolledAt: "desc" }, { id: "desc" }],
    skip: (requested - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      enrolledAt: true,
      completedAt: true,
      user: person,
      course: { select: { title: true, accessTier: true } },
    },
  });
  return pageOf(
    rows.map((row) => ({
      id: row.id,
      user: row.user,
      courseTitle: row.course.title,
      accessTier: row.course.accessTier,
      enrolledAt: row.enrolledAt,
      completedAt: row.completedAt,
    })),
    total,
    requested,
  );
}

// ── certificates ────────────────────────────────────────────────────────────

export interface CertificateRow {
  id: string;
  user: { id: string; name: string; email: string };
  courseTitle: string;
  issuedAt: Date;
}

export async function listCertificates(query: ListQuery): Promise<Page<CertificateRow>> {
  const q = trimmed(query.q);
  const where: Prisma.CertificateWhereInput = q
    ? { OR: [{ user: personFilter(q) }, { course: { title: { contains: q, mode: "insensitive" } } }] }
    : {};

  const total = await db.certificate.count({ where });
  const requested = clampPage(query.page, Math.ceil(total / PAGE_SIZE));
  const rows = await db.certificate.findMany({
    where,
    orderBy: [{ issuedAt: "desc" }, { id: "desc" }],
    skip: (requested - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: { id: true, issuedAt: true, user: person, course: { select: { title: true } } },
  });
  return pageOf(
    rows.map((row) => ({ id: row.id, user: row.user, courseTitle: row.course.title, issuedAt: row.issuedAt })),
    total,
    requested,
  );
}

// ── reviews ─────────────────────────────────────────────────────────────────

export const REVIEW_STATUSES = Object.values(ReviewStatus);
export const REVIEW_RATINGS = ["5", "4", "3", "2", "1"] as const;

export interface ReviewRow {
  id: string;
  createdAt: Date;
  rating: number;
  status: ReviewStatus;
  comment: string | null;
  reportCount: number;
  user: { id: string; name: string; email: string };
  courseTitle: string;
}

export async function listReviews(query: ListQuery & { rating?: string }): Promise<Page<ReviewRow>> {
  const q = trimmed(query.q);
  const status = oneOf(REVIEW_STATUSES, query.status);
  const rating = oneOf(REVIEW_RATINGS, query.rating);
  const where: Prisma.ReviewWhereInput = {
    ...(status ? { status } : {}),
    ...(rating ? { rating: Number(rating) } : {}),
    ...(q
      ? {
          OR: [
            { comment: { contains: q, mode: "insensitive" } },
            { user: personFilter(q) },
            { course: { title: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const total = await db.review.count({ where });
  const requested = clampPage(query.page, Math.ceil(total / PAGE_SIZE));
  const rows = await db.review.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (requested - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      createdAt: true,
      rating: true,
      status: true,
      comment: true,
      reportCount: true,
      user: person,
      course: { select: { title: true } },
    },
  });
  return pageOf(
    rows.map(({ course, ...row }) => ({ ...row, courseTitle: course.title })),
    total,
    requested,
  );
}

// ── users ───────────────────────────────────────────────────────────────────

export const USER_ROLES = Object.values(Role);
export const USER_PLANS = ["premium", "free"] as const;

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  isBanned: boolean;
  createdAt: Date;
  enrollments: number;
  completedLessons: number;
  /** Settled payments, all kinds */
  spent: number;
  premium: boolean;
}

export async function listUsers(query: ListQuery & { role?: string; plan?: string }): Promise<Page<UserRow>> {
  const q = trimmed(query.q);
  const role = oneOf(USER_ROLES, query.role);
  const plan = oneOf(USER_PLANS, query.plan);
  const premiumNow: Prisma.UserWhereInput = { subscriptions: { is: { status: SubscriptionStatus.ACTIVE } } };
  const where: Prisma.UserWhereInput = {
    ...personFilter(q),
    ...(role ? { role } : {}),
    ...(plan === "premium" ? premiumNow : {}),
    ...(plan === "free" ? { NOT: premiumNow } : {}),
  };

  const total = await db.user.count({ where });
  const requested = clampPage(query.page, Math.ceil(total / PAGE_SIZE));
  const users = await db.user.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (requested - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBanned: true,
      createdAt: true,
      subscriptions: { select: { status: true } },
      _count: { select: { enrollments: true, progress: { where: { completed: true } } } },
    },
  });

  const spent = await db.payment.groupBy({
    by: ["userId"],
    where: { userId: { in: users.map((user) => user.id) }, status: PaymentStatus.COMPLETED },
    _sum: { amount: true },
  });
  const spentBy = new Map(spent.map((row) => [row.userId, Number(row._sum.amount ?? 0)]));

  return pageOf(
    users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isBanned: user.isBanned,
      createdAt: user.createdAt,
      enrollments: user._count.enrollments,
      completedLessons: user._count.progress,
      spent: spentBy.get(user.id) ?? 0,
      premium: user.subscriptions?.status === SubscriptionStatus.ACTIVE,
    })),
    total,
    requested,
  );
}
