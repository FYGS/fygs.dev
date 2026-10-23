import { LearningShell } from "@/components/learning/learning-shell";
import { getLearningContext } from "@/lib/learning/page-context";

interface LearnLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

/**
 * Everything the learning area needs about the course and the learner is loaded once here for the
 * lessons, quizzes, exam and completion pages (pages share it through getLearningContext): who may
 * see what, the plan of the course and what has been done.
 */
export default async function LearnLayout({ children, params }: LearnLayoutProps) {
  const { slug } = await params;
  const { course, mode, state, canOpen, supportCount } = await getLearningContext(slug);

  return (
    <LearningShell
      courseSlug={course.slug}
      courseTitle={course.title}
      mode={mode}
      outline={state.outline}
      openableIds={state.outline.items.filter(canOpen).map((item) => item.id)}
      completedLessonIds={[...state.completedLessonIds]}
      passedQuizIds={[...state.passedQuizIds]}
      examPassed={state.examPassed}
      hasSupports={supportCount > 0 && mode !== "preview"}
    >
      {children}
    </LearningShell>
  );
}
