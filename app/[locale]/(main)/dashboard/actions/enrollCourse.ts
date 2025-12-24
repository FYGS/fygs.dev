'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { AccessService } from '@/lib/access-service'
import { AnalyticsHelper } from '@/lib/analytics-helper'
import { createLogger } from '@/lib/structured-logger'
import { auth } from '@/lib/auth'
import { CourseAccessTier, PaymentKind, PaymentStatus } from '@prisma/client'

const enrollCourseSchema = z.object({
  courseId: z.string().cuid(),
})

export type EnrollCourseResult = {
  success: boolean
  message: string
  enrollment?: {
    id: string
    enrolledAt: Date
  }
  error?: string
  alreadyEnrolled?: boolean
}

export async function enrollCourse(input: z.infer<typeof enrollCourseSchema>): Promise<EnrollCourseResult> {
  const logger = createLogger({ operation: 'enrollCourse' })

  try {
    // Validate input
    const { courseId } = enrollCourseSchema.parse(input)
    
    logger.info('Starting course enrollment', { resourceId: courseId, resourceType: 'course' })

    // Get authenticated user
    const reqHeaders = await headers()
    const session = await auth.api.getSession({ headers: reqHeaders })

    if (!session?.user?.id) {
      logger.warn('Enrollment attempt without authentication')
      return {
        success: false,
        message: 'Veuillez vous connecter pour vous inscrire à cette formation',
        error: 'UNAUTHORIZED'
      }
    }
    
    const userId = session.user.id
    const contextLogger = logger.withContext({ userId, resourceId: courseId, resourceType: 'course' })
    
    // Verify course exists and is published
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        published: true,
        accessTier: true,
      }
    })
    
    if (!course) {
      contextLogger.warn('Course not found for enrollment')
      return {
        success: false,
        message: 'Formation introuvable',
        error: 'COURSE_NOT_FOUND'
      }
    }

    if (!course.published) {
      contextLogger.warn('Enrollment attempt on unpublished course')
      return {
        success: false,
        message: 'Cette formation n\'est pas disponible à l\'inscription',
        error: 'COURSE_NOT_PUBLISHED'
      }
    }
    
    // Check if already enrolled (idempotent)
    const existingEnrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      select: {
        id: true,
        enrolledAt: true
      }
    })
    
    if (existingEnrollment) {
      contextLogger.info('User already enrolled in course', { metadata: { enrollmentId: existingEnrollment.id } })
      return {
        success: true,
        message: 'Vous êtes déjà inscrit à cette formation',
        enrollment: existingEnrollment,
        alreadyEnrolled: true
      }
    }
    
    // For premium courses, verify user has access (subscription or purchase)
    let hasSubscription = false
    let coursePurchase = null

    if (course.accessTier === CourseAccessTier.PREMIUM) {
      hasSubscription = await AccessService.hasActiveSubscription(userId)
      
      // Check for course purchase
      coursePurchase = await db.payment.findFirst({
        where: {
          userId,
          courseId,
          kind: PaymentKind.COURSE,
          status: PaymentStatus.COMPLETED
        },
        select: { id: true }
      })
      
      if (!hasSubscription && !coursePurchase) {
        return {
          success: false,
          message: 'Un abonnement Premium ou l\'achat de la formation est requis',
          error: 'PREMIUM_ACCESS_REQUIRED'
        }
      }
    }
    
    // Create enrollment
    const enrollment = await db.enrollment.create({
      data: {
        userId,
        courseId,
        enrolledAt: new Date()
      },
      select: {
        id: true,
        enrolledAt: true
      }
    })
    
    contextLogger.businessEvent('COURSE_ENROLLMENT', {
      metadata: {
        enrollmentId: enrollment.id,
        courseTier: course.accessTier
      }
    })

    // Log analytics event
    await AnalyticsHelper.recordEnrollment(userId, {
      courseId,
      courseTitle: course.title,
      courseTier: course.accessTier as CourseAccessTier,
      enrollmentSource: "direct_link",
      hasActiveSubscription:
        course.accessTier === CourseAccessTier.PREMIUM
          ? hasSubscription || !!coursePurchase
          : false,
      timestamp: new Date().toISOString(),
    });
    
    // Revalidate relevant paths
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/courses')
    revalidatePath(`/formations/${course.id}`)
    
    contextLogger.info('Course enrollment completed successfully')

    return {
      success: true,
      message: `Inscription réussie à ${course.title}`,
      enrollment
    }
    
  } catch (error) {
    logger.error('Enrollment failed', { metadata: { error: error instanceof Error ? error.message : 'Unknown error' } }, error instanceof Error ? error : undefined)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Données invalides',
        error: 'VALIDATION_ERROR'
      }
    }

    return {
      success: false,
      message: 'Une erreur est survenue lors de l\'inscription',
      error: 'INTERNAL_ERROR'
    }
  }
}
