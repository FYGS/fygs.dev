| P5-3 | The 23 remote `dependabot/*` branches are all superseded by the lockfile or no longer in it (list in the log); deleting them on GitHub is outward-facing | OWNER | remote has no stale dependabot branch | DECISION (go-ahead to delete) || P5-2 | Moderate/low advisories: `webpack` (direct devDependency ^5.112) and `postcss-selector-parser` (override) fixed; `sprintf-js` has no fix, documented. Audit: 5 -> 2 | DEV | fixed or documented | DONE || P5-1 | `braces` high advisory: no release above 3.0.3 exists; reached only by build-time globbing; accepted risk documented with a revisit trigger (docs/security-ops-2026-10.md section 5) | DEV | audit shows 0 high or a signed risk note | DONE |# Platform completion trackerDONE |DONE |DONE |DONE |DONE |DONE |DONE |

Source: backlog memory of 2026-10-17 (17 items done) + the leftovers listed after it.
Goal: nothing left open. Every task has an owner, an acceptance criterion and a status.

Status: `TODO` · `DOING` · `DONE` · `BLOCKED (reason)` · `DECISION (needs the owner)`
Owner: `DEV` (done in the repo) · `OWNER` (needs credentials/decision only the project owner has)

Definition of done for every DEV task: `tsc` 0 errors, `eslint` 0 problems, unit + integration green,
e2e green when a user flow changes, CHANGELOG entry, committed on `feature/refactor-harmonize-codebase`.

## Phase 0: Hygiene of the checkout

| ID | Task | Owner | Acceptance | Status |
|----|------|-------|------------|--------|
| P0-1 | Remove the stale files OneDrive resurrected (`.eslintrc.json`, `middleware.ts`, flat pre-split visualizations, deleted tests); each was deleted in a named commit | DEV | `git status` clean | DONE |
| P0-2 | Commit `docs/amac-reports/` (planning doc) | DEV | tracked | DOING |
| P0-3 | Working copy moved out of OneDrive (now under MesProjets/fygs.dev) | OWNER | no resurrected file after a sync | DONE |
| P0-4 | Delete `C:\dev\fygs-deps` once P0-3 is done | DEV | worktree removed | TODO |

## Phase 1: Product decisions that change behaviour

| ID | Task | Owner | Acceptance | Status |
|----|------|-------|------------|--------|
| P1-1 | Access after cancellation: align `AccessService.checkCourseAccess` with spec FR-003/005 and `evaluateCourseAccess`, update the contract tests that pin the old behaviour | DECISION then DEV | one single access rule, tests assert the spec | TODO (decision: follow the spec) |
| P1-2 | Stripe `charge.refunded` (dashboard refunds): handle it (revoke access, mark payment refunded, idempotent) | DEV | integration test with a signed webhook payload | TODO |
| P1-3 | Stripe `checkout.session.async_payment_succeeded` / `async_payment_failed` handlers | DEV | integration tests for both events | TODO |

## Phase 2: Production readiness

| ID | Task | Owner | Acceptance | Status |
|----|------|-------|------------|--------|
| P2-1 | Production DB TLS: document the `pg` behaviour (validates certs, ignores `pgbouncer`/`connection_limit`), add a startup check that fails loudly with an actionable message, document `NODE_EXTRA_CA_CERTS` | DEV | startup check + DEPLOYMENT.md section + unit test | TODO |
| P2-2 | Verify the real `DATABASE_URL` in the target environment | OWNER | health endpoint green in production | TODO |
| P2-3 | Add the new Stripe events to the webhook endpoint in the Stripe dashboard, optionally upgrade the endpoint API version (plan in `docs/modernization-2026-10.md`) | OWNER | events delivered in the Stripe dashboard | TODO |
| P2-4 | Promote the CSP from report-only to enforced after reading `/api/csp-report` for a release cycle | OWNER then DEV | no violation in reports, header switched | TODO |
| P2-5 | Set `ANTHROPIC_API_KEY` so the AI features leave offline mode; smoke-test the budget guard | OWNER | AI endpoint answers, budget log visible | TODO |

## Phase 3: Features that are placeholders today

| ID | Task | Owner | Acceptance | Status |
|----|------|-------|------------|--------|
| P3-1 | Admin "recent activity" reads real events (audit log) instead of sample data | DEV | integration test, no sample data left | TODO |
| P3-2 | TechMastery dashboard computed from the real progress (pages opened, time, quiz results, streak) against the real catalog; visits and quizzes are tracked; the made-up numbers, the fake 500 ms load and the dead buttons are gone | DEV | unit + render tests, mock data removed | DONE |
| P3-3 | Admin pages: payments, subscriptions, enrollments and certificates are built (read-only, filters, search, pagination, admin-only on the server). Decision: blog, projects, pages, settings, database, security, progress and revenue pages are NOT built: the blog/projects/pages are files of the repository, payments live in Stripe, revenue is on the analytics page; their links stay hidden (`lib/admin-routes.ts`) | DEV | integration + e2e tests | DONE |
| P3-4 | Review e-mails (new review -> instructor, reply -> reviewer, report -> moderators, weekly summary) were all failing silently on a shape mismatch hidden by `as any`; the service now loads by id; the bulk mode that only logged now sends | DEV | integration tests on a real database with the mail provider mocked | DONE |
| P3-5 | Sentry (error monitoring) wired with PII redaction, release tag, source maps | DEV + OWNER (DSN) | test error visible in Sentry | TODO |
| P3-6 | Coding challenges and exercises run for real: isolated sandbox (iframe + worker, own CSP, no network), editor, per-test results, timeouts; the fake leaderboard and analytics are gone | DEV | unit + e2e in a real browser on the production build | DONE |
| P3-7 | Lesson pages no longer show a "Ressources" card that repeated the same four generic bullets on every lesson (there is no per-lesson resources data) | DEV | no placeholder text left in lesson pages | DONE |
| P3-8 | Admin-only pages enforce the ADMIN role on the server: the user directory (e-mails, amounts spent) was open to any instructor who typed the URL | DEV | unit + e2e | DONE |
| P3-9 | Monaco came from a CDN that the CSP blocks: the editor of the exercise pages never appeared in production; the bundled Monaco is used, with a text area fallback | DEV | unit + e2e | DONE |

## Phase 4: Accessibility and quality

| ID | Task | Owner | Acceptance | Status |
|----|------|-------|------------|--------|
| P4-1 | Lesson pages render a single `h1` | DEV | e2e/axe assertion | TODO |
| P4-2 | Heading order, remaining contrast issues, tooltip icon buttons (`docs/accessibility-audit-2026-10.md`) | DEV | axe 0 violation on audited pages | TODO |
| P4-3 | Audit what the first pass skipped: light theme, mobile viewports, screen reader flow, `es` locale | DEV | audit appendix + fixes | TODO |
| P4-4 | Quiz retake: the first answer to a question is final and is what gets graded, a new sitting needs a 5 min cooldown and is capped at 5 per 24 h (QuizAttempt tables + migration). Per-attempt shuffling of the question order not done: once answers are revealed it adds nothing | DEV | integration tests on a real database | DONE |

## Phase 5: Security and dependencies

| ID | Task | Owner | Acceptance | Status |
|----|------|-------|------------|--------|
| P5-1 | `braces` high advisory (no upstream fix): identify the dependent, replace or override, or document an accepted risk with justification | DEV | audit shows 0 high or a signed risk note | TODO |
| P5-2 | 2 moderate + 2 low advisories | DEV | fixed or documented | TODO |
| P5-3 | Triage the open `dependabot/*` remote branches: close those superseded by the overrides, merge the rest | DEV | remote has no stale dependabot branch | TODO |

## Phase 6: Release

| ID | Task | Owner | Acceptance | Status |
|----|------|-------|------------|--------|
| P6-1 | Refresh `C:\dev\PR-description.md` (Prisma 7, e2e, Stripe, a11y, the tasks above) | DEV | text matches the branch | TODO |
| P6-2 | Final gate: tsc, eslint, unit, integration, e2e on a fresh production build, audit | DEV | all green, numbers recorded here | TODO |
| P6-3 | Open the PR on github.com (no gh auth for it) | OWNER | PR URL | TODO |
| P6-4 | Update the memory backlog and CHANGELOG | DEV | in sync | TODO |

## Log

- 2026-10-20: tracker created. P0-1 done (owner approved), P0-3 done (owner moved the folder), P1-1 decided: follow the spec (revoke premium access after cancellation).
- 2026-10-20: P1-1 (access rule), P1-2 (charge.refunded), P1-3 (async_payment_failed; async_payment_succeeded was already handled), P2-1 (DATABASE_URL check), P3-1 (real admin activity), P4-1 (single h1) done. Integration 190+ tests green on embedded Postgres, unit 1650 green, tsc 0, eslint 0.
- 2026-10-20: P5 done. Lockfile audit 5 -> 2 advisories (both without upstream fix, risk documented). `scripts/audit/lockfile-advisories.mjs` added. Dependabot branches classified: 23/23 superseded.
- 2026-10-20: P3-2 (TechMastery dashboard on real progress) and P4-4 (quiz sittings) done. New findings: P3-6 (challenge execution is simulated), P3-7 (lesson resources placeholder).
- 2026-10-20: P3-4 done: three review notifications never reached anyone (wrong relation names, missing `course`), fixed and tested.
- 2026-10-20: P3-7 done.
- 2026-10-20: P3-3, P3-6, P3-8, P3-9 done. Content bugs found by the new regression tests: the reference solution of the jump search reassigned a `const`, the sorting exercises asked for `bubblesort` while the function to write is `bubbleSort`, the empty tree test expected `[[]]`. All verified in Chrome on a production build (38 e2e tests).
