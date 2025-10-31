# i18n Migration Checklist

## Files That Need Updates

### 1. Navigation Components

Files to review and update:
- [ ] `components/navigation/*.tsx`
- [ ] `components/header.tsx` or similar
- [ ] `components/footer.tsx` or similar
- [ ] `components/sidebar.tsx` or similar

Update pattern:
```tsx
// Before
<Link href="/dashboard">Dashboard</Link>

// After
import { useLocale } from "next-intlayer";

const { locale } = useLocale();
<Link href={`/${locale}/dashboard`}>Dashboard</Link>
```

### 2. Layout Files

Files to review:
- [ ] `app/[locale]/layout.tsx` (✅ Already updated)
- [ ] `app/(main)/layout.tsx`
- [ ] `app/(admin)/layout.tsx`
- [ ] `app/(auth)/layout.tsx`

**Note**: Route groups like `(main)`, `(admin)` should be INSIDE `[locale]` folder:
```
app/
  [locale]/
    (main)/
      page.tsx
    (admin)/
      dashboard/
        page.tsx
```

### 3. Page Files

Review all page.tsx files:
- [ ] `app/(main)/page.tsx`
- [ ] `app/(main)/formations/page.tsx`
- [ ] `app/(main)/blog/page.tsx`
- [ ] `app/(admin)/dashboard/page.tsx`
- [ ] All other page.tsx files

Ensure they use locale parameter:
```tsx
import { type NextPageIntlayer } from "next-intlayer";

const Page: NextPageIntlayer = async ({ params }) => {
  const { locale } = await params;
  // Use locale in component
};
```

### 4. API Route Handlers

Files to review:
- [ ] `app/api/**/*.ts`

**Note**: API routes should NOT include locale prefix. They're handled separately via `/api/*` path.

### 5. Server Actions

Files to review:
- [ ] `app/actions/**/*.ts`
- [ ] Any files with `"use server"`

Update redirect calls:
```tsx
// Before
redirect("/dashboard");

// After
import { DEFAULT_LOCALE } from "@/lib/locale-utils";
redirect(`/${locale || DEFAULT_LOCALE}/dashboard`);
```

### 6. Form Actions

Review forms that use server actions:
- [ ] Login forms
- [ ] Registration forms
- [ ] Profile update forms
- [ ] Course enrollment forms

Ensure redirects include locale.

### 7. Client-Side Navigation

Review files using `useRouter`:
- [ ] Search for `router.push(` across codebase
- [ ] Search for `router.replace(` across codebase

Update pattern:
```tsx
// Before
router.push("/dashboard");

// After
import { useLocale } from "next-intlayer";
const { locale } = useLocale();
router.push(`/${locale}/dashboard`);
```

### 8. Metadata and SEO

Files to review:
- [ ] Layout files with metadata exports
- [ ] `app/sitemap.ts`
- [ ] `app/robots.ts`
- [ ] OpenGraph image generation routes

Update sitemap to include all locales:
```tsx
export default function sitemap() {
  const locales = ["fr", "en", "es"];
  const urls = [];
  
  locales.forEach(locale => {
    urls.push({
      url: `https://fygs.dev/${locale}`,
      lastModified: new Date(),
    });
    // Add other URLs
  });
  
  return urls;
}
```

### 9. Static Paths and Redirects

Files to check:
- [ ] `next.config.mjs` redirects
- [ ] Any hardcoded URLs in config files

Update to include locale:
```js
// next.config.mjs
redirects: async () => [
  {
    source: '/old-path',
    destination: '/fr/new-path', // or use locale detection
    permanent: true
  }
]
```

### 10. Test Files

Files to update:
- [ ] `tests/**/*.test.ts`
- [ ] E2E tests in `specs/**`
- [ ] Component tests

Update test URLs:
```tsx
// Before
await page.goto("/dashboard");

// After
await page.goto("/fr/dashboard");
```

## Automated Search Patterns

Run these searches in your codebase:

### Find Hardcoded Paths
```bash
# PowerShell
Select-String -Path "app/**/*.tsx" -Pattern 'href="/' | Where-Object { $_ -notmatch 'href="\{' }
```

### Find router.push Calls
```bash
# PowerShell
Select-String -Path "app/**/*.tsx" -Pattern 'router\.(push|replace)\('
```

### Find redirect Calls
```bash
# PowerShell
Select-String -Path "app/**/*.ts" -Pattern 'redirect\('
```

### Find Link Components
```bash
# PowerShell
Select-String -Path "app/**/*.tsx" -Pattern '<Link href='
```

## Route Group Restructure

Current structure may need reorganization:

### Before
```
app/
  (main)/
    page.tsx
    formations/
      page.tsx
  (admin)/
    dashboard/
      page.tsx
  [locale]/
    layout.tsx
    page.tsx
```

### After (Recommended)
```
app/
  [locale]/
    layout.tsx
    page.tsx
    (main)/
      formations/
        page.tsx
    (admin)/
      dashboard/
        page.tsx
```

**Migration Steps:**
1. Create new folder structure
2. Move route group folders inside `[locale]`
3. Update imports
4. Test each route
5. Delete old folders

## Component Updates Priority

### Priority 1 (Critical - Blocks Navigation)
- [ ] Main navigation component
- [ ] Header/Footer links
- [ ] Login/Logout flows
- [ ] Dashboard navigation

### Priority 2 (Important - UX Impact)
- [ ] Form submission redirects
- [ ] Authentication redirects
- [ ] Course enrollment flows
- [ ] Profile pages

### Priority 3 (Enhancement)
- [ ] Footer links
- [ ] Breadcrumb navigation
- [ ] Related content links
- [ ] Call-to-action buttons

## Testing Strategy

### Manual Testing
For each critical user flow:

1. **French (fr)**
   - [ ] Visit `/` → should redirect to `/fr/`
   - [ ] Navigate to `/fr/dashboard`
   - [ ] Login flow
   - [ ] Course access flow

2. **English (en)**
   - [ ] Visit with English browser → should redirect to `/en/`
   - [ ] Navigate to `/en/dashboard`
   - [ ] Login flow
   - [ ] Course access flow

3. **Spanish (es)**
   - [ ] Visit with Spanish browser → should redirect to `/es/`
   - [ ] Navigate to `/es/dashboard`
   - [ ] Login flow
   - [ ] Course access flow

### Automated Testing
Update test suites:

```typescript
// Before
test("dashboard access", async () => {
  await page.goto("/dashboard");
  // assertions
});

// After
test("dashboard access", async () => {
  await page.goto("/fr/dashboard");
  // assertions
});

// Or parameterized
["fr", "en", "es"].forEach(locale => {
  test(`dashboard access - ${locale}`, async () => {
    await page.goto(`/${locale}/dashboard`);
    // assertions
  });
});
```

## Rollback Plan

If issues arise:

1. **Disable Locale Redirect**: Comment out redirect logic in middleware
2. **Keep Middleware Protection**: Keep auth/access control active
3. **Default to French**: Force all routes to `/fr/*`
4. **Fix Issues**: Address problems
5. **Re-enable**: Uncomment redirect logic

## Common Pitfalls

### ❌ Wrong: Mixing Locale and Non-Locale Routes
```tsx
<Link href="/dashboard">Dashboard</Link>  // Missing locale
<Link href={`/${locale}/profile`}>Profile</Link>  // Has locale
```

### ✅ Correct: Consistent Locale Usage
```tsx
<Link href={`/${locale}/dashboard`}>Dashboard</Link>
<Link href={`/${locale}/profile`}>Profile</Link>
```

### ❌ Wrong: Hardcoded Locale
```tsx
<Link href="/fr/dashboard">Dashboard</Link>  // Always French
```

### ✅ Correct: Dynamic Locale
```tsx
const { locale } = useLocale();
<Link href={`/${locale}/dashboard`}>Dashboard</Link>
```

### ❌ Wrong: Missing Locale in Redirects
```tsx
redirect("/dashboard");  // Might cause 404
```

### ✅ Correct: Include Locale in Redirects
```tsx
redirect(`/${locale}/dashboard`);
```

## Progress Tracking

Create a GitHub issue or tracking document:

```markdown
## i18n Migration Progress

### Completed ✅
- [x] Middleware integration
- [x] Locale utilities
- [x] Locale switcher component

### In Progress 🚧
- [ ] Update main navigation
- [ ] Update auth flows

### Not Started 📋
- [ ] Update admin panel
- [ ] Update test suite
```

## Final Verification

Before marking complete:

- [ ] All navigation works in all locales
- [ ] Authentication works in all locales
- [ ] Protected routes work in all locales
- [ ] Forms submit and redirect correctly
- [ ] No console errors related to routing
- [ ] No 404 errors on navigation
- [ ] Locale switcher works correctly
- [ ] Browser language detection works
- [ ] Cookie persistence works
- [ ] SEO/metadata includes locale info

---

**Estimated Time**: 4-8 hours for full migration (depending on codebase size)
**Risk Level**: Medium (thorough testing required)
**Rollback Time**: < 30 minutes (if needed)
