# PWA Manifest - Complete Implementation Guide

## Overview

The FYGS Learning Platform uses a modern, comprehensive PWA manifest with full internationalization support. This document explains all features and how to maintain them.

## File Location

- **Main File**: `app/manifest.ts`
- **Type**: Dynamic TypeScript-based manifest (Next.js 15+)
- **Output**: Automatically generates `/manifest.webmanifest`

## Key Features

### 1. **Internationalization (i18n)** 🌍

The manifest supports French, English, and Spanish with locale-specific:
- App names and descriptions
- Shortcut labels
- Screenshot labels

```typescript
const name = t({
  fr: "FYGS Learning Platform - Formations Premium pour Développeurs",
  en: "FYGS Learning Platform - Premium Developer Courses",
  es: "FYGS Learning Platform - Cursos Premium para Desarrolladores",
});
```

### 2. **Comprehensive Icon Set** 📱

**Standard Icons:**
- 16x16, 32x32 (favicons)
- 180x180 (Apple Touch Icon)
- 192x192, 512x512 (Android Chrome)
- SVG (scalable, modern browsers)

**Maskable Icons:**
- 192x192, 512x512 (Android adaptive icons)
- Ensures icons look good with circular, squircle, or rounded square masks

### 3. **App Store Screenshots** 📸

Configured for app store listings:
- Wide format (1200x630) for desktop/tablet
- Localized labels for each screenshot
- Ready for Progressive Web App stores

### 4. **Smart Shortcuts** ⚡

**5 Quick Actions:**
1. **Formations/Courses** - Browse available courses
2. **Blog** - Read latest articles
3. **Community** - Join discussions
4. **Dashboard** - Personal space
5. **My Courses** - Continue learning

Features:
- UTM tracking (`?utm_source=pwa_shortcut`)
- Localized names and descriptions
- Custom icons for each shortcut

### 5. **Display Modes** 🖥️

**Priority Order:**
1. `window-controls-overlay` - Native-like title bar
2. `standalone` - Full-screen app experience
3. `minimal-ui` - Minimal browser UI fallback

### 6. **Theme Integration** 🎨

**Colors from Design System:**
```typescript
theme_color: "#d9dce0"        // Primary color (light mode accent)
background_color: "#29333d"    // Background (dark theme)
```

Colors match `globals.css` CSS variables:
- `--primary: 220 13% 86%` → `#d9dce0`
- `--background: 220 13% 18%` → `#29333d`

### 7. **Advanced PWA Features** 🚀

#### **Share Target API**
Allows sharing content TO the app:
```typescript
share_target: {
  action: "/share",
  method: "POST",
  params: { title, text, url, files }
}
```

Users can share:
- Text and URLs
- Images, videos, audio
- PDF documents

#### **File Handlers**
Open files directly in the app:
```typescript
file_handlers: [
  {
    action: "/dashboard/upload",
    accept: {
      "text/markdown": [".md"],
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ...]
    }
  }
]
```

#### **Protocol Handlers**
Deep linking with custom protocol:
```typescript
protocol_handlers: [
  { protocol: "web+fygs", url: "/handle?type=%s" }
]
```

Example: `web+fygs://course/123` opens specific course

### 8. **Categories & Discoverability** 🔍

**App Store Categories:**
- education
- development
- technology
- productivity
- learning
- training

Helps users discover the app in PWA stores and browser recommendations.

### 9. **Orientation & Display** 📲

- **Orientation**: `portrait-primary` (mobile-first)
- **Start URL**: `/` (home page)
- **Scope**: `/` (entire app)
- **ID**: `/?source=pwa` (unique identifier)

## Implementation Details

### Dynamic Generation

The manifest is generated at runtime based on:
1. User's locale (from request headers or cookies)
2. Environment variables
3. Design system colors

### Localization Strategy

```typescript
const t = <T>(content: Record<LocalesValues, T>) => 
  getTranslation(content, locale);
```

- **Primary**: French (`fr`) - required
- **Supported**: English (`en`), Spanish (`es`)
- **Fallback**: Always to French if translation missing

### Icon Requirements

**Current Icons** (in `/public/images/`):
- ✅ `favicon-16x16.png`
- ✅ `favicon-32x32.png`
- ✅ `apple-touch-icon.png` (180x180)
- ✅ `android-chrome-192x192.png`
- ✅ `android-chrome-512x512.png`
- ✅ `favicon.svg`

**Missing Icons** (optional enhancements):
- ❌ `android-chrome-72x72.png`
- ❌ `android-chrome-96x96.png`
- ❌ `android-chrome-128x128.png`
- ❌ `android-chrome-144x144.png`
- ❌ `android-chrome-152x152.png`
- ❌ `android-chrome-384x384.png`

### Screenshot Requirements

**Current**:
- ✅ `og-image.png` (1200x630) - wide format

**Recommended Additions**:
- ❌ Mobile screenshot (750x1334) - narrow format
- ❌ Tablet screenshot (1024x768)
- ❌ Additional feature screenshots

## Testing

### Browser Support

| Feature | Chrome | Edge | Safari | Firefox |
|---------|--------|------|--------|---------|
| Basic PWA | ✅ | ✅ | ✅ | ✅ |
| Shortcuts | ✅ | ✅ | ❌ | ❌ |
| Share Target | ✅ | ✅ | ❌ | ❌ |
| File Handlers | ✅ | ✅ | ❌ | ❌ |
| Protocol Handlers | ✅ | ✅ | ❌ | ❌ |
| Window Controls | ✅ | ✅ | ❌ | ❌ |

### Manual Testing

1. **Install as PWA**:
   ```
   Chrome: Settings → Install app
   Edge: Settings → Apps → Install this site as an app
   ```

2. **Test Shortcuts**:
   - Right-click PWA icon
   - Verify all 5 shortcuts appear
   - Test each shortcut opens correct page

3. **Test Share Target**:
   - Share content from another app
   - Verify FYGS appears in share sheet
   - Test sharing text, URLs, and files

4. **Test Theme Colors**:
   - Verify title bar color matches theme
   - Check splash screen background color

### Automated Testing

```bash
# Lighthouse PWA audit
pnpm dlx lighthouse https://fygs.dev --view --preset=desktop

# Check manifest validity
curl https://fygs.dev/manifest.webmanifest | jq
```

## Maintenance

### Adding New Shortcuts

```typescript
shortcuts: [
  // ...existing shortcuts,
  {
    name: t({
      fr: "Nouveau nom",
      en: "New name",
      es: "Nuevo nombre",
    }),
    url: "/new-page?utm_source=pwa_shortcut",
    description: t({
      fr: "Description française",
      en: "English description",
      es: "Descripción española",
    }),
    icons: [
      {
        src: "/images/favicon-32x32.png",
        sizes: "96x96",
        type: "image/png",
      },
    ],
  },
],
```

### Adding New Locale

1. Add translations to all `t()` calls
2. Update `lang` property logic:
   ```typescript
   lang: locale === "fr" ? "fr-FR" 
       : locale === "en" ? "en-US"
       : locale === "es" ? "es-ES"
       : locale === "de" ? "de-DE" // new locale
       : "fr-FR",
   ```

### Updating Colors

Match with `globals.css`:
```typescript
// Extract from CSS variables
theme_color: "#your-color"      // --primary
background_color: "#your-color" // --background
```

## Performance

- **Size**: ~2-3KB (minified JSON)
- **Generation**: Dynamic, cached by Next.js
- **Load Time**: <50ms (included in HTML)

## Standards Compliance

- ✅ W3C Web App Manifest
- ✅ PWA Installability Criteria
- ✅ Accessibility (WCAG 2.1)
- ✅ Modern PWA Best Practices

## References

- [W3C Web App Manifest](https://www.w3.org/TR/appmanifest/)
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Intlayer Documentation](https://intlayer.org/docs)

## Changelog

### Version 2.0.0 (Current)
- ✅ Complete i18n support (FR/EN/ES)
- ✅ 5 smart shortcuts with UTM tracking
- ✅ Share Target API
- ✅ File Handlers
- ✅ Protocol Handlers
- ✅ Comprehensive icon set
- ✅ Theme color integration
- ✅ Modern display modes

### Version 1.0.0 (Previous)
- Basic manifest
- Limited shortcuts
- No i18n support

---

**Last Updated**: November 4, 2025  
**Maintained by**: FYGS Development Team
