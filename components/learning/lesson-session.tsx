"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { useLearning } from "./learning-context";

/** What the lesson page parts share: the video position, and whether the lesson is done. */
interface LessonSessionValue {
  lessonId: string;
  completed: boolean;
  completing: boolean;
  /** Progress is recorded (false for a preview or for the author looking at their course). */
  recording: boolean;
  complete: () => Promise<void>;
  /** Used by the player to report playback. */
  progress: ReturnType<typeof useLessonProgress>;
  registerPlayer: (api: PlayerApi | null) => void;
  getTime: () => number;
  seek: (seconds: number) => void;
}

interface PlayerApi {
  getTime: () => number;
  seek: (seconds: number) => void;
}

const LessonSessionContext = createContext<LessonSessionValue | null>(null);

export function useLessonSession(): LessonSessionValue {
  const value = useContext(LessonSessionContext);
  if (!value) throw new Error("useLessonSession must be used inside <LessonSession>");
  return value;
}

interface LessonSessionProps {
  lessonId: string;
  initialCompleted: boolean;
  courseSlug: string;
  /**
   * The lesson has no video this page plays itself (text, or a YouTube/Vimeo embed): the time the page stays open and
   * visible is reported as time spent, because the server asks for some before it accepts a completion.
   */
  trackPresence?: boolean;
  children: React.ReactNode;
}

/** Presence is counted in steps of this many seconds while the page is visible. */
const PRESENCE_STEP_SECONDS = 5;

export function LessonSession({ lessonId, initialCompleted, courseSlug, trackPresence = false, children }: LessonSessionProps) {
  const { mode, markLessonDone, unmarkLessonDone } = useLearning();
  const router = useRouter();
  const recording = mode === "full";
  const progress = useLessonProgress({ lessonId, enabled: recording });
  const [completed, setCompleted] = useState(initialCompleted);
  const [completing, setCompleting] = useState(false);
  const player = useRef<PlayerApi | null>(null);

  // Time on the page counts for a lesson without a video of its own
  useEffect(() => {
    if (!recording || !trackPresence || initialCompleted) return;
    progress.start();
    const tick = setInterval(() => {
      if (document.visibilityState === "visible") progress.addWatched(PRESENCE_STEP_SECONDS);
    }, PRESENCE_STEP_SECONDS * 1000);
    return () => {
      clearInterval(tick);
      progress.stop();
    };
  }, [recording, trackPresence, initialCompleted, progress]);

  const complete = useCallback(async () => {
    if (!recording || completed || completing) return;
    setCompleting(true);
    // Shown as done at once; undone below if the server refuses
    setCompleted(true);
    markLessonDone(lessonId);
    const result = await progress.complete().catch(() => null);
    setCompleting(false);
    if (!result?.success) {
      setCompleted(false);
      unmarkLessonDone(lessonId);
      // The server says what is missing (time to spend, pace); anything else is a failure to retry
      toast.error(result?.refusal ?? "La leçon n’a pas pu être enregistrée comme terminée. Réessayez.");
      return;
    }
    if (result.reward) toast.success(`+${result.reward.xp} XP`, { description: "Leçon terminée" });
    if (result.course?.justIssued) {
      toast.success("Formation terminée : votre certificat est prêt", {
        duration: 10_000,
        action: { label: "Voir", onClick: () => router.push(`/learn/${courseSlug}/completed`) },
      });
    }
  }, [recording, completed, completing, markLessonDone, unmarkLessonDone, lessonId, progress, router, courseSlug]);

  const registerPlayer = useCallback((api: PlayerApi | null) => {
    player.current = api;
  }, []);
  const getTime = useCallback(() => player.current?.getTime() ?? 0, []);
  const seek = useCallback((seconds: number) => player.current?.seek(seconds), []);

  const value = useMemo<LessonSessionValue>(
    () => ({ lessonId, completed, completing, recording, complete, progress, registerPlayer, getTime, seek }),
    [lessonId, completed, completing, recording, complete, progress, registerPlayer, getTime, seek],
  );

  return <LessonSessionContext.Provider value={value}>{children}</LessonSessionContext.Provider>;
}
