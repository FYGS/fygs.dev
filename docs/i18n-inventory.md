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

## Decision needed (P7-12)

1. **French-only application area (recommended for now).** The marketing pages and sign-in stay trilingual; the switcher is hidden once
   the visitor is signed in, or the application pages redirect to `/fr`. Cost: small. No false promise.
2. **Translate the application.** About 600 files, several hundred strings, plus the database content (courses, lessons). A project of
   its own: start with dashboard, billing, formations and community (the screens every student sees), then the rest. Admin can stay French.

Nothing was changed in the code for this item: it is a product decision, not a defect.
