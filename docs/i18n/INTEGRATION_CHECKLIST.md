# 📋 i18n UI/UX Integration Checklist

## Phase 1: Essential Components ✅

### 1.1 Root Layout Integration
- [ ] Add `<LocaleSelectorModal />` to root layout
- [ ] Add `<FloatingLanguageButton />` to root layout (or header)
- [ ] Verify first-time modal appears correctly
- [ ] Test floating button positioning

**File to edit:** `app/[locale]/layout.tsx`

```tsx
import { LocaleSelectorModal } from "@/components/ui/locale-selector-modal";
import { FloatingLanguageButton } from "@/components/ui/floating-language-button";

export default function LocaleLayout({ children, params: { locale } }) {
  return (
    <>
      <LocaleSelectorModal />
      {children}
      <FloatingLanguageButton position="bottom-right" />
    </>
  );
}
```

### 1.2 Header Integration
- [ ] Add `<LocaleSwitcher />` to header component
- [ ] Test dropdown functionality
- [ ] Verify toast notifications appear
- [ ] Check loading states during language changes

**File to edit:** `components/header.tsx` or similar

```tsx
import { LocaleSwitcher } from "@/components/ui/locale-switcher";

export function Header() {
  return (
    <header>
      {/* Your existing header content */}
      <LocaleSwitcher />
    </header>
  );
}
```

### 1.3 Navigation Links Replacement
- [ ] Find all `<Link>` components in project
- [ ] Replace with `<LocaleAwareLink>`
- [ ] Verify all links maintain locale prefix
- [ ] Test active state indicators

**Search for:** `from "next/link"`  
**Replace with:** `from "@/components/ui/locale-aware-nav"`

```bash
# PowerShell command to find all Link usages
Get-ChildItem -Path app,components -Recurse -Include *.tsx,*.ts | Select-String 'from "next/link"'
```

---

## Phase 2: Enhanced Features (Optional)

### 2.1 Settings Page
- [ ] Create language settings route
- [ ] Add `<LocalePreferences />` component
- [ ] Add navigation link to settings
- [ ] Test auto-detection toggle
- [ ] Test save functionality

**Create file:** `app/[locale]/settings/language/page.tsx`

```tsx
import { LocalePreferences } from "@/components/ui/locale-preferences";

export default function LanguageSettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <LocalePreferences />
    </div>
  );
}
```

### 2.2 Page Transitions
- [ ] Wrap pages with `<PageTransition>`
- [ ] Test smooth transitions during navigation
- [ ] Verify locale-specific transitions work

**File to edit:** Layout or individual pages

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

### 2.3 Locale Badges (if needed)
- [ ] Add `<LocaleBadge />` to multi-language content
- [ ] Add `<LocaleTag />` where content supports multiple locales
- [ ] Add `<LocaleIndicator />` to user profiles/avatars

**Usage examples:**

```tsx
import { LocaleBadge, LocaleTag, LocaleIndicator } from "@/components/ui/locale-badge";

// Content card
<div>
  <LocaleBadge locale="fr" animated />
  <h3>Course Title</h3>
</div>

// Multiple locales
<LocaleTag locales={["fr", "en", "es"]} />

// Profile picture
<div className="relative">
  <Avatar />
  <LocaleIndicator position="bottom-right" pulse />
</div>
```

---

## Phase 3: Testing & Validation

### 3.1 Functional Testing
- [ ] **First Visit Flow:**
  - Clear cookies
  - Refresh page
  - Modal should appear after 500ms
  - Select language
  - Cookie should be set
  - Modal should not appear again

- [ ] **Language Switching:**
  - Click LocaleSwitcher dropdown
  - Select different language
  - Loading spinner should appear
  - Toast notification should show
  - URL should update with new locale
  - Page content should reload in new language

- [ ] **Floating Button:**
  - Should be visible on all pages
  - Click to expand language list
  - Click language to change
  - Click outside to close
  - Should show current locale flag

- [ ] **Navigation:**
  - All links should maintain locale prefix
  - Active page should be highlighted
  - Breadcrumbs should work correctly

### 3.2 Accessibility Testing
- [ ] **Keyboard Navigation:**
  - Tab through all interactive elements
  - Enter to activate buttons/links
  - Escape to close modals/dropdowns
  - Arrow keys in dropdowns (if applicable)

- [ ] **Screen Reader:**
  - ARIA labels are read correctly
  - Current locale is announced
  - Loading states are announced
  - Errors are announced

- [ ] **Focus Management:**
  - Focus visible on interactive elements
  - Focus trapped in modal when open
  - Focus returns to trigger after closing

### 3.3 Visual Testing
- [ ] **Desktop (1920x1080):**
  - All components render correctly
  - Hover effects work
  - Animations are smooth

- [ ] **Tablet (768x1024):**
  - Responsive layouts work
  - Touch interactions work
  - Dropdowns don't overflow

- [ ] **Mobile (375x667):**
  - Components are accessible
  - Floating button doesn't block content
  - Modal fits screen

- [ ] **Dark Mode:**
  - All components support dark theme
  - Contrast ratios are sufficient
  - Icons are visible

### 3.4 Performance Testing
- [ ] Page load time with i18n components
- [ ] Animation performance (60 FPS)
- [ ] Bundle size impact
- [ ] Cookie size and count

---

## Phase 4: Documentation & Training

### 4.1 Developer Documentation
- [ ] Add usage examples to component files
- [ ] Update project README with i18n info
- [ ] Document any custom configurations
- [ ] Add to Storybook (if using)

### 4.2 User Documentation
- [ ] Add help text for language settings
- [ ] Create user guide for language switching
- [ ] Add tooltips where needed

---

## Phase 5: Production Deployment

### 5.1 Pre-Deployment Checklist
- [ ] All components tested in staging
- [ ] No console errors or warnings
- [ ] All translations verified (fr, en, es)
- [ ] Cookies comply with privacy policies
- [ ] Analytics events tracked (if applicable)

### 5.2 Deployment Steps
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Check analytics for language distribution
- [ ] Gather user feedback

### 5.3 Post-Deployment Monitoring
- [ ] Track language switching rates
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] User satisfaction surveys

---

## Quick Reference Commands

### Find All Link Components
```powershell
# PowerShell
Get-ChildItem -Path app,components -Recurse -Include *.tsx,*.ts | Select-String 'from "next/link"' | Select-Object Path, LineNumber
```

### Clear Browser Cookies (Testing)
```javascript
// Browser Console
document.cookie.split(";").forEach(c => {
  document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
});
```

### Check Bundle Size
```bash
pnpm run build
pnpm run analyze  # if you have bundle analyzer
```

### Test in Different Locales
```bash
# Development
pnpm dev

# Then visit:
# http://localhost:3000/fr
# http://localhost:3000/en
# http://localhost:3000/es
```

---

## Troubleshooting

### Issue: Modal doesn't appear
**Check:**
- Cookie `locale_selected` exists?
- Modal timeout (500ms) working?
- Dialog component installed?

**Solution:**
```javascript
// Delete cookie in browser console
document.cookie = "locale_selected=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
```

### Issue: Links not working
**Check:**
- Using `href="/path"` not `href="path"`?
- Current locale is detected?
- Middleware is running?

**Solution:**
- Always use root-relative paths: `/dashboard`

### Issue: Animations choppy
**Check:**
- Framer Motion installed?
- GPU acceleration enabled?
- Too many elements animating?

**Solution:**
```bash
pnpm install framer-motion
```

### Issue: Toast not showing
**Check:**
- Sonner installed and configured?
- Toaster component in layout?

**Solution:**
```bash
pnpm install sonner
```

---

## Completion Criteria

✅ **Phase 1 Complete When:**
- LocaleSelectorModal appears on first visit
- LocaleSwitcher works in header
- All navigation uses LocaleAwareLink
- Language changes work without errors

✅ **Phase 2 Complete When:**
- Settings page functional
- Page transitions smooth
- Badges/indicators display correctly

✅ **Phase 3 Complete When:**
- All functional tests pass
- Accessibility requirements met
- Visual testing complete across devices
- Performance benchmarks met

✅ **Phase 4 Complete When:**
- Documentation updated
- Team trained on new components

✅ **Phase 5 Complete When:**
- Deployed to production
- No critical errors
- User feedback positive

---

**Current Status:** ✅ All components created and ready for integration

**Next Action:** Start Phase 1.1 - Root Layout Integration

---

**Last Updated:** 2024  
**Project:** fygs.dev  
**Framework:** Next.js 15.5.3 + Intlayer 7.0.3
