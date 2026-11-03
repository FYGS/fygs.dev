# Security operations: what to configure, check and do

For the person who runs the platform. It lists what the code needs from its environment, the switches that exist, the checks to do
after each deployment, and what to do when something goes wrong. Findings and decisions of the audit are in
[SECURITY-HARDENING-TRACKER.md](SECURITY-HARDENING-TRACKER.md); the October 2026 operations notes (Redis alert, AI budget, PII in logs)
stay in [security-ops-2026-10.md](security-ops-2026-10.md).

## 1. Environment variables

| Variable | Purpose | If it is wrong |
|----------|---------|----------------|
| `BETTER_AUTH_SECRET` | Signs sessions, and (derived per purpose) the exam sittings and the proof-of-work challenges. 32 characters at least, random (`openssl rand -base64 48`). | The server refuses to start in production with a short or well-known value. |
| `BETTER_AUTH_URL`, `NEXT_PUBLIC_SITE_URL` | The public URL (`https://...`). Used for links in e-mails, redirects, the trusted origins of server actions and of cross-site write checks. | Links point to the wrong host; writes from the real host can be refused. |
| `CRON_SECRET`, `ADMIN_API_KEY` | Bearer secrets of `/api/cron/*` and `POST /api/maintenance`. **32 characters at least**, compared in constant time. | Shorter or missing: the endpoint answers 401 to everybody, by design. |
| `TRUSTED_PROXY_HOPS` | Number of reverse proxies in front of the application (1 for Traefik/Coolify alone, 2 with a CDN in front). The client address is the entry that many from the right of `X-Forwarded-For`. **Setting it also declares that your proxy overwrites `X-Real-IP`.** | Too low: every visitor looks like the proxy and shares one rate-limit bucket. Too high: a client can pick its own bucket. |
| `REDIS_URL` | Shared rate limits and replay protection. Without it the limits are per process, which is right for one instance. With it configured, endpoints that must not fail open (sign-in, sign-up, reset, contact) answer **503** if Redis is down instead of letting everybody through. | |
| `HUMAN_PROOF_MODE` | `enforce` (default in production), `report` (checks and logs, refuses nothing), `off`. See section 3. | `off` in production removes a layer; it is logged once at startup. |
| `CSP_NONCE_ENFORCE`, `CSP_NONCE_EXCLUDE` | See section 2. | |
| `DISPOSABLE_EMAIL_EXTRA_DOMAINS`, `EMAIL_DOMAIN_ALLOWLIST` | Comma-separated: add disposable-address providers without a deploy, or exempt a domain that was listed by mistake. | |
| `S3_PUBLIC_URL`, `MINIO_API_URL`, `IMAGE_REMOTE_HOSTS` | Hosts the image optimiser may fetch from. **Read at build time**: they must be build variables (Coolify: "Build variable"), not only runtime ones. Without them uploaded cover images stop displaying after a build. | A build warning `No storage host for the image optimiser` says so. |
| `STRIPE_ALLOW_PROMOTION_CODES` | `1` to allow promotion codes at checkout (default off). A 100 % code grants access for free. | |

## 2. Content-Security-Policy and the nonce switch

Signed-in areas (admin, dashboard, profile, learning, community) are rendered per request. They get a fresh nonce, and **no `'unsafe-inline'` for
scripts**: an HTML injection can no longer become script execution. Prerendered pages (marketing, catalogue, blog, TechMastery, and today the
sign-in pages) keep the policy with `'unsafe-inline'` because they are rendered once at build time and cannot carry a per-request nonce. Every
page also receives the nonce policy as **Report-Only**, so what enforcing it would break is measured on real traffic (`csp.violation` in the logs).

**If something breaks after a deployment** (a signed-in page is blank, a button does nothing, the console says *Refused to execute inline script*):

1. Set `CSP_NONCE_ENFORCE=0` and restart. Every page is back on the previous policy within a minute; the nonce policy keeps reporting.
2. Look for `csp.violation` events: the `blockedUri`/`violatedDirective` name the culprit (a third-party script, an inline script of a library).
3. For one page that cannot carry a nonce, add its path to `CSP_NONCE_EXCLUDE` (e.g. `/dashboard/old-page`) instead of switching everything off.

`scripts/ci/check-nonce-routes-dynamic.mjs` runs after the build in CI and fails when a prerendered page sits inside a nonce area. Pages that are excluded
today (`NONCE_EXCLUDED_PATHS` in `lib/csp.mjs`) include the sign-in, sign-up, verification and error pages: make them dynamic
(`export const dynamic = "force-dynamic"`) and the script will tell you they can leave the list. `style-src` keeps `'unsafe-inline'` (an inline style
cannot run code; React, Radix and Tailwind set many).

## 3. Proof-of-work and anti-automation

Sign-up, sign-in, password reset, contact, reviews, community posts and anonymous AI requests ask the browser for a small proof-of-work (a fraction of a
second of computation, in the background), signed by the server, bound to the action and to the visitor's network (/24 or /64), valid two minutes and
usable once. A network that was recently rate-limited is asked for more work. It is a cost for scripts, not a barrier for people, and it does not replace the
rate limits.

- Roll out in two steps: `HUMAN_PROOF_MODE=report` for a few days (look at `human_proof.rejected` events: a legitimate client that fails shows up here), then `enforce`.
- The end-to-end harness and any non-browser client run with `HUMAN_PROOF_MODE=off`.
- The contact form also has an invisible field and sends confirmations only to non-disposable addresses (3 a day per mailbox, 300 a day in total).
- To go further than self-hosted measures, a CAPTCHA (Turnstile, hCaptcha) can be added behind the same `verifyHumanProof` function without changing the callers.

## 4. After every deployment

- [ ] `GET /api/health` answers `ok`; `rateLimiter.mode` is `redis` if Redis is configured.
- [ ] Response headers of a page: `Strict-Transport-Security` with `preload`, `Content-Security-Policy` (nonce on `/fr/dashboard`), `Cross-Origin-Opener-Policy: same-origin-allow-popups`, `Permissions-Policy`.
- [ ] Sign in, open the dashboard, open a lesson, make a test payment in Stripe test mode, submit the contact form.
- [ ] No `csp.violation` flood, no `human_proof.rejected` for normal visitors, no `rate_limit.degraded`.
- [ ] Run the duplicate checks of the migration (top of `20261102100000_security_hardening`) **before** deploying a migration that adds unique indexes.

## 5. Checklist outside the repository

**Reverse proxy / hosting**
- The proxy **overwrites** (does not append to) `X-Forwarded-For` and `X-Real-IP` from the client, and the application port is not reachable except through it.
- `TRUSTED_PROXY_HOPS` matches the real number of proxies. With a CDN or Cloudflare in front of Traefik it is 2.
- TLS 1.2+ only; HTTP redirects to HTTPS; HSTS preload: submit the domain at hstspreload.org **only** after checking that every subdomain serves HTTPS for good.

**E-mail DNS** (the application sends from your domain; without these a forged mail looks genuine)
- SPF lists only your SMTP provider; DKIM is enabled and aligned; DMARC is at `p=quarantine` then `p=reject`, with a `rua` address that someone reads.
- The SMTP connection uses TLS (port 465, or 587 with required STARTTLS).

**Stripe**
- Webhook endpoint subscribed to: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`, `charge.refunded`, `charge.dispute.created`, `charge.dispute.closed`, `refund.updated`.
- A **restricted** API key (only the resources used), a distinct webhook signing secret per environment, live and test keys never mixed.
- Customer Portal: do not allow switching to arbitrary products; review the promotion-code setting.

**GitHub**
- Branch protection on `main`: pull request with review, required checks (lint, tests, build, audit, CodeQL), no force push, no deletion.
- Secrets: only the three Stripe **test** secrets exist for Actions. **If the production database URL, the Redis URL or a live Stripe key were ever stored as an Actions secret, rotate them now**: until this change the build job passed them to code from pull-request branches.
- Enable *Dependabot security updates*, *secret scanning with push protection* and *code scanning* in the repository settings.

**Data stores and storage**
- The application's database role is not a superuser and cannot `DROP` or `TRUNCATE`; migrations run with a separate role.
- Redis has a password and TLS, and is not reachable from the internet. Postgres likewise.
- Video and resource storage: private bucket, short-lived signed URLs; separate keys for images and media, scoped to the bucket; `X-Content-Type-Options: nosniff` and a restrictive CORS rule on the storage origin; a domain you own instead of a shared `sslip.io` host.
- Backups: daily, off-site, encrypted, and a **restore test** each quarter.

**Secrets rotation** (after any exposure, and every year): `BETTER_AUTH_SECRET` (signs out everybody), `CRON_SECRET`, `ADMIN_API_KEY`, Stripe webhook secret, storage keys, SMTP password, database and Redis passwords.

## 6. Incident response (short form)

1. **Contain**: `POST /api/maintenance` with the admin key puts the site in maintenance for everybody except `allowedIPs`; revoke the sessions of an account from the admin; rotate the exposed secret (section 5).
2. **Understand**: the `AuditLog` table says who did what to which object (roles, access grants, refunds, publications, deletions, two-factor); logs carry ids, not personal data; Stripe's dashboard has the payment side.
3. **Fix** on a branch, with a test that fails before and passes after; deploy.
4. **Tell**: a personal-data breach has to be notified to the CNIL within 72 hours and to the people concerned when the risk is high.
5. **Learn**: add the case to the audit tracker and a regression test.

Report a vulnerability: see [SECURITY.md](../SECURITY.md).
