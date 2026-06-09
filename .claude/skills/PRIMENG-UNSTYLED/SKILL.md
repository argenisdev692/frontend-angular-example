# PrimeNG v21 Theming Skill (2026)

> **Note**: This project uses PrimeNG **styled mode** with `@primeuix/themes` (the modern v18+/v21 theming engine), a custom Aura preset, `cssLayer` for Tailwind v4 interop, and `styles.css` design tokens. It does **NOT** use legacy `unstyled` mode. The folder name is historical.

## Overview
Expert in configuring PrimeNG v21 with the `@primeuix/themes` design-token engine, customizing presets with `definePreset`, layering with `cssLayer` so Tailwind v4 utilities can override component styles, and bridging PrimeNG tokens to the `styles.css` design system.

## Core Concepts

### Styled Mode + Design Tokens
- PrimeNG v21 ships a token-based theming engine (`@primeuix/themes`).
- A **preset** (e.g. `Aura`) defines primitive, semantic, and component tokens.
- Customize tokens with `definePreset(Aura, { ... })` — never fork the whole theme.
- `darkModeSelector` controls when dark tokens apply (this project: `.dark` class on `<html>`).
- `cssLayer` registers PrimeNG styles in a named CSS layer so app/Tailwind styles win without `!important`.

### Pass Through API (structural only)
- `pt` adds classes/attributes to internal DOM nodes — use it to attach `styles.css` classes or Tailwind utilities for layout tweaks.
- In styled mode, `pt` **augments** the theme; it does not replace it.

## Configuration (actual app.config.ts)

```typescript
// src/app/app.config.ts
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

providePrimeNG({
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark',                  // matches ThemeService (.dark = dark, [data-theme="light"] = light)
      cssLayer: { name: 'primeng', order: 'primeng' } // Tailwind v4 utilities override PrimeNG
    }
  }
})
```

> ❌ Do NOT use `import { Aura } from 'primeng/themes'` (wrong path) or `unstyled: true`.
> ✅ The preset comes from `@primeuix/themes/aura`.

### Tailwind v4 Layer Order
Tailwind utilities must sit in a layer that wins over `primeng`. With Tailwind v4 + `@tailwindcss/postcss`, declare the order once in `styles.css`:

```css
@layer primeng, tailwind-utilities;
```

## Customizing Tokens with definePreset

Prefer token overrides over per-component CSS. Map the `styles.css` brand to PrimeNG semantic tokens:

```typescript
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const AquaPreset = definePreset(Aura, {
  semantic: {
    primary: {
      // brand accent (#00B5E2) — keep in sync with --accent-primary
      500: '#00B5E2',
      600: '#33c4e8'
    }
  }
});

providePrimeNG({
  theme: { preset: AquaPreset, options: { darkModeSelector: '.dark', cssLayer: { name: 'primeng', order: 'primeng' } } }
});
```

## Bridging to styles.css Tokens

When a component needs the exact `styles.css` look (cards, buttons), attach existing classes via `pt`:

```html
<p-button label="Save" [pt]="{ root: 'btn-primary-modern' }" />

<p-table [value]="rows()" [pt]="{ root: 'card-modern', header: 'table-minimal' }" />
```

Use CSS custom properties from `styles.css` inside Tailwind arbitrary values when needed:

```html
<p-inputtext [pt]="{ root: '!bg-[var(--input-bg)] !border-[var(--input-border)] !h-[var(--input-height)]' }" />
```

> Note: the global `pt` key for the text input is `inputtext` (not `input`). Match PrimeNG's real component keys.

## Dark Mode

This project is **dark-first**:
- `:root` in `styles.css` = dark tokens (default).
- `ThemeService` adds `.dark` on `<html>` for dark → triggers PrimeNG dark tokens via `darkModeSelector: '.dark'`.
- `ThemeService` sets `[data-theme="light"]` for light → `styles.css` light override.

Always test both: toggle via `ThemeService.toggle()`.

## Best Practices (2026)
- Use the `@primeuix/themes` preset engine; customize with `definePreset`, not forks.
- Keep `cssLayer` enabled so Tailwind v4 overrides cleanly (no `!important` spam).
- Keep PrimeNG semantic tokens in sync with `styles.css` brand tokens.
- Use `pt` for structural class hooks, not to re-theme everything.
- `darkModeSelector` MUST match `ThemeService` (`.dark`).
- Verify dark and light, focus rings, and contrast after any theme change.
