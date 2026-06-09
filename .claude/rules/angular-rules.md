# Angular 21 Development Rules

## Component Development
- All components MUST be standalone — NEVER write `standalone: true` (it is the v21 default)
- Do NOT import `CommonModule` for control flow — `@if`/`@for`/`@switch` are built in; import only what the template uses
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in @Component decorator
- Use `input()` and `output()` functions instead of `@Input()` and `@Output()` decorators
- Use signals for state management: `signal()`, `computed()`, `effect()`
- Use native control flow: `@if`, `@for`, `@switch` instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use `@defer` for lazy loading heavy components
- Use `inject()` instead of constructor injection
- Put host bindings in `host` object of decorator, NOT `@HostBinding`/`@HostListener`
- Use `NgOptimizedImage` for static images (not base64)

## State Management
- The app is **zoneless** (`provideZonelessChangeDetection()`): there is no Zone.js — all UI updates must flow through signals
- Use `signal()` for local component state
- Use `computed()` for derived state
- Use `effect()` for side effects
- Use `resource()` for Promise-returning async, `rxResource()` for Observable-returning async
- NEVER use `mutate()` on signals - use `update()` or `set()`

## Forms
- Prefer Reactive Forms over Template-driven
- Use Signals for form validation
- Implement password visibility toggle
- Implement rate limiting for login attempts
- NEVER store JWT in localStorage

## Styling
- Use PrimeNG v21 styled theming (`@primeuix/themes` + `cssLayer`); attach `styles.css` classes via the Pass Through API
- Map styles.css tokens to PrimeNG components via `pt` configuration
- NEVER use hex values - ALWAYS use CSS custom properties
- Use class bindings instead of `ngClass`
- Use style bindings instead of `ngStyle`

## Security
- NEVER store JWT in localStorage (use HttpOnly cookies or in-memory)
- Use functional interceptors for auth
- Sanitize all user input with `DomSanitizer`
- Follow OWASP guidelines

## Configuration & Environment
- NEVER hardcode external service URLs (APIs, CDNs, fonts, etc.)
- NEVER hardcode environment variable values in code
- Use environment variables for all external service URLs (this app reads `NG_APP_*` from `import.meta.env`)
- When reading `import.meta.env`, use a typed accessor — NEVER `as any` (see `app.config.ts` for the `any`-free pattern)
- Add all required environment variables to `.env.example`

## Accessibility
- MUST pass all AXE checks
- MUST follow WCAG AA minimums (focus management, color contrast, ARIA attributes)
- Implement proper focus management for interactive elements
- Ensure keyboard navigation works for all interactive components

## TypeScript
- Strict mode enabled
- NEVER use `any` - use `unknown` when type is uncertain
- NEVER use `@ts-ignore`
- Prefer type inference when obvious

## Testing
- The project uses **Vitest** (`vitest` + `jsdom`) — run with `npm test`. Playwright is NOT installed.
- Write focused unit/component tests for logic and user flows (Login -> Create -> Delete)
- Don't over-test trivial components

## Performance
- Signals drive change detection in this zoneless app — keep state in signals
- Use `@defer` for lazy loading
- Use `NgOptimizedImage` for images
