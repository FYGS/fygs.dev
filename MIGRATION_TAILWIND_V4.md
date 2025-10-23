# Tailwind CSS v3 to v4 Migration Guide

## Overview
This document details the migration of the project from Tailwind CSS v3 to v4, including all changes made and considerations for future maintenance.

## Changes Made

### 1. Package Updates
- Updated `tailwindcss` from v3.4.17 to v4.0.0
- Kept compatible versions of related packages:
  - `@tailwindcss/typography`: ^0.5.16
  - `tailwind-scrollbar`: ^4.0.2
  - `tailwindcss-animate`: ^1.0.7

### 2. Configuration Changes
- Updated `tailwind.config.ts` to use the new v4 configuration format
- Changed from ESM imports to CommonJS requires for plugins due to compatibility
- Updated the configuration structure to match v4 requirements

### 3. Custom Plugin Updates
- Created `lib/tailwind-plugins/playground-animations-v4.js` - a v4-compatible version of the custom plugin
- The new plugin follows the v4 plugin API while maintaining all original functionality
- Updated the configuration to use the new v4-compatible plugin

### 4. PostCSS Configuration
- No changes needed for `postcss.config.mjs` as the basic setup remains the same

## Key Considerations for Tailwind CSS v4

### Breaking Changes Addressed
1. **Plugin System**: Updated custom plugin to work with v4's plugin system
2. **Configuration Format**: Updated configuration to match v4's requirements
3. **Import Syntax**: Used CommonJS requires in config file for better compatibility

### Features Preserved
- All custom animations (blob, pulse-glow, futuristic-spin, gradient-xy)
- All custom utility classes (animate-blob, animate-pulse-glow, etc.)
- All custom component classes (futuristic-spinner, shortcut-kbd, glass-panel, neon-border)
- Typography styling
- Scrollbar styling
- Animation utilities

## Files Modified

1. `package.json` - Updated tailwindcss version
2. `tailwind.config.ts` - Updated to v4-compatible configuration
3. `lib/tailwind-plugins/playground-animations-v4.js` - New v4-compatible plugin
4. `lib/tailwind-plugins/playground-animations.js.backup` - Backup of original plugin
5. `postcss.config.mjs.backup` - Backup of original PostCSS config
6. `tailwind.config.ts.backup` - Backup of original config

## Testing Recommendations

After deployment, verify the following:
1. All UI components render correctly
2. Custom animations work as expected
3. Dark mode functionality remains intact
4. Responsive design works properly
5. All interactive elements maintain their styling

## Rollback Plan

If issues arise:
1. Restore original files from backup:
   - `tailwind.config.ts.backup` → `tailwind.config.ts`
   - `postcss.config.mjs.backup` → `postcss.config.mjs`
   - `lib/tailwind-plugins/playground-animations.js.backup` → `lib/tailwind-plugins/playground-animations.js`
2. Downgrade `tailwindcss` back to v3.4.17 in `package.json`
3. Reinstall dependencies

## Additional Notes

- The project uses a significant amount of custom CSS in the `styles/` directory which remains unchanged
- All `@apply` directives in CSS files should continue to work as expected
- The Next.js 15 setup is compatible with Tailwind CSS v4
- The shadcn/ui components should continue to work without issues