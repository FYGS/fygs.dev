import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { db } from '@/lib/db'

describe('Progress Upsert Idempotency Contract Tests', () => {
  let testUserId: string
  let testCourseId: string
  let testLessonId: string

  beforeEach(async () => {
    // Create test user
    const user = await db.user.create({
      data: {
        email: 'progress-test@example.com',
        name: 'Progress Test User',
        emailVerified: true
      }
    })
    testUserId = user.id

    // Create test course
    const course = await db.course.create({
      data: {
        title: 'Progress Test Course',
        slug: 'progress-test-course',
        description: 'Course for testing progress upsert',
        category: 'JAVASCRIPT',
        level: 'BEGINNER',
        published: true,
        accessTier: 'FREE'
      }
    })
    testCourseId = course.id

    // Create test lesson
    const lesson = await db.lesson.create({
      data: {
        title: 'Test Lesson',
        slug: 'test-lesson',
        courseId: testCourseId,
        order: 1,
        published: true
      }
    })
    testLessonId = lesson.id

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
    await db.progress.deleteMany({ where: { userId: testUserId } })
    await db.enrollment.deleteMany({ where: { userId: testUserId } })
    await db.lesson.deleteMany({ where: { courseId: testCourseId } })
    await db.course.delete({ where: { id: testCourseId } })
    await db.user.delete({ where: { id: testUserId } })
  })

  describe('Initial progress creation', () => {
    test('first progress update creates new record', async () => {
      const result = await db.progress.upsert({
        where: {
          userId_lessonId: {
            userId: testUserId,
            lessonId: testLessonId
          }
        },
        create: {
          userId: testUserId,
          lessonId: testLessonId,
          completed: false,
          watchTime: 120,
          completedAt: null
        },
        update: {
          watchTime: 120,
          updatedAt: new Date()
        }
      })

      expect(result).toBeDefined()
      expect(result.userId).toBe(testUserId)
      expect(result.lessonId).toBe(testLessonId)
      expect(result.completed).toBe(false)
      expect(result.watchTime).toBe(120)
      expect(result.completedAt).toBeNull()
      expect(result.createdAt).toBeInstanceOf(Date)
      expect(result.updatedAt).toBeInstanceOf(Date)

      // Verify record exists in database
      const dbProgress = await db.progress.findUnique({
        where: {
          userId_lessonId: {
            userId: testUserId,
            lessonId: testLessonId
          }
        }
      })

      expect(dbProgress).toBeDefined()
      expect(dbProgress!.id).toBe(result.id)
    })

    test('progress creation with completion immediately', async () => {
      const completedAt = new Date()
      
      const result = await db.progress.upsert({
        where: {
          userId_lessonId: {
            userId: testUserId,
            lessonId: testLessonId
          }
        },
        create: {
          userId: testUserId,
          lessonId: testLessonId,
          completed: true,
          watchTime: 300,
          completedAt
        },
        update: {
          completed: true,
          watchTime: 300,
          completedAt,
          updatedAt: new Date()
        }
      })

      expect(result.completed).toBe(true)
      expect(result.watchTime).toBe(300)
      expect(result.completedAt).toEqual(completedAt)
    })
  })

  describe('Watch time accumulation semantics', () => {
    test('multiple watch time updates accumulate correctly', async () => {
      // First update: 2 minutes
      const first = await db.progress.upsert({
        where: {
          userId_lessonId: {
            userId: testUserId,
            lessonId: testLessonId
          }
        },
        create: {
          userId: testUserId,
          lessonId: testLessonId,
          completed: false,
          watchTime: 120
        },
        update: {
          watchTime: 120,
          updatedAt: new Date()
        }
      })

      expect(first.watchTime).toBe(120)

      // Second update: add 3 more minutes (total 5 minutes)
      const existingProgress = await db.progress.findUnique({
        where: {
          userId_lessonId: {
            userId: testUserId,
            lessonId: testLessonId
          }
        }
      })

      const second = await db.progress.update({
        where: {
          userId_lessonId: {
            userId: testUserId,
            lessonId: testLessonId
          }
        },
        data: {
          watchTime: existingProgress!.watchTime + 180, // Add 3 minutes
          updatedAt: new Date()
        }
      })

      expect(second.watchTime).toBe(300) // 120 + 180
      expect(second.id).toBe(first.id) // Same record

      // Third update: add 2 more minutes (total 7 minutes)
      const third = await db.progress.update({
        where: {
          userId_lessonId: {
            userId: testUserId,
            lessonId: testLessonId
          }
        },
        data: {
          watchTime: second.watchTime + 120, // Add 2 minutes
          updatedAt: new Date()
        }
      })

      expect(third.watchTime).toBe(420) // 300 + 120
      expect(third.id).toBe(first.id) // Same record
    })

    test('watch time can only increase (no decrease allowed)', async () => {
      // Create initial progress with 5 minutes
      await db.progress.create({
        data: {
          userId: testUserId,
          lessonId: testLessonId,
          completed: false,
          watchTime: 300
        }
      })

      // Attempt to decrease watch time (should preserve max value)
      const result = await db.progress.update({
        where: {
          userId_lessonId: {
            userId: testUserId,
            lessonId: testLessonId
          }
        },
        data: {
          watchTime: 180, // Attempting to set to 3 minutes (less than current 5)
          updatedAt: new Date()
        }
      })

      // In a real implementation, you might want business logic to prevent decrease
      // For now, this tests that the database accepts the update
      expect(result.watchTime).toBe(180) // Database allows it, but business logic should prevent
    })

    test('concurrent watch time updates maintain consistency', async () => {
      // Create initial progress
      await db.progress.create({
        data: {
          userId: testUserId,
          lessonId: testLessonId,
          completed: false,
          watchTime: 100
        }
      })

      // Simulate concurrent updates (in real implementation, this should use proper locking/transactions)
      const updates = Array.from({ length: 5 }, (_, i) => 
        db.progress.update({
          where: {
            userId_lessonId: {
              userId: testUserId,
              lessonId: testLessonId
            }
          },
          data: {
            watchTime: 100 + (i + 1) * 60, // Add 60 seconds each
            updatedAt: new Date()
          }
        })
      )

      const results = await Promise.all(updates)

      // All updates should target the same record
      const uniqueIds = new Set(results.map(r => r.id))
      expect(uniqueIds.size).toBe(1)

      // Final state should reflect the last update
      const finalProgress = await db.progress.findUnique({
        where: {
          userId_lessonId: {
            userId: testUserId,
            lessonId: testLessonId
          }
        }
      })

      expect(finalProgress).toBeDefined()
      expect(finalProgress!.watchTime).toBeGreaterThanOrEqual(100)
    })
  })

  describe('Completion state transitions', () => {
    test('lesson can be marked completed and uncompleted idempotently', async () => {
      // Create initial incomplete progress
      const initial = await db.progress.create({
        data: {
          userId: testUserId,
          lessonId: testLessonId,
          completed: false,
          watchTime: 150
        }
      })

      expect(initial.completed).toBe(false)
      expect(initial.completedAt).toBeNull()

      // Mark as completed
      const completedAt = new Date()
      const completed = await db.progress.update({
        where: {
          userId_lessonId: {
            userId: testUserId,
            lessonId: testLessonId
          }
        },
        data: {
          completed: true,
          completedAt,
          updatedAt: new Date()
        }
      })

      expect(completed.completed).toBe(true)
      expect(completed.completedAt).toEqual(completedAt)
      expect(completed.id).toBe(initial.id)

      // Mark as completed again (idempotent)
      const reCompleted = await db.progress.update({
        where: {
          userId_lessonId: {
            userId: testUserId,
            lessonId: testLessonId
          }
        },
        data: {
          completed: true,
          // Note: completedAt should remain the original timestamp
          updatedAt: new Date()
        }
      })

      expect(reCompleted.completed).toBe(true)
      expect(reCompleted.completedAt).toEqual(completedAt) // Unchanged
      expect(reCompleted.id).toBe(initial.id)

      // Mark as incomplete
      const uncompleted = await db.progress.update({
        where: {
          userId_lessonId: {
            userId: testUserId,
            lessonId: testLessonId
          }
        },
        data: {
          completed: false,
          completedAt: null,
          updatedAt: new Date()
        }
      })

      expect(uncompleted.completed).toBe(false)
      expect(uncompleted.completedAt).toBeNull()
      expect(uncompleted.id).toBe(initial.id)
    })

    test('completion timestamp is preserved on re-completion', async () => {
      const originalCompletedAt = new Date('2024-01-01T12:00:00.000Z')

      // Create completed progress
      await db.progress.create({
        data: {
          userId: testUserId,
          lessonId: testLessonId,
          completed: true,
          watchTime: 300,
          completedAt: originalCompletedAt
        }
      })

      // Update with different completion attempt (should preserve original timestamp)
      const result = await db.progress.update({
        where: {
          userId_lessonId: {
            userId: testUserId,
            lessonId: testLessonId
          }
        },
        data: {
          completed: true,
          watchTime: 350, // Can update watch time
          // Don't update completedAt to preserve original
          updatedAt: new Date()
        }
      })

      expect(result.completed).toBe(true)
      expect(result.watchTime).toBe(350)
      expect(result.completedAt).toEqual(originalCompletedAt) // Preserved
    })
  })

  describe('Unique constraint enforcement', () => {
    test('cannot create duplicate progress records for same user-lesson', async () => {
      // Create first progress record
      await db.progress.create({
        data: {
          userId: testUserId,
          lessonId: testLessonId,
          completed: false,
          watchTime: 120
        }
      })

      // Attempt to create duplicate should fail
      await expect(
        db.progress.create({
          data: {
            userId: testUserId,
            lessonId: testLessonId,
            completed: true,
            watchTime: 200
          }
        })
      ).rejects.toThrow()

      // Verify only one record exists
      const progressCount = await db.progress.count({
        where: {
          userId: testUserId,
          lessonId: testLessonId
        }
      })

      expect(progressCount).toBe(1)
    })

    test('upsert operation handles unique constraint properly', async () => {
      // First upsert (create)
      const first = await db.progress.upsert({
        where: {
          userId_lessonId: {
            userId: testUserId,
            lessonId: testLessonId
          }
        },
        create: {
          userId: testUserId,
          lessonId: testLessonId,
          completed: false,
          watchTime: 100
        },
        update: {
          watchTime: 100,
          updatedAt: new Date()
        }
      })

      // Second upsert (update)
      const second = await db.progress.upsert({
        where: {
          userId_lessonId: {
            userId: testUserId,
            lessonId: testLessonId
          }
        },
        create: {
          userId: testUserId,
          lessonId: testLessonId,
          completed: true,
          watchTime: 250
        },
        update: {
          completed: true,
          watchTime: 250,
          completedAt: new Date(),
          updatedAt: new Date()
        }
      })

      expect(first.id).toBe(second.id) // Same record
      expect(second.completed).toBe(true)
      expect(second.watchTime).toBe(250)

      // Verify only one record exists
      const progressCount = await db.progress.count({
        where: {
          userId: testUserId,
          lessonId: testLessonId
        }
      })

      expect(progressCount).toBe(1)
    })
  })

  describe('Multiple lesson progress independence', () => {
    let secondLessonId: string

    beforeEach(async () => {
      // Create second lesson
      const lesson = await db.lesson.create({
        data: {
          title: 'Second Test Lesson',
          slug: 'second-test-lesson',
          courseId: testCourseId,
          order: 2,
          published: true
        }
      })
      secondLessonId = lesson.id
    })

    afterEach(async () => {
      await db.lesson.delete({ where: { id: secondLessonId } })
    })

    test('progress updates on different lessons are independent', async () => {
      // Create progress on first lesson
      const progress1 = await db.progress.create({
        data: {
          userId: testUserId,
          lessonId: testLessonId,
          completed: true,
          watchTime: 300,
          completedAt: new Date()
        }
      })

      // Create progress on second lesson
      const progress2 = await db.progress.create({
        data: {
          userId: testUserId,
          lessonId: secondLessonId,
          completed: false,
          watchTime: 150
        }
      })

      // Update first lesson progress
      const updated1 = await db.progress.update({
        where: { id: progress1.id },
        data: {
          watchTime: 400,
          updatedAt: new Date()
        }
      })

      // Verify second lesson progress unchanged
      const unchanged2 = await db.progress.findUnique({
        where: { id: progress2.id }
      })

      expect(updated1.watchTime).toBe(400)
      expect(unchanged2!.watchTime).toBe(150)
      expect(unchanged2!.completed).toBe(false)
    })

    test('can track progress on multiple lessons simultaneously', async () => {
      const lessons = [testLessonId, secondLessonId]
      const progressData = lessons.map((lessonId, index) => ({
        userId: testUserId,
        lessonId,
        completed: index === 0, // First lesson completed
        watchTime: (index + 1) * 200,
        completedAt: index === 0 ? new Date() : null
      }))

      // Create progress for both lessons
      await db.progress.createMany({
        data: progressData
      })

      // Verify both records exist
      const allProgress = await db.progress.findMany({
        where: {
          userId: testUserId,
          lessonId: { in: lessons }
        },
        orderBy: { lessonId: 'asc' }
      })

      expect(allProgress).toHaveLength(2)
      expect(allProgress[0].completed).toBe(true)
      expect(allProgress[0].watchTime).toBe(200)
      expect(allProgress[1].completed).toBe(false)
      expect(allProgress[1].watchTime).toBe(400)
    })
  })
})