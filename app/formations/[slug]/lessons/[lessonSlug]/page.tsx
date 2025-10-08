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

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
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
    description: lesson.description || `Leçon ${lesson.title} du cours ${lesson.course.title}`,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug, lessonSlug } = await params;

  const correlationId = logger.generateCorrelationId();
  const lessonLogger = createLogger({ 
    operation: 'lesson-page-view',
    correlationId,
    resourceType: 'lesson',
    resourceId: lessonSlug
  });

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  lessonLogger.info("Lesson page accessed", {
    userId: session.user.id,
    resourceId: lessonSlug,
    metadata: { courseSlug: slug }
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
    },
  });

  if (!lesson) {
    notFound();
  }

  // Centralized access check
  const canAccess = await AccessService.canAccessLesson(session.user.id, lesson.id);
  if (!canAccess) {
    redirect(`/formations/${slug}`);
  }

  // Get user progress for this lesson
  const progress = await db.progress.findUnique({
    where: {
      userId_lessonId: {
        userId: session.user.id,
        lessonId: lesson.id,
      },
    },
  });

  // Get progress for all lessons in the course
  const allProgress = await db.progress.findMany({
    where: {
      userId: session.user.id,
      lessonId: { in: lesson.course.lessons.map(l => l.id) },
    },
    select: {
      lessonId: true,
      completed: true,
    },
  });

  const currentLessonIndex = lesson.course.lessons.findIndex(l => l.id === lesson.id);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <VideoPlayer
              lesson={lesson}
              userId={session.user.id}
              initialProgress={progress}
            />
            <LessonContentComponent lesson={lesson} />
            <LessonNavigation
              lessons={lesson.course.lessons}
              currentLessonIndex={currentLessonIndex}
              courseSlug={slug}
            />
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <LessonProgress
                lessons={lesson.course.lessons}
                currentLessonId={lesson.id}
                courseSlug={slug}
                progressData={allProgress}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
