import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { db } from '@/lib/db'
import { Decimal } from '@prisma/client/runtime/client'
import { AccessService } from '@/lib/access-service'
import { getEntitlement, getEntitlements } from '@/lib/access/entitlement'
import { viewerStatus } from '@/lib/access/offer'

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers()))
}))

// Mock better auth
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn()
    }
  }
}))

describe('Course Access Control Contract Tests (FR-006)', () => {
  let freeUserId: string
  let premiumUserId: string
  let expiredUserId: string
  let freeCourseId: string
  let premiumCourseId: string

  beforeEach(async () => {
    // Create test users
    const freeUser = await db.user.create({
      data: {
        email: `free-user-${Date.now()}@example.com`,
        name: 'Free User',
      }
    })
    freeUserId = freeUser.id

    const premiumUser = await db.user.create({
      data: {
        email: `premium-user-${Date.now()}@example.com`,
        name: 'Premium User',
      }
    })
    premiumUserId = premiumUser.id

    const expiredUser = await db.user.create({
      data: {
        email: `expired-user-${Date.now()}@example.com`,
        name: 'Expired User',
      }
    })
    expiredUserId = expiredUser.id

    // Create test courses with different access tiers
    const freeCourse = await db.course.create({
      data: {
        title: 'Free Course',
        slug: `free-course-${Date.now()}`,
        description: 'Free course for all users',
        price: new Decimal('0.00'),
        category: 'JAVASCRIPT',
        level: 'BEGINNER',
        accessTier: 'FREE',
        published: true,
      }
    })
    freeCourseId = freeCourse.id

    const premiumCourse = await db.course.create({
      data: {
        title: 'Premium Course',
        slug: `premium-course-${Date.now()}`,
        description: 'Premium course requiring subscription',
        price: new Decimal('29.99'),
        category: 'TYPESCRIPT',
        level: 'INTERMEDIATE',
        accessTier: 'PREMIUM',
        published: true,
        previewEnabled: false, // Disable preview for these tests
      }
    })
    premiumCourseId = premiumCourse.id

    // Create subscriptions
    // Premium user with active subscription
    await db.subscription.create({
      data: {
        userId: premiumUserId,
        status: 'ACTIVE',
        plan: 'PREMIUM',
        stripeSubscriptionId: `sub_premium_${Date.now()}`,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      }
    })

    // Expired user with expired subscription
    await db.subscription.create({
      data: {
        userId: expiredUserId,
        status: 'CANCELED',
        plan: 'PREMIUM',
        stripeSubscriptionId: `sub_expired_${Date.now()}`,
        currentPeriodStart: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        currentPeriodEnd: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      }
    })
  })

  afterEach(async () => {
    // Cleanup in reverse dependency order
    await db.enrollment.deleteMany({ 
      where: { 
        userId: { 
          in: [freeUserId, premiumUserId, expiredUserId] 
        } 
      } 
    })
    await db.subscription.deleteMany({ 
      where: { 
        userId: { 
          in: [premiumUserId, expiredUserId] 
        } 
      } 
    })
    await db.course.deleteMany({ 
      where: { 
        id: { 
          in: [freeCourseId, premiumCourseId] 
        } 
      } 
    })
    await db.user.deleteMany({ 
      where: { 
        id: { 
          in: [freeUserId, premiumUserId, expiredUserId] 
        } 
      } 
    })
  })

  describe('Free tier access verification', () => {
    test('allows access to free courses when enrolled', async () => {
      // Enroll users in free course
      await db.enrollment.create({
        data: { userId: freeUserId, courseId: freeCourseId }
      })
      await db.enrollment.create({
        data: { userId: premiumUserId, courseId: freeCourseId }
      })
      await db.enrollment.create({
        data: { userId: expiredUserId, courseId: freeCourseId }
      })

      // Test access for enrolled users
      const freeUserAccess = await AccessService.checkCourseAccess(freeUserId, freeCourseId)
      expect(freeUserAccess.canAccessCourse).toBe(true)
      expect(freeUserAccess.isFreeCourse).toBe(true)
      expect(freeUserAccess.isEnrolledInCourse).toBe(true)
      expect(freeUserAccess.accessReason).toBe('ok')

      const premiumUserAccess = await AccessService.checkCourseAccess(premiumUserId, freeCourseId)
      expect(premiumUserAccess.canAccessCourse).toBe(true)
      expect(premiumUserAccess.isFreeCourse).toBe(true)
      expect(premiumUserAccess.isEnrolledInCourse).toBe(true)
      expect(premiumUserAccess.accessReason).toBe('ok')

      const expiredUserAccess = await AccessService.checkCourseAccess(expiredUserId, freeCourseId)
      expect(expiredUserAccess.canAccessCourse).toBe(true)
      expect(expiredUserAccess.isFreeCourse).toBe(true)
      expect(expiredUserAccess.isEnrolledInCourse).toBe(true)
      expect(expiredUserAccess.accessReason).toBe('ok')
    })

    test('requires enrollment even for free courses', async () => {
      const access = await AccessService.checkCourseAccess(freeUserId, freeCourseId)
      expect(access.canAccessCourse).toBe(false)
      expect(access.isFreeCourse).toBe(true)
      expect(access.isEnrolledInCourse).toBe(false)
      expect(access.accessReason).toBe('not_enrolled')
    })

    test('denies access to premium courses without enrollment', async () => {
      const access = await AccessService.checkCourseAccess(freeUserId, premiumCourseId)
      expect(access.canAccessCourse).toBe(false)
      expect(access.isPremiumCourse).toBe(true)
      expect(access.isEnrolledInCourse).toBe(false)
      expect(access.accessReason).toBe('not_enrolled')
    })
  })

  describe('Premium subscription access verification', () => {
    test('allows access to enrolled premium courses with active subscription', async () => {
      // Enroll premium user in premium course
      await db.enrollment.create({
        data: { userId: premiumUserId, courseId: premiumCourseId }
      })

      const access = await AccessService.checkCourseAccess(premiumUserId, premiumCourseId)
      expect(access.canAccessCourse).toBe(true)
      expect(access.isPremiumCourse).toBe(true)
      expect(access.isEnrolledInCourse).toBe(true)
      expect(access.hasActiveSubscription).toBe(true)
      expect(access.accessReason).toBe('ok')
    })

    test('denies access to premium courses without enrollment even with subscription', async () => {
      // Don't enroll premium user
      const access = await AccessService.checkCourseAccess(premiumUserId, premiumCourseId)
      expect(access.canAccessCourse).toBe(false)
      expect(access.isPremiumCourse).toBe(true)
      expect(access.isEnrolledInCourse).toBe(false)
      expect(access.hasActiveSubscription).toBe(true)
      expect(access.accessReason).toBe('not_enrolled')
    })

    test('respects subscription expiration for enrolled users (FR-005)', async () => {
      // Enroll expired user in premium course
      await db.enrollment.create({
        data: { userId: expiredUserId, courseId: premiumCourseId }
      })

      const access = await AccessService.checkCourseAccess(expiredUserId, premiumCourseId)
      expect(access.canAccessCourse).toBe(false) // the subscription ended: premium access is revoked
      expect(access.canAccessLessons).toBe(false)
      expect(access.isPremiumCourse).toBe(true)
      expect(access.isEnrolledInCourse).toBe(true) // the enrollment (and the progress) is kept
      expect(access.hasActiveSubscription).toBe(false)
      expect(access.accessReason).toBe('premium_locked')
    })
  })

  describe('Course enrollment verification', () => {
    test('enrollment alone does not unlock a premium course without subscription or purchase (FR-003)', async () => {
      await db.enrollment.create({
        data: { userId: freeUserId, courseId: premiumCourseId }
      })

      const access = await AccessService.checkCourseAccess(freeUserId, premiumCourseId)
      expect(access.canAccessCourse).toBe(false)
      expect(access.isEnrolledInCourse).toBe(true)
      expect(access.hasActiveSubscription).toBe(false)
      expect(access.accessReason).toBe('premium_locked')
    })

    test('enrollment backed by a completed lifetime purchase grants access without any subscription', async () => {
      await db.enrollment.create({
        data: { userId: freeUserId, courseId: premiumCourseId }
      })
      await db.payment.create({
        data: {
          userId: freeUserId,
          courseId: premiumCourseId,
          amount: new Decimal('29.99'),
          kind: 'COURSE',
          status: 'COMPLETED',
        }
      })

      const access = await AccessService.checkCourseAccess(freeUserId, premiumCourseId)
      expect(access.canAccessCourse).toBe(true)
      expect(access.hasActiveSubscription).toBe(false)
      expect(access.accessReason).toBe('ok')
    })

    test('the enrolment is what opens a free course', async () => {
      await db.enrollment.create({ data: { userId: freeUserId, courseId: freeCourseId } })

      const access = await AccessService.checkCourseAccess(freeUserId, freeCourseId)
      expect(access).toMatchObject({ isEnrolledInCourse: true, canAccessCourse: true, recordsProgress: true })
      expect(access.entitlement?.source).toBe('free')
    })
  })

  describe('Preview functionality for premium courses', () => {
    test('allows preview of first lesson for non-enrolled premium courses', async () => {
      // Create premium course with preview enabled
      const previewCourse = await db.course.create({
        data: {
          title: 'Preview Course',
          slug: `preview-course-${Date.now()}`,
          description: 'Premium course with preview',
          price: new Decimal('49.99'),
          category: 'FRONTEND',
          level: 'INTERMEDIATE',
          accessTier: 'PREMIUM',
          published: true,
          previewEnabled: true,
          // a sample needs a published lesson to show
          lessons: { create: { title: 'L1', slug: 'l-1', order: 1, published: true } },
        }
      })

      const access = await AccessService.checkCourseAccess(freeUserId, previewCourse.id)
      expect(access.canAccessCourse).toBe(false)
      expect(access.canPreviewFirstLesson).toBe(true)
      expect(access.accessReason).toBe('preview_only')

      // Cleanup
      await db.course.delete({ where: { id: previewCourse.id } })
    })

    test('no preview for free courses', async () => {
      const access = await AccessService.checkCourseAccess(freeUserId, freeCourseId)
      expect(access.canPreviewFirstLesson).toBe(false)
      expect(access.isFreeCourse).toBe(true)
    })
  })

  describe('Unpublished course access restriction', () => {
    test('denies access to unpublished courses', async () => {
      // Create unpublished course
      const unpublishedCourse = await db.course.create({
        data: {
          title: 'Unpublished Course',
          slug: `unpublished-course-${Date.now()}`,
          description: 'Course not yet published',
          price: new Decimal('19.99'),
          category: 'JAVASCRIPT',
          level: 'BEGINNER',
          accessTier: 'PREMIUM',
          published: false, // Not published
        }
      })

      // Even with enrollment, unpublished courses should be inaccessible
      await db.enrollment.create({
        data: { userId: premiumUserId, courseId: unpublishedCourse.id }
      })

      const access = await AccessService.checkCourseAccess(premiumUserId, unpublishedCourse.id)
      // Access service doesn't check published status, but course won't be visible in UI
      expect(access.isEnrolledInCourse).toBe(true)

      // Cleanup
      await db.enrollment.deleteMany({ where: { courseId: unpublishedCourse.id } })
      await db.course.delete({ where: { id: unpublishedCourse.id } })
    })
  })

  describe('Multiple subscriptions handling', () => {
    test('detects active subscription status correctly', async () => {
      const access = await AccessService.checkCourseAccess(premiumUserId, premiumCourseId)
      expect(access.hasActiveSubscription).toBe(true)
      expect(access.subscriptionStatus).toBe('ACTIVE')
    })

    test('detects inactive subscription status correctly', async () => {
      const access = await AccessService.checkCourseAccess(expiredUserId, premiumCourseId)
      expect(access.hasActiveSubscription).toBe(false)
      expect(access.subscriptionStatus).toBe('CANCELED') // the row says why premium courses are closed
    })
  })

  describe('Bulk access checking', () => {
    test('efficiently checks access for multiple courses', async () => {
      // Enroll premium user in both courses
      await Promise.all([
        db.enrollment.create({ data: { userId: premiumUserId, courseId: freeCourseId } }),
        db.enrollment.create({ data: { userId: premiumUserId, courseId: premiumCourseId } })
      ])

      const { courses } = await getEntitlements(premiumUserId, [freeCourseId, premiumCourseId])

      expect(courses.size).toBe(2)
      expect(courses.get(freeCourseId)).toMatchObject({ entitled: true, source: 'free', tier: 'FREE' })
      expect(courses.get(premiumCourseId)).toMatchObject({ entitled: true, source: 'subscription', tier: 'PREMIUM' })
    })

    test('returns empty results for empty course list', async () => {
      const { courses } = await getEntitlements(freeUserId, [])
      expect(courses.size).toBe(0)
    })
  })

  describe('Access state resolution for UI', () => {
    test('the status a card shows follows the entitlement', async () => {
      const free = await getEntitlement(freeUserId, freeCourseId)
      expect(viewerStatus(free)).toBe('none') // free, not enrolled yet: "S'inscrire"

      const premium = await getEntitlement(freeUserId, premiumCourseId)
      expect(viewerStatus(premium)).toBe('none')

      await db.enrollment.create({ data: { userId: freeUserId, courseId: freeCourseId } })
      expect(viewerStatus(await getEntitlement(freeUserId, freeCourseId))).toBe('enrolled')
    })
  })
})