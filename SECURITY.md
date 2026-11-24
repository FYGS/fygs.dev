# Security Policy

## Supported Versions

FYGS.dev is a continuously deployed service, not a library: only the code on the `main` branch (what runs at fygs.dev) receives security fixes.
Older tags and branches are not maintained.

## Reporting a Vulnerability

We take the security of FYGS.dev seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please send an email to security@fygs.dev. You should receive a response within 24 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the requested information listed below (as much as you can provide) to help us better understand the nature and scope of the possible issue:

* Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
* Full paths of source file(s) related to the manifestation of the issue
* The location of the affected source code (tag/branch/commit or direct URL)
* Any special configuration required to reproduce the issue
* Step-by-step instructions to reproduce the issue
* Proof-of-concept or exploit code (if possible)
* Impact of the issue, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

## Preferred Languages

We prefer all communications to be in English or French.

## Scope and good faith

In scope: fygs.dev and its subdomains, the code of this repository. Out of scope: denial-of-service and volumetric testing, social engineering of
people, physical attacks, third-party services (Stripe, the hosting provider, the e-mail provider), and automated scanners run against production
without a prior agreement. Test with accounts you created, do not access or keep other people's data beyond what is needed to show the issue, and give us
a reasonable time to fix it before disclosing. We will not pursue anyone who acts in good faith within this scope.

## Security Update Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find any similar problems
3. Prepare fixes for all supported versions
4. Release new versions as soon as possible

## Controls in place (summary)

| Area | Control |
|------|---------|
| Sessions and accounts | better-auth sessions (7 days, sliding), e-mail verification, other sessions revoked on password change and reset, two-factor (TOTP) required for administrators and instructors, rate limits per address and per account, startup refusal of a weak `BETTER_AUTH_SECRET` |
| Access control | Server-side checks on every action and route (role and ownership in the same query), one entitlement rule for courses, append-only audit trail of privileged actions |
| Input and output | All HTML written by hand goes through `escapeHtml`; user HTML is rendered through an allow-list sanitiser; redirect targets must be paths of the site; uploads are role-gated, type- and size-limited |
| Transport and browser | HSTS with preload, Content-Security-Policy (per-request nonce on signed-in areas, no `unsafe-inline` for their scripts), cross-site writes to the API refused, frame, MIME-sniffing and referrer protections, cross-origin isolation only where WebContainer needs it |
| Abuse | Rate limits that fail closed where it matters, self-hosted proof-of-work and honeypot on sensitive forms, disposable-address filtering, stricter caps for new accounts, daily AI budget |
| Payments | Prices read from the database, signed Stripe webhooks claimed once with a lease, refund and dispute handling, guards against double purchase and refund loops |
| Supply chain and CI | Dependency audit that blocks on high and critical advisories (dated exceptions only), weekly Dependabot, read-only workflow tokens, no production secret reachable from a pull request, CodeQL results always published |
| Code execution | Learners' code runs in a sandboxed, network-less frame; the playground is isolated from the site's origin |

Operations (configuration, switches, checklists, incident response): [docs/SECURITY-OPERATIONS.md](docs/SECURITY-OPERATIONS.md).
Audit findings and their status: [docs/SECURITY-HARDENING-TRACKER.md](docs/SECURITY-HARDENING-TRACKER.md).

## Comments on this Policy

If you have suggestions on how this process could be improved, please submit a pull request.

## Logging and personal data

Logs carry opaque ids (user id, course id, Stripe object ids), counts and timings, never emails, names, IPs,
payment data, credentials, message bodies, prompts or user code. The structured logger and `console.*` redact
these centrally (`lib/log-redaction.ts`, installed from `instrumentation.ts`), and a unit test scans the sources for
risky logging calls. Details, the CSP decision, the Redis degradation alert and the AI cost guard rails are in
[docs/security-ops-2026-10.md](docs/security-ops-2026-10.md).
