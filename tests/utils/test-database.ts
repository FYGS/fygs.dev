/**
 * Test Database Isolation Utilities
 * 
 * Provides utilities for proper test database isolation with unique identifiers
 * and complete cleanup to prevent test interference.
 */

import { db } from '@/lib/db'
import { randomBytes } from 'crypto'

export class TestDatabase {
  private static testRunId = randomBytes(8).toString('hex')
  private static testCounter = 0

  /**
   * Generate a unique test identifier for this test run
   */
  static getUniqueId(prefix = 'test'): string {
    this.testCounter++
    return `${prefix}-${this.testRunId}-${this.testCounter}-${Date.now()}`
  }

  /**
   * Generate a unique email for testing
   */
  static getUniqueEmail(prefix = 'test'): string {
    return `${this.getUniqueId(prefix)}@example.com`
  }

  /**
   * Generate a unique slug for testing
   */
  static getUniqueSlug(prefix = 'test'): string {
    return `${this.getUniqueId(prefix)}`
  }

  /**
   * Clean up all test data for a specific user and their dependencies
   */
  static async cleanupUser(userId: string): Promise<void> {
    try {
      // Check if user exists first
      const user = await db.user.findUnique({ where: { id: userId } })
      if (!user) return

      // Clean up in dependency order
      await db.certificate.deleteMany({ where: { userId } })
      await db.progress.deleteMany({ where: { userId } })
      await db.enrollment.deleteMany({ where: { userId } })
      await db.subscription.deleteMany({ where: { userId } })
      await db.payment.deleteMany({ where: { userId } })
      await db.user.delete({ where: { id: userId } })
    } catch (error: any) {
      // Only log if it's not a "record not found" error
      if (error.code !== 'P2025') {
        console.warn(`Cleanup warning for user ${userId}:`, error)
      }
    }
  }

  /**
   * Clean up all test data for specific courses and their dependencies
   */
  static async cleanupCourses(courseIds: string[]): Promise<void> {
    try {
      for (const courseId of courseIds) {
        // Check if course exists first
        const course = await db.course.findUnique({ where: { id: courseId } })
        if (!course) continue

        await db.certificate.deleteMany({ where: { courseId } })
        await db.progress.deleteMany({ 
          where: { 
            lesson: { courseId } 
          } 
        })
        await db.enrollment.deleteMany({ where: { courseId } })
        await db.lesson.deleteMany({ where: { courseId } })
        await db.payment.deleteMany({ where: { courseId } })
        await db.course.delete({ where: { id: courseId } })
      }
    } catch (error: any) {
      // Only log if it's not a "record not found" error
      if (error.code !== 'P2025') {
        console.warn(`Cleanup warning for courses ${courseIds}:`, error)
      }
    }
  }

  /**
   * Clean up all test data for specific lessons
   */
  static async cleanupLessons(lessonIds: string[]): Promise<void> {
    try {
      for (const lessonId of lessonIds) {
        await db.progress.deleteMany({ where: { lessonId } })
        await db.lesson.delete({ where: { id: lessonId } })
      }
    } catch (error) {
      console.warn(`Cleanup warning for lessons ${lessonIds}:`, error)
    }
  }

  /**
   * Create a test user with unique email
   */
  static async createTestUser(name?: string): Promise<{ id: string; email: string }> {
    const email = this.getUniqueEmail('user')
    const user = await db.user.create({
      data: {
        email,
        name: name || 'Test User',
        emailVerified: true
      }
    })
    return { id: user.id, email: user.email }
  }

  /**
   * Create a test course with unique slug
   */
  static async createTestCourse(overrides?: Partial<any>): Promise<any> {
    const slug = this.getUniqueSlug('course')
    return await db.course.create({
      data: {
        title: 'Test Course',
        slug,
        description: 'Test course description',
        category: 'JAVASCRIPT',
        level: 'BEGINNER',
        accessTier: 'FREE',
        published: true,
        ...overrides
      }
    })
  }

  /**
   * Create a test lesson with unique slug
   */
  static async createTestLesson(courseId: string, overrides?: Partial<any>): Promise<any> {
    const slug = this.getUniqueSlug('lesson')
    return await db.lesson.create({
      data: {
        title: 'Test Lesson',
        slug,
        content: 'Test lesson content',
        courseId,
        order: 1,
        published: true,
        ...overrides
      }
    })
  }

  /**
   * Setup test environment with cleanup tracking
   */
  static setupTestEnvironment() {
    const resources = {
      userIds: [] as string[],
      courseIds: [] as string[],
      lessonIds: [] as string[]
    }

    const cleanup = async () => {
      await Promise.all([
        this.cleanupLessons(resources.lessonIds),
        this.cleanupCourses(resources.courseIds),
        ...resources.userIds.map(id => this.cleanupUser(id))
      ])
    }

    return {
      resources,
      cleanup,
      trackUser: (userId: string) => resources.userIds.push(userId),
      trackCourse: (courseId: string) => resources.courseIds.push(courseId),
      trackLesson: (lessonId: string) => resources.lessonIds.push(lessonId)
    }
  }
}

/**
 * Test helper for creating isolated test environments
 */
export function createTestEnvironment() {
  return TestDatabase.setupTestEnvironment()
}