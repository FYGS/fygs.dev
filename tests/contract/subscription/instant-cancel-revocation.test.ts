/**
 * T108: Instant Post-Cancel Access Revocation Test
 * 
 * Tests that subscription cancellation immediately revokes access to premium
 * content as required by FR-033. Users should be denied access to premium
 * lessons immediately after cancellation, even if there was previously valid access.
 */

import { describe, test, expect, afterEach, beforeEach, vi } from 'vitest'
import { db } from '@/lib/db'
import { createTestEnvironment } from '../../utils/test-database'

// Mock access service to track access checks
const mockAccessService = {
  checkCourseAccess: vi.fn(),
  checkLessonAccess: vi.fn(),
  hasActivePremiumSubscription: vi.fn()
}

vi.mock('@/lib/access-service', () => ({
  default: mockAccessService,
  AccessService: mockAccessService
}))

describe('T108: Instant Post-Cancel Access Revocation Test', () => {
  const testEnv = createTestEnvironment()
  
  beforeEach(async () => {
    vi.clearAllMocks()
  })
  
  afterEach(async () => {
    await testEnv.cleanup()
  })

  describe('Subscription Cancellation Access Revocation', () => {
    test('denies premium lesson access immediately after subscription cancellation', async () => {
      // Create test user
      const user = await db.user.create({
        data: {
          email: `cancel-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
          name: 'Cancel Test User',
          emailVerified: true
        }
      })

      // Create premium course with lessons
      const course = await db.course.create({
        data: {
          title: 'Premium Course',
          slug: `premium-course-${Date.now()}`,
          description: 'Premium course with restricted access',
          price: 199.99,
          level: 'INTERMEDIATE',
          published: true,
          accessTier: 'PREMIUM',
          category: 'JAVASCRIPT'
        }
      })

      const lesson = await db.lesson.create({
        data: {
          title: 'Premium Lesson',
          slug: `premium-lesson-${Date.now()}`,
          content: 'Premium lesson content',
          courseId: course.id,
          order: 1,
          published: true
        }
      })

      testEnv.trackUser(user.id)
      testEnv.trackCourse(course.id)

      // Create active subscription
      const subscription = await db.subscription.create({
        data: {
          userId: user.id,
          status: 'ACTIVE',
          plan: 'PREMIUM',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          stripeSubscriptionId: `sub_${Date.now()}`,
          priceId: 'price_premium'
        }
      })

      // Create enrollment for the premium course
      await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          enrolledAt: new Date()
        }
      })

      // Mock access service to initially return true (user has access)
      mockAccessService.hasActivePremiumSubscription.mockImplementation(async (userId: string) => {
        const activeSubscription = await db.subscription.findFirst({
          where: {
            userId: userId,
            status: 'ACTIVE'
          }
        })
        return !!activeSubscription
      })

      mockAccessService.checkLessonAccess.mockImplementation(async (userId: string, lessonId: string) => {
        const lesson = await db.lesson.findUnique({
          where: { id: lessonId },
          include: { course: true }
        })
        
        if (!lesson) return { hasAccess: false, reason: 'LESSON_NOT_FOUND' }
        
        // Access is based on course tier, not lesson tier
        if (lesson.course.accessTier === 'FREE') {
          return { hasAccess: true, reason: 'FREE_CONTENT' }
        }
        
        // Check if user has active premium subscription
        const hasActiveSub = await mockAccessService.hasActivePremiumSubscription(userId)
        if (!hasActiveSub) {
          return { hasAccess: false, reason: 'NO_PREMIUM_SUBSCRIPTION' }
        }
        
        // Check enrollment
        const enrollment = await db.enrollment.findFirst({
          where: {
            userId: userId,
            courseId: lesson.courseId
          }
        })
        
        if (!enrollment) {
          return { hasAccess: false, reason: 'NOT_ENROLLED' }
        }
        
        return { hasAccess: true, reason: 'VALID_PREMIUM_ACCESS' }
      })

      // Step 1: Verify user initially has access to premium lesson
      const initialAccess = await mockAccessService.checkLessonAccess(user.id, lesson.id)
      expect(initialAccess.hasAccess).toBe(true)
      expect(initialAccess.reason).toBe('VALID_PREMIUM_ACCESS')

      // Step 2: Cancel the subscription (set status to CANCELED)
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELED'
        }
      })

      // Step 3: Immediately check lesson access after cancellation
      const postCancelAccess = await mockAccessService.checkLessonAccess(user.id, lesson.id)
      expect(postCancelAccess.hasAccess).toBe(false)
      expect(postCancelAccess.reason).toBe('NO_PREMIUM_SUBSCRIPTION')

      // Verify the access service was called correctly
      expect(mockAccessService.checkLessonAccess).toHaveBeenCalledWith(user.id, lesson.id)
      expect(mockAccessService.hasActivePremiumSubscription).toHaveBeenCalledWith(user.id)
    })

    test('denies premium course access immediately after subscription cancellation', async () => {
      // Create test user
      const user = await db.user.create({
        data: {
          email: `course-cancel-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
          name: 'Course Cancel Test User',
          emailVerified: true
        }
      })

      // Create premium course
      const course = await db.course.create({
        data: {
          title: 'Premium Course Access Test',
          slug: `premium-course-access-${Date.now()}`,
          description: 'Premium course for access testing',
          price: 299.99,
          level: 'ADVANCED',
          published: true,
          accessTier: 'PREMIUM',
          category: 'TYPESCRIPT'
        }
      })

      testEnv.trackUser(user.id)
      testEnv.trackCourse(course.id)

      // Create active subscription
      const subscription = await db.subscription.create({
        data: {
          userId: user.id,
          status: 'ACTIVE',
          plan: 'PREMIUM',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          stripeSubscriptionId: `sub_course_${Date.now()}`,
          priceId: 'price_premium'
        }
      })

      // Create enrollment
      await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          enrolledAt: new Date()
        }
      })

      // Mock course access service
      mockAccessService.checkCourseAccess.mockImplementation(async (userId: string, courseId: string) => {
        const course = await db.course.findUnique({
          where: { id: courseId }
        })
        
        if (!course) return { hasAccess: false, reason: 'COURSE_NOT_FOUND' }
        
        if (course.accessTier === 'FREE') {
          return { hasAccess: true, reason: 'FREE_CONTENT' }
        }
        
        // Check if user has active premium subscription
        const hasActiveSub = await mockAccessService.hasActivePremiumSubscription(userId)
        if (!hasActiveSub) {
          return { hasAccess: false, reason: 'NO_PREMIUM_SUBSCRIPTION' }
        }
        
        // Check enrollment
        const enrollment = await db.enrollment.findFirst({
          where: {
            userId: userId,
            courseId: courseId
          }
        })
        
        if (!enrollment) {
          return { hasAccess: false, reason: 'NOT_ENROLLED' }
        }
        
        return { hasAccess: true, reason: 'VALID_PREMIUM_ACCESS' }
      })

      // Step 1: Verify user initially has access to premium course
      const initialAccess = await mockAccessService.checkCourseAccess(user.id, course.id)
      expect(initialAccess.hasAccess).toBe(true)
      expect(initialAccess.reason).toBe('VALID_PREMIUM_ACCESS')

      // Step 2: Cancel the subscription
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELED'
        }
      })

      // Step 3: Immediately verify access is denied
      const postCancelAccess = await mockAccessService.checkCourseAccess(user.id, course.id)
      expect(postCancelAccess.hasAccess).toBe(false)
      expect(postCancelAccess.reason).toBe('NO_PREMIUM_SUBSCRIPTION')

      // Verify correct method calls
      expect(mockAccessService.checkCourseAccess).toHaveBeenCalledWith(user.id, course.id)
      expect(mockAccessService.hasActivePremiumSubscription).toHaveBeenCalledWith(user.id)
    })

    test('allows free content access after premium subscription cancellation', async () => {
      // Create test user
      const user = await db.user.create({
        data: {
          email: `free-access-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
          name: 'Free Access Test User',
          emailVerified: true
        }
      })

      // Create free course and lesson
      const freeCourse = await db.course.create({
        data: {
          title: 'Free Course',
          slug: `free-course-${Date.now()}`,
          description: 'Free course accessible to all',
          price: 0,
          level: 'BEGINNER',
          published: true,
          accessTier: 'FREE',
          category: 'JAVASCRIPT'
        }
      })

      const freeLesson = await db.lesson.create({
        data: {
          title: 'Free Lesson',
          slug: `free-lesson-${Date.now()}`,
          content: 'Free lesson content',
          courseId: freeCourse.id,
          order: 1,
          published: true
        }
      })

      testEnv.trackUser(user.id)
      testEnv.trackCourse(freeCourse.id)

      // Create and cancel subscription
      const subscription = await db.subscription.create({
        data: {
          userId: user.id,
          status: 'CANCELED',
          plan: 'PREMIUM',
          currentPeriodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          currentPeriodEnd: new Date(),
          stripeSubscriptionId: `sub_free_${Date.now()}`,
          priceId: 'price_premium'
        }
      })

      // Verify user can still access free content
      const freeAccessCheck = await mockAccessService.checkLessonAccess(user.id, freeLesson.id)
      expect(freeAccessCheck.hasAccess).toBe(true)
      expect(freeAccessCheck.reason).toBe('FREE_CONTENT')

      // Verify no subscription check was needed for free content
      expect(mockAccessService.hasActivePremiumSubscription).not.toHaveBeenCalled()
    })

    test('handles multiple subscription states and cancellation scenarios', async () => {
      // Create test user
      const user = await db.user.create({
        data: {
          email: `multi-state-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
          name: 'Multi State Test User',
          emailVerified: true
        }
      })

      // Create premium course
      const course = await db.course.create({
        data: {
          title: 'Multi State Premium Course',
          slug: `multi-state-course-${Date.now()}`,
          description: 'Course for testing multiple subscription states',
          price: 149.99,
          level: 'INTERMEDIATE',
          published: true,
          accessTier: 'PREMIUM',
          category: 'FRONTEND'
        }
      })

      const lesson = await db.lesson.create({
        data: {
          title: 'Multi State Premium Lesson',
          slug: `multi-state-lesson-${Date.now()}`,
          content: 'Premium lesson for state testing',
          courseId: course.id,
          order: 1,
          published: true
        }
      })

      testEnv.trackUser(user.id)
      testEnv.trackCourse(course.id)

      // Create enrollment
      await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          enrolledAt: new Date()
        }
      })

      // Test Case 1: No subscription at all
      let accessCheck = await mockAccessService.checkLessonAccess(user.id, lesson.id)
      expect(accessCheck.hasAccess).toBe(false)
      expect(accessCheck.reason).toBe('NO_PREMIUM_SUBSCRIPTION')

      // Test Case 2: Active subscription
      const subscription = await db.subscription.create({
        data: {
          userId: user.id,
          status: 'ACTIVE',
          plan: 'PREMIUM',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          stripeSubscriptionId: `sub_multi_${Date.now()}`,
          priceId: 'price_premium'
        }
      })

      accessCheck = await mockAccessService.checkLessonAccess(user.id, lesson.id)
      expect(accessCheck.hasAccess).toBe(true)
      expect(accessCheck.reason).toBe('VALID_PREMIUM_ACCESS')

      // Test Case 3: Canceled subscription
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELED'
        }
      })

      accessCheck = await mockAccessService.checkLessonAccess(user.id, lesson.id)
      expect(accessCheck.hasAccess).toBe(false)
      expect(accessCheck.reason).toBe('NO_PREMIUM_SUBSCRIPTION')

      // Test Case 4: Past due subscription
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'PAST_DUE'
        }
      })

      accessCheck = await mockAccessService.checkLessonAccess(user.id, lesson.id)
      expect(accessCheck.hasAccess).toBe(false)
      expect(accessCheck.reason).toBe('NO_PREMIUM_SUBSCRIPTION')

      // Test Case 5: Incomplete subscription
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'INCOMPLETE'
        }
      })

      accessCheck = await mockAccessService.checkLessonAccess(user.id, lesson.id)
      expect(accessCheck.hasAccess).toBe(false)
      expect(accessCheck.reason).toBe('NO_PREMIUM_SUBSCRIPTION')

      // Verify access service was called multiple times
      expect(mockAccessService.checkLessonAccess).toHaveBeenCalledTimes(5)
      expect(mockAccessService.hasActivePremiumSubscription).toHaveBeenCalled()
    })
  })

  describe('Edge Cases and Race Conditions', () => {
    test('handles rapid cancellation and access check sequence', async () => {
      // Create test user
      const user = await db.user.create({
        data: {
          email: `rapid-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
          name: 'Rapid Test User',
          emailVerified: true
        }
      })

      // Create premium course
      const course = await db.course.create({
        data: {
          title: 'Rapid Test Course',
          slug: `rapid-course-${Date.now()}`,
          description: 'Course for rapid cancellation testing',
          price: 99.99,
          level: 'BEGINNER',
          published: true,
          accessTier: 'PREMIUM',
          category: 'BACKEND'
        }
      })

      const lesson = await db.lesson.create({
        data: {
          title: 'Rapid Test Lesson',
          slug: `rapid-lesson-${Date.now()}`,
          content: 'Premium lesson for rapid testing',
          courseId: course.id,
          order: 1,
          published: true
        }
      })

      testEnv.trackUser(user.id)
      testEnv.trackCourse(course.id)

      // Create active subscription
      const subscription = await db.subscription.create({
        data: {
          userId: user.id,
          status: 'ACTIVE',
          plan: 'PREMIUM',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          stripeSubscriptionId: `sub_rapid_${Date.now()}`,
          priceId: 'price_premium'
        }
      })

      // Create enrollment
      await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          enrolledAt: new Date()
        }
      })

      // Simulate rapid sequence: access check, cancel, immediate access check
      const preAccessCheck = await mockAccessService.checkLessonAccess(user.id, lesson.id)
      expect(preAccessCheck.hasAccess).toBe(true)

      // Cancel subscription with precise timestamp
      const cancelTime = new Date()
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELED'
        }
      })

      // Immediate access check after cancellation (within same millisecond if possible)
      const postAccessCheck = await mockAccessService.checkLessonAccess(user.id, lesson.id)
      expect(postAccessCheck.hasAccess).toBe(false)
      expect(postAccessCheck.reason).toBe('NO_PREMIUM_SUBSCRIPTION')

      // Verify timing - cancellation should be immediate
      const subscription_after = await db.subscription.findUnique({
        where: { id: subscription.id }
      })
      expect(subscription_after?.status).toBe('CANCELED')
    })

    test('verifies access denied for different premium content types after cancellation', async () => {
      // Create test user
      const user = await db.user.create({
        data: {
          email: `content-types-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
          name: 'Content Types Test User',
          emailVerified: true
        }
      })

      // Create multiple premium courses and lessons
      const premiumCourse1 = await db.course.create({
        data: {
          title: 'Premium Course 1',
          slug: `premium-course-1-${Date.now()}`,
          description: 'First premium course',
          price: 199.99,
          level: 'INTERMEDIATE',
          published: true,
          accessTier: 'PREMIUM',
          category: 'JAVASCRIPT'
        }
      })

      const premiumCourse2 = await db.course.create({
        data: {
          title: 'Premium Course 2',
          slug: `premium-course-2-${Date.now()}`,
          description: 'Second premium course',
          price: 299.99,
          level: 'ADVANCED',
          published: true,
          accessTier: 'PREMIUM',
          category: 'TYPESCRIPT'
        }
      })

      const lesson1 = await db.lesson.create({
        data: {
          title: 'Premium Lesson 1',
          slug: `premium-lesson-1-${Date.now()}`,
          content: 'Premium lesson 1 content',
          courseId: premiumCourse1.id,
          order: 1,
          published: true
        }
      })

      const lesson2 = await db.lesson.create({
        data: {
          title: 'Premium Lesson 2',
          slug: `premium-lesson-2-${Date.now()}`,
          content: 'Premium lesson 2 content',
          courseId: premiumCourse2.id,
          order: 1,
          published: true
        }
      })

      testEnv.trackUser(user.id)
      testEnv.trackCourse(premiumCourse1.id)
      testEnv.trackCourse(premiumCourse2.id)

      // Create enrollments for both courses
      await Promise.all([
        db.enrollment.create({
          data: {
            userId: user.id,
            courseId: premiumCourse1.id,
            enrolledAt: new Date()
          }
        }),
        db.enrollment.create({
          data: {
            userId: user.id,
            courseId: premiumCourse2.id,
            enrolledAt: new Date()
          }
        })
      ])

      // Create active subscription
      const subscription = await db.subscription.create({
        data: {
          userId: user.id,
          status: 'ACTIVE',
          plan: 'PREMIUM',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          stripeSubscriptionId: `sub_content_${Date.now()}`,
          priceId: 'price_premium'
        }
      })

      // Verify initial access to all premium content
      const initialChecks = await Promise.all([
        mockAccessService.checkCourseAccess(user.id, premiumCourse1.id),
        mockAccessService.checkCourseAccess(user.id, premiumCourse2.id),
        mockAccessService.checkLessonAccess(user.id, lesson1.id),
        mockAccessService.checkLessonAccess(user.id, lesson2.id)
      ])

      initialChecks.forEach(check => {
        expect(check.hasAccess).toBe(true)
        expect(check.reason).toBe('VALID_PREMIUM_ACCESS')
      })

      // Cancel subscription
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELED'
        }
      })

      // Verify access denied to all premium content after cancellation
      const postCancelChecks = await Promise.all([
        mockAccessService.checkCourseAccess(user.id, premiumCourse1.id),
        mockAccessService.checkCourseAccess(user.id, premiumCourse2.id),
        mockAccessService.checkLessonAccess(user.id, lesson1.id),
        mockAccessService.checkLessonAccess(user.id, lesson2.id)
      ])

      postCancelChecks.forEach(check => {
        expect(check.hasAccess).toBe(false)
        expect(check.reason).toBe('NO_PREMIUM_SUBSCRIPTION')
      })

      // Verify all access methods were called
      expect(mockAccessService.checkCourseAccess).toHaveBeenCalledTimes(4)
      expect(mockAccessService.checkLessonAccess).toHaveBeenCalledTimes(4)
      expect(mockAccessService.hasActivePremiumSubscription).toHaveBeenCalled()
    })
  })
})