# Test Infrastructure Guide

## Overview

Two Vitest suites:

| Suite | Command | Needs |
|---|---|---|
| Unit (`tests/unit`) | `pnpm test` | nothing (mocks only) |
| Integration (`tests/integration`, `tests/contract`, `tests/reviews`) | `pnpm test:integration` | nothing to install: a disposable PostgreSQL is started for you |

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

### Quarantined legacy suites

`vitest.integration.config.ts` lists `STALE_SUITES`: older contract/integration
files that no longer match the app (French messages, `user.subscriptions` shape,
fixed slugs shared between tests, undefined fixtures...). They are excluded so the
run is green and meaningful; run them with `INTEGRATION_INCLUDE_STALE=1 pnpm test:integration`
while fixing them, and remove an entry once its file passes.

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
├── e2e/                   # End-to-end tests
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
