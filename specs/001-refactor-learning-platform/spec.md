# Feature Specification: Learning Platform Core Refactor & Monetization Alignment

**Feature Branch**: `001-refactor-learning-platform`  
**Created**: 2025-09-30  
**Status**: Draft  
**Input**: User description captured during feature initiation (refactor core learning platform: access, enrollment, monetization, subscription, lifetime purchases, refunds, analytics, dashboard coherence, server‑action migration).

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies  
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a developer learner, I browse available courses, enroll (free or premium/purchased), track progress across lessons, earn certificates upon completion, and manage my subscription or one‑time purchases—retaining lifetime access to purchased courses regardless of subscription status.

### Supporting User Stories
1. As a first‑time visitor I can view course catalog, see which courses are free vs premium, and preview (limited) a premium course’s first lesson (if preview enabled) without enrollment.
2. As a registered free user I can enroll in any free course and begin tracking progress immediately after enrollment.
3. As a premium subscriber I can enroll in any course (free or premium) and all enrolled courses appear in my dashboard with progress metrics.
4. As a user who purchased an individual premium course I retain lifetime access—even after later subscribing then canceling the subscription.
5. As a user canceling my subscription within 15 days I am eligible for a refund (if within legal/defined policy window); after day 15 and before day 30 I can still cancel but not receive a refund.
6. As a user whose subscription just canceled I immediately lose premium‑only access except for individually purchased premium courses and all free courses (if enrolled or enrollable).
7. As a learner I see accurate progress percentages, last lesson resume CTA, and certificate availability upon 100% completion.
8. As an admin I can view aggregated analytics (enrollments, subscription conversions, refund rates, lesson completion funnel, revenue) without raw PII exposure.
9. As a returning user I can quickly pick up where I left off (resume banner) on a course page.
10. As a user I can toggle subscription billing cycle (monthly/yearly) and see proration or effective next billing date.

### Acceptance Scenarios
1. **Given** a free user not enrolled in a free course, **When** they click “S’inscrire”, **Then** an enrollment record is created and course appears in dashboard/my-courses with 0% progress.
2. **Given** a premium subscriber not enrolled in a premium course, **When** they enroll, **Then** course appears in dashboard and premium lessons are fully accessible.
3. **Given** a user with an active subscription who purchases a single premium course one‑time, **When** subscription later cancels, **Then** that purchased course remains accessible and other premium courses become locked.
4. **Given** a new subscription started today (day 0), **When** user cancels on day 10, **Then** refund is marked eligible and access is immediately revoked (except lifetime/free) and refund audit logged.
5. **Given** a subscription started and canceled on day 20, **When** dashboard loads, **Then** plan status shows canceled/no refund eligibility and premium content is locked (unless lifetime purchased) with upgrade CTA.
6. **Given** a user completes final lesson of a course, **When** progress hits 100%, **Then** certificate is generated (idempotent issuance) and accessible under Certificates dashboard tab.
7. **Given** an enrollment exists with partial completion, **When** user resumes course page, **Then** a resume banner offers direct link to next uncompleted lesson.
8. **Given** a user attempts to access a premium lesson after subscription cancel without lifetime purchase, **When** they navigate to the lesson URL, **Then** they are redirected (or shown overlay) prompting subscription upgrade with context preserved.
9. **Given** admin requests analytics dashboard, **When** loaded, **Then** metrics show counts aggregated without exposing raw user emails (only anonymized IDs or counts).
10. **Given** a checkout session completes (webhook), **When** processing finishes, **Then** subscription/payment/enrollment state is consistent and idempotent if retried.

### Edge Cases
- User enrolls twice rapidly (double click) → second enrollment ignored (idempotent uniqueness).
- Webhook retried after timeout → upsert logic avoids duplicate payments/enrollments.
- Subscription downgraded then upgraded within same billing period → latest price & cycle reflected; historical audit persists.
- Refund requested after eligibility window (day 16) → flagged as ineligible, no refund record created, analytics event logged.
- Course unpublished after user enrollment → remains fully accessible to already enrolled users; removed from public catalog & discovery; still listed in their dashboard.
- Lesson order changes post enrollment → progress recalculates safely; no orphan lesson references.
*Ambiguities to Clarify (retain until resolved):*
- **AMB-002**: Whether refund eligibility window counts calendar days vs exact timestamps (clarify precision: to-the-second or date-based rounding).
- **AMB-003**: Whether preview should be disabled once user has attempted >X minutes of watch time (anti-abuse) – currently not required.
**FR-040**: System MUST log (structured) every transition: subscription status change, refund decision, enrollment creation, certificate issuance.
**FR-041**: When a course is unpublished it MUST: (a) be hidden from catalog/search/new enrollments, (b) remain fully accessible (all lessons, progress, certificate) to already enrolled users, and (c) continue appearing in their dashboard/my-courses.
- Real-time collaborative coding sessions (future enhancement).
## Clarifications

### Session 2025-09-30
- Q: What is the exact policy for a course that becomes unpublished after users have already enrolled? → A: Remains fully accessible to enrolled users; hidden from public catalog; still listed in their dashboard.
- Community Q&A moderation workflow details (placeholder only).
- Gamification badges beyond completion certificates.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: The system MUST require explicit enrollment for every course (free, premium, lifetime purchased) before tracking progress.
- **FR-002**: The system MUST persist enrollment records (userId, courseId, enrolledAt unique composite) and surface enrolled courses in dashboard and my-courses.
- **FR-003**: The access service MUST determine access using enrollment + (subscription active OR lifetime purchase) + course tier.
- **FR-004**: Lifetime purchased courses MUST remain accessible post subscription cancellation.
- **FR-005**: Premium subscription cancellation MUST immediately revoke premium-only course access (excluding lifetime purchases & free).
- **FR-006**: Refund eligibility logic MUST mark subscriptions canceled before (subscriptionStartTimestamp + 15 * 24h) as refundable; cancellations at or after that exact boundary (>= subscriptionStartTimestamp + 15 * 24h) are not refundable.
- **FR-007**: Refund decisions MUST be logged in an audit entity with userId, subscriptionId/paymentId, decision, timestamp.
- **FR-008**: System MUST support monthly and yearly billing cycles with semantic representation (no raw price IDs in client views).
- **FR-009**: Course purchase (one-time) success MUST automatically enroll the user (idempotent) if course is published.
- **FR-010**: Subscription start webhook MUST upsert subscription with currentPeriodStart/End, status, priceId, billingCycle classification.
- **FR-011**: Progress toggling MUST upsert a per lesson per user record including completed flag, timestamps, and watch time.
- **FR-012**: System MUST compute course completion percentage dynamically based on published lessons.
- **FR-013**: Certificate issuance MUST trigger exactly once per (user, course) upon 100% completion and store immutable issuedAt.
- **FR-014**: Dashboard MUST display: active plan status, cycle (monthly/yearly), renewal/cancel state, enrolled courses (progress%), recently completed, certificates.
- **FR-015**: Premium-only content gating MUST provide upgrade CTAs and preserve intended redirect after successful activation.
- **FR-016**: System MUST expose a progress summary endpoint/server action with ETag or hash to enable adaptive polling (already partially implemented—must remain).
- **FR-017**: Analytics MUST record events: COURSE_ENROLLMENT_EXPLICIT, COURSE_PURCHASED, SUBSCRIPTION_STARTED, SUBSCRIPTION_PLAN_SWITCHED, SUBSCRIPTION_PAYMENT_FAILED, SUBSCRIPTION_CANCELED, LESSON_COMPLETED, CERTIFICATE_ISSUED, REFUND_DECISION (eligible/ineligible), PREVIEW_VIEWED.
- **FR-018**: All mutation flows (enroll, toggle progress, request certificate generation, subscription manage/cancel, refund request) SHOULD be server actions unless external webhook.
- **FR-019**: API routes MUST be reduced to those requiring edge exposure or external integration (webhooks, og image, analytics batch) – others migrated to server actions.
- **FR-020**: Access checks MUST be idempotent and side‑effect free (no silent enrollment creation during checks).
- **FR-021**: UI MUST differentiate: Free (not enrolled), Enrolled, Locked Premium, Premium Enrolled, Lifetime Purchased (badge).
- **FR-022**: System MUST allow preview of first lesson in a premium course if previewEnabled and user not enrolled (read-only, no progress tracked until enroll).
- **FR-023**: Subscription switch (monthly↔yearly) MUST create proration audit entry when Stripe returns upcoming invoice.
- **FR-024**: All monetary values stored in Decimal and exposed to UI as major currency units (EUR) without floating point drift.
- **FR-025**: Stripe webhook handling MUST be idempotent under retries (no duplicate payments, subscriptions, enrollments, certificates).
- **FR-026**: Personal data in analytics events MUST exclude raw emails (use userId only).
- **FR-027**: Lesson navigation MUST provide next/previous pointers filtered by published lessons and user access rights.
- **FR-028**: System MUST visually flag refund eligibility status on billing page when cancellation occurs within window.
- **FR-029**: Purchased course card MUST render lifetime badge even if user currently also has active subscription.
- **FR-030**: Admin analytics MUST aggregate: total enrollments, active subscriptions, MRR (approx), churn count (cancellations last 30d), completion rate per course, refund rate.
- **FR-031**: Recommendation section MUST log impression and click events for suggested courses.
- **FR-032**: All forms with user input MUST perform server-side Zod validation before mutation commit.
- **FR-033**: Access after subscription cancellation MUST reflect instantly (no stale cache beyond acceptable revalidation window <60s) for protected premium content.
- **FR-034**: System MUST allow re-subscription seamlessly preserving historical lifetime purchases and progress.
- **FR-035**: My Courses page MUST group or visually distinguish (optional tag) lifetime purchased vs subscription-based enrollments.
- **FR-036**: Error states (course not found, unauthorized, payment failed) MUST show branded error boundaries rather than generic stack traces.
- **FR-037**: Filtering courses by category/level MUST not expose unpublished courses.
- **FR-038**: Certificate pages MUST be accessible only to certificate owner and admin roles.
- **FR-039**: Admin sections MUST be gated by role=ADMIN; unauthorized access redirected to /unauthorized.
- **FR-040**: System MUST log (structured) every transition: subscription status change, refund decision, enrollment creation, certificate issuance.
- **FR-041**: When a course is unpublished it MUST: (a) be hidden from catalog/search/new enrollments, (b) remain fully accessible (all lessons, progress, certificate) to already enrolled users, and (c) continue appearing in their dashboard/my-courses.

*Ambiguities to Clarify (retain until resolved):*
- **AMB-003**: Whether preview should be disabled once user has attempted >X minutes of watch time (anti-abuse) – currently not required.

### Key Entities *(include if feature involves data)*
- **User**: Learner identity, roles (STUDENT, ADMIN). Links to subscriptions, enrollments, progress, certificates, payments.
- **Course**: Teachable unit with tier (FREE/PREMIUM), previewEnabled, price (optional for premium purchase), published flag.
- **Lesson**: Ordered unit within course, duration, published flag.
- **Enrollment**: (userId, courseId, enrolledAt) – explicit membership enabling progress tracking & dashboard listing.
- **Subscription**: Stripe-backed recurring entitlement (status, cycle via priceId). Only one active PREMIUM per user.
- **Payment**: Records course purchases and subscription payments (amount, currency, kind, status).
- **InvoiceAudit**: Audit log for prorations, refunds, refund decisions.
- **Progress**: Per (user, lesson) state (completed, watchTime, completedAt).
- **Certificate**: Achievement once course completion = 100%.
- **AnalyticsEvent**: Append-only event log capturing interaction taxonomy.
- **Recommendation Surface (Future)**: Non-persistent ephemeral or cached suggestions linking user → candidate courses.

### Derived / Computed Concepts
- **Completion %**: completedLessons / totalPublishedLessons * 100 (floored or rounded) re-computed on demand.
- **Refund Eligibility**: cancellationTimestamp < (subscriptionPeriodStartAnchor + 15 * 24h) using Stripe subscription current_period_start as anchor (exact timestamp arithmetic, no calendar rounding).
- **Access Determination**: Enrollment present AND (course tier = FREE OR lifetime purchase OR active subscription for premium tier).

### Non-Functional Requirements (Selected)
- P95 lesson page server response < 400ms (excluding video CDN load).
- Webhook processing < 3s worst case (non-blocking email sending where needed).
- Error budgets: <1% failed progress updates over rolling 24h.

<!-- Key Entities detailed above -->

## Clarifications

### Session 2025-09-30
- Q: What is the exact policy for a course that becomes unpublished after users have already enrolled? → A: Remains fully accessible to enrolled users; hidden from public catalog; still listed in their dashboard.
- Q: How is the 15‑day refund eligibility window measured? → A: Stripe billing period anchor + 15 * 24h (exact timestamp boundary).

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [ ] No implementation details (languages, frameworks, APIs)
- [ ] Focused on user value and business needs
- [ ] Written for non-technical stakeholders
- [ ] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous  
- [ ] Success criteria are measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [ ] User description parsed
- [ ] Key concepts extracted
- [ ] Ambiguities marked
- [ ] User scenarios defined
- [ ] Requirements generated
- [ ] Entities identified
- [ ] Review checklist passed

---
