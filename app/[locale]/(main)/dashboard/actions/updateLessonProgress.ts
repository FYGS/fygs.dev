'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { AccessService } from '@/lib/access-service'
import { AnalyticsHelper } from '@/lib/analytics-helper'
import { createLogger } from '@/lib/structured-logger'
import { auth } from '@/lib/auth'
import { completeCourseIfDone } from '@/lib/learning/completion'
import { rewardLessonCompleted, type LessonReward } from '@/lib/learning/rewards'

const updateLessonProgressSchema = z.object({
  lessonId: z.string().cuid(),
  completed: z.boolean().optional(),
  watchTimeDelta: z.number().min(0).max(7200).optional(), // Additional watch time in seconds (at most 2h per call)
  lastPosition: z.number().min(0).max(86400).optional(), // Where the video is, in seconds: where "resume" starts
})

export type UpdateLessonProgressResult = {
  success: boolean
  message: string
  progress?: {
    id: string
    completed: boolean
    watchTime: number
    completedAt: Date | null
    lastPosition: number
  }
  /** XP given for this completion, once per lesson */
  reward?: LessonReward | null
  /** Set when this call completed the lesson: where the course stands */
  course?: {
    percent: number
    isComplete: boolean
    justIssued: boolean
    certificate: { id: string; code: string } | null
  }
  error?: string
}

export async function updateLessonProgress(
  input: z.infer<typeof updateLessonProgressSchema>
): Promise<UpdateLessonProgressResult> {
  const logger = createLogger({ operation: 'updateLessonProgress' })

  try {
    // Validate input
    const { lessonId, completed, watchTimeDelta = 0, lastPosition } = updateLessonProgressSchema.parse(input)
    
    logger.info('Starting lesson progress update', {
      resourceId: lessonId,
      resourceType: 'lesson',
      metadata: { completed, watchTimeDelta }
    })

    // Get authenticated user
    const session = await auth.api.getSession({ headers: await headers() })
    
    if (!session?.user?.id) {
      logger.warn('Progress update attempt without authentication')
      return {
        success: false,
        message: 'Authentication required',
        error: 'UNAUTHORIZED'
      }
    }
    
    const userId = session.user.id
    const contextLogger = logger.withContext({ userId, resourceId: lessonId, resourceType: 'lesson' })
    
    // Verify lesson exists and get course info
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            published: true,
            accessTier: true
          }
        }
      }
    })
    
    if (!lesson) {
      contextLogger.warn('Lesson not found for progress update')
      return {
        success: false,
        message: 'Lesson not found',
        error: 'LESSON_NOT_FOUND'
      }
    }
    
    if (!lesson.published) {
      contextLogger.warn('Progress update attempt on unpublished lesson')
      return {
        success: false,
        message: 'Lesson is not available',
        error: 'LESSON_NOT_PUBLISHED'
      }
    }
    
    // Check access to lesson
    const canAccess = await AccessService.canAccessLesson(userId, lessonId)
    if (!canAccess) {
      contextLogger.securityEvent('LESSON_ACCESS_DENIED', {
        metadata: { lessonId, courseId: lesson.courseId }
      })
      return {
        success: false,
        message: 'Access denied to lesson',
        error: 'ACCESS_DENIED'
      }
    }
    
    // Use transaction for idempotent update
    const progressResult = await db.$transaction(async (tx) => {
      // Get existing progress
      const existing = await tx.progress.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId
          }
        }
      })
      
      // Calculate new values
      const wasCompleted = existing?.completed || false
      const newCompleted = completed !== undefined ? completed : wasCompleted
      const shouldUpdateCompletedAt = newCompleted && !wasCompleted
      
      // Upsert progress. The watch time is added by the database (increment), not
      // computed from the row read above: concurrent updates (two tabs, player
      // heartbeats) would otherwise overwrite each other and lose watch time.
      const updated = await tx.progress.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId
          }
        },
        create: {
          userId,
          lessonId,
          completed: newCompleted,
          watchTime: watchTimeDelta,
          lastPosition: Math.floor(lastPosition ?? 0),
          completedAt: newCompleted ? new Date() : null
        },
        update: {
          completed: newCompleted,
          watchTime: { increment: watchTimeDelta },
          ...(lastPosition !== undefined ? { lastPosition: Math.floor(lastPosition) } : {}),
          // keep the first completion date; un-completing clears it
          completedAt: !newCompleted
            ? null
            : shouldUpdateCompletedAt
              ? new Date()
              : existing?.completedAt,
          updatedAt: new Date()
        },
        select: {
          id: true,
          completed: true,
          watchTime: true,
          completedAt: true,
          lastPosition: true
        }
      })
      
      // Log analytics event if lesson was completed
      if (shouldUpdateCompletedAt) {
        contextLogger.businessEvent('LESSON_COMPLETED', {
          metadata: {
            lessonId,
            courseId: lesson.courseId, 
            watchTime: updated.watchTime
          }
        })

        await AnalyticsHelper.recordLessonCompletion(userId, {
          lessonId,
          courseId: lesson.courseId,
          lessonOrder: lesson.order,
          watchTime: updated.watchTime,
          completionPercentage: 100,
          isFirstCompletion: true,
          timestamp: new Date().toISOString()
        })
      }
      
      return { updated, completionChanged: newCompleted !== wasCompleted }
    })

    const { updated: progress, completionChanged } = progressResult

    // Only a change of the completed state needs fresh pages: a watch-time heartbeat must not
    // re-render the lesson the learner is watching
    let reward: LessonReward | null = null
    let course: UpdateLessonProgressResult['course']
    if (completionChanged) {
      if (progress.completed) {
        reward = await rewardLessonCompleted(userId, lessonId)
        const outcome = await completeCourseIfDone(userId, lesson.courseId)
        course = {
          percent: outcome.progress.percent,
          isComplete: outcome.isComplete,
          justIssued: outcome.justIssued,
          certificate: outcome.certificate ? { id: outcome.certificate.id, code: outcome.certificate.code } : null,
        }
      }
      revalidatePath('/dashboard')
      revalidatePath('/dashboard/my-courses')
      revalidatePath(`/formations/${lesson.course.slug}`)
      revalidatePath(`/learn/${lesson.course.slug}`, 'layout')
    }

    contextLogger.info('Lesson progress updated successfully', {
      metadata: {
        progressId: progress.id,
        completed: progress.completed,
        watchTime: progress.watchTime
      }
    })

    return {
      success: true,
      message: 'Progress updated successfully',
      progress,
      reward,
      course
    }
    
  } catch (error) {
    logger.error('Progress update failed', {
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    }, error instanceof Error ? error : undefined)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Invalid input data',
        error: 'VALIDATION_ERROR'
      }
    }
    
    return {
      success: false,
      message: 'Failed to update progress',
      error: 'INTERNAL_ERROR'
    }
  }
}