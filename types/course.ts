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
}

export type FeaturedCourseDTO = CourseSummaryDTO; // semantic alias
