import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AccessService } from "@/lib/access-service";
import { LearningShell } from "@/components/learning/learning-shell";
import { GamificationStats } from "@/components/learning/gamification-stats";
import { CourseRoadmap } from "@/components/learning/course-roadmap";
import { LessonNotes } from "@/components/learning/lesson-notes";
import { VideoPlayer } from "@/app/[locale]/(main)/formations/[slug]/lessons/[lessonSlug]/_components/video-player";
import { LessonContent as LessonContentComponent } from "@/app/[locale]/(main)/formations/[slug]/lessons/[lessonSlug]/_components/lesson-content";
import { LessonNavigation } from "@/app/[locale]/(main)/formations/[slug]/lessons/[lessonSlug]/_components/lesson-navigation";
import { getUserGamificationStats } from "@/lib/gamification";

interface LessonPageProps {
  params: Promise<{ slug: string; lessonSlug: string }>;
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { slug, lessonSlug } = await params;
  const lesson = await db.lesson.findFirst({
    where: { slug: lessonSlug, course: { slug } },
    include: { course: { select: { title: true } } },
  });

  if (!lesson) return { title: "Leçon non trouvée" };

  return {
    title: `${lesson.title} | ${lesson.course.title} | FYGS`,
    description:
      lesson.description ||
      `Leçon ${lesson.title} du cours ${lesson.course.title}`,
  };
}

export default async function ImmersiveLessonPage({ params }: LessonPageProps) {
  const { slug, lessonSlug } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect(
      `/auth/login?callbackUrl=${encodeURIComponent(
        `/learn/${slug}/lessons/${lessonSlug}`,
      )}`,
    );
  }

  const lesson = await db.lesson.findFirst({
    where: { slug: lessonSlug, course: { slug }, published: true },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                where: { published: true },
                orderBy: { order: "asc" },
                select: { id: true, title: true, slug: true, order: true },
              },
            },
          },
          lessons: {
            where: { published: true, moduleId: null },
            orderBy: { order: "asc" },
            select: { id: true, title: true, slug: true, order: true },
          },
        },
      },
    },
  });

  if (!lesson) notFound();

  const canAccess = await AccessService.canAccessLesson(
    session.user.id,
    lesson.id,
  );
  if (!canAccess) redirect(`/formations/${slug}`);

  // Fetch quizzes
  const quizzes = await db.quiz.findMany({
    where: { courseId: lesson.courseId },
    select: { id: true, title: true, moduleId: true },
  });

  // User progress
  const progress = await db.progress.findUnique({
    where: {
      userId_lessonId: { userId: session.user.id, lessonId: lesson.id },
    },
  });

  // All lesson/quiz IDs for progress calculation
  const allLessonIds = [
    ...lesson.course.lessons.map((l) => l.id),
    ...lesson.course.modules.flatMap((m) => m.lessons.map((l) => l.id)),
  ];
  const allQuizIds = quizzes.map((q) => q.id);

  const [allLessonProgress, allQuizResults, lessonNotes, gamificationStats] =
    await Promise.all([
      db.progress.findMany({
        where: { userId: session.user.id, lessonId: { in: allLessonIds } },
        select: { lessonId: true, completed: true },
      }),
      db.quizResult.findMany({
        where: { userId: session.user.id, quizId: { in: allQuizIds } },
        select: { quizId: true, percentage: true },
      }),
      db.lessonNote.findMany({
        where: { userId: session.user.id, lessonId: lesson.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          timestamp: true,
          createdAt: true,
        },
      }),
      getUserGamificationStats(session.user.id),
    ]);

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

  // Progress percentage
  const totalItems = allLessonIds.length + allQuizIds.length;
  const completedItems = unifiedProgress.filter((p) => p.completed).length;
  const progressPercentage =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Build navigation items using learning route URLs
  const standaloneLessons = lesson.course.lessons
    .sort((a, b) => a.order - b.order)
    .map((l) => ({
      ...l,
      type: "lesson" as const,
      url: `/learn/${slug}/lessons/${l.slug}`,
    }));

  const modulesWithItems = lesson.course.modules.map((m) => ({
    ...m,
    items: [
      ...m.lessons
        .sort((a, b) => a.order - b.order)
        .map((l) => ({
          ...l,
          type: "lesson" as const,
          url: `/learn/${slug}/lessons/${l.slug}`,
        })),
      ...quizzes
        .filter((q) => q.moduleId === m.order)
        .map((q) => ({
          ...q,
          slug: q.id,
          order: 999,
          type: "quiz" as const,
          url: `/learn/${slug}/quizzes/${q.id}`,
        })),
    ],
  }));

  // Linear items for LessonNavigation
  const linearItems = [
    ...standaloneLessons,
    ...modulesWithItems.flatMap((m) => m.items),
  ];
  const currentItemIndex = linearItems.findIndex(
    (item) => item.id === lesson.id,
  );

  const completedSet = new Set(
    unifiedProgress.filter((p) => p.completed).map((p) => p.itemId),
  );
  const roadmapItems = linearItems.map((item, index) => ({
    id: item.id,
    title: item.title,
    type: item.type,
    url: item.url,
    completed: completedSet.has(item.id),
    accessible:
      index === 0 || completedSet.has(linearItems[index - 1]?.id || ""),
    current: item.id === lesson.id,
  }));

  const serializedNotes = lessonNotes.map((note) => ({
    id: note.id,
    content: note.content,
    timestamp: note.timestamp,
    createdAt: note.createdAt.toISOString(),
  }));

  // Serialize for client components
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
    <LearningShell
      courseTitle={lesson.course.title}
      courseSlug={slug}
      lessonTitle={lesson.title}
      progressPercentage={progressPercentage}
      lessons={standaloneLessons}
      modules={modulesWithItems}
      currentLessonId={lesson.id}
      progressData={unifiedProgress}
    >
      <div className="space-y-6">
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-4">
            <GamificationStats
              totalXp={gamificationStats.totalXp}
              currentStreak={gamificationStats.currentStreak}
              todayXp={gamificationStats.todayXp}
              className="rounded-lg border bg-card p-4"
            />
            <LessonNotes lessonId={lesson.id} initialNotes={serializedNotes} />
          </div>
          <div className="rounded-lg border bg-card p-4">
            <CourseRoadmap items={roadmapItems} />
          </div>
        </div>
      </div>
    </LearningShell>
  );
}
