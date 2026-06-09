# Angular 21 Development Skill (2026)

## Overview
Expert in Angular 21 with Standalone Components (default), Signals, native control flow, and **zoneless** change detection (`provideZonelessChangeDetection()` is enabled in this project).

## Core Competencies

### Standalone Components
- Components are standalone **by default** — NEVER write `standalone: true` (redundant in v21).
- Only import what the template uses (e.g. `ReactiveFormsModule`, a PrimeNG module). Do NOT import `CommonModule` just for control flow — `@if`/`@for`/`@switch` are built in.
- Use `input()` / `output()` functions, never `@Input()` / `@Output()`.
- Use `@defer` for lazy loading heavy UI.

### Signals & State (zoneless)
- `signal()` for local state, `computed()` for derived state, `effect()` for side effects.
- This app is **zoneless**: there is no Zone.js. State changes must flow through signals (or `markForCheck` in rare interop). Avoid patterns that relied on Zone auto-detection.
- `resource()` for **Promise**-returning async; `rxResource()` for **Observable**-returning async.
- Never use `mutate()` — use `update()` or `set()`.

### Dependency Injection
- Use `inject()` — never constructor injection.
- `providedIn: 'root'` for singletons. Functional interceptors (`HttpInterceptorFn`) for HTTP.

### Forms
- Reactive Forms; drive loading/disabled state with signals.
- Disable submit during `isLoading()` to prevent double submit.

### Performance
- Signals drive change detection; combine with `ChangeDetectionStrategy.OnPush`.
- `@defer` for lazy loading; `NgOptimizedImage` for static images.

## Common Patterns

### Component with Signals (no `standalone: true`, no `CommonModule`)
```typescript
import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-counter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>Count: {{ count() }}</p>
    <p>Doubled: {{ doubled() }}</p>
    <button (click)="increment()">Increment</button>
  `
})
export class CounterComponent {
  readonly count = signal(0);
  readonly doubled = computed(() => this.count() * 2);

  increment(): void {
    this.count.update(c => c + 1);
  }
}
```

### resource() — Promise loader (matches ng-openapi-gen `--promises true`)
```typescript
import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';

@Component({
  selector: 'app-product-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (productsResource.isLoading()) {
      <p>Loading...</p>
    } @else if (productsResource.error()) {
      <p>Could not load products</p>
    } @else {
      <ul>
        @for (product of productsResource.value(); track product.id) {
          <li>{{ product.name }}</li>
        } @empty {
          <li>No products</li>
        }
      </ul>
    }
  `
})
export class ProductListComponent {
  private productService = inject(ProductService);

  // loader MUST return a Promise; getAll() returns Promise<Product[]>
  productsResource = resource({
    loader: () => this.productService.getAll()
  });
}
```

> If a service returns an `Observable`, use `rxResource({ stream: () => obs$ })` instead of `resource()`.

### Reactive Form with Signals
```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <input formControlName="email" type="email" />
      @if (loginForm.controls.email.invalid && loginForm.controls.email.touched) {
        <small>Invalid email</small>
      }
      <button type="submit" [disabled]="loginForm.invalid || isLoading()">Login</button>
    </form>
  `
})
export class LoginComponent {
  readonly isLoading = signal(false);

  readonly loginForm = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] })
  });

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.isLoading.set(true);
    // auth logic
  }
}
```

## Best Practices
- Standalone is the default — never write `standalone: true`.
- Don't import `CommonModule` for control flow — use `@if`/`@for`/`@switch`.
- Prefer signals over RxJS for UI state (the app is zoneless).
- `inject()` over constructor injection; `resource()`/`rxResource()` for async.
- Never use `any` — use `unknown` and narrow.
- Initialize derived data with `computed()`; prefer it over `ngOnInit` for setup that can be reactive.
- Follow the official Angular 21 docs for the latest APIs.
