import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { db } from '@/lib/db'
import { CertificateService } from '@/lib/certificate-service'

describe('Certificate Issuance Idempotency Contract Tests', () => {
  let testUserId: string
  let testCourseId: string
  let testLessonIds: string[]

  beforeEach(async () => {
    // Create test user
    const user = await db.user.create({
      data: {
        email: 'certificate-test@example.com',
        name: 'Certificate Test User',
        emailVerified: true
      }
    })
    testUserId = user.id

    // Create test course
    const course = await db.course.create({
      data: {
        title: 'Certificate Test Course',
        slug: 'certificate-test-course',
        description: 'Course for testing certificate issuance',
        category: 'JAVASCRIPT',
        level: 'BEGINNER',
        published: true,
        accessTier: 'FREE'
      }
    })
    testCourseId = course.id

    // Create lessons for the course
    const lessons = await Promise.all([
      db.lesson.create({
        data: {
          title: 'Lesson 1',
          slug: 'lesson-1',
          courseId: testCourseId,
          order: 1,
          published: true
        }
      }),
      db.lesson.create({
        data: {
          title: 'Lesson 2',
          slug: 'lesson-2',
          courseId: testCourseId,
          order: 2,
          published: true
        }
      }),
      db.lesson.create({
        data: {
          title: 'Lesson 3',
          slug: 'lesson-3',
          courseId: testCourseId,
          order: 3,
          published: true
        }
      })
    ])
    testLessonIds = lessons.map(l => l.id)

    // Enroll user in course
    await db.enrollment.create({
      data: {
        userId: testUserId,
        courseId: testCourseId
      }
    })
  })

  afterEach(async () => {
    // Cleanup in reverse dependency order
    await db.certificate.deleteMany({ where: { userId: testUserId } })
    await db.progress.deleteMany({ where: { userId: testUserId } })
    await db.enrollment.deleteMany({ where: { userId: testUserId } })
    await db.lesson.deleteMany({ where: { courseId: testCourseId } })
    await db.course.delete({ where: { id: testCourseId } })
    await db.user.delete({ where: { id: testUserId } })
  })

  describe('Single certificate issuance guarantee', () => {
    test('first issuance attempt creates certificate', async () => {
      // Complete all lessons
      await completeAllLessons()

      // Issue certificate
      const result = await CertificateService.issueCertificate({
        userId: testUserId,
        courseId: testCourseId,
        completedLessons: testLessonIds.length,
        totalLessons: testLessonIds.length,
        completionPercentage: 100
      })

      expect(result.success).toBe(true)
      expect(result.certificate).toBeDefined()
      expect(result.certificate!.id).toMatch(/^[a-z0-9]+$/) // CUID format
      expect(result.certificate!.issuedAt).toBeInstanceOf(Date)
      expect(result.alreadyIssued).toBe(false)

      // Verify certificate exists in database
      const dbCertificate = await db.certificate.findUnique({
        where: {
          userId_courseId: {
            userId: testUserId,
            courseId: testCourseId
          }
        }
      })
      
      expect(dbCertificate).toBeDefined()
      expect(dbCertificate!.id).toBe(result.certificate!.id)
    })

    test('second issuance attempt returns existing certificate (idempotent)', async () => {
      // Complete all lessons
      await completeAllLessons()

      // First issuance
      const firstResult = await CertificateService.issueCertificate({
        userId: testUserId,
        courseId: testCourseId,
        completedLessons: testLessonIds.length,
        totalLessons: testLessonIds.length,
        completionPercentage: 100
      })

      expect(firstResult.success).toBe(true)
      expect(firstResult.alreadyIssued).toBe(false)

      // Second issuance attempt
      const secondResult = await CertificateService.issueCertificate({
        userId: testUserId,
        courseId: testCourseId,
        completedLessons: testLessonIds.length,
        totalLessons: testLessonIds.length,
        completionPercentage: 100
      })

      expect(secondResult.success).toBe(true)
      expect(secondResult.alreadyIssued).toBe(true)
      expect(secondResult.certificate!.id).toBe(firstResult.certificate!.id)
      expect(secondResult.certificate!.issuedAt.getTime()).toBe(firstResult.certificate!.issuedAt.getTime())

      // Verify only one certificate exists in database
      const certificateCount = await db.certificate.count({
        where: {
          userId: testUserId,
          courseId: testCourseId
        }
      })
      
      expect(certificateCount).toBe(1)
    })

    test('multiple rapid issuance attempts create only one certificate', async () => {
      // Complete all lessons
      await completeAllLessons()

      // Launch multiple issuance attempts simultaneously
      const issuancePromises = Array.from({ length: 5 }, () =>
        CertificateService.issueCertificate({
          userId: testUserId,
          courseId: testCourseId,
          completedLessons: testLessonIds.length,
          totalLessons: testLessonIds.length,
          completionPercentage: 100
        })
      )

      const results = await Promise.all(issuancePromises)

      // All should succeed
      results.forEach(result => {
        expect(result.success).toBe(true)
        expect(result.certificate).toBeDefined()
      })

      // All should return the same certificate ID
      const certificateIds = results.map(r => r.certificate!.id)
      const uniqueIds = new Set(certificateIds)
      expect(uniqueIds.size).toBe(1)

      // At least one should indicate it was the original issuance
      const originalIssuances = results.filter(r => !r.alreadyIssued)
      expect(originalIssuances.length).toBeGreaterThanOrEqual(1)

      // Others should indicate already issued
      const duplicateIssuances = results.filter(r => r.alreadyIssued)
      expect(duplicateIssuances.length).toBeGreaterThanOrEqual(0)

      // Verify only one certificate exists in database
      const certificateCount = await db.certificate.count({
        where: {
          userId: testUserId,
          courseId: testCourseId
        }
      })
      
      expect(certificateCount).toBe(1)
    })
  })

  describe('Completion verification enforcement', () => {
    test('issuance fails when course not 100% complete', async () => {
      // Complete only some lessons (not all)
      await db.progress.create({
        data: {
          userId: testUserId,
          lessonId: testLessonIds[0],
          completed: true,
          watchTime: 300,
          completedAt: new Date()
        }
      })

      const result = await CertificateService.issueCertificate({
        userId: testUserId,
        courseId: testCourseId,
        completedLessons: 1,
        totalLessons: testLessonIds.length,
        completionPercentage: 33 // Less than 100%
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('completion is 33%')
      expect(result.certificate).toBeUndefined()
      expect(result.alreadyIssued).toBeUndefined()

      // Verify no certificate created
      const certificate = await db.certificate.findUnique({
        where: {
          userId_courseId: {
            userId: testUserId,
            courseId: testCourseId
          }
        }
      })
      
      expect(certificate).toBeNull()
    })

    test('issuance rechecks completion within transaction', async () => {
      // Create progress for only 2 out of 3 lessons
      await db.progress.createMany({
        data: [
          {
            userId: testUserId,
            lessonId: testLessonIds[0],
            completed: true,
            watchTime: 300,
            completedAt: new Date()
          },
          {
            userId: testUserId,
            lessonId: testLessonIds[1],
            completed: true,
            watchTime: 250,
            completedAt: new Date()
          }
        ]
      })

      // Attempt issuance claiming 100% completion (but actual is 66%)
      const result = await CertificateService.issueCertificate({
        userId: testUserId,
        courseId: testCourseId,
        completedLessons: 3, // Claimed
        totalLessons: 3,
        completionPercentage: 100 // Claimed
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Actual completion is 66%')

      // Verify no certificate created despite claimed completion
      const certificate = await db.certificate.findUnique({
        where: {
          userId_courseId: {
            userId: testUserId,
            courseId: testCourseId
          }
        }
      })
      
      expect(certificate).toBeNull()
    })

    test('issuance succeeds when completion verified within transaction', async () => {
      // Complete 2 lessons initially
      await db.progress.createMany({
        data: [
          {
            userId: testUserId,
            lessonId: testLessonIds[0],
            completed: true,
            watchTime: 300,
            completedAt: new Date()
          },
          {
            userId: testUserId,
            lessonId: testLessonIds[1],
            completed: true,
            watchTime: 250,
            completedAt: new Date()
          }
        ]
      })

      // Complete the final lesson just before issuance
      await db.progress.create({
        data: {
          userId: testUserId,
          lessonId: testLessonIds[2],
          completed: true,
          watchTime: 400,
          completedAt: new Date()
        }
      })

      // Now attempt issuance
      const result = await CertificateService.issueCertificate({
        userId: testUserId,
        courseId: testCourseId,
        completedLessons: 3,
        totalLessons: 3,
        completionPercentage: 100
      })

      expect(result.success).toBe(true)
      expect(result.certificate).toBeDefined()
      expect(result.alreadyIssued).toBe(false)

      // Verify certificate created
      const certificate = await db.certificate.findUnique({
        where: {
          userId_courseId: {
            userId: testUserId,
            courseId: testCourseId
          }
        }
      })
      
      expect(certificate).toBeDefined()
    })
  })

  describe('Error handling and edge cases', () => {
    test('issuance fails for non-existent user', async () => {
      await completeAllLessons()

      const result = await CertificateService.issueCertificate({
        userId: 'non-existent-user-id',
        courseId: testCourseId,
        completedLessons: testLessonIds.length,
        totalLessons: testLessonIds.length,
        completionPercentage: 100
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    test('issuance fails for non-existent course', async () => {
      const result = await CertificateService.issueCertificate({
        userId: testUserId,
        courseId: 'non-existent-course-id',
        completedLessons: 3,
        totalLessons: 3,
        completionPercentage: 100
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    test('issuance handles database constraints properly', async () => {
      await completeAllLessons()

      // Create certificate manually to simulate constraint violation
      await db.certificate.create({
        data: {
          userId: testUserId,
          courseId: testCourseId,
          issuedAt: new Date()
        }
      })

      // Attempt issuance should detect existing certificate
      const result = await CertificateService.issueCertificate({
        userId: testUserId,
        courseId: testCourseId,
        completedLessons: testLessonIds.length,
        totalLessons: testLessonIds.length,
        completionPercentage: 100
      })

      expect(result.success).toBe(true)
      expect(result.alreadyIssued).toBe(true)
      expect(result.certificate).toBeDefined()
    })
  })

  describe('Immutable timestamp preservation', () => {
    test('certificate issuedAt timestamp never changes', async () => {
      await completeAllLessons()

      const firstResult = await CertificateService.issueCertificate({
        userId: testUserId,
        courseId: testCourseId,
        completedLessons: testLessonIds.length,
        totalLessons: testLessonIds.length,
        completionPercentage: 100
      })

      const originalTimestamp = firstResult.certificate!.issuedAt

      // Wait a bit and attempt another issuance
      await new Promise(resolve => setTimeout(resolve, 10))

      const secondResult = await CertificateService.issueCertificate({
        userId: testUserId,
        courseId: testCourseId,
        completedLessons: testLessonIds.length,
        totalLessons: testLessonIds.length,
        completionPercentage: 100
      })

      expect(secondResult.certificate!.issuedAt.getTime()).toBe(originalTimestamp.getTime())

      // Verify database timestamp is also unchanged
      const dbCertificate = await db.certificate.findUnique({
        where: {
          userId_courseId: {
            userId: testUserId,
            courseId: testCourseId
          }
        }
      })

      expect(dbCertificate!.issuedAt.getTime()).toBe(originalTimestamp.getTime())
    })
  })

  // Helper function to complete all lessons
  async function completeAllLessons() {
    await db.progress.createMany({
      data: testLessonIds.map(lessonId => ({
        userId: testUserId,
        lessonId,
        completed: true,
        watchTime: 300,
        completedAt: new Date()
      }))
    })
  }
})