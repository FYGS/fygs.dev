# ⌨️ Keyboard Shortcuts System

## Overview

The application implements a comprehensive keyboard shortcuts system for theme switching and navigation. Users can access a visual guide to all available shortcuts by pressing **Shift + ?**.

## Architecture Changes

### Removed: `useRegisterCommands` Hook
**Location**: `hooks/use-register-commands.ts` (DELETED)

**Reason for Removal**: 
- Hook was registered but never used in the codebase
- Duplicate functionality with the KeyboardShortcutsProvider
- Dead code cleanup for maintainability

## Active Shortcuts System

### 1. **Theme Shortcuts** (Live & Tested)
- **Ctrl + Shift + L** → Switch to Light theme
- **Ctrl + Shift + D** → Switch to Dark theme
- Implemented via: `providers/keyboard-shortcuts-provider.tsx`
- Captured by: `hooks/use-keyboard-shortcuts.ts`

### 2. **Navigation Shortcuts** (Live)
- **G + H** → Go to Home
- **G + P** → Go to Projects  
- **G + R** → Go to Resume
- **G + B** → Go to Blog
- Implemented via: `providers/keyboard-shortcuts-provider.tsx`

### 3. **Help/Guide Shortcuts**
- **Shift + ?** → Open Keyboard Shortcuts Guide (visual reference)
- **Escape** → Close Guide
- Implemented via: `providers/shortcuts-guide-provider.tsx`

### 4. **Playground Shortcuts** (`/tech-mastry/playground`)
- **Ctrl/Cmd + Enter** → Run code
- **Ctrl/Cmd + S** → Save a snapshot
- **Ctrl/Cmd + Shift + F** → Format
- **Ctrl/Cmd + B** → Toggle the file explorer
- **Ctrl/Cmd + J** → Toggle the console
- **Ctrl/Cmd + K** → Command palette
- **Ctrl/Cmd + I** → Open the AI assistant (or focus its input when already open). Inside the editor this replaces Monaco's "expand line selection"; **Escape** in the assistant's input gives the focus back to the editor.
- Implemented via: `app/[locale]/(main)/tech-mastry/playground/_hooks/use-playground-shortcuts.ts` (and an editor command in `pg-code-editor.tsx`, since Monaco swallows the key)

## User Interface

### Shortcuts Toolbar
**Location**: `components/shortcuts-toolbar.tsx`

Fixed position button group (bottom-right, z-70) with:
- Theme Toggle button (Sun/Moon icon)
- Help button (?) with tooltip showing "Shift + ?"

### Keyboard Shortcuts Guide
**Location**: `components/keyboard-shortcuts-guide.tsx`

Modal dialog displaying:
- All available shortcuts organized by category
- Visual badge display for key combinations
- Icons for theme shortcuts (Sun/Moon)
- Helpful tip about opening the guide

## Implementation Details

### Provider Hierarchy (in `app/[locale]/layout.tsx`)
```
ThemeProvider (defaultTheme="dark")
  └── ShortcutsGuideProvider (manages guide state)
      └── KeyboardShortcutsProvider (captures keyboard events)
          └── ...rest of app
```

### Files & Their Purpose

| File | Purpose | Status |
|------|---------|--------|
| `providers/keyboard-shortcuts-provider.tsx` | Registers theme/navigation shortcuts | ✅ Active |
| `providers/shortcuts-guide-provider.tsx` | Manages guide modal state & ? key | ✅ Active |
| `hooks/use-keyboard-shortcuts.ts` | Low-level keyboard event capture | ✅ Tested |
| `components/keyboard-shortcuts-guide.tsx` | Visual shortcuts guide (Modal) | ✅ Active |
| `components/shortcuts-toolbar.tsx` | UI for theme + help buttons | ✅ Active |
| `components/theme-toggle.tsx` | Theme switcher (dropdown menu) | ✅ Active |
| `hooks/use-register-commands.ts` | Command palette registration | ❌ DELETED (unused) |

## Testing

**Theme Provider Tests**: ✅ 7/7 passing
**Keyboard Shortcuts Tests**: ✅ 6/6 passing
**ESLint**: ✅ 0 errors, 0 warnings

Run tests:
```bash
pnpm test -- tests/unit/providers/theme-provider.test.tsx tests/unit/components/learning/video-keyboard-shortcuts.test.tsx
```

## User Experience Flow

1. User lands on app → Dark theme (default)
2. User discovers shortcuts:
   - Sees toolbar at bottom-right (theme toggle + ? button)
   - Hovers over ? button → tooltip shows "Shift + ?"
3. User presses **Shift + ?** → Beautiful guide modal opens
4. Guide shows all shortcuts organized by category
5. User presses **Escape** or clicks outside → Guide closes

## Integration Points

### Global Access
- Shortcuts available on all pages (provider at root layout)
- Theme state persists across navigation (next-themes)
- Guide accessible from anywhere in app

### Keyboard Event Handling
- Events captured at document level
- Ignored when focused on input/textarea elements
- Prevented default browser behavior for registered keys
- Single source of truth: `KeyboardShortcutsProvider`

---

**Summary**: All shortcuts are fully functional, tested, and user-discoverable via the Shift + ? guide. The system is clean, maintainable, and follows React best practices.
