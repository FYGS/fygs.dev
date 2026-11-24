import { render } from "@testing-library/react";
import { LearningProvider } from "@/components/learning/learning-context";
import { sampleOutline } from "./learning-outline";
import type { LearnerMode } from "@/lib/learning/access";

export { sampleOutline };

export interface LearningState {
  mode?: LearnerMode;
  completed?: string[];
  passed?: string[];
  examPassed?: boolean;
  openable?: string[];
  hasSupports?: boolean;
}

/** Renders `ui` inside the learning provider of a sample course. */
export function renderInLearning(ui: React.ReactNode, state: LearningState = {}) {
  const outline = sampleOutline();
  return render(
    <LearningProvider
      courseSlug="react"
      courseTitle="React"
      mode={state.mode ?? "full"}
      outline={outline}
      openableIds={state.openable ?? outline.items.map((i) => i.id)}
      completedLessonIds={state.completed ?? []}
      passedQuizIds={state.passed ?? []}
      examPassed={state.examPassed ?? false}
      hasSupports={state.hasSupports ?? false}
    >
      {ui}
    </LearningProvider>,
  );
}
