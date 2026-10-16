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

### Held back on purpose

| Package | Why |
|---|---|
| `prisma` / `@prisma/client` 7+ | Requires driver adapters, a new generator and `prisma.config.ts`. It must be validated against a real database; this was not possible during the upgrade. |
| `typescript` 7 | The native compiler has no JS API: Next's type check and typescript-eslint cannot use it yet. Stays on 5.9. |
| `eslint` 10 | `eslint-config-next` 16 and its plugins only declare support up to ESLint 9. |
| `@types/node` 26 | Types follow the runtime: Node 22. |

## Lint

`eslint-plugin-react-hooks` 7 added React Compiler rules. They are reported as
warnings (about 680), not errors; fix them progressively.
