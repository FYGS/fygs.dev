
# Implementation Plan: Learning Platform Core Refactor & Monetization Alignment

**Branch**: `001-refactor-learning-platform` | **Date**: 2025-09-30 | **Spec**: `./spec.md`
**Input**: Feature specification from `/specs/001-refactor-learning-platform/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Refactor and align the learning platform’s core around a unified, explicit enrollment + entitlement model that cleanly separates free, premium (subscription), and lifetime purchased access while guaranteeing idempotent subscription / payment handling, precise refund eligibility (≤15 * 24h window from Stripe period anchor), centralized access logic, consistent progress/certificate flow, and analytics completeness. Migration emphasis: move remaining legacy API route mutations to server actions (except true external/webhook & edge needs), ensure unpublished course handling (FR-041) preserves enrolled learner continuity while hiding from discovery, and enforce deterministic logging/ auditing across subscription, refund, enrollment, and certificate transitions.

## Technical Context
**Language/Version**: TypeScript (strict) / Next.js 15.5.3 (Node 20+/Edge runtimes)  
**Primary Dependencies**: Next.js App Router (RSC + server actions), Prisma (PostgreSQL), Zod (validation), Stripe (billing), TailwindCSS + shadcn/ui, Zustand (select client state), nuqs (URL state), Framer Motion (minor animation)  
**Storage**: PostgreSQL (Prisma ORM)
**Testing**: Vitest (unit/component), Playwright (E2E), MSW (API mocks), Possible contract validation harness (Zod schemas)  
**Target Platform**: Vercel / Edge-capable for designated routes (webhooks remain Node if required)  
**Project Type**: Single web application (monolithic Next.js repo)  
**Performance Goals**: Lesson page server response (business logic) p95 < 400ms; Core page TTFB median < 300ms (Constitution); Post-subscription cancellation premium gating visibility < 60s; Webhook processing < 3s worst-case; Initial hydrated JS on catalog < 120KB gz (budget)  
**Constraints**: Idempotent mutations (enroll, progress, certificate, subscription/refund); Centralized entitlement service; No raw Stripe IDs in client UI; PII exclusion in analytics; Accessible UI (WCAG AA); Strict type boundaries (no implicit any)  
**Scale/Scope**: Near-term: hundreds → low thousands users; concurrency modest (burst enrollments & webhook retries). Design aims for linear scalability (DB indexed unique composites, minimal N+1).  

No active NEEDS CLARIFICATION markers. Deferred (non-blocking) consideration: optional anti-abuse preview watch-time threshold (AMB-003) explicitly out-of-scope for this delivery.

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Notes |
|-----------|------------|-------|
| 1. User Value & Clarity | PASS | Direct learner value: clearer access, fewer surprises, accurate progress/certificates. |
| 2. Type-Safe End-to-End | PASS (planned) | All mutations → server actions w/ Zod; contract tests Phase 1. |
| 3. Server Components & Actions | PASS (migration) | Plan removes legacy API mutations; only webhooks/edge remain API routes. |
| 4. Single Source of Truth (Access) | PASS | Central `access-service` remains authoritative; no component gating logic added. |
| 5. Predictable Monetization | PASS | Only free/premium/lifetime flows; FR set enforces semantic billing cycle display. |
| 6. Clean Architecture / Dead Code | PASS | Plan includes migration; will delete replaced API handlers during implementation tasks. |
| 7. Progressive Enhancement & A11y | PASS (implicit) | No changes break existing semantics; upgrade overlays must retain focus management. |
| 8. Observability | PASS | FR-017 and FR-040 ensure comprehensive logging/events. |
| 9. Performance Discipline | PASS | Budgets integrated into Technical Context; gating cache invalidation <60s. |
| 10. Test Coverage on Risk | PASS (planned) | Access matrix, refund window, subscription transitions, certificate issuance tests Phase 1. |
| 11. Idempotency & Resilience | PASS | Composite keys/upserts; webhook & server action convergence. |
| 12. Simplicity & Explicitness | PASS | Enrollment required universally; reduces branching complexity. |

No violations requiring justification. Complexity Tracking remains empty.

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

ios/ or android/
### Source Code (repository root)
```
app/
   (dashboard)/            # Learner dashboard pages (progress, certificates)
   api/                    # Remaining API handlers (webhooks, og, analytics batch)
   auth/                   # Auth flows
   admin/                  # Admin analytics & management surfaces
   ... (other marketing/utility route groups)
components/
   ui/                     # Shared UI + shadcn/ui wrappers
   ... feature surfaces (cards, gating overlays, progress widgets)
lib/
   access-service.ts       # Central entitlement logic (already present)
   auth*.ts, db.ts, auth-service.ts
   payment / email / analytics utilities (existing)
stores/                   # Zustand stores (minimal, client-only concerns)
prisma/
   schema.prisma           # Entities (Enrollment, Subscription, Payment, Progress, Certificate, etc.)
tests/
   contract/ (to be created Phase 1)
   integration/ (to be created Phase 1)
   unit/ (to be created Phase 1)
specs/001-refactor-learning-platform/ (this feature docs)
```

**Structure Decision**: Single Next.js application root (no separate backend/frontend packages). Feature introduces only documentation & test directories plus incremental server action migrations inside existing `app/` route handlers. No new top‑level packages required (avoids constitution complexity justification).

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved (none active; will document rationale + deferred AMB-003 as out-of-scope note)

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [ ] Phase 0: Research complete (/plan command)
- [ ] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved (none active; AMB-003 intentionally deferred & excluded from scope)
- [x] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
