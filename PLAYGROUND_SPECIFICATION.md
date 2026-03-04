# FYGS.dev World-Class Playground - Complete Specification

## Vision
Build the most complete, modern, and performant browser-based code playground that surpasses
PlayCode.io, CodeSandbox, StackBlitz, and CodePen. Fully client-side execution with real-time
preview, multi-file projects, and a professional IDE experience.

---

## Architecture Overview

### Core Pillars
1. **Monaco Editor** - Full IDE experience via @monaco-editor/react
2. **Client-Side Execution** - JS/TS via sandboxed iframe, HTML/CSS via live preview
3. **Multi-File Project System** - Virtual filesystem with folder support
4. **Real-Time Preview** - Hot-reloading iframe preview for web projects
5. **Mobile-First Responsive** - Fully usable on all devices

### Technology Stack
- **Editor**: @monaco-editor/react (already installed)
- **Layout**: CSS Grid + custom drag-resize (zero dependency)
- **State**: Zustand with persist middleware (already in use)
- **UI**: shadcn/ui components (already in use)
- **Execution**: Sandboxed iframe with postMessage communication
- **TypeScript**: Browser-side transpilation via TypeScript compiler API
- **Bundling**: Custom ESM-based module resolver with CDN imports

---

## Feature Set

### 1. Editor Core
- [x] Monaco Editor with full IntelliSense
- [x] Multi-file tabbed editor with drag-to-reorder
- [x] Syntax highlighting for 10+ languages
- [x] Auto-completion, parameter hints, hover info
- [x] Code folding, bracket matching, auto-closing
- [x] Find & Replace (Ctrl+H)
- [x] Multi-cursor editing
- [x] Minimap toggle
- [x] Word wrap toggle
- [x] Font size control (12-24px)
- [x] Line numbers toggle
- [x] Bracket pair colorization
- [x] Emmet support for HTML/CSS
- [x] Format on save (Prettier-like)
- [x] Command Palette (Ctrl+Shift+P)

### 2. File System
- [x] Virtual filesystem with folder support
- [x] Create / rename / delete files and folders
- [x] Drag-and-drop file reordering
- [x] File type icons with color coding
- [x] Entry point file indicator
- [x] package.json support with dependency resolution
- [x] File search (Ctrl+P quick open)

### 3. Preview & Output
- [x] Live HTML/CSS/JS preview in sandboxed iframe
- [x] Auto-refresh on code change (debounced)
- [x] Manual refresh button
- [x] Console panel with log levels (log, warn, error, info)
- [x] Console object inspection (expandable objects/arrays)
- [x] Console clear button
- [x] Error overlay with source mapping
- [x] Preview responsive mode (mobile/tablet/desktop viewport sizes)
- [x] Open preview in new tab
- [x] Split view: Editor | Preview (horizontal/vertical)

### 4. Templates
- [x] Vanilla JavaScript
- [x] TypeScript
- [x] HTML + CSS
- [x] React (JSX/TSX via CDN)
- [x] Vue.js (via CDN)
- [x] Tailwind CSS (via CDN play)
- [x] Node.js-style (console-based)
- [x] Algorithm/Data Structure starter
- [x] Template preview thumbnails

### 5. Layout & Panels
- [x] Resizable panels (editor, preview, console)
- [x] Horizontal split (editor left, preview right)
- [x] Vertical split (editor top, preview bottom)
- [x] Editor-only mode (maximize editor)
- [x] Preview-only mode (maximize preview)
- [x] File explorer toggle (sidebar)
- [x] Console panel toggle (bottom dock)
- [x] Responsive layout for mobile (stacked panels with tabs)
- [x] Panel size persistence in localStorage

### 6. Toolbar & Actions
- [x] Run Code button (Ctrl+Enter)
- [x] Format Code button (Shift+Alt+F)
- [x] Save snapshot (Ctrl+S)
- [x] Copy code to clipboard
- [x] Share via URL (compressed code in URL hash)
- [x] Download project as ZIP
- [x] Template selector dialog
- [x] Settings panel
- [x] Theme toggle (dark/light/high-contrast)
- [x] Language indicator
- [x] Execution status indicator (idle/running/success/error)

### 7. Console
- [x] Tabbed console (Console, Problems, Output)
- [x] Syntax-colored log output
- [x] Timestamp for each log entry
- [x] Log level filtering (all/log/warn/error/info)
- [x] Object/Array expandable tree view
- [x] Copy individual log entries
- [x] Clear console
- [x] Console command input (REPL-like)

### 8. Settings
- [x] Editor theme (vs-dark, vs-light, hc-black, One Dark Pro, etc.)
- [x] Font size slider
- [x] Tab size (2/4)
- [x] Word wrap toggle
- [x] Minimap toggle
- [x] Line numbers toggle
- [x] Auto-save toggle
- [x] Auto-run on save toggle
- [x] Bracket pair colorization toggle
- [x] Preview auto-refresh toggle
- [x] Preview delay slider (100ms - 2000ms)
- [x] Persist all settings in localStorage

### 9. Keyboard Shortcuts
- Ctrl+Enter: Run code
- Ctrl+S: Save snapshot
- Shift+Alt+F: Format code
- Ctrl+P: Quick file open
- Ctrl+Shift+P: Command palette
- Ctrl+/: Toggle line comment
- Ctrl+D: Select next occurrence
- Ctrl+B: Toggle sidebar
- Ctrl+J: Toggle console panel
- Ctrl+\: Split editor
- Escape: Close panels/dialogs

### 10. Mobile Experience
- [x] Bottom tab bar for panel switching (Editor/Preview/Console)
- [x] Swipe gestures for panel navigation
- [x] Touch-friendly toolbar with overflow menu
- [x] Virtual keyboard accommodations
- [x] Responsive file explorer (drawer on mobile)
- [x] Minimum touch target 44px

### 11. Performance
- [x] Monaco Editor lazy-loaded (dynamic import)
- [x] Debounced preview updates (300ms default)
- [x] Web Worker for TypeScript transpilation
- [x] Efficient re-renders with React.memo
- [x] Virtualized console output for large logs
- [x] Code splitting for templates

### 12. Accessibility
- [x] ARIA labels on all interactive elements
- [x] Keyboard navigation throughout
- [x] Screen reader announcements for status changes
- [x] High contrast theme support
- [x] Focus management for modals and panels
- [x] Reduced motion preference support

---

## Component Architecture

\\\
playground/
  page.tsx                    # Server component entry
  layout.tsx                  # Layout with meta
  _stores/
    playground-store.ts       # Main Zustand store (unified)
  _types/
    index.ts                  # All TypeScript types
  _config/
    templates.ts              # Template definitions
    languages.ts              # Language configs
    themes.ts                 # Editor themes
    shortcuts.ts              # Keyboard shortcut definitions
    defaults.ts               # Default settings
  _lib/
    executor.ts               # Code execution engine
    preview-builder.ts        # HTML preview builder
    console-capture.ts        # Console interception for iframe
    file-utils.ts             # File type detection, icons
    url-sharing.ts            # URL encode/decode for sharing
    formatter.ts              # Code formatting
  _components/
    playground-shell.tsx      # Main shell (client component root)
    editor-panel.tsx          # Monaco editor with tabs
    file-tabs.tsx             # File tab bar
    file-explorer.tsx         # Sidebar file tree
    preview-panel.tsx         # Live preview iframe
    console-panel.tsx         # Console output panel
    toolbar.tsx               # Top action bar
    status-bar.tsx            # Bottom status bar
    settings-dialog.tsx       # Settings modal
    template-dialog.tsx       # Template picker modal
    command-palette.tsx       # Command palette overlay
    mobile-tabs.tsx           # Mobile bottom tab bar
    share-dialog.tsx          # Share URL dialog
    responsive-layout.tsx     # Layout manager
\\\

---

## State Management (Zustand Store)

\\\	ypescript
interface PlaygroundStore {
  // Files
  files: PlaygroundFile[]
  activeFileId: string | null
  
  // Editor
  editorSettings: EditorSettings
  
  // Execution
  status: 'idle' | 'running' | 'success' | 'error'
  consoleLogs: ConsoleEntry[]
  
  // Layout
  layout: LayoutConfig
  
  // History
  snapshots: Snapshot[]
  
  // Actions
  // ... (file CRUD, execute, format, etc.)
}
\\\

---

## Implementation Phases

### Phase 1: Core Architecture (Foundation)
- New unified store
- New type definitions
- New file utilities
- New execution engine
- Basic playground shell

### Phase 2: Editor & Files
- Monaco editor integration (proper @monaco-editor/react)
- File tabs with active indicator
- File explorer with tree view
- File CRUD operations

### Phase 3: Preview & Console
- Live preview iframe with auto-refresh
- Console panel with log levels
- Error handling and display
- Preview responsive modes

### Phase 4: Toolbar & Settings
- Action toolbar
- Settings dialog
- Template selector
- Keyboard shortcuts
- Command palette

### Phase 5: Mobile & Polish
- Mobile responsive layout
- Touch interactions
- Status bar
- Share functionality
- Download as ZIP
- Performance optimizations

---

## File: page.tsx (Entry Point)
Server component that renders metadata and the client-side shell.

## File: playground-shell.tsx (Client Root)
The main client component that orchestrates the entire playground.
Uses CSS Grid for the layout with resizable panels.
Handles keyboard shortcuts at the top level.

## Execution Model
1. **JavaScript**: Execute in sandboxed iframe via blob URL
2. **TypeScript**: Transpile via TS compiler API, then execute as JS
3. **HTML/CSS**: Build full HTML document, render in iframe
4. **React/Vue**: Inject framework via CDN import map, render in iframe
5. **Multi-file**: Resolve imports via module graph, bundle into single script

---

_This specification represents the target state for the FYGS.dev playground._
_Version: 2.0 - Complete Redesign_
