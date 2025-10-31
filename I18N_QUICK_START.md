# i18n Quick Start Guide

## Adding the Locale Switcher to Your Layout

Add the locale switcher to your navigation bar or header:

```tsx
import { LocaleSwitcher } from "@/components/ui/locale-switcher";

export function Header() {
  return (
    <header>
      {/* Your other header content */}
      <LocaleSwitcher />
    </header>
  );
}
```

## Using Locale in Components

### Server Components

```tsx
import { type NextPageIntlayer } from "next-intlayer";
import { IntlayerServerProvider, useIntlayer } from "next-intlayer/server";

const Page: NextPageIntlayer = async ({ params }) => {
  const { locale } = await params;
  const content = useIntlayer("page-key");
  
  return (
    <IntlayerServerProvider locale={locale}>
      <div>{content.title}</div>
    </IntlayerServerProvider>
  );
};

export default Page;
```

### Client Components

```tsx
'use client';
import { useIntlayer } from "next-intlayer";
import { useLocale } from "next-intlayer";

export function MyComponent() {
  const { locale } = useLocale();
  const content = useIntlayer("component-key");
  
  return <div>{content.title}</div>;
}
```

## Creating Content Files

Create your content files in `locale-content/`:

```typescript
// locale-content/page.content.ts
import { t, type Dictionary } from "intlayer";

const pageContent = {
  key: "page-key",
  content: {
    title: t({
      fr: "Titre de la page",
      en: "Page Title",
      es: "Título de la página",
    }),
    description: t({
      fr: "Description de la page",
      en: "Page description",
      es: "Descripción de la página",
    }),
  },
} satisfies Dictionary;

export default pageContent;
```

## Building Links with Locale

### Using the Utility Function

```tsx
import { addLocaleToPath } from "@/lib/locale-utils";
import { useLocale } from "next-intlayer";
import Link from "next/link";

export function Navigation() {
  const { locale } = useLocale();
  
  return (
    <nav>
      <Link href={addLocaleToPath("/dashboard", locale)}>
        Dashboard
      </Link>
      <Link href={addLocaleToPath("/formations", locale)}>
        Formations
      </Link>
    </nav>
  );
}
```

### Using Template Literals

```tsx
import { useLocale } from "next-intlayer";
import Link from "next/link";

export function Navigation() {
  const { locale } = useLocale();
  
  return (
    <nav>
      <Link href={`/${locale}/dashboard`}>Dashboard</Link>
      <Link href={`/${locale}/formations`}>Formations</Link>
    </nav>
  );
}
```

## Programmatic Navigation

```tsx
'use client';
import { useRouter } from "next/navigation";
import { useLocale } from "next-intlayer";

export function MyComponent() {
  const router = useRouter();
  const { locale } = useLocale();
  
  const navigateToProfile = () => {
    router.push(`/${locale}/profile`);
  };
  
  return <button onClick={navigateToProfile}>Go to Profile</button>;
}
```

## Testing Locale Detection

### Test with Browser Language

1. **Chrome/Edge**: 
   - Settings → Languages → Add preferred language
   - Move language to top of list
   - Restart browser

2. **Firefox**:
   - Settings → General → Language
   - Choose language and move to top

3. **Safari**:
   - Preferences → General → Preferred languages

### Test with Cookie

Set the locale cookie in browser DevTools:

```javascript
// Console
document.cookie = 'NEXT_LOCALE=en; path=/';
// Then refresh page
```

### Test URL Patterns

- Visit `http://localhost:3000/` → should redirect to `/fr/`
- Visit `http://localhost:3000/dashboard` → should redirect to `/fr/dashboard`
- Visit `http://localhost:3000/en/dashboard` → should load English dashboard

## Common Patterns

### Conditional Content by Locale

```tsx
import { useLocale } from "next-intlayer";

export function LocaleSpecificContent() {
  const { locale } = useLocale();
  
  return (
    <div>
      {locale === "fr" && <FrenchOnlyComponent />}
      {locale === "en" && <EnglishOnlyComponent />}
      {locale === "es" && <SpanishOnlyComponent />}
    </div>
  );
}
```

### Format Dates by Locale

```tsx
import { useLocale } from "next-intlayer";

export function FormattedDate({ date }: { date: Date }) {
  const { locale } = useLocale();
  
  return (
    <time>
      {date.toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric"
      })}
    </time>
  );
}
```

### Format Currency by Locale

```tsx
import { useLocale } from "next-intlayer";

export function FormattedPrice({ amount }: { amount: number }) {
  const { locale } = useLocale();
  
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: locale === "fr" ? "EUR" : "USD"
  });
  
  return <span>{formatter.format(amount)}</span>;
}
```

## Troubleshooting

### Links Not Working

**Problem**: Clicking links results in 404
**Solution**: Ensure all internal links include the locale prefix

```tsx
// ❌ Wrong
<Link href="/dashboard">Dashboard</Link>

// ✅ Correct
<Link href={`/${locale}/dashboard`}>Dashboard</Link>
```

### Infinite Redirects

**Problem**: Page keeps redirecting
**Solution**: Check middleware matcher config excludes API routes and static files

### Locale Not Detected

**Problem**: Always defaults to French
**Solution**: 
1. Check browser's Accept-Language header
2. Clear NEXT_LOCALE cookie if set incorrectly
3. Check middleware detectUserLocale() function

### Content Not Translating

**Problem**: Content shows in wrong language
**Solution**:
1. Verify content file exists in `locale-content/`
2. Check content key matches `useIntlayer("key")`
3. Rebuild with `npm run intlayer:build`

## Development Workflow

1. **Create content file**: `locale-content/my-component.content.ts`
2. **Build Intlayer**: `npm run intlayer:build` (or auto-builds on dev)
3. **Use in component**: `useIntlayer("my-component")`
4. **Test all locales**: Visit `/fr/`, `/en/`, `/es/`

## Production Checklist

- [ ] All content files have translations for fr, en, es
- [ ] All internal links include locale prefix
- [ ] Locale switcher added to navigation
- [ ] Test authentication flow in all locales
- [ ] Test protected routes in all locales
- [ ] Verify SEO meta tags respect locale
- [ ] Check sitemap includes all locale URLs
- [ ] Test browser language detection
- [ ] Verify cookie persistence works

---

**Need Help?** Check the full implementation guide in `I18N_INTEGRATION_COMPLETE.md`
