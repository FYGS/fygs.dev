import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AccessService } from "@/lib/access-service";
import { CourseRepository } from "@/lib/repositories/course-repository";
import { db } from "@/lib/db";
import { CourseBreadcrumb } from "../../_components/course-breadcrumb";
import { QuizStudent } from "../../_components/quiz-student";

interface QuizPageProps {
  params: Promise<{ slug: string; quizId: string }>;
}

export async function generateMetadata({
  params,
}: QuizPageProps): Promise<Metadata> {
  const { slug, quizId } = await params;

  const [course, quiz] = await Promise.all([
    CourseRepository.findBySlug(slug),
    db.quiz.findUnique({
      where: { id: quizId },
      select: { title: true },
    }),
  ]);

  if (!course || !quiz) {
    return {
      title: "Quiz non trouvé",
    };
  }

  return {
    title: `${quiz.title} - ${course.title} | FYGS`,
    description: `Quiz interactif : ${quiz.title} pour la formation ${course.title}`,
  };
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { slug, quizId } = await params;

  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect(
      `/auth/login?callbackUrl=${encodeURIComponent(
        `/formations/${slug}/quizzes/${quizId}`,
      )}`,
    );
  }

  const course = await CourseRepository.findBySlug(slug);

  if (!course || !course.published) {
    notFound();
  }

  // Check user access
  const userAccess = await AccessService.checkCourseAccess(
    session.user.id,
    course.id,
  );

  if (!userAccess.canAccessCourse) {
    redirect(`/formations/${slug}`);
  }

  // Fetch quiz with questions
  const [quiz, allQuizzes, modules] = await Promise.all([
    db.quiz.findUnique({
      where: {
        id: quizId,
        courseId: course.id,
      },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    }),
    // Fetch all quizzes for navigation
    db.quiz.findMany({
      where: { courseId: course.id },
      select: {
        id: true,
        title: true,
        moduleId: true,
        _count: {
          select: { questions: true },
        },
      },
      orderBy: [{ moduleId: "asc" }, { createdAt: "asc" }],
    }),
    // Fetch modules with lessons to find the last lesson before quiz
    db.module.findMany({
      where: { courseId: course.id },
      select: {
        id: true,
        order: true,
        lessons: {
          where: { published: true },
          orderBy: { order: "desc" },
          select: { slug: true },
          take: 1,
        },
      },
    }),
  ]);

  if (!quiz) {
    notFound();
  }

  // Find the last lesson of the quiz's module
  let previousLessonSlug: string | null = null;
  if (quiz.moduleId) {
    const quizModule = modules.find((m) => m.order === quiz.moduleId);
    if (quizModule && quizModule.lessons.length > 0) {
      previousLessonSlug = quizModule.lessons[0].slug;
    }
  }

  const serializedQuiz = {
    id: quiz.id,
    title: quiz.title,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      // correct option and explanation stay on the server: see checkQuizAnswer
      order: q.order,
    })),
  };

  const serializedAllQuizzes = allQuizzes.map((q) => ({
    id: q.id,
    title: q.title,
    moduleId: q.moduleId,
    questionCount: q._count.questions,
  }));

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="container py-8 max-w-7xl mx-auto">
        <CourseBreadcrumb
          courseTitle={course.title}
          courseSlug={course.slug}
          currentPage={`Quiz: ${quiz.title}`}
        />

        <div className="mt-8 max-w-4xl mx-auto">
          <QuizStudent
            quiz={serializedQuiz}
            allQuizzes={serializedAllQuizzes}
            courseSlug={course.slug}
            courseId={course.id}
            currentQuizId={quizId}
            previousLessonSlug={previousLessonSlug}
            basePath="formations"
          />
        </div>
      </div>
    </div>
  );
}
