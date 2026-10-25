import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { QuizRunner } from "@/components/learning/quiz-runner";
import { getLearningContext, leaveStep } from "@/lib/learning/page-context";
import { getQuizStartBlock, getResumedAnswers } from "@/lib/learning/quiz-status";

interface QuizPageProps {
  params: Promise<{ slug: string; quizId: string }>;
}

export async function generateMetadata({ params }: QuizPageProps): Promise<Metadata> {
  const { slug, quizId } = await params;
  const quiz = await db.quiz.findFirst({
    where: { id: quizId, course: { slug } },
    select: { title: true, course: { select: { title: true } } },
  });
  if (!quiz) return { title: "Quiz introuvable" };
  return { title: `${quiz.title} | ${quiz.course.title} | FYGS`, robots: { index: false } };
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { slug, quizId } = await params;
  const ctx = await getLearningContext(slug);

  const quiz = await db.quiz.findFirst({
    where: { id: quizId, courseId: ctx.course.id },
    select: {
      id: true,
      title: true,
      module: { select: { title: true } },
      // correct option and explanation stay on the server: see checkQuizAnswer
      questions: { orderBy: { order: "asc" }, select: { id: true, question: true, options: true } },
    },
  });
  if (!quiz) notFound();

  // Quizzes record results: they need the course, not just the free sample
  // A quiz records a result: a visitor signs in, a free-sample learner opens the course first
  if (!ctx.user || ctx.mode === "preview") leaveStep(ctx, `/learn/${ctx.course.slug}/quizzes/${quizId}`);
  const user = ctx.user;

  const staff = ctx.mode === "staff";
  const [result, blockedMessage, resumed] = await Promise.all([
    staff
      ? null
      : db.quizResult.findUnique({
          where: { userId_quizId: { userId: user.id, quizId: quiz.id } },
          select: { percentage: true, score: true, total: true },
        }),
    staff ? null : getQuizStartBlock(user.id, quiz.id),
    staff ? [] : getResumedAnswers(user.id, quiz.id),
  ]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">Quiz{quiz.module ? ` · ${quiz.module.title}` : ""}</p>
        <h1 className="text-2xl font-bold md:text-3xl">{quiz.title}</h1>
        {staff && (
          <p role="note" className="pt-2 text-sm text-muted-foreground">
            Aperçu auteur : vous pouvez essayer le quiz, rien n’est enregistré.
          </p>
        )}
      </header>
      <QuizRunner
        key={quiz.id}
        quiz={quiz}
        courseId={ctx.course.id}
        best={result}
        blockedMessage={blockedMessage}
        resumed={resumed}
      />
    </div>
  );
}
