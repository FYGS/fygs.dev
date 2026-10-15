import {
  FeaturedCourseDTO,
  CourseSummaryDTO,
  CourseDetailDTO,
  CourseLessonDTO,
  CourseReviewDTO,
  CourseModuleDTO,
  CourseQuizDTO,
  CourseVisualSupportDTO,
} from "@/types/course";

// Pure functions to convert Prisma entities to DTOs.
//
// The input types below are structural: they describe only the fields the
// serializers read, so any Prisma payload (select / include variant) that
// carries them is accepted without importing Prisma payload types here.

/** Fields the summary reads; callers often select only a subset of the lesson. */
interface SummaryLessonInput {
  slug: string;
  order?: number;
  moduleId?: string | null;
}

interface SummaryModuleInput {
  order?: number;
  lessons?: SummaryLessonInput[] | null;
}

interface LessonInput extends SummaryLessonInput {
  id: string;
  title: string;
  description?: string | null;
  duration?: number | null;
  order: number;
}

interface ModuleInput extends SummaryModuleInput {
  id: string;
  title: string;
  slug: string;
  order: number;
  courseId: string;
  lessons?: LessonInput[] | null;
}

interface TagInput {
  tag: { id: string; name: string; color: string };
}

interface ReviewInput {
  id: string;
  userId: string;
  courseId: string;
  rating: number;
  comment?: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: { name?: string | null; image?: string | null } | null;
}

interface QuizQuestionInput {
  id: string;
  question: string;
  options: string[];
  order: number;
}

interface QuizInput {
  id: string;
  moduleId: number;
  title: string;
  questions?: QuizQuestionInput[] | null;
}

interface VisualSupportInput {
  id: string;
  title: string;
  moduleId: number;
  order: number;
  content: unknown;
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
  reviews?: { rating: number }[] | null;
  tags?: TagInput[] | null;
  lessons?: SummaryLessonInput[] | null;
  modules?: SummaryModuleInput[] | null;
}

export interface CourseDetailInput extends CourseSummaryInput {
  lessons?: LessonInput[] | null;
  modules?: ModuleInput[] | null;
  reviews?: ReviewInput[] | null;
  quizzes?: QuizInput[] | null;
  visualSupports?: VisualSupportInput[] | null;
  publicStructure?: string | null;
  publicResources?: string | null;
  publicEvaluation?: string | null;
  publicPrerequisites?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// An absent `order` (field not selected) compares as 0, which leaves the array
// order untouched, same as the previous `undefined - undefined` (NaN) comparator.
const byOrder = (a: { order?: number }, b: { order?: number }) =>
  (a.order ?? 0) - (b.order ?? 0);

export function serializeCourseSummary(
  prismaCourse: CourseSummaryInput,
): CourseSummaryDTO {
  const enrollmentCount = prismaCourse.enrollments?.length || 0;
  const avg = prismaCourse.reviews?.length
    ? prismaCourse.reviews.reduce((s, r) => s + r.rating, 0) /
      prismaCourse.reviews.length
    : 0;

  // Get the first lesson slug (prioritize standalone lessons, then first module's first lesson)
  let firstLessonSlug: string | null = null;
  const allLessons = prismaCourse.lessons || [];

  // First, try standalone lessons (moduleId is null)
  const standaloneLessons = allLessons
    .filter((l) => !l.moduleId)
    .sort(byOrder);

  if (standaloneLessons.length > 0) {
    firstLessonSlug = standaloneLessons[0].slug;
  } else {
    // If no standalone lessons, get first lesson from first module
    const modules = (prismaCourse.modules || []).sort(byOrder);
    if (modules.length > 0 && modules[0].lessons && modules[0].lessons.length > 0) {
      const moduleLessons = modules[0].lessons.sort(byOrder);
      firstLessonSlug = moduleLessons[0].slug;
    }
  }

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
    tags: (prismaCourse.tags || []).map((t) => ({
      id: t.tag.id,
      name: t.tag.name,
      color: t.tag.color,
    })),
    requiredTier: prismaCourse.accessTier,
    previewEnabled: prismaCourse.previewEnabled,
    firstLessonSlug,
    // Access flags default (will be enriched later)
    isUnlocked: undefined,
    isInSubscription: undefined,
    isEnrolled: undefined,
    hasEntitlement: undefined,
  };
}

export function serializeFeatured(
  prismaCourse: CourseSummaryInput,
): FeaturedCourseDTO {
  return serializeCourseSummary(prismaCourse);
}

export function serializeCourseDetail(
  prismaCourse: CourseDetailInput,
): CourseDetailDTO {
  const base = serializeCourseSummary(prismaCourse);
  const lessons: CourseLessonDTO[] = (prismaCourse.lessons || []).map((l) => ({
    id: l.id,
    title: l.title,
    slug: l.slug,
    description: l.description ?? null,
    duration: l.duration ?? null,
    order: l.order,
    moduleId: l.moduleId ?? null,
  }));
  const modules: CourseModuleDTO[] = (prismaCourse.modules || []).map((m) => ({
    id: m.id,
    title: m.title,
    slug: m.slug,
    order: m.order,
    courseId: m.courseId,
    lessons: (m.lessons || []).map((l) => ({
      id: l.id,
      title: l.title,
      slug: l.slug,
      description: l.description ?? null,
      duration: l.duration ?? null,
      order: l.order,
      moduleId: l.moduleId ?? null,
    })),
  }));
  const reviews: CourseReviewDTO[] = (prismaCourse.reviews || []).map((r) => ({
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
  const quizzes: CourseQuizDTO[] = (prismaCourse.quizzes || []).map((q) => ({
    id: q.id,
    moduleId: q.moduleId,
    title: q.title,
    questions: (q.questions || []).map((question) => ({
      id: question.id,
      question: question.question,
      options: question.options,
      order: question.order,
    })),
  }));
  const visualSupports: CourseVisualSupportDTO[] = (
    prismaCourse.visualSupports || []
  ).map((vs) => ({
    id: vs.id,
    title: vs.title,
    moduleId: vs.moduleId,
    order: vs.order,
    content: vs.content,
  }));
  return {
    ...base,
    lessons,
    modules,
    quizzes,
    visualSupports,
    reviews,
    publicStructure: prismaCourse.publicStructure || null,
    publicResources: prismaCourse.publicResources || null,
    publicEvaluation: prismaCourse.publicEvaluation || null,
    publicPrerequisites: prismaCourse.publicPrerequisites || null,
    createdAt: prismaCourse.createdAt.toISOString(),
    updatedAt: prismaCourse.updatedAt.toISOString(),
  };
}
