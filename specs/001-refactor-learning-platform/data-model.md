# Data Model: Learning Platform Core Refactor & Monetization Alignment

**Feature**: `001-refactor-learning-platform`  
**Created**: 2025-09-30  
**Status**: Complete  

## Entity Overview
This document defines the complete data model supporting the refactored learning platform with explicit enrollment, monetization alignment, and centralized access control.

## Core Entities

### User
**Purpose**: Identity and role management (unchanged from better-auth requirements)
**Fields**:
- `id`: String (CUID) - Primary key
- `name`: String - Display name
- `email`: String (unique) - Login identifier
- `emailVerified`: Boolean - Verification status
- `image`: String? - Profile picture URL
- `role`: Enum(STUDENT, INSTRUCTOR, ADMIN) - Authorization level
- `createdAt`, `updatedAt`: DateTime - Audit timestamps

**Relationships**:
- → Subscription (1:0..1) - Current subscription
- → Enrollment[] (1:many) - Course enrollments
- → Progress[] (1:many) - Lesson progress records
- → Certificate[] (1:many) - Earned certificates
- → Payment[] (1:many) - Purchase history
- → AnalyticsEvent[] (1:many) - Behavioral events

**Constraints**: Email uniqueness enforced at DB level

### Course
**Purpose**: Teachable content unit with access tier and monetization settings
**Fields**:
- `id`: String (CUID) - Primary key
- `title`: String - Display name
- `slug`: String (unique) - URL identifier
- `description`: String - Course summary
- `thumbnail`: String? - Cover image URL
- `price`: Decimal? - One-time purchase price (null for free courses)
- `category`: Enum(JAVASCRIPT, TYPESCRIPT, FRONTEND, BACKEND, FULLSTACK, CLOUD, AI, DEVOPS, PRODUCTIVITY)
- `level`: Enum(BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
- `published`: Boolean - Visibility flag
- `featured`: Boolean - Homepage promotion flag
- `accessTier`: Enum(FREE, PREMIUM) - Subscription requirement
- `previewEnabled`: Boolean - First lesson preview allowed
- `duration`: Int? - Total estimated minutes
- `createdAt`, `updatedAt`: DateTime - Audit timestamps

**Relationships**:
- → Lesson[] (1:many) - Course content
- → Enrollment[] (1:many) - Student enrollments
- → Payment[] (1:many) - Purchase records

**Constraints**: Slug uniqueness enforced at DB level

### Lesson
**Purpose**: Individual learning unit within course
**Fields**:
- `id`: String (CUID) - Primary key
- `courseId`: String - Foreign key to Course
- `title`: String - Display name
- `slug`: String - Course-scoped identifier
- `description`: String? - Lesson summary
- `content`: String? - MDX content
- `videoUrl`: String? - Video resource
- `duration`: Int? - Estimated seconds
- `order`: Int - Sequence position
- `published`: Boolean - Availability flag
- `createdAt`, `updatedAt`: DateTime - Audit timestamps

**Relationships**:
- Course ← (many:1) - Parent course
- → Progress[] (1:many) - Student progress

**Constraints**: 
- Composite unique (courseId, slug)
- Order uniqueness within course

### Enrollment
**Purpose**: Explicit student-course membership enabling progress tracking
**Fields**:
- `id`: String (CUID) - Primary key
- `userId`: String - Foreign key to User
- `courseId`: String - Foreign key to Course
- `enrolledAt`: DateTime - Registration timestamp
- `createdAt`, `updatedAt`: DateTime - Audit timestamps

**Relationships**:
- User ← (many:1) - Enrolled student
- Course ← (many:1) - Target course

**Constraints**: 
- Composite unique (userId, courseId) - One enrollment per user per course
- Required for all progress tracking (FR-001)

### Subscription
**Purpose**: Recurring billing relationship with Stripe
**Fields**:
- `id`: String (CUID) - Primary key
- `userId`: String (unique) - Foreign key to User
- `stripeCustomerId`: String? - Stripe customer reference
- `stripeSubscriptionId`: String? - Stripe subscription reference
- `status`: Enum(ACTIVE, CANCELED, PAST_DUE, INCOMPLETE, TRIALING) - Current state
- `plan`: Enum(FREE, PREMIUM) - Subscription tier
- `priceId`: String? - Stripe price reference
- `currentPeriodStart`: DateTime? - Billing period start
- `currentPeriodEnd`: DateTime? - Billing period end
- `cancelAtPeriodEnd`: Boolean - Cancellation flag
- `createdAt`, `updatedAt`: DateTime - Audit timestamps

**Relationships**:
- User ← (1:1) - Subscriber

**Constraints**: 
- Unique userId (one subscription per user)
- Required for premium access determination

### Payment
**Purpose**: Financial transaction record (purchases + subscription payments)
**Fields**:
- `id`: String (CUID) - Primary key
- `userId`: String - Foreign key to User
- `courseId`: String? - Foreign key to Course (for one-time purchases)
- `stripePaymentIntentId`: String? - Stripe payment reference
- `amount`: Decimal - Transaction amount
- `currency`: String - Currency code (EUR)
- `status`: Enum(PENDING, COMPLETED, FAILED, REFUNDED) - Payment state
- `kind`: Enum(COURSE, SUBSCRIPTION, REFUND) - Transaction type
- `createdAt`, `updatedAt`: DateTime - Audit timestamps

**Relationships**:
- User ← (many:1) - Payer
- Course ← (many:1) - Purchased course (nullable)

**Constraints**: 
- Amount stored as Decimal to prevent floating point drift
- Required for lifetime access determination

### Progress
**Purpose**: Lesson completion tracking per student
**Fields**:
- `id`: String (CUID) - Primary key
- `userId`: String - Foreign key to User
- `lessonId`: String - Foreign key to Lesson
- `completed`: Boolean - Completion flag
- `watchTime`: Int - Seconds watched
- `completedAt`: DateTime? - Completion timestamp
- `createdAt`, `updatedAt`: DateTime - Audit timestamps

**Relationships**:
- User ← (many:1) - Student
- Lesson ← (many:1) - Target lesson

**Constraints**: 
- Composite unique (userId, lessonId) - One progress record per user per lesson
- Upsert semantics for idempotent updates

### Certificate
**Purpose**: Course completion achievement
**Fields**:
- `id`: String (CUID) - Primary key
- `userId`: String - Foreign key to User
- `courseId`: String - Foreign key to Course
- `issuedAt`: DateTime - Achievement timestamp
- `createdAt`, `updatedAt`: DateTime - Audit timestamps

**Relationships**:
- User ← (many:1) - Certificate holder
- Course ← (many:1) - Completed course

**Constraints**: 
- Composite unique (userId, courseId) - One certificate per user per course
- Immutable once issued (idempotent issuance)

### InvoiceAudit
**Purpose**: Financial event audit trail (prorations, refunds)
**Fields**:
- `id`: String (CUID) - Primary key
- `userId`: String - Foreign key to User
- `subscriptionId`: String? - Related subscription
- `paymentId`: String? - Related payment
- `type`: Enum(PRORATION, REFUND_ELIGIBLE, REFUND_INELIGIBLE, PLAN_SWITCH) - Event type
- `amount`: Decimal? - Financial impact
- `currency`: String? - Currency code
- `metadata`: Json - Additional context
- `createdAt`: DateTime - Event timestamp

**Relationships**:
- User ← (many:1) - Affected user

**Constraints**: 
- Append-only audit log
- Required for refund eligibility tracking

### AnalyticsEvent
**Purpose**: Behavioral event tracking for BI/optimization
**Fields**:
- `id`: String (CUID) - Primary key
- `userId`: String? - Foreign key to User (nullable for anonymous)
- `type`: String - Event classification
- `properties`: Json - Event-specific data
- `createdAt`: DateTime - Event timestamp

**Relationships**:
- User ← (many:1) - Event actor (optional)

**Constraints**: 
- Append-only event log
- No PII in properties field
- Index on (type, createdAt) for query performance

## State Transitions

### Subscription Lifecycle
```
FREE → PREMIUM (subscription start)
PREMIUM → CANCELED (user cancellation)
CANCELED → PREMIUM (re-subscription)
ACTIVE ↔ PAST_DUE (payment failures)
```

### Course Access States
```
NOT_ENROLLED → ENROLLED (explicit enrollment)
ENROLLED + FREE_TIER → FULL_ACCESS
ENROLLED + PREMIUM_TIER + (ACTIVE_SUB || LIFETIME_PURCHASE) → FULL_ACCESS
ENROLLED + PREMIUM_TIER + (!ACTIVE_SUB && !LIFETIME_PURCHASE) → LOCKED
```

### Refund Eligibility
```
SUBSCRIPTION_START → ELIGIBLE (< 15 * 24h)
SUBSCRIPTION_START → INELIGIBLE (>= 15 * 24h)
```

## Database Indexes

### Performance Indexes
- `Enrollment(userId, courseId)` - Access checks
- `Progress(userId, lessonId)` - Progress queries
- `Certificate(userId, courseId)` - Achievement lookups
- `AnalyticsEvent(type, createdAt)` - Event analysis
- `Subscription(userId)` - Entitlement checks
- `Payment(userId, kind, status)` - Financial queries

### Composite Constraints
- `Enrollment(userId, courseId)` - Unique enrollment
- `Progress(userId, lessonId)` - Unique progress
- `Certificate(userId, courseId)` - Unique certificate
- `Subscription(userId)` - Single subscription per user

## Integration Points

### External Systems
- **Stripe**: Payment processing, subscription management
- **Better-Auth**: User authentication (User, Session, Account, Verification)
- **Analytics**: Event forwarding to external BI systems

### Access Determination Logic
```typescript
function determineAccess(enrollment: Enrollment, course: Course, subscription: Subscription?, payments: Payment[]): AccessResult {
  if (!enrollment) return { allowed: false, reason: 'NOT_ENROLLED' }
  if (course.accessTier === 'FREE') return { allowed: true, reason: 'FREE_COURSE' }
  if (hasLifetimePurchase(payments, course.id)) return { allowed: true, reason: 'LIFETIME_PURCHASE' }
  if (subscription?.status === 'ACTIVE') return { allowed: true, reason: 'ACTIVE_SUBSCRIPTION' }
  return { allowed: false, reason: 'PREMIUM_LOCKED' }
}
```