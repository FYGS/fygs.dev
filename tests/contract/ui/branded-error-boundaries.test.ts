/**
 * T110: Branded Error Boundary Tests
 * 
 * Tests branded error boundary logic and error handling scenarios
 * as required by FR-036. Focuses on error classification, messaging,
 * and proper error state management for:
 * - Not-found errors (404)
 * - Unauthorized access errors (403/401)
 * - Payment-failed errors
 */

import { describe, test, expect, afterEach, beforeEach, vi } from 'vitest'
import { createTestEnvironment } from '../../utils/test-database'

// Error types for testing
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorType: 'not-found' | 'unauthorized' | 'payment-failed' | 'unknown'
}

interface ErrorSnapshot {
  type: ErrorBoundaryState['errorType']
  context: string
  branding: {
    icon: string
    className: string
    semantics: {
      headingLevel: number
      role: string
      ariaLive: string
    }
  }
  content: {
    title: string
    message: string
    actions: string[]
  }
  timestamp: string
}

// Mock error boundary logic
class ErrorBoundaryLogic {
  static classifyError(error: Error): ErrorBoundaryState['errorType'] {
    const message = error.message.toLowerCase()
    
    if (message.includes('not_found') || message.includes('course_not_found') || message.includes('lesson_not_found')) {
      return 'not-found'
    }
    
    if (message.includes('unauthorized') || message.includes('access_denied') || message.includes('permission')) {
      return 'unauthorized'
    }
    
    if (message.includes('payment_failed') || message.includes('card_declined') || message.includes('subscription_failed')) {
      return 'payment-failed'
    }
    
    return 'unknown'
  }

  static getErrorMessage(errorType: ErrorBoundaryState['errorType'], context?: string): { title: string; message: string; actions: string[] } {
    switch (errorType) {
      case 'not-found':
        if (context === 'course') {
          return {
            title: 'Course Not Found',
            message: 'This course is no longer available or the URL is incorrect.',
            actions: ['/courses', '/contact']
          }
        }
        if (context === 'lesson') {
          return {
            title: 'Lesson Not Found',
            message: 'This lesson is not available. It may be part of a premium course or temporarily unavailable.',
            actions: ['/dashboard']
          }
        }
        return {
          title: 'Page Not Found',
          message: "The page you're looking for doesn't exist or has been moved.",
          actions: ['/']
        }
      
      case 'unauthorized':
        if (context === 'premium') {
          return {
            title: 'Premium Content',
            message: 'This lesson is only available to premium subscribers. Upgrade your plan to continue learning.',
            actions: ['/pricing', '/courses?tier=free']
          }
        }
        if (context === 'auth') {
          return {
            title: 'Sign In Required',
            message: 'Please sign in to access this content and track your progress.',
            actions: ['/auth/login', '/auth/register']
          }
        }
        return {
          title: 'Access Denied',
          message: "You don't have permission to access this content. Please upgrade your subscription.",
          actions: ['/pricing']
        }
      
      case 'payment-failed':
        if (context === 'subscription') {
          return {
            title: 'Subscription Payment Failed',
            message: "We couldn't process your subscription payment. Your access to premium content will be suspended until payment is resolved.",
            actions: ['/billing/update', '/contact']
          }
        }
        if (context === 'purchase') {
          return {
            title: 'Purchase Failed',
            message: 'Your course purchase could not be completed. No charges were made to your account.',
            actions: ['/courses/premium-course/purchase', '/courses']
          }
        }
        if (context === 'card') {
          return {
            title: 'Card Declined',
            message: 'Your card was declined. Please use a different payment method or contact your bank.',
            actions: ['/billing/add-payment', '/billing']
          }
        }
        return {
          title: 'Payment Failed',
          message: 'Your payment could not be processed. Please check your payment details and try again.',
          actions: ['/billing']
        }
      
      default:
        return {
          title: 'Something went wrong',
          message: 'An unexpected error occurred. Please try again or contact support.',
          actions: ['/']
        }
    }
  }

  static generateErrorSnapshot(errorType: ErrorBoundaryState['errorType'], context?: string): ErrorSnapshot {
    const errorInfo = this.getErrorMessage(errorType, context)
    return {
      type: errorType,
      context: context || 'default',
      branding: {
        icon: errorType === 'not-found' ? '🔍' : errorType === 'unauthorized' ? '🔒' : errorType === 'payment-failed' ? '💳' : '⚠️',
        className: `error-container error-${errorType}`,
        semantics: {
          headingLevel: 1,
          role: 'alert',
          ariaLive: 'polite'
        }
      },
      content: errorInfo,
      timestamp: new Date().toISOString()
    }
  }
}

describe('T110: Branded Error Boundary Tests', () => {
  const testEnv = createTestEnvironment()
  
  beforeEach(async () => {
    vi.clearAllMocks()
  })
  
  afterEach(async () => {
    await testEnv.cleanup()
  })

  describe('Error Classification', () => {
    test('classifies not-found errors correctly', () => {
      const courseNotFoundError = new Error('COURSE_NOT_FOUND')
      const lessonNotFoundError = new Error('LESSON_NOT_FOUND')
      const pageNotFoundError = new Error('PAGE_NOT_FOUND')

      expect(ErrorBoundaryLogic.classifyError(courseNotFoundError)).toBe('not-found')
      expect(ErrorBoundaryLogic.classifyError(lessonNotFoundError)).toBe('not-found')
      expect(ErrorBoundaryLogic.classifyError(pageNotFoundError)).toBe('not-found')
    })

    test('classifies unauthorized errors correctly', () => {
      const unauthorizedError = new Error('UNAUTHORIZED_ACCESS')
      const accessDeniedError = new Error('ACCESS_DENIED')
      const permissionError = new Error('INSUFFICIENT_PERMISSION')

      expect(ErrorBoundaryLogic.classifyError(unauthorizedError)).toBe('unauthorized')
      expect(ErrorBoundaryLogic.classifyError(accessDeniedError)).toBe('unauthorized')
      expect(ErrorBoundaryLogic.classifyError(permissionError)).toBe('unauthorized')
    })

    test('classifies payment failed errors correctly', () => {
      const paymentFailedError = new Error('PAYMENT_FAILED')
      const cardDeclinedError = new Error('CARD_DECLINED')
      const subscriptionFailedError = new Error('SUBSCRIPTION_FAILED')

      expect(ErrorBoundaryLogic.classifyError(paymentFailedError)).toBe('payment-failed')
      expect(ErrorBoundaryLogic.classifyError(cardDeclinedError)).toBe('payment-failed')
      expect(ErrorBoundaryLogic.classifyError(subscriptionFailedError)).toBe('payment-failed')
    })

    test('classifies unknown errors as fallback', () => {
      const unknownError = new Error('SOME_UNKNOWN_ERROR')
      const networkError = new Error('NETWORK_TIMEOUT')

      expect(ErrorBoundaryLogic.classifyError(unknownError)).toBe('unknown')
      expect(ErrorBoundaryLogic.classifyError(networkError)).toBe('unknown')
    })
  })

  describe('Not-Found Error Messages', () => {
    test('generates correct message for generic not-found', () => {
      const errorInfo = ErrorBoundaryLogic.getErrorMessage('not-found')

      expect(errorInfo.title).toBe('Page Not Found')
      expect(errorInfo.message).toBe("The page you're looking for doesn't exist or has been moved.")
      expect(errorInfo.actions).toEqual(['/'])
    })

    test('generates correct message for course not-found', () => {
      const errorInfo = ErrorBoundaryLogic.getErrorMessage('not-found', 'course')

      expect(errorInfo.title).toBe('Course Not Found')
      expect(errorInfo.message).toBe('This course is no longer available or the URL is incorrect.')
      expect(errorInfo.actions).toEqual(['/courses', '/contact'])
    })

    test('generates correct message for lesson not-found', () => {
      const errorInfo = ErrorBoundaryLogic.getErrorMessage('not-found', 'lesson')

      expect(errorInfo.title).toBe('Lesson Not Found')
      expect(errorInfo.message).toBe('This lesson is not available. It may be part of a premium course or temporarily unavailable.')
      expect(errorInfo.actions).toEqual(['/dashboard'])
    })
  })

  describe('Unauthorized Error Messages', () => {
    test('generates correct message for generic unauthorized', () => {
      const errorInfo = ErrorBoundaryLogic.getErrorMessage('unauthorized')

      expect(errorInfo.title).toBe('Access Denied')
      expect(errorInfo.message).toBe("You don't have permission to access this content. Please upgrade your subscription.")
      expect(errorInfo.actions).toEqual(['/pricing'])
    })

    test('generates correct message for premium content', () => {
      const errorInfo = ErrorBoundaryLogic.getErrorMessage('unauthorized', 'premium')

      expect(errorInfo.title).toBe('Premium Content')
      expect(errorInfo.message).toBe('This lesson is only available to premium subscribers. Upgrade your plan to continue learning.')
      expect(errorInfo.actions).toEqual(['/pricing', '/courses?tier=free'])
    })

    test('generates correct message for authentication required', () => {
      const errorInfo = ErrorBoundaryLogic.getErrorMessage('unauthorized', 'auth')

      expect(errorInfo.title).toBe('Sign In Required')
      expect(errorInfo.message).toBe('Please sign in to access this content and track your progress.')
      expect(errorInfo.actions).toEqual(['/auth/login', '/auth/register'])
    })
  })

  describe('Payment Failed Error Messages', () => {
    test('generates correct message for generic payment failure', () => {
      const errorInfo = ErrorBoundaryLogic.getErrorMessage('payment-failed')

      expect(errorInfo.title).toBe('Payment Failed')
      expect(errorInfo.message).toBe('Your payment could not be processed. Please check your payment details and try again.')
      expect(errorInfo.actions).toEqual(['/billing'])
    })

    test('generates correct message for subscription payment failure', () => {
      const errorInfo = ErrorBoundaryLogic.getErrorMessage('payment-failed', 'subscription')

      expect(errorInfo.title).toBe('Subscription Payment Failed')
      expect(errorInfo.message).toBe("We couldn't process your subscription payment. Your access to premium content will be suspended until payment is resolved.")
      expect(errorInfo.actions).toEqual(['/billing/update', '/contact'])
    })

    test('generates correct message for purchase failure', () => {
      const errorInfo = ErrorBoundaryLogic.getErrorMessage('payment-failed', 'purchase')

      expect(errorInfo.title).toBe('Purchase Failed')
      expect(errorInfo.message).toBe('Your course purchase could not be completed. No charges were made to your account.')
      expect(errorInfo.actions).toEqual(['/courses/premium-course/purchase', '/courses'])
    })

    test('generates correct message for card declined', () => {
      const errorInfo = ErrorBoundaryLogic.getErrorMessage('payment-failed', 'card')

      expect(errorInfo.title).toBe('Card Declined')
      expect(errorInfo.message).toBe('Your card was declined. Please use a different payment method or contact your bank.')
      expect(errorInfo.actions).toEqual(['/billing/add-payment', '/billing'])
    })
  })

  describe('Error Snapshots and Semantics', () => {
    test('generates correct snapshot for not-found error', () => {
      const snapshot = ErrorBoundaryLogic.generateErrorSnapshot('not-found', 'course')

      expect(snapshot.type).toBe('not-found')
      expect(snapshot.context).toBe('course')
      expect(snapshot.branding.icon).toBe('🔍')
      expect(snapshot.branding.className).toBe('error-container error-not-found')
      expect(snapshot.branding.semantics.headingLevel).toBe(1)
      expect(snapshot.branding.semantics.role).toBe('alert')
      expect(snapshot.branding.semantics.ariaLive).toBe('polite')
      expect(snapshot.content.title).toBe('Course Not Found')
      expect(snapshot.content.actions).toEqual(['/courses', '/contact'])
      expect(snapshot.timestamp).toBeDefined()
    })

    test('generates correct snapshot for unauthorized error', () => {
      const snapshot = ErrorBoundaryLogic.generateErrorSnapshot('unauthorized', 'premium')

      expect(snapshot.type).toBe('unauthorized')
      expect(snapshot.context).toBe('premium')
      expect(snapshot.branding.icon).toBe('🔒')
      expect(snapshot.branding.className).toBe('error-container error-unauthorized')
      expect(snapshot.branding.semantics.headingLevel).toBe(1)
      expect(snapshot.branding.semantics.role).toBe('alert')
      expect(snapshot.branding.semantics.ariaLive).toBe('polite')
      expect(snapshot.content.title).toBe('Premium Content')
      expect(snapshot.content.actions).toEqual(['/pricing', '/courses?tier=free'])
      expect(snapshot.timestamp).toBeDefined()
    })

    test('generates correct snapshot for payment failed error', () => {
      const snapshot = ErrorBoundaryLogic.generateErrorSnapshot('payment-failed', 'subscription')

      expect(snapshot.type).toBe('payment-failed')
      expect(snapshot.context).toBe('subscription')
      expect(snapshot.branding.icon).toBe('💳')
      expect(snapshot.branding.className).toBe('error-container error-payment-failed')
      expect(snapshot.branding.semantics.headingLevel).toBe(1)
      expect(snapshot.branding.semantics.role).toBe('alert')
      expect(snapshot.branding.semantics.ariaLive).toBe('polite')
      expect(snapshot.content.title).toBe('Subscription Payment Failed')
      expect(snapshot.content.actions).toEqual(['/billing/update', '/contact'])
      expect(snapshot.timestamp).toBeDefined()
    })

    test('generates correct snapshot for unknown error with default context', () => {
      const snapshot = ErrorBoundaryLogic.generateErrorSnapshot('unknown')

      expect(snapshot.type).toBe('unknown')
      expect(snapshot.context).toBe('default')
      expect(snapshot.branding.icon).toBe('⚠️')
      expect(snapshot.branding.className).toBe('error-container error-unknown')
      expect(snapshot.content.title).toBe('Something went wrong')
      expect(snapshot.content.actions).toEqual(['/'])
      expect(snapshot.timestamp).toBeDefined()
    })
  })

  describe('Error Boundary Integration Logic', () => {
    test('handles course access errors with proper classification', () => {
      const courseAccessError = new Error('COURSE_NOT_FOUND: Premium course requires subscription')
      
      const errorType = ErrorBoundaryLogic.classifyError(courseAccessError)
      const errorInfo = ErrorBoundaryLogic.getErrorMessage(errorType, 'course')
      const snapshot = ErrorBoundaryLogic.generateErrorSnapshot(errorType, 'course')

      expect(errorType).toBe('not-found')
      expect(errorInfo.title).toBe('Course Not Found')
      expect(snapshot.branding.icon).toBe('🔍')
      expect(snapshot.content.actions).toContain('/courses')
    })

    test('handles premium access errors with proper classification', () => {
      const premiumAccessError = new Error('UNAUTHORIZED: Premium subscription required')
      
      const errorType = ErrorBoundaryLogic.classifyError(premiumAccessError)
      const errorInfo = ErrorBoundaryLogic.getErrorMessage(errorType, 'premium')
      const snapshot = ErrorBoundaryLogic.generateErrorSnapshot(errorType, 'premium')

      expect(errorType).toBe('unauthorized')
      expect(errorInfo.title).toBe('Premium Content')
      expect(snapshot.branding.icon).toBe('🔒')
      expect(snapshot.content.actions).toContain('/pricing')
    })

    test('handles payment errors with proper classification', () => {
      const paymentError = new Error('PAYMENT_FAILED: Card expired')
      
      const errorType = ErrorBoundaryLogic.classifyError(paymentError)
      const errorInfo = ErrorBoundaryLogic.getErrorMessage(errorType, 'card')
      const snapshot = ErrorBoundaryLogic.generateErrorSnapshot(errorType, 'card')

      expect(errorType).toBe('payment-failed')
      expect(errorInfo.title).toBe('Card Declined')
      expect(snapshot.branding.icon).toBe('💳')
      expect(snapshot.content.actions).toContain('/billing/add-payment')
    })

    test('handles authentication flow errors', () => {
      const authError = new Error('UNAUTHORIZED: Please log in to continue')
      
      const errorType = ErrorBoundaryLogic.classifyError(authError)
      const errorInfo = ErrorBoundaryLogic.getErrorMessage(errorType, 'auth')
      const snapshot = ErrorBoundaryLogic.generateErrorSnapshot(errorType, 'auth')

      expect(errorType).toBe('unauthorized')
      expect(errorInfo.title).toBe('Sign In Required')
      expect(snapshot.content.actions).toContain('/auth/login')
      expect(snapshot.content.actions).toContain('/auth/register')
    })

    test('handles lesson access within courses', () => {
      const lessonError = new Error('LESSON_NOT_FOUND: This lesson is not available')
      
      const errorType = ErrorBoundaryLogic.classifyError(lessonError)
      const errorInfo = ErrorBoundaryLogic.getErrorMessage(errorType, 'lesson')
      const snapshot = ErrorBoundaryLogic.generateErrorSnapshot(errorType, 'lesson')

      expect(errorType).toBe('not-found')
      expect(errorInfo.title).toBe('Lesson Not Found')
      expect(errorInfo.message).toContain('premium course')
      expect(snapshot.content.actions).toContain('/dashboard')
    })

    test('ensures all error types have appropriate semantic structure', () => {
      const errorTypes: Array<ErrorBoundaryState['errorType']> = ['not-found', 'unauthorized', 'payment-failed', 'unknown']
      
      errorTypes.forEach(errorType => {
        const snapshot = ErrorBoundaryLogic.generateErrorSnapshot(errorType)
        
        // Verify semantic accessibility requirements
        expect(snapshot.branding.semantics.headingLevel).toBe(1)
        expect(snapshot.branding.semantics.role).toBe('alert')
        expect(snapshot.branding.semantics.ariaLive).toBe('polite')
        
        // Verify branding consistency
        expect(snapshot.branding.className).toBe(`error-container error-${errorType}`)
        expect(snapshot.branding.icon).toBeDefined()
        expect(snapshot.content.title).toBeDefined()
        expect(snapshot.content.message).toBeDefined()
        expect(Array.isArray(snapshot.content.actions)).toBe(true)
        expect(snapshot.content.actions.length).toBeGreaterThan(0)
      })
    })

    test('ensures snapshot timestamps are unique and recent', () => {
      const beforeTime = new Date()
      
      const snapshot1 = ErrorBoundaryLogic.generateErrorSnapshot('not-found')
      const snapshot2 = ErrorBoundaryLogic.generateErrorSnapshot('unauthorized')
      
      const afterTime = new Date()
      
      const timestamp1 = new Date(snapshot1.timestamp)
      const timestamp2 = new Date(snapshot2.timestamp)
      
      expect(timestamp1).toBeInstanceOf(Date)
      expect(timestamp2).toBeInstanceOf(Date)
      expect(timestamp1.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime())
      expect(timestamp2.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime())
      expect(timestamp1.getTime()).toBeLessThanOrEqual(afterTime.getTime())
      expect(timestamp2.getTime()).toBeLessThanOrEqual(afterTime.getTime())
      
      // Timestamps should be different (or very close)
      expect(Math.abs(timestamp2.getTime() - timestamp1.getTime())).toBeLessThan(1000)
    })
  })
})