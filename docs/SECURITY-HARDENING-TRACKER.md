# Security hardening: findings, decisions, tracker

Audit of 2026-11-02 on branch `feature/refactor-harmonize-codebase` (commit 218aa96): seven independent static reviews
(authentication, authorization, injection and parsers, payments and business logic, files and storage, infrastructure
and supply chain, AI and sandbox). IDs `S1-n` to `S7-n` refer to those reviews. Status: `TODO` · `DOING` · `DONE` ·
`OWNER` (cannot be done in the repository).

A live attack campaign against a running instance was not run (the tooling refused it). Every fix therefore ships with
tests that assert the protection holds; the first thing to do after deploying is the owner checks in section 4.

## 1. Decisions
- Redirect targets after sign-in, payment or verification are paths of the site only (`lib/safe-redirect.ts`).
- Every value interpolated into hand-written HTML (e-mails, documents) goes through `lib/html-escape.ts`.
- One secret policy (`lib/secret.ts`): production refuses to start with a weak `BETTER_AUTH_SECRET`; each purpose
  (exam sitting, proof-of-work) uses its own derived key.
- ADMIN and INSTRUCTOR accounts must use a second factor (TOTP, better-auth `twoFactor` plugin).
- A final-exam sitting is a database row claimed once; a failed sitting never reveals the correct answers.
- A refund ends the right to a new refund for the same product for 12 months, and is refused once a certificate was earned.
- Webhook events are claimed durably with a lease; subscription state is only moved forward by newer events.
- Premium media is delivered through short-lived signed URLs after an entitlement check; the bucket itself must be private (owner action).
- User code in the playground never runs in the site's origin.
- Anti-automation is self-hosted (signed proof-of-work, honeypot and timing trap, disposable-address check), no third-party service required.
- Privileged actions are written to an append-only `AuditLog`; account erasure anonymises and keeps legally required payment records.
- Unpublished courses (spec FR-041): a learner who holds a course keeps it, its quizzes, exam and certificate when the course is withdrawn; it stops being visible, sellable and offering a free sample. The audit finding S2-13 (low) was resolved on the exam/quiz publication flags only, because closing the course to its holders contradicts the specification.
- Accepted and documented: lesson/quiz completion is learner-asserted for courses without evaluations (minimum watch time added); challenge results of the playground are client-graded and persist nothing.

## 2. Work packages

| ID | Scope | Findings | Status |
|----|-------|----------|--------|
| W-AUTH | Sessions, redirects, e-mail change, MFA, startup guards, seed guard, account erasure | S1-2 S1-3 S1-4 S1-5 S1-6 S1-7 S1-8 S1-9 S2-3 S3-1 S5-6 (names) S6-5 S6-8 S7-8 | DONE |
| W-PAY | Payments, webhooks, refunds, entitlement | S4-2 S4-3 S4-4 S4-5 S4-9 S4-10 S2-13 S2-14 S6-6 (webhook) | DONE |
| W-LEARN | Exam, quiz, progress, XP, certificates | S4-1 S2-4 S4-6 S4-7 S4-8 S5-6 S2-13 | DONE |
| W-AUTHZ | Community, reviews, analytics, data exposure, blog | S2-1 S2-2 S2-5 S2-7b S2-8 S2-9 S2-10 S2-11 S2-15 S2-16 S3-4 S3-7 | DONE |
| W-CONTENT | E-mails, sanitizer, SSRF, uploads, media delivery, OG, JSON-LD | S1-1 S3-2 S3-3 S3-5 S3-6 S3-8 S5-1 to S5-8 S2-6 S2-12 S6-4 | DONE |
| W-SANDBOX | Playground isolation, AI output and budget, third-party scripts | S7-1 S7-2 S7-3 S7-4 S7-6 S7-7 S7-9 | DONE (Python off until the runtime files are added) |
| W-INFRA | CI, CSP nonces, proxy, rate limits, anti-automation, headers | S6-1 S6-2 S6-6 S6-7 S6-9 S6-10 S7 (anti-automation) | DONE |

## 3. Log
- 2026-11-02: audits received; schema hardening migration `20261102100000_security_hardening` (ExamAttempt,
  ProcessedStripeEvent, AuditLog, TwoFactor, MediaObject, unique payment intent / session token / XP award, certificate
  holder name, DISPUTED payments, CSPRNG certificate codes); shared primitives `lib/secret.ts`, `lib/html-escape.ts`,
  `lib/safe-redirect.ts`, `lib/audit.ts`, `lib/anti-automation/types.ts` with tests.

## 4. Owner actions (outside the repository)
- E-mail DNS: SPF limited to the SMTP provider, DKIM aligned, DMARC at `quarantine` or `reject` with reporting.
- Reverse proxy: overwrites `X-Forwarded-For` and `X-Real-IP` from the client; the application port is not reachable directly; `TRUSTED_PROXY_HOPS` matches the real hop count.
- Storage: make the video/resource bucket private; separate keys for images and media with bucket-scoped permissions; `X-Content-Type-Options: nosniff` and restrictive CORS on the storage origin; use an owned domain instead of the `sslip.io` host.
- Stripe: enable `charge.dispute.created`, `charge.dispute.closed` and `refund.updated` on the webhook endpoint; use a restricted API key; distinct webhook secret per environment; review Customer Portal settings and promotion codes.
- GitHub: branch protection on `main` (reviews + required checks), secret scopes, Dependabot security updates, rotate any secret that CI exposed before this change.
- Data stores: Redis password and TLS; the application database role is not a superuser and cannot drop tables; backups and a restore test.
- Production environment: `BETTER_AUTH_SECRET` (at least 32 random characters), `BETTER_AUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET`, `ADMIN_API_KEY` set to long random values.
- Production database: run the duplicate checks written at the top of the `20261102100000_security_hardening` migration before deploying it.
- 2026-11-02: seven work packages delivered in parallel, then integrated: `twoFactor` table named like better-auth's model, `disputed` access-loss reason labelled in the learners panel, profile route contract tests rewritten (only `name` is accepted), FR-041 restored, generated sandbox vendor bundle excluded from lint, catch bindings of the sandbox scripts fixed.

- 2026-11-03: validated on the integrated state: tsc 0, eslint 0, migrations match the schema, unit 2598, integration 948, e2e 77 on a fresh production build, smoke crawl of 26 admin + 177 learner + 177 visitor routes with no problem, axe 0 violation on administration, learner, mobile and light passes (visitor: the documented blog marker). Found by the browser runs and fixed: the second-factor challenge made `verification.value` unique (a second sign-in of the same staff member answered 500), the second-factor page was prerendered and could not hydrate under the nonce policy (all `/auth` pages are now dynamic and covered), the theme script of next-themes was blocked (replaced by a constant script allowed by hash), Zod's `new Function` probe, unnamed buttons and an overlapped "next" button on the mobile bar.

## 5. Residual risks and open items
- Python in the playground is disabled until `public/sandbox/pyodide/` holds the runtime (pyodide.js, pyodide.asm.js, pyodide.asm.wasm, python_stdlib.zip, pyodide-lock.json, v0.26.4 targeted).
- No QR code for the second factor (no library can be installed offline): manual key and `otpauth://` link.
- Sign-in with Google/GitHub is refused for accounts that have a second factor (staff must set a password first).
- Quiz feedback shows the right answer after each question (pedagogy); a courses without quiz or exam can still be completed at 20 s per lesson, 200 per day (business decision).
- Playground challenge results are client-graded and persist nothing: anything that grants a credential must be graded on the server.
- Third-party GitHub actions are referenced by tag (no commit SHA was invented); Dependabot keeps them current.
- E-mail addresses stored with capital letters before this change are not migrated.
- A live attack campaign against a running instance was not performed.
