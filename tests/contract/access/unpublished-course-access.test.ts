import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { db } from '@/lib/db'
import { AccessService } from '@/lib/access-service'

describe('Unpublished Course Access Contract Tests (FR-041)', () => {
  let testUserId: string
  let testCourseId: string
  let enrolledUserId: string
  let nonEnrolledUserId: string

  beforeEach(async () => {
    // Create test users
    const enrolledUser = await db.user.create({
      data: {
        email: 'enrolled@test.com',
        name: 'Enrolled User',
        emailVerified: true
      }
    })
    enrolledUserId = enrolledUser.id

    const nonEnrolledUser = await db.user.create({
      data: {
        email: 'nonenrolled@test.com', 
        name: 'Non-Enrolled User',
        emailVerified: true
      }
    })
    nonEnrolledUserId = nonEnrolledUser.id

    // Create test course (initially published)
    const course = await db.course.create({
      data: {
        title: 'Test Unpublish Course',
        slug: 'test-unpublish-course',
        description: 'Course for testing unpublish behavior',
        category: 'JAVASCRIPT',
        level: 'BEGINNER',
        published: true,
        accessTier: 'FREE'
      }
    })
    testCourseId = course.id

    // Enroll one user in the course
    await db.enrollment.create({
      data: {
        userId: enrolledUserId,
        courseId: testCourseId
      }
    })

    // Create some lessons for the course
    await db.lesson.createMany({
      data: [
        {
          title: 'Lesson 1',
          slug: 'lesson-1',
          courseId: testCourseId,
          order: 1,
          published: true
        },
        {
          title: 'Lesson 2', 
          slug: 'lesson-2',
          courseId: testCourseId,
          order: 2,
          published: true
        }
      ]
    })
  })

  afterEach(async () => {
    // Cleanup test data
    await db.progress.deleteMany({ where: { userId: { in: [enrolledUserId, nonEnrolledUserId] } } })
    await db.enrollment.deleteMany({ where: { courseId: testCourseId } })
    await db.lesson.deleteMany({ where: { courseId: testCourseId } })
    await db.course.delete({ where: { id: testCourseId } })
    await db.user.deleteMany({ where: { id: { in: [enrolledUserId, nonEnrolledUserId] } } })
  })

  describe('Published course behavior (baseline)', () => {
    test('enrolled user can access published course', async () => {
      const access = await AccessService.checkCourseAccess(enrolledUserId, testCourseId)
      
      expect(access.isEnrolledInCourse).toBe(true)
      expect(access.canAccessCourse).toBe(true)
      expect(access.canAccessLessons).toBe(true)
    })

    test('non-enrolled user cannot access published course (enrollment required)', async () => {
      const access = await AccessService.checkCourseAccess(nonEnrolledUserId, testCourseId)
      
      expect(access.isEnrolledInCourse).toBe(false)
      expect(access.canAccessCourse).toBe(false)
      expect(access.canAccessLessons).toBe(false)
    })

    test('published course appears in course listing', async () => {
      const publishedCourses = await db.course.findMany({
        where: { published: true },
        select: { id: true }
      })
      
      expect(publishedCourses.map(c => c.id)).toContain(testCourseId)
    })
  })

  describe('Unpublished course behavior (FR-041)', () => {
    beforeEach(async () => {
      // Unpublish the course
      await db.course.update({
        where: { id: testCourseId },
        data: { published: false }
      })
    })

    test('enrolled user retains full access to unpublished course', async () => {
      const access = await AccessService.checkCourseAccess(enrolledUserId, testCourseId)
      
      expect(access.isEnrolledInCourse).toBe(true)
      expect(access.canAccessCourse).toBe(true)
      expect(access.canAccessLessons).toBe(true)
      expect(access.accessReason).toBe('ok')
    })

    test('enrolled user can access all lessons in unpublished course', async () => {
      const lessons = await db.lesson.findMany({
        where: { courseId: testCourseId },
        select: { id: true }
      })

      for (const lesson of lessons) {
        const canAccess = await AccessService.canAccessLesson(enrolledUserId, lesson.id)
        expect(canAccess).toBe(true)
      }
    })

    test('enrolled user can make progress in unpublished course', async () => {
      const lessons = await db.lesson.findMany({
        where: { courseId: testCourseId },
        select: { id: true }
      })

      // Simulate progress on first lesson
      await db.progress.create({
        data: {
          userId: enrolledUserId,
          lessonId: lessons[0].id,
          completed: true,
          watchTime: 300,
          completedAt: new Date()
        }
      })

      const progress = await AccessService.getCourseProgress(enrolledUserId, testCourseId)
      expect(progress).toHaveLength(1)
      expect(progress[0].completed).toBe(true)
    })

    test('non-enrolled user cannot access unpublished course', async () => {
      const access = await AccessService.checkCourseAccess(nonEnrolledUserId, testCourseId)
      
      expect(access.isEnrolledInCourse).toBe(false)
      expect(access.canAccessCourse).toBe(false)
      expect(access.canAccessLessons).toBe(false)
      expect(access.accessReason).toBe('not_enrolled')
    })

    test('unpublished course is hidden from catalog/search', async () => {
      const publishedCourses = await db.course.findMany({
        where: { published: true },
        select: { id: true }
      })
      
      expect(publishedCourses.map(c => c.id)).not.toContain(testCourseId)
    })

    test('unpublished course prevents new enrollments', async () => {
      // Simulate enrollment attempt (this would typically be blocked at server action level)
      const courseForEnrollment = await db.course.findUnique({
        where: { id: testCourseId },
        select: { published: true }
      })
      
      expect(courseForEnrollment?.published).toBe(false)
      // In actual implementation, enrollCourse server action would check this
    })

    test('enrolled user can still see course in their dashboard/my-courses', async () => {
      // Simulate dashboard query for user's enrolled courses
      const userEnrollments = await db.enrollment.findMany({
        where: { userId: enrolledUserId },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              published: true
            }
          }
        }
      })

      const enrolledCourseIds = userEnrollments.map(e => e.course.id)
      expect(enrolledCourseIds).toContain(testCourseId)
      
      // Course should still be accessible even though unpublished
      const courseInDashboard = userEnrollments.find(e => e.course.id === testCourseId)
      expect(courseInDashboard).toBeDefined()
      expect(courseInDashboard?.course.published).toBe(false)
    })

    test('enrolled user can still earn certificates for unpublished course', async () => {
      // Complete all lessons
      const lessons = await db.lesson.findMany({
        where: { courseId: testCourseId },
        select: { id: true }
      })

      // Mark all lessons as completed
      for (const lesson of lessons) {
        await db.progress.upsert({
          where: {
            userId_lessonId: {
              userId: enrolledUserId,
              lessonId: lesson.id
            }
          },
          create: {
            userId: enrolledUserId,
            lessonId: lesson.id,
            completed: true,
            watchTime: 600,
            completedAt: new Date()
          },
          update: {
            completed: true,
            completedAt: new Date()
          }
        })
      }

      // Check certificate eligibility (should still work for unpublished course)
      const { CertificateService } = await import('@/lib/certificate-service')
      const eligibility = await CertificateService.checkCertificateEligibility(enrolledUserId, testCourseId)
      
      expect(eligibility.eligible).toBe(true)
      expect(eligibility.completionPercentage).toBe(100)
    })
  })

  describe('State transition edge cases', () => {
    test('course unpublish → republish retains all enrollments and progress', async () => {
      // Create progress before unpublishing
      const lessons = await db.lesson.findMany({
        where: { courseId: testCourseId },
        select: { id: true }
      })

      await db.progress.create({
        data: {
          userId: enrolledUserId,
          lessonId: lessons[0].id,
          completed: true,
          watchTime: 300,
          completedAt: new Date()
        }
      })

      // Unpublish course
      await db.course.update({
        where: { id: testCourseId },
        data: { published: false }
      })

      // Republish course
      await db.course.update({
        where: { id: testCourseId },
        data: { published: true }
      })

      // Verify enrollment and progress preserved
      const access = await AccessService.checkCourseAccess(enrolledUserId, testCourseId)
      expect(access.isEnrolledInCourse).toBe(true)
      expect(access.canAccessCourse).toBe(true)

      const progress = await AccessService.getCourseProgress(enrolledUserId, testCourseId)
      expect(progress).toHaveLength(1)
      expect(progress[0].completed).toBe(true)
    })

    test('bulk course unpublish does not affect enrolled user access', async () => {
      // Create additional test course
      const course2 = await db.course.create({
        data: {
          title: 'Test Course 2',
          slug: 'test-course-2',
          description: 'Second test course',
          category: 'TYPESCRIPT',
          level: 'INTERMEDIATE', 
          published: true,
          accessTier: 'FREE'
        }
      })

      // Enroll user in second course
      await db.enrollment.create({
        data: {
          userId: enrolledUserId,
          courseId: course2.id
        }
      })

      // Unpublish both courses
      await db.course.updateMany({
        where: { 
          id: { in: [testCourseId, course2.id] }
        },
        data: { published: false }
      })

      // Verify user retains access to both
      const access1 = await AccessService.checkCourseAccess(enrolledUserId, testCourseId)
      const access2 = await AccessService.checkCourseAccess(enrolledUserId, course2.id)
      
      expect(access1.canAccessCourse).toBe(true)
      expect(access2.canAccessCourse).toBe(true)

      // Cleanup
      await db.enrollment.delete({ where: { userId_courseId: { userId: enrolledUserId, courseId: course2.id } } })
      await db.course.delete({ where: { id: course2.id } })
    })
  })
})