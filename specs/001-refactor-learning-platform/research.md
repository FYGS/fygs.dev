# Research: Learning Platform Core Refactor & Monetization Alignment

**Feature**: `001-refactor-learning-platform`  
**Created**: 2025-09-30  
**Status**: Complete  

## Overview
This document captures research decisions made during the feature specification and planning phases to guide implementation. No active NEEDS CLARIFICATION markers remain; design is ready for implementation.

## Key Decisions

### Access Centralization Strategy
**Decision**: All course access determination flows through centralized `AccessService.checkCourseAccess()` returning standardized access context.  
**Rationale**: 
- Prevents scattered entitlement logic across components  
- Enables consistent audit trails and analytics  
- Simplifies testing with single authority source  
- Aligns with Constitution principle #4 (Single Source of Truth)  
**Alternatives Considered**:
- Component-level access checks: Rejected due to duplication risk and testing complexity
- Database views: Rejected due to limited audit capability and migration complexity

### Refund Window Logic (Timestamp Precision)
**Decision**: Refund eligibility calculated as `cancellationTimestamp < (subscriptionPeriodStartAnchor + 15 * 24 * 60 * 60 * 1000)` using Stripe's `current_period_start` as anchor.  
**Rationale**:
- Exact timestamp arithmetic prevents ambiguity around calendar day boundaries  
- Stripe subscription periods provide authoritative billing cycle anchors  
- Millisecond precision supports edge case testing and audit requirements  
**Alternatives Considered**:
- Calendar day rounding: Rejected due to timezone complexity and potential abuse
- Business day calculations: Rejected as overly complex for user expectations

### Unpublished Course Policy (FR-041)
**Decision**: Unpublished courses remain fully accessible to already-enrolled users while being hidden from public discovery.  
**Rationale**:
- Preserves learner continuity and investment protection  
- Avoids breaking existing enrollments during content transitions  
- Supports gradual content updates without user disruption  
**Alternatives Considered**:
- Complete access revocation: Rejected due to negative user experience
- Read-only access: Rejected as partial functionality creates confusion

### Server Action Migration Strategy
**Decision**: Migrate mutation operations (enroll, progress, certificate, subscription management) from API routes to server actions, preserving API routes only for external integrations (webhooks, OG images, analytics batch).  
**Rationale**:
- Aligns with Next.js 15+ RSC + server actions best practices  
- Improves type safety with direct Zod validation  
- Reduces client/server boundary complexity  
- Better error handling and loading states  
**Alternatives Considered**:
- Keep existing API routes: Rejected due to maintenance burden and Constitution principle #3
- Complete API route removal: Rejected due to webhook and external integration requirements

### Analytics vs Structured Logs Boundary
**Decision**: Analytics events (FR-017) target external BI/tracking systems; structured logs (FR-040) capture operational transitions for debugging/audit.  
**Rationale**:
- Clear separation prevents duplicate emission  
- Analytics focus on user behavior patterns  
- Logs focus on system state transitions  
- Different retention and query patterns  
**Alternatives Considered**:
- Single unified logging: Rejected due to different consumption patterns and privacy requirements

## Deferred Considerations

### AMB-003: Preview Anti-Abuse Threshold
**Decision**: Explicitly out-of-scope for this delivery.  
**Rationale**: Low business impact; current preview model (first lesson only) provides adequate protection. Can be addressed in future feature if abuse patterns emerge.

## Technical Constraints Confirmed
- TypeScript strict mode maintained throughout
- Prisma ORM with PostgreSQL for data persistence
- Zod validation at all external boundaries
- Better-auth integration preserved (User, Session, Account, Verification tables untouched)
- Constitution principles validated and confirmed PASS across all 12 principles

## Next Steps
Implementation ready to proceed with data model materialization and contract test development following TDD approach.