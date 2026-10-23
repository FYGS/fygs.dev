"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  updateLessonProgress,
  type UpdateLessonProgressResult,
} from "@/app/[locale]/(main)/dashboard/actions/updateLessonProgress";

interface UseLessonProgressOptions {
  lessonId: string;
  /** False for previews and staff: nothing is sent. */
  enabled?: boolean;
  /** How often playback is reported while playing. */
  intervalMs?: number;
}

const MAX_DELTA_PER_CALL = 60 * 30;

/**
 * Reports what a learner does in a lesson video: time watched (added up from playback, not
 * from jumps of the seek bar) and the position to resume from. Reports are batched every
 * `intervalMs` while playing, and flushed when the video pauses, ends or the lesson is left.
 */
export function useLessonProgress({ lessonId, enabled = true, intervalMs = 10_000 }: UseLessonProgressOptions) {
  const watched = useRef(0);
  const position = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const sending = useRef(false);

  const flush = useCallback(async () => {
    if (!enabled || sending.current) return;
    const delta = Math.min(Math.floor(watched.current), MAX_DELTA_PER_CALL);
    const lastPosition = position.current;
    if (delta <= 0 && lastPosition === null) return;
    watched.current -= delta;
    position.current = null;
    sending.current = true;
    try {
      await updateLessonProgress({
        lessonId,
        ...(delta > 0 ? { watchTimeDelta: delta } : {}),
        ...(lastPosition !== null ? { lastPosition: Math.floor(lastPosition) } : {}),
      });
    } catch {
      // keep what was not sent for the next report
      watched.current += delta;
      position.current ??= lastPosition;
    } finally {
      sending.current = false;
    }
  }, [enabled, lessonId]);

  /** Seconds really played since the last call (a few seconds at a time). */
  const addWatched = useCallback((seconds: number) => {
    if (seconds > 0) watched.current += seconds;
  }, []);

  const setPosition = useCallback((seconds: number) => {
    position.current = seconds;
  }, []);

  const start = useCallback(() => {
    if (!enabled || timer.current) return;
    timer.current = setInterval(() => void flush(), intervalMs);
  }, [enabled, flush, intervalMs]);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    void flush();
  }, [flush]);

  // Leaving the lesson (navigation, tab hidden or closed) reports the rest
  useEffect(() => {
    if (!enabled) return;
    const onHide = () => {
      if (document.visibilityState === "hidden") void flush();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
      void flush();
    };
  }, [enabled, flush]);

  const complete = useCallback(async (): Promise<UpdateLessonProgressResult> => {
    // report the time first so the completion call carries the final position
    await flush();
    return updateLessonProgress({ lessonId, completed: true });
  }, [flush, lessonId]);

  return useMemo(
    () => ({ start, stop, flush, addWatched, setPosition, complete }),
    [start, stop, flush, addWatched, setPosition, complete],
  );
}
