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
- Stripe: SDK 23 on its default API version (`2026-09-30.endive`), no pin any more.
  Migrated and verified against Stripe TEST mode, see [Stripe](#stripe-api-version-migration).
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

## Stripe API version migration

### Decision

`lib/stripe.ts` no longer pins `2025-08-27.basil`: `new Stripe(key)` uses the version
built into the SDK (`Stripe.API_VERSION`, exported as `STRIPE_API_VERSION`).

- The SDK's typings describe exactly that version. The pin needed an
  `as unknown as Stripe.LatestApiVersion` cast, i.e. the types lied about the shapes
  the code received; that is gone.
- Compared on the TEST account with both versions (same object requested at
  `2025-08-27.basil` and `2026-09-30.endive`): subscription, invoice, invoice payments,
  refund and Checkout Session are identical for every field the code reads. The only
  differences seen: Checkout `ui_mode` (`hosted` → `hosted_page`, the app does not set
  it) and one extra null key (`license_fee_subscription_details`) in an invoice line's
  `parent` on basil.
- Cost: the version moves with the SDK major. `tests/unit/lib/stripe-client.test.ts`
  fails if the client is ever constructed with an explicit version again, and
  `scripts/stripe-smoke.mjs` is the check to run on every SDK upgrade.

### Webhook endpoint version (independent of the SDK)

The payload of a webhook is rendered with the API version **of the endpoint** in the
Stripe dashboard, not the SDK's. The handlers accept both shapes and are tested on both
(`tests/fixtures/stripe`, `toLegacyEvent`):

| Field | basil and later | before basil (also read) |
|---|---|---|
| invoice → subscription | `invoice.parent.subscription_details.subscription` | `invoice.subscription` |
| billing period | `subscription.items.data[i].current_period_start/end` | `subscription.current_period_start/end` |

The test account's default version is `2025-08-27.basil` (events recorded there carry
`api_version: 2025-08-27.basil`; it has no webhook endpoint configured).

### Rollout (safe order)

1. **Deploy this code first**, with the endpoint untouched. Handlers read old and new
   shapes, so nothing changes for the running endpoint.
2. Add `checkout.session.async_payment_succeeded` to the events of the endpoint
   (Dashboard → Developers → Webhooks). The other events stay:
   `checkout.session.completed`, `customer.subscription.created|updated|deleted`,
   `invoice.payment_succeeded`, `invoice.payment_failed`.
3. Optionally move the endpoint to the SDK's version so that payloads and typings
   match (Dashboard → the endpoint → API version, upgrade after sending a test event).
   If the dashboard cannot upgrade it in place, create a new endpoint at the new
   version: it has **another signing secret**, so deploy the new `STRIPE_WEBHOOK_SECRET`
   and disable the old endpoint in the same window. Events that fail verification in
   between are retried by Stripe for 3 days, and every event id is processed once
   (`stripe-event:<id>` claim), so both endpoints may overlap without double
   processing.
4. Verify with a test purchase (card `4242 4242 4242 4242`): one `Payment` row per
   payment, `Subscription` ACTIVE with the right period end.
5. Rollback is a no-op for the code (it reads both shapes): re-point the endpoint to the
   previous version.

The smoke script below refuses anything but a `sk_test_` key, so it is safe to run
before step 3 against the test account (not against the live endpoint).

### Smoke test against TEST mode

```
node scripts/stripe-smoke.mjs                      # key from STRIPE_SECRET_KEY or ./.env
node --env-file=.env scripts/stripe-smoke.mjs
```

Creates a customer (`pm_card_visa`), product and two prices, a subscription, reads the
invoice and its payment the way `requestRefund` does, previews an invoice, switches
plan, creates both hosted Checkout Sessions with the payloads the app sends, refunds
twice with the same idempotency key (one refund), cancels, opens a billing-portal
session, then removes what it created. Prints PASS/FAIL per step, never a secret;
exit code 1 on any failure, 2 when the key is not a test key.

### Bugs fixed on the way

| Bug | Evidence |
|---|---|
| Plan switch wrote `Invalid Date` periods and failed after Stripe had switched the price (root `current_period_*` no longer exists) | `switchSubscriptionPlan` read the subscription root; the recorded subscription has the period only on the item |
| Proration audit never ran: `invoices.retrieveUpcoming` does not exist any more | `GET /v1/invoices/upcoming` answers 404 "deprecated" on both versions; replaced by `invoices.createPreview` (its id `upcoming_in_…` is not an invoice, kept in metadata) |
| A subscription purchase created two COMPLETED payment rows | `checkout.session.completed` keyed on the subscription id, `invoice.payment_succeeded` on the invoice id; both now settle one row keyed on the invoice, in any order |
| A course bought with a 100% promotion code gave no access | Recorded session: `payment_status: paid`, `payment_intent: null`, `amount_total: 0`; the handler required a PaymentIntent |
| A delayed payment method would never have been fulfilled (not reproducible on the test account, whose session offers only instant methods) | `checkout.session.async_payment_succeeded` was not handled |
| Success/cancel/return urls had a double slash (`https://host//formations/…`) | `SITE_BASE_URL` is a `URL`; interpolated it ends with `/` |
| Opening a second subscription checkout locked out an active member (row set to INCOMPLETE) | checkout route upserted INCOMPLETE unconditionally |

### Not changed

- `charge.refunded` (refund done from the dashboard) is acknowledged and ignored: the
  `Payment` row stays COMPLETED. Refunds through the app cancel the subscription, which
  arrives as `customer.subscription.deleted`.
- `switchSubscriptionPlan` still reports hard-coded proration amounts (5000 / -3000
  cents) to the caller; the real figure is now in the `PRORATION` audit row.
- `checkout-session-completed.ts` sends the premium welcome mail only for
  `type === "premium_subscription"`, which the checkout route never sets; the welcome
  mail is sent by `customer.subscription.created`.
- Abandoned checkouts leave PENDING placeholder rows (as before).
