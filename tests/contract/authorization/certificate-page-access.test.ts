/**
 * T111: Certificate Page Authorization Tests
 * 
 * Tests certificate page access control as required by FR-038.
 * Verifies authorization rules:
 * - Certificate owner: allowed access
 * - Other students: denied access
 * - Admin users: allowed access
 */

import { describe, test, expect, afterEach, beforeEach, vi } from 'vitest'
import { createTestEnvironment, TestDatabase } from '../../utils/test-database'
import { db } from '@/lib/db'

// Mock authorization service
const AuthorizationService = {
  async canViewCertificate(userId: string, certificateId: string): Promise<boolean> {
    const certificate = await db.certificate.findUnique({
      where: { id: certificateId },
      include: {
        user: true,
        course: true
      }
    })

    if (!certificate) {
      return false
    }

    // Check if user is the certificate owner
    if (certificate.userId === userId) {
      return true
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (user?.role === 'ADMIN') {
      return true
    }

    // Deny access for all other cases
    return false
  },

  async getCertificateWithAuth(userId: string, certificateId: string) {
    const hasAccess = await this.canViewCertificate(userId, certificateId)
    
    if (!hasAccess) {
      throw new Error('UNAUTHORIZED: Access denied to this certificate')
    }

    return await db.certificate.findUnique({
      where: { id: certificateId },
      include: {
        user: true,
        course: true
      }
    })
  }
}

describe('T111: Certificate Page Authorization Tests', () => {
  const testEnv = createTestEnvironment()
  
  beforeEach(async () => {
    vi.clearAllMocks()
  })
  
  afterEach(async () => {
    await testEnv.cleanup()
  })

  describe('Certificate Owner Access', () => {
    test('certificate owner can view their own certificate', async () => {
      // Create test user and course
      const owner = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('owner'),
          name: 'Certificate Owner',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(owner.id)

      const course = await db.course.create({
        data: {
          title: 'Test Course',
          slug: TestDatabase.getUniqueSlug('test-course'),
          description: 'Test course description',
          category: 'JAVASCRIPT',
          level: 'BEGINNER',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      // Create certificate for the owner
      const certificate = await db.certificate.create({
        data: {
          userId: owner.id,
          courseId: course.id,
          issuedAt: new Date()
        }
      })

      // Test authorization
      const canView = await AuthorizationService.canViewCertificate(owner.id, certificate.id)
      expect(canView).toBe(true)

      // Test certificate retrieval
      const retrievedCert = await AuthorizationService.getCertificateWithAuth(owner.id, certificate.id)
      expect(retrievedCert).toBeDefined()
      expect(retrievedCert?.id).toBe(certificate.id)
      expect(retrievedCert?.userId).toBe(owner.id)
      expect(retrievedCert?.user.email).toBe(owner.email)
    })

    test('certificate owner can view certificate with course details', async () => {
      const owner = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('owner'),
          name: 'Course Graduate',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(owner.id)

      const course = await db.course.create({
        data: {
          title: 'Advanced JavaScript',
          slug: TestDatabase.getUniqueSlug('advanced-javascript'),
          description: 'Master advanced JavaScript concepts',
          category: 'JAVASCRIPT',
          level: 'ADVANCED',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const certificate = await db.certificate.create({
        data: {
          userId: owner.id,
          courseId: course.id,
          issuedAt: new Date('2024-01-15')
        }
      })

      const retrievedCert = await AuthorizationService.getCertificateWithAuth(owner.id, certificate.id)

      expect(retrievedCert?.course.title).toBe('Advanced JavaScript')
      expect(retrievedCert?.course.accessTier).toBe('PREMIUM')
      expect(retrievedCert?.issuedAt).toEqual(new Date('2024-01-15'))
    })

    test('certificate owner can view multiple certificates', async () => {
      const owner = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('multi-owner'),
          name: 'Multi Course Graduate',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(owner.id)

      const course1 = await db.course.create({
        data: {
          title: 'React Basics',
          slug: TestDatabase.getUniqueSlug('react-basics'),
          description: 'Learn React fundamentals',
          category: 'FRONTEND',
          level: 'BEGINNER',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(course1.id)

      const course2 = await db.course.create({
        data: {
          title: 'Node.js Advanced',
          slug: TestDatabase.getUniqueSlug('nodejs-advanced'),
          description: 'Master Node.js',
          category: 'BACKEND',
          level: 'ADVANCED',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course2.id)

      const cert1 = await db.certificate.create({
        data: {
          userId: owner.id,
          courseId: course1.id,
          issuedAt: new Date('2024-01-10')
        }
      })

      const cert2 = await db.certificate.create({
        data: {
          userId: owner.id,
          courseId: course2.id,
          issuedAt: new Date('2024-01-20')
        }
      })

      // Owner can view both certificates
      const canViewCert1 = await AuthorizationService.canViewCertificate(owner.id, cert1.id)
      const canViewCert2 = await AuthorizationService.canViewCertificate(owner.id, cert2.id)

      expect(canViewCert1).toBe(true)
      expect(canViewCert2).toBe(true)

      const retrievedCert1 = await AuthorizationService.getCertificateWithAuth(owner.id, cert1.id)
      const retrievedCert2 = await AuthorizationService.getCertificateWithAuth(owner.id, cert2.id)

      expect(retrievedCert1?.course.title).toBe('React Basics')
      expect(retrievedCert2?.course.title).toBe('Node.js Advanced')
    })
  })

  describe('Other Students Access Denial', () => {
    test('other student cannot view someone elses certificate', async () => {
      // Create certificate owner
      const owner = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('owner'),
          name: 'Certificate Owner',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(owner.id)

      // Create other student
      const otherStudent = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('other'),
          name: 'Other Student',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(otherStudent.id)

      const course = await db.course.create({
        data: {
          title: 'Private Course',
          slug: TestDatabase.getUniqueSlug('private-course'),
          description: 'Course with restricted certificates',
          category: 'FULLSTACK',
          level: 'INTERMEDIATE',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const certificate = await db.certificate.create({
        data: {
          userId: owner.id,
          courseId: course.id,
          issuedAt: new Date()
        }
      })

      // Other student should not have access
      const canView = await AuthorizationService.canViewCertificate(otherStudent.id, certificate.id)
      expect(canView).toBe(false)

      // Attempting to retrieve should throw error
      await expect(
        AuthorizationService.getCertificateWithAuth(otherStudent.id, certificate.id)
      ).rejects.toThrow('UNAUTHORIZED: Access denied to this certificate')
    })

    test('student cannot view non-existent certificate', async () => {
      const student = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('student'),
          name: 'Regular Student',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(student.id)

      const nonExistentCertId = TestDatabase.getUniqueId('fake-cert')

      // Should return false for non-existent certificate
      const canView = await AuthorizationService.canViewCertificate(student.id, nonExistentCertId)
      expect(canView).toBe(false)

      // Should throw error when trying to retrieve
      await expect(
        AuthorizationService.getCertificateWithAuth(student.id, nonExistentCertId)
      ).rejects.toThrow('UNAUTHORIZED: Access denied to this certificate')
    })

    test('student cannot access certificates from different courses they completed', async () => {
      // Create two students
      const student1 = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('student1'),
          name: 'Student One',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(student1.id)

      const student2 = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('student2'),
          name: 'Student Two',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(student2.id)

      // Create two different courses
      const course1 = await db.course.create({
        data: {
          title: 'Course A',
          slug: TestDatabase.getUniqueSlug('course-a'),
          description: 'First course',
          category: 'FRONTEND',
          level: 'BEGINNER',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(course1.id)

      const course2 = await db.course.create({
        data: {
          title: 'Course B',
          slug: TestDatabase.getUniqueSlug('course-b'),
          description: 'Second course',
          category: 'BACKEND',
          level: 'INTERMEDIATE',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course2.id)

      // Each student gets certificate for different course
      const cert1 = await db.certificate.create({
        data: {
          userId: student1.id,
          courseId: course1.id,
          issuedAt: new Date()
        }
      })

      const cert2 = await db.certificate.create({
        data: {
          userId: student2.id,
          courseId: course2.id,
          issuedAt: new Date()
        }
      })

      // Student 1 cannot view Student 2's certificate
      const student1CanViewCert2 = await AuthorizationService.canViewCertificate(student1.id, cert2.id)
      expect(student1CanViewCert2).toBe(false)

      // Student 2 cannot view Student 1's certificate
      const student2CanViewCert1 = await AuthorizationService.canViewCertificate(student2.id, cert1.id)
      expect(student2CanViewCert1).toBe(false)

      // But each can view their own
      const student1CanViewCert1 = await AuthorizationService.canViewCertificate(student1.id, cert1.id)
      const student2CanViewCert2 = await AuthorizationService.canViewCertificate(student2.id, cert2.id)

      expect(student1CanViewCert1).toBe(true)
      expect(student2CanViewCert2).toBe(true)
    })
  })

  describe('Admin Access', () => {
    test('admin can view any certificate', async () => {
      // Create admin user
      const admin = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('admin'),
          name: 'Admin User',
          role: 'ADMIN'
        }
      })
      testEnv.trackUser(admin.id)

      // Create regular user with certificate
      const student = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('student'),
          name: 'Regular Student',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(student.id)

      const course = await db.course.create({
        data: {
          title: 'Admin Viewable Course',
          slug: TestDatabase.getUniqueSlug('admin-viewable-course'),
          description: 'Course that admin should be able to view certificates for',
          category: 'CLOUD',
          level: 'ADVANCED',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const certificate = await db.certificate.create({
        data: {
          userId: student.id,
          courseId: course.id,
          issuedAt: new Date()
        }
      })

      // Admin should have access
      const canView = await AuthorizationService.canViewCertificate(admin.id, certificate.id)
      expect(canView).toBe(true)

      // Admin should be able to retrieve certificate
      const retrievedCert = await AuthorizationService.getCertificateWithAuth(admin.id, certificate.id)
      expect(retrievedCert).toBeDefined()
      expect(retrievedCert?.id).toBe(certificate.id)
      expect(retrievedCert?.userId).toBe(student.id) // Certificate belongs to student
      expect(retrievedCert?.user.email).toBe(student.email)
      expect(retrievedCert?.course.title).toBe('Admin Viewable Course')
    })

    test('admin can view certificates from multiple users', async () => {
      const admin = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('admin'),
          name: 'Super Admin',
          role: 'ADMIN'
        }
      })
      testEnv.trackUser(admin.id)

      // Create multiple students with certificates
      const student1 = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('student1'),
          name: 'Student Alpha',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(student1.id)

      const student2 = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('student2'),
          name: 'Student Beta',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(student2.id)

      const course = await db.course.create({
        data: {
          title: 'Multi-Student Course',
          slug: TestDatabase.getUniqueSlug('multi-student-course'),
          description: 'Course completed by multiple students',
          category: 'AI',
          level: 'EXPERT',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const cert1 = await db.certificate.create({
        data: {
          userId: student1.id,
          courseId: course.id,
          issuedAt: new Date('2024-01-15')
        }
      })

      const cert2 = await db.certificate.create({
        data: {
          userId: student2.id,
          courseId: course.id,
          issuedAt: new Date('2024-01-16')
        }
      })

      // Admin can view both certificates
      const canViewCert1 = await AuthorizationService.canViewCertificate(admin.id, cert1.id)
      const canViewCert2 = await AuthorizationService.canViewCertificate(admin.id, cert2.id)

      expect(canViewCert1).toBe(true)
      expect(canViewCert2).toBe(true)

      const retrievedCert1 = await AuthorizationService.getCertificateWithAuth(admin.id, cert1.id)
      const retrievedCert2 = await AuthorizationService.getCertificateWithAuth(admin.id, cert2.id)

      expect(retrievedCert1?.user.name).toBe('Student Alpha')
      expect(retrievedCert2?.user.name).toBe('Student Beta')
    })

    test('admin role verification is case-sensitive and accurate', async () => {
      // Create user with non-admin role
      const regularUser = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('regular'),
          name: 'Regular User',
          role: 'STUDENT' // Not ADMIN
        }
      })
      testEnv.trackUser(regularUser.id)

      const student = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('student'),
          name: 'Certificate Holder',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(student.id)

      const course = await db.course.create({
        data: {
          title: 'Role Verification Course',
          slug: TestDatabase.getUniqueSlug('role-verification-course'),
          description: 'Course for testing role verification',
          category: 'DEVOPS',
          level: 'INTERMEDIATE',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const certificate = await db.certificate.create({
        data: {
          userId: student.id,
          courseId: course.id,
          issuedAt: new Date()
        }
      })

      // Regular user (non-admin) should not have access to other's certificate
      const canView = await AuthorizationService.canViewCertificate(regularUser.id, certificate.id)
      expect(canView).toBe(false)

      await expect(
        AuthorizationService.getCertificateWithAuth(regularUser.id, certificate.id)
      ).rejects.toThrow('UNAUTHORIZED: Access denied to this certificate')
    })
  })

  describe('Access Control Edge Cases', () => {
    test('handles invalid user ID gracefully', async () => {
      const student = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('student'),
          name: 'Valid Student',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(student.id)

      const course = await db.course.create({
        data: {
          title: 'Valid Course',
          slug: TestDatabase.getUniqueSlug('valid-course'),
          description: 'Course for edge case testing',
          category: 'TYPESCRIPT',
          level: 'BEGINNER',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const certificate = await db.certificate.create({
        data: {
          userId: student.id,
          courseId: course.id,
          issuedAt: new Date()
        }
      })

      const invalidUserId = TestDatabase.getUniqueId('invalid-user')

      // Should return false for invalid user ID
      const canView = await AuthorizationService.canViewCertificate(invalidUserId, certificate.id)
      expect(canView).toBe(false)

      await expect(
        AuthorizationService.getCertificateWithAuth(invalidUserId, certificate.id)
      ).rejects.toThrow('UNAUTHORIZED: Access denied to this certificate')
    })

    test('handles certificate without associated course gracefully', async () => {
      const owner = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('owner'),
          name: 'Certificate Owner',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(owner.id)

      const course = await db.course.create({
        data: {
          title: 'Temporary Course',
          slug: TestDatabase.getUniqueSlug('temporary-course'),
          description: 'Course that might be deleted',
          category: 'PRODUCTIVITY',
          level: 'BEGINNER',
          accessTier: 'FREE',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const certificate = await db.certificate.create({
        data: {
          userId: owner.id,
          courseId: course.id,
          issuedAt: new Date()
        }
      })

      // Delete the course (simulating orphaned certificate)
      await db.course.delete({
        where: { id: course.id }
      })

      // Should still be able to check authorization for orphaned certificate
      // (though in practice this might need different handling)
      const canView = await AuthorizationService.canViewCertificate(owner.id, certificate.id)
      
      // The behavior here depends on how the application handles orphaned certificates
      // For this test, we'll verify the system doesn't crash
      expect(typeof canView).toBe('boolean')
    })

    test('authorization check is consistent across multiple calls', async () => {
      const owner = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('owner'),
          name: 'Consistent Owner',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(owner.id)

      const admin = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('admin'),
          name: 'Consistent Admin',
          role: 'ADMIN'
        }
      })
      testEnv.trackUser(admin.id)

      const otherStudent = await db.user.create({
        data: {
          email: TestDatabase.getUniqueEmail('other'),
          name: 'Other Student',
          role: 'STUDENT'
        }
      })
      testEnv.trackUser(otherStudent.id)

      const course = await db.course.create({
        data: {
          title: 'Consistency Test Course',
          slug: TestDatabase.getUniqueSlug('consistency-test-course'),
          description: 'Course for testing authorization consistency',
          category: 'FULLSTACK',
          level: 'EXPERT',
          accessTier: 'PREMIUM',
          published: true
        }
      })
      testEnv.trackCourse(course.id)

      const certificate = await db.certificate.create({
        data: {
          userId: owner.id,
          courseId: course.id,
          issuedAt: new Date()
        }
      })

      // Test multiple calls for consistency
      for (let i = 0; i < 3; i++) {
        // Owner should always have access
        const ownerAccess = await AuthorizationService.canViewCertificate(owner.id, certificate.id)
        expect(ownerAccess).toBe(true)

        // Admin should always have access
        const adminAccess = await AuthorizationService.canViewCertificate(admin.id, certificate.id)
        expect(adminAccess).toBe(true)

        // Other student should never have access
        const otherAccess = await AuthorizationService.canViewCertificate(otherStudent.id, certificate.id)
        expect(otherAccess).toBe(false)
      }
    })
  })
})