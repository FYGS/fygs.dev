'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { AccessService } from '@/lib/access-service'
import { AnalyticsHelper } from '@/lib/analytics-helper'
import { createLogger } from '@/lib/structured-logger'
import { auth } from '@/lib/auth'

const updateLessonProgressSchema = z.object({
  lessonId: z.string().cuid(),
  completed: z.boolean().optional(),
  watchTimeDelta: z.number().min(0).optional(), // Additional watch time in seconds
})

export type UpdateLessonProgressResult = {
  success: boolean
  message: string
  progress?: {
    id: string
    completed: boolean
    watchTime: number
    completedAt: Date | null
  }
  error?: string
}

export async function updateLessonProgress(
  input: z.infer<typeof updateLessonProgressSchema>
): Promise<UpdateLessonProgressResult> {
  const logger = createLogger({ operation: 'updateLessonProgress' })

  try {
    // Validate input
    const { lessonId, completed, watchTimeDelta = 0 } = updateLessonProgressSchema.parse(input)
    
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
    const progress = await db.$transaction(async (tx) => {
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
      const currentWatchTime = existing?.watchTime || 0
      const newWatchTime = currentWatchTime + watchTimeDelta
      const wasCompleted = existing?.completed || false
      const newCompleted = completed !== undefined ? completed : wasCompleted
      const shouldUpdateCompletedAt = newCompleted && !wasCompleted
      
      // Upsert progress with accumulated watch time
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
          watchTime: newWatchTime,
          completedAt: newCompleted ? new Date() : null
        },
        update: {
          completed: newCompleted,
          watchTime: newWatchTime,
          completedAt: shouldUpdateCompletedAt ? new Date() : existing?.completedAt,
          updatedAt: new Date()
        },
        select: {
          id: true,
          completed: true,
          watchTime: true,
          completedAt: true
        }
      })
      
      // Log analytics event if lesson was completed
      if (shouldUpdateCompletedAt) {
        contextLogger.businessEvent('LESSON_COMPLETED', {
          metadata: {
            lessonId,
            courseId: lesson.courseId, 
            watchTime: newWatchTime
          }
        })

        await AnalyticsHelper.recordLessonCompletion(userId, {
          lessonId,
          courseId: lesson.courseId,
          lessonOrder: 1, // TODO: Get actual lesson order
          watchTime: newWatchTime,
          completionPercentage: 100,
          isFirstCompletion: true,
          timestamp: new Date().toISOString()
        })
      }
      
      return updated
    })
    
    // Revalidate relevant paths
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/courses')
    revalidatePath(`/formations/${lesson.courseId}`)
    revalidatePath(`/formations/${lesson.courseId}/lessons/${lesson.slug}`)
    
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
      progress
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