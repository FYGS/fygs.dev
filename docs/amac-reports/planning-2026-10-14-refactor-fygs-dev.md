# AMAC Planning Report: Staged refactor of fygs.dev

**Date:** 2026-10-14  **Stack:** TypeScript / Next.js 15 + React 19  **Branch:** feature/refactor-harmonize-codebase  **Confidence:** 70%

## Approach
No single big refactor. Stages 0, 0b, 1-6, each mergeable alone, each gated by baseline plus characterization/contract tests.

| Stage | Content |
|---|---|
| 0 | pnpm install; record tsc / lint / vitest baseline |
| 0b | Fix pre-existing failures only, or get explicit AC4 waiver |
| 1 | Contract + characterization tests (auth-negative test for every community action, serializer snapshots, analytics event-name record); delete test routes after grep |
| 2 | Split app/actions/community-actions.ts by domain; barrel without `export *` |
| 3 | Analytics consolidation onto AnalyticsHelper, fire-and-forget preserved |
| 4 | Remove `any` in serializers |
| 5 | Server action location harmonization with shims |
| 6 | Keyboard shortcut deduplication |

Deferred: i18n unification, visualization decomposition, components/ vs app/_components merge, base-class frameworks, error-format unification, Prisma schema / lib/db.ts / lib/auth.ts / Stripe webhook changes, dependency upgrades.

## Conflicts resolved
Directory merge DROPPED; base classes DEFERRED; i18n DEFERRED; baseline MANDATORY.

## Devil's Advocate / Judge
7 challenges: 5 upheld (DA-1, DA-2 HIGH; DA-4, DA-5, DA-7 MEDIUM), 2 dismissed (DA-3, DA-6). Plan revised once. Round 2 re-review not run.

## Known weaknesses
Specialist reports were produced by sampling (Haiku); importer counts and some paths are unverified. Baseline unknown (node_modules absent). AC3 has no concrete list. No security review in this roster.
