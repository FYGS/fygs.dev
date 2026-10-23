"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
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
  children: React.ReactNode;
}

export function LessonSession({ lessonId, initialCompleted, courseSlug, children }: LessonSessionProps) {
  const { mode, markLessonDone } = useLearning();
  const router = useRouter();
  const recording = mode === "full";
  const progress = useLessonProgress({ lessonId, enabled: recording });
  const [completed, setCompleted] = useState(initialCompleted);
  const [completing, setCompleting] = useState(false);
  const player = useRef<PlayerApi | null>(null);

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
      toast.error("La leçon n’a pas pu être enregistrée comme terminée. Réessayez.");
      return;
    }
    if (result.reward) toast.success(`+${result.reward.xp} XP`, { description: "Leçon terminée" });
    if (result.course?.justIssued) {
      toast.success("Formation terminée : votre certificat est prêt", {
        duration: 10_000,
        action: { label: "Voir", onClick: () => router.push(`/learn/${courseSlug}/completed`) },
      });
    }
  }, [recording, completed, completing, markLessonDone, lessonId, progress, router, courseSlug]);

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
