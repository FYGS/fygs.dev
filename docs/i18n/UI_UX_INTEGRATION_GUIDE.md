# 🌍 Modern i18n UI/UX Integration - Complete Guide

## Overview

This guide covers all the UI/UX components created for a modern, fluid, and smooth internationalization experience using Intlayer in Next.js 15.

## 📦 Components Created

### 1. **LocaleSwitcher** (`components/ui/locale-switcher.tsx`)
**Purpose:** Dropdown menu for quick language switching in header/navigation

**Features:**
- ✅ Animated dropdown with Framer Motion
- ✅ Loading states with `useTransition`
- ✅ Toast notifications via Sonner
- ✅ Check icon for current locale
- ✅ Loader spinner during transitions

**Usage:**
```tsx
import { LocaleSwitcher } from "@/components/ui/locale-switcher";

export function Header() {
  return (
    <header>
      <LocaleSwitcher />
    </header>
  );
}
```

---

### 2. **FloatingLanguageButton** (`components/ui/floating-language-button.tsx`)
**Purpose:** Fixed floating button for easy language access from anywhere

**Features:**
- ✅ Customizable positioning (4 corners)
- ✅ Smooth expand/collapse animations
- ✅ Shows current locale flag on button
- ✅ Animated language list
- ✅ Click outside to close

**Usage:**
```tsx
import { FloatingLanguageButton } from "@/components/ui/floating-language-button";

export default function RootLayout({ children }) {
  return (
    <body>
      {children}
      <FloatingLanguageButton position="bottom-right" />
    </body>
  );
}
```

**Props:**
- `position`: `"bottom-right" | "bottom-left" | "top-right" | "top-left"` (default: `"bottom-right"`)
- `className`: Additional CSS classes

---

### 3. **LocaleSelectorModal** (`components/ui/locale-selector-modal.tsx`)
**Purpose:** First-time visitor language selection modal

**Features:**
- ✅ Auto-detects first visit (cookie-based)
- ✅ Large, accessible language cards
- ✅ Smooth entrance animations
- ✅ Shows current browser locale
- ✅ Sets permanent preference cookie

**Usage:**
```tsx
import { LocaleSelectorModal } from "@/components/ui/locale-selector-modal";

export default function RootLayout({ children }) {
  return (
    <body>
      <LocaleSelectorModal />
      {children}
    </body>
  );
}
```

**Behavior:**
- Shows once on first visit
- Sets `locale_selected=true` cookie
- Won't show again after selection

---

### 4. **LocaleLoading** Components (`components/ui/locale-loading.tsx`)
**Purpose:** Loading states during locale transitions

**Variants:**
1. **`LocaleLoading`** - Flexible loading indicator
   - `variant`: `"page" | "inline" | "overlay"`
   - `message`: Custom loading message

2. **`LocaleSkeleton`** - Skeleton loader for content

3. **`LocaleTransition`** - Wrapper with loading overlay

**Usage:**
```tsx
import { LocaleLoading, LocaleSkeleton, LocaleTransition } from "@/components/ui/locale-loading";

// Page loading
<LocaleLoading variant="page" message="Changing language..." />

// Inline loading
<LocaleLoading variant="inline" message="Loading..." />

// Overlay loading
<LocaleLoading variant="overlay" />

// Skeleton
<LocaleSkeleton />

// Transition wrapper
<LocaleTransition isLoading={isPending}>
  <YourContent />
</LocaleTransition>
```

---

### 5. **LocaleAwareNav** Components (`components/ui/locale-aware-nav.tsx`)
**Purpose:** Navigation components with automatic locale path handling

**Components:**

#### **LocaleAwareLink**
Smart Link component that automatically prefixes locale

```tsx
import { LocaleAwareLink } from "@/components/ui/locale-aware-nav";

<LocaleAwareLink 
  href="/dashboard"
  activeClassName="text-primary font-bold"
  showActiveIndicator={true}
>
  Dashboard
</LocaleAwareLink>
// Renders: /fr/dashboard or /en/dashboard based on current locale
```

#### **LocaleAwareNav**
Complete navigation menu

```tsx
const navItems = [
  { href: "/", label: "Home", icon: <HomeIcon /> },
  { href: "/courses", label: "Courses" },
  { href: "/dashboard", label: "Dashboard" },
];

<LocaleAwareNav 
  items={navItems}
  orientation="horizontal"
  activeClassName="text-primary font-semibold"
/>
```

#### **LocaleBreadcrumbs**
Breadcrumb navigation

```tsx
const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Web Development" }, // current page
];

<LocaleBreadcrumbs items={breadcrumbs} separator="/" />
```

---

### 6. **LocaleBadge** Components (`components/ui/locale-badge.tsx`)
**Purpose:** Display locale indicators and tags

**Components:**

#### **LocaleBadge**
```tsx
import { LocaleBadge } from "@/components/ui/locale-badge";

<LocaleBadge 
  locale="fr"
  variant="default"
  size="md"
  animated={true}
  showFlag={true}
  showName={true}
/>
```

**Props:**
- `variant`: `"default" | "outline" | "secondary" | "ghost"`
- `size`: `"sm" | "md" | "lg"`
- `animated`: Enable entrance animation

#### **LocaleIndicator**
Floating indicator badge (e.g., on profile pictures)

```tsx
<LocaleIndicator 
  locale="fr"
  position="top-right"
  pulse={true}
/>
```

#### **LocaleTag**
Multiple locale tags

```tsx
<LocaleTag 
  locales={["fr", "en", "es"]}
  maxDisplay={3}
  size="sm"
/>
```

---

### 7. **LocalePreferences** (`components/ui/locale-preferences.tsx`)
**Purpose:** Full settings page for language preferences

**Features:**
- ✅ Visual language selection cards
- ✅ Auto-detection toggle
- ✅ Save button with loading state
- ✅ Informational tooltips
- ✅ Changes detection

**Usage:**
```tsx
// In a settings page
import { LocalePreferences } from "@/components/ui/locale-preferences";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <LocalePreferences />
    </div>
  );
}
```

---

### 8. **PageTransition** Components (`components/ui/page-transition.tsx`)
**Purpose:** Smooth page transitions during navigation

**Components:**

#### **PageTransition**
Wraps page content with transition

```tsx
import { PageTransition } from "@/components/ui/page-transition";

export default function Layout({ children }) {
  return (
    <PageTransition>
      {children}
    </PageTransition>
  );
}
```

#### **LocalePageTransition**
Locale-specific page transitions

```tsx
import { LocalePageTransition } from "@/components/ui/page-transition";

<LocalePageTransition locale={currentLocale}>
  {children}
</LocalePageTransition>
```

#### **FadeTransition, SlideTransition, ScaleTransition**
Reusable transition wrappers

```tsx
<FadeTransition show={isVisible}>
  <Content />
</FadeTransition>

<SlideTransition show={isVisible} direction="right">
  <Sidebar />
</SlideTransition>

<ScaleTransition show={isVisible}>
  <Modal />
</ScaleTransition>
```

---

## 📝 Content Dictionaries

### **localeUiContent** (`locale-content/locale-ui.content.ts`)

Centralized translations for all i18n UI elements:

```typescript
import { useIntlayer } from "next-intlayer";

function MyComponent() {
  const { languageSwitcher, loading, toasts } = useIntlayer("locale-ui");
  
  return (
    <button>
      {languageSwitcher.changeLanguage}
    </button>
  );
}
```

**Available sections:**
- `languageSwitcher` - Language switcher labels
- `firstTimeModal` - First-time modal content
- `loading` - Loading messages
- `toasts` - Toast notification messages
- `languages` - Language names
- `accessibility` - ARIA labels
- `settings` - Settings page content
- `actions` - Common action labels

---

## 🎨 Integration Examples

### Example 1: Complete Header with Language Switcher

```tsx
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { LocaleAwareNav } from "@/components/ui/locale-aware-nav";

export function Header() {
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <header className="border-b">
      <div className="container mx-auto flex justify-between items-center py-4">
        <Logo />
        <LocaleAwareNav items={navItems} />
        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
```

### Example 2: Complete Layout with All Features

```tsx
import { LocaleSelectorModal } from "@/components/ui/locale-selector-modal";
import { FloatingLanguageButton } from "@/components/ui/floating-language-button";
import { PageTransition } from "@/components/ui/page-transition";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <LocaleSelectorModal />
        <PageTransition>
          <Header />
          <main>{children}</main>
          <Footer />
        </PageTransition>
        <FloatingLanguageButton position="bottom-right" />
      </body>
    </html>
  );
}
```

### Example 3: Settings Page

```tsx
import { LocalePreferences } from "@/components/ui/locale-preferences";

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12">
      <LocalePreferences />
    </div>
  );
}
```

### Example 4: Course Card with Locale Badge

```tsx
import { LocaleBadge, LocaleTag } from "@/components/ui/locale-badge";

export function CourseCard({ course }) {
  return (
    <div className="relative border rounded-lg p-6">
      <LocaleIndicator locale={course.locale} position="top-right" pulse />
      
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      
      <div className="mt-4">
        <LocaleTag 
          locales={course.availableLocales}
          maxDisplay={3}
        />
      </div>
    </div>
  );
}
```

---

## 🚀 Quick Start Checklist

1. **Add LocaleSwitcher to header:**
   ```tsx
   import { LocaleSwitcher } from "@/components/ui/locale-switcher";
   ```

2. **Add FloatingLanguageButton to layout:**
   ```tsx
   import { FloatingLanguageButton } from "@/components/ui/floating-language-button";
   ```

3. **Add LocaleSelectorModal for first-time visitors:**
   ```tsx
   import { LocaleSelectorModal } from "@/components/ui/locale-selector-modal";
   ```

4. **Replace all `<Link>` with `<LocaleAwareLink>`:**
   ```tsx
   import { LocaleAwareLink } from "@/components/ui/locale-aware-nav";
   ```

5. **Wrap pages with PageTransition:**
   ```tsx
   import { PageTransition } from "@/components/ui/page-transition";
   ```

6. **Use content dictionaries:**
   ```tsx
   import { useIntlayer } from "next-intlayer";
   const content = useIntlayer("locale-ui");
   ```

---

## 🎯 Best Practices

1. **Always use LocaleAwareLink** instead of Next.js Link for internal navigation
2. **Show LocaleSelectorModal only once** - it handles cookie detection
3. **Use FloatingLanguageButton OR LocaleSwitcher** - not both in the same view
4. **Add loading states** during locale changes for better UX
5. **Use toast notifications** to confirm language changes
6. **Implement PageTransition** for smoother navigation
7. **Use LocaleBadge** to indicate content language when mixing locales

---

## 🔧 Customization

All components accept `className` prop for custom styling:

```tsx
<LocaleSwitcher className="custom-class" />
<FloatingLanguageButton className="custom-position" />
<LocaleBadge className="custom-badge" />
```

All animations can be customized via Framer Motion props where components are used.

---

## 📚 Additional Resources

- **Middleware Documentation:** See `middleware.ts` for locale detection logic
- **Utility Functions:** See `lib/locale-utils.ts` for helper functions
- **Content Dictionaries:** See `locale-content/` for all translations
- **Intlayer Docs:** https://intlayer.org/docs

---

**Last Updated:** 2024
**Next.js Version:** 15.5.3
**Intlayer Version:** 7.0.3
