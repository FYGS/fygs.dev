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
| P2-6 | Create the Sentry project, set `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` (rebuild after the second), trigger a test error | OWNER | the error shows up without personal data | TODO |

## Phase 3: Features that are placeholders today

| ID | Task | Owner | Acceptance | Status |
|----|------|-------|------------|--------|
| P3-1 | Admin "recent activity" reads real events (audit log) instead of sample data | DEV | integration test, no sample data left | TODO |
| P3-2 | TechMastery dashboard computed from the real progress (pages opened, time, quiz results, streak) against the real catalog; visits and quizzes are tracked; the made-up numbers, the fake 500 ms load and the dead buttons are gone | DEV | unit + render tests, mock data removed | DONE |
| P3-3 | Admin pages: payments, subscriptions, enrollments and certificates are built (read-only, filters, search, pagination, admin-only on the server). Decision: blog, projects, pages, settings, database, security, progress and revenue pages are NOT built: the blog/projects/pages are files of the repository, payments live in Stripe, revenue is on the analytics page; their links stay hidden (`lib/admin-routes.ts`) | DEV | integration + e2e tests | DONE |
| P3-4 | Review e-mails (new review -> instructor, reply -> reviewer, report -> moderators, weekly summary) were all failing silently on a shape mismatch hidden by `as any`; the service now loads by id; the bulk mode that only logged now sends | DEV | integration tests on a real database with the mail provider mocked | DONE |
| P3-5 | Error monitoring (Sentry): wired for server, browser and the root layout, PII-scrubbed, inert without a DSN, tested with the real SDK. Owner: create the Sentry project and set the DSNs (P2-6) | DEV | tests with the real SDK and a fake transport | DONE |
| P3-6 | Coding challenges and exercises run for real: isolated sandbox (iframe + worker, own CSP, no network), editor, per-test results, timeouts; the fake leaderboard and analytics are gone | DEV | unit + e2e in a real browser on the production build | DONE |
| P3-7 | Lesson pages no longer show a "Ressources" card that repeated the same four generic bullets on every lesson (there is no per-lesson resources data) | DEV | no placeholder text left in lesson pages | DONE |
| P3-8 | Admin-only pages enforce the ADMIN role on the server: the user directory (e-mails, amounts spent) was open to any instructor who typed the URL | DEV | unit + e2e | DONE |
| P3-9 | Monaco came from a CDN that the CSP blocks: the editor of the exercise pages never appeared in production; the bundled Monaco is used, with a text area fallback | DEV | unit + e2e | DONE |
| P3-10 | Review moderation: approve/reject with an audit trail, real list and counters, fake settings page removed | DEV | integration + unit + e2e | DONE |
| P3-11 | Server-side admin check also on the review moderation queue (it had none) | DEV | e2e | DONE |

## Phase 4: Accessibility and quality

| ID | Task | Owner | Acceptance | Status |
|----|------|-------|------------|--------|
| P4-1 | Lesson pages render a single `h1` | DEV | e2e/axe assertion | TODO |
| P4-2 | Accessibility fixes from the audits (headings, contrast, names, landmarks, rating stars, progress bars, tokens tested in both themes); remaining items and numbers: `docs/accessibility-audit-2026-10.md`, section "Second pass" | DEV | axe on the audited pages, see the document | DONE |
| P4-3 | The audit now covers what the first pass skipped: back office (20 pages), learner pages signed in, mobile viewport, light theme, `es` locale. Still not covered: screen reader sessions (NVDA/VoiceOver) by a person | DEV | audit reports in the document | DONE (screen readers: OWNER) |
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
| P6-1 | Refresh the pull request description (Prisma 7, e2e, Stripe, a11y, phase 7) | DEV | text matches the branch | DONE |
| P6-2 | Final gate at 9cae6bf (code) / 2446b6a (head): tsc 0, eslint 0, unit 1959 (182 files), integration 668 (53 files), e2e 51 on a fresh production build, smoke crawl and six accessibility passes | DEV | all green, numbers recorded here | DONE |
| P6-3 | Open the PR on github.com (no gh auth for it) | OWNER | PR URL | TODO |
| P6-4 | Update the memory backlog and CHANGELOG | DEV | in sync | DONE |

## Phase 7: Functional completeness of every interface

Origin: "is the application complete, without holes?" The answer was no. This phase is the inventory (dead links, controls that do nothing, invented figures, forms, translations, empty states) and the decision taken for each finding: **deliver** the function or **remove** the control.

| ID | Finding | Decision | Acceptance | Status |
|----|---------|----------|------------|--------|
| P7-1 | No way to cancel a subscription from the billing page (the cancel action had no UI) | Deliver: "Annuler l'abonnement" with confirmation, end of period | unit test, action tested | DONE |
| P7-2 | Plan switching had an action but no UI; the action recorded invented proration amounts (+50 EUR / -30 EUR) in the audit trail and analytics | Deliver the UI (cycle keyword, never a raw price id); stop inventing amounts (Stripe's own are audited as PRORATION); strict price validation | contract + unit tests | DONE |
| P7-3 | Cancelling recorded a REFUND_ISSUED event of 0 EUR although nothing is refunded there | Remove the event (requestRefund records the real one); refund offer shown for any subscription in its 14 days | tests | DONE |
| P7-4 | Admin: 14 links to pages that do not exist (users/new, users/invite, emails, blog, projects, progress, revenue, pages, settings, database, security, analytics/export) and a user profile page linked from 2 places that did not exist | users/[id] delivered (role, suspension, enrollments, payments); analytics/export delivered (CSV); the others removed (the features do not exist) | link scan finds none | DONE |
| P7-5 | Admin users and courses: search, filters, bulk menus, import, export, duplicate, selection bars did nothing | Real filters (URL, server side) for users and courses; the rest removed | integration tests | DONE |
| P7-6 | Role change action accepted roles that do not exist (USER, MENTOR, MODERATOR): it always failed; nothing protected the last administrator | One service: valid roles only, no self change, last admin kept (advisory lock, concurrent test) | integration tests | DONE |
| P7-7 | The community ban (isBanned) was stored but never enforced: a banned account kept posting | Enforced on every community write; lifted bans restore access | integration tests | DONE |
| P7-8 | Admin review detail page showed one fabricated review for id "1" and a 404 for every real review | Rewritten on the database: content, replies, reports, moderation history, decision with note | tsc, e2e path | DONE |
| P7-9 | Invented figures: admin growth chart (hard-coded 12 months), analytics "+15.2% / +8.7% / +12.4%", visitors = users x 10, random rating distribution, hard-coded 75/15/10 "sentiment", fake notifications (Next.js 15 Mastery, 129 EUR), simulated refresh | All replaced by real queries or removed; month-over-month change shown only when there is a previous month; funnel counts distinct people | integration tests (analytics) | DONE |
| P7-10 | Student side: quick links to schedule, downloads, challenges; two best-practices cards; collaboration page "coming soon"; progress grid showed "Cours #a1b2c3" and linked to a missing page; reply "Report" item without backend; dead newsletter and booking components that faked success | schedule, downloads, 2 cards, collaboration, report item, dead components removed; challenges -> /tech-mastry/challenges; grid shows the title and opens the course | link scan, unit tests | DONE |
| P7-11 | Forms inventory: all 31 forms are wired to a backend (contact, profile, password, reviews, community, admin CRUD, auth) | none needed | grep audit | DONE |
| P7-12 | Translations inventory: dictionaries (fr/en/es) are complete, but only ~10 of ~600 files with text read from one; the rest of the app (formations, dashboard, billing, profile, admin, TechMastry) is written in French, the community in English | DECISION for the owner: keep the app area French-only and hide the switcher there, or fund a translation project (see docs/i18n-inventory.md) | inventory written | DECISION |
| P7-13 | Smoke crawl of 170 routes (admin 20, student 150, visitor 150) on the seeded platform and again on a platform holding only accounts. Found and fixed: `[object Object]` on a course page (visual-support slides saved as structured sections), `NaN%` in the course revenue share, `NaN%` in the billing progress with no published course. All three fixes came after the crawl that found them and the crawl was not re-run on them (the slide conversion has unit tests, the two percentages are one-line guards); every other route of the seeded and the empty platform was clean | DEV | `scripts/audit/smoke-crawl.mjs` clean | DONE |

## Log

- 2026-10-20: tracker created. P0-1 done (owner approved), P0-3 done (owner moved the folder), P1-1 decided: follow the spec (revoke premium access after cancellation).
- 2026-10-20: P1-1 (access rule), P1-2 (charge.refunded), P1-3 (async_payment_failed; async_payment_succeeded was already handled), P2-1 (DATABASE_URL check), P3-1 (real admin activity), P4-1 (single h1) done. Integration 190+ tests green on embedded Postgres, unit 1650 green, tsc 0, eslint 0.
- 2026-10-20: P5 done. Lockfile audit 5 -> 2 advisories (both without upstream fix, risk documented). `scripts/audit/lockfile-advisories.mjs` added. Dependabot branches classified: 23/23 superseded.
- 2026-10-20: P3-2 (TechMastery dashboard on real progress) and P4-4 (quiz sittings) done. New findings: P3-6 (challenge execution is simulated), P3-7 (lesson resources placeholder).
- 2026-10-20: P3-4 done: three review notifications never reached anyone (wrong relation names, missing `course`), fixed and tested.
- 2026-10-20: P3-7 done.
- 2026-10-20: P3-3, P3-6, P3-8, P3-9 done. Content bugs found by the new regression tests: the reference solution of the jump search reassigned a `const`, the sorting exercises asked for `bubblesort` while the function to write is `bubbleSort`, the empty tree test expected `[[]]`. All verified in Chrome on a production build (38 e2e tests).
- 2026-10-20: P3-10, P3-11 done. Two validation traps found and fixed in the process: the validation worktree had silently stayed on an older commit, and the `node_modules` it used predated the lockfile changes (see the log of the next entry).
- 2026-10-20: final validation at 2499090: unit 179 files / 1942 tests green, e2e 46 passed on a fresh production build, accessibility audits on admin, student, mobile, light, dark and es. Remaining axe findings (to schedule, none blocks release): contrast in light theme (blog code, admin courses/analytics, sorting, scalability), unnamed icon buttons (community, blog, admin users, searching), heading order (dashboard, profile, qa, scalability), scrollable code regions without keyboard focus, playground without h1 on mobile.
- 2026-10-21: phase 7 done (see the table). The branch was pushed and the 23 superseded dependabot branches deleted after the owner's go-ahead. Remaining: owner items (P2-6 Sentry, Stripe dashboard events, production DATABASE_URL/TLS, CSP promotion, ANTHROPIC_API_KEY, screen-reader tests, the translation decision P7-12) and the accessibility leftovers listed in the audit addendum.
