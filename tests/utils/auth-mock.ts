/**
 * Better Auth Mock Utilities
 * 
 * Provides proper mocking for Better Auth sessions in tests
 */

import { vi } from 'vitest'

export class AuthMock {
  /**
   * Mock a user session for tests
   */
  static mockSession(userId: string, email: string) {
    const mockSession = {
      user: {
        id: userId,
        email,
        name: 'Test User',
        emailVerified: true
      },
      session: {
        id: `session-${userId}`,
        userId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        token: `token-${userId}`
      }
    }

    // Mock the auth module with the proper Better Auth API structure
    vi.doMock('@/lib/auth', () => ({
      auth: {
        api: {
          getSession: vi.fn(({ headers }) => {
            // Mock function that accepts headers parameter and returns session
            return Promise.resolve(mockSession)
          })
        }
      },
      signIn: vi.fn(),
      signOut: vi.fn()
    }))

    // Mock the auth service
    vi.doMock('@/lib/auth-service', () => ({
      AuthService: {
        getCurrentUser: vi.fn().mockResolvedValue(mockSession.user),
        requireAuth: vi.fn().mockResolvedValue(mockSession.user),
        getSession: vi.fn().mockResolvedValue(mockSession)
      }
    }))

    // Mock Next.js headers function
    vi.doMock('next/headers', () => ({
      headers: vi.fn(() => Promise.resolve(new Headers({
        'user-agent': 'test-agent',
        'authorization': `Bearer ${mockSession.session.token}`
      })))
    }))

    return mockSession
  }

  /**
   * Mock no authentication (unauthenticated user)
   */
  static mockNoAuth() {
    vi.doMock('@/lib/auth', () => ({
      auth: {
        api: {
          getSession: vi.fn(({ headers }) => {
            // Mock function returns null for unauthenticated
            return Promise.resolve(null)
          })
        }
      },
      signIn: vi.fn(),
      signOut: vi.fn()
    }))

    vi.doMock('@/lib/auth-service', () => ({
      AuthService: {
        getCurrentUser: vi.fn().mockResolvedValue(null),
        requireAuth: vi.fn().mockRejectedValue(new Error('Unauthorized')),
        getSession: vi.fn().mockResolvedValue(null)
      }
    }))

    // Mock Next.js headers function
    vi.doMock('next/headers', () => ({
      headers: vi.fn(() => Promise.resolve(new Headers()))
    }))
  }

  /**
   * Clear all auth mocks
   */
  static clearMocks() {
    vi.doUnmock('@/lib/auth')
    vi.doUnmock('@/lib/auth-service')
    vi.doUnmock('next/headers')
    vi.clearAllMocks()
  }
}

/**
 * Convenience function to create an authenticated test session
 */
export function mockAuthenticatedUser(userId: string, email: string) {
  return AuthMock.mockSession(userId, email)
}

/**
 * Convenience function to mock unauthenticated state
 */
export function mockUnauthenticatedUser() {
  return AuthMock.mockNoAuth()
}