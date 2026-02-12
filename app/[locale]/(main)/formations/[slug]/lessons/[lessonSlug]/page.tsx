import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AccessService } from "@/lib/access-service";
import { logger, createLogger } from "@/lib/structured-logger";
import { VideoPlayer } from "./_components/video-player";
import { LessonContent as LessonContentComponent } from "./_components/lesson-content";
import { LessonNavigation } from "./_components/lesson-navigation";
import { LessonProgress } from "./_components/lesson-progress";

interface LessonPageProps {
  params: Promise<{ slug: string; lessonSlug: string }>;
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const lesson = await db.lesson.findFirst({
    where: {
      slug: (await params).lessonSlug,
      course: { slug: (await params).slug },
    },
    include: {
      course: {
        select: { title: true },
      },
    },
  });

  if (!lesson) {
    return {
      title: "Leçon non trouvée",
    };
  }

  return {
    title: `${lesson.title} | ${lesson.course.title} | FYGS`,
    description:
      lesson.description ||
      `Leçon ${lesson.title} du cours ${lesson.course.title}`,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug, lessonSlug } = await params;

  const correlationId = logger.generateCorrelationId();
  const lessonLogger = createLogger({
    operation: "lesson-page-view",
    correlationId,
    resourceType: "lesson",
    resourceId: lessonSlug,
  });

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect(
      `/auth/login?callbackUrl=${encodeURIComponent(
        `/formations/${slug}/lessons/${lessonSlug}`,
      )}`,
    );
  }

  lessonLogger.info("Lesson page accessed", {
    userId: session.user.id,
    resourceId: lessonSlug,
    metadata: { courseSlug: slug },
  });

  const lesson = await db.lesson.findFirst({
    where: {
      slug: lessonSlug,
      course: { slug },
      published: true,
    },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                where: { published: true },
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  order: true,
                },
              },
            },
          },
          lessons: {
            where: { published: true, moduleId: null },
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              slug: true,
              order: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    notFound();
  }

  // Centralized access check
  const canAccess = await AccessService.canAccessLesson(
    session.user.id,
    lesson.id,
  );
  if (!canAccess) {
    redirect(`/formations/${slug}`);
  }

  // Fetch quizzes separately since they are not directly related to Module in Prisma
  const quizzes = await db.quiz.findMany({
    where: {
      courseId: lesson.courseId,
    },
    select: {
      id: true,
      title: true,
      moduleId: true,
    },
  });

  // Get user progress for this lesson
  const progress = await db.progress.findUnique({
    where: {
      userId_lessonId: {
        userId: session.user.id,
        lessonId: lesson.id,
      },
    },
  });

  // Flatten lessons and quizzes for navigation and progress
  const allLessonIds = [
    ...lesson.course.lessons.map((l) => l.id),
    ...lesson.course.modules.flatMap((m) => m.lessons.map((l) => l.id)),
  ];

  const allQuizIds = quizzes.map((q) => q.id);

  // Get progress for all lessons and quizzes in the course
  const [allLessonProgress, allQuizResults] = await Promise.all([
    db.progress.findMany({
      where: {
        userId: session.user.id,
        lessonId: { in: allLessonIds },
      },
      select: {
        lessonId: true,
        completed: true,
      },
    }),
    db.quizResult.findMany({
      where: {
        userId: session.user.id,
        quizId: { in: allQuizIds },
      },
      select: {
        quizId: true,
        score: true,
        total: true,
        percentage: true,
      },
    }),
  ]);

  // Unify progress data
  const unifiedProgress = [
    ...allLessonProgress.map((p) => ({
      itemId: p.lessonId,
      completed: p.completed,
      type: "lesson" as const,
    })),
    ...allQuizResults.map((q) => ({
      itemId: q.quizId,
      completed: q.percentage >= 70,
      type: "quiz" as const,
    })),
  ];

  // Re-construct the linear list of items for navigation
  const sortedModules = lesson.course.modules;
  const standaloneLessons = lesson.course.lessons;

  // Create linear items list for navigation
  // Order: standalone lessons → each module (lessons + quiz) → next module
  const linearItems = [
    // Standalone lessons (moduleId is null)
    ...standaloneLessons
      .sort((a, b) => a.order - b.order)
      .map((l) => ({
        ...l,
        type: "lesson" as const,
        url: `/formations/${slug}/lessons/${l.slug}`,
      })),
    // Modules with their lessons AND quizzes
    ...sortedModules.flatMap((m) => {
      const moduleLessons = m.lessons
        .sort((a, b) => a.order - b.order)
        .map((l) => ({
          ...l,
          type: "lesson" as const,
          url: `/formations/${slug}/lessons/${l.slug}`,
        }));

      // Quiz.moduleId (Int) references Module.order (Int), not Module.id
      const moduleQuizzes = quizzes
        .filter((q) => q.moduleId === m.order)
        .map((q) => ({
          ...q,
          slug: q.id,
          order: 999,
          type: "quiz" as const,
          url: `/formations/${slug}/quizzes/${q.id}`,
        }));

      // Return lessons followed by quizzes for this module
      return [...moduleLessons, ...moduleQuizzes];
    }),
  ];

  const currentItemIndex = linearItems.findIndex(
    (item) => item.id === lesson.id,
  );

  // Prepare modules with quizzes for LessonProgress
  const modulesWithQuizzes = sortedModules.map((m) => ({
    ...m,
    items: [
      ...m.lessons
        .sort((a, b) => a.order - b.order)
        .map((l) => ({
          ...l,
          type: "lesson" as const,
          url: `/formations/${slug}/lessons/${l.slug}`,
        })),
      // Quiz.moduleId (Int) references Module.order (Int), not Module.id
      ...quizzes
        .filter((q) => q.moduleId === m.order)
        .map((q) => ({
          ...q,
          slug: q.id,
          order: 999,
          type: "quiz" as const,
          url: `/formations/${slug}/quizzes/${q.id}`,
        })),
    ],
  }));

  // Serialize data to avoid Decimal/Date issues with client components
  const serializedLesson = {
    ...lesson,
    duration: lesson.duration ? Number(lesson.duration) : null,
    createdAt: lesson.createdAt.toISOString(),
    updatedAt: lesson.updatedAt.toISOString(),
    course: {
      ...lesson.course,
      price: lesson.course.price ? Number(lesson.course.price) : null,
      duration: lesson.course.duration ? Number(lesson.course.duration) : null,
      createdAt: lesson.course.createdAt.toISOString(),
      updatedAt: lesson.course.updatedAt.toISOString(),
    },
  };

  const serializedProgress = progress
    ? {
        ...progress,
        completedAt: progress.completedAt?.toISOString() || null,
        createdAt: progress.createdAt.toISOString(),
        updatedAt: progress.updatedAt.toISOString(),
      }
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <VideoPlayer
              lesson={serializedLesson}
              userId={session.user.id}
              initialProgress={serializedProgress}
            />
            <LessonContentComponent lesson={serializedLesson} />
            <LessonNavigation
              lessons={linearItems}
              currentLessonIndex={currentItemIndex}
              courseSlug={slug}
            />
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <LessonProgress
                lessons={standaloneLessons.map((l) => ({
                  ...l,
                  type: "lesson" as const,
                  url: `/formations/${slug}/lessons/${l.slug}`,
                }))}
                modules={modulesWithQuizzes}
                currentLessonId={lesson.id}
                progressData={unifiedProgress}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
