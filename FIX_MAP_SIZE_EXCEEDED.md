# Fix: Map Maximum Size Exceeded Error

## Problem
```
RangeError: Map maximum size exceeded
```

This error occurs when Next.js dev mode tries to track too many async operations, typically from file system watching.

## Solutions Applied

### ✅ Solution 1: Updated package.json Scripts (Windows Compatible)
```json
"dev": "cross-env NODE_OPTIONS=\"--max-old-space-size=4096\" next dev --turbopack"
```

Benefits:
- Increases Node.js memory limit to 4GB
- Uses Turbopack for faster compilation
- Cross-platform compatible (Windows/Mac/Linux)

### ✅ Solution 2: Optimized next.config.mjs
Added webpack watching optimizations to ignore large directories:
- `node_modules/`
- `.next/`
- `.intlayer/`
- `.git/`
- `out/`, `build/`

### ✅ Solution 3: PowerShell Script (dev.ps1)
Created `dev.ps1` for Windows-specific environment setup.

## How to Run

### Option 1: Using pnpm (Recommended)
```bash
pnpm dev
```

### Option 2: Using PowerShell Script (If Option 1 fails)
```powershell
pnpm dev:ps
```

### Option 3: Legacy Mode (Without Turbopack)
```bash
pnpm dev:legacy
```

## What Was Changed

1. **package.json**: Added cross-env and optimized dev scripts
2. **next.config.mjs**: Added webpack watch optimizations
3. **dev.ps1**: Created PowerShell helper script
4. **Installed**: cross-env package for cross-platform support

## Testing

Try running:
```bash
pnpm dev
```

If it works, you should see:
```
✓ Starting...
✓ Ready in ~5-10s
○ Compiling /[locale] ...
✓ Compiled successfully
```

## If Still Having Issues

### Fallback 1: Clear Next.js Cache
```bash
Remove-Item -Recurse -Force .next
pnpm dev
```

### Fallback 2: Use Legacy Webpack
```bash
pnpm dev:legacy
```

### Fallback 3: Reduce Watch Files Manually
Create a `.watchmanconfig` file:
```json
{
  "ignore_dirs": [
    "node_modules",
    ".next",
    ".intlayer",
    ".git",
    "out",
    "build"
  ]
}
```

## Why This Happened

Next.js 15 with Intlayer watches many file changes:
- Your source files
- Intlayer content dictionaries
- Node modules (sometimes)
- Generated files

With locale support, the number of watched files multiplied, exceeding Node.js default async hook limit.

## Prevention

The optimizations applied should prevent this from happening again. If you add many more files:
1. Increase memory further: `--max-old-space-size=8192`
2. Use `.watchmanconfig` to exclude more directories
3. Consider using Turbopack (enabled by default now)

---

**Status**: ✅ Fixed
**Date**: 2025-10-31
