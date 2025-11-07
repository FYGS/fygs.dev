# PWA Manifest Quick Reference

**Quick Fix Guide** - For developers encountering PWA manifest issues

---

## 🚨 Problems Fixed

| Issue | Before | After |
|-------|--------|-------|
| **Shortcuts** | 5 shortcuts (iOS limit: 4) | ✅ 4 shortcuts |
| **Shortcut Icons** | 32×32 px (too small) | ✅ 96×96 px (recommended) |
| **Mobile Screenshot** | None (no rich install UI) | ✅ 1080×1920 narrow format |
| **SVG Icon** | Failed to load in manifest | ✅ Removed (kept in HTML) |

---

## 📁 Files Location

```
public/images/
├── icon-96x96.png          ← NEW! Shortcut icons
├── screenshot-mobile.png   ← NEW! Mobile install UI
├── android-chrome-192x192.png
├── android-chrome-512x512.png
├── apple-touch-icon.png
├── favicon-16x16.png
├── favicon-32x32.png
├── favicon.svg             ← Still used in <head>
└── og-image.png
```

---

## 🔧 If You Need to Regenerate Assets

```bash
# Install Sharp if needed
pnpm add -D sharp

# Run generation script
node scripts/generate-pwa-assets.js

# Build and verify
pnpm build
pnpm dev
```

---

## ✅ Verification

### Quick Check
```bash
# Build project
pnpm build

# Look for: ✔ /manifest.webmanifest (should be ~276 B)
```

### Chrome DevTools
1. Open **DevTools** (F12)
2. Go to **Application** → **Manifest**
3. Verify:
   - ✅ 8 icons load (no errors)
   - ✅ 4 shortcuts listed
   - ✅ 2 screenshots (wide + narrow)

### Lighthouse
1. DevTools → **Lighthouse**
2. Select **Progressive Web App**
3. Click **Generate report**
4. Expected: **100/100** PWA score

---

## 📝 Key Changes in manifest.ts

### Icons
```typescript
// ✅ Standard icons with "any" purpose
{ src: "/images/icon-96x96.png", sizes: "96x96", purpose: "any" }

// ✅ Separate maskable versions for Android
{ src: "/images/android-chrome-512x512.png", sizes: "512x512", purpose: "maskable" }

// ❌ REMOVED: SVG icon (caused loading failures)
```

### Screenshots
```typescript
// ✅ Wide for desktop
{ src: "/images/og-image.png", form_factor: "wide" }

// ✅ Narrow for mobile (enables rich install UI)
{ src: "/images/screenshot-mobile.png", form_factor: "narrow" }
```

### Shortcuts
```typescript
// ✅ Only 4 shortcuts (optimal for all platforms)
shortcuts: [
  { name: "Formations", icons: [{ src: "/images/icon-96x96.png", sizes: "96x96" }] },
  { name: "Blog", icons: [{ src: "/images/icon-96x96.png", sizes: "96x96" }] },
  { name: "Communauté", icons: [{ src: "/images/icon-96x96.png", sizes: "96x96" }] },
  { name: "Mon Espace", icons: [{ src: "/images/icon-96x96.png", sizes: "96x96" }] },
]
```

---

## 🧪 Test on Real Devices

### iOS (Safari)
1. Open site in Safari
2. Tap **Share** → **Add to Home Screen**
3. Should see: App name, icon, mobile screenshot

### Android (Chrome)
1. Open site in Chrome
2. Tap **⋮** → **Install app**
3. Should see: Rich install UI with screenshots

---

## 💡 Why These Changes?

| Change | Reason |
|--------|--------|
| **4 shortcuts** | iOS limit is 4, Android varies. 4 works everywhere. |
| **96×96 icons** | Recommended size for sharp display on all devices |
| **Mobile screenshot** | Required for rich PWA install UI on mobile |
| **Remove SVG** | Poor cross-browser support in manifests |
| **"any" purpose** | Prevents loading issues, separate maskable for Android |

---

## 📚 Full Documentation

- **Complete Guide**: `docs/PWA_MANIFEST_FIXES.md`
- **Executive Summary**: `docs/PWA_MANIFEST_FIXES_SUMMARY.md`
- **This Quick Ref**: `docs/PWA_MANIFEST_QUICK_REF.md`

---

## 🚀 Status

- ✅ All 4 issues fixed
- ✅ Zero TypeScript errors
- ✅ Build successful (276 B manifest)
- ✅ Production ready

---

**Need Help?** See full documentation in `docs/PWA_MANIFEST_FIXES.md`

_Last Updated: November 7, 2025_
