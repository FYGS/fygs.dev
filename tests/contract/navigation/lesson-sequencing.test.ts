/**
 * T116: Lesson Navigation Sequencing Tests
 * 
 * Tests lesson navigation logic as required by FR-027.
 * Verifies published-only next/previous navigation and proper access gating.
 */

import { describe, it, expect, afterEach } from 'vitest'
import { db } from '@/lib/db'
import { createTestEnvironment, TestDatabase } from '../../utils/test-database'

// Lesson navigation service for handling sequential lesson access
class LessonNavigationService {
  /**
   * Get the next lesson in sequence (published only)
   */
  static async getNextLesson(currentLessonId: string, userId: string): Promise<{ id: string; title: string } | null> {
    const currentLesson = await db.lesson.findUnique({
      where: { id: currentLessonId },
      include: { course: true }
    })

    if (!currentLesson) return null

    // Check if user has access to the course
    const hasAccess = await this.hasAccessToCourse(userId, currentLesson.courseId)
    if (!hasAccess) return null

    // Find next published lesson in order
    const nextLesson = await db.lesson.findFirst({
      where: {
        courseId: currentLesson.courseId,
        order: { gt: currentLesson.order },
        published: true
      },
      orderBy: { order: 'asc' },
      select: { id: true, title: true }
    })

    return nextLesson
  }

  /**
   * Get the previous lesson in sequence (published only)
   */
  static async getPreviousLesson(currentLessonId: string, userId: string): Promise<{ id: string; title: string } | null> {
    const currentLesson = await db.lesson.findUnique({
      where: { id: currentLessonId },
      include: { course: true }
    })

    if (!currentLesson) return null

    // Check if user has access to the course
    const hasAccess = await this.hasAccessToCourse(userId, currentLesson.courseId)
    if (!hasAccess) return null

    // Find previous published lesson in order
    const previousLesson = await db.lesson.findFirst({
      where: {
        courseId: currentLesson.courseId,
        order: { lt: currentLesson.order },
        published: true
      },
      orderBy: { order: 'desc' },
      select: { id: true, title: true }
    })

    return previousLesson
  }

  /**
   * Check if user has access to a specific course
   */
  static async hasAccessToCourse(userId: string, courseId: string): Promise<boolean> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: true,
        enrollments: { where: { courseId } }
      }
    })

    if (!user) return false

    // Admin always has access
    if (user.role === 'ADMIN') return true

    const course = await db.course.findUnique({ where: { id: courseId } })
    if (!course) return false

    // Free courses are accessible to everyone
    if (course.accessTier === 'FREE') return true

    // Premium courses require enrollment or active subscription
    if (user.enrollments.length > 0) return true

    const hasActiveSubscription = user.subscriptions.some(sub => sub.status === 'ACTIVE' && !sub.cancelAtPeriodEnd)
    return hasActiveSubscription
  }

  /**
   * Get lesson navigation context (previous, current, next)
   */
  static async getLessonNavigation(lessonId: string, userId: string) {
    const current = await db.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, title: true, order: true, courseId: true }
    })

    if (!current) return null

    const hasAccess = await this.hasAccessToCourse(userId, current.courseId)
    if (!hasAccess) return null

    const [previous, next] = await Promise.all([
      this.getPreviousLesson(lessonId, userId),
      this.getNextLesson(lessonId, userId)
    ])

    return {
      previous,
      current,
      next,
      hasPrevious: !!previous,
      hasNext: !!next
    }
  }

  /**
   * Check if a specific lesson is accessible to a user
   */
  static async canAccessLesson(lessonId: string, userId: string): Promise<boolean> {
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true }
    })

    if (!lesson || !lesson.published) return false

    return await this.hasAccessToCourse(userId, lesson.courseId)
  }
}

describe('T116: Lesson Navigation Sequencing Tests', () => {
  const testEnv = createTestEnvironment()

  afterEach(async () => {
    await testEnv.cleanup()
  })

  describe('Basic Navigation Sequencing', () => {
    it('returns next published lesson in sequence', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('nav'),
          name: 'Navigation User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'Navigation Course',
          slug: TestDatabase.getUniqueSlug('nav-course'),
          description: 'Course for navigation testing',
          category: 'FRONTEND',
          level: 'BEGINNER',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const lesson1 = await db.lesson.create({
        data: {
          title: 'Lesson 1',
          slug: TestDatabase.getUniqueSlug('lesson-1'),
          content: 'First lesson content',
          order: 1,
          courseId: course.id,
          published: true
        }
      })
      testEnv.trackLesson(lesson1.id)

      const lesson2 = await db.lesson.create({
        data: {
          title: 'Lesson 2',
          slug: TestDatabase.getUniqueSlug('lesson-2'),
          content: 'Second lesson content',
          order: 2,
          courseId: course.id,
          published: true
        }
      })
      testEnv.trackLesson(lesson2.id)

      const nextLesson = await LessonNavigationService.getNextLesson(lesson1.id, user.id)
      expect(nextLesson).toBeTruthy()
      expect(nextLesson?.id).toBe(lesson2.id)
      expect(nextLesson?.title).toBe('Lesson 2')
    })

    it('returns previous published lesson in sequence', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('prev'),
          name: 'Previous User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'Previous Course',
          slug: TestDatabase.getUniqueSlug('prev-course'),
          description: 'Course for previous testing',
          category: 'BACKEND',
          level: 'INTERMEDIATE',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const lesson1 = await db.lesson.create({
        data: {
          title: 'First Lesson',
          slug: TestDatabase.getUniqueSlug('first-lesson'),
          content: 'First lesson content',
          order: 1,
          courseId: course.id,
          published: true
        }
      })
      testEnv.trackLesson(lesson1.id)

      const lesson2 = await db.lesson.create({
        data: {
          title: 'Second Lesson',
          slug: TestDatabase.getUniqueSlug('second-lesson'),
          content: 'Second lesson content',
          order: 2,
          courseId: course.id,
          published: true
        }
      })
      testEnv.trackLesson(lesson2.id)

      const previousLesson = await LessonNavigationService.getPreviousLesson(lesson2.id, user.id)
      expect(previousLesson).toBeTruthy()
      expect(previousLesson?.id).toBe(lesson1.id)
      expect(previousLesson?.title).toBe('First Lesson')
    })

    it('returns null when no next lesson exists', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('last'),
          name: 'Last User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'Single Lesson Course',
          slug: TestDatabase.getUniqueSlug('single-course'),
          description: 'Course with single lesson',
          category: 'FULLSTACK',
          level: 'ADVANCED',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const lesson = await db.lesson.create({
        data: {
          title: 'Only Lesson',
          slug: TestDatabase.getUniqueSlug('only-lesson'),
          content: 'Only lesson content',
          order: 1,
          courseId: course.id,
          published: true
        }
      })
      testEnv.trackLesson(lesson.id)

      const nextLesson = await LessonNavigationService.getNextLesson(lesson.id, user.id)
      expect(nextLesson).toBeNull()
    })

    it('returns null when no previous lesson exists', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('first'),
          name: 'First User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'First Lesson Course',
          slug: TestDatabase.getUniqueSlug('first-course'),
          description: 'Course starting from first lesson',
          category: 'FRONTEND',
          level: 'BEGINNER',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const lesson = await db.lesson.create({
        data: {
          title: 'First Lesson',
          slug: TestDatabase.getUniqueSlug('start-lesson'),
          content: 'Starting lesson content',
          order: 1,
          courseId: course.id,
          published: true
        }
      })
      testEnv.trackLesson(lesson.id)

      const previousLesson = await LessonNavigationService.getPreviousLesson(lesson.id, user.id)
      expect(previousLesson).toBeNull()
    })
  })

  describe('Published-Only Navigation', () => {
    it('skips unpublished lessons in next navigation', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('skip-next'),
          name: 'Skip Next User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'Skip Course',
          slug: TestDatabase.getUniqueSlug('skip-course'),
          description: 'Course with unpublished lessons',
          category: 'BACKEND',
          level: 'INTERMEDIATE',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const lesson1 = await db.lesson.create({
        data: {
          title: 'Published Lesson 1',
          slug: TestDatabase.getUniqueSlug('pub-lesson-1'),
          content: 'Published lesson content',
          order: 1,
          courseId: course.id,
          published: true
        }
      })
      testEnv.trackLesson(lesson1.id)

      // Unpublished lesson that should be skipped
      const unpublishedLesson = await db.lesson.create({
        data: {
          title: 'Unpublished Lesson',
          slug: TestDatabase.getUniqueSlug('unpub-lesson'),
          content: 'Unpublished lesson content',
          order: 2,
          courseId: course.id,
          published: false
        }
      })
      testEnv.trackLesson(unpublishedLesson.id)

      const lesson3 = await db.lesson.create({
        data: {
          title: 'Published Lesson 3',
          slug: TestDatabase.getUniqueSlug('pub-lesson-3'),
          content: 'Third published lesson content',
          order: 3,
          courseId: course.id,
          published: true
        }
      })
      testEnv.trackLesson(lesson3.id)

      const nextLesson = await LessonNavigationService.getNextLesson(lesson1.id, user.id)
      expect(nextLesson).toBeTruthy()
      expect(nextLesson?.id).toBe(lesson3.id)
      expect(nextLesson?.title).toBe('Published Lesson 3')
    })

    it('skips unpublished lessons in previous navigation', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('skip-prev'),
          name: 'Skip Previous User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'Skip Previous Course',
          slug: TestDatabase.getUniqueSlug('skip-prev-course'),
          description: 'Course with unpublished previous lessons',
          category: 'FULLSTACK',
          level: 'ADVANCED',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const lesson1 = await db.lesson.create({
        data: {
          title: 'Published First',
          slug: TestDatabase.getUniqueSlug('pub-first'),
          content: 'First published lesson',
          order: 1,
          courseId: course.id,
          published: true
        }
      })
      testEnv.trackLesson(lesson1.id)

      // Unpublished lesson that should be skipped
      const unpublishedLesson = await db.lesson.create({
        data: {
          title: 'Unpublished Middle',
          slug: TestDatabase.getUniqueSlug('unpub-middle'),
          content: 'Unpublished middle lesson',
          order: 2,
          courseId: course.id,
          published: false
        }
      })
      testEnv.trackLesson(unpublishedLesson.id)

      const lesson3 = await db.lesson.create({
        data: {
          title: 'Published Last',
          slug: TestDatabase.getUniqueSlug('pub-last'),
          content: 'Last published lesson',
          order: 3,
          courseId: course.id,
          published: true
        }
      })
      testEnv.trackLesson(lesson3.id)

      const previousLesson = await LessonNavigationService.getPreviousLesson(lesson3.id, user.id)
      expect(previousLesson).toBeTruthy()
      expect(previousLesson?.id).toBe(lesson1.id)
      expect(previousLesson?.title).toBe('Published First')
    })
  })

  describe('Access Gating', () => {
    it('denies navigation for premium course without subscription', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('no-access'),
          name: 'No Access User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'Premium Course',
          slug: TestDatabase.getUniqueSlug('premium-nav'),
          description: 'Premium course for access testing',
          category: 'BACKEND',
          level: 'EXPERT',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const lesson = await db.lesson.create({
        data: {
          title: 'Premium Lesson',
          slug: TestDatabase.getUniqueSlug('premium-lesson'),
          content: 'Premium lesson content',
          order: 1,
          courseId: course.id,
          published: true
        }
      })
      testEnv.trackLesson(lesson.id)

      const nextLesson = await LessonNavigationService.getNextLesson(lesson.id, user.id)
      expect(nextLesson).toBeNull()

      const previousLesson = await LessonNavigationService.getPreviousLesson(lesson.id, user.id)
      expect(previousLesson).toBeNull()
    })

    it('allows navigation for premium course with subscription', async () => {
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
          priceId: 'price_premium',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      })

      const course = await db.course.create({
        data: {
          title: 'Premium Subscribed Course',
          slug: TestDatabase.getUniqueSlug('premium-sub'),
          description: 'Premium course for subscribed users',
          category: 'FULLSTACK',
          level: 'EXPERT',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const lesson1 = await db.lesson.create({
        data: {
          title: 'Premium Lesson 1',
          slug: TestDatabase.getUniqueSlug('premium-1'),
          content: 'First premium lesson',
          order: 1,
          courseId: course.id,
          published: true
        }
      })
      testEnv.trackLesson(lesson1.id)

      const lesson2 = await db.lesson.create({
        data: {
          title: 'Premium Lesson 2',
          slug: TestDatabase.getUniqueSlug('premium-2'),
          content: 'Second premium lesson',
          order: 2,
          courseId: course.id,
          published: true
        }
      })
      testEnv.trackLesson(lesson2.id)

      const nextLesson = await LessonNavigationService.getNextLesson(lesson1.id, user.id)
      expect(nextLesson).toBeTruthy()
      expect(nextLesson?.id).toBe(lesson2.id)
    })

    it('allows admin access to all lessons', async () => {
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
          slug: TestDatabase.getUniqueSlug('admin-course'),
          description: 'Course for admin access testing',
          category: 'BACKEND',
          level: 'EXPERT',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const lesson1 = await db.lesson.create({
        data: {
          title: 'Admin Lesson 1',
          slug: TestDatabase.getUniqueSlug('admin-1'),
          content: 'First admin lesson',
          order: 1,
          courseId: course.id,
          published: true
        }
      })
      testEnv.trackLesson(lesson1.id)

      const lesson2 = await db.lesson.create({
        data: {
          title: 'Admin Lesson 2',
          slug: TestDatabase.getUniqueSlug('admin-2'),
          content: 'Second admin lesson',
          order: 2,
          courseId: course.id,
          published: true
        }
      })
      testEnv.trackLesson(lesson2.id)

      const nextLesson = await LessonNavigationService.getNextLesson(lesson1.id, admin.id)
      expect(nextLesson).toBeTruthy()
      expect(nextLesson?.id).toBe(lesson2.id)
    })
  })

  describe('Navigation Context', () => {
    it('provides complete navigation context', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('context'),
          name: 'Context User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'Context Course',
          slug: TestDatabase.getUniqueSlug('context-course'),
          description: 'Course for context testing',
          category: 'FRONTEND',
          level: 'INTERMEDIATE',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const lesson1 = await db.lesson.create({
        data: {
          title: 'Context Lesson 1',
          slug: TestDatabase.getUniqueSlug('context-1'),
          content: 'First context lesson',
          order: 1,
          courseId: course.id,
          published: true
        }
      })
      testEnv.trackLesson(lesson1.id)

      const lesson2 = await db.lesson.create({
        data: {
          title: 'Context Lesson 2',
          slug: TestDatabase.getUniqueSlug('context-2'),
          content: 'Second context lesson',
          order: 2,
          courseId: course.id,
          published: true
        }
      })
      testEnv.trackLesson(lesson2.id)

      const lesson3 = await db.lesson.create({
        data: {
          title: 'Context Lesson 3',
          slug: TestDatabase.getUniqueSlug('context-3'),
          content: 'Third context lesson',
          order: 3,
          courseId: course.id,
          published: true
        }
      })
      testEnv.trackLesson(lesson3.id)

      const navigation = await LessonNavigationService.getLessonNavigation(lesson2.id, user.id)
      expect(navigation).toBeTruthy()
      expect(navigation?.current.id).toBe(lesson2.id)
      expect(navigation?.previous?.id).toBe(lesson1.id)
      expect(navigation?.next?.id).toBe(lesson3.id)
      expect(navigation?.hasPrevious).toBe(true)
      expect(navigation?.hasNext).toBe(true)
    })

    it('handles navigation context for first lesson', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('first-context'),
          name: 'First Context User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'First Context Course',
          slug: TestDatabase.getUniqueSlug('first-context'),
          description: 'Course for first lesson context',
          category: 'BACKEND',
          level: 'BEGINNER',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const lesson1 = await db.lesson.create({
        data: {
          title: 'First Context Lesson',
          slug: TestDatabase.getUniqueSlug('first-context-lesson'),
          content: 'First lesson for context',
          order: 1,
          courseId: course.id,
          published: true
        }
      })
      testEnv.trackLesson(lesson1.id)

      const lesson2 = await db.lesson.create({
        data: {
          title: 'Second Context Lesson',
          slug: TestDatabase.getUniqueSlug('second-context-lesson'),
          content: 'Second lesson for context',
          order: 2,
          courseId: course.id,
          published: true
        }
      })
      testEnv.trackLesson(lesson2.id)

      const navigation = await LessonNavigationService.getLessonNavigation(lesson1.id, user.id)
      expect(navigation).toBeTruthy()
      expect(navigation?.current.id).toBe(lesson1.id)
      expect(navigation?.previous).toBeNull()
      expect(navigation?.next?.id).toBe(lesson2.id)
      expect(navigation?.hasPrevious).toBe(false)
      expect(navigation?.hasNext).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('handles non-existent lesson gracefully', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('nonexistent'),
          name: 'Non-existent User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const nextLesson = await LessonNavigationService.getNextLesson('non-existent-id', user.id)
      expect(nextLesson).toBeNull()

      const previousLesson = await LessonNavigationService.getPreviousLesson('non-existent-id', user.id)
      expect(previousLesson).toBeNull()

      const navigation = await LessonNavigationService.getLessonNavigation('non-existent-id', user.id)
      expect(navigation).toBeNull()
    })

    it('handles non-existent user gracefully', async () => {
      const course = await db.course.create({
        data: {
          title: 'No User Course',
          slug: TestDatabase.getUniqueSlug('no-user'),
          description: 'Course for non-existent user test',
          category: 'FRONTEND',
          level: 'BEGINNER',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const lesson = await db.lesson.create({
        data: {
          title: 'No User Lesson',
          slug: TestDatabase.getUniqueSlug('no-user-lesson'),
          content: 'Lesson for non-existent user',
          order: 1,
          courseId: course.id,
          published: true
        }
      })
      testEnv.trackLesson(lesson.id)

      const nextLesson = await LessonNavigationService.getNextLesson(lesson.id, 'non-existent-user')
      expect(nextLesson).toBeNull()

      const canAccess = await LessonNavigationService.canAccessLesson(lesson.id, 'non-existent-user')
      expect(canAccess).toBe(false)
    })

    it('handles unpublished current lesson', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('unpub-current'),
          name: 'Unpublished Current User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'Unpublished Current Course',
          slug: TestDatabase.getUniqueSlug('unpub-current'),
          description: 'Course with unpublished current lesson',
          category: 'FULLSTACK',
          level: 'INTERMEDIATE',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const unpublishedLesson = await db.lesson.create({
        data: {
          title: 'Unpublished Current',
          slug: TestDatabase.getUniqueSlug('unpub-current-lesson'),
          content: 'Unpublished current lesson',
          order: 1,
          courseId: course.id,
          published: false
        }
      })
      testEnv.trackLesson(unpublishedLesson.id)

      const canAccess = await LessonNavigationService.canAccessLesson(unpublishedLesson.id, user.id)
      expect(canAccess).toBe(false)
    })
  })
})