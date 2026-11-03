'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import {
  recordLessonProgress,
  type LessonProgressInput,
  type LessonProgressOutcome,
} from '@/lib/learning/lesson-progress'

export type UpdateLessonProgressResult = LessonProgressOutcome & { message: string }

const MESSAGES: Record<NonNullable<LessonProgressOutcome['error']>, string> = {
  UNAUTHORIZED: 'Authentication required',
  VALIDATION_ERROR: 'Invalid input data',
  LESSON_NOT_FOUND: 'Lesson not found',
  LESSON_NOT_PUBLISHED: 'Lesson is not available',
  ACCESS_DENIED: 'Access denied to lesson',
  INTERNAL_ERROR: 'Failed to update progress',
  RATE_LIMITED: 'Too many progress updates',
  WATCH_MORE: 'Not enough time spent on the lesson',
  TOO_FAST: 'Lessons completed too quickly',
  DAILY_LIMIT: 'Daily limit of completed lessons reached',
}

/** Time watched, resume position and completion of a lesson, from the lesson page (see lib/learning/lesson-progress.ts). */
export async function updateLessonProgress(input: LessonProgressInput): Promise<UpdateLessonProgressResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  const viewer = session?.user ? { id: session.user.id, role: session.user.role } : null
  if (viewer) {
    // A lesson page reports about every ten seconds; a few tabs stay far under this, a loop of requests does not
    const limit = await checkRateLimit(await headers(), 'lesson-progress', {
      subject: `user:${viewer.id}`,
      limit: 90,
      windowSeconds: 60,
    })
    if (!limit.allowed) return { success: false, error: 'RATE_LIMITED', message: MESSAGES.RATE_LIMITED }
  }
  const outcome = await recordLessonProgress(viewer, input)
  return { ...outcome, message: outcome.success ? 'Progress updated successfully' : MESSAGES[outcome.error ?? 'INTERNAL_ERROR'] }
}
