# Tasks: Learning Platform Core Refactor & Monetization Alignment

**Feature Directory**: `specs/001-refactor-learning-platform`
**Plan Source**: `plan.md`
**Spec Source**: `spec.md`
**Status**: Draft (Generated 2025-09-30)

## Generation Context
Design artifacts currently available:
- plan.md (constitution check + technical context)
- spec.md (FR-001..FR-041, user stories, entities)
- Missing (to be produced during implementation flow but referenced here for TDD ordering): research.md, data-model.md, contracts/, quickstart.md

Because Phase 0 & 1 design artifacts are not yet materialized, this task list bootstraps both design and implementation in a constitution-compliant sequence while preserving TDD (tests before logic) and explicit parallelization markers [P]. Once data-model and contracts are created, subsequent tasks referencing them will update or extend rather than recreate.

Legend:
- [P] Task can run in parallel (independent files / low contention)
- Dependency notes show prerequisites (upstream task IDs)
- Contract tests precede implementation for each migration endpoint

---
## Task List

### T000-Series: Baseline & Design Materialization
1. T001 - ✅ Create `specs/001-refactor-learning-platform/research.md` documenting: decisions for access centralization, refund window logic (anchor + 15*24h), unpublished course policy (FR-041), deferred AMB-003 rationale. Output sections: Decisions, Rationale, Alternatives. [Dependency: plan.md]
2. T002 - ✅ Create `specs/001-refactor-learning-platform/data-model.md` enumerating entities (User, Course, Lesson, Enrollment, Subscription, Payment, InvoiceAudit, Progress, Certificate, AnalyticsEvent) with fields, indexes, unique constraints, and state transition notes (subscription status, refund eligibility). [Depends: T001]
3. T003 - ✅ Create `specs/001-refactor-learning-platform/contracts/README.md` outlining contract naming conventions + server action vs API route boundary rules (webhooks, og images, analytics batch remain API). [Depends: T001]
4. T004 - Create `specs/001-refactor-learning-platform/quickstart.md` mapping each user story to a minimal integration test script (narrative, preconditions, expected outcomes). [Depends: T002] ✅
5. T005 - Update agent context by running required update script to include new tech facts (no manual file edits here—script execution). [Depends: T004]

### T010-Series: Access & Entitlement Contract Tests First
6. T010 [P] - Add contract test `tests/contract/access/enrollment-access-matrix.test.ts` covering matrix: (enrolled vs not) x (free vs premium) x (subscription active vs canceled) x (lifetime purchase) validating expected allow/deny results using placeholder stubs. ✅
7. T011 [P] - Add contract test `tests/contract/access/unpublished-course-access.test.ts` verifying FR-041: enrolled user retains access, non-enrolled cannot discover/hit list endpoint. ✅
8. T012 [P] - Add contract test `tests/contract/access/refund-eligibility.test.ts` asserting window boundary (<= exactly 15*24h eligible, > boundary not). Include edge at boundary millisecond. ✅
9. T013 [P] - Add contract test `tests/contract/access/certificate-issuance-idempotency.test.ts` ensuring second issuance attempt no duplicate record. ✅
- [x] T014 - Progress Upsert Idempotency: Tests for lesson progress updates, ensuring watch time accumulation and completion states are handled correctly

### T020-Series: Server Action Migration Design & Tests
11. T020 - Inventory existing mutation API routes (enroll, lesson progress, certificates issuance, subscription manage/cancel, profile update) and document planned server action replacements in `specs/001-refactor-learning-platform/contracts/migration-map.md` with columns: route, new action path, idempotency keying method. [Depends: T003] ✅
12. T021 [P] - Add failing test `tests/contract/actions/enroll.server-action.test.ts` (expected validation, idempotent re-call). ✅
13. T022 [P] - Add failing test `tests/contract/actions/progress.server-action.test.ts` (upsert semantics, ETag/hash alignment if applicable). ✅
14. T023 [P] - Add failing test `tests/contract/actions/cancel-subscription.server-action.test.ts` (refund eligibility flag logic, analytics emission stubbed). ✅
15. T024 [P] - Add failing test `tests/contract/actions/certificate.server-action.test.ts` (issue-on-100% only, no re-issue). ✅

### T030-Series: Data Layer Enhancements (After Tests Exist)
16. T030 - ✅ Amend `prisma/schema.prisma` if needed: ensure composite unique constraints for (userId, courseId) Enrollment, (userId, lessonId) Progress, (userId, courseId) Certificate; add index for AnalyticsEvent (type, createdAt). Enhanced Payment model with proper relations and InvoiceAudit with subscription/payment links. [Depends: T010..T015]
17. T031 - Generate & run Prisma migration (if schema changed) and regenerate client. ✅
18. T032 [P] - Implement repository/util additions in `lib/access-service.ts` to expose a pure function `evaluateCourseAccess(context)` returning {allowed, reason, source}. (No UI usage yet). [Depends: T030] ✅
19. T033 [P] - Implement refund eligibility pure util `lib/refund-policy.ts` with function `isRefundEligible(start: Date, cancel: Date): boolean` + boundary tests colocated. [Depends: T030] ✅
20. T034 [P] - Implement certificate issuance service function enforcing single issuance with transactional guard. [Depends: T030] ✅

### T040-Series: Server Action Implementations (Make Tests Pass)
21. T040 - Implement enroll server action `app/(dashboard)/actions/enrollCourse.ts` using Zod validation + access-service integration; update tests (T021) to green. [Depends: T021, T032] ✅
22. T041 - Implement progress server action `app/(dashboard)/actions/updateLessonProgress.ts` (accept lessonId, completed?, watchTimeDelta) honoring idempotent semantics; make T022 pass. [Depends: T022, T032] ✅
23. T042 - Implement cancel subscription server action `app/(dashboard)/actions/cancelSubscription.ts` (sets status, computes refund eligibility, logs analytics); make T023 pass. [Depends: T023, T033] ✅
24. T043 - Implement certificate server action `app/(dashboard)/actions/issueCertificate.ts` verifying completion%; make T024 pass. [Depends: T024, T034] ✅
25. T044 - Remove/retire redundant API routes superseded by server actions (enroll, progress, certificate issuance, subscription manage) and update any frontend callers. [Depends: T040..T043] ✅

### T050-Series: UI Integration & Gating Polish
26. T050 - Update course pages (`app/formations/[slug]/_components/course-enrollment.tsx`) to call enroll server action directly and adjust optimistic states. ✅
27. T051 - Update lesson pages to call progress server action (debounced) and ensure ETag/hash logic retained if used. ✅
28. T052 - Update billing dashboard (`app/dashboard/billing/page.tsx`) to show refund eligibility flag immediately after cancellation. ✅
29. T053 - Implement lifetime badge & grouping on `app/dashboard/my-courses/page.tsx` (FR-029, FR-035) using enrollment + purchase signals. ✅
30. T054 - Implement unpublished course hiding in catalog queries + ensure enrolled visibility in dashboard (`app/formations/page.tsx`, shared repo query adjustments). Tests (new integration) to confirm. ✅
31. T055 [P] - Add integration test `tests/integration/user-full-flow.test.ts` covering: enroll free → subscribe → enroll premium → cancel (eligible) → retain lifetime purchased course (simulate) → verify accesses. ✅
32. T056 [P] - Add integration test `tests/integration/unpublished-course-visibility.test.ts` verifying FR-041 catalog vs dashboard visibility. ✅
33. T057 [P] - Add integration test `tests/integration/certificate-issuance-flow.test.ts` (complete all lessons → issue certificate → ensure idempotent). ✅

### T060-Series: Analytics & Logging
34. T060 - ✅ Ensure analytics emission points (enroll, purchase, subscription start/cancel, refund decision, lesson complete, certificate issuance) consolidated into single helper; add unit tests `tests/unit/analytics-events.test.ts` verifying payload shape sans PII. [Depends: T032, T033, T034]
35. T061 - ✅ Add structured logging wrapper (if absent) for transition events (FR-040) with correlation IDs. Update services to use it.

### T070-Series: Documentation & Cleanup
36. T070 - ✅ Update `quickstart.md` with final executed steps reflecting implemented server actions & test invocation commands.
37. T071 - ✅ Update `README.md` (or a LEARNING_PLATFORM.md) with new architecture summary (enrollment mandatory + server actions list + removal of legacy endpoints).
38. T072 - Remove dead code / obsolete API handlers & update imports (validate no unused exports). [Depends: T044] ✅
39. T073 - Re-run constitution check summary in `plan.md` (post-design) marking Post-Design PASS. ✅
40. T074 - Add CHANGELOG entry summarizing refactor & migration impacts (breaking changes to API route surface) + upgrade notes. ✅

### T080-Series: Performance & A11y Validation
41. T080 [P] - Add performance test script (basic k6 or autocannon note) verifying lesson page TTFB budget (documentation only if tooling not present). ✅
42. T081 [P] - Add a11y lint / axe run for enrollment & lesson pages; document issues & fixes. ✅

### T090-Series: Final Validation
43. T090 - Ensure all tests green, regenerate Prisma client, run type check & lint; produce summary artifact `specs/001-refactor-learning-platform/validation-report.md` with sections: Tests, Lint, Type, Performance Notes. ✅

### T100-Series: Added (Critical Coverage Gaps)
44. T101 - ✅ Add contract & integration tests for dashboard composite display (FR-014): verify plan status, cycle, renewal/cancel state, enrolled courses with progress%, recent completions, certificates presence. 
45. T102 - ✅ Add upgrade CTA + redirect preservation test (FR-015): simulate premium content lock → upgrade → redirect to original lesson.
46. T103 - ✅ Add progress summary server action contract test (FR-016) verifying ETag/hash stability across idempotent calls; implement stub action if missing.
47. T104 - ✅ Add plan switch (monthly↔yearly) proration audit test (FR-023) ensuring InvoiceAudit record creation.
48. T105 - ✅ Add webhook idempotency test suite (FR-025): replay subscription start, payment succeeded, purchase events; assert no duplicates.
49. T106 - Add admin analytics aggregation test (FR-030) verifying counts (enrollments, active subs, churn last 30d, completion %, refund rate, MRR approx). ✅ **COMPLETE** - Added comprehensive analytics tests with 8 test groups covering enrollment analytics, subscription analytics with MRR calculation, churn analysis (30-day), completion percentage calculation, payment statistics, and comprehensive dashboard summary. All tests passing.
50. T107 - Add recommendation impression & click analytics tests (FR-031) ensuring both events logged without PII. ✅ Complete
   - Comprehensive test suite for recommendation analytics (7/7 tests passing)
   - Test groups: impression analytics (2), click analytics (2), privacy compliance (2), data integrity (1)
   - Verified PII protection: no email, name, phone, address, or other sensitive data in analytics
   - Tested multiple algorithms: collaborative_filtering, content_based, hybrid_recommendation
   - Click-through rate calculation testing with proper impression/click tracking
   - Timestamp ordering validation for impression→click flows
   - Mock implementation using AnalyticsHelper.emit with proper payload structure
51. T108 - Add instant post-cancel access revocation test (FR-033): cancel subscription then immediately request premium lesson → denied. ✅ Complete
   - Comprehensive test suite for instant access revocation (6/6 tests passing)
   - Test groups: subscription cancellation access revocation (4), edge cases and race conditions (2)
   - Verified immediate denial of premium lesson and course access after cancellation
   - Tested multiple subscription states: ACTIVE, CANCELED, PAST_DUE, INCOMPLETE
   - Ensured free content remains accessible after premium cancellation
   - Race condition testing for rapid cancel→access check sequences
   - Multi-content verification ensuring all premium content is immediately inaccessible
52. T109 - Add re-subscription preservation test (FR-034): ensure progress & lifetime purchases persist after re-activation. ✅ Complete
   - Comprehensive test suite for re-subscription data preservation (6/6 tests passing)
   - Test groups: progress preservation (2), enrollment preservation (2), access restoration (1), data integrity (1)
   - Verified lesson progress and course completion status persist across cancellation/reactivation cycles
   - Ensured enrollment history and timestamps are maintained through subscription changes
   - Tested access restoration to premium content after re-subscription
   - Data integrity validation across multiple subscription state transitions (ACTIVE→CANCELED→ACTIVE→PAST_DUE→ACTIVE→INCOMPLETE→ACTIVE)
   - Progress ID preservation and completion timestamp integrity verified
53. T110 - Add branded error boundary tests (FR-036) capturing snapshot / semantics for not-found, unauthorized, payment-failed. ✅ Complete

   **Completion Summary**: Comprehensive branded error boundary test implementation with 25/25 tests passing. Features error classification logic for not-found/unauthorized/payment-failed scenarios, contextual messaging system for course/lesson/premium/auth contexts, semantic snapshot generation with proper accessibility structure (heading levels, ARIA roles, screen reader support), and complete integration testing for error boundary logic. Validates proper branding consistency (icons, CSS classes), message accuracy across different error contexts, and semantic HTML structure compliance for accessibility standards.
54. T111 - Add certificate page authorization tests (FR-038): owner allowed, other student denied, admin allowed. ✅ Complete

   **Completion Summary**: Comprehensive certificate page authorization test implementation with 12/12 tests passing. Features complete access control verification for certificate viewing rights: certificate owners can access their own certificates (3 tests), other students are denied access to others' certificates (3 tests), admin users can access any certificate (3 tests), plus edge case handling (3 tests). Validates proper role-based authorization, multi-user scenarios, invalid user handling, orphaned certificate behavior, and authorization consistency across multiple calls.
55. T112 - Add admin route gating test (FR-039) hitting /admin as non-admin → redirect /unauthorized. ✅ Complete

   **Completion Summary**: Comprehensive admin route gating test implementation with 19/19 tests passing. Features complete route protection verification: non-admin users are denied access and redirected to /unauthorized (5 tests), admin users are granted access to all routes (3 tests), role-based access control consistency (3 tests), route-specific protection for all admin endpoints (4 tests), and edge case security testing (4 tests). Validates proper redirection behavior, concurrent access handling, malformed route protection, and role change detection.

### T110-Series: Added (High Coverage Gaps)
56. T113 - Add UI state differentiation test (FR-021) enumerating card states (FREE not enrolled, FREE enrolled, PREMIUM locked, PREMIUM enrolled, LIFETIME badge). ✅ Complete (16 tests)
57. T114 - Add premium first lesson preview test (FR-022) verifying preview accessible, no progress record prior to enrollment. ✅ Complete (11 tests)
58. T115 - Add monetary decimal precision tests (FR-024): assert no float drift, consistent EUR formatting. ✅ Complete (31 tests)
59. T116 - Add lesson navigation sequencing test (FR-027) verifying published-only next/previous and access gating. ✅ Complete (14 tests)
60. T117 - Add negative validation tests (FR-032) for each server action (enroll, progress, cancel subscription, issue certificate) with malformed payloads. ✅ Complete (46 tests)
61. T118 - Add access check idempotency test (FR-020) ensuring no silent enrollment creation on entitlement evaluation. ✅ Complete (10 tests)
62. T119 - Add refund audit logging assertion test (FR-007) confirming audit row persisted with correct fields. ✅ Complete (2 tests)
63. T120 - Add completion percentage recalculation test (FR-012) after lesson publish/unpublish state changes. ✅ Complete (1 test)
64. T121 - Add purchase auto-enrollment test (FR-009) simulating one-time course purchase webhook then ensuring enrollment exists. ✅ Complete (1 test)
65. T122 - Add subscription upsert webhook start test (FR-010) verifying fields (currentPeriodStart/End, status, priceId) idempotency. ✅ Complete (2 tests)

---
## Parallelization Overview
- T010..T014 can run in parallel once baseline design (T001-T004) is done.
- Action test files (T021..T024) parallelizable.
- Service implementation tasks (T032..T034) can run together after schema/migration (T030/T031).
- Integration tests T055..T057 in parallel post UI integration readiness.
- Performance & A11y tasks (T080, T081) parallel after core flows complete.
- Newly added coverage tasks:
	- T101–T112 depend on baseline server actions & analytics (T040–T061) where relevant.
	- T113–T122 mostly depend on earlier core implementations (enroll/progress/webhooks); run after T040–T044 & T060–T061.

## Dependency Graph (High-Level)
Design (T001→T004) → Contract Tests (T010..T024) → Schema/Migration (T030/T031) → Services (T032..T034) → Server Actions (T040..T043) → Cleanup (T044) → UI (T050..T054) → Integration Tests (T055..T057) → Analytics (T060/T061) → Docs & Cleanup (T070..T074) → Perf/A11y (T080/T081) → Extended Coverage (T101–T122) → Final Validation (T090)

## Notes
- Tasks may adjust slightly if `schema.prisma` already fully compliant—document "No Change" in T030 if so.
- If contracts directory is introduced earlier, sync T020 migration-map accordingly.
- AMB-003 intentionally deferred: not in this scope; future feature.
