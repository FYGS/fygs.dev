# Translation inventory (2026-10-21)

The site has three locales (`fr` default and required, `en`, `es`) and a language switcher in the header. This is what is actually
translated.

## What is translated

32 dictionaries (`*.content.ts`, Intlayer), **complete in the three languages** (no missing locale, none identical in fr and en). They
cover: the landing page (hero, skills, featured courses, blog preview, call to action, footer), the header and its navigation, the
login and register forms, the auth pages, the status pages (404, error, unauthorized), the contact form, the AI assistant, a few shared
blocks. Counted again with `node` over `.intlayer/dictionary/*.json` (script kept in the log of this task).

## What is not

Files that contain user-visible text, and how many read it from a dictionary (measured with a script over `app/` and `components/`):

| Area | Files with text | From a dictionary | Language of the text |
|------|-----------------|-------------------|----------------------|
| TechMastry (courses, exercises, playground) | ~400 | 2 | French, with English code and some English labels |
| Admin | ~75 | 0 | French |
| Formations (catalogue, lessons, quizzes) | 18 | 0 | French |
| Community | ~20 | 0 | English |
| Dashboard, billing, profile | ~16 | 0 | French |
| Reviews, certificates, projects, blog | ~15 | 1 | French |

So `/en/...` and `/es/...` translate the marketing pages and the sign-in flow, and show French (or English, for the community) everywhere
else. Course content itself is stored in the database in French.

## Decision taken (P7-12): the application area is French only

The owner chose option 1. What it does:

- `proxy.ts`: a request for `/en/...` or `/es/...` on a page that has no translation is redirected (307) to the same page under `/fr`, query included.
- The pages that stay in three languages are the home page, sign-in and the auth pages, contact, blog, portfolio (`/me`) and projects. The list is `TRANSLATED_PREFIXES` in `lib/locale-utils.ts`; add a prefix there when a section gets its dictionaries.
- The language switcher is not shown on the other pages (there is nothing to switch to).
- Sitemap and hreflang list a French-only page in French only (`app/_lib/localized-urls.ts`): no alternate that redirects.

Translating the application remains possible later, section by section: write the dictionaries, then add the prefix to the list.
