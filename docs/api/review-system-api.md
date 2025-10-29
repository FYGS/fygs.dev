# Review System API Documentation

## Overview

The Course Review System provides a comprehensive platform for managing course reviews, ratings, analytics, and user interactions. This API supports all review-related operations with enterprise-grade performance, security, and scalability.

## Base URL

```
Production: https://fygs.dev/api
Development: http://localhost:3000/api
```

## Authentication

All API endpoints require authentication except for public read operations. Use Bearer token authentication:

```bash
Authorization: Bearer <your_jwt_token>
```

## Rate Limiting

- **Public endpoints**: 100 requests/minute
- **Authenticated endpoints**: 1000 requests/minute  
- **Admin endpoints**: 5000 requests/minute

## API Endpoints

### Reviews

#### Get Course Reviews

```http
GET /api/reviews/{courseId}
```

Retrieve paginated reviews for a specific course with filtering and sorting options.

**Parameters:**
- `courseId` (required): Course identifier
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sort` (optional): Sort order (`newest`, `oldest`, `rating-high`, `rating-low`, `helpful`)
- `rating` (optional): Filter by rating (1-5)
- `verified` (optional): Filter verified reviews only (`true`/`false`)
- `search` (optional): Search in review content

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "review_123",
        "userId": "user_456",
        "user": {
          "name": "John Doe",
          "avatar": "https://...",
          "verified": true
        },
        "courseId": "course_789",
        "rating": 5,
        "comment": "Excellent course with great content!",
        "verified": true,
        "helpful": 15,
        "notHelpful": 2,
        "status": "APPROVED",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "replies": [
          {
            "id": "reply_111",
            "userId": "user_instructor",
            "user": {
              "name": "Instructor Name",
              "role": "INSTRUCTOR"
            },
            "content": "Thank you for the feedback!",
            "createdAt": "2024-01-16T09:00:00Z"
          }
        ],
        "userVote": "helpful" // Current user's vote
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 10,
      "pages": 15,
      "hasNext": true,
      "hasPrev": false
    },
    "stats": {
      "averageRating": 4.3,
      "totalReviews": 150,
      "ratingDistribution": {
        "1": 5,
        "2": 8,
        "3": 15,
        "4": 45,
        "5": 77
      }
    }
  }
}
```

#### Create Review

```http
POST /api/reviews
```

Create a new course review.

**Request Body:**
```json
{
  "courseId": "course_789",
  "rating": 5,
  "comment": "Amazing course! Learned so much.",
  "tags": ["helpful", "comprehensive", "well-structured"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "review_123",
    "courseId": "course_789",
    "rating": 5,
    "comment": "Amazing course! Learned so much.",
    "status": "PENDING",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Update Review

```http
PUT /api/reviews/{reviewId}
```

Update an existing review (only by review author).

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Updated review content...",
  "tags": ["updated", "helpful"]
}
```

#### Delete Review

```http
DELETE /api/reviews/{reviewId}
```

Delete a review (only by review author or admin).

#### Vote on Review

```http
POST /api/reviews/{reviewId}/vote
```

Vote on review helpfulness.

**Request Body:**
```json
{
  "type": "helpful" // "helpful" or "not_helpful"
}
```

#### Reply to Review

```http
POST /api/reviews/{reviewId}/replies
```

Add a reply to a review.

**Request Body:**
```json
{
  "content": "Thank you for your feedback!"
}
```

#### Report Review

```http
POST /api/reviews/{reviewId}/report
```

Report inappropriate review content.

**Request Body:**
```json
{
  "reason": "spam", // "spam", "inappropriate", "fake", "other"
  "description": "This review appears to be spam content."
}
```

### Analytics

#### Course Review Analytics

```http
GET /api/analytics/reviews/course/{courseId}
```

Get comprehensive review analytics for a course.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReviews": 150,
    "averageRating": 4.3,
    "ratingDistribution": {
      "1": { "count": 5, "percentage": 3.3 },
      "2": { "count": 8, "percentage": 5.3 },
      "3": { "count": 15, "percentage": 10.0 },
      "4": { "count": 45, "percentage": 30.0 },
      "5": { "count": 77, "percentage": 51.3 }
    },
    "verifiedReviews": 120,
    "verificationRate": 80.0,
    "recentReviews": 25,
    "sentiment": {
      "positive": 75.5,
      "neutral": 15.2,
      "negative": 9.3
    },
    "trends": {
      "ratingTrend": "increasing",
      "volumeTrend": "stable",
      "monthlyStats": [
        {
          "month": "2024-01",
          "reviews": 15,
          "averageRating": 4.2
        }
      ]
    },
    "topKeywords": [
      { "word": "excellent", "count": 45 },
      { "word": "helpful", "count": 38 },
      { "word": "comprehensive", "count": 32 }
    ],
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

#### Platform Analytics

```http
GET /api/analytics/reviews/platform
```

Get platform-wide review statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReviews": 15420,
    "totalCourses": 89,
    "averageRating": 4.1,
    "monthlyGrowth": 12.5,
    "topRatedCourses": [
      {
        "courseId": "course_123",
        "title": "Advanced JavaScript",
        "averageRating": 4.8,
        "totalReviews": 245
      }
    ],
    "recentActivity": {
      "last24h": 45,
      "last7d": 312,
      "last30d": 1205
    }
  }
}
```

### Admin Endpoints

#### Review Moderation

```http
GET /api/admin/reviews/moderation
```

Get reviews requiring moderation.

```http
PUT /api/admin/reviews/{reviewId}/status
```

Update review status.

**Request Body:**
```json
{
  "status": "APPROVED", // "PENDING", "APPROVED", "REJECTED", "FLAGGED"
  "reason": "Meets community guidelines"
}
```

#### Bulk Operations

```http
POST /api/admin/reviews/bulk-action
```

Perform bulk actions on reviews.

**Request Body:**
```json
{
  "action": "approve", // "approve", "reject", "flag", "delete"
  "reviewIds": ["review_1", "review_2"],
  "reason": "Bulk approval after review"
}
```

### Search & Filtering

#### Advanced Search

```http
GET /api/reviews/search
```

Advanced search across all reviews.

**Parameters:**
- `query`: Search term
- `courseIds[]`: Filter by specific courses
- `ratings[]`: Filter by ratings (1-5)
- `verified`: Verified reviews only
- `dateFrom`: Start date filter
- `dateTo`: End date filter
- `sortBy`: Sort criteria
- `page`: Page number
- `limit`: Results per page

### Webhooks

#### Review Events

Configure webhooks to receive real-time notifications:

- `review.created` - New review submitted
- `review.updated` - Review modified
- `review.approved` - Review approved
- `review.rejected` - Review rejected
- `review.reported` - Review reported
- `reply.created` - New reply added
- `vote.cast` - Vote on review

**Webhook Payload:**
```json
{
  "event": "review.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "reviewId": "review_123",
    "courseId": "course_789",
    "userId": "user_456",
    // ... review data
  }
}
```

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "field": "rating",
      "issue": "Rating must be between 1 and 5"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_123456"
}
```

### Error Codes

- `VALIDATION_ERROR` (400) - Invalid request data
- `UNAUTHORIZED` (401) - Authentication required
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `RATE_LIMITED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error

## Data Models

### Review Model

```typescript
interface Review {
  id: string;
  userId: string;
  courseId: string;
  rating: number; // 1-5
  comment: string;
  verified: boolean;
  helpful: number;
  notHelpful: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  user: User;
  replies: ReviewReply[];
  reports: ReviewReport[];
}
```

### Review Reply Model

```typescript
interface ReviewReply {
  id: string;
  reviewId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: User;
}
```

### Review Vote Model

```typescript
interface ReviewVote {
  id: string;
  reviewId: string;
  userId: string;
  type: 'helpful' | 'not_helpful';
  createdAt: string;
}
```

## SDKs and Libraries

### JavaScript/TypeScript SDK

```bash
npm install @fygs/review-sdk
```

```typescript
import { ReviewClient } from '@fygs/review-sdk';

const client = new ReviewClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://fygs.dev/api'
});

// Get course reviews
const reviews = await client.reviews.getCourseReviews('course_123', {
  page: 1,
  limit: 10,
  sort: 'newest'
});

// Create review
const newReview = await client.reviews.create({
  courseId: 'course_123',
  rating: 5,
  comment: 'Excellent course!'
});
```

### React Hooks

```typescript
import { useReviews, useCreateReview } from '@fygs/review-hooks';

function CourseReviews({ courseId }) {
  const { reviews, loading, error } = useReviews(courseId);
  const { createReview, creating } = useCreateReview();

  const handleSubmit = async (data) => {
    await createReview({ courseId, ...data });
  };

  // Component implementation...
}
```

## Performance Optimization

### Caching Strategy

- **Review lists**: 5 minutes cache
- **Analytics**: 1 hour cache
- **Course stats**: 30 minutes cache
- **User votes**: Real-time with optimistic updates

### Database Optimization

- Indexed fields: `courseId`, `userId`, `rating`, `status`, `createdAt`
- Composite indexes for common query patterns
- Materialized views for analytics
- Read replicas for heavy read operations

### CDN Integration

- Static assets served via CDN
- Image optimization for user avatars
- Geographic distribution for global access

## Security

### Data Protection

- All data encrypted in transit (TLS 1.3)
- Sensitive data encrypted at rest
- PII data anonymization options
- GDPR compliance features

### Access Control

- JWT-based authentication
- Role-based permissions (USER, INSTRUCTOR, ADMIN)
- API key authentication for server-to-server
- Rate limiting and DDoS protection

### Content Moderation

- Automated spam detection
- Profanity filtering
- Content similarity detection
- Human moderation workflow

## Monitoring & Analytics

### System Metrics

- API response times
- Error rates by endpoint
- Database query performance
- Cache hit/miss ratios

### Business Metrics

- Review submission rates
- User engagement metrics
- Course rating trends
- Platform growth analytics

## Support

### Getting Started

1. Obtain API credentials from the dashboard
2. Review the authentication guide
3. Test with the interactive API explorer
4. Implement using SDK or direct HTTP calls

### Resources

- **Interactive API Explorer**: https://fygs.dev/api/docs
- **SDK Documentation**: https://docs.fygs.dev/sdk
- **Community Forum**: https://community.fygs.dev
- **Status Page**: https://status.fygs.dev

### Contact

- **Technical Support**: support@fygs.dev
- **API Issues**: api-support@fygs.dev
- **Documentation**: docs@fygs.dev

---

*API Version: 1.0 | Last Updated: 2024-01-15*