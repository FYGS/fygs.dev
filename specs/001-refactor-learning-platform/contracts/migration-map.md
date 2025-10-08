# Server Action Migration Map

**Document Purpose**: Map existing API routes to new server actions with idempotency strategies and implementation notes.

**Migration Context**: Moving from API routes to server actions for improved type safety, better integration with React Server Components, and simplified client-side state management.

## Migration Strategy

### Core Principles
1. **Type Safety First**: All server actions use Zod validation schemas
2. **Idempotency by Design**: All mutations handle duplicate calls gracefully
3. **Progressive Enhancement**: Server actions work without JavaScript
4. **Error Boundary Integration**: Standardized error handling with branded boundaries

### Retention Policy
- **Keep as API Routes**: Webhooks, OG image generation, analytics batch endpoints, external integrations
- **Migrate to Server Actions**: User-initiated mutations (enroll, progress, subscription management, profile updates)

## Migration Map

| Legacy API Route | New Server Action Path | Idempotency Strategy | Priority | Status |
|------------------|------------------------|---------------------|----------|---------|
| `POST /api/enroll` | `app/(dashboard)/actions/enrollCourse.ts` | Composite unique constraint (userId, courseId) | P0 | ✅ |
| `POST /api/progress` | `app/(dashboard)/actions/updateLessonProgress.ts` | Upsert on (userId, lessonId) with watch time accumulation | P0 | ✅ |
| `POST /api/subscription/cancel` | `app/(dashboard)/actions/cancelSubscription.ts` | Status check before update, audit logging | P0 | ✅ |
| `POST /api/certificate/issue` | `app/(dashboard)/actions/issueCertificate.ts` | Composite unique constraint (userId, courseId) | P0 | ✅ |
| `PUT /api/profile` | `app/(dashboard)/actions/updateProfile.ts` | Optimistic updates with revalidation | P1 | Pending |
| `POST /api/subscription/reactivate` | `app/(dashboard)/actions/reactivateSubscription.ts` | Status transition validation | P1 | Pending |

## Detailed Migration Specifications

### T040 - Course Enrollment Action

**Legacy Route**: `POST /api/enroll`
**New Action**: `app/(dashboard)/actions/enrollCourse.ts`

**Input Schema**:
```typescript
const enrollCourseSchema = z.object({
  courseId: z.string().cuid(),
  source: z.enum(['direct', 'recommendation', 'search']).optional()
})
```

**Idempotency Strategy**:
- Composite unique constraint on `(userId, courseId)` in Enrollment table
- If enrollment exists, return existing record (no error)
- Include analytics source tracking for new enrollments only

**Success Response**:
```typescript
type EnrollmentResult = {
  success: true
  enrollment: {
    id: string
    courseId: string
    enrolledAt: Date
    isNew: boolean // true if just created, false if already existed
  }
}
```

**Error Handling**:
- Course not found → redirect to /formations
- Course unpublished and user not enrolled → redirect to /formations  
- Course requires premium access → redirect to /pricing
- Database errors → generic error boundary

### T041 - Lesson Progress Action

**Legacy Route**: `POST /api/progress`
**New Action**: `app/(dashboard)/actions/updateLessonProgress.ts`

**Input Schema**:
```typescript
const updateProgressSchema = z.object({
  lessonId: z.string().cuid(),
  completed: z.boolean().optional(),
  watchTimeDelta: z.number().int().min(0).max(7200).optional(), // Max 2 hours
  currentPosition: z.number().min(0).optional() // Video position in seconds
})
```

**Idempotency Strategy**:
- Upsert on composite key `(userId, lessonId)`
- Watch time accumulation: `newWatchTime = max(existing, existing + delta)`
- Completion state can transition: false → true → false (for retesting)
- Preserve original `completedAt` timestamp on re-completion

**Success Response**:
```typescript
type ProgressResult = {
  success: true
  progress: {
    lessonId: string
    completed: boolean
    watchTime: number
    completedAt: Date | null
    courseProgressPercentage: number
  }
}
```

### T042 - Subscription Cancellation Action

**Legacy Route**: `POST /api/subscription/cancel`
**New Action**: `app/(dashboard)/actions/cancelSubscription.ts`

**Input Schema**:
```typescript
const cancelSubscriptionSchema = z.object({
  reason: z.enum(['too_expensive', 'not_using', 'missing_features', 'other']).optional(),
  feedback: z.string().max(500).optional()
})
```

**Idempotency Strategy**:
- Check current status before update
- If already cancelled, return existing cancellation details
- Calculate refund eligibility at cancellation time (immutable after)
- Generate audit trail entry

**Success Response**:
```typescript
type CancellationResult = {
  success: true
  subscription: {
    id: string
    status: 'canceled'
    canceledAt: Date
    currentPeriodEnd: Date
    refundEligible: boolean
    refundAmount: number // in cents
  }
}
```

### T043 - Certificate Issuance Action

**Legacy Route**: `POST /api/certificate/issue`
**New Action**: `app/(dashboard)/actions/issueCertificate.ts`

**Input Schema**:
```typescript
const issueCertificateSchema = z.object({
  courseId: z.string().cuid()
})
```

**Idempotency Strategy**:
- Composite unique constraint on `(userId, courseId)` in Certificate table
- Verify 100% course completion before issuance
- If certificate exists, return existing record
- Generate PDF asynchronously (background job)

**Success Response**:
```typescript
type CertificateResult = {
  success: true
  certificate: {
    id: string
    courseId: string
    issuedAt: Date
    downloadUrl: string
    verificationCode: string
    isNew: boolean
  }
}
```

## Implementation Guidelines

### Error Handling Patterns

**Validation Errors**:
```typescript
import { z } from 'zod'

try {
  const validatedData = schema.parse(formData)
} catch (error) {
  if (error instanceof z.ZodError) {
    return {
      success: false,
      error: 'validation_failed',
      issues: error.issues
    }
  }
}
```

**Access Control Errors**:
```typescript
const access = await evaluateCourseAccess(context)
if (!access.allowed) {
  return {
    success: false,
    error: 'access_denied',
    reason: access.reason,
    upgradeRequired: access.source === 'premium_required'
  }
}
```

**Database Errors**:
```typescript
try {
  const result = await db.enrollment.create({ data })
} catch (error) {
  if (error.code === 'P2002') {
    // Unique constraint violation - likely idempotent retry
    const existing = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    })
    return { success: true, enrollment: existing, isNew: false }
  }
  throw error // Let error boundary handle unexpected errors
}
```

### Revalidation Strategy

**Path Revalidation**:
```typescript
import { revalidatePath } from 'next/cache'

// After successful enrollment
revalidatePath('/dashboard/my-courses')
revalidatePath(`/formations/${course.slug}`)

// After progress update
revalidatePath(`/formations/${course.slug}/lessons/${lesson.slug}`)
revalidatePath('/dashboard')

// After subscription changes
revalidatePath('/dashboard/billing')
revalidatePath('/dashboard/my-courses')
```

**Tag-Based Revalidation**:
```typescript
import { revalidateTag } from 'next/cache'

// After user profile changes
revalidateTag(`user-${userId}`)

// After course content changes (admin actions)
revalidateTag(`course-${courseId}`)
```

## Testing Strategy

### Contract Tests
Each server action has comprehensive contract tests covering:
- Input validation (valid/invalid schemas)
- Access control enforcement
- Idempotency behavior
- Database constraint handling
- Error response formats

### Integration Tests
End-to-end user flows validating:
- Form submission → server action → UI update
- Optimistic UI updates → server confirmation
- Error handling → user feedback
- Route transitions → proper revalidation

### Performance Tests
Load testing for critical actions:
- Enrollment spikes during course launches
- Progress updates during video playback
- Concurrent certificate generation

## Migration Timeline

### Phase 1: Core Actions (T040-T043) ✅
- Enrollment, progress, cancellation, certificate issuance
- Replace high-traffic user-initiated mutations
- Maintain API route compatibility during transition

### Phase 2: Profile & Subscription Management (T050+)
- Profile updates, subscription reactivation
- Advanced subscription management features
- Plan switching and proration handling

### Phase 3: Admin Actions (Future)
- Course content management
- User management operations
- Analytics and reporting actions

## Legacy API Route Retirement

### Deprecation Strategy
1. **Dual Support Period**: Keep both API routes and server actions for 1 release cycle
2. **Client Migration**: Update all frontend components to use server actions
3. **Monitoring**: Track API route usage to ensure zero traffic before removal
4. **Final Cleanup**: Remove API route handlers and update documentation

### Breaking Changes Log
Document in CHANGELOG.md:
- API routes removed in favor of server actions
- Response format changes (success/error structure)
- Client-side error handling updates required
- Form submission pattern changes

---

**Last Updated**: September 30, 2025
**Implementation Status**: Core actions complete, profile/subscription pending
**Next Review**: Post T050-series completion