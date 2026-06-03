@AGENTS.md

# Frontend Project - Angular 21

## Architecture
- **Framework:** Angular 21 with Standalone Components (default)
- **TypeScript:** Strict mode enabled
- **State Management:** Signals (signal, computed, effect) + resource/rxResource for async
- **Styling:** PrimeNG unstyled mode + Pass Through API + styles.css design tokens
- **Authentication:** HttpOnly cookies or in-memory JWT (NEVER localStorage)
- **Validation:** Angular Reactive Forms with Signals
- **Forms:** Angular Reactive Forms
- **Tables:** PrimeNG Table with unstyled mode
- **UI Components:** PrimeNG unstyled components
- **Icons:** PrimeIcons or custom SVG icons
- **Toasts:** PrimeNG Message/Toast service
- **HTTP:** HttpClient with functional interceptors
- **Testing:** Playwright for integration tests

## Commands
- `ng serve` - Start development server
- `ng build` - Production build
- `ng test` - Run unit tests
- `ng lint` - ESLint check
- `ng e2e` - Run Playwright/Cypress tests
- `ng add` - Add Angular packages

## Scaffolding (Claude Code)
- Rules: `.claude/rules/angular-rules.md` (always-on), `.claude/rules/styles.md` (always-on)
- Skills: `.claude/skills/ANGULAR-21/SKILL.md`, `.claude/skills/PRIMENG-UNSTYLED/SKILL.md`, `.claude/skills/ARCHITECTURE-ANGULAR/ARCHITECTURE-ANGULAR.md`, `.claude/skills/OWASP/SKILL.md`
- Commands: `.claude/commands/ANGULAR-NEW.md`, `.claude/commands/ANGULAR-NEW-CRUD.md`, `.claude/commands/ANGULAR-MODULE-FROM-API.md`, `.claude/commands/ANGULAR-AUDIT.md`
- Settings: `.claude/settings.json`

## Important Context

### Component Rules
- All components are standalone by default (NO `standalone: true` needed in v21)
- Use `input()` and `output()` functions instead of decorators
- Use signals for state management (signal, computed, effect)
- Use `computed()` for derived state
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use `@defer` for lazy loading heavy components
- Prefer Reactive Forms over Template-driven
- Use `inject()` instead of constructor injection
- Put host bindings in `host` object of decorator, NOT `@HostBinding`/`@HostListener`
- Use `NgOptimizedImage` for static images (not base64)

### Data Fetching
- Use `resource()` or `rxResource()` for async data fetching
- Services use `providedIn: 'root'` for singletons
- Use functional interceptors for auth tokens
- Validate responses with Zod or JSON Schema
- Use `isPending` (not `isLoading`) for loading states
- NEVER use `any` - use `unknown` when type is uncertain

### Styling Rules
- Maintain existing styles.css design tokens (CSS custom properties)
- Use PrimeNG unstyled mode with Pass Through API
- Map styles.css tokens to PrimeNG components via `pt` configuration
- NEVER use hex values, ALWAYS use CSS custom properties (`var(--token)`)
- Before implementing any component, read `styles.css` and use existing tokens
- If a token doesn't exist, add it to `styles.css` first
- Dark-first design with light mode override via `[data-theme="light"]`
- Use class bindings instead of `ngClass`
- Use style bindings instead of `ngStyle`

### PrimeNG Unstyled Configuration
```typescript
// app.config.ts
providePrimeNG({
  unstyled: true,
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '[data-theme="dark"]'
    }
  },
  pt: {
    button: { root: 'btn-modern btn-modern-primary' },
    input: { root: 'form-input' },
    // Map styles.css classes
  }
})
```

### Security
- NEVER store JWT in localStorage (use HttpOnly cookies or in-memory)
- Use functional interceptors for auth
- Sanitize all user input with `DomSanitizer`
- Follow OWASP frontend security guidelines
- Never expose stack traces to clients
- Use environment variables for sensitive data

### Accessibility (WCAG 2.2 AA)
- Focus rings: `outline: 2px solid var(--accent-primary); outline-offset: 2px`
- Text contrast ≥ 4.5:1 (normal), ≥ 3:1 (large)
- Icon-only buttons MUST have `aria-label` or `title`
- Modals close on `Escape`
- Minimum 24×24px tap targets
- MUST pass all AXE checks

### Project Structure (Clean Architecture)
```
src/
├── app/
│   ├── core/              # Singleton services, interceptors
│   ├── features/           # Feature modules (auth, products)
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── models/
│   │   └── products/
│   ├── shared/             # Shared components, pipes, directives
│   └── config/             # app.config.ts, routes
├── assets/
└── styles/
    └── styles.css
```

## Don'ts
- NEVER use NgModules - all components must be standalone
- NEVER use `@HostBinding`/`@HostListener` - use host object in decorator
- NEVER use `ngClass`/`ngStyle` - use class/style bindings
- NEVER use `*ngIf`/`*ngFor`/`*ngSwitch` - use `@if`/`@for`/`@switch`
- NEVER use `any`, `@ts-ignore`, or `as unknown as X` - use `unknown`
- NEVER store JWT in localStorage
- NEVER use `console.log` in production code
- NEVER use pipes for complex transformation - use `computed()`
- NEVER use async pipe excessively - prefer signal binding
- NEVER use `mutate` on signals - use `update` or `set`
