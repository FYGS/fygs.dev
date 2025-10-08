import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { logger, createLogger, createCorrelationId, withPerformanceLogging, logStateTransition, logBusinessEvent } from '@/lib/structured-logger'

describe('Structured Logger', () => {
  let consoleSpy: any

  beforeEach(() => {
    // Mock console methods to capture log output
    consoleSpy = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      log: vi.spyOn(console, 'log').mockImplementation(() => {})
    }
  })

  afterEach(() => {
    // Restore console methods
    Object.values(consoleSpy).forEach((spy: any) => spy.mockRestore())
  })

  describe('Basic logging methods', () => {
    test('logs debug messages', () => {
      logger.debug('Test debug message', { userId: 'test-user' })

      expect(consoleSpy.debug).toHaveBeenCalledOnce()
      const logCall = consoleSpy.debug.mock.calls[0]
      expect(logCall[0]).toBe('[LOG]')
      expect(logCall[1]).toMatchObject({
        level: 'debug',
        message: 'Test debug message',
        userId: 'test-user'
      })
      expect(logCall[1].correlationId).toMatch(/^log_\d+_[a-z0-9]+$/)
    })

    test('logs info messages', () => {
      logger.info('Test info message', { operation: 'test-operation' })

      expect(consoleSpy.info).toHaveBeenCalledOnce()
      const logCall = consoleSpy.info.mock.calls[0]
      expect(logCall[1]).toMatchObject({
        level: 'info',
        message: 'Test info message',
        operation: 'test-operation'
      })
    })

    test('logs warning messages', () => {
      logger.warn('Test warning message', { resourceId: 'test-resource' })

      expect(consoleSpy.warn).toHaveBeenCalledOnce()
      const logCall = consoleSpy.warn.mock.calls[0]
      expect(logCall[1]).toMatchObject({
        level: 'warn',
        message: 'Test warning message',
        resourceId: 'test-resource'
      })
    })

    test('logs error messages with error object', () => {
      const testError = new Error('Test error')
      logger.error('Test error message', { userId: 'test-user' }, testError)

      expect(consoleSpy.error).toHaveBeenCalledOnce()
      const logCall = consoleSpy.error.mock.calls[0]
      expect(logCall[1]).toMatchObject({
        level: 'error',
        message: 'Test error message',
        userId: 'test-user'
      })
      expect(logCall[2]).toBe(testError)
    })
  })

  describe('Specialized logging methods', () => {
    test('logs business events with proper tagging', () => {
      logger.businessEvent('COURSE_ENROLLMENT', {
        userId: 'test-user',
        resourceId: 'course-123'
      })

      expect(consoleSpy.info).toHaveBeenCalledOnce()
      const logCall = consoleSpy.info.mock.calls[0]
      expect(logCall[1]).toMatchObject({
        level: 'info',
        message: '[BUSINESS_EVENT] COURSE_ENROLLMENT',
        eventType: 'business',
        operation: 'COURSE_ENROLLMENT',
        userId: 'test-user',
        resourceId: 'course-123'
      })
    })

    test('logs state transitions with from/to states', () => {
      logger.stateTransition('Subscription', 'ACTIVE', 'CANCELED', {
        userId: 'test-user',
        resourceId: 'sub-123'
      })

      expect(consoleSpy.info).toHaveBeenCalledOnce()
      const logCall = consoleSpy.info.mock.calls[0]
      expect(logCall[1]).toMatchObject({
        level: 'info',
        message: '[STATE_TRANSITION] Subscription: ACTIVE → CANCELED',
        eventType: 'state_transition',
        fromState: 'ACTIVE',
        toState: 'CANCELED',
        resourceType: 'Subscription',
        userId: 'test-user',
        resourceId: 'sub-123'
      })
    })

    test('logs security events with warning level', () => {
      logger.securityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
        userId: 'test-user',
        resourceId: 'course-123'
      })

      expect(consoleSpy.warn).toHaveBeenCalledOnce()
      const logCall = consoleSpy.warn.mock.calls[0]
      expect(logCall[1]).toMatchObject({
        level: 'warn',
        message: '[SECURITY] UNAUTHORIZED_ACCESS_ATTEMPT',
        eventType: 'security',
        userId: 'test-user',
        resourceId: 'course-123'
      })
    })

    test('logs performance events with duration', () => {
      logger.performanceEvent('DATABASE_QUERY', 1250, {
        operation: 'fetch-course-enrollment',
        userId: 'test-user'
      })

      expect(consoleSpy.info).toHaveBeenCalledOnce()
      const logCall = consoleSpy.info.mock.calls[0]
      expect(logCall[1]).toMatchObject({
        level: 'info',
        message: '[PERFORMANCE] DATABASE_QUERY completed in 1250ms',
        eventType: 'performance',
        operation: 'DATABASE_QUERY',
        duration: 1250,
        userId: 'test-user'
      })
    })
  })

  describe('Context logging', () => {
    test('creates context logger with inherited context', () => {
      const contextLogger = logger.withContext({
        userId: 'test-user',
        correlationId: 'test-correlation-id'
      })

      contextLogger.info('Test message', { operation: 'test-op' })

      expect(consoleSpy.info).toHaveBeenCalledOnce()
      const logCall = consoleSpy.info.mock.calls[0]
      expect(logCall[1]).toMatchObject({
        level: 'info',
        message: 'Test message',
        userId: 'test-user',
        correlationId: 'test-correlation-id',
        operation: 'test-op'
      })
    })

    test('context logger can create child contexts', () => {
      const parentLogger = logger.withContext({
        userId: 'test-user',
        operation: 'parent-operation'
      })

      const childLogger = parentLogger.withContext({
        resourceId: 'resource-123',
        operation: 'child-operation' // This should override parent
      })

      childLogger.info('Child message')

      expect(consoleSpy.info).toHaveBeenCalledOnce()
      const logCall = consoleSpy.info.mock.calls[0]
      expect(logCall[1]).toMatchObject({
        level: 'info',
        message: 'Child message',
        userId: 'test-user',
        operation: 'child-operation', // Child context overrides parent
        resourceId: 'resource-123'
      })
    })

    test('createLogger convenience function works', () => {
      const contextLogger = createLogger({
        userId: 'test-user',
        sessionId: 'test-session'
      })

      contextLogger.businessEvent('TEST_EVENT', { resourceId: 'test-resource' })

      expect(consoleSpy.info).toHaveBeenCalledOnce()
      const logCall = consoleSpy.info.mock.calls[0]
      expect(logCall[1]).toMatchObject({
        userId: 'test-user',
        sessionId: 'test-session',
        resourceId: 'test-resource',
        eventType: 'business'
      })
    })
  })

  describe('Correlation ID generation', () => {
    test('generates unique correlation IDs', () => {
      const id1 = createCorrelationId()
      const id2 = createCorrelationId()

      expect(id1).toMatch(/^log_\d+_[a-z0-9]+$/)
      expect(id2).toMatch(/^log_\d+_[a-z0-9]+$/)
      expect(id1).not.toBe(id2)
    })

    test('automatically adds correlation ID if not provided', () => {
      logger.info('Test message')

      expect(consoleSpy.info).toHaveBeenCalledOnce()
      const logCall = consoleSpy.info.mock.calls[0]
      expect(logCall[1].correlationId).toMatch(/^log_\d+_[a-z0-9]+$/)
    })

    test('preserves provided correlation ID', () => {
      const customCorrelationId = 'custom-correlation-123'
      logger.info('Test message', { correlationId: customCorrelationId })

      expect(consoleSpy.info).toHaveBeenCalledOnce()
      const logCall = consoleSpy.info.mock.calls[0]
      expect(logCall[1].correlationId).toBe(customCorrelationId)
    })
  })

  describe('PII sanitization', () => {
    test('removes PII fields from context', () => {
      logger.info('Test message', {
        userId: 'test-user',
        operation: 'test-operation',
        metadata: {
          email: 'user@example.com',
          name: 'John Doe',
          phone: '+1234567890'
        }
      })

      expect(consoleSpy.info).toHaveBeenCalledOnce()
      const logCall = consoleSpy.info.mock.calls[0]
      const logData = logCall[1]

      // Should preserve non-PII fields
      expect(logData.userId).toBe('test-user')
      expect(logData.operation).toBe('test-operation')

      // Should remove PII fields from metadata
      expect(logData.metadata?.email).toBeUndefined()
      expect(logData.metadata?.name).toBeUndefined()
      expect(logData.metadata?.phone).toBeUndefined()
    })

    test('removes PII fields from metadata', () => {
      logger.info('Test message', {
        userId: 'test-user',
        metadata: {
          email: 'user@example.com',
          firstName: 'John',
          courseId: 'course-123',
          ip: '192.168.1.1'
        }
      })

      expect(consoleSpy.info).toHaveBeenCalledOnce()
      const logCall = consoleSpy.info.mock.calls[0]
      const logData = logCall[1]

      // Should preserve non-PII metadata
      expect(logData.metadata.courseId).toBe('course-123')

      // Should remove PII metadata
      expect(logData.metadata.email).toBeUndefined()
      expect(logData.metadata.firstName).toBeUndefined()
      expect(logData.metadata.ip).toBeUndefined()
    })
  })

  describe('Helper functions', () => {
    test('logStateTransition helper works', () => {
      logStateTransition(
        'Subscription',
        'sub-123',
        'ACTIVE',
        'CANCELED',
        'test-user',
        'test-correlation'
      )

      expect(consoleSpy.info).toHaveBeenCalledOnce()
      const logCall = consoleSpy.info.mock.calls[0]
      expect(logCall[1]).toMatchObject({
        message: '[STATE_TRANSITION] Subscription: ACTIVE → CANCELED',
        resourceId: 'sub-123',
        resourceType: 'Subscription',
        userId: 'test-user',
        correlationId: 'test-correlation'
      })
    })

    test('logBusinessEvent helper works', () => {
      logBusinessEvent(
        'COURSE_ENROLLMENT',
        'test-user',
        'course-123',
        'Course',
        'test-correlation',
        { source: 'dashboard' }
      )

      expect(consoleSpy.info).toHaveBeenCalledOnce()
      const logCall = consoleSpy.info.mock.calls[0]
      expect(logCall[1]).toMatchObject({
        message: '[BUSINESS_EVENT] COURSE_ENROLLMENT',
        userId: 'test-user',
        resourceId: 'course-123',
        resourceType: 'Course',
        correlationId: 'test-correlation',
        metadata: { source: 'dashboard' }
      })
    })
  })

  describe('Performance logging decorator', () => {
    test('logs performance timing for successful operations', async () => {
      const mockOperation = vi.fn().mockResolvedValue('success')
      const wrappedOperation = withPerformanceLogging('TEST_OPERATION', mockOperation)

      const result = await wrappedOperation('arg1', 'arg2')

      expect(result).toBe('success')
      expect(mockOperation).toHaveBeenCalledWith('arg1', 'arg2')
      
      // Should log start and performance completion
      expect(consoleSpy.info).toHaveBeenCalledTimes(2)
      
      const startLog = consoleSpy.info.mock.calls[0][1]
      const perfLog = consoleSpy.info.mock.calls[1][1]

      expect(startLog.message).toBe('Starting TEST_OPERATION')
      expect(perfLog.message).toMatch(/^\[PERFORMANCE\] TEST_OPERATION completed in \d+ms$/)
      expect(perfLog.eventType).toBe('performance')
      expect(perfLog.duration).toBeTypeOf('number')
    })

    test('logs performance timing and error for failed operations', async () => {
      const testError = new Error('Operation failed')
      const mockOperation = vi.fn().mockRejectedValue(testError)
      const wrappedOperation = withPerformanceLogging('FAILING_OPERATION', mockOperation)

      await expect(wrappedOperation()).rejects.toThrow('Operation failed')

      // Should log start message
      expect(consoleSpy.info).toHaveBeenCalledOnce()
      const startLog = consoleSpy.info.mock.calls[0][1]
      expect(startLog.message).toBe('Starting FAILING_OPERATION')

      // Should log error with timing
      expect(consoleSpy.error).toHaveBeenCalledOnce()
      const errorLog = consoleSpy.error.mock.calls[0]
      expect(errorLog[1].message).toMatch(/^FAILING_OPERATION failed after \d+ms$/)
      expect(errorLog[2]).toBe(testError)
    })

    test('preserves function argument types and return types', async () => {
      const typedOperation = (x: number, y: string): Promise<boolean> => {
        return Promise.resolve(x > 0 && y.length > 0)
      }

      const wrappedOperation = withPerformanceLogging('TYPED_OPERATION', typedOperation)
      
      const result = await wrappedOperation(5, 'hello')
      expect(result).toBe(true)
      expect(typeof result).toBe('boolean')
    })
  })

  describe('Timestamp handling', () => {
    test('adds timestamp if not provided', () => {
      const beforeTime = Date.now()
      logger.info('Test message')
      const afterTime = Date.now()

      expect(consoleSpy.info).toHaveBeenCalledOnce()
      const logCall = consoleSpy.info.mock.calls[0]
      const timestamp = logCall[1].timestamp

      expect(timestamp).toBeDefined()
      const timestampMs = new Date(timestamp).getTime()
      expect(timestampMs).toBeGreaterThanOrEqual(beforeTime)
      expect(timestampMs).toBeLessThanOrEqual(afterTime)
    })

    test('preserves provided timestamp', () => {
      const customTimestamp = '2024-01-01T12:00:00.000Z'
      logger.info('Test message', { timestamp: customTimestamp })

      expect(consoleSpy.info).toHaveBeenCalledOnce()
      const logCall = consoleSpy.info.mock.calls[0]
      expect(logCall[1].timestamp).toBe(customTimestamp)
    })
  })
})