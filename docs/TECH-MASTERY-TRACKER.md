# TechMastery: analysis, plan and tracker

Scope: `app/[locale]/(main)/tech-mastry` (115 pages, ~760 files, ~123 000 lines). Goal: aligned, coherent, robust, rich, interactive and pedagogical.
Status: `TODO` · `DOING` · `DONE` · `DECISION`. Definition of done: `tsc` 0, `eslint` 0, unit + integration green, e2e when a flow changes, CHANGELOG, committed.

## 1. Analysis (2026-10-22, measured by script over the 115 pages)

| Area | Finding | Evidence |
|------|---------|----------|
| Source of truth | Three hand-written registries describe the same pages and have drifted apart | navigation: 104 links, **11 pages missing** (e.g. dynamic programming); search index: 52 pages, **63 pages cannot be found by search** (all of Git, Data Science, AI, TypeScript, coding challenges...); practice cards: 105 links, 10 missing |
| Wayfinding | Breadcrumbs know 18 route names; every other segment is shown as its raw slug (`git-mastery`, `agentic-ai`) | `breadcrumbs.tsx` |
| Reading flow | No "previous / next topic", no "related", no estimated time, no level, no prerequisites on 95 of 115 pages | only 20 pages have any next/related block |
| Learning | Quiz on 5 pages (one component, used by Q&A only); exercises on 32; **no way to mark a topic as done**; progress is only "page visited" and minutes | `progress` hooks in 7 pages |
| Depth | Very uneven: 9 000 lines for sorting, 17 to 330 lines for 45 topics (git, security, career, data science, TypeScript, backend) | lines per page |
| SEO / loading | 41 pages are whole-page client components: no `generateMetadata`, no server HTML of the content; 0 `loading.tsx`, 1 `error.tsx` for 115 pages | audit |
| Housekeeping | Empty `collaboration/` folder, "50+" claims (fixed), duplicate topics under `best-practices/` and their own areas | tree |

## 2. Plan

| ID | Task | Status |
|----|------|--------|
| TM-1 | **Catalog**: one typed source of truth (area, title, description, level, minutes, kind, tags, prerequisites, takeaways) for the 113 pages, with tests that fail when a page, the navigation or the search index drift | DONE |
| TM-2 | Navigation (3 topics added), search (60 topics added from the catalog), breadcrumbs (names from the catalog), Playground description and "collaboration" claims honest | DONE |
| TM-3 | **Topic shell** in the section layout, for every page: meta strip (area, level, time, prerequisites with their state), takeaways, "Marquer comme terminé" (saved, reversible), previous / next topic along the whole path, related topics, area progress; progress shared between tabs | DONE |
| TM-4 | **Learning layer**: a self-check of 5 to 6 questions per lesson (explanations, retry of the missed ones, best score kept) and 2 to 3 hands-on exercises per lesson (put in order, match, fill the code, classify; checked on the spot, explained, remembered); authored per area and validated by tests | DONE |
| TM-5 | **SEO and robustness**: server metadata for the 41 client pages (server wrapper + client content) and one title format for all 113; section `loading.tsx` and `error.tsx`; `LearningResource` structured data per lesson | DONE |
| TM-6 | **Dashboard** in French, on the catalog: topics done (not just opened), per-area progress, "next topic" card, self-check average, 8 achievements | DONE |
| TM-7 | Content accuracy review of the pages by area (errors found so far: OWASP numbering of XSS, Kubernetes Secrets "encrypted", `exactOptionalProperties`, `fetch` cached by default in Next.js 15+, `cacheTime` in React Query v5; more to check: git object hash, uncited performance figures) | DONE |
| TM-8 | Verification: unit tests (catalog, quizzes, exercises, shell, progress, dashboard), e2e (open, complete, self-check, dashboard moves), axe on the shell, smoke crawl, docs, changelog | DOING (full e2e gate running) |

## 3. Log
- 2026-10-22: analysis done, tracker created.
- 2026-10-22: TM-1, TM-2, TM-3, TM-5, TM-6 done; quizzes and takeaways written for the 100 lessons by area agents and checked by tests; exercises engine and tests done, exercise data in progress; five factual errors fixed on the pages, accuracy review launched.
- 2026-10-22: exercises (2-3 per lesson) and self-checks done for the 100 lessons; sidebar shows completion ticks and per-section counts; the home page has a LearningHome (next topic, global progress, one progress card per area). Accuracy review by 7 area agents: about 150 corrections (see git log), e.g. git blob hash, Dijkstra/Two Sum/Interpolation search samples, CAP wording, OAuth state+PKCE, invented figures made qualitative, deprecated APIs updated. Open doubts are listed below.

## 4. Open doubts: all treated (2026-10-22)
- Frontend: Next.js 16 (Cache Components, proxy, async params), React 19 (use, Actions, ref as prop), react-window 2, WCAG 2.2, Tailwind v4, MSW; TypeScript 6/7 and Zod v4; Node 24 LTS, current GitHub Actions, OWASP Top 10:2025, Gateway API vs Ingress NGINX; Airflow 3, pandas 3, MLflow aliases; MCP spec and Agent frameworks; Copilot/VS Code customization files.
- Invented figures and scores replaced by qualitative wording; visualizer bugs fixed (BST delete, heap NaN, hash resize, quick/insertion sort marks, Dijkstra heap, BFS head index); SemVer bump logic extracted and tested.
- Still to verify by a human (no access/unconfirmed): Cursor, Windsurf, Perplexity wording (403 from their sites); Istio ambient maturity label; Eureka status; Airflow 3 import paths and Spark 4 defaults from memory.
