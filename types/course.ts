// Unified course and related data transfer types.
// These are presentation-friendly DTO-level types decoupled from Prisma.

export interface CourseTagDTO {
  id: string;
  name: string;
  color: string;
}

export interface CourseModuleDTO {
  id: string;
  title: string;
  slug: string;
  order: number;
  courseId: string;
  lessons: CourseLessonDTO[];
}

export interface CourseLessonDTO {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  duration: number | null;
  order: number;
  moduleId: string | null;
}

export interface CourseReviewDTO {
  id: string;
  userId: string;
  courseId: string;
  rating: number;
  comment: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  user: {
    name: string;
    image: string | null;
  };
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

// The correct option and the explanation are never part of this DTO: they stay
// on the server and are returned by checkQuizAnswer once the user has answered.
export interface CourseQuizQuestionDTO {
  id: string;
  question: string;
  options: string[];
  order: number;
}

export interface CourseQuizDTO {
  id: string;
  moduleId: number;
  title: string;
  questions: CourseQuizQuestionDTO[];
}

export interface CourseVisualSupportDTO {
  id: string;
  title: string;
  moduleId: number;
  order: number;
  content: any; // JSON content
}

export interface CourseDetailDTO extends CourseSummaryDTO {
  lessons: CourseLessonDTO[];
  modules: CourseModuleDTO[];
  quizzes?: CourseQuizDTO[];
  visualSupports?: CourseVisualSupportDTO[];
  reviews: CourseReviewDTO[];
  enrollments?: { id: string; userId?: string; enrolledAt?: string }[];
  publicStructure?: string | null;
  publicResources?: string | null;
  publicEvaluation?: string | null;
  publicPrerequisites?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type FeaturedCourseDTO = CourseSummaryDTO; // semantic alias
