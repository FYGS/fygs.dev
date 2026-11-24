# 📝 Changelog

> All notable changes to FYGS.dev will be documented in this file.

[![Keep a Changelog](https://img.shields.io/badge/Keep%20a%20Changelog-1.0.0-orange?style=flat-square)](https://keepachangelog.com/en/1.0.0/)
[![Semantic Versioning](https://img.shields.io/badge/Semantic%20Versioning-2.0.0-blue?style=flat-square)](https://semver.org/spec/v2.0.0.html)

## [Unreleased] - 2026-10

### Deployment
- Production image: multi-stage `Dockerfile` (Next.js `output: "standalone"`, Node 22, non-root, `tini`, health check on `/api/health`), `.dockerignore`, and `docker-entrypoint.sh` that applies the pending migrations (`RUN_MIGRATIONS=1`, direct connection through `MIGRATE_DATABASE_URL`) before the server starts. Procedure for Coolify in `docs/COOLIFY.md`.
- MinIO removed: images use the same S3-compatible client as the paid media (`lib/image-storage.ts`, `S3_*` variables, `S3_IMAGES_*` optional). `MINIO_*` variables are gone; `S3_IMAGES_PUBLIC_POLICY=1` replaces `MINIO_PUBLIC_IMAGES=1`.
- `pnpm-lock.yaml` matches `package.json` again (the `webpack` specifier differed because of the override, so `pnpm install --frozen-lockfile` failed, in CI too).

### Security
- Security audit of 2026-11 (seven independent reviews, see docs/SECURITY-HARDENING-TRACKER.md). Sign-in redirects only go to paths of the site (a crafted `callbackUrl` ran code in the site's origin); a password reset ends the other sessions; the e-mail address changes only through a confirmation sent to both addresses; staff accounts (administrators and instructors) must use a second factor (TOTP, backup codes), without it they hold no role; the server refuses to start in production with a weak `BETTER_AUTH_SECRET` or without `BETTER_AUTH_URL`; the seed and reset scripts refuse a non-local database; accounts can be erased (anonymised) from the profile page; an append-only audit log records privileged actions.
- Final exam: a sitting is a database row claimed once (a start token could be replayed to read the answers of a failed sitting and pass on a second submission); a failed sitting shows right or wrong per question, never the answers. Quiz sittings count from their start; lesson completion needs the time a lesson takes; points are awarded once per target; certificates freeze the holder's name and use a cryptographic verification code.
- Payments: Stripe events are claimed durably with a lease and applied in order (a crash mid-way lost the event, a late event could resurrect a cancelled subscription); chargebacks and failed refunds are handled; a refund closes the right to buy the same product again for 12 months, and cannot happen after a certificate was earned (refund and certificate share one lock); one payment intent, one payment row; trialing and grace periods are consistent.
- Data exposure: the community profile page no longer sends the whole user row (e-mail address included) to the browser; unapproved reviews are no longer readable by anyone with a query string; discussion flags, replies on locked discussions, vote counters, review reports and the analytics endpoint are restricted; user-supplied text is escaped in every e-mail template (phishing from the platform's own sender); profile links are https only.
- Files and media: paid videos and downloads go through a route that checks the right to open the lesson and redirects to a 15-minute signed address; an instructor can only delete the images they uploaded; upload keys and extensions are chosen by the server, image bytes are checked, uploads are recorded and limited per user; captions are fetched through an outbound request guard (no private addresses, no rebinding, 443 only, size cap).
- Browser: signed-in and credential pages carry a Content-Security-Policy with a per-request nonce and no `'unsafe-inline'` for scripts (`CSP_NONCE_ENFORCE=0` reports instead); the theme script is a constant allowed by its hash; Zod no longer probes `new Function`. Python in the playground no longer runs in the site's origin (disabled until its runtime files are added); previews run in an isolated host; AI answers cannot load images or raw HTML and the AI budget is reserved atomically per account; shared `?code=` links never run by themselves.
- Infrastructure: the CI build receives no secret, workflows have read-only permissions, CodeQL results are uploaded, dependency audit is blocking, Dependabot is configured; cross-site writes to `/api` are refused; the maintenance gate and the rate limiter use the trusted client address; a signed proof-of-work, a honeypot and a disposable-address list protect sign-up, contact, reviews, community posts and guest AI requests; the contact form can no longer be used to send mail to third parties.
- Unpublished courses keep their holders' access (spec FR-041).

- Access control: community notifications and follower lists require the owner; lesson/course writes check ownership; the blog like endpoints use a server-side visitor id.
- Quiz answers are graded on the server; the browser never receives the correct answers.
- Rate limiting on 32 API routes and the auth endpoints (atomic Redis sliding window, in-process fallback, trusted-proxy IP).
- Content-Security-Policy and baseline security headers; Stripe webhook invalid signature now answers 400; refunds use the real PaymentIntent and an idempotency key.
- `BETTER_AUTH_SECRET` is required in production.
- Dependency audit 5 -> 2 advisories: `webpack` is a direct devDependency at a patched version, `postcss-selector-parser` is overridden for Tailwind Typography. The two left (`braces`, `sprintf-js`) have no upstream fix and are reachable only at build time; risk documented in docs/security-ops-2026-10.md. `scripts/audit/lockfile-advisories.mjs` audits the lockfile without `pnpm audit`.

### Added
- One entitlement rule (`lib/access/entitlement.ts`) for every screen, the checkout and the paths: a free course is open to a signed-in learner who enrols; a premium course to a lifetime purchase (not refunded), an active or trialing subscription, or an access granted by an administrator; the course staff see everything. The course page, the catalogue, `/learn`, the dashboard and the paths read it, with the reason of a lapse (subscription ended, refunded, course turned premium). Migration `20261024100000_captions_access_grants_slug_redirects`.
- Free sample: published lessons flagged as preview, plus the first lesson when the course offers it, for every tier, watchable without an account (nothing is recorded; notes and questions ask to sign in).
- Checkout guards on the server: no purchase of a free course, of a course already open to the buyer, below 0,50 EUR, nor a second subscription. The payment return waits for the confirmation instead of promising the access; purchases come with a Stripe invoice and a receipt link on the billing page; a course purchase can be refunded within 14 days while no certificate was issued; plan prices are read from Stripe.
- Catalogue filter by access (free / premium), exact prices, honest "this course includes" list built from the course's data, one refund wording (14 days) everywhere.
- Videos from YouTube and Vimeo (privacy-enhanced players, loaded on click), captions (WebVTT track, CC button, file served from the site with the lesson's access check), transcript tab; authors upload a `.vtt` file or give its address and type the transcript in the lesson panel.
- "Mon apprentissage" (`/dashboard/my-courses`): courses in progress, completed, paths and certificates (course and path) in one place, with the access status of each course and its next step.
- Back office for each course: "Statistiques" (enrolments, active learners at 7 and 30 days, completion, average quiz and exam scores, completion of each step) and "Apprenants" (progress, last activity, source of the access, certificate; an administrator grants or removes an access). `/admin/questions`: the learners' lesson questions of one's courses, answered inline (the learner is notified, the answer is marked "Formateur").
- Instructors get their own back-office home (their courses, learners, completion and questions), and only the menu entries they can open.
- A former address of a course redirects to the current one (`CourseSlugRedirect`). The author previews draft lessons and the unpublished exam inside the learning area, marked "Brouillon".
- Live-course safety: a published course always keeps a published lesson, a course in a published path cannot be unpublished or deleted, adding a quiz or publishing an exam on a course with learners in progress asks for confirmation; edits of the quiz, exam and slide editors are never lost when changing section.
- Learning area, one for lessons, quizzes and exam: `/learn/[slug]` (lesson, quiz, final exam, visual supports, wrap-up) inside one shell that is loaded once per course (plan, progress, who may see what). Free navigation: the order is a recommendation, nothing is locked, the plan shows what is done and the next step. Small screens: the plan slides in, closes on a link or Escape and is out of the keyboard's reach when closed. `/formations/[slug]/lessons|quizzes|visual-supports|details` redirect permanently; every link (payment return, enrolment, dashboard, card, top bar) points at `/learn`.
- One progress rule (`lib/learning/outline.ts`): steps done over steps in total, a step being a published lesson, a quiz with questions or the published final exam; 99,6 % never reads 100 %. The course page, the plan, the dashboard, the summary API and the certificate all read it (the old maths gave 83 % to a course with half its lessons done and no quiz).
- Certificates are issued by the actions that finish a course (lesson done, quiz graded, exam graded), once, for a learner who still has access, with XP, a notification, an e-mail and the analytics event; before this nothing in the live flow created one. Each has a public verification code: `/certificates/verify/[code]` (no sign-in), printed on the PDF, LinkedIn "add to profile" link, copy link. The wrap-up page shows the certificate, asks for a review and suggests the next courses.
- Final exam for learners (`/learn/[slug]/exam`): questions without their answers, optional time limit enforced on the server with a signed start time, automatic submission at the end, correction after sending, retake after 15 minutes if failed, never once passed.
- Quizzes: the previous best result and the waiting time are shown before the first answer, a worse retake never replaces the best score, the result screen leads to the next step, feedback is announced to screen readers.
- Lesson page: the video resumes where the learner stopped (position saved while playing, on pause and on leaving), notes carry the moment of the video and jump back to it, lesson resources (files and links), questions to the community tied to the lesson, "mark as done" counts at once. The author sees their own draft courses and lessons as a learner, read only.
- Catalogue: search that waits for a pause and is labelled, sort (relevance, most recent, most followed, alphabetical), pages of 12, all in the URL, an empty state, and real figures in the header. The course page shows objectives, free-preview lessons, the number of resources, the real public text of the course (structure, prerequisites, resources, evaluation) and explains `?locked=1` (not enrolled, or subscription lapsed).
- Course authoring in one place: `/admin/courses/[id]` is a builder with Infos, Programme, Évaluations, Supports visuels, Page de vente, Aperçu et publication and Paramètres, status dots, a save indicator and automatic saving (the browser warns before leaving with unsaved changes). Creating a course asks for a title only. A lesson is edited in a side panel inside the Programme (video upload or address, duration read from the file, rich text with image upload, downloadable resources, free-preview flag, publish switch) with its own autosave; modules and lessons are renamed in place, reordered by drag and drop or arrow buttons, and a lesson can be moved to another module. Quizzes (with an in-editor learner preview), the final exam (title, instruction, passing score, time limit, publish), visual supports (rich slides), the FAQ (list editor), objectives and trailer have real editors. Courses can be duplicated (content only, as a draft).
- Publishing is a checklist enforced by the server: title, description, cover image, at least one published lesson, a video or text in every published lesson, and a price for a premium course. Autosave can no longer publish, creating a course can no longer publish. Lessons cannot be published empty. Module-level publish/unpublish. Migration `20261023100000_quiz_and_supports_belong_to_module` (quizzes and supports reference `Module.id`) and `20261023100100_paths_resources_certificate_codes`.
- `lib/curriculum`: the one place that changes modules, lessons, resources, quizzes, supports, exam and courses, and the ownership guard (administrator, or the instructor of that course) used by every authoring action. Positions are `max + 1`, renumbered after a delete and reordered in one transaction with two-phase writes, so `unique(order)` never fails; slugs keep accented letters ("Présentation" -> `presentation`) and are unique; deleting a module removes its lessons, quizzes and supports after stating the counts; changes revalidate the old and new addresses, `/formations` and `/learn`.
- Learning paths (`/parcours`): an ordered series of courses with optional ones, its own progress (read from the same progress rule as courses) and a certificate with a public verification code (verified on the same page as course certificates, PDF, LinkedIn). Enrolling in a path enrols the learner only in the courses their plan gives access to; premium courses stay locked and are listed. Administrators compose paths in one page (`/admin/paths`: searchable course picker, drag and drop or arrow reordering, optional flag, publish checklist). Seeded with two paths; linked from the header, the footer, the sitemap and the dashboard.
- TechMastery learning platform: one typed catalog (15 areas, 113 pages) drives the navigation, search, breadcrumbs, shell and dashboard, with tests that fail when they drift. Every page gets a shell (level, time, prerequisites, takeaways, previous/next, related, "mark as done"), server metadata and `LearningResource` JSON-LD. Every lesson has a self-check of 5-6 questions and 2-3 hands-on exercises (order, match, fill the code, classify). The sidebar shows completion ticks, the home page a "continue" card and per-area progress, the dashboard (French) is based on topics completed, with 8 achievements.
- Billing page: cancel the subscription at the end of the period (with confirmation) and switch between the monthly and yearly plan, both from the page; the refund offer is shown for any subscription inside its 14 days, not only after a cancellation.
- Back office: a user page (`/admin/users/[id]`) with role, community suspension, enrollments and payments; real filters (name or e-mail, role, plan) on the user list and (title, status, category) on the course list; analytics for 3, 6 or 12 months with a CSV export (`/api/admin/analytics/export`, administrators only); "waiting for you" notifications (reviews to moderate, reports to handle).
- `scripts/audit/smoke-crawl.mjs` and `list-routes.mjs`: open every route and report server errors, exceptions, console errors and text such as NaN or undefined.
- Error monitoring with Sentry, off unless a DSN is set (`SENTRY_DSN` for the server, `NEXT_PUBLIC_SENTRY_DSN` for the browser, loaded on demand). Server errors reach it through `onRequestError`, browser errors through the error boundaries and the new `app/global-error.tsx` (the root layout had no boundary above it). Every event is scrubbed first (`lib/monitoring.ts`: e-mail addresses, IPs, names, cookies, headers, bodies and query strings are removed, only an opaque user id stays), Next.js redirects and not-found are not reported, and the CSP opens `connect-src` to the DSN host only. Tested with the real SDK and a fake transport.
- Review moderation for real: approve or reject from the queue or from the full review list (search, status and rating filters, pagination). Every decision is kept in `ReviewModeration` (who, from which status to which), the reports still open on the review are settled with it, two moderators acting at once write one decision, and the course instructor is e-mailed when a pending review becomes public. Migration `20261020150000_add_review_moderation`.
- Accessibility audit extended to what the first pass could not see: the back office, the learner's pages (signed in), mobile viewport, light theme, Spanish locale. `scripts/audit/a11y-audit.mjs` signs in once (`AUDIT_SIGNIN`) and takes `AUDIT_VIEWPORT` and `AUDIT_THEME`.
- Code sandbox (`/sandbox/runner.html`): the exercises and coding challenges run the learner's code for real, in an iframe with an opaque origin and its own CSP (eval allowed, no network) that evaluates it in a worker it can kill; per-test results, console output, syntax errors and endless loops are reported. Hidden tests only show pass or fail.
- Back office: payments (with totals by status), subscriptions, enrollments and certificates listings with search, filters and pagination.
- Stripe `charge.refunded` (refunds made in the dashboard): a full refund marks the payment REFUNDED, which ends the lifetime-purchase access; a partial refund is only audited. `checkout.session.async_payment_failed` marks the pending payment FAILED and tells the buyer.
- Startup check of `DATABASE_URL` (`[database]` log lines: missing TLS, unverified TLS, private CA, Prisma-only parameters the `pg` adapter ignores); production DB section in DEPLOYMENT.md.
- AI tutor: streaming assistant in the playground (explain, debug, review, optimize, tests, refactor, hint, chat; insert/replace in the editor; "Explain this error") and on course lessons. Needs `ANTHROPIC_API_KEY`; works in a labelled offline mode without it. Rate limited (visitors 8/h, accounts 60/h).
- Stripe webhook events are processed once per event id (duplicate deliveries are acknowledged, failed handlers can be retried).

### Changed
- Video player: keyboard shortcuts only act while the player has focus (Space on a button or arrows on a slider keep their meaning), native range inputs for position and volume, every control named, controls stay reachable by keyboard when hidden, no side effect in state updaters, time watched is played time (a jump on the seek bar is not watching).
- Dashboard: one "Mes formations" block (most recently worked on first, continue goes to the next step) instead of three overlapping ones; categories and global progress are computed on the same rule; "Voir tout" opens `/dashboard/my-courses`, which filters by in progress / completed.
- The lesson access rule moved from the proxy (three queries per navigation) to the page, which decides with the entitlement rule; the proxy only forwards the requested step so that sign-in and the course page bring the visitor back to it. `PASSING_SCORE` is one constant.
- Back office: the lesson pages (`/admin/lessons`, `/new`, `[id]`, `[id]/edit`), the standalone module page, `quizzes/new` and `visual-supports/new`, the two course forms with their duplicated schemas, and the sample quizzes and supports shown when a course had none are removed: lessons, quizzes and supports are managed inside the course builder. The course list gains publish/unpublish, duplicate and preview, a cover thumbnail, "Gratuit" / "Prix à fixer" instead of 0 €, and an empty state that starts the creation. Course durations are shown as hours and minutes everywhere (a course in minutes, a lesson in seconds), and a course takes the total of its published lessons.
- The application area (courses, dashboard, billing, profile, community, TechMastery, admin) is French only: `/en/...` and `/es/...` on those pages redirect to `/fr/...`, the language switcher is hidden there and the sitemap no longer announces English or Spanish alternates that redirect. The home page, sign-in, contact, blog, portfolio and projects stay in three languages.
- Prisma 6.19 -> 7.10: `prisma-client` generator (`lib/generated/prisma`), `prisma.config.ts`, `pg` driver adapter in `lib/db.ts`.
- Integration tests run on a disposable embedded PostgreSQL (`pnpm test:integration`, no Docker); new DB-backed suites for auth, access control, quiz grading, refunds, community limits and the seed; CI job for it.
- Dependencies moved to the latest stable majors (Next 16, zod 4, Stripe SDK 23, better-auth 1.7, vitest 5…); see docs/modernization-2026-10.md. Build and dev run on webpack; `middleware.ts` is now `proxy.ts`; CI runs on Node 22.
- Large files split into focused modules (community actions, visualizations, services, templates, forms).
- i18n dictionaries unified; analytics calls go through `AnalyticsHelper`.
- Stripe: SDK default API version, handlers accept old and new payload shapes, `scripts/stripe-smoke.mjs` checks the integration in TEST mode (rollout plan in docs/modernization-2026-10.md).
- Security and ops: CSP report-only candidate and `/api/csp-report`, `/api/health` with the rate-limit degradation status, daily AI budgets, PII redaction in logs, `pnpm test:e2e` (32 browser tests on a production build, also in CI).

### Fixed
- Final validation of the formation section: dates in the browser and on the server are formatted in the Paris time zone (reviews, review replies, lesson questions, the admin course list, the profile), otherwise a date near midnight, or any date after the switch to winter time, made the page fail to hydrate; the learner’s own review, the exam and quiz results and the team replies put a badge (a `div`) inside a paragraph, which the browser splits and React could not hydrate; the review list and review analytics sent an instructor to `/unauthorized`, which does not exist (404): they use the shared admin guard and send them back to the back-office home; the featured courses of the home page counted only the first lesson in their duration.
- Second review of the formation section (axe audit and four independent reviews): visual-support HTML was stored and shown unsanitised (stored XSS), it now goes through the same sanitised renderer as lessons, which reads editor HTML in one piece (code blocks with blank lines are no longer cut) and shows images from any host without crashing the page; links in the rich-text editor are checked; uploads answer "storage not configured" and offer an address field instead of failing in English; a free course that kept an old price was sold, a premium course without price was shown free, lapsed learners went round between the course page and `/learn`; an empty course was shown as finished; resuming a quiz showed another answer than the graded one; the exam correction only said "option B"; certificate links disappeared when the access ended; lesson durations (seconds) were added up as minutes in paths and seeded as minutes; `Course.updatedAt` never changed ("Mis à jour le" showed the creation date); one duration rule for every screen (published lessons, else the author's estimate); trialing subscriptions counted as premium everywhere; amounts formatted exactly everywhere; the builder had a `main` inside the page's `main`, the learning area content outside landmarks, several pages without a level-one heading, low-contrast badges and banners in the light theme.
- Dead code removed: the second certificate issuer (`issueCertificate`), the second recommendation engine, `/api/progress/summary`, the review SEO components and their OG images, two repositories, three UI components, six hooks, legacy email templates, unused access and billing methods, `XpReason.DAILY_LOGIN` (migration `20261024100100_drop_unused_xp_reason`), `scripts/test-payment-system.ts`, the obsolete `AUDIT_FORMATIONS_ADMIN.md`. README, DESIGN_SYSTEM and SETUP describe the code as it is.
- Audits: `scripts/audit/seed-routes.mjs` (routes of the seeded data), the accessibility and smoke passes wait for a page to finish streaming before judging it, axe-core and esbuild are found on any install layout.
- TechMastery accuracy review (about 150 corrections): wrong git blob hash, Two Sum / Dijkstra / interpolation search / Kruskal samples, CAP and exactly-once wording, OAuth without state/PKCE, CSRF check bypass, deprecated APIs (React Query v5, Next 16 revalidateTag, pandas copy-on-write, Airflow schedule), invented statistics made qualitative, literal `&apos;` shown on screen.
- The linked-list demo of TechMastery was hydrated with node ids that differed from the server's (a counter shared by every render), which made React discard the server page; it keys its nodes from its own list.
- Radix tabs pointed `aria-controls` at panels that are not in the page (invalid reference); the attribute is now only set while the panel exists.
- Accessibility: heading order on the dashboard, profile, course, payment, Q&A and scalability pages; accessible names on the video player controls, the blog sort menu, the community notifications menu, the playground history menu and the code copy button; a level-one heading on the quiz page and the mobile playground; every scrollable code block (133) reachable with the keyboard; the blog progress markers are at least 24 px; low-contrast text in the muted opacity variants, on the dark theme's coloured badges, on the sorting selection, in the code-block header, in the playground comments and in the admin tag badges; the playground and the community area follow the theme they are drawn for. A `dark:` variant now follows the `.dark` class.
- Community: a suspended account (`isBanned`) could still post, reply, vote and follow; the ban is now enforced on every community write.
- Role changes: the action accepted roles that do not exist (USER, MENTOR, MODERATOR) and always failed; it now shares one service with the back office (valid roles only, no change of one's own role, the last administrator is kept, concurrency-safe).
- Admin review page: it showed one fabricated review for id "1" and a 404 for every real review; it now reads the database (content, replies, reports, moderation history, decision with a note).
- Invented figures removed: the admin growth chart (hard-coded), the analytics growth percentages, "visitors = users x 10" in the funnel, a random rating distribution and a fixed 75/15/10 "sentiment" on the review analytics, fake admin notifications, a simulated refresh, and invented proration amounts (+50 / -30 EUR) in the plan-switch audit trail and analytics.
- Cancelling a subscription no longer records a refund event of 0 EUR.
- Switching plan with an unknown price id no longer lands silently on the monthly plan.
- Dashboard progress showed "Cours #a1b2c3" and linked to a page that does not exist; it shows the title and opens the course.
- Dead interfaces removed: admin links to pages that do not exist (14), quick links to schedule, downloads and challenges, two best-practices cards, the collaboration "coming soon" page, a report item with no backend, and unused newsletter and booking components that pretended to succeed.
- The courses list crashed on an unknown category in the URL; unknown values are ignored.
- Back office reviews: the counters were hard-coded zeros, the filters were inert, the list said "en cours de développement", the "approve" and "reject" buttons did nothing (a review that was not auto-approved stayed pending for ever), and the review settings page was a form whose values nothing read: it is gone.
- The search exercises kept the code typed in the previous exercise when you switched to another one.
- Accessibility, found by the new passes: rating stars were five disabled buttons without a name on every review (now one image with the value, or a radio group when you choose a rating); the back office had no landmarks, a duplicated notification region, icon buttons and links without a name, selects without a label, and a link wrapped around a focusable div in the sidebar; progress bars had no value and no name; avatars had no alt; card titles jumped from h1 to h3 on most pages (`CardTitle` is now an h2 by default); the light theme failed contrast almost everywhere (muted text 4.3:1) and the destructive red under white text was 3.8:1. Colour tokens are now tested for every text/surface pair in both themes (`tests/unit/theme-contrast.test.ts`).
- The user directory of the back office (e-mails, amounts spent) was readable by any instructor who typed `/admin/users`: admin-only pages now check the role on the server (`requireAdminPage`).
- The editor of the exercise pages never appeared in production: it fetched Monaco from a CDN that the CSP blocks. The bundled Monaco is used, with a plain text area if it cannot load.
- Exercises: the reference solution of the jump search reassigned a `const` (the "show solution" button showed code that crashed), the sorting exercises asked for `bubblesort` while the function to write is `bubbleSort` (they could never pass), and the empty-tree test of the level order challenge expected `[[]]`. A test now runs every reference solution against its own tests.
- Coding challenges graded at random (70 % chance of passing) and had no code editor; the leaderboard and the analytics were made-up numbers. They are replaced by real execution and by the learner's own progress.
- Lesson pages no longer show a "Ressources" card with the same generic bullets and tip on every lesson.
- Review e-mails never reached anyone: the new-review mail read a `course` the route never loaded, the reply mail read `reply.author` and the report mail `report.reporter` (the relation is `user`), all hidden by `as any` and swallowed by a `try/catch`. `ReviewNotificationService` now takes ids and loads what it needs; the bulk mode, which only logged when an instructor had several reviews, now sends (capped at 5 per instructor).
- Quizzes: the right answer shown after each question could be used to retake the quiz and score 100%. The first answer to a question is now final and is the one graded (the browser can no longer resubmit a different one), a new sitting needs a 5 minute cooldown and is limited to 5 per 24 hours (`QuizAttempt`, `QuizAttemptAnswer`, migration `20261020140000_add_quiz_attempts`).
- TechMastery dashboard: figures come from the learner's real progress (topics opened, time spent, quizzes, streak) measured against the section's catalog; the sample data, the fake loading delay, the made-up learning time and the buttons that did nothing are gone. Page visits and quiz results are now actually recorded (`ProgressTracker`, quizzes of the Q&A, sorting and searching sections).
- Access after a subscription ends: premium access now needs an entitlement on top of the enrollment (active subscription, completed lifetime purchase, or a free course), as the spec requires (FR-003, FR-005). The enrollment and the progress are kept; a lapsed subscriber sees the free sample like a visitor and the course page says why. The contract tests that pinned "enrollment is enough" assert the spec now (the rule itself is `lib/access/entitlement.ts`, see below).
- Admin dashboard "recent activity" shows real events (registrations, enrollments, settled payments, reviews, certificates) instead of sample data, rendered on the server.
- Lesson pages (and course detail pages that embed markdown) render a single `<h1>`: a `# Title` in the body is an `<h2>`.
- Stripe: one payment row per payment (renewals no longer overwrite one row), invoices read the basil subscription field, free (100% promo) checkouts grant access, plan switch and proration audit repaired, redirect URLs without a double slash, concurrent cancellation / refund call Stripe once.
- Defects found by the new database and browser tests: build failure (a client component imported the Prisma client), /admin pages crashing (users without subscription, a missing table, a function prop passed to a client component), hydration errors (locale-dependent numbers, sample dates computed at module load), enrolling did not open the first lesson, concurrent enrollment / certificate issuance / progress updates, progress of unpublished lessons inflating course completion, review votes, review search answering an empty 200 on failure, review content filter matching inside words, saved playground workspace never restored.
- The admin sidebar and quick actions no longer link to pages that do not exist.
- Accessibility pass (WCAG 2.2 AA, see docs/accessibility-audit-2026-10.md): one `main` landmark and a skip link, `prefers-reduced-motion` support, labelled and described form fields, named icon buttons, heading levels, contrast of the brand colour, keyboard-reachable code blocks, modal command palette.
- Hydration mismatch (React #418): numbers and dates rendered with the runtime default locale/time zone now pin it (`/tech-mastry/algorithms/complexity`, blog cards).
- Service worker: API responses and personalised pages are never cached, a single registration with a safe update flow ("new version" toast), a static offline page, and `public/` (80 MB) is no longer precached.
- Contact card icons are hosted under `public/images/contact`; `images.remotePatterns` lists only the hosts still needed (minio, GitHub and Google avatars, Unsplash seed images).
- Bundle: jsPDF, three, d3 and Monaco sections load on demand; the Prism highlighter loads languages on demand.
- Playground: program output was erased (CRLF), real execution for every template, runaway programs can be stopped, preview isolation.
- Spacing tokens collapsed `max-w-*` utilities.

## [1.3.1] - 2025-10-08 🚀

### 🏗️ Major Infrastructure Upgrades

#### ✨ Added
- **Native Redis Implementation** - Replaced Upstash wrapper with native `ioredis` client v5.8.1
  - Singleton pattern with connection pooling for optimal performance
  - Robust error handling with retry logic and health monitoring
  - Native Redis commands for improved rate limiting and caching
- **GitHub CI/CD Pipeline** - Complete automation workflow
  - Comprehensive testing pipeline with PostgreSQL and Redis services
  - CodeQL security scanning and dependency review automation
  - Coolify deployment integration with webhook triggering
- **Professional Project Structure** - Modern development standards
  - Issue templates for bug reports, feature requests, and documentation
  - Pull request templates with standardized review process
  - Security policy with responsible disclosure guidelines
  - Contributing guidelines with clear development workflow

#### 🔄 Changed
- **Redis Architecture** - Complete migration to native client
  - Maintained same interface for zero-downtime migration
  - Enhanced performance with direct Redis pipeline operations
  - Improved connection management and error resilience
- **Package Dependencies** - Updated to latest stable versions
  - Next.js: 15.5.3 (App Router optimizations)
  - React: 19.1.1 (latest stable with concurrent features)
  - TypeScript: 5.8.2 (enhanced type checking)
  - Better Auth: 1.3.11 (security improvements)
  - Prisma: 6.16.3 (performance optimizations)
  - Stripe: 18.5.0 (latest API features)
  - Framer Motion: 11.18.2 (animation performance)

#### 🔐 Security Enhancements
- **Automated Security Scanning** - GitHub Actions integration
  - CodeQL analysis for code security vulnerabilities
  - Dependency review for supply chain security
  - Automated security update suggestions
- **Infrastructure Hardening** - Production-ready security
  - Native Redis with secure connection handling
  - Enhanced rate limiting with Redis pipeline optimization
  - Comprehensive error logging without PII exposure

#### 📚 Documentation Overhaul
- **README.md** - Complete rewrite with current architecture
  - Updated library versions and dependency information
  - Comprehensive feature overview with technical specifications
  - Modern badges reflecting actual technology stack
- **SETUP.md** - Professional development setup guide
  - Step-by-step environment configuration
  - Troubleshooting section with common issues
  - Docker and local Redis setup instructions
- **Environment Configuration** - Detailed `.env.example`
  - Native Redis configuration examples
  - Comprehensive variable documentation
  - Development and production environment separation

#### 🛠️ Developer Experience
- **GitHub Actions Workflow** - Professional CI/CD pipeline
  - Parallel testing with service dependencies
  - Multi-environment support (development, staging, production)
  - Automated deployment triggers for Coolify
- **Development Tools** - Enhanced local development
  - Updated VS Code configuration recommendations
  - Improved scripts for database and Redis management
  - Better error handling and logging in development mode

### 📦 Dependencies

#### Added
- `ioredis@5.8.1` - High-performance Redis client for Node.js
- `@types/ioredis@5.0.0` - TypeScript definitions for ioredis

#### Removed
- `@upstash/redis` - Replaced with native Redis implementation

#### Updated
- All major dependencies updated to latest stable versions
- Security patches applied across the entire dependency tree
- TypeScript definitions updated for improved type safety

---

## [1.3.0] - 2025-01-02 🏗️

### ✨ Added

- **Migration vers Server Actions** - Architecture Next.js 15+ moderne
  - Actions serveur pour l'inscription aux cours (`enrollCourse`)
  - Actions serveur pour le suivi des progrès (`updateLessonProgress`) 
  - Actions serveur pour l'annulation d'abonnement (`cancelSubscription`)
  - Actions serveur pour l'émission de certificats (`issueCertificate`)
- **Intégration Better Auth** - Système d'authentification moderne
  - Authentification JWT sécurisée
  - Support des fournisseurs sociaux (Google, GitHub, Apple)
  - Gestion avancée des sessions avec révocation
- **Middleware modernisé** - Contrôle d'accès robuste
  - Classification intelligente des routes
  - Contrôle d'accès aux leçons avec base de données
  - Intégration analytics et gestion d'erreurs améliorée
- **Documentation complète** - Architecture et migration
  - Documentation d'architecture mise à jour dans README.md
  - Guides de migration des API routes vers Server Actions
  - Spécifications de contrat pour les actions serveur

### 🔄 Changed

- **Migration API → Server Actions** - Amélioration de la sécurité et performance
  - Remplacement des routes API legacy par des actions serveur typées
  - Validation Zod intégrée dans toutes les mutations
  - Gestion idempotente des opérations critiques
- **Architecture d'authentification** - Passage de custom auth à Better Auth
  - Sessions JWT sécurisées avec rotation automatique
  - Middleware d'authentification optimisé pour Edge Runtime
  - Gestion centralisée des permissions et accès
- **Système de gestion des accès** - Contrôle précis des autorisations
  - Service d'accès centralisé avec validation en base
  - Vérification des abonnements en temps réel
  - Gestion des cours non publiés pour utilisateurs inscrits

### 🗑️ Removed

- **Routes API obsolètes** - Nettoyage architectural
  - `/api/progress` (POST) - remplacé par action serveur
  - `/api/lessons/access` - fonctionnalité intégrée au middleware
  - `/api/lesson/*` - structure simplifiée
- **Code mort** - Optimisation du bundle
  - Imports Prisma côté client (incompatibles Edge Runtime)
  - Handlers API redondants remplacés par Server Actions
  - Composants et utilitaires non utilisés

### 🔧 Fixed

- **Problèmes de build** - Compatibilité Edge Runtime
  - Résolution des conflits nodemailer/Edge Runtime
  - Imports côté client sécurisés pour Prisma
  - Optimisation des dépendances pour le build
- **Gestion d'erreurs** - Robustesse améliorée
  - Gestion centralisée des erreurs dans le middleware
  - Fallbacks appropriés pour les erreurs d'authentification
  - Analytics d'erreurs avec corrélation d'ID

### ⚠️ Breaking Changes

- **Migration API Routes** - Nécessite mise à jour côté client
  - Endpoints POST `/api/enroll`, `/api/progress`, `/api/subscription/cancel` supprimés
  - Utiliser les Server Actions correspondantes : `enrollCourse`, `updateLessonProgress`, `cancelSubscription`
  - Format de réponse standardisé : `{ success: boolean, data?: any, error?: string }`
- **Structure d'authentification** - Nouveaux patterns requis
  - Sessions Better Auth remplacent les sessions custom
  - Headers d'authentification modifiés pour JWT
  - Endpoints d'authentification : `/api/auth/*` (Better Auth standard)

### 📈 Upgrade Notes

1. **Pour les développeurs** :
   ```bash
   # Installer les nouvelles dépendances
   pnpm install
   
   # Mettre à jour la base de données si nécessaire
   pnpm prisma generate
   pnpm prisma db push
   ```

2. **Pour les intégrations externes** :
   - Mettre à jour les appels API vers les nouvelles Server Actions
   - Vérifier la compatibilité avec les nouveaux formats de réponse
   - Mettre à jour l'authentification pour Better Auth JWT

3. **Tests et validation** :
   - Exécuter la suite de tests : `pnpm test`
   - Valider les contrats API : `pnpm test:contract`
   - Vérifier les tests d'intégration : `pnpm test:integration`

## [1.2.0] - 2024-01-10 🚀

### ✨ Added

- Nouveau système de chargement automatique avec animation du favicon
  - Chargement automatique
  - Animation du favicon
- Pages d'erreur personnalisées (404, erreur globale, accès non autorisé)
  - Erreur 404
  - Erreur globale
  - Accès non autorisé
- Mode maintenance configurable avec API sécurisée
  - Mode maintenance
  - API sécurisée
- Système de gestion des erreurs global
  - Gestion des erreurs
- Middleware pour le routage en mode maintenance
  - Routage en mode maintenance

### 🔄 Changed

- Refonte du système de chargement pour une activation automatique
  - Activation automatique
- Amélioration des transitions de page avec Framer Motion
  - Transitions de page
- Optimisation des performances de chargement
  - Performances de chargement

### 🗑️ Removed

- Ancien système de chargement manuel (LoadingProvider)
  - LoadingProvider
- Composants de chargement obsolètes
  - Composants de chargement

## [1.1.0] - 2024-01-05 📈

### ✨ Added

- Plateforme de défis de codage
  - Défis de codage
- Exercices de manipulation de chaînes
  - Manipulation de chaînes
- Défis sur les tableaux
  - Tableaux
- Chronomètre de 5 minutes
  - Chronomètre
- Système de validation en temps réel
  - Validation en temps réel

### 🔄 Changed

- Amélioration de l'interface utilisateur
  - Interface utilisateur
- Optimisation des performances
  - Performances

## [1.0.0] - 2024-01-01 🎉

### 🚀 Initial Release

- Version initiale du portfolio
  - Portfolio
- Design responsive avec TailwindCSS
  - Design responsive
- Thème clair/sombre
  - Thème clair/sombre
- Navigation fluide
  - Navigation fluide
- Optimisation SEO
  - Optimisation SEO

## [1.0.2] - 2024-11-14 🚀

### ✨ Added

- 🖼️ Dynamic OG image generation for projects
  - Server-side image generation
  - Custom gradients and layouts
  - Project-specific previews
- 🎯 Enhanced SEO metadata
  - Structured data implementation
  - Rich snippets optimization
  - Social media cards
- ⚡ Edge runtime optimization
  - Global CDN deployment
  - Improved response times
  - Better caching strategy
- 🔄 GitLab CI/CD integration
  - Automated deployments
  - Quality checks
  - Performance monitoring

### 🔨 Changed

- 📁 Project structure optimization
  - Better component organization
  - Cleaner imports
  - Improved modularity
- 📚 Documentation improvements
  - Updated README
  - Added contributing guidelines
  - Enhanced API documentation
- 🎨 Image processing enhancements
  - WebP format support
  - Responsive images
  - Lazy loading
- 🛠️ Error handling refinements
  - Better error messages
  - Improved recovery
  - User-friendly fallbacks

### 🐛 Fixed

- 🖼️ Image optimization in production
  - Correct format serving
  - Size optimization
  - Loading performance
- 🎯 SEO metadata generation
  - Valid OpenGraph tags
  - Correct Twitter cards
  - Canonical URLs
- 📝 TypeScript definitions
  - Stricter types
  - Better interfaces
  - Fixed type errors
- 📊 Project data structure
  - Consistent format
  - Better validation
  - Improved typing

## [1.0.1] - 2024-11-07 📈

### ✨ Added

- 📝 Blog with MDX
  - Syntax highlighting
  - Code snippets
  - Interactive components
- 📋 Dynamic resume
  - Real-time status
  - Skills visualization
  - Experience timeline
- 🎨 Project showcase
  - Filtering system
  - Search functionality
  - Tags and categories
- 📬 Contact form
  - Form validation
  - SPAM protection
  - Email notifications

### 🔨 Changed

- ⚡ Next.js 14 upgrade
  - Server components
  - Improved routing
  - Better performance
- 📱 Responsive design
  - Mobile-first approach
  - Better tablets support
  - Touch interactions
- ♿ Accessibility
  - ARIA labels
  - Keyboard navigation
  - Screen reader support
- 📦 Dependencies
  - Security updates
  - Performance improvements
  - Bug fixes

### 🐛 Fixed

- 📱 Mobile navigation
  - Better touch areas
  - Smoother transitions
  - Fixed overlays
- 🌓 Dark mode
  - System preference sync
  - Smooth transitions
  - Consistent colors
- 📝 Form validation
  - Better error messages
  - Real-time validation
  - UX improvements
- ⚡ Performance
  - Reduced bundle size
  - Faster page loads
  - Better caching

## [1.0.0] - 2024-11-01 🎉

### 🚀 Initial Release

- 🎨 Modern design
  - Clean aesthetics
  - Professional look
  - Consistent branding
- 🌓 Dark/light modes
  - System preference sync
  - Manual toggle
  - Persistent choice
- 📱 Responsive layout
  - Mobile optimization
  - Tablet support
  - Desktop enhancement
- 💼 Project showcase
  - Portfolio display
  - Project details
  - Live demos
- 📬 Contact system
  - Easy communication
  - Form validation
  - Response handling
- 🎯 SEO ready
  - Meta tags
  - Structured data
  - Sitemap
- 📊 Analytics
  - Performance tracking
  - User behavior
  - Page insights

[1.2.0]: https://gitlab.com/fygs/fygs.dev/compare/v1.1.0...v1.2.0
[1.1.0]: https://gitlab.com/fygs/fygs.dev/compare/v1.0.0...v1.1.0
[1.0.2]: https://gitlab.com/fygs/fygs.dev/compare/v1.0.1...v1.0.2
[1.0.1]: https://gitlab.com/fygs/fygs.dev/compare/v1.0.0...v1.0.1
[1.0.0]: https://gitlab.com/fygs/fygs.dev/releases/tag/v1.0.0
