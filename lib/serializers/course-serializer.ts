import { FeaturedCourseDTO, CourseSummaryDTO, CourseDetailDTO, CourseLessonDTO, CourseReviewDTO } from "@/types/course";

// Pure functions to convert Prisma entities to DTOs.

export function serializeCourseSummary(prismaCourse: any): CourseSummaryDTO {
  const enrollmentCount = prismaCourse.enrollments?.length || 0;
  const avg = prismaCourse.reviews?.length
    ? prismaCourse.reviews.reduce((s: number, r: any) => s + r.rating, 0) / prismaCourse.reviews.length
    : 0;
  return {
    id: prismaCourse.id,
    title: prismaCourse.title,
    slug: prismaCourse.slug,
    description: prismaCourse.description,
    thumbnail: prismaCourse.thumbnail,
    price: prismaCourse.price ? Number(prismaCourse.price) : 0,
    level: prismaCourse.level,
    category: prismaCourse.category,
    duration: prismaCourse.duration ?? null,
    featured: prismaCourse.featured,
    enrollmentCount,
    averageRating: Math.round(avg * 10) / 10,
    tags: (prismaCourse.tags || []).map((t: any) => ({ id: t.tag.id, name: t.tag.name, color: t.tag.color })),
    requiredTier: prismaCourse.accessTier,
    previewEnabled: prismaCourse.previewEnabled,
    firstLessonSlug: prismaCourse.lessons?.[0]?.slug || null,
    // Access flags default (will be enriched later)
    isUnlocked: undefined,
    isInSubscription: undefined,
    isEnrolled: undefined,
    hasEntitlement: undefined,
  };
}

export function serializeFeatured(prismaCourse: any): FeaturedCourseDTO {
  return serializeCourseSummary(prismaCourse);
}

export function serializeCourseDetail(prismaCourse: any): CourseDetailDTO {
  const base = serializeCourseSummary(prismaCourse);
  const lessons: CourseLessonDTO[] = (prismaCourse.lessons || []).map((l: any) => ({
    id: l.id,
    title: l.title,
    slug: l.slug,
    description: l.description ?? null,
    duration: l.duration ?? null,
    order: l.order,
  }));
  const reviews: CourseReviewDTO[] = (prismaCourse.reviews || []).map((r: any) => ({
    id: r.id,
    userId: r.userId,
    courseId: r.courseId,
    rating: r.rating,
    comment: r.comment || null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    user: {
      name: r.user?.name || "Utilisateur anonyme",
      image: r.user?.image || null,
    },
  }));
  return {
    ...base,
    lessons,
    reviews,
    createdAt: prismaCourse.createdAt.toISOString(),
    updatedAt: prismaCourse.updatedAt.toISOString(),
  };
}
