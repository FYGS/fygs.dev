import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ExamRunner } from "@/components/learning/exam-runner";
import { examRetakeDecision, parseExamQuestions } from "@/lib/learning/exam";
import { getLearningContext } from "@/lib/learning/page-context";
import { formatRetryDelay } from "@/lib/quiz-attempt-policy";

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
  if (ctx.mode === "preview") redirect(`/formations/${ctx.course.slug}?locked=1&reason=not_enrolled`);
  const staff = ctx.mode === "staff";

  const exam = await db.finalExam.findFirst({
    where: { courseId: ctx.course.id, ...(staff ? {} : { published: true }) },
    select: { id: true, title: true, description: true, passingScore: true, timeLimit: true, questions: true },
  });
  const questionCount = exam ? parseExamQuestions(exam.questions).length : 0;
  if (!exam || questionCount === 0) notFound();

  const last = staff
    ? null
    : await db.examResult.findUnique({
        where: { userId_examId: { userId: ctx.user.id, examId: exam.id } },
        select: { percentage: true, passed: true, completedAt: true },
      });
  const decision = examRetakeDecision(last, new Date());
  const blockedMessage = decision.allowed
    ? null
    : decision.reason === "PASSED"
      ? "Vous avez réussi cet examen."
      : `Vous pourrez repasser l’examen ${formatRetryDelay(decision.retryAt, new Date())}.`;

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
