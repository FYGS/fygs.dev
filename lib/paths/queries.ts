import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { PathLevel, PathSort } from "./rules";
import { displayedCourseMinutes } from "@/lib/format-duration";

export interface PathCourseView {
  courseId: string;
  order: number;
  optional: boolean;
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  level: PathLevel;
  accessTier: "FREE" | "PREMIUM";
  price: number | null;
  /** Unpublished since it was added to the path */
  available: boolean;
  lessonsCount: number;
  /** Sum of the published lessons, in minutes (lesson durations are stored in seconds). */
  minutes: number;
}

export interface PathSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  level: PathLevel;
  objectives: string[];
  featured: boolean;
  published: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
  /** Courses that can be taken today */
  courseCount: number;
  requiredCount: number;
  minutes: number;
}

export interface PathDetail extends PathSummary {
  courses: PathCourseView[];
}

const courseSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  thumbnail: true,
  level: true,
  accessTier: true,
  price: true,
  published: true,
  duration: true,
} satisfies Prisma.CourseSelect;

type PathRow = Prisma.PathGetPayload<{
  include: { courses: { include: { course: { select: typeof courseSelect } } } };
}>;

async function lessonTotals(courseIds: string[]) {
  const rows =
    courseIds.length === 0
      ? []
      : await db.lesson.groupBy({
          by: ["courseId"],
          where: { courseId: { in: courseIds }, published: true },
          _sum: { duration: true },
          _count: { _all: true },
        });
  // Lesson.duration is in seconds: the totals are given in minutes
  return new Map(rows.map((r) => [r.courseId, { minutes: Math.round((r._sum.duration ?? 0) / 60), lessons: r._count._all }]));
}

function toDetail(row: PathRow, totals: Map<string, { minutes: number; lessons: number }>): PathDetail {
  const courses: PathCourseView[] = [...row.courses]
    .sort((a, b) => a.order - b.order)
    .map((pc) => {
      const t = totals.get(pc.courseId);
      return {
        courseId: pc.courseId,
        order: pc.order,
        optional: pc.optional,
        slug: pc.course.slug,
        title: pc.course.title,
        description: pc.course.description,
        thumbnail: pc.course.thumbnail,
        level: pc.course.level,
        accessTier: pc.course.accessTier,
        price: pc.course.price === null ? null : Number(pc.course.price),
        available: pc.course.published,
        lessonsCount: t?.lessons ?? 0,
        minutes: displayedCourseMinutes(t?.minutes ?? 0, pc.course.duration),
      };
    });
  const available = courses.filter((c) => c.available);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    thumbnail: row.thumbnail,
    level: row.level,
    objectives: row.objectives ?? [],
    featured: row.featured,
    published: row.published,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    courseCount: available.length,
    requiredCount: available.filter((c) => !c.optional).length,
    minutes: available.reduce((sum, c) => sum + c.minutes, 0),
    courses,
  };
}

const include = { courses: { include: { course: { select: courseSelect } } } } as const;

async function hydrate(rows: PathRow[]): Promise<PathDetail[]> {
  const totals = await lessonTotals([...new Set(rows.flatMap((r) => r.courses.map((c) => c.courseId)))]);
  return rows.map((r) => toDetail(r, totals));
}

export interface ListPathsFilters {
  q?: string;
  level?: PathLevel;
  sort?: PathSort;
}

/** Search text from the URL: bounded, and the LIKE wildcards neutralised (`contains` passes `%` and `_` through). */
export const searchText = (q: string | undefined) =>
  (q ?? "")
    .trim()
    .slice(0, 100)
    .replace(/[\\%_]/g, (character) => `\\${character}`);

/** Published paths for the public catalog. */
export async function listPublishedPaths(filters: ListPathsFilters = {}): Promise<PathDetail[]> {
  const q = searchText(filters.q);
  const rows = await db.path.findMany({
    where: {
      published: true,
      ...(filters.level && { level: filters.level }),
      ...(q && {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      }),
    },
    include,
  });
  const paths = (await hydrate(rows)).filter((p) => p.courseCount > 0);
  const byTitle = (a: PathDetail, b: PathDetail) => a.title.localeCompare(b.title, "fr");
  const time = (p: PathDetail) => (p.publishedAt ?? p.updatedAt).getTime();
  switch (filters.sort ?? "featured") {
    case "recent":
      return paths.sort((a, b) => time(b) - time(a));
    case "title":
      return paths.sort(byTitle);
    case "courses":
      return paths.sort((a, b) => b.courseCount - a.courseCount || byTitle(a, b));
    default:
      return paths.sort((a, b) => Number(b.featured) - Number(a.featured) || time(b) - time(a));
  }
}

export async function getPublishedPath(slug: string): Promise<PathDetail | null> {
  const row = await db.path.findFirst({ where: { slug, published: true }, include });
  return row ? (await hydrate([row]))[0] : null;
}

/** Any path, draft or not: for the back office. */
export async function getPathById(id: string): Promise<PathDetail | null> {
  const row = await db.path.findUnique({ where: { id }, include });
  return row ? (await hydrate([row]))[0] : null;
}

/** Published paths a course belongs to (for the badges on the course page). */
export async function listPathsOfCourse(courseId: string) {
  return db.path.findMany({
    where: { published: true, courses: { some: { courseId } } },
    select: { id: true, slug: true, title: true, level: true, _count: { select: { courses: true } } },
    orderBy: [{ featured: "desc" }, { title: "asc" }],
  });
}
