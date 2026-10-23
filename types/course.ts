// Unified course and related data transfer types.
// These are presentation-friendly DTO-level types decoupled from Prisma.

export interface CourseTagDTO {
  id: string;
  name: string;
  color: string;
}

export interface CourseSummaryDTO {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: number;
  level: string;
  category: string;
  featured: boolean;
  duration: number | null; // total duration (aggregated) if available
  enrollmentCount: number;
  averageRating: number; // rounded 1 decimal
  tags: CourseTagDTO[];
  requiredTier?: string; // CourseAccessTier enum
  previewEnabled?: boolean;
  // Access flags (optional; enriched by access layer)
  isUnlocked?: boolean; // user can consume lessons fully
  isInSubscription?: boolean; // user has active subscription (Premium) covering this course
  isEnrolled?: boolean; // user explicitly enrolled (lifetime purchase or explicit enrollment action)
  hasEntitlement?: boolean; // user owns via subscription or purchase
  firstLessonSlug?: string | null;
  unlockedLabel?: string;
}

export type FeaturedCourseDTO = CourseSummaryDTO; // semantic alias
