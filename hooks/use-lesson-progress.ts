"use client";
import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { logger, createLogger } from '@/lib/structured-logger';
import { Analytics } from '@/lib/analytics';
import { updateLessonProgress } from '@/app/[locale]/(main)/dashboard/actions/updateLessonProgress';

interface UseLessonProgressOptions {
  lessonId: string;
  enabled?: boolean; // only if user has access
  onCompleted?: () => void;
  intervalMs?: number;
}

export function useLessonProgress({ lessonId, enabled = true, onCompleted, intervalMs = 10000 }: UseLessonProgressOptions) {
  const lastSent = useRef<number>(0);
  const completedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const correlationId = logger.generateCorrelationId();
  const progressLogger = createLogger({
    operation: 'lesson-progress',
    correlationId,
    resourceType: 'lesson',
    resourceId: lessonId
  });

  const sendIncrement = useCallback(async (delta: number) => {
    if (!enabled || !lessonId || delta <= 0) return;
    try {
      const result = await updateLessonProgress({
        lessonId,
        watchTimeDelta: delta
      });

      if (!result.success) {
        progressLogger.warn("Progress increment failed", {
          resourceId: lessonId,
          metadata: {
            delta,
            error: result.error,
            message: result.message
          }
        });
      } else {
        progressLogger.debug("Progress increment successful", {
          resourceId: lessonId,
          metadata: { delta, watchTime: result.progress?.watchTime }
        });
      }
    } catch (error) {
      progressLogger.error("Progress increment error", {
        resourceId: lessonId,
        metadata: { delta, error: error instanceof Error ? error.message : String(error) }
      }, error instanceof Error ? error : new Error(String(error)));
    }
  }, [lessonId, enabled]);

  const lastPercentRef = useRef<number | null>(null);

  const markCompleted = useCallback(async () => {
    if (completedRef.current || !enabled) return;
    completedRef.current = true;
    try {
      progressLogger.info("Marking lesson as completed", {
        resourceId: lessonId
      });

      const result = await updateLessonProgress({
        lessonId,
        completed: true
      });

      if (result.success && result.progress?.completed) {
        // Track lesson completion analytics (we'll get user info on server-side)
        progressLogger.info("Lesson marked as completed successfully", {
          resourceId: lessonId,
          metadata: {
            completed: result.progress.completed,
            totalWatchTime: result.progress.watchTime
          }
        });

      // Check if certificate was earned through completion percentage check
      // This is a simplified approach - you might want to add a dedicated endpoint
      // or include certificate status in the progress update response
        try {
          const summaryRes = await fetch('/api/progress/summary', {
            headers: { 'cache-control': 'no-cache' }
          });

          if (summaryRes.status !== 304) {
            const summary = await summaryRes.json();
            if (typeof summary.justEarnedCertificate === 'boolean' && summary.justEarnedCertificate) {
              toast.success('Certificat obtenu !', {
                description: 'Disponible maintenant dans vos certificats.'
              });
            }
          }
        } catch (error) {
          progressLogger.warn("Failed to check certificate status", {
            resourceId: lessonId,
            metadata: { error: error instanceof Error ? error.message : String(error) }
          });
        }

        onCompleted?.();
      } else {
        progressLogger.warn("Lesson completion failed", {
          resourceId: lessonId,
          metadata: {
            error: result.error,
            message: result.message
          }
        });
      }
    } catch (error) {
      progressLogger.error("Lesson completion error", {
        resourceId: lessonId,
        metadata: { error: error instanceof Error ? error.message : String(error) }
      }, error instanceof Error ? error : new Error(String(error)));
    }
  }, [lessonId, enabled, onCompleted]);

  const start = useCallback((getCurrentTime: () => number) => {
    if (!enabled) return;
    if (timerRef.current) clearInterval(timerRef.current);
    lastSent.current = getCurrentTime();
    timerRef.current = setInterval(() => {
      const current = getCurrentTime();
      const delta = Math.floor(current - lastSent.current);
      if (delta > 0) {
        sendIncrement(Math.min(delta, 60 * 30)); // clamp 30min
        lastSent.current = current;
      }
    }, intervalMs);
  }, [enabled, intervalMs, sendIncrement]);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => () => { stop(); }, [stop]);

  return { start, stop, markCompleted };
}
