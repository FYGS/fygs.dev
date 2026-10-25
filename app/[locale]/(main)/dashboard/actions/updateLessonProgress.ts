'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
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
}

/** Time watched, resume position and completion of a lesson, from the lesson page (see lib/learning/lesson-progress.ts). */
export async function updateLessonProgress(input: LessonProgressInput): Promise<UpdateLessonProgressResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  const viewer = session?.user ? { id: session.user.id, role: session.user.role } : null
  const outcome = await recordLessonProgress(viewer, input)
  return { ...outcome, message: outcome.success ? 'Progress updated successfully' : MESSAGES[outcome.error ?? 'INTERNAL_ERROR'] }
}
