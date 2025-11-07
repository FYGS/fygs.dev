# SEO & PWA i18n Implementation

## Overview

This document describes the internationalized SEO and PWA system implemented for FYGS Learning Platform.

## Architecture

### Core Files

1. **`app/_lib/i18n-metadata.ts`** - New i18n-aware metadata generator
2. **`app/_lib/sitemap.ts`** - Multilingual sitemap generator
3. **`app/manifest.ts`** - Dynamic PWA manifest with i18n
4. **`app/robots.ts`** - Dynamic robots.txt with multilingual URLs

### Legacy Files (Still in Use)

1. **`app/_lib/metadata.ts`** - Default metadata configuration
2. **`app/_lib/seo-utils.ts`** - Non-i18n metadata helpers (used by blog, projects)

## Usage

### For New Pages with i18n Support

```typescript
import { generateI18nMetadata } from "@/app/_lib/i18n-metadata";
import { type LocalPromiseParams } from "next-intlayer";

export async function generateMetadata({ params }: LocalPromiseParams) {
  const { locale } = await params;

  return generateI18nMetadata({
    locale,
    path: "/your-path",
    title: {
      fr: "Titre français",
      en: "English title",
      es: "Título español",
    },
    description: {
      fr: "Description française",
      en: "English description",
      es: "Descripción española",
    },
    keywords: [
      { fr: "mot-clé", en: "keyword", es: "palabra clave" },
      "universal-keyword",
    ],
  });
}
```

### For Existing Pages (Legacy)

Pages using the old system continue to work without changes:

```typescript
import { generateMetadata } from "@/app/_lib/seo-utils";

export const metadata = generateMetadata({
  title: "My Page",
  description: "Description",
  path: "/my-page",
});
```

## Features

### 1. Sitemap (app/[locale]/sitemap.ts)

- ✅ Automatically generates multilingual URLs for all routes
- ✅ Includes `alternates.languages` with FR, EN, ES
- ✅ Supports blog posts and dynamic routes
- ✅ Proper `x-default` handling

### 2. Robots.txt (app/robots.ts)

- ✅ Disallows admin routes in all languages
- ✅ Disallows API routes
- ✅ Disallows billing pages
- ✅ Points to multilingual sitemap

### 3. PWA Manifest (app/manifest.ts)

- ✅ **Modern, comprehensive manifest** with full PWA features
- ✅ **i18n support** for names, descriptions, and shortcuts (FR/EN/ES)
- ✅ **7 icon sizes** including SVG and maskable variants
- ✅ **5 smart shortcuts** with UTM tracking
- ✅ **Share Target API** for receiving shared content
- ✅ **File Handlers** for opening MD, PDF, and images
- ✅ **Protocol Handlers** for deep linking (`web+fygs://`)
- ✅ **Window Controls Overlay** for native-like experience
- ✅ **Theme colors** integrated with design system
- ✅ **App store screenshots** with localized labels

📖 **See [docs/PWA_MANIFEST.md](./docs/PWA_MANIFEST.md) for complete documentation**

### 4. i18n Metadata (app/_lib/i18n-metadata.ts)

- ✅ Automatic `alternates.languages` generation
- ✅ Proper canonical URLs per locale
- ✅ OpenGraph and Twitter Card localization
- ✅ Type-safe with full TypeScript support

## Migration Strategy

### Phase 1: Core Pages (✅ Done)
- Home page now uses `generateI18nMetadata()`

### Phase 2: High-Traffic Pages (Recommended Next)
- `/formations` - Course listings
- `/dashboard` - User dashboard
- `/community` - Community pages
- `/pricing` - Pricing page

### Phase 3: Content Pages
- Blog posts (keep current system, works well)
- Tech Mastry pages
- Static pages (terms, privacy)

### Phase 4: Admin Pages
- Admin dashboard (low priority for i18n)

## Benefits

1. **SEO Optimized**
   - Proper hreflang tags for language versions
   - Canonical URLs prevent duplicate content
   - Multilingual sitemaps help search engines index all versions

2. **PWA Ready**
   - Dynamic manifest adapts to user's language
   - Proper shortcuts in user's language
   - Better user experience on mobile

3. **Type Safe**
   - Full TypeScript support
   - Compile-time checks for missing translations
   - Autocomplete in IDEs

4. **Maintainable**
   - Centralized metadata management
   - Consistent pattern across pages
   - Easy to add new languages

5. **Performance**
   - No runtime overhead
   - Static generation when possible
   - Efficient multilingual URL generation

## Current Status

### ✅ Completed
- Core i18n metadata system
- Multilingual sitemap
- Dynamic robots.txt
- Dynamic PWA manifest
- Home page migration

### 📋 TODO (Optional Future Work)
- Migrate high-traffic pages to new system
- Add more languages (DE, IT, PT)
- Generate locale-specific manifests
- Implement automatic metadata inheritance

## Notes

- Both old and new systems coexist peacefully
- No breaking changes to existing pages
- Gradual migration approach allows testing
- Old system remains stable for non-i18n pages

---

**Last Updated**: November 3, 2025
**Version**: 1.0.0
