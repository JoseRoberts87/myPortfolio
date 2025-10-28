# Tailwind CSS v4 Migration Guide

**Date**: 2025-10-28
**Tailwind CSS Version**: 4.1.16

## Breaking Changes in Tailwind CSS v4

### 1. PostCSS Plugin Separation

**Old (v3.x)**:
```javascript
// postcss.config.mjs
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**New (v4.x)**:
```javascript
// postcss.config.mjs
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
```

**Why**: The PostCSS plugin has been moved to a separate package `@tailwindcss/postcss` for better modularity and performance.

### 2. CSS Import Syntax

**Old (v3.x)**:
```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**New (v4.x)**:
```css
/* globals.css */
@import "tailwindcss";
```

**Why**: Simplified import syntax that consolidates all Tailwind layers into a single import statement.

### 3. Installation Requirements

**Required Packages**:
```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

**Key Package**: `@tailwindcss/postcss` is now required for PostCSS integration.

## Configuration Files

### postcss.config.mjs
```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};

export default config;
```

### tailwind.config.ts
No major changes to the config file structure:
```typescript
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### src/app/globals.css
```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

## Error Messages You Might See

### PostCSS Plugin Error
```
Error: It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin.
The PostCSS plugin has moved to a separate package, so to continue using Tailwind CSS
with PostCSS you'll need to install `@tailwindcss/postcss` and update your PostCSS configuration.
```

**Solution**:
1. Install `@tailwindcss/postcss`: `npm install -D @tailwindcss/postcss`
2. Update `postcss.config.mjs` to use `'@tailwindcss/postcss'` instead of `tailwindcss`

## Next.js Specific Setup

### Step 1: Install Dependencies
```bash
npm install tailwindcss @tailwindcss/postcss postcss autoprefixer
```

### Step 2: Configure PostCSS
Create or update `postcss.config.mjs`:
```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};
export default config;
```

### Step 3: Import Tailwind
Update your CSS file (e.g., `app/globals.css`):
```css
@import "tailwindcss";
```

### Step 4: Configure Content Paths
Update `tailwind.config.ts` to scan your files:
```typescript
content: [
  "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
],
```

## Benefits of v4

1. **Faster Build Times**: Improved performance with the new architecture
2. **Simpler Configuration**: Single import statement instead of multiple directives
3. **Better Developer Experience**: Cleaner error messages and better tooling support
4. **Future-Proof**: New architecture designed for upcoming features

## Documentation References

- **Official Tailwind CSS v4 Docs**: https://tailwindcss.com/docs/installation
- **Next.js Integration Guide**: https://tailwindcss.com/docs/installation/framework-guides/nextjs
- **PostCSS Plugin Package**: https://www.npmjs.com/package/@tailwindcss/postcss

## Migration Checklist

- [x] Install `@tailwindcss/postcss` package
- [x] Update PostCSS config to use `@tailwindcss/postcss`
- [x] Replace `@tailwind` directives with `@import "tailwindcss"`
- [x] Test development server
- [x] Verify production build works
- [ ] Update any custom PostCSS plugins if needed
- [ ] Check for breaking changes in custom Tailwind plugins

## Notes

- The transition from v3 to v4 is relatively straightforward
- Most existing Tailwind utility classes work the same way
- Configuration files remain largely compatible
- Main changes are in the build tooling, not the utility classes themselves
