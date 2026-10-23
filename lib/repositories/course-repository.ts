import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/browser";

// Centralized DB access for course domain.
// WARNING: This is an initial scaffold; more methods (updates, stats, recommendations) will be added progressively.

export interface ListCoursesFilters {
  category?: string;
  level?: string;
  search?: string;
  featuredOnly?: boolean;
  publishedOnly?: boolean;
  limit?: number;
}

export type CatalogSort = "relevance" | "recent" | "popular" | "title";
export const CATALOG_SORTS: readonly CatalogSort[] = ["relevance", "recent", "popular", "title"];
export const CATALOG_PAGE_SIZE = 12;

export interface CatalogFilters {
  category?: string;
  level?: string;
  search?: string;
  sort?: CatalogSort;
  page?: number;
}

export const COURSE_TAG_FEATURED = "featured-courses";
export const COURSE_TAG_LIST = "courses"; // generic list tag
export const COURSE_TAG_RECOMMENDATIONS = "recommendations"; // generic recommendations tag (non-personalized)

export class CourseRepository {
  static baseIncludes() {
    return {
      tags: {
        include: { tag: true },
      },
      enrollments: { select: { id: true } },
      reviews: { select: { rating: true } },
      lessons: {
        where: { published: true },
        orderBy: { order: "asc" },
        select: { slug: true },
        take: 1,
      },
    } as const;
  }

  static async findFeatured(limit = 6) {
    try {
      const courses = await db.course.findMany({
        where: { published: true, featured: true },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          thumbnail: true,
          price: true,
          level: true,
          category: true,
          duration: true,
          featured: true,
          published: true,
          accessTier: true,
          previewEnabled: true,
          createdAt: true,
          updatedAt: true,
          tags: {
            include: { tag: true },
          },
          enrollments: { select: { id: true } },
          reviews: { select: { rating: true } },
          lessons: {
            where: { published: true },
            orderBy: { order: "asc" as const },
            select: {
              slug: true,
              order: true,
            },
            take: 1,
          },
          instructor: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        take: limit,
      });
      return courses;
    } catch (error) {
      console.error("[CourseRepository.findFeatured] DB query failed:", error);
      return [];
    }
  }

  /** One page of the public catalogue (published courses), with the total for the pager. */
  static async listPage(filters: CatalogFilters) {
    const { category, level, search, sort = "relevance" } = filters;
    const page = Math.max(1, Math.floor(filters.page ?? 1));
    const where: Prisma.CourseWhereInput = {
      published: true,
      ...(category && { category: category as any }),
      ...(level && { level: level as any }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
    };
    const orderBy: Prisma.CourseOrderByWithRelationInput[] =
      sort === "recent"
        ? [{ createdAt: "desc" }]
        : sort === "popular"
          ? [{ enrollments: { _count: "desc" } }, { createdAt: "desc" }]
          : sort === "title"
            ? [{ title: "asc" }]
            : [{ featured: "desc" }, { createdAt: "desc" }];

    const [total, items] = await Promise.all([
      db.course.count({ where }),
      db.course.findMany({
        where,
        orderBy: [...orderBy, { id: "asc" }],
        skip: (page - 1) * CATALOG_PAGE_SIZE,
        take: CATALOG_PAGE_SIZE,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          thumbnail: true,
          price: true,
          level: true,
          category: true,
          duration: true,
          featured: true,
          accessTier: true,
          previewEnabled: true,
          tags: { include: { tag: true } },
          reviews: { select: { rating: true } },
          _count: { select: { enrollments: true } },
        },
      }),
    ]);
    return { items, total, page, pageCount: Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE)) };
  }

  static async list(filters: ListCoursesFilters) {
    const {
      category,
      level,
      search,
      featuredOnly,
      publishedOnly = true,
      limit,
    } = filters;
    const where: Prisma.CourseWhereInput = {
      ...(publishedOnly && { published: true }),
      ...(featuredOnly && { featured: true }),
      ...(category && { category: category as any }),
      ...(level && { level: level as any }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
          {
            description: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
    };

    return db.course.findMany({
      where,
      include: {
        ...this.baseIncludes(),
        lessons: {
          where: { published: true },
          orderBy: { order: "asc" },
          select: {
            id: true,
            duration: true,
            slug: true,
            order: true,
            moduleId: true,
          },
        },
        modules: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            order: true,
            lessons: {
              where: { published: true },
              orderBy: { order: "asc" },
              select: {
                slug: true,
                order: true,
              },
              take: 1,
            },
          },
        },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      ...(limit ? { take: limit } : {}),
    });
  }
}

// Provide a cached version for featured to reduce DB hits across RSC boundaries
// Cached featured courses with tag-based revalidation
export const getCachedFeaturedCourses = async (limit: number = 6) => {
  try {
    const fn = unstable_cache(
      async () => CourseRepository.findFeatured(limit),
      [`featured-courses-${limit}`],
      { tags: [COURSE_TAG_FEATURED] },
    );
    return await fn();
  } catch (error) {
    console.error("[getCachedFeaturedCourses] Cache/fetch failed:", error);
    return [];
  }
};

// One page of the catalogue, cached under the same broad tag as the list.
export const getCachedCatalogPage = unstable_cache(
  async (filters: CatalogFilters) => CourseRepository.listPage(filters),
  ["courses-catalog-page"],
  { tags: [COURSE_TAG_LIST] },
);

// Cached course list (basic filters). We purposely keep a broad tag so any mutation revalidates all lists.
export const getCachedCourseList = unstable_cache(
  async (filters: ListCoursesFilters) => {
    return CourseRepository.list(filters);
  },
  ["courses-list"],
  { tags: [COURSE_TAG_LIST] },
);
