<!-- Sync Impact Report
Version change: 0.0.0 (template) → 1.0.0
Modified principles: N/A (initial materialization)
Added sections: Core Principles, Platform Quality Standards, Engineering Workflow, Governance
Removed sections: Template placeholders
Templates requiring updates: plan-template.md (✅ references constitution generically), spec-template.md (✅), tasks-template.md (✅)
Deferred TODOs: None
-->

# FYGS Learning Platform Constitution

## Core Principles

### 1. User Value & Clarity First (NON‑NEGOTIABLE)
Every shipped change MUST deliver observable user or learner value (improved comprehension, reduced friction, clearer navigation, or measurable engagement). Features without a crisp learner outcome are rejected. Each PR description MUST include a one‑sentence value statement.

### 2. Type‑Safe End‑to‑End
All runtime boundaries (DB ↔ server actions ↔ RSC ↔ client components ↔ worker) MUST be covered by generated or hand‑written TypeScript types. Zod (or equivalent) validation occurs at every external or untrusted input boundary (API routes, webhook, form server action). No any / implicit any / unsafe casts in committed code (except tightly scoped with comment justification).

### 3. Server Components & Server Actions by Default
Rendering logic, data fetching, and mutations MUST live server‑side unless an interaction requires client state (animation state, optimistic UI, media controls). Client components are leaf-level only. Shared logic extracted to pure functions or server utilities under `lib/`.

### 4. Single Source of Truth for Access & Entitlements
All course access, enrollment, subscription, progress, and certificate decisions flow through centralized services (`access-service`, `payment-service`, `progress/certificates` modules). No component performs raw entitlement branching. Violations are refactored immediately.

### 5. Predictable Monetization Model
Only two monetization axes: (a) Free tier (requires explicit enrollment for tracking), (b) Premium (subscription monthly/yearly OR individual lifetime purchase, also require enrollment for tracking). No hidden tiers. All pricing references on client are semantic (monthly/yearly) – never raw Stripe IDs.

### 6. Clean Architecture & Elimination of Dead Code
Dead, unused, or obsolete abstractions are removed in the same PR they are discovered. Prefer “delete + rebuild correctly” over layering hacks. PRs that add new indirection without measurable benefit are blocked.

### 7. Progressive Enhancement & Accessibility
Core learning flows (browse → enroll → learn → track progress → earn certificate) must function with JS degraded (where feasible) and be screen‑reader navigable. WAI‑ARIA landmarks, proper headings, focus management for dialogs/overlays, semantic buttons/links are mandatory.

### 8. Observability & Measurable Feedback Loops
Critical flows (enrollment, checkout, subscription switch, lesson completion, certificate issuance) emit analytics events and structured logs. Failures are logged with contextual identifiers (userId, courseId, subscriptionId). No silent failures.

### 9. Performance & Resource Discipline
Initial content render TTFB < 300ms on median hardware for core pages (catalog, course page, lesson page, dashboard). LCP media uses `next/image` or streaming. Avoid client bundle bloat (lazy load non‑critical components; no broad icon imports). Database queries batched or coalesced; N+1 prevented via relation includes or loaders.

### 10. Test Coverage Where Risk Concentrates
Business logic (access control, billing state transitions, certificate issuance, progress completion thresholds) MUST have unit or integration tests. Visual/UI code may rely on smoke & E2E unless logic heavy. A failing test preceding a logic change is required (Red‑Green‑Refactor).

### 11. Idempotency & Resilience
Server actions and webhook handlers MUST be idempotent (safe on Stripe retries, user double‑clicks, refreshes). Enrollment, subscription upsert, progress upsert, and certificate issuance all guard duplicates naturally through composite keys or upsert patterns.

### 12. Simplicity & Explicitness
Prefer explicit configuration and naming over “magic” inference. Avoid premature generalization. Remove abstractions not pulling weight. YAGNI is enforced; future flexibility arguments require an issue reference.

## Platform Quality Standards

1. Data Integrity
	- Prisma schema changes require migration review.
	- Composite unique constraints back critical idempotent writes.
2. Security & Privacy
	- All user‑modifiable data validated server‑side.
	- Auth gating in middleware + runtime access checks (never rely on client claims).
	- No secrets in client bundles; environment variables typed.
3. Accessibility
	- Color contrast AA minimum; focus outline never removed without replacement.
	- Interactive elements expose discernible text.
4. Performance Budgets
	- Course list page hydrated JS < 120KB (gzipped) initial.
	- Lesson video interactions begin < 1s after load under typical network.
5. Reliability
	- Webhook failures retriable with deterministic outcomes.
	- Background tasks (email/certificate generation) isolated from request path when >200ms.
6. Analytics & Telemetry
	- Event taxonomy stable; new event types documented before merge.
	- PII excluded from analytics payloads.
7. Error Handling
	- User‑facing errors human readable; stack traces only in server logs.
	- Global error & not‑found boundaries implemented per route group.

## Engineering Workflow

1. Planning
	- Features enter via formal spec (user value, scenarios, measurable outcomes) before implementation.
	- Constitution compliance checkpoint recorded in plan docs.
2. Development
	- Start with contracts & tests for business rules (access, billing transitions, certificate eligibility).
	- Implement server actions first; add client surfaces last.
	- Remove duplication as soon as it’s detectable (no “will clean later”).
3. Code Review
	- Reviewer checklist: access centralization, type safety, dead code removal, performance budget adherence, analytics emission completeness.
4. Quality Gates
	- Build + type check MUST pass pre‑merge.
	- Lint warnings treated as errors.
	- Added/changed business logic accompanied by or updating tests.
5. Deployment
	- Migrations run in staging before production.
	- Feature flags optional; fallback states documented.
6. Post‑Deployment
	- Monitor key metrics (enrollment conversion, lesson completion rate, subscription churn indicators).
	- Regressions trigger immediate rollback or hotfix.

## Governance

This constitution supersedes ad‑hoc engineering preferences. Amendments follow a documented proposal (motivation, impact, migration/cleanup steps) and semantic versioning:

Semantic Versioning Rules:
 - MAJOR: Removal or redefinition of a core principle, or governance process change.
 - MINOR: Addition of a new principle, quality standard, or workflow rule.
 - PATCH: Clarifications, formatting, non‑substantive wording edits.

Amendment Process:
 1. Open “Constitution Amendment” issue referencing affected sections.
 2. Draft changes in a branch; update Sync Impact Report header.
 3. Run template alignment (plan/spec/tasks templates) & update impacted references.
 4. Obtain approval from designated maintainers (solo project: self‑review + documented rationale).
 5. Merge; version + Last Amended date updated.

Compliance:
 - Every feature plan documents Constitution Check outcome.
 - Violations require explicit justification table (Complexity Tracking section) and expiration date for remediation.
 - Unjustified violations block merge.

Enforcement:
 - Automated lint/type/test gates.
 - Manual review checklist aligned to principles.
 - Periodic quarterly audit of: dead code ratio, test coverage of critical modules, performance budgets.

**Version**: 1.0.0 | **Ratified**: 2025-09-30 | **Last Amended**: 2025-09-30