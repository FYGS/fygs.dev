import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { db } from '@/lib/db'
import { AnalyticsHelper } from '@/lib/analytics-helper'

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    analyticsEvent: {
      create: vi.fn(),
      createMany: vi.fn()
    }
  }
}))

describe('Analytics Events Helper', () => {
  const mockDbCreate = vi.mocked(db.analyticsEvent.create)
  const mockDbCreateMany = vi.mocked(db.analyticsEvent.createMany)

  beforeEach(() => {
    vi.clearAllMocks()
    mockDbCreate.mockResolvedValue({
      id: 'test-event-id',
      userId: 'test-user-id',
      type: 'ENROLLMENT_CREATED',
      source: 'server',
      properties: {},
      sessionId: null,
      createdAt: new Date()
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Event emission', () => {
    test('emits basic analytics event', async () => {
      await AnalyticsHelper.emit({
        userId: 'test-user-id',
        type: 'ENROLLMENT_CREATED',
        source: 'server',
        properties: {
          courseId: 'test-course-id',
          timestamp: '2024-01-01T00:00:00Z'
        }
      })

      expect(mockDbCreate).toHaveBeenCalledOnce()
      expect(mockDbCreate).toHaveBeenCalledWith({
        data: {
          userId: 'test-user-id',
          type: 'ENROLLMENT_CREATED',
          source: 'server',
          properties: expect.objectContaining({
            courseId: 'test-course-id',
            timestamp: '2024-01-01T00:00:00Z',
            correlationId: expect.any(String)
          }),
          sessionId: undefined,
          createdAt: expect.any(Date)
        }
      })
    })

    test('adds correlation ID when not provided', async () => {
      await AnalyticsHelper.emit({
        userId: 'test-user-id',
        type: 'LESSON_COMPLETED',
        source: 'server',
        properties: {
          lessonId: 'test-lesson-id'
        }
      })

      const callArgs = mockDbCreate.mock.calls[0][0]
      const properties = callArgs.data.properties as Record<string, any>
      expect(properties).toHaveProperty('correlationId')
      expect(properties.correlationId).toMatch(/^corr_/)
    })

    test('preserves provided correlation ID', async () => {
      const customCorrelationId = 'custom-correlation-id'
      
      await AnalyticsHelper.emit({
        userId: 'test-user-id',
        type: 'CERTIFICATE_ISSUED',
        source: 'server',
        properties: {
          certificateId: 'test-cert-id',
          correlationId: customCorrelationId
        }
      })

      const callArgs = mockDbCreate.mock.calls[0][0]
      const properties = callArgs.data.properties as Record<string, any>
      expect(properties.correlationId).toBe(customCorrelationId)
    })

    test('handles missing required fields gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      // Missing userId
      await AnalyticsHelper.emit({
        userId: '',
        type: 'ENROLLMENT_CREATED',
        source: 'server',
        properties: {}
      })

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Missing required fields:',
        expect.objectContaining({
          hasUserId: false,
          hasType: true,
          hasSource: true
        })
      )
      expect(mockDbCreate).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    test('handles database errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockDbCreate.mockRejectedValueOnce(new Error('Database error'))

      // Should not throw
      await expect(AnalyticsHelper.emit({
        userId: 'test-user-id',
        type: 'ENROLLMENT_CREATED',
        source: 'server',
        properties: {}
      })).resolves.not.toThrow()

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Analytics] Failed to emit event:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('PII sanitization', () => {
    test('removes PII fields from properties', async () => {
      await AnalyticsHelper.emit({
        userId: 'test-user-id',
        type: 'ENROLLMENT_CREATED',
        source: 'server',
        properties: {
          courseId: 'test-course-id',
          email: 'user@example.com',
          name: 'John Doe',
          firstName: 'John',
          lastName: 'Doe',
          address: '123 Main St',
          phone: '+1234567890',
          ip: '192.168.1.1',
          timestamp: '2024-01-01T00:00:00Z'
        }
      })

      const callArgs = mockDbCreate.mock.calls[0][0]
      const properties = callArgs.data.properties

      // Should keep non-PII fields
      expect(properties).toHaveProperty('courseId', 'test-course-id')
      expect(properties).toHaveProperty('timestamp', '2024-01-01T00:00:00Z')

      // Should remove PII fields
      expect(properties).not.toHaveProperty('email')
      expect(properties).not.toHaveProperty('name')
      expect(properties).not.toHaveProperty('firstName')
      expect(properties).not.toHaveProperty('lastName')
      expect(properties).not.toHaveProperty('address')
      expect(properties).not.toHaveProperty('phone')
      expect(properties).not.toHaveProperty('ip')
    })

    test('hashes sensitive identifiers', async () => {
      await AnalyticsHelper.emit({
        userId: 'test-user-id',
        type: 'SUBSCRIPTION_STARTED',
        source: 'webhook',
        properties: {
          stripeCustomerId: 'cus_real_customer_id',
          sessionId: 'sess_real_session_id',
          amount: 2900
        }
      })

      const callArgs = mockDbCreate.mock.calls[0][0]
      const properties = callArgs.data.properties as Record<string, any>

      // Should hash Stripe customer ID
      expect(properties.stripeCustomerId).not.toBe('cus_real_customer_id')
      expect(properties.stripeCustomerId).toMatch(/^[a-z0-9]+$/)

      // Should hash session ID
      expect(properties.sessionId).not.toBe('sess_real_session_id')
      expect(properties.sessionId).toMatch(/^[a-z0-9]+$/)

      // Should preserve amount
      expect(properties.amount).toBe(2900)
    })
  })

  describe('Specific event types', () => {
    test('records enrollment event with correct shape', async () => {
      await AnalyticsHelper.recordEnrollment('test-user-id', {
        courseId: 'test-course-id',
        courseTitle: 'Test Course',
        courseTier: 'PREMIUM',
        enrollmentSource: 'catalog',
        hasActiveSubscription: true,
        timestamp: '2024-01-01T00:00:00Z'
      })

      expect(mockDbCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'test-user-id',
          type: 'ENROLLMENT_CREATED',
          source: 'server',
          properties: expect.objectContaining({
            courseId: 'test-course-id',
            courseTitle: 'Test Course',
            courseTier: 'PREMIUM',
            enrollmentSource: 'catalog',
            hasActiveSubscription: true,
            timestamp: '2024-01-01T00:00:00Z'
          })
        })
      })
    })

    test('records purchase event with correct shape', async () => {
      await AnalyticsHelper.recordPurchase('test-user-id', {
        courseId: 'test-course-id',
        productType: 'course',
        amount: 9900,
        currency: 'EUR',
        paymentMethod: 'card',
        timestamp: '2024-01-01T00:00:00Z'
      })

      expect(mockDbCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'test-user-id',
          type: 'COURSE_PURCHASED',
          source: 'webhook',
          properties: expect.objectContaining({
            courseId: 'test-course-id',
            productType: 'course',
            amount: 9900,
            currency: 'EUR',
            paymentMethod: 'card'
          })
        })
      })
    })

    test('records subscription events with correct shapes', async () => {
      await AnalyticsHelper.recordSubscriptionEvent('test-user-id', 'SUBSCRIPTION_STARTED', {
        subscriptionId: 'sub_test',
        plan: 'monthly',
        status: 'active',
        amount: 2900,
        currency: 'EUR',
        timestamp: '2024-01-01T00:00:00Z'
      })

      expect(mockDbCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'test-user-id',
          type: 'SUBSCRIPTION_STARTED',
          source: 'webhook',
          properties: expect.objectContaining({
            subscriptionId: 'sub_test',
            plan: 'monthly',
            status: 'active',
            amount: 2900,
            currency: 'EUR'
          })
        })
      })
    })

    test('records refund event with correct shape', async () => {
      await AnalyticsHelper.recordRefund('test-user-id', {
        originalAmount: 2900,
        refundAmount: 2900,
        currency: 'EUR',
        reason: 'requested_by_customer',
        eligibilityWindow: 15,
        subscriptionId: 'sub_test',
        timestamp: '2024-01-01T00:00:00Z'
      })

      expect(mockDbCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'test-user-id',
          type: 'REFUND_ISSUED',
          source: 'server',
          properties: expect.objectContaining({
            originalAmount: 2900,
            refundAmount: 2900,
            currency: 'EUR',
            reason: 'requested_by_customer',
            eligibilityWindow: 15
          })
        })
      })
    })

    test('records lesson completion event with correct shape', async () => {
      await AnalyticsHelper.recordLessonCompletion('test-user-id', {
        lessonId: 'test-lesson-id',
        courseId: 'test-course-id',
        lessonOrder: 1,
        watchTime: 600,
        completionPercentage: 100,
        isFirstCompletion: true,
        timestamp: '2024-01-01T00:00:00Z'
      })

      expect(mockDbCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'test-user-id',
          type: 'LESSON_COMPLETED',
          source: 'server',
          properties: expect.objectContaining({
            lessonId: 'test-lesson-id',
            courseId: 'test-course-id',
            lessonOrder: 1,
            watchTime: 600,
            completionPercentage: 100,
            isFirstCompletion: true
          })
        })
      })
    })

    test('records certificate issuance event with correct shape', async () => {
      await AnalyticsHelper.recordCertificateIssuance('test-user-id', {
        certificateId: 'test-cert-id',
        courseId: 'test-course-id',
        courseTitle: 'Test Course',
        completionDate: '2024-01-01',
        totalLessons: 10,
        totalWatchTime: 3600,
        timestamp: '2024-01-01T00:00:00Z'
      })

      expect(mockDbCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'test-user-id',
          type: 'CERTIFICATE_ISSUED',
          source: 'server',
          properties: expect.objectContaining({
            certificateId: 'test-cert-id',
            courseId: 'test-course-id',
            courseTitle: 'Test Course',
            completionDate: '2024-01-01',
            totalLessons: 10,
            totalWatchTime: 3600
          })
        })
      })
    })

    test('records recommendation events with correct shapes', async () => {
      // Test impression
      await AnalyticsHelper.recordRecommendationImpression('test-user-id', {
        recommendationType: 'similar_courses',
        courseIds: ['course1', 'course2', 'course3'],
        position: 1,
        context: 'homepage',
        timestamp: '2024-01-01T00:00:00Z'
      })

      expect(mockDbCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'test-user-id',
          type: 'RECOMMENDATION_IMPRESSION',
          source: 'web',
          properties: expect.objectContaining({
            recommendationType: 'similar_courses',
            courseIds: ['course1', 'course2', 'course3'],
            position: 1,
            context: 'homepage'
          })
        })
      })

      // Reset mock for next call
      mockDbCreate.mockClear()

      // Test click
      await AnalyticsHelper.recordRecommendationClick('test-user-id', {
        recommendationType: 'for_you',
        courseIds: ['course1', 'course2'],
        position: 2,
        context: 'dashboard',
        clickedCourseId: 'course1',
        timestamp: '2024-01-01T00:00:00Z'
      })

      expect(mockDbCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'test-user-id',
          type: 'RECOMMENDATION_CLICK',
          source: 'web',
          properties: expect.objectContaining({
            recommendationType: 'for_you',
            courseIds: ['course1', 'course2'],
            position: 2,
            context: 'dashboard',
            clickedCourseId: 'course1'
          })
        })
      })
    })
  })

  describe('Batch operations', () => {
    test('handles batch event emission', async () => {
      const events = [
        {
          userId: 'user1',
          type: 'ENROLLMENT_CREATED' as const,
          source: 'server' as const,
          properties: { courseId: 'course1' }
        },
        {
          userId: 'user2',
          type: 'LESSON_COMPLETED' as const,
          source: 'server' as const,
          properties: { lessonId: 'lesson1' }
        }
      ]

      await AnalyticsHelper.emitBatch(events)

      expect(mockDbCreateMany).toHaveBeenCalledOnce()
      expect(mockDbCreateMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            userId: 'user1',
            type: 'ENROLLMENT_CREATED',
            source: 'server',
            properties: expect.objectContaining({
              courseId: 'course1',
              correlationId: expect.any(String)
            })
          }),
          expect.objectContaining({
            userId: 'user2',
            type: 'LESSON_COMPLETED',
            source: 'server',
            properties: expect.objectContaining({
              lessonId: 'lesson1',
              correlationId: expect.any(String)
            })
          })
        ]
      })
    })

    test('handles batch emission errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockDbCreateMany.mockRejectedValueOnce(new Error('Batch error'))

      await expect(AnalyticsHelper.emitBatch([
        {
          userId: 'user1',
          type: 'ENROLLMENT_CREATED',
          source: 'server',
          properties: {}
        }
      ])).resolves.not.toThrow()

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Analytics] Failed to emit batch events:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Utility functions', () => {
    test('generates valid correlation IDs', () => {
      const id1 = AnalyticsHelper.generateCorrelationId()
      const id2 = AnalyticsHelper.generateCorrelationId()

      expect(id1).toMatch(/^corr_\d+_[a-z0-9]+$/)
      expect(id2).toMatch(/^corr_\d+_[a-z0-9]+$/)
      expect(id1).not.toBe(id2) // Should be unique
    })

    test('hash function produces consistent results', () => {
      // Access private method via type assertion for testing
      const hash1 = (AnalyticsHelper as any).hashString('test-input')
      const hash2 = (AnalyticsHelper as any).hashString('test-input')
      const hash3 = (AnalyticsHelper as any).hashString('different-input')

      expect(hash1).toBe(hash2) // Should be consistent
      expect(hash1).not.toBe(hash3) // Different inputs should produce different hashes
      expect(hash1).toMatch(/^[a-z0-9]+$/) // Should be alphanumeric
    })
  })
})