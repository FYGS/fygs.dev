/**
 * T118: Access Check Idempotency Tests
 * 
 * Tests access checking idempotency as required by FR-020.
 * Ensures no silent enrollment creation during entitlement evaluation.
 */

import { describe, it, expect, afterEach } from 'vitest'
import { db } from '@/lib/db'
import { createTestEnvironment, TestDatabase } from '../../utils/test-database'

// Service for access checking without side effects
class AccessCheckService {
  /**
   * Check if user has access to course without creating enrollment
   */
  static async checkCourseAccess(userId: string, courseId: string): Promise<{ hasAccess: boolean; reason: string }> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: true,
        enrollments: { where: { courseId } }
      }
    })

    if (!user) {
      return { hasAccess: false, reason: 'User not found' }
    }

    const course = await db.course.findUnique({ where: { id: courseId } })
    if (!course) {
      return { hasAccess: false, reason: 'Course not found' }
    }

    // Admin always has access
    if (user.role === 'ADMIN') {
      return { hasAccess: true, reason: 'Admin access' }
    }

    // Free courses are accessible to everyone
    if (course.accessTier === 'FREE') {
      return { hasAccess: true, reason: 'Free course' }
    }

    // Check existing enrollment
    if (user.enrollments.length > 0) {
      return { hasAccess: true, reason: 'Enrolled' }
    }

    // Check active subscription
    const hasActiveSubscription = user.subscriptions.some(sub => sub.status === 'ACTIVE' && !sub.cancelAtPeriodEnd)
    if (hasActiveSubscription) {
      return { hasAccess: true, reason: 'Active subscription' }
    }

    return { hasAccess: false, reason: 'No access' }
  }

  /**
   * Count enrollments for a user (to verify no side effects)
   */
  static async countUserEnrollments(userId: string): Promise<number> {
    return await db.enrollment.count({ where: { userId } })
  }

  /**
   * Count total enrollments in system (to verify no side effects)
   */
  static async countTotalEnrollments(): Promise<number> {
    return await db.enrollment.count()
  }
}

describe('T118: Access Check Idempotency Tests', () => {
  const testEnv = createTestEnvironment()

  afterEach(async () => {
    await testEnv.cleanup()
  })

  describe('Idempotent Access Checking', () => {
    it('does not create enrollment when checking access to free course', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('idempotent'),
          name: 'Idempotent User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'Free Idempotent Course',
          slug: TestDatabase.getUniqueSlug('free-idempotent'),
          description: 'Free course for idempotency testing',
          category: 'FRONTEND',
          level: 'BEGINNER',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const enrollmentsBefore = await AccessCheckService.countUserEnrollments(user.id)
      const totalEnrollmentsBefore = await AccessCheckService.countTotalEnrollments()

      // Check access multiple times
      const access1 = await AccessCheckService.checkCourseAccess(user.id, course.id)
      const access2 = await AccessCheckService.checkCourseAccess(user.id, course.id)
      const access3 = await AccessCheckService.checkCourseAccess(user.id, course.id)

      const enrollmentsAfter = await AccessCheckService.countUserEnrollments(user.id)
      const totalEnrollmentsAfter = await AccessCheckService.countTotalEnrollments()

      // Verify access checks are consistent
      expect(access1.hasAccess).toBe(true)
      expect(access2.hasAccess).toBe(true)
      expect(access3.hasAccess).toBe(true)
      expect(access1.reason).toBe('Free course')

      // Verify no enrollments were created
      expect(enrollmentsBefore).toBe(0)
      expect(enrollmentsAfter).toBe(0)
      expect(totalEnrollmentsBefore).toBe(totalEnrollmentsAfter)
    })

    it('does not create enrollment when checking access to premium course without subscription', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('no-sub'),
          name: 'No Subscription User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'Premium Idempotent Course',
          slug: TestDatabase.getUniqueSlug('premium-idempotent'),
          description: 'Premium course for idempotency testing',
          category: 'BACKEND',
          level: 'INTERMEDIATE',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const enrollmentsBefore = await AccessCheckService.countUserEnrollments(user.id)
      const totalEnrollmentsBefore = await AccessCheckService.countTotalEnrollments()

      // Check access multiple times
      const access1 = await AccessCheckService.checkCourseAccess(user.id, course.id)
      const access2 = await AccessCheckService.checkCourseAccess(user.id, course.id)
      const access3 = await AccessCheckService.checkCourseAccess(user.id, course.id)

      const enrollmentsAfter = await AccessCheckService.countUserEnrollments(user.id)
      const totalEnrollmentsAfter = await AccessCheckService.countTotalEnrollments()

      // Verify access is denied consistently
      expect(access1.hasAccess).toBe(false)
      expect(access2.hasAccess).toBe(false)
      expect(access3.hasAccess).toBe(false)
      expect(access1.reason).toBe('No access')

      // Verify no enrollments were created
      expect(enrollmentsBefore).toBe(0)
      expect(enrollmentsAfter).toBe(0)
      expect(totalEnrollmentsBefore).toBe(totalEnrollmentsAfter)
    })

    it('does not modify existing enrollment when checking access', async () => {
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
          title: 'Enrolled Course',
          slug: TestDatabase.getUniqueSlug('enrolled-course'),
          description: 'Course with existing enrollment',
          category: 'FULLSTACK',
          level: 'ADVANCED',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      // Create existing enrollment
      const existingEnrollment = await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          enrolledAt: new Date()
        }
      })

      const enrollmentsBefore = await AccessCheckService.countUserEnrollments(user.id)
      const totalEnrollmentsBefore = await AccessCheckService.countTotalEnrollments()

      // Check access multiple times
      const access1 = await AccessCheckService.checkCourseAccess(user.id, course.id)
      const access2 = await AccessCheckService.checkCourseAccess(user.id, course.id)

      const enrollmentsAfter = await AccessCheckService.countUserEnrollments(user.id)
      const totalEnrollmentsAfter = await AccessCheckService.countTotalEnrollments()

      // Verify access granted due to existing enrollment
      expect(access1.hasAccess).toBe(true)
      expect(access2.hasAccess).toBe(true)
      expect(access1.reason).toBe('Enrolled')

      // Verify enrollment count unchanged
      expect(enrollmentsBefore).toBe(1)
      expect(enrollmentsAfter).toBe(1)
      expect(totalEnrollmentsBefore).toBe(totalEnrollmentsAfter)

      // Verify original enrollment is unchanged
      const unchangedEnrollment = await db.enrollment.findUnique({
        where: { id: existingEnrollment.id }
      })
      expect(unchangedEnrollment?.enrolledAt).toEqual(existingEnrollment.enrolledAt)
    })

    it('does not create subscription when checking access with subscription', async () => {
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
          title: 'Subscription Course',
          slug: TestDatabase.getUniqueSlug('subscription-course'),
          description: 'Course for subscription access',
          category: 'BACKEND',
          level: 'EXPERT',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const enrollmentsBefore = await AccessCheckService.countUserEnrollments(user.id)
      const subscriptionsBefore = await db.subscription.count({ where: { userId: user.id } })

      // Check access multiple times
      const access1 = await AccessCheckService.checkCourseAccess(user.id, course.id)
      const access2 = await AccessCheckService.checkCourseAccess(user.id, course.id)

      const enrollmentsAfter = await AccessCheckService.countUserEnrollments(user.id)
      const subscriptionsAfter = await db.subscription.count({ where: { userId: user.id } })

      // Verify access granted due to subscription
      expect(access1.hasAccess).toBe(true)
      expect(access2.hasAccess).toBe(true)
      expect(access1.reason).toBe('Active subscription')

      // Verify no side effects
      expect(enrollmentsBefore).toBe(0)
      expect(enrollmentsAfter).toBe(0)
      expect(subscriptionsBefore).toBe(1)
      expect(subscriptionsAfter).toBe(1)
    })

    it('admin access check does not create enrollments', async () => {
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
          category: 'FULLSTACK',
          level: 'EXPERT',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const enrollmentsBefore = await AccessCheckService.countUserEnrollments(admin.id)
      const totalEnrollmentsBefore = await AccessCheckService.countTotalEnrollments()

      // Check access multiple times as admin
      const access1 = await AccessCheckService.checkCourseAccess(admin.id, course.id)
      const access2 = await AccessCheckService.checkCourseAccess(admin.id, course.id)

      const enrollmentsAfter = await AccessCheckService.countUserEnrollments(admin.id)
      const totalEnrollmentsAfter = await AccessCheckService.countTotalEnrollments()

      // Verify admin access granted
      expect(access1.hasAccess).toBe(true)
      expect(access2.hasAccess).toBe(true)
      expect(access1.reason).toBe('Admin access')

      // Verify no enrollments created for admin
      expect(enrollmentsBefore).toBe(0)
      expect(enrollmentsAfter).toBe(0)
      expect(totalEnrollmentsBefore).toBe(totalEnrollmentsAfter)
    })
  })

  describe('Concurrent Access Checks', () => {
    it('handles concurrent access checks without race conditions', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('concurrent'),
          name: 'Concurrent User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'Concurrent Course',
          slug: TestDatabase.getUniqueSlug('concurrent'),
          description: 'Course for concurrent testing',
          category: 'FRONTEND',
          level: 'BEGINNER',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const enrollmentsBefore = await AccessCheckService.countTotalEnrollments()

      // Run multiple concurrent access checks
      const concurrentChecks = await Promise.all([
        AccessCheckService.checkCourseAccess(user.id, course.id),
        AccessCheckService.checkCourseAccess(user.id, course.id),
        AccessCheckService.checkCourseAccess(user.id, course.id),
        AccessCheckService.checkCourseAccess(user.id, course.id),
        AccessCheckService.checkCourseAccess(user.id, course.id)
      ])

      const enrollmentsAfter = await AccessCheckService.countTotalEnrollments()

      // Verify all checks succeeded
      concurrentChecks.forEach(access => {
        expect(access.hasAccess).toBe(true)
        expect(access.reason).toBe('Free course')
      })

      // Verify no enrollments created despite concurrent access
      expect(enrollmentsBefore).toBe(enrollmentsAfter)
    })

    it('handles mixed concurrent checks (different users) without interference', async () => {
      const user1 = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('user1'),
          name: 'User 1',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user1.id)

      const user2 = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('user2'),
          name: 'User 2',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user2.id)

      const course = await db.course.create({
        data: {
          title: 'Mixed Access Course',
          slug: TestDatabase.getUniqueSlug('mixed-access'),
          description: 'Course for mixed access testing',
          category: 'BACKEND',
          level: 'INTERMEDIATE',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const totalEnrollmentsBefore = await AccessCheckService.countTotalEnrollments()

      // Run concurrent checks for different users
      const mixedChecks = await Promise.all([
        AccessCheckService.checkCourseAccess(user1.id, course.id),
        AccessCheckService.checkCourseAccess(user2.id, course.id),
        AccessCheckService.checkCourseAccess(user1.id, course.id),
        AccessCheckService.checkCourseAccess(user2.id, course.id)
      ])

      const totalEnrollmentsAfter = await AccessCheckService.countTotalEnrollments()

      // Verify all checks succeeded
      mixedChecks.forEach(access => {
        expect(access.hasAccess).toBe(true)
        expect(access.reason).toBe('Free course')
      })

      // Verify no side effects for either user
      expect(totalEnrollmentsBefore).toBe(totalEnrollmentsAfter)
      expect(await AccessCheckService.countUserEnrollments(user1.id)).toBe(0)
      expect(await AccessCheckService.countUserEnrollments(user2.id)).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('handles non-existent user without creating records', async () => {
      const course = await db.course.create({
        data: {
          title: 'No User Course',
          slug: TestDatabase.getUniqueSlug('no-user'),
          description: 'Course for non-existent user test',
          category: 'FULLSTACK',
          level: 'BEGINNER',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const totalEnrollmentsBefore = await AccessCheckService.countTotalEnrollments()

      const access = await AccessCheckService.checkCourseAccess('non-existent-user', course.id)

      const totalEnrollmentsAfter = await AccessCheckService.countTotalEnrollments()

      expect(access.hasAccess).toBe(false)
      expect(access.reason).toBe('User not found')
      expect(totalEnrollmentsBefore).toBe(totalEnrollmentsAfter)
    })

    it('handles non-existent course without creating records', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('no-course'),
          name: 'No Course User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const totalEnrollmentsBefore = await AccessCheckService.countTotalEnrollments()

      const access = await AccessCheckService.checkCourseAccess(user.id, 'non-existent-course')

      const totalEnrollmentsAfter = await AccessCheckService.countTotalEnrollments()

      expect(access.hasAccess).toBe(false)
      expect(access.reason).toBe('Course not found')
      expect(totalEnrollmentsBefore).toBe(totalEnrollmentsAfter)
    })

    it('handles unpublished course access check without side effects', async () => {
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
          description: 'Unpublished course for testing',
          category: 'FRONTEND',
          level: 'BEGINNER',
          accessTier: 'FREE',
          published: false
        }
      })
      testEnv.trackCourse(course.id)

      const enrollmentsBefore = await AccessCheckService.countUserEnrollments(user.id)

      // Access check should still work for unpublished courses
      const access = await AccessCheckService.checkCourseAccess(user.id, course.id)

      const enrollmentsAfter = await AccessCheckService.countUserEnrollments(user.id)

      expect(access.hasAccess).toBe(true) // Free course
      expect(access.reason).toBe('Free course')
      expect(enrollmentsBefore).toBe(enrollmentsAfter)
    })
  })
})