import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ExamRunner } from "@/components/learning/exam-runner";
import { parseExamQuestions } from "@/lib/learning/exam";
import { getExamStartBlock } from "@/lib/learning/exam-sittings";
import { getLearningContext, leaveStep } from "@/lib/learning/page-context";

interface ExamPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ExamPageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await db.course.findUnique({ where: { slug }, select: { title: true } });
  return { title: `Examen final | ${course?.title ?? "Formation"} | FYGS`, robots: { index: false } };
}

export default async function ExamPage({ params }: ExamPageProps) {
  const { slug } = await params;
  const ctx = await getLearningContext(slug);
  // The exam records a result: a visitor signs in, a free-sample learner opens the course first
  if (!ctx.user || ctx.mode === "preview") leaveStep(ctx, `/learn/${ctx.course.slug}/exam`);
  const user = ctx.user;
  const staff = ctx.mode === "staff";

  const exam = await db.finalExam.findFirst({
    where: { courseId: ctx.course.id, ...(staff ? {} : { published: true, course: { published: true } }) },
    select: { id: true, title: true, description: true, passingScore: true, timeLimit: true, questions: true },
  });
  const questionCount = exam ? parseExamQuestions(exam.questions).length : 0;
  if (!exam || questionCount === 0) notFound();

  const last = staff
    ? null
    : await db.examResult.findUnique({
        where: { userId_examId: { userId: user.id, examId: exam.id } },
        select: { percentage: true, passed: true, completedAt: true },
      });
  // The same rule as the one the server applies when a sitting starts (cooldown, daily cap, already passed)
  const blockedMessage = staff ? null : await getExamStartBlock(user.id, exam.id);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">Examen final</p>
        <h1 className="text-2xl font-bold md:text-3xl">{exam.title}</h1>
        {staff && (
          <p role="note" className="pt-2 text-sm text-muted-foreground">
            Aperçu auteur : vous pouvez passer l’examen, rien n’est enregistré.
          </p>
        )}
      </header>
      <ExamRunner
        key={exam.id}
        courseId={ctx.course.id}
        exam={{
          id: exam.id,
          title: exam.title,
          description: exam.description,
          passingScore: exam.passingScore,
          timeLimit: exam.timeLimit,
          questionCount,
        }}
        last={last ? { percentage: last.percentage, passed: last.passed } : null}
        blockedMessage={blockedMessage}
      />
    </div>
  );
}
