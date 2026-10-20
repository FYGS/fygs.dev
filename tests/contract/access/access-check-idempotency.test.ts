/**
 * T118: Access Check Idempotency Tests
 *
 * Tests access checking idempotency as required by FR-020.
 * Ensures no silent enrollment (or subscription) creation during entitlement
 * evaluation. These run against the real AccessService: enrollment is the gate
 * for every course (free or premium), a check never creates one.
 */

import { describe, it, expect, beforeEach, afterAll } from "vitest"
import { db } from '@/lib/db'
import { AccessService } from '@/lib/access-service'
import { CourseAccessTier, Role } from '@/lib/generated/prisma/client'
import {
  createCourse,
  createSubscription,
  createUser,
  enroll,
} from '../../support/factories'
import { resetDatabase } from '../../support/test-db'

const countUserEnrollments = (userId: string) => db.enrollment.count({ where: { userId } })
const countTotalEnrollments = () => db.enrollment.count()

// leave an empty database for the suites that run next
afterAll(async () => {
  await resetDatabase(db);
});

describe('T118: Access Check Idempotency Tests', () => {
  beforeEach(async () => {
    await resetDatabase(db)
  })

  describe('Idempotent Access Checking', () => {
    it('does not create enrollment when checking access to free course', async () => {
      const user = await createUser()
      const course = await createCourse({ accessTier: CourseAccessTier.FREE })

      const totalEnrollmentsBefore = await countTotalEnrollments()

      // Check access multiple times
      const access1 = await AccessService.checkCourseAccess(user.id, course.id)
      const access2 = await AccessService.checkCourseAccess(user.id, course.id)
      const access3 = await AccessService.checkCourseAccess(user.id, course.id)

      // A free course still needs an explicit enrollment: the check reports it
      // consistently and does not make one
      for (const access of [access1, access2, access3]) {
        expect(access).toMatchObject({
          isFreeCourse: true,
          isEnrolledInCourse: false,
          canAccessCourse: false,
          accessReason: 'not_enrolled',
        })
      }
      expect(AccessService.resolveAccessState(access1)).toBe('FREE')

      expect(await countUserEnrollments(user.id)).toBe(0)
      expect(await countTotalEnrollments()).toBe(totalEnrollmentsBefore)
    })

    it('does not create enrollment when checking access to premium course without subscription', async () => {
      const user = await createUser()
      const course = await createCourse({
        accessTier: CourseAccessTier.PREMIUM,
        previewEnabled: false,
      })

      const totalEnrollmentsBefore = await countTotalEnrollments()

      const access1 = await AccessService.checkCourseAccess(user.id, course.id)
      const access2 = await AccessService.checkCourseAccess(user.id, course.id)
      const access3 = await AccessService.checkCourseAccess(user.id, course.id)

      for (const access of [access1, access2, access3]) {
        expect(access).toMatchObject({
          isPremiumCourse: true,
          hasActiveSubscription: false,
          canAccessCourse: false,
          canPreviewFirstLesson: false,
          accessReason: 'not_enrolled',
        })
      }
      expect(AccessService.resolveAccessState(access1)).toBe('LOCKED')

      expect(await countUserEnrollments(user.id)).toBe(0)
      expect(await countTotalEnrollments()).toBe(totalEnrollmentsBefore)
    })

    it('does not modify existing enrollment when checking access', async () => {
      const user = await createUser()
      const course = await createCourse({ accessTier: CourseAccessTier.PREMIUM })
      await createSubscription(user.id) // premium access needs an entitlement on top of the enrollment (FR-003)
      const existingEnrollment = await enroll(user.id, course.id)

      const totalEnrollmentsBefore = await countTotalEnrollments()

      // Check access multiple times
      const access1 = await AccessService.checkCourseAccess(user.id, course.id)
      const access2 = await AccessService.checkCourseAccess(user.id, course.id)

      // Access follows the existing enrollment
      for (const access of [access1, access2]) {
        expect(access).toMatchObject({
          isEnrolledInCourse: true,
          canAccessCourse: true,
          canAccessLessons: true,
          accessReason: 'ok',
        })
      }
      expect(access1.enrollmentDate).toEqual(existingEnrollment.enrolledAt)
      expect(AccessService.resolveAccessState(access1)).toBe('ENROLLED')

      // Enrollment count unchanged and the original row untouched
      expect(await countUserEnrollments(user.id)).toBe(1)
      expect(await countTotalEnrollments()).toBe(totalEnrollmentsBefore)
      const unchangedEnrollment = await db.enrollment.findUnique({
        where: { id: existingEnrollment.id },
      })
      expect(unchangedEnrollment?.enrolledAt).toEqual(existingEnrollment.enrolledAt)
    })

    it('does not create subscription or enrollment when checking access with subscription', async () => {
      const user = await createUser()
      await createSubscription(user.id, { priceId: 'price_premium' })
      const course = await createCourse({ accessTier: CourseAccessTier.PREMIUM })

      const subscriptionsBefore = await db.subscription.count({ where: { userId: user.id } })

      const access1 = await AccessService.checkCourseAccess(user.id, course.id)
      const access2 = await AccessService.checkCourseAccess(user.id, course.id)

      // The subscription is reported, but it does not enroll by itself
      for (const access of [access1, access2]) {
        expect(access).toMatchObject({
          hasActiveSubscription: true,
          subscriptionStatus: 'ACTIVE',
          isEnrolledInCourse: false,
          canAccessCourse: false,
        })
      }

      expect(await countUserEnrollments(user.id)).toBe(0)
      expect(await db.subscription.count({ where: { userId: user.id } })).toBe(
        subscriptionsBefore
      )
    })

    it('admin access check does not create enrollments', async () => {
      const admin = await createUser({ role: Role.ADMIN })
      const course = await createCourse({ accessTier: CourseAccessTier.PREMIUM })

      const totalEnrollmentsBefore = await countTotalEnrollments()

      await AccessService.checkCourseAccess(admin.id, course.id)
      await AccessService.checkCourseAccess(admin.id, course.id)

      // Admin viewing is decided by the routes (role gate), never by enrolling
      expect(await countUserEnrollments(admin.id)).toBe(0)
      expect(await countTotalEnrollments()).toBe(totalEnrollmentsBefore)
    })

    it('does not create enrollment when previewing the first lesson of a premium course', async () => {
      const user = await createUser()
      const course = await createCourse({
        accessTier: CourseAccessTier.PREMIUM,
        previewEnabled: true,
      })

      const access1 = await AccessService.checkCourseAccess(user.id, course.id)
      const access2 = await AccessService.checkCourseAccess(user.id, course.id)

      for (const access of [access1, access2]) {
        expect(access).toMatchObject({
          canAccessCourse: false,
          canPreviewFirstLesson: true,
          accessReason: 'preview_only',
        })
      }
      expect(await countUserEnrollments(user.id)).toBe(0)
    })
  })

  describe('Concurrent Access Checks', () => {
    it('handles concurrent access checks without race conditions', async () => {
      const user = await createUser()
      const course = await createCourse({ accessTier: CourseAccessTier.FREE })

      const enrollmentsBefore = await countTotalEnrollments()

      // Run multiple concurrent access checks
      const concurrentChecks = await Promise.all(
        Array.from({ length: 5 }, () => AccessService.checkCourseAccess(user.id, course.id))
      )

      const enrollmentsAfter = await countTotalEnrollments()

      // Every check gives the same answer
      concurrentChecks.forEach((access) => {
        expect(access).toMatchObject({
          isFreeCourse: true,
          canAccessCourse: false,
          accessReason: 'not_enrolled',
        })
      })

      // Verify no enrollments created despite concurrent access
      expect(enrollmentsBefore).toBe(enrollmentsAfter)
    })

    it('handles mixed concurrent checks (different users) without interference', async () => {
      const user1 = await createUser()
      const user2 = await createUser()
      const course = await createCourse({ accessTier: CourseAccessTier.FREE })
      await enroll(user1.id, course.id) // only user1 is enrolled

      const totalEnrollmentsBefore = await countTotalEnrollments()

      // Run concurrent checks for different users
      const [a1, b1, a2, b2] = await Promise.all([
        AccessService.checkCourseAccess(user1.id, course.id),
        AccessService.checkCourseAccess(user2.id, course.id),
        AccessService.checkCourseAccess(user1.id, course.id),
        AccessService.checkCourseAccess(user2.id, course.id),
      ])

      // Each user sees their own state
      expect(a1.canAccessCourse).toBe(true)
      expect(a2.canAccessCourse).toBe(true)
      expect(b1.canAccessCourse).toBe(false)
      expect(b2.canAccessCourse).toBe(false)

      // Verify no side effects for either user
      expect(await countTotalEnrollments()).toBe(totalEnrollmentsBefore)
      expect(await countUserEnrollments(user1.id)).toBe(1)
      expect(await countUserEnrollments(user2.id)).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('handles non-existent user without creating records', async () => {
      const course = await createCourse({ accessTier: CourseAccessTier.FREE })

      const totalEnrollmentsBefore = await countTotalEnrollments()

      const access = await AccessService.checkCourseAccess('non-existent-user', course.id)

      expect(access).toMatchObject({
        hasActiveSubscription: false,
        isEnrolledInCourse: false,
        canAccessCourse: false,
      })
      expect(await countTotalEnrollments()).toBe(totalEnrollmentsBefore)
    })

    it('handles non-existent course without creating records', async () => {
      const user = await createUser()

      const totalEnrollmentsBefore = await countTotalEnrollments()

      const access = await AccessService.checkCourseAccess(user.id, 'non-existent-course')

      expect(access).toMatchObject({
        canAccessCourse: false,
        canAccessLessons: false,
        canPreviewFirstLesson: false,
        isFreeCourse: false,
        isPremiumCourse: false,
      })
      expect(await countTotalEnrollments()).toBe(totalEnrollmentsBefore)
    })

    it('handles unpublished course access check without side effects', async () => {
      const user = await createUser()
      const course = await createCourse({
        accessTier: CourseAccessTier.FREE,
        published: false,
      })

      const enrollmentsBefore = await countUserEnrollments(user.id)

      // Access check still works for unpublished courses
      const access = await AccessService.checkCourseAccess(user.id, course.id)

      expect(access.isFreeCourse).toBe(true)
      expect(access.canAccessCourse).toBe(false)
      expect(await countUserEnrollments(user.id)).toBe(enrollmentsBefore)
    })
  })
})
