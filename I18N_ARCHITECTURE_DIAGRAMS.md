# i18n Architecture & Flow Diagrams

## Middleware Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     INCOMING REQUEST                            │
│                 (e.g., GET /dashboard)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  Should Bypass?      │
                  │  (API, static, etc)  │
                  └──────┬──────┬────────┘
                         │      │
                    Yes  │      │  No
                         │      │
                         ▼      ▼
                    ┌─────┐  ┌──────────────────────┐
                    │Next │  │ Extract Locale from  │
                    │     │  │ Path                 │
                    └─────┘  └──────┬───────────────┘
                                    │
                             ┌──────┴───────┐
                             │ Locale Found?│
                             └──────┬───────┘
                                    │
                          ┌─────────┴─────────┐
                    No    │                   │    Yes
                          ▼                   ▼
              ┌─────────────────────┐    ┌──────────────────┐
              │  Detect User Locale │    │ Maintenance Check│
              │  1. Cookie          │    └────────┬─────────┘
              │  2. Accept-Language │             │
              │  3. Default (fr)    │             ▼
              └──────────┬──────────┘    ┌──────────────────┐
                         │               │ Get Auth Session │
                         │               │ (Better Auth)    │
                         ▼               └────────┬─────────┘
              ┌─────────────────────┐             │
              │ Redirect to         │             ▼
              │ /{locale}{path}     │    ┌──────────────────┐
              └─────────────────────┘    │ Check Route Type │
                                         │ • Auth           │
                                         │ • Protected      │
                                         │ • Public         │
                                         └────────┬─────────┘
                                                  │
                                         ┌────────┴─────────┐
                                         │ Apply Auth Logic │
                                         │ & Access Control │
                                         └────────┬─────────┘
                                                  │
                                                  ▼
                                         ┌──────────────────┐
                                         │  SERVE PAGE      │
                                         └──────────────────┘
```

## Locale Detection Priority

```
┌──────────────────────────────────────────────────────────────┐
│                    REQUEST HEADERS                           │
│  Cookie: NEXT_LOCALE=en                                      │
│  Accept-Language: fr-FR,fr;q=0.9,en;q=0.8,es;q=0.7          │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │  1. Check Cookie   │
                  │     NEXT_LOCALE    │
                  └──────┬──────────┬──┘
                         │          │
                  Found  │          │  Not Found
                         │          │
                         ▼          ▼
                  ┌──────────┐  ┌────────────────────┐
                  │ USE: en  │  │ 2. Parse Accept-   │
                  │          │  │    Language Header │
                  └──────────┘  └──────┬─────────────┘
                                       │
                            ┌──────────┴──────────┐
                            │ Extract language    │
                            │ codes: [fr, en, es] │
                            └──────┬──────────────┘
                                   │
                      ┌────────────┴────────────┐
                      │ Match against available │
                      │ locales: fr, en, es     │
                      └────────┬────────────────┘
                               │
                    ┌──────────┴──────────┐
              Found │                     │ Not Found
                    │                     │
                    ▼                     ▼
            ┌──────────────┐      ┌──────────────┐
            │  USE: fr     │      │ 3. Use Default│
            │  (first match)│      │    USE: fr   │
            └──────────────┘      └──────────────┘
```

## Locale Switching User Flow

```
┌────────────────────────────────────────────────────────────┐
│              USER ON /fr/dashboard                         │
│              (Currently viewing French)                    │
└──────────────────────────┬─────────────────────────────────┘
                           │
                           ▼
                ┌────────────────────┐
                │ Clicks Locale      │
                │ Switcher Dropdown  │
                └──────┬─────────────┘
                       │
                       ▼
                ┌────────────────────┐
                │ Selects "English"  │
                └──────┬─────────────┘
                       │
            ┌──────────┴──────────┐
            │                     │
            ▼                     ▼
    ┌──────────────────┐  ┌──────────────────┐
    │ Set Cookie       │  │ Navigate to      │
    │ NEXT_LOCALE=en   │  │ /en/dashboard    │
    │ Max-Age: 1 year  │  │                  │
    └──────────────────┘  └────────┬─────────┘
                                   │
                                   ▼
                          ┌──────────────────┐
                          │ Middleware Reads │
                          │ Cookie: en       │
                          └────────┬─────────┘
                                   │
                                   ▼
                          ┌──────────────────┐
                          │ Serves Page in   │
                          │ English          │
                          └────────┬─────────┘
                                   │
                                   ▼
                          ┌──────────────────┐
                          │ Future requests  │
                          │ use cached       │
                          │ cookie (en)      │
                          └──────────────────┘
```

## Authentication Flow with Locale

```
┌───────────────────────────────────────────────────────────────┐
│           UNAUTHENTICATED USER                                │
│           Visits /fr/formations/premium-course/lessons/1      │
└─────────────────────────┬─────────────────────────────────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ Middleware Check │
                 │ Session: null    │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ isProtectedRoute?│
                 │ YES (lesson path)│
                 └────────┬─────────┘
                          │
                          ▼
            ┌──────────────────────────────┐
            │ Redirect to Login            │
            │ /fr/auth/login?              │
            │   callbackUrl=/fr/formations/│
            │   premium-course/lessons/1   │
            │   &reason=auth_required      │
            └─────────────┬────────────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ User Logs In     │
                 └────────┬─────────┘
                          │
                          ▼
            ┌──────────────────────────────┐
            │ Server Action: signIn        │
            │ Session Created              │
            └─────────────┬────────────────┘
                          │
                          ▼
            ┌──────────────────────────────┐
            │ Check callbackUrl            │
            │ /fr/formations/.../lessons/1 │
            └─────────────┬────────────────┘
                          │
                          ▼
            ┌──────────────────────────────┐
            │ Redirect to callbackUrl      │
            │ (with locale preserved)      │
            └─────────────┬────────────────┘
                          │
                          ▼
            ┌──────────────────────────────┐
            │ Middleware: Check Access     │
            │ • User authenticated ✓       │
            │ • Check course access        │
            └─────────────┬────────────────┘
                          │
                  ┌───────┴────────┐
             Has  │                │  No Access
            Access│                │
                  ▼                ▼
        ┌──────────────┐   ┌──────────────────┐
        │ Serve Lesson │   │ Redirect to      │
        │ Content      │   │ /fr/formations/  │
        │              │   │ course?locked=1  │
        └──────────────┘   └──────────────────┘
```

## Route Structure

```
Application Routes with Locale

/
├── [locale]                    # Dynamic locale segment
│   │
│   ├── page.tsx               # Home page
│   ├── layout.tsx             # Root layout with locale provider
│   │
│   ├── (main)/                # Route group: Public pages
│   │   ├── formations/
│   │   │   ├── page.tsx       # Course catalog
│   │   │   └── [slug]/
│   │   │       ├── page.tsx   # Course detail
│   │   │       └── lessons/
│   │   │           └── [lesson]/
│   │   │               └── page.tsx  # Lesson content (protected)
│   │   ├── blog/
│   │   │   └── page.tsx
│   │   └── pricing/
│   │       └── page.tsx
│   │
│   ├── (auth)/                # Route group: Auth pages
│   │   └── auth/
│   │       ├── login/
│   │       │   └── page.tsx
│   │       ├── register/
│   │       │   └── page.tsx
│   │       └── forgot-password/
│   │           └── page.tsx
│   │
│   └── (dashboard)/           # Route group: Protected pages
│       ├── dashboard/
│       │   └── page.tsx
│       ├── profile/
│       │   └── page.tsx
│       └── settings/
│           └── page.tsx
│
├── api/                       # API routes (no locale prefix)
│   ├── auth/
│   └── courses/
│
└── maintenance.tsx            # Special page (no locale)

Middleware Rules:
• /api/* → No locale handling
• /static/* → No locale handling  
• /_next/* → No locale handling
• /* → Locale detection & redirect
• /[locale]/* → Continue to auth/access checks
```

## Component Hierarchy with Locale

```
┌─────────────────────────────────────────────────────────────┐
│                    HTML (with locale)                       │
│                    <html lang="fr">                         │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
                ┌────────────────────────┐
                │  RootLayout            │
                │  - IntlayerClientProvider │
                │  - ThemeProvider       │
                │  - PageMemoryProvider  │
                └────────┬───────────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
            ▼                         ▼
    ┌──────────────┐         ┌──────────────┐
    │ Header       │         │ Main Content │
    │ - Navigation │         │ - Page.tsx   │
    │ - LocaleSwitcher       │              │
    └──────────────┘         └──────┬───────┘
                                    │
                        ┌───────────┴───────────┐
                        │                       │
                        ▼                       ▼
                ┌──────────────┐       ┌──────────────┐
                │ Server       │       │ Client       │
                │ Components   │       │ Components   │
                │              │       │              │
                │ useIntlayer()│       │ useIntlayer()│
                │ from server  │       │ from client  │
                └──────────────┘       └──────────────┘

Data Flow:
1. Locale passed via params: { locale: "fr" }
2. IntlayerClientProvider wraps client components
3. useIntlayer() hook accesses translations
4. Content dictionaries in locale-content/ folder
```

## Legend

```
┌─────┐
│ Box │  = Process or Component
└─────┘

  ▼     = Flow Direction

┌───┴───┐
│ Fork  │ = Decision Point
└───┬───┘

  ✓     = Success/True
  ✗     = Failure/False
```

---

These diagrams visualize the complete i18n integration architecture.
Refer to them when debugging or explaining the system to team members.
