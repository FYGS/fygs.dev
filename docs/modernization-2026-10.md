# Modernization — October 2026

What changed on `feature/refactor-harmonize-codebase`, what to do when deploying it,
and what was deliberately **not** upgraded.

## Deploying

| Item | Action |
|---|---|
| `BETTER_AUTH_SECRET` | **Required** in production (>= 32 chars). The server answers 500 without it instead of falling back to a public placeholder. |
| `TRUSTED_PROXY_HOPS` | Number of reverse proxies in front of the app (`1` behind Coolify/Traefik). Used for the client IP in rate limiting. |
| `ANTHROPIC_API_KEY` | Enables the real AI assistant. Without it the assistant runs in offline mode (heuristic analyzer). Optional: `AI_MODEL`, `ANTHROPIC_BASE_URL`. |
| Server action ids | They changed (files were split and moved): clients holding an old page open may get one failed action until they reload. |
| Node | **22+** (CI updated). |
| Build / dev | Both run on **webpack** (`next build --webpack`, `next dev --webpack`): `next-pwa` and the Monaco plugin need it. |
| Content-Security-Policy | Defined in `lib/csp.mjs` (site-wide + a looser policy for the playground). |
| Prisma 7 | `pnpm install` then `prisma generate` (the `postinstall` does it) writes the client to `lib/generated/prisma` (gitignored). `DATABASE_URL` is read by `prisma.config.ts` (CLI) and `lib/db.ts` (runtime). In a Docker build run `npx prisma generate` after copying `prisma.config.ts` and `prisma/`; `migrate deploy` needs the `prisma` package and `DATABASE_URL` at run time. The `pg` driver validates TLS certificates itself: if the old setup relied on an unverifiable certificate, fix the CA (`NODE_EXTRA_CA_CERTS`) rather than disabling verification. |

## Dependencies

Everything was moved to the latest stable release, including majors: Next 16,
React 19.3, zod 4, Stripe SDK 23, better-auth 1.7, jspdf 4, next-mdx-remote 6,
nodemailer 10, vitest 5, framer-motion 14, lucide 1, recharts 3, mermaid 12,
shiki 4, monaco 0.57, intlayer 9, tailwind-merge 3, react-day-picker 10…

Each step was verified rather than assumed:

- better-auth: the real configuration is exercised against its in-memory adapter
  (sign-up, mandatory email verification, sign-in, session, role not settable,
  password reset) and every column it expects is checked against `schema.prisma`.
- next-mdx-remote 5 → 6: the 30 blog posts render to byte-identical HTML.
- jspdf 2 → 4: the CV and certificate PDFs carry identical text.
- Stripe: SDK 23 with the API version pinned to `2025-08-27.basil`, so requests and
  webhook payloads are unchanged (see `lib/stripe.ts`). Moving to the SDK default
  version is a separate migration that needs a Stripe test run.
- Monaco 0.57, Next 16 and the playground: checked in Chrome on a production build
  (workers, diagnostics, completion, the 12 templates, 144 routes).

Audit (public npm advisory endpoint): 17 critical / 134 high before,
**0 critical / 2 high** after. The two remaining highs have no usable fix
(`braces` has no patched release and is dev tooling; `deepmerge-ts` is inside the
Prisma CLI, build time only).

### Prisma 7

Prisma moved from 6.19 to **7.10** (not the 8 release candidate), validated against a real
PostgreSQL (see the test database below):

- generator `prisma-client` writing to `lib/generated/prisma` instead of `node_modules`; every `@prisma/client` import now points there (`lib/generated/prisma/client`, or the browser-safe `.../browser` entry for files that only need enums and types, which keeps `node:` modules out of client bundles);
- `datasource.url` moved from `schema.prisma` to `prisma.config.ts` (`.env` is loaded there explicitly);
- `lib/db.ts` builds the client on `@prisma/adapter-pg` (+ `pg`), same `db` export and same `globalThis` singleton; `connectionTimeoutMillis` is 5 s as with Prisma 6;
- `prisma/seed.ts` is a thin CLI over the importable `runSeed()` (`prisma/seed/run.ts`);
- `prisma/migrations` still produces exactly `schema.prisma` (`pnpm db:check-migrations`).

### Test database

Integration tests no longer need Docker or a remote database. `scripts/test-db.mjs` starts a real
PostgreSQL (npm `embedded-postgres`, 17.x binaries), applies the schema with `prisma db push`
and runs the suite (`pnpm test:integration`); CI runs it on the embedded server and on a
service container. See `tests/README.md`. Older contract suites that no longer match the app are
quarantined in `vitest.integration.config.ts` (`STALE_SUITES`) until they are fixed.

### Held back on purpose

| Package | Why |
|---|---|
| `typescript` 7 | The native compiler has no JS API: Next's type check and typescript-eslint cannot use it yet. Stays on 5.9. |
| `eslint` 10 | `eslint-config-next` 16 and its plugins only declare support up to ESLint 9. |
| `@types/node` 26 | Types follow the runtime: Node 22. |

## Lint

`eslint-plugin-react-hooks` 7 added React Compiler rules. They are reported as
warnings (about 680), not errors; fix them progressively.
