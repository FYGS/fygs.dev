# Contracts: API & Server Action Specifications

**Feature**: `001-refactor-learning-platform`  
**Created**: 2025-09-30  
**Status**: Complete  

## Overview
This directory contains API contracts and server action specifications for the learning platform refactor. The migration strategy prioritizes server actions for mutations while preserving API routes for external integrations.

## Contract Naming Conventions

### Server Actions
- **Location**: `app/(dashboard)/actions/` for authenticated operations
- **Naming**: `{verb}{Entity}.ts` (e.g., `enrollCourse.ts`, `updateLessonProgress.ts`)
- **Input**: Zod schema validation at entry point
- **Output**: Typed result objects with error handling
- **Idempotency**: All mutations must be idempotent (safe for retries)

### API Routes (External Only)
- **Webhooks**: `/api/stripe/webhook` (Stripe events)
- **OG Images**: `/api/og/{resource}` (dynamic social previews)
- **Analytics Batch**: `/api/analytics/batch` (external BI forwarding)
- **Health Check**: `/api/health` (monitoring endpoints)

## Server Action vs API Route Decision Matrix

| Operation Type | Routing | Rationale |
|----------------|---------|-----------|
| Course Enrollment | Server Action | User-initiated, requires session, benefits from RSC integration |
| Lesson Progress Update | Server Action | Frequent operation, optimistic UI, session-based |
| Certificate Issuance | Server Action | Transactional, user-scoped, immediate UI feedback |
| Subscription Management | Server Action | User-initiated, session-based, immediate state updates |
| Profile Updates | Server Action | Session-based, form validation, immediate feedback |
| Stripe Webhooks | API Route | External system, no session, requires stable endpoint |
| OG Image Generation | API Route | External embedding, cacheable, no session |
| Analytics Forwarding | API Route | Batch processing, external integration, no UI |

## Idempotency Strategies

### Enrollment Operations
- **Key**: `(userId, courseId)`
- **Method**: Upsert with `enrolledAt` preservation
- **Conflict Resolution**: Ignore duplicate enrollments

### Progress Updates
- **Key**: `(userId, lessonId)`
- **Method**: Upsert with watch time accumulation
- **Conflict Resolution**: Merge completion state and max watch time

### Certificate Issuance
- **Key**: `(userId, courseId)`
- **Method**: Conditional insert with completion verification
- **Conflict Resolution**: Return existing certificate if already issued

### Subscription Changes
- **Key**: `stripeSubscriptionId`
- **Method**: Upsert with status transition validation
- **Conflict Resolution**: Latest timestamp wins for status updates

## Validation Schemas

### Input Validation (Zod)
All server actions implement entry-point validation:
```typescript
const EnrollCourseSchema = z.object({
  courseId: z.string().cuid(),
  metadata: z.record(z.unknown()).optional()
})
```

### Output Contracts
Standardized response format:
```typescript
type ActionResult<T> = {
  success: boolean
  data?: T
  error?: string
  code?: string
}
```

## Error Handling Standards

### Client Errors (4xx)
- `INVALID_INPUT`: Zod validation failures
- `UNAUTHORIZED`: Session or permission issues
- `NOT_FOUND`: Resource unavailable
- `CONFLICT`: Business rule violations

### Server Errors (5xx)
- `DATABASE_ERROR`: Persistence failures
- `EXTERNAL_SERVICE_ERROR`: Stripe/webhook issues
- `INTERNAL_ERROR`: Unexpected system failures

## Migration Roadmap

### Phase 1: Core Mutations → Server Actions
1. Course enrollment (`/api/courses/enroll` → `enrollCourse`)
2. Lesson progress (`/api/lesson/progress` → `updateLessonProgress`)
3. Certificate requests (`/api/certificates` → `issueCertificate`)
4. Subscription management (`/api/stripe/manage` → `cancelSubscription`)

### Phase 2: Route Cleanup
1. Remove deprecated API handlers
2. Update client call sites
3. Remove unused middleware/validation
4. Update test suites

### Phase 3: External Integration Preservation
1. Validate webhook endpoints remain stable
2. Ensure OG image generation unaffected
3. Verify analytics batch processing continues
4. Maintain health check availability

## Testing Strategy

### Contract Tests
- Input validation edge cases
- Idempotency verification
- Error condition handling
- Response format compliance

### Integration Tests
- End-to-end user flows
- Cross-action dependencies
- External service integration
- Performance under load

### Migration Tests
- Old vs new behavior equivalence
- Backward compatibility verification
- Rollback scenario validation