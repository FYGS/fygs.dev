/**
 * Test fixtures for review system testing
 * Provides mock data and factory functions for consistent testing
 */

export const mockUsers = {
  student: {
    id: "user_student_123",
    name: "John Student",
    email: "student@test.com",
    image: "https://example.com/student.jpg",
    role: "STUDENT" as const,
  },
  instructor: {
    id: "user_instructor_456",
    name: "Jane Instructor",
    email: "instructor@test.com",
    image: "https://example.com/instructor.jpg",
    role: "INSTRUCTOR" as const,
  },
  admin: {
    id: "user_admin_789",
    name: "Admin User",
    email: "admin@test.com",
    image: "https://example.com/admin.jpg",
    role: "ADMIN" as const,
  },
};

/** Author of the second seeded vote (votes need a real user row). */
export const otherUser = {
  id: "user_other_999",
  name: "Other Student",
  email: "other@test.com",
  image: null,
  role: "STUDENT" as const,
};

export const mockCourses = {
  published: {
    id: "course_published_123",
    title: "Advanced TypeScript Development",
    slug: "advanced-typescript",
    description: "Learn advanced TypeScript patterns and best practices",
    category: "TYPESCRIPT" as const,
    level: "INTERMEDIATE" as const,
    accessTier: "FREE" as const,
    published: true,
    instructorId: mockUsers.instructor.id,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  draft: {
    id: "course_draft_456",
    title: "React Performance Optimization",
    slug: "react-performance",
    description: "Master React performance optimization techniques",
    category: "FRONTEND" as const,
    level: "ADVANCED" as const,
    accessTier: "PREMIUM" as const,
    published: false,
    instructorId: mockUsers.instructor.id,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
};

export const mockReviews = {
  approved: {
    id: "review_approved_123",
    userId: mockUsers.student.id,
    courseId: mockCourses.published.id,
    rating: 5,
    comment:
      "Excellent course! Very comprehensive and well-structured. I learned a lot about TypeScript advanced patterns.",
    verified: true,
    status: "APPROVED" as const,
    helpfulCount: 12,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  pending: {
    id: "review_pending_456",
    userId: mockUsers.instructor.id, // Different user to avoid unique constraint
    courseId: mockCourses.published.id,
    rating: 4,
    comment: "Good course but could use more practical examples.",
    verified: false,
    status: "PENDING" as const,
    helpfulCount: 0,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  reported: {
    id: "review_reported_789",
    userId: mockUsers.admin.id, // Different user to avoid unique constraint
    courseId: mockCourses.published.id,
    rating: 1,
    comment: "This is spam content that should be flagged.",
    verified: false,
    status: "FLAGGED" as const,
    helpfulCount: 0,
    createdAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-01-25"),
  },
};

export const mockReviewVotes = [
  {
    id: "vote_helpful_123",
    reviewId: mockReviews.approved.id,
    userId: mockUsers.instructor.id,
    helpful: true,
    createdAt: new Date("2024-01-16"),
  },
  {
    id: "vote_not_helpful_456",
    reviewId: mockReviews.approved.id,
    userId: otherUser.id,
    helpful: false,
    createdAt: new Date("2024-01-17"),
  },
];

export const mockReviewReplies = [
  {
    id: "reply_instructor_123",
    reviewId: mockReviews.approved.id,
    userId: mockUsers.instructor.id,
    content:
      "Thank you for your feedback! I'm glad you found the course helpful.",
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-16"),
  },
  {
    id: "reply_student_456",
    reviewId: mockReviews.approved.id,
    userId: mockUsers.student.id,
    content: "You're welcome! Looking forward to your next course.",
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-17"),
  },
];

export const mockReviewReports = [
  {
    id: "report_spam_123",
    reviewId: mockReviews.reported.id,
    userId: mockUsers.instructor.id,
    reason: "SPAM" as const,
    details: "This review contains spam content and irrelevant information.",
    status: "PENDING" as const,
    createdAt: new Date("2024-01-26"),
  },
];

/**
 * Factory functions for creating test data
 */
export const createMockReview = (
  overrides: Partial<typeof mockReviews.approved> = {}
) => ({
  ...mockReviews.approved,
  id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  ...overrides,
});

export const createMockUser = (
  overrides: Partial<typeof mockUsers.student> = {}
) => ({
  ...mockUsers.student,
  id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  email: `test_${Date.now()}@example.com`,
  ...overrides,
});

export const createMockCourse = (
  overrides: Partial<typeof mockCourses.published> = {}
) => ({
  ...mockCourses.published,
  id: `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  slug: `test-course-${Date.now()}`,
  ...overrides,
});

/**
 * Database seed data for integration tests
 */
export const seedData = {
  users: [mockUsers.student, mockUsers.instructor, mockUsers.admin, otherUser],
  courses: [mockCourses.published, mockCourses.draft],
  reviews: [mockReviews.approved, mockReviews.pending, mockReviews.reported],
  reviewVotes: mockReviewVotes,
  reviewReplies: mockReviewReplies,
  reviewReports: mockReviewReports,
};

/**
 * Test scenarios for different user permissions
 */
export const testScenarios = {
  guestUser: {
    user: null,
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canModerate: false,
  },
  authenticatedStudent: {
    user: mockUsers.student,
    canView: true,
    canCreate: true,
    canEdit: true, // own reviews only
    canDelete: true, // own reviews only
    canModerate: false,
  },
  instructor: {
    user: mockUsers.instructor,
    canView: true,
    canCreate: true,
    canEdit: true, // own reviews only
    canDelete: true, // own reviews only
    canModerate: true, // own course reviews only
    canReply: true,
  },
  admin: {
    user: mockUsers.admin,
    canView: true,
    canCreate: true,
    canEdit: true, // all reviews
    canDelete: true, // all reviews
    canModerate: true, // all reviews
    canReply: true,
  },
};

/**
 * API response mocks
 */
export const mockApiResponses = {
  reviewsList: {
    reviews: [mockReviews.approved],
    pagination: {
      total: 1,
      page: 1,
      limit: 10,
      pages: 1,
    },
    filters: {
      rating: null,
      verified: null,
      dateRange: null,
    },
  },
  reviewStats: {
    totalReviews: 25,
    averageRating: 4.2,
    ratingDistribution: [
      { rating: 1, count: 1, percentage: 4 },
      { rating: 2, count: 2, percentage: 8 },
      { rating: 3, count: 3, percentage: 12 },
      { rating: 4, count: 8, percentage: 32 },
      { rating: 5, count: 11, percentage: 44 },
    ],
    verifiedReviews: 18,
    verificationRate: 72,
    lastUpdated: new Date().toISOString(),
  },
  searchResults: {
    reviews: [mockReviews.approved],
    pagination: {
      total: 1,
      page: 1,
      limit: 10,
      pages: 1,
    },
    query: "excellent course",
    filters: {},
    performance: {
      queryDuration: 45,
      resultsPerSecond: 22,
    },
  },
};

/**
 * Error scenarios for testing
 */
export const errorScenarios = {
  invalidReviewData: {
    userId: "", // invalid
    courseId: "invalid_course",
    rating: 6, // out of range
    comment: "", // too short
  },
  unauthorizedAccess: {
    userId: "unauthorized_user",
    action: "delete",
    targetReviewId: mockReviews.approved.id,
  },
  nonExistentResource: {
    reviewId: "non_existent_review_123",
    courseId: "non_existent_course_456",
    userId: "non_existent_user_789",
  },
  rateLimitExceeded: {
    userId: mockUsers.student.id,
    attempts: 10, // exceeds limit
    timeWindow: "1hour",
  },
};

/**
 * Performance test data
 */
export const performanceTestData = {
  largeCourseReviews: Array.from({ length: 1000 }, (_, index) =>
    createMockReview({
      id: `perf_review_${index}`,
      rating: Math.floor(Math.random() * 5) + 1,
      comment: `Performance test review #${index} with varying content length. ${
        index % 10 === 0
          ? "This is a longer review with more detailed feedback about the course content, structure, and overall learning experience."
          : "Short review."
      }`,
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 30), // Last 30 days
    })
  ),
  bulkOperationData: Array.from({ length: 100 }, (_, index) => ({
    userId: `bulk_user_${index}`,
    courseId: mockCourses.published.id,
    rating: Math.floor(Math.random() * 5) + 1,
    comment: `Bulk operation test review #${index}`,
  })),
};
