# i18n Quick Reference Card

## 📦 Files Created

```
✅ middleware.ts                     # Enhanced with locale detection
✅ lib/locale-utils.ts               # Locale helper functions
✅ components/ui/locale-switcher.tsx # UI component for changing locale
✅ I18N_IMPLEMENTATION_SUMMARY.md    # Executive summary
✅ I18N_INTEGRATION_COMPLETE.md      # Technical details
✅ I18N_QUICK_START.md               # Developer guide
✅ I18N_MIGRATION_CHECKLIST.md       # Step-by-step migration
✅ I18N_ARCHITECTURE_DIAGRAMS.md     # Visual flow diagrams  
✅ I18N_CODE_EXAMPLES.md             # Copy-paste examples
```

## 🎯 Core Concepts

### Locale Detection Priority
```
1️⃣ Cookie (NEXT_LOCALE)     → User's explicit choice
2️⃣ Accept-Language Header    → Browser preference
3️⃣ Default (French)          → Fallback
```

### URL Structure
```
OLD: /dashboard
NEW: /fr/dashboard  (French)
     /en/dashboard  (English)
     /es/dashboard  (Spanish)
```

## 🚀 Common Tasks

### 1. Add Locale Switcher to Header
```tsx
import { LocaleSwitcher } from "@/components/ui/locale-switcher";

<header>
  <YourNav />
  <LocaleSwitcher />
</header>
```

### 2. Create Locale-Aware Links (Client)
```tsx
'use client';
import { useLocale } from "next-intlayer";
import Link from "next/link";

export function Nav() {
  const { locale } = useLocale();
  return <Link href={`/${locale}/dashboard`}>Dashboard</Link>;
}
```

### 3. Create Locale-Aware Links (Server)
```tsx
import { type NextPageIntlayer } from "next-intlayer";

const Page: NextPageIntlayer = async ({ params }) => {
  const { locale } = await params;
  return <Link href={`/${locale}/dashboard`}>Dashboard</Link>;
};
```

### 4. Server Actions with Locale
```tsx
'use server';
export async function myAction(formData: FormData) {
  const locale = formData.get("locale") as string;
  // ... do something
  redirect(`/${locale}/success`);
}
```

### 5. Create Content Dictionary
```typescript
// locale-content/my-component.content.ts
import { t, type Dictionary } from "intlayer";

const content = {
  key: "my-component",
  content: {
    title: t({
      fr: "Mon titre",
      en: "My title",
      es: "Mi título",
    }),
  },
} satisfies Dictionary;

export default content;
```

### 6. Use Content in Component
```tsx
'use client';
import { useIntlayer } from "next-intlayer";

export function MyComponent() {
  const content = useIntlayer("my-component");
  return <h1>{content.title}</h1>;
}
```

## 🔧 Utility Functions

### Check if Locale is Valid
```tsx
import { isValidLocale } from "@/lib/locale-utils";

if (isValidLocale("fr")) {
  // Valid locale
}
```

### Add Locale to Path
```tsx
import { addLocaleToPath } from "@/lib/locale-utils";

const url = addLocaleToPath("/dashboard", "fr");
// Result: "/fr/dashboard"
```

### Remove Locale from Path
```tsx
import { removeLocaleFromPath } from "@/lib/locale-utils";

const path = removeLocaleFromPath("/fr/dashboard");
// Result: "/dashboard"
```

### Get Locale Display Name
```tsx
import { getLocaleDisplayName } from "@/lib/locale-utils";

const name = getLocaleDisplayName("fr");
// Result: "Français"
```

## 🐛 Troubleshooting

### Issue: 404 on Links
**Fix**: Ensure links include locale prefix
```tsx
// ❌ Wrong
<Link href="/dashboard">

// ✅ Correct  
<Link href={`/${locale}/dashboard`}>
```

### Issue: Infinite Redirect
**Fix**: Check matcher config excludes API routes
```typescript
matcher: ["/((?!api|static|.*\\..*|_next).*)"]
```

### Issue: Locale Not Detected
**Fix**: Clear cookies and check browser settings
```javascript
// In browser console
document.cookie = 'NEXT_LOCALE=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
```

## 📊 Testing URLs

```bash
# Test automatic detection
http://localhost:3000/             → redirects to /fr/

# Test specific locales
http://localhost:3000/fr/dashboard → French dashboard
http://localhost:3000/en/dashboard → English dashboard
http://localhost:3000/es/dashboard → Spanish dashboard

# Test auth flow
http://localhost:3000/fr/auth/login → Login page in French
```

## ✅ Pre-Production Checklist

- [ ] Locale switcher added to header
- [ ] All internal links include locale
- [ ] Server actions handle locale in redirects
- [ ] Content files exist for all locales
- [ ] Forms include hidden locale field
- [ ] Test switching between locales
- [ ] Test auth flow in each locale
- [ ] Test protected routes in each locale
- [ ] SEO meta tags include hreflang

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `I18N_IMPLEMENTATION_SUMMARY.md` | Read this first |
| `I18N_QUICK_START.md` | How to use i18n |
| `I18N_MIGRATION_CHECKLIST.md` | Update existing code |
| `I18N_CODE_EXAMPLES.md` | Copy-paste examples |
| `I18N_ARCHITECTURE_DIAGRAMS.md` | Visual reference |

## 🎓 Key Patterns

### Pattern 1: Client Component with Locale
```tsx
'use client';
import { useLocale } from "next-intlayer";
import { useIntlayer } from "next-intlayer";

export function MyComponent() {
  const { locale } = useLocale();
  const content = useIntlayer("my-component");
  
  return (
    <div>
      <h1>{content.title}</h1>
      <Link href={`/${locale}/about`}>
        {content.aboutLink}
      </Link>
    </div>
  );
}
```

### Pattern 2: Server Component with Locale
```tsx
import { type NextPageIntlayer } from "next-intlayer";
import { IntlayerServerProvider, useIntlayer } from "next-intlayer/server";

const Content = () => {
  const content = useIntlayer("page");
  return <h1>{content.title}</h1>;
};

const Page: NextPageIntlayer = async ({ params }) => {
  const { locale } = await params;
  
  return (
    <IntlayerServerProvider locale={locale}>
      <Content />
    </IntlayerServerProvider>
  );
};

export default Page;
```

### Pattern 3: Form with Locale
```tsx
'use client';
import { useLocale } from "next-intlayer";
import { myAction } from "@/app/actions/my-action";

export function MyForm() {
  const { locale } = useLocale();
  
  return (
    <form action={myAction}>
      <input type="hidden" name="locale" value={locale} />
      <input type="text" name="data" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## 💡 Pro Tips

1. **Always pass locale in server actions**
2. **Use hidden input for forms**: `<input type="hidden" name="locale" value={locale} />`
3. **Test with different browser languages**
4. **Clear cookies when testing detection**
5. **Use utility functions for consistency**
6. **Build Intlayer after content changes**: `npm run intlayer:build`

## 🆘 Need Help?

1. Check `I18N_QUICK_START.md` for common use cases
2. Review `I18N_CODE_EXAMPLES.md` for copy-paste patterns
3. See `I18N_ARCHITECTURE_DIAGRAMS.md` for flow understanding
4. Follow `I18N_MIGRATION_CHECKLIST.md` for systematic updates

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: 2025-10-31  
**Framework**: Next.js 15.2+  
**Library**: Intlayer 7.0.3
