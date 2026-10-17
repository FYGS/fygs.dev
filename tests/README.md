# Test Infrastructure Guide

## Overview

Two Vitest suites and a Playwright suite:

| Suite | Command | Needs |
|---|---|---|
| Unit (`tests/unit`) | `pnpm test` | nothing (mocks only) |
| Integration (`tests/integration`, `tests/contract`, `tests/reviews`) | `pnpm test:integration` | nothing to install: a disposable PostgreSQL is started for you |
| Browser e2e (`tests/e2e`, Playwright) | `pnpm test:e2e` | Google Chrome; builds the app on first run (see below) |

## Test database

Integration tests run against a **real PostgreSQL with the real Prisma schema**.
No Docker, no installed Postgres, no remote database.

`scripts/test-db.mjs` uses the `embedded-postgres` npm package (real PostgreSQL
binaries for Windows, macOS and Linux). For each run it:

1. creates a throw-away data directory in the OS temp folder and starts PostgreSQL on a free port (UTF8, fsync off);
2. creates the `fygs_test` database and applies `prisma/schema.prisma` with `prisma db push`;
3. runs the command you gave it with `DATABASE_URL` / `TEST_DATABASE_URL` pointing at it;
4. stops PostgreSQL and deletes the directory, whatever the outcome.

```bash
pnpm test:integration          # one-shot: start DB, push schema, run vitest, tear down
pnpm test:db                   # keep a DB running (port 54329, Ctrl+C to remove) for manual work
pnpm test:integration:watch    # watch mode (globalSetup starts its own DB)
pnpm db:check-migrations       # prisma/migrations must produce exactly schema.prisma
```

Run a single file: `pnpm test:integration tests/integration/db/refund.test.ts`.

### Using another PostgreSQL (CI service container, docker-compose)

Set `TEST_DATABASE_URL` and the same tests run against that server (the schema
is pushed to it first):

```bash
docker compose -f docker-compose.test.yml up -d --wait postgres-test
TEST_DATABASE_URL=postgresql://postgres:password@localhost:5433/fygs_test pnpm test:integration
```

CI runs both ways (`integration` job in `.github/workflows/ci-cd.yml`: embedded and
service container).

### Safety

The suite empties tables, so `scripts/test-db.mjs` and the globalSetup refuse any
database that is not on `localhost`/`127.0.0.1` and whose name does not contain
`test`. `DATABASE_URL` from your shell or `.env` is never used by the integration
suite, so the remote development database cannot be reached.

## Writing a DB-backed test

```ts
import { db } from "@/lib/db";                       // the app's own Prisma client, on the test DB
import { resetDatabase } from "../../support/test-db"; // TRUNCATE ... CASCADE
import { createUser, createCourse, enroll } from "../../support/factories";

beforeEach(() => resetDatabase(db));
afterAll(async () => { await resetDatabase(db); await db.$disconnect(); });
```

Mock only what is outside the process: Stripe (`@/lib/payment-service`), e-mail
(`@/lib/email-service`), Redis (`@/lib/redis`, the rate limiter then uses its
in-process fallback), the session (`@/lib/auth`) when testing a server action.
`tests/support/next-mocks.ts` (loaded for every integration test) stubs
`next/cache` and `next/headers`. Always `resetDatabase` in `afterAll` too: the
suites run sequentially on one database and some assert on global counts.

Examples: `tests/integration/db/` (auth flow on the real better-auth Prisma
adapter, `AccessService`, quiz grading, refund eligibility, community write
limits, schema and the real `prisma/seed` orchestrator).

## Configuration

- **Unit config**: `vitest.config.ts`
- **Integration config**: `vitest.integration.config.ts` (`globalSetup: tests/support/global-setup.ts`)
- **Setup file**: `tests/setup.ts`
- **Helpers**: `tests/support/` (`test-db.ts`, `factories.ts`, `global-setup.ts`, `next-mocks.ts`)

### Test Organization

```
tests/
├── setup.ts              # Global test setup and cleanup
├── support/               # Test database helpers, factories, Next.js stubs
├── unit/                  # Unit tests
├── integration/           # Integration tests (db/ = DB-backed suites)
├── contract/              # Contract tests
├── e2e/                   # Browser end-to-end tests (Playwright, production build)
└── reviews/               # Review system specific tests
    ├── unit/              # Review unit tests
    ├── integration/       # Review integration tests
    ├── e2e/               # Review e2e tests
    └── fixtures/          # Test data and fixtures
```

### Troubleshooting

**`initdb` / PostgreSQL does not start on Linux**: PostgreSQL refuses to run as root; use a normal user.

**Leftover directories**: a killed run can leave `fygs-test-db-*` folders in the OS temp directory; they are safe to delete.

**Slow first run**: `pnpm install` downloads the PostgreSQL binary (about 50 MB) once.

## Browser e2e (Playwright + system Chrome)

`tests/e2e` drives a real Chrome against a **production build** (`next build` + `next start`)
wired to the same disposable PostgreSQL as the integration suite. One command:

```bash
pnpm test:e2e                      # DB + migrations + seed, build (first run only), start, test, tear down
pnpm test:e2e:build                # same, forcing a fresh `next build --webpack` (5-13 min)
pnpm test:e2e -- --grep playground # arguments after `--` go to Playwright (-g, file names, --headed...)
pnpm test:e2e --serve              # keep DB + server up and write .e2e-serve.json (for debugging a spec)
```

`scripts/e2e.mjs` does: embedded PostgreSQL (`prisma migrate deploy`, then `prisma/seed`) ->
build when `.next/BUILD_ID` is missing (static pages are generated from the seeded data) ->
`next start` on port 3100 (or a free one) -> `playwright test` -> teardown, even on failure.
Needs Google Chrome installed (`E2E_CHROME_PATH` selects another binary); no browser download.

What the app runs with:

| Concern | Setup |
|---|---|
| E-mail | `EMAIL_TRANSPORT=capture`: messages are appended to a JSON-lines file (`E2E_MAIL_FILE`), the tests read verification / reset links from it. See the guard below |
| AI assistant | no API key: the offline analyzer answers |
| Redis | none: the rate limiter and view counters fall back to memory (`REDIS_URL` and the Upstash variables of `.env` are blanked) |
| Stripe | the TEST key from `.env` or the environment, only when it starts with `sk_test_`; used for one smoke test (pricing -> Stripe-hosted checkout URL, nothing is paid). Without a test key that test skips |
| Secrets | `BETTER_AUTH_SECRET` from the environment or a fixed throw-away value; `DATABASE_URL` is always the embedded database, never the one in `.env` |

### The mail-capture hook (test only)

`lib/emails/service/capture.ts`, called from `EmailTransport.sendEmail`. It is inert unless
`EMAIL_TRANSPORT=capture`, and then it **fails closed**: it throws (mail is neither sent nor
dropped silently) unless *all* of these hold:

- `E2E_ALLOW_EMAIL_CAPTURE=yes-this-is-a-disposable-environment`
- `EMAIL_CAPTURE_FILE` is set
- `DATABASE_URL` points to `localhost` / `127.0.0.1` **and** the database name contains `test`

A real deployment (remote database) can therefore not enable it by accident.
`tests/unit/lib/email-capture.test.ts` pins the guard.

### Conventions

- Each test creates its own user (`tests/e2e/support/db.ts`, plain `pg` + better-auth's `hashPassword`) and signs in
  through the real endpoint (`signInViaApi`), except the tests that exercise sign-up / login themselves.
- Every test gets its own client IP for the app's rate limiter (`X-Forwarded-For`, last hop is trusted, see `lib/rate-limit.ts`).
- Uncaught page errors fail the test (`pageErrorGuard` fixture). No retries: a flaky test is a bug.
- Locale cookies (`locale_selected`, `NEXT_LOCALE`) skip the language modal; tests run in `fr`, plus `en` where noted.
- Playground tests hide `SharedArrayBuffer` (`addInitScript`): WebContainer needs the network and cannot boot in CI, so the
  playground takes its sandboxed-iframe fallback for JavaScript/TypeScript.
- The service worker is blocked (`serviceWorkers: "block"`) so cached pages cannot leak between tests.

| Spec | Covers |
|---|---|
| `visitor.spec.ts` | home / blog / pricing / contact validation, skip link and single `<main>`, public pages smoke, 404, English |
| `auth.spec.ts` | sign-up -> captured e-mail -> verify -> auto sign-in -> profile -> sign-out, unverified refusal, wrong then right password, forgot / reset password |
| `learner.spec.ts` | catalogue, enroll in a free course, lesson progress, quiz graded server-side (answers absent from HTML and RSC), certificate eligibility, learner area smoke |
| `access-control.spec.ts` | anonymous redirects (with callback), student blocked from `/admin`, admin allowed, every admin page renders |
| `playground.spec.ts` | Monaco, run the default template, AI panel (Ctrl+I) offline, "explain this error" |
| `stripe-checkout.spec.ts` | pricing -> subscribe -> `checkout.stripe.com` |
| `security-headers.spec.ts` | CSP, `X-Frame-Options`, no `x-powered-by`, COOP/COEP on the playground only |

CI: job `e2e` in `.github/workflows/ci-cd.yml` (Chrome via `browser-actions/setup-chrome`, traces and screenshots uploaded on failure).

## Review System Tests

The comprehensive review system includes tests for:

- ✅ Review creation and validation
- ✅ Voting system (helpful/not helpful)
- ✅ Reply system with moderation
- ✅ Reporting and content moderation
- ✅ Search and filtering
- ✅ Permission checks
- ✅ Rate limiting
- ✅ Email notifications
- ✅ Analytics and statistics

All review functionality is tested with proper database isolation and realistic test scenarios.
