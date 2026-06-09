# Angular New Component Command

## Description
Create a new Angular 21 standalone component with proper structure and best practices.

## Usage
```
Create a new component for [feature] with [specific functionality]
```

## Generated Structure
```
src/app/features/[feature]/
├── components/
│   └── [component-name].component.ts
├── services/
│   └── [service-name].service.ts
└── models/
    └── [model-name].ts
```

## Component Template
```typescript
import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';

@Component({
  selector: 'app-[component-name]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // imports: only what the template uses (e.g. ReactiveFormsModule, a PrimeNG module) — NOT CommonModule
  template: `
    <div class="card-modern">
      <!-- Component content; use @if/@for/@switch for control flow -->
    </div>
  `
})
export class [ComponentName]Component {
  // Services
  private readonly service = inject(ServiceName);

  // State
  private readonly state = signal<StateType>(initialState);

  // Derived state (prefer computed over ngOnInit for reactive setup)
  readonly computedValue = computed(() => this.state().property);
}
```

## Best Practices Applied
- Standalone component — never write `standalone: true` (v21 default)
- `ChangeDetectionStrategy.OnPush` (app is zoneless — state flows through signals)
- No `CommonModule`; native control flow (`@if`/`@for`/`@switch`)
- Uses `inject()` for dependency injection
- Follows styles.css styling conventions and PrimeNG v21 styled theming
