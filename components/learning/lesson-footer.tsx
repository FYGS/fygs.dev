"use client";

import { ItemNavigation } from "./item-navigation";
import { LessonProgressButton } from "./lesson-progress-button";
import { useLessonSession } from "./lesson-session";

/** Under the lesson: mark it done, then move on (the next step becomes the main button once it is done). */
export function LessonFooter({ lessonId }: { lessonId: string }) {
  const { completed } = useLessonSession();
  return (
    <div className="space-y-4 border-t pt-6">
      <div className="flex justify-center sm:justify-start">
        <LessonProgressButton />
      </div>
      <ItemNavigation currentId={lessonId} emphasizeNext={completed} />
    </div>
  );
}
