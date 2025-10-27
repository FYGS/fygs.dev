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

export function serializeCourseSummary(prismaCourse: any): CourseSummaryDTO {
  const enrollmentCount = prismaCourse.enrollments?.length || 0;
  const avg = prismaCourse.reviews?.length
    ? prismaCourse.reviews.reduce((s: number, r: any) => s + r.rating, 0) /
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
    duration: prismaCourse.duration ?? null,
    featured: prismaCourse.featured,
    enrollmentCount,
    averageRating: Math.round(avg * 10) / 10,
    tags: (prismaCourse.tags || []).map((t: any) => ({
      id: t.tag.id,
      name: t.tag.name,
      color: t.tag.color,
    })),
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
  const lessons: CourseLessonDTO[] = (prismaCourse.lessons || []).map(
    (l: any) => ({
      id: l.id,
      title: l.title,
      slug: l.slug,
      description: l.description ?? null,
      duration: l.duration ?? null,
      order: l.order,
      moduleId: l.moduleId ?? null,
    })
  );
  const modules: CourseModuleDTO[] = (prismaCourse.modules || []).map(
    (m: any) => ({
      id: m.id,
      title: m.title,
      slug: m.slug,
      order: m.order,
      courseId: m.courseId,
      lessons: (m.lessons || []).map((l: any) => ({
        id: l.id,
        title: l.title,
        slug: l.slug,
        description: l.description ?? null,
        duration: l.duration ?? null,
        order: l.order,
        moduleId: l.moduleId ?? null,
      })),
    })
  );
  const reviews: CourseReviewDTO[] = (prismaCourse.reviews || []).map(
    (r: any) => ({
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
    })
  );
  const quizzes: CourseQuizDTO[] = (prismaCourse.quizzes || []).map(
    (q: any) => ({
      id: q.id,
      moduleId: q.moduleId,
      title: q.title,
      questions: (q.questions || []).map((question: any) => ({
        id: question.id,
        question: question.question,
        options: question.options,
        correct: question.correct,
        explanation: question.explanation || null,
        order: question.order,
      })),
    })
  );
  const visualSupports: CourseVisualSupportDTO[] = (
    prismaCourse.visualSupports || []
  ).map((vs: any) => ({
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
