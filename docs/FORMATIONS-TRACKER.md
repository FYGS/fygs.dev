# Formations: analysis, plan and tracker

Scope: course authoring (admin / instructor), learner experience (`/formations`, `/learn`, dashboard, certificates), learning paths.
Status: `TODO` · `DONE` · `DONE` · `DECISION`. Definition of done: `tsc` 0, `eslint` 0, unit + integration green, e2e when a flow changes, CHANGELOG, committed. No half-features: a feature is either complete end to end or not started.

## 1. Analysis (2026-10-23, three read-only audits)

### Authoring
- Creating a full course takes `/new`, then the builder, then one round trip to `/admin/lessons/[id]/edit` **per lesson** (video, rich text, duration live only there; saving lands on another page, not the builder).
- Two diverging creation paths for a lesson (`admin/lessons/new` with plain textarea and manual order, and inline). A standalone `/admin/lessons` list duplicates the curriculum tab.
- Orphans: `module-create-form`, `modules/[moduleId]` page (no link: a module cannot be renamed from the UI), `quizzes/new`, `visual-supports/new`.
- "Paramètres" tab is a placeholder; Preview tab is static; FAQ is a raw JSON textarea; trailer is a bare URL; no duplication; thumbnail cannot be removed.
- Bugs: order collisions after a delete (`@@unique([moduleId, order])`, `order = length+1`), reorder by parallel updates under unique constraints, autosave can publish, publishing an empty course is allowed, lesson pages lack ownership checks, `reorderLessons` does not check lesson ownership, stale public pages on unpublish / slug change, slug generator strips accented letters ("Présentation" -> "prsentation"), quizzes and supports keyed on `Module.order` not `Module.id`.

### Learner
- Two lesson UIs (`/formations/.../lessons` legacy and `/learn/...` immersive, ~90 % duplicated). Payment return, dashboard, "back to course" links go to the legacy one.
- **No certificate is ever issued in the live flow** (`issueCertificate` is never called) and the certificate PDF link is a 404. The final exam has no UI.
- Progress differs by screen (lessons only vs lessons + quizzes); locking is cosmetic (client only) and inconsistent; `?locked=1` is a silent dead end; resume uses cumulative watch time as a position; "Quiz suivant" ignores `basePath`; quiz results have no next step; failed quiz blocks the next module in the UI only.
- No completion screen / next course; no learning paths; notes without video time; accessibility problems (global key handler on the player, sidebar focus, quiz contrast, unlabeled search, no debounce).

### Data
- No path / prerequisites / objectives / lesson types / lesson resources / lesson Q&A / publishedAt / duplication helper. `faq Json`, `trailerUrl` exist.

## 2. Plan

| ID | Task | Status |
|----|------|--------|
| F0-1 | Curriculum integrity: order allocation (`max+1`), renumber on delete, reorder in a transaction, ownership checks on every lesson / module action and page, module delete keeps no orphan lessons, slug generator that keeps accents and is unique | DONE |
| F0-2 | Quizzes and supports reference `Module.id` (migration + data backfill), UI and learner code follow | DONE |
| F0-3 | Autosave never changes `published`; publishing goes through a checklist gate on the server | DONE |
| F0-4 | Revalidation correct on unpublish, slug change, lesson / module change | DONE |
| F1 | **Learner**: one lesson UI (`/learn`), `/formations/.../lessons|quizzes` redirect to it, every link updated; one progress rule shared by all screens; server-side access to lessons by progression where the course asks for it; certificate issued at completion (lessons + quizzes + final exam when present), certificate page + PDF route fixed; completion screen with next steps; final exam UI; quiz results next step, retake, passed state; `?locked` handled; resume position; notes with video time; shell and player accessibility; catalog search debounce, sort, pagination | DONE |
| F2 | **Authoring**: one builder; lesson editing in a panel inside the builder (video, rich text, resources, preview flag, duration), no navigation; module rename inline; wizard-like creation (title -> builder); publish checklist; FAQ editor; trailer upload; duplication of a course; settings tab; real preview; legacy routes removed | DONE (authoring side; see log for the open points) |
| F3 | **Learning paths** (parcours): models, admin editor, public catalog and page, enrolment, progress, path certificate | DONE |
| F4 | Tests (unit, integration, e2e of author -> publish -> learn -> certificate), smoke crawl, docs, changelog | DONE (a11y audit with axe not re-run: see open points) |

## 3. Decisions
- Navigation in a course is free: the lock icons were never enforced on the server and disagreed between screens, so they are removed. The order is a recommendation (next item is highlighted), the certificate needs every item.
- One progress rule (`lib/learning/outline.ts`): done items / total items, items = published lessons + quizzes with questions + published final exam. Replaces the 1/3 weights, which showed 83 % for a course with half its lessons done and no quiz.
- `/learn/[slug]` is the only learning area; `/formations/[slug]` stays the public course page; `/formations/.../lessons|quizzes` redirect.
- Learning paths: composed by admins; a path never bypasses access rules of its paid courses.

## 4. Log
- 2026-10-23: analysis done, tracker created.
- 2026-10-23: schema: quizzes and visual supports reference `Module.id` (migration backfills from the old position and removes rows that matched no module); added Course.objectives/publishedAt, Lesson.isPreview, LessonResource, Progress.lastPosition, Certificate.code, Discussion.lessonId, Path/PathCourse/PathEnrollment/PathCertificate. `db:check-migrations` clean. Foundations with tests: slugify, course outline and progress rule. Learner, authoring and paths work started in parallel.
- 2026-10-23: authoring (F0-1, F0-3, F0-4, F2) done: `lib/curriculum` (ownership guard, ordering, slugs, publish gate, duplication), one builder at `/admin/courses/[id]`, lesson side panel with autosave, quiz/exam/support/FAQ/objectives editors, `/admin/lessons/**` and the orphan forms removed. 34 integration tests, 64 unit tests. Open: a draft lesson cannot be opened as a learner (proxy redirects lessons of unpublished courses, even for the author): needs a `?preview` rule on the learner side; e2e spec `course-authoring.spec.ts` written, not run.
- 2026-10-23: learner, authoring and paths delivered by three parallel passes, then validated together: tsc 0, eslint 0 (no warning), unit 193 files / 2189 tests, integration 56 files / 740 tests, `db:check-migrations` clean, e2e 65 on a fresh production build, smoke crawl of 176 learner / visitor routes and 25 admin routes with 0 real problem (the `null`/`undefined` hits are code samples in TechMastery lessons).
- The production build and the e2e found what tsc and unit tests could not: `react-dom/server` imported by a server action, `node:crypto` reached from a client component (`client-bundle-boundary` now forbids both), the single-letter keyboard shortcuts firing while typing in the rich-text editor (and swallowing Ctrl+R), two `h1` on the admin paths page, and seeded path courses with no lesson (a path certificate that could never be earned: publishing now requires a lesson in every course).

## 5. Open points
- Axe re-run on the new pages on 2026-10-25 (see the log): 0 violation on the formation pages. No screen-reader session was done (owner).
- Draft lessons and the unpublished exam are previewed by their author inside the learning area, marked "Brouillon" (second pass).
- Unknown `/parcours/[slug]` and course pages answer 200 with the not-found screen and `noindex` (the page streams behind its loading skeleton), like the existing course pages.
- Lesson HTML is sanitised by an in-repo allow-list plugin (`lib/learning/sanitize-html.ts`); replacing it with `rehype-sanitize` is one line once the dependency is added.
- Paths are administrator-only; a path with a delivered certificate can be unpublished but not deleted.
- Pushed on 2026-10-25 with the owner's go-ahead.

## 6. Second pass (2026-10-24): audit, four independent reviews, plan

Inputs: axe audit of 173 page passes (admin, learner, visitor, mobile, light) and four read-only reviews (commerce and access, learner, authoring, dead code). Main findings: the UI decides from `price` while access decides from `accessTier` (free course sold, premium course shown free, lapsed learners in a redirect loop, checkout without guards, prices rounded on screen); stored XSS through visual-support HTML; lesson images from other hosts crash the lesson page; YouTube/Vimeo links unplayable; no captions; empty course shown as finished; quiz resume shows another answer; exam correction unreadable; quiz/exam/support edits lost on section change; instructors offered admin-only pages; no per-course statistics, learner list, manual access or question inbox; lesson durations stored in seconds but summed as minutes in paths and seeded as minutes; `updatedAt` never updated; dead files and five duration formatters.

Decisions:
- Offers: a FREE course is open to any signed-in learner who enrols; a PREMIUM course is opened by a lifetime purchase (price of at least 0,50 EUR), by an active or trialing subscription, or by an access granted by an administrator. One entitlement function decides for every screen, the checkout and the paths.
- Free sample: published lessons flagged as preview, plus the first lesson when the course switch is on, for every tier; visitors can watch them without an account (nothing is recorded).
- Refunds: 14 days everywhere, for subscriptions and course purchases, under the existing policy.
- Not built (not a must-have here, stated): draft/live versions of a course (a banner says edits on a live course are visible at once), course announcements, per-quiz pass mark (70 % for all), bulk actions on the course list.

| ID | Task | Status |
|----|------|--------|
| F5 | Commerce and access: one entitlement function, tier-driven CTA, checkout guards, payment return, exact prices, honest "included" list and refund copy, free/premium filter, lapsed/refunded states, receipts, course refund, anonymous preview, path pricing data | DONE |
| F6 | Learner area and paths: video providers and captions/transcript, one HTML rendering path (lessons and slides), empty course, quiz resume, exam review, certificates (course and path unified), Q&A loop, "Mon apprentissage", shell focus and mobile, reading comfort, dashboard, emails, durations, accessibility findings | DONE |
| F7 | Authoring and admin: unsafe HTML, images and uploads without storage, unsaved editors, instructor permissions, preview rules, labels, live-course safety, slug redirects, per-course statistics and learners (grant/revoke access), question inbox, captions upload, accessibility findings | DONE |
| F8 | Dead code, duplicates, stale docs; full validation (tsc, eslint, unit, integration, e2e on a fresh build, smoke crawl, axe) | DONE |

### Log of the second pass
- 2026-10-25: F8 validation on a fresh production build and the seeded database: tsc 0, eslint 0, unit 196 files / 2188 tests, integration 57 files / 747 tests, `db:check-migrations` clean, e2e 65 passed. Smoke crawl: visitor 42, learner 43, admin 25, instructor 25 pages, 0 problem. Axe: admin 25 pages 0, learner 43 pages 0 (after the fixes below), visitor dark / light / mobile 32 pages each: the only findings are the two accepted blog items of docs/accessibility-audit-2026-10.md and the spinner of the blog stats while they load (not formation pages).
- Found and fixed by that validation: dates formatted in the server's and the browser's own time zone (reviews, review replies, lesson questions, admin course list, profile) broke hydration once the two differed (the switch to winter time showed it; a server in UTC and a learner in Paris would too): they are formatted in Europe/Paris; a badge (`div`) inside a paragraph on the learner's own review, the exam and quiz results and the team replies (unhydratable HTML); the review list and analytics sent instructors to a `/unauthorized` route that does not exist (404), they use the shared admin guard; the voted "useful" button lacked contrast; "Mon apprentissage" had an h3 without h2; the featured courses counted one lesson in their duration; stale tests (copy, snapshots) aligned.
- Audit tooling note: the audit and crawl scripts judge a page that redirects while it streams (`/learn/[slug]` sends to the next step, a path certificate page without certificate sends to the path) in the middle of the navigation and can hang; those routes were checked by loading them directly.
