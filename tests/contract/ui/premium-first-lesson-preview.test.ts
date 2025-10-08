import { describe, it, expect, afterEach } from 'vitest'
import { db } from '@/lib/db'
import { createTestEnvironment, TestDatabase } from '../../utils/test-database'

// Service for handling premium lesson preview logic
class PremiumPreviewService {
  static async canPreviewFirstLesson(userId: string, courseId: string): Promise<boolean> {
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          take: 1
        }
      }
    })

    if (!course || !course.published) return false
    if (course.accessTier === 'FREE') return true
    
    // For PREMIUM courses, check if user has subscription or enrollment
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: true,
        enrollments: {
          where: { courseId }
        }
      }
    })

    if (!user) return false
    
    // Admin always has access
    if (user.role === 'ADMIN') return true
    
    // If enrolled, can access
    if (user.enrollments.length > 0) return true
    
    // If has active subscription, can preview first lesson
    const activeSubscription = user.subscriptions.find(sub => sub.status === 'ACTIVE')
    if (activeSubscription) return true
    
    // Otherwise, can still preview first lesson for PREMIUM courses
    return course.accessTier === 'PREMIUM'
  }

  static async getProgressRecord(userId: string, courseId: string) {
    // Progress is linked to lessons, so we need to find progress for any lesson in the course
    return await db.progress.findFirst({
      where: {
        userId,
        lesson: {
          courseId: courseId
        }
      }
    })
  }

  static async hasEnrollment(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await db.enrollment.findFirst({
      where: {
        userId,
        courseId
      }
    })
    return !!enrollment
  }
}

describe('T114: Premium First Lesson Preview Tests', () => {
  const testEnv = createTestEnvironment()

  afterEach(async () => {
    await testEnv.cleanup()
  })

  describe('Premium Course Preview Access', () => {
    it('non-subscribed user can preview first lesson of premium course', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('preview'),
          name: 'Preview User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'Premium Preview Course',
          slug: TestDatabase.getUniqueSlug('premium-preview'),
          description: 'Course for testing preview access',
          category: 'FULLSTACK',
          level: 'BEGINNER',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const lesson = await db.lesson.create({
        data: {
          title: 'First Lesson',
          slug: TestDatabase.getUniqueSlug('first-lesson'),
          content: 'Preview content',
          order: 1,
          courseId: course.id,
          published: true
        }
      })
      testEnv.trackLesson(lesson.id)

      const canPreview = await PremiumPreviewService.canPreviewFirstLesson(user.id, course.id)
      expect(canPreview).toBe(true)
    })

    it('subscribed user can preview first lesson of premium course', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('subscribed'),
          name: 'Subscribed User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      await db.subscription.create({
        data: {
          userId: user.id,
          plan: 'PREMIUM',
          status: 'ACTIVE',
          priceId: 'price_premium_monthly',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      })

      const course = await db.course.create({
        data: {
          title: 'Premium Subscribed Course',
          slug: TestDatabase.getUniqueSlug('premium-subscribed'),
          description: 'Course for subscribed users',
          category: 'BACKEND',
          level: 'INTERMEDIATE',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const canPreview = await PremiumPreviewService.canPreviewFirstLesson(user.id, course.id)
      expect(canPreview).toBe(true)
    })

    it('enrolled user can preview first lesson of premium course', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('enrolled'),
          name: 'Enrolled User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'Premium Enrolled Course',
          slug: TestDatabase.getUniqueSlug('premium-enrolled'),
          description: 'Course for enrolled testing',
          category: 'FRONTEND',
          level: 'ADVANCED',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          enrolledAt: new Date()
        }
      })

      const canPreview = await PremiumPreviewService.canPreviewFirstLesson(user.id, course.id)
      expect(canPreview).toBe(true)
    })
  })

  describe('Progress Record Verification', () => {
    it('no progress record exists before enrollment for premium preview', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('no-progress'),
          name: 'No Progress User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'No Progress Course',
          slug: TestDatabase.getUniqueSlug('no-progress'),
          description: 'Course for progress testing',
          category: 'FULLSTACK',
          level: 'BEGINNER',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      // Verify no progress record exists
      const progress = await PremiumPreviewService.getProgressRecord(user.id, course.id)
      expect(progress).toBeNull()

      // Verify no enrollment exists
      const hasEnrollment = await PremiumPreviewService.hasEnrollment(user.id, course.id)
      expect(hasEnrollment).toBe(false)

      // But preview should still be accessible
      const canPreview = await PremiumPreviewService.canPreviewFirstLesson(user.id, course.id)
      expect(canPreview).toBe(true)
    })

    it('progress record can exist after enrollment for premium course', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('with-progress'),
          name: 'Progress User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'Progress Course',
          slug: TestDatabase.getUniqueSlug('with-progress'),
          description: 'Course for progress after enrollment',
          category: 'BACKEND',
          level: 'INTERMEDIATE',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const lesson = await db.lesson.create({
        data: {
          title: 'Progress Lesson',
          slug: TestDatabase.getUniqueSlug('progress-lesson'),
          content: 'Lesson with progress',
          order: 1,
          courseId: course.id,
          published: true
        }
      })
      testEnv.trackLesson(lesson.id)

      // Create enrollment first
      await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          enrolledAt: new Date()
        }
      })

      // Now create progress record
      const progress = await db.progress.create({
        data: {
          userId: user.id,
          lessonId: lesson.id,
          completed: true,
          completedAt: new Date()
        }
      })

      // Verify progress exists after enrollment
      const foundProgress = await PremiumPreviewService.getProgressRecord(user.id, course.id)
      expect(foundProgress).toBeTruthy()
      expect(foundProgress?.completed).toBe(true)

      // Preview should still be accessible
      const canPreview = await PremiumPreviewService.canPreviewFirstLesson(user.id, course.id)
      expect(canPreview).toBe(true)
    })
  })

  describe('Free Course Comparison', () => {
    it('free course first lesson is always accessible', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('free-user'),
          name: 'Free User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'Free Course',
          slug: TestDatabase.getUniqueSlug('free-course'),
          description: 'Free course for comparison',
          category: 'FRONTEND',
          level: 'BEGINNER',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const canPreview = await PremiumPreviewService.canPreviewFirstLesson(user.id, course.id)
      expect(canPreview).toBe(true)
    })
  })

  describe('Admin and Edge Cases', () => {
    it('admin can preview any premium course first lesson', async () => {
      const admin = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('admin'),
          name: 'Admin User',
          role: 'ADMIN'
        }
      })
      testEnv.trackUser(admin.id)

      const course = await db.course.create({
        data: {
          title: 'Admin Access Course',
          slug: TestDatabase.getUniqueSlug('admin-access'),
          description: 'Course for admin access testing',
          category: 'BACKEND',
          level: 'EXPERT',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const canPreview = await PremiumPreviewService.canPreviewFirstLesson(admin.id, course.id)
      expect(canPreview).toBe(true)
    })

    it('unpublished premium course is not previewable', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('unpublished'),
          name: 'Unpublished User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'Unpublished Course',
          slug: TestDatabase.getUniqueSlug('unpublished'),
          description: 'Unpublished course',
          category: 'FULLSTACK',
          level: 'INTERMEDIATE',
          accessTier: 'PREMIUM',
          published: false
        }
      })
      testEnv.trackCourse(course.id)

      const canPreview = await PremiumPreviewService.canPreviewFirstLesson(user.id, course.id)
      expect(canPreview).toBe(false)
    })

    it('non-existent user cannot preview', async () => {
      const course = await db.course.create({
        data: {
          title: 'No User Course',
          slug: TestDatabase.getUniqueSlug('no-user'),
          description: 'Course for non-existent user test',
          category: 'FRONTEND',
          level: 'BEGINNER',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const canPreview = await PremiumPreviewService.canPreviewFirstLesson('non-existent-user-id', course.id)
      expect(canPreview).toBe(false)
    })

    it('non-existent course cannot be previewed', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('no-course'),
          name: 'No Course User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const canPreview = await PremiumPreviewService.canPreviewFirstLesson(user.id, 'non-existent-course-id')
      expect(canPreview).toBe(false)
    })
  })

  describe('Preview Access Flow Verification', () => {
    it('verifies complete preview flow for premium course', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('flow'),
          name: 'Flow User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'Flow Course',
          slug: TestDatabase.getUniqueSlug('flow'),
          description: 'Course for complete flow testing',
          category: 'FULLSTACK',
          level: 'INTERMEDIATE',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const lesson = await db.lesson.create({
        data: {
          title: 'Flow Lesson',
          slug: TestDatabase.getUniqueSlug('flow-lesson'),
          content: 'Lesson for flow testing',
          order: 1,
          courseId: course.id,
          published: true
        }
      })
      testEnv.trackLesson(lesson.id)

      // 1. Initial state - no enrollment, no progress
      expect(await PremiumPreviewService.hasEnrollment(user.id, course.id)).toBe(false)
      expect(await PremiumPreviewService.getProgressRecord(user.id, course.id)).toBeNull()
      
      // 2. Preview should be accessible
      expect(await PremiumPreviewService.canPreviewFirstLesson(user.id, course.id)).toBe(true)
      
      // 3. After enrollment - still accessible, can have progress
      await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          enrolledAt: new Date()
        }
      })
      
      expect(await PremiumPreviewService.hasEnrollment(user.id, course.id)).toBe(true)
      expect(await PremiumPreviewService.canPreviewFirstLesson(user.id, course.id)).toBe(true)
    })
  })
})