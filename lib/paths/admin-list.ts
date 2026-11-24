import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { searchText } from "./queries";

export const PATH_PAGE_SIZE = 25;

export interface AdminPathRow {
  id: string;
  slug: string;
  title: string;
  level: string;
  published: boolean;
  featured: boolean;
  courseCount: number;
  enrollmentCount: number;
  certificateCount: number;
  updatedAt: Date;
}

export interface AdminPathPage {
  rows: AdminPathRow[];
  total: number;
  page: number;
  pages: number;
  pageSize: number;
}

export async function listAdminPaths(query: { q?: string; status?: string; page?: number }): Promise<AdminPathPage> {
  const q = searchText(query.q);
  const where: Prisma.PathWhereInput = {
    ...(query.status === "published" && { published: true }),
    ...(query.status === "draft" && { published: false }),
    ...(q && { OR: [{ title: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }] }),
  };
  const total = await db.path.count({ where });
  const pages = Math.max(1, Math.ceil(total / PATH_PAGE_SIZE));
  const page = Math.min(Math.max(1, Math.floor(query.page || 1)), pages);
  const rows = await db.path.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * PATH_PAGE_SIZE,
    take: PATH_PAGE_SIZE,
    select: {
      id: true,
      slug: true,
      title: true,
      level: true,
      published: true,
      featured: true,
      updatedAt: true,
      _count: { select: { courses: true, enrollments: true, certificates: true } },
    },
  });
  return {
    rows: rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      level: r.level,
      published: r.published,
      featured: r.featured,
      courseCount: r._count.courses,
      enrollmentCount: r._count.enrollments,
      certificateCount: r._count.certificates,
      updatedAt: r.updatedAt,
    })),
    total,
    page,
    pages,
    pageSize: PATH_PAGE_SIZE,
  };
}
