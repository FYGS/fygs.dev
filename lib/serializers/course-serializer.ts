import { FeaturedCourseDTO, CourseSummaryDTO } from "@/types/course";
import { courseMinutesFromLessons, displayedCourseMinutes } from "@/lib/format-duration";

// Pure functions to convert Prisma entities to DTOs.
//
// The input types below are structural: they describe only the fields the
// serializers read, so any Prisma payload (select / include variant) that
// carries them is accepted without importing Prisma payload types here.

/** Fields the summary reads: the published lessons of the course, for its duration (seconds). */
interface SummaryLessonInput {
  duration?: number | null;
}

interface TagInput {
  tag: { id: string; name: string; color: string };
}

export interface CourseSummaryInput {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  /** Prisma Decimal, number or null; converted with Number(). */
  price?: { toString(): string } | number | null;
  level: string;
  category: string;
  duration?: number | null;
  featured: boolean;
  accessTier?: string;
  previewEnabled?: boolean;
  enrollments?: unknown[] | null;
  /** Count of enrolments when the ids were not loaded. */
  _count?: { enrollments: number } | null;
  reviews?: { rating: number }[] | null;
  tags?: TagInput[] | null;
  lessons?: SummaryLessonInput[] | null;
}

export function serializeCourseSummary(
  prismaCourse: CourseSummaryInput,
): CourseSummaryDTO {
  const enrollmentCount = prismaCourse._count?.enrollments ?? prismaCourse.enrollments?.length ?? 0;
  const avg = prismaCourse.reviews?.length
    ? prismaCourse.reviews.reduce((s, r) => s + r.rating, 0) /
      prismaCourse.reviews.length
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
    // Same duration as the course page: the published lessons' total, else the author's estimate
    duration:
      displayedCourseMinutes(courseMinutesFromLessons((prismaCourse.lessons ?? []).map((l) => l.duration ?? null)), prismaCourse.duration) ||
      null,
    featured: prismaCourse.featured,
    enrollmentCount,
    averageRating: Math.round(avg * 10) / 10,
    tags: (prismaCourse.tags || []).map((t) => ({
      id: t.tag.id,
      name: t.tag.name,
      color: t.tag.color,
    })),
    requiredTier: prismaCourse.accessTier,
    previewEnabled: prismaCourse.previewEnabled,
  };
}

export function serializeFeatured(
  prismaCourse: CourseSummaryInput,
): FeaturedCourseDTO {
  return serializeCourseSummary(prismaCourse);
}
