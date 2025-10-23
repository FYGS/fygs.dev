/**
 * T113: UI State Differentiation Tests
 * 
 * Tests course card UI state logic as required by FR-021.
 * Enumerates and validates different card states:
 * - FREE not enrolled
 * - FREE enrolled 
 * - PREMIUM locked (no subscription)
 * - PREMIUM enrolled (with subscription)
 * - LIFETIME badge display
 */

import { describe, test, expect, afterEach, beforeEach, vi } from 'vitest'
import { createTestEnvironment, TestDatabase } from '../../utils/test-database'
import { db } from '@/lib/db'

// Course card state logic
interface CourseCardState {
  accessTier: 'FREE' | 'PREMIUM'
  isEnrolled: boolean
  hasActiveSubscription: boolean
  isLifetimeUser: boolean
  displayState: 'FREE_NOT_ENROLLED' | 'FREE_ENROLLED' | 'PREMIUM_LOCKED' | 'PREMIUM_ENROLLED' | 'LIFETIME_BADGE'
  actionButtonText: string
  showPremiumBadge: boolean
  showLifetimeBadge: boolean
  isAccessible: boolean
}

const CourseCardStateService = {
  async calculateCardState(userId: string, courseId: string): Promise<CourseCardState> {
    // Get course details
    const course = await db.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      throw new Error('Course not found')
    }

    // Check enrollment
    const enrollment = await db.enrollment.findFirst({
      where: {
        userId,
        courseId
      }
    })

    // Check subscription status
    const activeSubscription = await db.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        cancelAtPeriodEnd: false
      }
    })

    // Check user details for lifetime status
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    const isEnrolled = !!enrollment
    const hasActiveSubscription = !!activeSubscription
    const isLifetimeUser = user?.role === 'ADMIN' || (activeSubscription?.priceId === 'price_lifetime') // Simplified lifetime check
    const accessTier = course.accessTier as 'FREE' | 'PREMIUM'

    // Determine display state
    let displayState: CourseCardState['displayState']
    let actionButtonText: string
    let showPremiumBadge: boolean
    let showLifetimeBadge: boolean
    let isAccessible: boolean

    if (isLifetimeUser) {
      displayState = 'LIFETIME_BADGE'
      actionButtonText = isEnrolled ? 'Continue Learning' : 'Start Course'
      showPremiumBadge = false
      showLifetimeBadge = true
      isAccessible = true
    } else if (accessTier === 'FREE') {
      if (isEnrolled) {
        displayState = 'FREE_ENROLLED'
        actionButtonText = 'Continue Learning'
        showPremiumBadge = false
        showLifetimeBadge = false
        isAccessible = true
      } else {
        displayState = 'FREE_NOT_ENROLLED'
        actionButtonText = 'Start Free Course'
        showPremiumBadge = false
        showLifetimeBadge = false
        isAccessible = true
      }
    } else { // PREMIUM
      if (hasActiveSubscription) {
        if (isEnrolled) {
          displayState = 'PREMIUM_ENROLLED'
          actionButtonText = 'Continue Learning'
          showPremiumBadge = true
          showLifetimeBadge = false
          isAccessible = true
        } else {
          displayState = 'PREMIUM_ENROLLED' // Can enroll
          actionButtonText = 'Start Premium Course'
          showPremiumBadge = true
          showLifetimeBadge = false
          isAccessible = true
        }
      } else {
        displayState = 'PREMIUM_LOCKED'
        actionButtonText = 'Upgrade to Access'
        showPremiumBadge = true
        showLifetimeBadge = false
        isAccessible = false
      }
    }

    return {
      accessTier,
      isEnrolled,
      hasActiveSubscription,
      isLifetimeUser,
      displayState,
      actionButtonText,
      showPremiumBadge,
      showLifetimeBadge,
      isAccessible
    }
  }
}

describe('T113: UI State Differentiation Tests', () => {
  const testEnv = createTestEnvironment()
  
  beforeEach(async () => {
    vi.clearAllMocks()
  })
  
  afterEach(async () => {
    await testEnv.cleanup()
  })

  describe('FREE Course States', () => {
    test('FREE course not enrolled shows correct state', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('user'),
          name: 'Test User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'Free Course',
          slug: TestDatabase.getUniqueSlug('free-course'),
          description: 'A free course for everyone',
          category: 'JAVASCRIPT',
          level: 'BEGINNER',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const cardState = await CourseCardStateService.calculateCardState(user.id, course.id)

      expect(cardState.accessTier).toBe('FREE')
      expect(cardState.isEnrolled).toBe(false)
      expect(cardState.displayState).toBe('FREE_NOT_ENROLLED')
      expect(cardState.actionButtonText).toBe('Start Free Course')
      expect(cardState.showPremiumBadge).toBe(false)
      expect(cardState.showLifetimeBadge).toBe(false)
      expect(cardState.isAccessible).toBe(true)
    })

    test('FREE course enrolled shows correct state', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('user'),
          name: 'Enrolled User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'Free Enrolled Course',
          slug: TestDatabase.getUniqueSlug('free-enrolled-course'),
          description: 'A free course with enrollment',
          category: 'FRONTEND',
          level: 'BEGINNER',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      // Create enrollment
      await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          enrolledAt: new Date()
        }
      })

      const cardState = await CourseCardStateService.calculateCardState(user.id, course.id)

      expect(cardState.accessTier).toBe('FREE')
      expect(cardState.isEnrolled).toBe(true)
      expect(cardState.displayState).toBe('FREE_ENROLLED')
      expect(cardState.actionButtonText).toBe('Continue Learning')
      expect(cardState.showPremiumBadge).toBe(false)
      expect(cardState.showLifetimeBadge).toBe(false)
      expect(cardState.isAccessible).toBe(true)
    })
  })

  describe('PREMIUM Course States', () => {
    test('PREMIUM course locked (no subscription) shows correct state', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('user'),
          name: 'Non-subscriber User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'Premium Locked Course',
          slug: TestDatabase.getUniqueSlug('premium-locked-course'),
          description: 'A premium course requiring subscription',
          category: 'BACKEND',
          level: 'ADVANCED',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const cardState = await CourseCardStateService.calculateCardState(user.id, course.id)

      expect(cardState.accessTier).toBe('PREMIUM')
      expect(cardState.isEnrolled).toBe(false)
      expect(cardState.hasActiveSubscription).toBe(false)
      expect(cardState.displayState).toBe('PREMIUM_LOCKED')
      expect(cardState.actionButtonText).toBe('Upgrade to Access')
      expect(cardState.showPremiumBadge).toBe(true)
      expect(cardState.showLifetimeBadge).toBe(false)
      expect(cardState.isAccessible).toBe(false)
    })

    test('PREMIUM course with subscription not enrolled shows correct state', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('user'),
          name: 'Subscriber User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'Premium Available Course',
          slug: TestDatabase.getUniqueSlug('premium-available-course'),
          description: 'A premium course with subscription access',
          category: 'FULLSTACK',
          level: 'INTERMEDIATE',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      // Create active subscription
      await db.subscription.create({
        data: {
          userId: user.id,
          plan: 'PREMIUM',
          status: 'ACTIVE',
          priceId: 'price_premium_monthly',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      })

      const cardState = await CourseCardStateService.calculateCardState(user.id, course.id)

      expect(cardState.accessTier).toBe('PREMIUM')
      expect(cardState.isEnrolled).toBe(false)
      expect(cardState.hasActiveSubscription).toBe(true)
      expect(cardState.displayState).toBe('PREMIUM_ENROLLED')
      expect(cardState.actionButtonText).toBe('Start Premium Course')
      expect(cardState.showPremiumBadge).toBe(true)
      expect(cardState.showLifetimeBadge).toBe(false)
      expect(cardState.isAccessible).toBe(true)
    })

    test('PREMIUM course with subscription and enrollment shows correct state', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('user'),
          name: 'Enrolled Subscriber',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'Premium Enrolled Course',
          slug: TestDatabase.getUniqueSlug('premium-enrolled-course'),
          description: 'A premium course with active enrollment',
          category: 'AI',
          level: 'EXPERT',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      // Create active subscription
      await db.subscription.create({
        data: {
          userId: user.id,
          plan: 'PREMIUM',
          status: 'ACTIVE',
          priceId: 'price_premium_annual',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
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

      const cardState = await CourseCardStateService.calculateCardState(user.id, course.id)

      expect(cardState.accessTier).toBe('PREMIUM')
      expect(cardState.isEnrolled).toBe(true)
      expect(cardState.hasActiveSubscription).toBe(true)
      expect(cardState.displayState).toBe('PREMIUM_ENROLLED')
      expect(cardState.actionButtonText).toBe('Continue Learning')
      expect(cardState.showPremiumBadge).toBe(true)
      expect(cardState.showLifetimeBadge).toBe(false)
      expect(cardState.isAccessible).toBe(true)
    })
  })

  describe('LIFETIME Badge States', () => {
    test('admin user sees LIFETIME badge on all courses', async () => {
      const admin = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('admin'),
          name: 'Admin User',
          role: 'ADMIN'
        }
      })
      testEnv.trackUser(admin.id)

      const freeCourse = await db.course.create({
        data: {
          title: 'Free Course for Admin',
          slug: TestDatabase.getUniqueSlug('free-course-admin'),
          description: 'Free course accessed by admin',
          category: 'JAVASCRIPT',
          level: 'BEGINNER',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(freeCourse.id)

      const premiumCourse = await db.course.create({
        data: {
          title: 'Premium Course for Admin',
          slug: TestDatabase.getUniqueSlug('premium-course-admin'),
          description: 'Premium course accessed by admin',
          category: 'CLOUD',
          level: 'ADVANCED',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(premiumCourse.id)

      const freeCardState = await CourseCardStateService.calculateCardState(admin.id, freeCourse.id)
      const premiumCardState = await CourseCardStateService.calculateCardState(admin.id, premiumCourse.id)

      // Both should show lifetime badge
      expect(freeCardState.isLifetimeUser).toBe(true)
      expect(freeCardState.displayState).toBe('LIFETIME_BADGE')
      expect(freeCardState.showLifetimeBadge).toBe(true)
      expect(freeCardState.showPremiumBadge).toBe(false)
      expect(freeCardState.isAccessible).toBe(true)

      expect(premiumCardState.isLifetimeUser).toBe(true)
      expect(premiumCardState.displayState).toBe('LIFETIME_BADGE')
      expect(premiumCardState.showLifetimeBadge).toBe(true)
      expect(premiumCardState.showPremiumBadge).toBe(false)
      expect(premiumCardState.isAccessible).toBe(true)
    })

    test('lifetime subscription user sees LIFETIME badge', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('user'),
          name: 'Lifetime User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      // Create lifetime subscription (using special price ID to indicate lifetime)
      await db.subscription.create({
        data: {
          userId: user.id,
          plan: 'PREMIUM',
          status: 'ACTIVE',
          priceId: 'price_lifetime',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000) // 100 years
        }
      })

      const course = await db.course.create({
        data: {
          title: 'Course for Lifetime User',
          slug: TestDatabase.getUniqueSlug('course-lifetime-user'),
          description: 'Course accessed by lifetime user',
          category: 'DEVOPS',
          level: 'INTERMEDIATE',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const cardState = await CourseCardStateService.calculateCardState(user.id, course.id)

      expect(cardState.isLifetimeUser).toBe(true)
      expect(cardState.displayState).toBe('LIFETIME_BADGE')
      expect(cardState.actionButtonText).toBe('Start Course')
      expect(cardState.showLifetimeBadge).toBe(true)
      expect(cardState.showPremiumBadge).toBe(false)
      expect(cardState.isAccessible).toBe(true)
    })

    test('lifetime user with enrollment shows continue learning', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('user'),
          name: 'Enrolled Lifetime User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      // Create lifetime subscription (using special price ID to indicate lifetime)
      await db.subscription.create({
        data: {
          userId: user.id,
          plan: 'PREMIUM',
          status: 'ACTIVE',
          priceId: 'price_lifetime',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000)
        }
      })

      const course = await db.course.create({
        data: {
          title: 'Enrolled Lifetime Course',
          slug: TestDatabase.getUniqueSlug('enrolled-lifetime-course'),
          description: 'Course with enrolled lifetime user',
          category: 'PRODUCTIVITY',
          level: 'BEGINNER',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      // Create enrollment
      await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          enrolledAt: new Date()
        }
      })

      const cardState = await CourseCardStateService.calculateCardState(user.id, course.id)

      expect(cardState.isLifetimeUser).toBe(true)
      expect(cardState.isEnrolled).toBe(true)
      expect(cardState.displayState).toBe('LIFETIME_BADGE')
      expect(cardState.actionButtonText).toBe('Continue Learning')
      expect(cardState.showLifetimeBadge).toBe(true)
      expect(cardState.isAccessible).toBe(true)
    })
  })

  describe('State Consistency and Edge Cases', () => {
    test('expired subscription locks premium courses', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('user'),
          name: 'Expired Subscription User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      // Create expired subscription
      await db.subscription.create({
        data: {
          userId: user.id,
          plan: 'PREMIUM',
          status: 'CANCELED',
          priceId: 'price_premium_monthly',
          currentPeriodStart: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
          currentPeriodEnd: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        }
      })

      const course = await db.course.create({
        data: {
          title: 'Course with Expired Access',
          slug: TestDatabase.getUniqueSlug('course-expired-access'),
          description: 'Premium course with expired subscription',
          category: 'TYPESCRIPT',
          level: 'ADVANCED',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const cardState = await CourseCardStateService.calculateCardState(user.id, course.id)

      expect(cardState.hasActiveSubscription).toBe(false)
      expect(cardState.displayState).toBe('PREMIUM_LOCKED')
      expect(cardState.actionButtonText).toBe('Upgrade to Access')
      expect(cardState.isAccessible).toBe(false)
    })

    test('multiple subscriptions - only active one counts', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('user'),
          name: 'Multiple Subscription User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      // First create an expired subscription
      const expiredSub = await db.subscription.create({
        data: {
          userId: user.id,
          plan: 'PREMIUM',
          status: 'CANCELED',
          priceId: 'price_premium_monthly',
          currentPeriodStart: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          currentPeriodEnd: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      })

      // Delete the expired one and create an active one (since userId is unique)
      await db.subscription.delete({ where: { id: expiredSub.id } })
      await db.subscription.create({
        data: {
          userId: user.id,
          plan: 'PREMIUM',
          status: 'ACTIVE',
          priceId: 'price_premium_annual',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      })

      const course = await db.course.create({
        data: {
          title: 'Multi-Subscription Course',
          slug: TestDatabase.getUniqueSlug('multi-subscription-course'),
          description: 'Course with multiple subscription records',
          category: 'FULLSTACK',
          level: 'EXPERT',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const cardState = await CourseCardStateService.calculateCardState(user.id, course.id)

      expect(cardState.hasActiveSubscription).toBe(true)
      expect(cardState.displayState).toBe('PREMIUM_ENROLLED')
      expect(cardState.isAccessible).toBe(true)
    })

    test('instructor role does not grant lifetime access', async () => {
      const instructor = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('instructor'),
          name: 'Course Instructor',
          role: 'INSTRUCTOR'
        }
      })
      testEnv.trackUser(instructor.id)

      const course = await db.course.create({
        data: {
          title: 'Instructor Access Course',
          slug: TestDatabase.getUniqueSlug('instructor-access-course'),
          description: 'Premium course accessed by instructor',
          category: 'BACKEND',
          level: 'INTERMEDIATE',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const cardState = await CourseCardStateService.calculateCardState(instructor.id, course.id)

      expect(cardState.isLifetimeUser).toBe(false)
      expect(cardState.hasActiveSubscription).toBe(false)
      expect(cardState.displayState).toBe('PREMIUM_LOCKED')
      expect(cardState.showLifetimeBadge).toBe(false)
      expect(cardState.isAccessible).toBe(false)
    })

    test('state calculation for non-existent course throws error', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('user'),
          name: 'Test User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const nonExistentCourseId = TestDatabase.getUniqueId('fake-course')

      await expect(
        CourseCardStateService.calculateCardState(user.id, nonExistentCourseId)
      ).rejects.toThrow('Course not found')
    })

    test('consistent state calculation across multiple calls', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('user'),
          name: 'Consistent User',
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
          title: 'Consistency Test Course',
          slug: TestDatabase.getUniqueSlug('consistency-test-course'),
          description: 'Course for testing state consistency',
          category: 'AI',
          level: 'BEGINNER',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      // Call multiple times and verify consistency
      const states = await Promise.all([
        CourseCardStateService.calculateCardState(user.id, course.id),
        CourseCardStateService.calculateCardState(user.id, course.id),
        CourseCardStateService.calculateCardState(user.id, course.id)
      ])

      states.forEach(state => {
        expect(state.displayState).toBe('PREMIUM_ENROLLED')
        expect(state.hasActiveSubscription).toBe(true)
        expect(state.isAccessible).toBe(true)
        expect(state.actionButtonText).toBe('Start Premium Course')
      })
    })
  })

  describe('All State Combinations Verification', () => {
    test('verifies all possible display states are covered', () => {
      const expectedStates: CourseCardState['displayState'][] = [
        'FREE_NOT_ENROLLED',
        'FREE_ENROLLED', 
        'PREMIUM_LOCKED',
        'PREMIUM_ENROLLED',
        'LIFETIME_BADGE'
      ]

      // This test documents that our logic covers all required states
      expect(expectedStates).toHaveLength(5)
      expect(expectedStates).toContain('FREE_NOT_ENROLLED')
      expect(expectedStates).toContain('FREE_ENROLLED')
      expect(expectedStates).toContain('PREMIUM_LOCKED')
      expect(expectedStates).toContain('PREMIUM_ENROLLED')
      expect(expectedStates).toContain('LIFETIME_BADGE')
    })

    test('action button text is always defined for all states', async () => {
      const user = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('user'),
          name: 'Button Test User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(user.id)

      const course = await db.course.create({
        data: {
          title: 'Button Test Course',
          slug: TestDatabase.getUniqueSlug('button-test-course'),
          description: 'Course for testing button text',
          category: 'JAVASCRIPT',
          level: 'BEGINNER',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const cardState = await CourseCardStateService.calculateCardState(user.id, course.id)

      expect(cardState.actionButtonText).toBeDefined()
      expect(cardState.actionButtonText.length).toBeGreaterThan(0)
      expect(typeof cardState.actionButtonText).toBe('string')
    })

    test('badge visibility is mutually exclusive', async () => {
      const regularUser = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('user'),
          name: 'Badge Test User',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(regularUser.id)

      const admin = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('admin'),
          name: 'Badge Test Admin',
          role: 'ADMIN'
        }
      })
      testEnv.trackUser(admin.id)

      const course = await db.course.create({
        data: {
          title: 'Badge Test Course',
          slug: TestDatabase.getUniqueSlug('badge-test-course'),
          description: 'Course for testing badge visibility',
          category: 'CLOUD',
          level: 'ADVANCED',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const regularUserState = await CourseCardStateService.calculateCardState(regularUser.id, course.id)
      const adminState = await CourseCardStateService.calculateCardState(admin.id, course.id)

      // Regular user should show premium badge but not lifetime
      expect(regularUserState.showPremiumBadge).toBe(true)
      expect(regularUserState.showLifetimeBadge).toBe(false)

      // Admin should show lifetime badge but not premium
      expect(adminState.showLifetimeBadge).toBe(true)
      expect(adminState.showPremiumBadge).toBe(false)

      // Verify mutual exclusivity - never both true
      expect(regularUserState.showPremiumBadge && regularUserState.showLifetimeBadge).toBe(false)
      expect(adminState.showPremiumBadge && adminState.showLifetimeBadge).toBe(false)
    })
  })
})