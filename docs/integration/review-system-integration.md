# Review System Integration Guide

## Overview

This guide provides step-by-step instructions for integrating the comprehensive review system into existing applications or building new applications with review functionality.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Frontend Integration](#frontend-integration)
3. [Backend Integration](#backend-integration)
4. [Database Setup](#database-setup)
5. [Authentication Setup](#authentication-setup)
6. [Caching Configuration](#caching-configuration)
7. [Email Notifications](#email-notifications)
8. [Performance Optimization](#performance-optimization)
9. [Testing Integration](#testing-integration)
10. [Production Deployment](#production-deployment)

## Quick Start

### Prerequisites

- Node.js 18+ with pnpm/npm
- PostgreSQL 15+
- Redis 7+
- Next.js 15+ application

### Installation

```bash
# Clone the review system components
git clone https://github.com/fygs/review-system.git
cd review-system

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
```

### Environment Configuration

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/database"

# Redis Cache
REDIS_URL="redis://localhost:6379"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Email Service
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-password"

# Optional: External Services
OPENAI_API_KEY="sk-..." # For sentiment analysis
UPLOADTHING_SECRET="..." # For file uploads
```

### Basic Setup

```bash
# Run database migrations
npx prisma migrate dev

# Seed initial data
npx prisma db seed

# Start development server
pnpm dev
```

## Frontend Integration

### React Components Integration

#### 1. Course Review Display

```tsx
import { CourseReviews } from '@/components/courses/course-reviews';

function CoursePage({ courseId }: { courseId: string }) {
  return (
    <div className="course-layout">
      {/* Course content */}
      
      <section className="reviews-section">
        <CourseReviews courseId={courseId} />
      </section>
    </div>
  );
}
```

#### 2. Review Submission Form

```tsx
import { ReviewSubmissionForm } from '@/components/courses/review-submission-form';

function CourseCompletionPage({ courseId }: { courseId: string }) {
  return (
    <div className="completion-layout">
      <h1>Course Completed!</h1>
      
      <ReviewSubmissionForm 
        courseId={courseId}
        onSubmitted={(review) => {
          // Handle successful submission
          console.log('Review submitted:', review);
        }}
      />
    </div>
  );
}
```

#### 3. Review Analytics Dashboard

```tsx
import { ReviewAnalyticsDashboard } from '@/components/dashboard/review-analytics';

function InstructorDashboard() {
  return (
    <div className="dashboard-layout">
      <ReviewAnalyticsDashboard 
        view="instructor" // or "admin" 
        filters={{
          dateRange: '30d',
          courseIds: ['course_1', 'course_2']
        }}
      />
    </div>
  );
}
```

### Custom Hook Usage

```tsx
import { 
  useReviews, 
  useCreateReview, 
  useReviewAnalytics 
} from '@/hooks/use-reviews';

function ReviewComponent({ courseId }: { courseId: string }) {
  const { 
    reviews, 
    loading, 
    error, 
    refetch 
  } = useReviews(courseId, {
    page: 1,
    limit: 10,
    sort: 'newest'
  });

  const { 
    createReview, 
    isCreating 
  } = useCreateReview();

  const handleSubmit = async (data: ReviewFormData) => {
    try {
      await createReview({ courseId, ...data });
      await refetch(); // Refresh reviews list
    } catch (error) {
      console.error('Failed to create review:', error);
    }
  };

  if (loading) return <ReviewsSkeleton />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {reviews.map(review => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
```

### State Management with Zustand

```tsx
import { useReviewStore } from '@/stores/review-store';

function ReviewApp() {
  const { 
    reviews,
    filters,
    setFilters,
    fetchReviews,
    optimisticUpdate
  } = useReviewStore();

  useEffect(() => {
    fetchReviews();
  }, [filters]);

  return (
    <div>
      <ReviewFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />
      
      <ReviewList 
        reviews={reviews}
        onVote={(reviewId, type) => {
          optimisticUpdate(reviewId, { userVote: type });
          // API call happens in background
        }}
      />
    </div>
  );
}
```

## Backend Integration

### API Route Implementation

#### 1. Course Reviews Endpoint

```typescript
// app/api/courses/[courseId]/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ReviewService } from '@/lib/services/review-service';
import { reviewQuerySchema } from '@/lib/validators/review-validators';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const query = reviewQuerySchema.parse({
      courseId: params.courseId,
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 10,
      sort: searchParams.get('sort') || 'newest',
      rating: searchParams.get('rating'),
      verified: searchParams.get('verified') === 'true',
      search: searchParams.get('search'),
    });

    const reviews = await ReviewService.getCourseReviews(query);

    return NextResponse.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch reviews' 
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const reviewData = createReviewSchema.parse({
      ...body,
      courseId: params.courseId,
      userId: session.user.id,
    });

    const review = await ReviewService.createReview(reviewData);

    return NextResponse.json({
      success: true,
      data: review,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create review' 
      },
      { status: 500 }
    );
  }
}
```

#### 2. Review Analytics Endpoint

```typescript
// app/api/analytics/reviews/course/[courseId]/route.ts
import { ReviewAnalyticsService } from '@/lib/services/review-analytics';
import { getCachedData } from '@/lib/cache/review-cache';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const cacheKey = `analytics:course:${params.courseId}`;
    
    const analytics = await getCachedData(
      cacheKey,
      async () => ReviewAnalyticsService.getCourseReviewStats(params.courseId),
      60 * 60 // 1 hour cache
    );

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
```

### Service Layer Integration

#### Review Service Implementation

```typescript
// lib/services/review-service.ts
import { db } from '@/lib/db';
import { ReviewCacheService } from './review-cache-service';
import { EmailNotificationService } from './email-notification-service';
import { logger } from '@/lib/structured-logger';

export class ReviewService {
  static async createReview(data: CreateReviewData) {
    return await db.$transaction(async (tx) => {
      // Create the review
      const review = await tx.review.create({
        data: {
          userId: data.userId,
          courseId: data.courseId,
          rating: data.rating,
          comment: data.comment,
          status: 'PENDING',
        },
        include: {
          user: {
            select: { name: true, image: true }
          }
        }
      });

      // Update course statistics
      await this.updateCourseStats(tx, data.courseId);

      // Invalidate cache
      await ReviewCacheService.invalidateCourseReviews(data.courseId);

      // Send notifications
      await EmailNotificationService.sendReviewNotification(review);

      logger.info('Review created successfully', {
        metadata: { reviewId: review.id, courseId: data.courseId }
      });

      return review;
    });
  }

  static async getCourseReviews(params: ReviewQueryParams) {
    const cacheKey = ReviewCacheService.generateCacheKey('course-reviews', params);
    
    return await ReviewCacheService.getOrSet(
      cacheKey,
      async () => {
        const { reviews, total } = await this.fetchCourseReviews(params);
        const stats = await ReviewAnalyticsService.getCourseReviewStats(params.courseId);
        
        return {
          reviews,
          pagination: {
            total,
            page: params.page,
            limit: params.limit,
            pages: Math.ceil(total / params.limit),
            hasNext: params.page * params.limit < total,
            hasPrev: params.page > 1,
          },
          stats,
        };
      },
      5 * 60 // 5 minutes cache
    );
  }

  private static async fetchCourseReviews(params: ReviewQueryParams) {
    const where = {
      courseId: params.courseId,
      status: 'APPROVED',
      ...(params.rating && { rating: params.rating }),
      ...(params.verified && { verified: true }),
      ...(params.search && {
        comment: {
          contains: params.search,
          mode: 'insensitive' as const
        }
      }),
    };

    const orderBy = this.buildOrderBy(params.sort);

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
        include: {
          user: {
            select: { name: true, image: true, verified: true }
          },
          replies: {
            include: {
              user: {
                select: { name: true, image: true, role: true }
              }
            },
            orderBy: { createdAt: 'asc' }
          },
          _count: {
            select: {
              votes: {
                where: { type: 'HELPFUL' }
              }
            }
          }
        },
        orderBy,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      db.review.count({ where }),
    ]);

    return { reviews, total };
  }
}
```

## Database Setup

### Prisma Schema Integration

Add the review system schema to your existing `schema.prisma`:

```prisma
// Review System Models
model Review {
  id          String      @id @default(cuid())
  userId      String
  courseId    String
  rating      Int         @db.SmallInt
  comment     String      @db.Text
  verified    Boolean     @default(false)
  status      ReviewStatus @default(PENDING)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Relations
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  course      Course      @relation(fields: [courseId], references: [id], onDelete: Cascade)
  votes       ReviewVote[]
  replies     ReviewReply[]
  reports     ReviewReport[]

  // Indexes
  @@unique([userId, courseId]) // One review per user per course
  @@index([courseId, status, createdAt])
  @@index([rating, createdAt])
  @@map("reviews")
}

model ReviewVote {
  id        String     @id @default(cuid())
  reviewId  String
  userId    String
  type      VoteType
  createdAt DateTime   @default(now())

  // Relations
  review    Review     @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Constraints
  @@unique([reviewId, userId]) // One vote per user per review
  @@map("review_votes")
}

model ReviewReply {
  id        String   @id @default(cuid())
  reviewId  String
  userId    String
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  review    Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([reviewId, createdAt])
  @@map("review_replies")
}

model ReviewReport {
  id          String      @id @default(cuid())
  reviewId    String
  userId      String
  reason      ReportReason
  description String?     @db.Text
  status      ReportStatus @default(PENDING)
  createdAt   DateTime    @default(now())

  // Relations
  review      Review      @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([reviewId, userId]) // One report per user per review
  @@map("review_reports")
}

// Enums
enum ReviewStatus {
  PENDING
  APPROVED
  REJECTED
  FLAGGED
}

enum VoteType {
  HELPFUL
  NOT_HELPFUL
}

enum ReportReason {
  SPAM
  INAPPROPRIATE
  FAKE
  OTHER
}

enum ReportStatus {
  PENDING
  REVIEWED
  RESOLVED
  DISMISSED
}
```

### Database Migration

```bash
# Generate migration
npx prisma migrate dev --name add-review-system

# Apply migration to production
npx prisma migrate deploy
```

### Database Indexing Strategy

```sql
-- Additional performance indexes
CREATE INDEX CONCURRENTLY idx_reviews_course_rating_created 
ON reviews (course_id, rating, created_at DESC);

CREATE INDEX CONCURRENTLY idx_reviews_user_created 
ON reviews (user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_review_votes_review_type 
ON review_votes (review_id, type);

-- Materialized view for analytics
CREATE MATERIALIZED VIEW review_stats AS
SELECT 
  course_id,
  COUNT(*) as total_reviews,
  AVG(rating) as average_rating,
  COUNT(CASE WHEN verified = true THEN 1 END) as verified_reviews,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_reviews
FROM reviews 
WHERE status = 'APPROVED'
GROUP BY course_id;

-- Refresh materialized view
CREATE OR REPLACE FUNCTION refresh_review_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY review_stats;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh (requires pg_cron extension)
SELECT cron.schedule('refresh-review-stats', '*/15 * * * *', 'SELECT refresh_review_stats();');
```

## Authentication Setup

### Next-Auth Configuration

```typescript
// lib/auth/auth-config.ts
import { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db),
  providers: [
    // Your existing providers
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
        
        // Add user role for review permissions
        const user = await db.user.findUnique({
          where: { id: token.sub },
          select: { role: true, verified: true }
        });
        
        session.user.role = user?.role;
        session.user.verified = user?.verified;
      }
      return session;
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.role = user.role;
        token.verified = user.verified;
      }
      return token;
    },
  },
};
```

### Permission Middleware

```typescript
// lib/auth/permissions.ts
import { getServerSession } from "next-auth/next";
import { authConfig } from "./auth-config";

export async function requireAuth() {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    throw new Error('Authentication required');
  }
  return session;
}

export async function requireRole(role: string) {
  const session = await requireAuth();
  if (session.user.role !== role && session.user.role !== 'ADMIN') {
    throw new Error('Insufficient permissions');
  }
  return session;
}

export async function canModifyReview(reviewId: string, userId: string) {
  const review = await db.review.findUnique({
    where: { id: reviewId },
    select: { userId: true }
  });
  
  return review?.userId === userId;
}
```

## Caching Configuration

### Redis Setup

```typescript
// lib/cache/redis-client.ts
import Redis from 'ioredis';

export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

// Health check
redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (error) => {
  console.error('Redis error:', error);
});
```

### Cache Service Implementation

```typescript
// lib/services/review-cache-service.ts
import { redis } from '@/lib/cache/redis-client';
import { logger } from '@/lib/structured-logger';

export class ReviewCacheService {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.error('Cache get error', { metadata: { key, error } });
      return null;
    }
  }

  static async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error('Cache set error', { metadata: { key, ttl, error } });
    }
  }

  static async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const data = await fetcher();
    await this.set(key, data, ttl);
    return data;
  }

  static async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.error('Cache invalidation error', { metadata: { pattern, error } });
    }
  }

  static generateCacheKey(prefix: string, params: any): string {
    const paramString = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('|');
    
    return `${prefix}:${paramString}`;
  }

  // Review-specific cache operations
  static async invalidateCourseReviews(courseId: string): Promise<void> {
    await Promise.all([
      this.invalidate(`course-reviews:*courseId:${courseId}*`),
      this.invalidate(`course-stats:${courseId}`),
      this.invalidate(`analytics:course:${courseId}`),
    ]);
  }
}
```

## Email Notifications

### Email Service Configuration

```typescript
// lib/services/email-notification-service.ts
import nodemailer from 'nodemailer';
import { ReviewEmailTemplates } from './email-templates';

export class EmailNotificationService {
  private static transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  static async sendReviewNotification(review: ReviewWithUser) {
    // Notify course instructor
    const instructor = await this.getCourseInstructor(review.courseId);
    if (instructor?.emailNotifications?.reviews) {
      await this.sendEmail({
        to: instructor.email,
        subject: 'New Review on Your Course',
        html: ReviewEmailTemplates.newReview(review, instructor),
      });
    }
  }

  static async sendReviewReplyNotification(reply: ReplyWithUser) {
    const review = await db.review.findUnique({
      where: { id: reply.reviewId },
      include: { user: true }
    });

    if (review?.user.emailNotifications?.replies) {
      await this.sendEmail({
        to: review.user.email,
        subject: 'Reply to Your Review',
        html: ReviewEmailTemplates.reviewReply(reply, review),
      });
    }
  }

  private static async sendEmail(options: EmailOptions) {
    try {
      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL,
        ...options,
      });
    } catch (error) {
      logger.error('Email send error', { metadata: { error } });
    }
  }
}
```

## Performance Optimization

### Database Query Optimization

```typescript
// lib/services/review-query-optimizer.ts
export class ReviewQueryOptimizer {
  static buildOptimizedQuery(params: ReviewQueryParams) {
    const select = {
      id: true,
      rating: true,
      comment: true,
      verified: true,
      createdAt: true,
      user: {
        select: {
          name: true,
          image: true,
          verified: true,
        }
      },
      // Only load replies if needed
      ...(params.includeReplies && {
        replies: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: { name: true, role: true }
            }
          },
          take: 5, // Limit replies
          orderBy: { createdAt: 'desc' }
        }
      }),
      // Only load vote counts if needed
      ...(params.includeVotes && {
        _count: {
          select: {
            votes: {
              where: { type: 'HELPFUL' }
            }
          }
        }
      }),
    };

    const where = this.buildWhereClause(params);
    const orderBy = this.buildOrderClause(params.sort);

    return { select, where, orderBy };
  }

  static async getReviewsWithCursor(params: CursorParams) {
    // Use cursor-based pagination for better performance
    const { cursor, limit, courseId } = params;
    
    return await db.review.findMany({
      where: {
        courseId,
        status: 'APPROVED',
        ...(cursor && { id: { lt: cursor } })
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: { select: { name: true, image: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // Take one extra to check for next page
    });
  }
}
```

### Batch Operations

```typescript
// lib/services/review-batch-service.ts
export class ReviewBatchService {
  static async batchUpdateReviewStats(courseIds: string[]) {
    const batches = this.chunkArray(courseIds, 50); // Process in batches of 50
    
    await Promise.all(
      batches.map(batch => this.processBatch(batch))
    );
  }

  private static async processBatch(courseIds: string[]) {
    const stats = await db.review.groupBy({
      by: ['courseId'],
      where: {
        courseId: { in: courseIds },
        status: 'APPROVED'
      },
      _count: { id: true },
      _avg: { rating: true },
    });

    // Update course statistics in bulk
    await Promise.all(
      stats.map(stat => 
        db.course.update({
          where: { id: stat.courseId },
          data: {
            reviewCount: stat._count.id,
            averageRating: stat._avg.rating || 0,
          }
        })
      )
    );
  }

  private static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
```

## Testing Integration

### Test Database Setup

```typescript
// tests/setup/database.ts
import { PrismaClient } from '@prisma/client';

export class TestDatabaseManager {
  private static testDb: PrismaClient;

  static async setupTestDatabase() {
    this.testDb = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL
        }
      }
    });

    await this.testDb.$connect();
    await this.seedTestData();
  }

  static async cleanupTestDatabase() {
    await this.testDb.reviewVote.deleteMany();
    await this.testDb.reviewReply.deleteMany();
    await this.testDb.reviewReport.deleteMany();
    await this.testDb.review.deleteMany();
    await this.testDb.course.deleteMany();
    await this.testDb.user.deleteMany();
    await this.testDb.$disconnect();
  }

  static async seedTestData() {
    // Create test users
    const users = await this.testDb.user.createMany({
      data: [
        { 
          id: 'user_1', 
          email: 'student@test.com', 
          name: 'Test Student',
          role: 'USER'
        },
        { 
          id: 'user_2', 
          email: 'instructor@test.com', 
          name: 'Test Instructor',
          role: 'INSTRUCTOR' 
        },
      ]
    });

    // Create test courses
    const courses = await this.testDb.course.createMany({
      data: [
        { 
          id: 'course_1', 
          title: 'Test Course 1',
          instructorId: 'user_2'
        },
      ]
    });

    // Create test reviews
    await this.testDb.review.createMany({
      data: [
        {
          id: 'review_1',
          userId: 'user_1',
          courseId: 'course_1',
          rating: 5,
          comment: 'Excellent course!',
          status: 'APPROVED'
        },
      ]
    });
  }

  static getTestDb() {
    return this.testDb;
  }
}
```

### Integration Test Example

```typescript
// tests/integration/review-api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { testClient } from '../utils/test-client';
import { TestDatabaseManager } from '../setup/database';

describe('Review API Integration', () => {
  beforeAll(async () => {
    await TestDatabaseManager.setupTestDatabase();
  });

  afterAll(async () => {
    await TestDatabaseManager.cleanupTestDatabase();
  });

  describe('GET /api/courses/[courseId]/reviews', () => {
    it('should return course reviews with pagination', async () => {
      const response = await testClient.get('/api/courses/course_1/reviews');
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.reviews).toHaveLength(1);
      expect(response.data.data.pagination.total).toBe(1);
    });

    it('should filter reviews by rating', async () => {
      const response = await testClient.get('/api/courses/course_1/reviews?rating=5');
      
      expect(response.status).toBe(200);
      expect(response.data.data.reviews).toHaveLength(1);
      expect(response.data.data.reviews[0].rating).toBe(5);
    });
  });

  describe('POST /api/courses/[courseId]/reviews', () => {
    it('should create a new review', async () => {
      const reviewData = {
        rating: 4,
        comment: 'Great course content!',
      };

      const response = await testClient.post(
        '/api/courses/course_1/reviews', 
        reviewData,
        { 
          headers: { 
            Authorization: 'Bearer test-token' 
          } 
        }
      );

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data.rating).toBe(4);
    });
  });
});
```

## Production Deployment

### Environment Configuration

```bash
# Production environment variables
NODE_ENV=production
DATABASE_URL="postgresql://user:password@prod-db:5432/database"
REDIS_URL="redis://prod-redis:6379"

# Security
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://yourdomain.com"

# Email
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
LOG_LEVEL="info"

# Performance
REDIS_CACHE_TTL=3600
DATABASE_POOL_SIZE=20
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS production
COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/reviews
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: reviews
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Monitoring Setup

```typescript
// lib/monitoring/metrics.ts
import { register, Counter, Histogram } from 'prom-client';

// Metrics for review system
export const reviewMetrics = {
  reviewsCreated: new Counter({
    name: 'reviews_created_total',
    help: 'Total number of reviews created',
    labelNames: ['courseId', 'rating']
  }),

  reviewResponseTime: new Histogram({
    name: 'review_response_time_seconds',
    help: 'Review API response time in seconds',
    labelNames: ['method', 'endpoint']
  }),

  cacheHitRate: new Counter({
    name: 'cache_hits_total',
    help: 'Total cache hits',
    labelNames: ['operation']
  }),
};

register.registerMetric(reviewMetrics.reviewsCreated);
register.registerMetric(reviewMetrics.reviewResponseTime);
register.registerMetric(reviewMetrics.cacheHitRate);
```

### Health Checks

```typescript
// app/api/health/route.ts
import { db } from '@/lib/db';
import { redis } from '@/lib/cache/redis-client';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      redis: 'unknown',
      email: 'unknown'
    }
  };

  try {
    // Database health check
    await db.$queryRaw`SELECT 1`;
    health.services.database = 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }

  try {
    // Redis health check
    await redis.ping();
    health.services.redis = 'healthy';
  } catch (error) {
    health.services.redis = 'unhealthy';
    health.status = 'degraded';
  }

  return Response.json(health, {
    status: health.status === 'healthy' ? 200 : 503
  });
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check connection
   npx prisma db pull
   
   # Reset database
   npx prisma migrate reset --force
   ```

2. **Redis Cache Issues**
   ```bash
   # Check Redis connection
   redis-cli ping
   
   # Clear cache
   redis-cli FLUSHALL
   ```

3. **Build Issues**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Performance Issues**
   ```sql
   -- Check slow queries
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;
   
   -- Check index usage
   SELECT indexname, idx_tup_read, idx_tup_fetch 
   FROM pg_stat_user_indexes 
   WHERE schemaname = 'public';
   ```

### Support Resources

- **Documentation**: https://docs.fygs.dev/reviews
- **API Reference**: https://api.fygs.dev/docs
- **Community**: https://community.fygs.dev
- **Support**: support@fygs.dev

---

*Integration Guide Version: 1.0 | Last Updated: 2024-01-15*