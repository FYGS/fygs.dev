# Security and operations hardening, October 2026

Four items: CSP, rate-limit degradation alert, AI tutor cost and observability, PII in logs.
Each section says what was decided, why, how to operate it, and what could not be verified.

## 1. Content-Security-Policy

### Decision

Keep `'unsafe-inline'` in the **enforced** `script-src`, add `script-src-attr 'none'` to it,
move the one first-party inline script out of the HTML, and ship a stricter policy in
**Report-Only** mode that reports to `/api/csp-report`. Nonces were evaluated and rejected for now.

### Why not nonces (option a)

- A nonce must be generated per request in `proxy.ts` and stamped by Next.js on its scripts. Next only does
  that for pages rendered per request. A statically generated page is rendered once at build time, so it
  cannot carry a per-request nonce, and a CDN or the ISR cache would serve the same nonce to everyone,
  which defeats the point.
- This site is mostly static: 184 `page.tsx` files, 3 locales (`generateStaticParams` in
  `app/[locale]/layout.tsx`), 116 tech-mastry pages and 30 blog posts, i.e. roughly 540 prerendered pages.
  Reading the nonce (`headers()`) in the root layout would turn every one of them into a dynamic render:
  a React render on every hit, no full-route cache, higher TTFB, and more load on a single Coolify
  container. The pages are content, not personalised, so that cost buys nothing but a nonce.
- The 'unsafe-inline' that remains is for the **RSC flight payload** (`self.__next_f.push([...])` inline
  scripts, different on every page and request) and Next's bootstrap. They cannot be hashed ahead of time
  (option b) because their content depends on the page data. Hash lists therefore do not work either, and
  `'strict-dynamic'` needs a nonce or hash to mean anything.

### What is enforced now (`lib/csp.mjs`)

`default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'self'`,
connect/frame allowlists limited to Stripe and Calendly, and new: `script-src-attr 'none'` (inline event-handler
attributes cannot run, which closes the most common XSS payload shape even with `'unsafe-inline'`).
The service-worker registration moved from an inline `<script>` to `public/sw-register.js`, so the only
executable inline scripts left are Next.js's own. JSON-LD blocks are `type="application/ld+json"`, which CSP
does not govern.

The playground keeps its own looser policy and COOP/COEP headers, unchanged (`blob:`, `wasm-unsafe-eval`, CDNs).

### Report-Only candidate

`Content-Security-Policy-Report-Only` (same routes as the enforced one, not the playground) drops
`'unsafe-inline'` for scripts and styles and never allows eval, with `report-uri /api/csp-report` and
`Reporting-Endpoints: csp="/api/csp-report"` (`report-to csp`). Next's inline scripts will show up as
`inline` violations on every page; that is expected and is the baseline. What matters is anything else:
a third-party script, `eval`, an unexpected origin, a blocked style.

`POST /api/csp-report` (`app/api/csp-report/route.ts`, `lib/csp-report.ts`): accepts `application/csp-report`
and `application/reports+json`, rate limited (30 per minute per IP, flood dropped silently), body capped at
16 KB, always `204`, stores nothing. Each distinct violation is logged at most once per ten minutes as
`warn` with the stable event name **`csp.violation`** and metadata `directive`, `blocked` (category or
origin, never a full URL), `page` (first three path segments, no query), `scriptUrl`, `line`, `disposition`,
`suppressedSinceLastLog`. The script sample, referrer, user agent and IP are never read or logged.

How to use it: search the logs for `csp.violation`, filter out `blocked:"inline"` on `script-src-elem`, and look at
the rest for a week or two. When only Next's inline scripts remain, the next step is to make the
dynamic part of the site opt in to nonces (see below) rather than the whole site.

### Path to nonces later

If the site moves its personalised area (dashboard, admin) to nonce CSP, do it per route group: a `proxy.ts`
branch for `/[locale]/(dashboard|admin)` that sets `Content-Security-Policy` with `'nonce-…' 'strict-dynamic'`
and the `x-nonce` request header; those pages are already dynamic (they read the session). Public pages
stay static with the policy above. Next 16's experimental SRI (`experimental.sri`) is the other candidate for
static pages; it is webpack-only and does not cover inline flight scripts, so it does not remove
`'unsafe-inline'` by itself.

### Verification

Unit tests: `tests/unit/csp.test.ts` (enforced, report-only, playground, route matching) and
`tests/unit/api/csp-report.test.ts` (both report formats, no PII in logs, throttle, rate limit, size and type
checks). Browser results are in the section "Real Chrome run" at the end.

## 2. Rate-limit degradation alert

`lib/rate-limit.ts` already fell back to per-process counters when Redis is unreachable (circuit breaker:
500 ms timeout, 10 s pause). Now it also tells operators.

- On entering degraded mode it logs at **error** level the stable event **`rate_limit.degraded`** with
  `reason` (error class only, never the message, which can contain hosts or credentials), `transitions`,
  `fallbackDecisions`. While the outage lasts, a reminder (`ongoing:true`) is written at most once per
  minute; entering and reminders share the same budget, so a flapping Redis cannot flood the logs.
- On recovery it logs `rate_limit.recovered` at **info** level (duration in `duration`, ms), also throttled
  to one per minute. It is deliberately not an error so an "error-level" alert does not fire on recovery.
- `GET /api/health` (`app/api/health/route.ts`) returns `{ "status": "ok" | "degraded", "rateLimiter": { mode,
  degraded, degradedSince, degradedTransitions, fallbackDecisions } }`. It reads in-process counters only (no
  Redis, DB or network call), is unauthenticated, `no-store`, and exposes no host, error text or version.
  HTTP status stays 200 while the process serves: a restart does not fix Redis, so do not wire `degraded` to
  a liveness probe. `mode` is `redis`, `memory-fallback` or `unknown` (nothing checked yet since start).
- Counters are per instance: sum `fallbackDecisions` and count instances with `degraded:true`.

### How to alert

- Log based (preferred): alert when at least one `rate_limit.degraded` event appears (message equals
  `rate_limit.degraded`, level error; production logs are one JSON object per line, see
  `lib/structured-logger.ts`). Resolve on `rate_limit.recovered`. Page if degraded for more than 5 minutes
  (no `rate_limit.recovered` after the first `rate_limit.degraded`; reminders every minute make this a simple
  "event seen in the last 2 minutes" rule).
- Probe based: poll `/api/health` every minute and alert on `status == "degraded"` for 5 consecutive probes
  (Uptime Kuma, Coolify, or any HTTP monitor with a JSON path check).
- What degraded means: limits still apply, but per instance. With N instances an attacker gets up to N times
  the budget, and sensitive callers that set `failMode:"closed"` refuse requests instead (login-type routes will
  show an increase in 429s). The AI daily budget also falls back to per-instance counters (section 3).

Tests: `tests/unit/rate-limit.test.ts` (breaker open/close, log throttling, transitions, status) and
`tests/unit/api/health-route.test.ts`.

## 3. AI tutor cost and observability

### Budgets (`lib/ai/budget.ts`, `app/api/ai/assistant/route.ts`)

| Variable | Default | Meaning |
| --- | --- | --- |
| `AI_DAILY_REQUEST_BUDGET` | 2000 | model requests per UTC day, all users |
| `AI_DAILY_OUTPUT_TOKEN_BUDGET` | 1500000 | output tokens per UTC day, all users |
| `AI_USER_DAILY_REQUESTS` | 150 | per signed-in account, rolling 24 h (on top of 60 per hour) |
| `AI_GUEST_DAILY_REQUESTS` | 20 | per visitor IP, rolling 24 h (on top of 8 per hour) |

`0` disables a cap; an invalid value keeps the default (a typo must not remove the guard rail).
At default values the worst case is about 1.5 M output tokens per day, whatever the traffic.

- The global counters are Redis keys `ai:budget:<UTC date>:requests|output` (atomic `INCRBY` + `EXPIRE`, two days
  TTL). If Redis is unreachable they fall back to in-process counters, so each instance enforces the full budget
  on its own (worst case budget x instances, never unlimited).
- A request is counted before the upstream call; output tokens are added after the answer, from the provider's
  `message_delta` usage, or estimated at 4 characters per token if the stream was cut. When either budget is
  reached the route answers from the offline analyzer, with a notice in the user's language and
  `meta: {"mode":"offline","reason":"budget"}`. HTTP status stays 200 (the UI already renders offline mode).
  The first exhaustion each minute logs the error event **`ai.assistant.budget_exhausted`** (alert on it).
- The per-account/visitor daily cap answers `429 rate_limited` with `Retry-After` and logs the warn event
  `ai.assistant.daily_cap_reached`.

### Observability (no content)

| Event | Level | Metadata |
| --- | --- | --- |
| `ai.assistant.completed` | info | outcome (`ok`/`aborted`), model, mode, surface, inputTokens, outputTokens, cacheReadTokens, stopReason, truncated, timeToFirstTokenMs, `duration` (total ms), `userId` when signed in |
| `ai.assistant.stream_error` | error | same, plus `errorCode` |
| `ai.assistant.upstream_error` | error | phase `open`, code, `upstreamStatus` (provider HTTP status), model, duration |
| `ai.assistant.internal_error` | error | phase, model, duration |
| `ai.assistant.budget_exhausted` | error | which budget (`requests`/`output_tokens`), store (`redis`/`memory`) |
| `ai.assistant.daily_cap_reached` | warn | signedIn, limit |

Prompts, code, file names, the answer and provider response bodies are never logged. The logger redaction
(section 4) is an additional net. The API key: `getAiConfig()` returns it as a non-enumerable property (it does
not survive `JSON.stringify`, spreads or logger context), it is only read in `lib/ai/`, never in a client
component, never in `next.config.mjs` or a `NEXT_PUBLIC_` variable, and only goes out in the `x-api-key` header of the
upstream request. `tests/unit/ai/key-safety.test.ts` enforces all of that by scanning the sources.

Tests: `tests/unit/ai/budget.test.ts` (fake clock, UTC rollover, Redis path and fallback, hang),
`tests/unit/api/ai-assistant-budget.test.ts` (mocked fetch: degradation, caps, usage logs, no content or key in
logs), `tests/unit/ai/anthropic.test.ts` (usage parsing), `tests/unit/ai/key-safety.test.ts`.

## 4. PII in logs

### Policy

Logs may contain opaque identifiers (`userId`, `courseId`, `subscriptionId`, Stripe object ids), counts,
timings, status codes and error classes. Logs must not contain: email addresses, names, phone numbers,
postal addresses, IP addresses, card or bank data, passwords, tokens, API keys, cookies, authorization headers,
message or form bodies, source code submitted by users, or prompts. Use the user id to correlate.

### Enforcement

- `lib/log-redaction.ts` (`redact`, `redactString`): drops values under sensitive keys (`email`, any key ending
  in `email`/`token`/`phone`, `to`, `name`, `firstName`, `lastName`, `ip`, `password`, `secret`, `apiKey`,
  `authorization`, `cookie`, `iban`, `card*`, `body`, `html`, `prompt`, `content`, `text`, ...; short values under
  ambiguous keys such as a status `code` stay readable), masks emails inside any string as `a***@domain`,
  keeps the first two octets of IPv4, and replaces bearer tokens, JWTs and well-known API key formats.
  Errors are reduced to name, code, masked message, a short masked stack and their cause; circular references,
  depth (8) and array length (100) are bounded. Counters such as `inputTokens` are not touched.
- `lib/structured-logger.ts` applies it to message, context and error for every level and output (before this
  the logger only deleted six top-level keys and printed raw `Error` objects).
- `instrumentation.ts` installs the same redaction on `console.log/info/warn/error/debug` in the Node runtime
  (production and test; development keeps the raw console unless `LOG_REDACTION=1`). This covers the several
  hundred `console.error("...", error)` call sites, whose Stripe, SMTP and database errors can carry customer
  details, without touching each one.
- Call sites fixed: password-reset hook (`lib/auth.ts`, logged the user's email), Stripe webhook handlers
  (`userEmail` in 5 info logs), review notifications (`instructorEmail`, `studentEmail`).
- Audit result for `lib/emails`, `lib/payments`, `app/api/**`, `app/actions/**`: no other raw personal data
  written by design; the remaining `console.error(..., error)` calls are now covered by the console redaction.
- `tests/unit/lib/log-redaction.test.ts` covers nested objects, arrays, errors and causes, circular and shared
  references, hostile getters, console patch, the structured logger, and a source scan that fails the build
  if a `console.*`/`logger.*` call in `app/api`, `app/actions`, `lib`, `hooks`, `providers` prints an email,
  password, token, secret, cookie or `*Email` metadata.

### Limits

Redaction is pattern based: free text that contains a person's name without an email or a sensitive key is not
detected. Do not log free text. Third parties (Stripe dashboard, SMTP provider, analytics) keep their own data
and are outside this policy.

## Real Chrome run (CSP)

Chrome (`channel: "chrome"`, Playwright) against a minimal page that has the site's script mix and the real
headers from `lib/csp.mjs` (inline Next-style flight scripts, a `type="application/ld+json"` block, the external
`/sw-register.js`, an inline style, an `onclick` attribute, an `eval` call):

| Check | Enforced policy | Playground policy |
| --- | --- | --- |
| inline `self.__next_f.push(...)` script runs | yes | yes |
| external `/sw-register.js` loads | yes | yes |
| JSON-LD block | not subject to CSP | same |
| `onclick="..."` attribute | **blocked** (`script-src-attr`) | allowed |
| `eval()` (production policy) | blocked | allowed |
| report-only policy | reports `script-src-elem inline` x2, `style-src-elem inline`, `script-src-attr`, `eval` | none sent |

So the report-only baseline on any page is "Next's inline scripts and styles", as predicted, and the enforced
policy changes nothing for the page except inline event-handler attributes.

Not verified here: full pages of the site in Chrome. A `next dev --webpack` compile of the home page took 30
minutes on this machine (memory pressure) and was stopped, no production build is available in this worktree, and
the 540 static pages could not be measured (the estimate above comes from counting routes and content files).
Headless Chrome also did not deliver the violation reports to `/api/csp-report` within 75 s (Playwright's Chrome
profile may disable the reporting service), so end-to-end delivery is covered by unit tests of the endpoint only.
After deployment: open any page in a normal Chrome and watch for `csp.violation` in the logs, and check in
DevTools (Network, response headers) that `Content-Security-Policy`, `Content-Security-Policy-Report-Only` and
`Reporting-Endpoints` are present on a blog post, `/auth/login`, a system-design page, and that the playground
still has only its own policy with COOP/COEP.
