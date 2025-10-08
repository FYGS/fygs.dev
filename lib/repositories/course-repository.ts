import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

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
    const courses = await db.course.findMany({
      where: { published: true, featured: true },
      include: this.baseIncludes(),
      orderBy: [{ createdAt: "desc" }],
      take: limit,
    });
    return courses;
  }

  static async findBySlug(slug: string) {
    return db.course.findUnique({
      where: { slug },
      include: {
        ...this.baseIncludes(),
        lessons: {
          where: { published: true },
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            duration: true,
            order: true,
          },
        },
        reviews: {
          select: {
            id: true,
            userId: true,
            courseId: true,
            rating: true,
            comment: true,
            createdAt: true,
            updatedAt: true,
            user: { select: { name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });
  }

  static async list(filters: ListCoursesFilters) {
    const { category, level, search, featuredOnly, publishedOnly = true, limit } = filters;
    return db.course.findMany({
      where: {
        ...(publishedOnly && { published: true }),
        ...(featuredOnly && { featured: true }),
        ...(category && { category: category as any }),
        ...(level && { level: level as any }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        ...this.baseIncludes(),
        lessons: {
          where: { published: true },
          orderBy: { order: "asc" },
          select: { id: true, duration: true, slug: true },
        },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      ...(limit ? { take: limit } : {}),
    });
  }
}

// Provide a cached version for featured to reduce DB hits across RSC boundaries
// Cached featured courses with tag-based revalidation
export const getCachedFeaturedCourses = unstable_cache(
  async (limit: number = 6) => {
    return CourseRepository.findFeatured(limit);
  },
  ["featured-courses"],
  { tags: [COURSE_TAG_FEATURED] }
);

// Cached course list (basic filters). We purposely keep a broad tag so any mutation revalidates all lists.
export const getCachedCourseList = unstable_cache(
  async (filters: ListCoursesFilters) => {
    return CourseRepository.list(filters);
  },
  ["courses-list"],
  { tags: [COURSE_TAG_LIST] }
);
