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
| TM-1 | **Catalog**: one typed source of truth (area, title, description, level, minutes, kind, tags, prerequisites, takeaways) for all pages; tests that fail when a page, the navigation, the search index or the catalog drift | TODO |
| TM-2 | Navigation, search, breadcrumbs and home cards use or are checked against the catalog (11 + 63 + 10 gaps closed) | TODO |
| TM-3 | **Topic shell** in the section layout, for every page: breadcrumb with real names, meta strip (level, time, prerequisites), "Marquer comme terminé", previous / next topic, related topics, "À retenir", area progress | TODO |
| TM-4 | **Learning layer**: a data-driven self-check (quiz with explanations and retries, scores saved) for every learning topic, authored per area and validated by tests; flashcards for vocabulary-heavy topics | TODO |
| TM-5 | **SEO and robustness**: server metadata for the 41 client pages (page split into server wrapper + client content), `loading.tsx` / `error.tsx` boundaries for the section, structured data per topic | TODO |
| TM-6 | **Dashboard**: progress per area from the catalog (completed, quiz average, time), next recommended topic, streak; consistent with TM-3 and TM-4 | TODO |
| TM-7 | Thin topics (45 pages under 350 lines): add the missing practice (guided exercise or runnable example) where the self-check alone is not enough | TODO |
| TM-8 | Verification: unit tests (catalog, quiz data, shell, progress), e2e (open a topic, answer, complete, see the dashboard move), axe on the shell, smoke crawl, docs and changelog | TODO |

## 3. Log
- 2026-10-22: analysis done, tracker created.
