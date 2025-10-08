import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { db } from '@/lib/db'
import { enrollCourse } from '@/app/(dashboard)/actions/enrollCourse'
import { updateLessonProgress } from '@/app/(dashboard)/actions/updateLessonProgress'
import { issueCertificate } from '@/app/(dashboard)/actions/issueCertificate'

// Mock auth for testing
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(() => Promise.resolve({
        user: { id: 'test-user-id', email: 'test@example.com' }
      }))
    }
  }
}))

// Mock headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers()))
}))

describe('Certificate Issuance Flow Integration Tests', () => {
  let testUserId: string
  let courseId: string
  let lessonIds: string[]

  beforeEach(async () => {
    // Create test user
    const user = await db.user.create({
      data: {
        email: 'certificate-flow-test@example.com',
        name: 'Certificate Flow Test User',
        emailVerified: true
      }
    })
    testUserId = user.id

    // Create test course
    const course = await db.course.create({
      data: {
        title: 'Certificate Flow Test Course',
        slug: 'certificate-flow-test-course',
        description: 'Course for testing certificate issuance flow',
        category: 'JAVASCRIPT',
        level: 'BEGINNER',
        published: true,
        accessTier: 'FREE'
      }
    })
    courseId = course.id

    // Create test lessons
    const lessons = await Promise.all([
      db.lesson.create({
        data: {
          title: 'Lesson 1: Introduction',
          slug: 'lesson-1-introduction',
          courseId,
          order: 1,
          published: true,
          duration: 600 // 10 minutes
        }
      }),
      db.lesson.create({
        data: {
          title: 'Lesson 2: Basics',
          slug: 'lesson-2-basics',
          courseId,
          order: 2,
          published: true,
          duration: 900 // 15 minutes
        }
      }),
      db.lesson.create({
        data: {
          title: 'Lesson 3: Advanced',
          slug: 'lesson-3-advanced',
          courseId,
          order: 3,
          published: true,
          duration: 1200 // 20 minutes
        }
      })
    ])
    lessonIds = lessons.map(lesson => lesson.id)

    // Mock the auth user ID to match our test user
    vi.mocked(require('@/lib/auth').auth.api.getSession).mockResolvedValue({
      user: { id: testUserId, email: 'certificate-flow-test@example.com' }
    })
  })

  afterEach(async () => {
    // Cleanup in reverse dependency order
    await db.certificate.deleteMany({ where: { userId: testUserId } })
    await db.progress.deleteMany({ where: { userId: testUserId } })
    await db.enrollment.deleteMany({ where: { userId: testUserId } })
    await db.lesson.deleteMany({ where: { courseId } })
    await db.course.delete({ where: { id: courseId } })
    await db.user.delete({ where: { id: testUserId } })
    vi.clearAllMocks()
  })

  test('complete flow: enroll → complete all lessons → issue certificate → ensure idempotent', async () => {
    // Step 1: Enroll in course
    const enrollResult = await enrollCourse({ courseId })
    expect(enrollResult.success).toBe(true)
    expect(enrollResult.enrollment).toBeDefined()

    // Step 2: Attempt certificate issuance before completion (should fail)
    const prematureCertificateResult = await issueCertificate({ courseId })
    expect(prematureCertificateResult.success).toBe(false)
    expect(prematureCertificateResult.error).toBeDefined()
    expect(prematureCertificateResult.message).toContain('100%')

    // Step 3: Complete first lesson (partial completion)
    const firstLessonProgress = await updateLessonProgress({
      lessonId: lessonIds[0],
      completed: true,
      watchTimeDelta: 600
    })
    expect(firstLessonProgress.success).toBe(true)
    expect(firstLessonProgress.progress?.completed).toBe(true)

    // Verify still can't get certificate (not 100% complete)
    const partialCertificateResult = await issueCertificate({ courseId })
    expect(partialCertificateResult.success).toBe(false)
    expect(partialCertificateResult.message).toContain('100%')

    // Step 4: Complete second lesson
    const secondLessonProgress = await updateLessonProgress({
      lessonId: lessonIds[1],
      completed: true,
      watchTimeDelta: 900
    })
    expect(secondLessonProgress.success).toBe(true)
    expect(secondLessonProgress.progress?.completed).toBe(true)

    // Still not 100% complete
    const almostCompleteCertificateResult = await issueCertificate({ courseId })
    expect(almostCompleteCertificateResult.success).toBe(false)

    // Step 5: Complete final lesson (100% completion)
    const finalLessonProgress = await updateLessonProgress({
      lessonId: lessonIds[2],
      completed: true,
      watchTimeDelta: 1200
    })
    expect(finalLessonProgress.success).toBe(true)
    expect(finalLessonProgress.progress?.completed).toBe(true)

    // Step 6: Now certificate issuance should succeed
    const certificateResult = await issueCertificate({ courseId })
    expect(certificateResult.success).toBe(true)
    expect(certificateResult.certificate).toBeDefined()
    expect(certificateResult.certificate!.id).toBeDefined()
    expect(certificateResult.certificate!.issuedAt).toBeInstanceOf(Date)

    const firstCertificateId = certificateResult.certificate!.id
    const firstIssuedAt = certificateResult.certificate!.issuedAt

    // Step 7: Verify certificate appears in database
    const dbCertificate = await db.certificate.findUnique({
      where: { id: firstCertificateId }
    })
    expect(dbCertificate).toBeDefined()
    expect(dbCertificate!.userId).toBe(testUserId)
    expect(dbCertificate!.courseId).toBe(courseId)

    // Step 8: Test idempotency - second issuance should return same certificate
    const secondCertificateResult = await issueCertificate({ courseId })
    expect(secondCertificateResult.success).toBe(true)
    expect(secondCertificateResult.certificate!.id).toBe(firstCertificateId)
    expect(secondCertificateResult.certificate!.issuedAt).toEqual(firstIssuedAt)
    expect(secondCertificateResult.alreadyIssued).toBe(true)

    // Step 9: Verify only one certificate exists in database
    const certificateCount = await db.certificate.count({
      where: {
        userId: testUserId,
        courseId
      }
    })
    expect(certificateCount).toBe(1)

    // Step 10: Test multiple rapid requests (race condition protection)
    const rapidRequests = await Promise.all([
      issueCertificate({ courseId }),
      issueCertificate({ courseId }),
      issueCertificate({ courseId })
    ])

    // All should succeed and return same certificate
    rapidRequests.forEach(result => {
      expect(result.success).toBe(true)
      expect(result.certificate!.id).toBe(firstCertificateId)
    })

    // Still only one certificate
    const finalCertificateCount = await db.certificate.count({
      where: {
        userId: testUserId,
        courseId
      }
    })
    expect(finalCertificateCount).toBe(1)
  })

  test('handles unpublished lessons correctly in completion calculation', async () => {
    // Enroll in course
    await enrollCourse({ courseId })

    // Complete all published lessons
    for (const lessonId of lessonIds) {
      await updateLessonProgress({
        lessonId,
        completed: true,
        watchTimeDelta: 300
      })
    }

    // Should be able to get certificate (100% of published lessons)
    const beforeUnpublishResult = await issueCertificate({ courseId })
    expect(beforeUnpublishResult.success).toBe(true)

    // Create another unpublished lesson
    const unpublishedLesson = await db.lesson.create({
      data: {
        title: 'Unpublished Lesson',
        slug: 'unpublished-lesson',
        courseId,
        order: 4,
        published: false,
        duration: 300
      }
    })

    // Should still be able to get certificate (unpublished lessons don't count)
    const afterUnpublishResult = await issueCertificate({ courseId })
    expect(afterUnpublishResult.success).toBe(true)
    expect(afterUnpublishResult.alreadyIssued).toBe(true) // Should return existing certificate

    // Cleanup
    await db.lesson.delete({ where: { id: unpublishedLesson.id } })
  })

  test('handles course with no lessons gracefully', async () => {
    // Create course with no lessons
    const emptyCourse = await db.course.create({
      data: {
        title: 'Empty Course',
        slug: 'empty-course',
        description: 'Course with no lessons',
        category: 'JAVASCRIPT',
        level: 'BEGINNER',
        published: true,
        accessTier: 'FREE'
      }
    })

    // Enroll in empty course
    await enrollCourse({ courseId: emptyCourse.id })

    // Attempt certificate issuance (should fail)
    const result = await issueCertificate({ courseId: emptyCourse.id })
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    expect(result.message).toContain('lessons')

    // Cleanup
    await db.enrollment.deleteMany({ where: { courseId: emptyCourse.id } })
    await db.course.delete({ where: { id: emptyCourse.id } })
  })

  test('tracks certificate issuance analytics event', async () => {
    // Enroll and complete course
    await enrollCourse({ courseId })

    for (const lessonId of lessonIds) {
      await updateLessonProgress({
        lessonId,
        completed: true,
        watchTimeDelta: 300
      })
    }

    // Clear any existing analytics events
    await db.analyticsEvent.deleteMany({ where: { userId: testUserId } })

    // Issue certificate
    const certificateResult = await issueCertificate({ courseId })
    expect(certificateResult.success).toBe(true)

    // Verify analytics event was created
    const analyticsEvents = await db.analyticsEvent.findMany({
      where: {
        userId: testUserId,
        type: 'CERTIFICATE_ISSUED'
      }
    })

    expect(analyticsEvents).toHaveLength(1)
    expect(analyticsEvents[0].properties).toMatchObject({
      courseId,
      certificateId: certificateResult.certificate!.id
    })

    // Second issuance should not create another analytics event
    await issueCertificate({ courseId })

    const analyticsEventsAfterSecond = await db.analyticsEvent.findMany({
      where: {
        userId: testUserId,
        type: 'CERTIFICATE_ISSUED'
      }
    })

    expect(analyticsEventsAfterSecond).toHaveLength(1) // Still only one event
  })

  test('validates course access before certificate issuance', async () => {
    // Create premium course
    const premiumCourse = await db.course.create({
      data: {
        title: 'Premium Certificate Course',
        slug: 'premium-certificate-course',
        description: 'Premium course for certificate testing',
        category: 'TYPESCRIPT',
        level: 'INTERMEDIATE',
        published: true,
        accessTier: 'PREMIUM'
      }
    })

    // Create lesson for premium course
    const premiumLesson = await db.lesson.create({
      data: {
        title: 'Premium Lesson',
        slug: 'premium-lesson',
        courseId: premiumCourse.id,
        order: 1,
        published: true
      }
    })

    // Attempt to issue certificate without enrollment (should fail)
    const noEnrollmentResult = await issueCertificate({ courseId: premiumCourse.id })
    expect(noEnrollmentResult.success).toBe(false)
    expect(noEnrollmentResult.error).toBeDefined()

    // Enroll without subscription (should fail for premium course)
    const enrollWithoutSubResult = await enrollCourse({ courseId: premiumCourse.id })
    expect(enrollWithoutSubResult.success).toBe(false)

    // Create subscription
    await db.subscription.create({
      data: {
        userId: testUserId,
        status: 'ACTIVE',
        priceId: 'price_test_premium',
        stripeCustomerId: 'cus_test',
        stripeSubscriptionId: 'sub_test',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })

    // Now enrollment should succeed
    const enrollWithSubResult = await enrollCourse({ courseId: premiumCourse.id })
    expect(enrollWithSubResult.success).toBe(true)

    // Complete the lesson
    await updateLessonProgress({
      lessonId: premiumLesson.id,
      completed: true
    })

    // Now certificate issuance should succeed
    const certificateResult = await issueCertificate({ courseId: premiumCourse.id })
    expect(certificateResult.success).toBe(true)

    // Cleanup
    await db.certificate.deleteMany({ where: { courseId: premiumCourse.id } })
    await db.progress.deleteMany({ where: { lessonId: premiumLesson.id } })
    await db.enrollment.deleteMany({ where: { courseId: premiumCourse.id } })
    await db.subscription.deleteMany({ where: { userId: testUserId } })
    await db.lesson.delete({ where: { id: premiumLesson.id } })
    await db.course.delete({ where: { id: premiumCourse.id } })
  })
})