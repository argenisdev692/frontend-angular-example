import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterCriteria {
  search: string;
  startDate: Date | null;
  endDate: Date | null;
  status: string | null;
}

@Component({
  selector: 'app-advanced-filter',
  imports: [FormsModule, DatePickerModule, SelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './advanced-filter.component.html',
  styleUrl: './advanced-filter.component.css',
})
export class AdvancedFilterComponent {
  // ── Inputs ────────────────────────────────
  /** Options for the status select (label/value). */
  readonly statusOptions = input<FilterOption[]>([]);
  readonly searchPlaceholder = input<string>('Search…');

  // ── Outputs ───────────────────────────────
  readonly filtersChange = output<FilterCriteria>();
  readonly create = output<void>();
  readonly exportPdf = output<void>();
  readonly exportExcel = output<void>();

  // ── State (signals) ───────────────────────
  readonly search = signal('');
  readonly dateRange = signal<Date[] | null>(null); // [start, end]
  readonly status = signal<string | null>(null);
  readonly advancedOpen = signal(false);

  /** Count of active advanced filters → badge on the Filters button. */
  readonly activeCount = computed(() => {
    let n = 0;
    const r = this.dateRange();
    if (r?.[0]) n++;
    if (this.status()) n++;
    return n;
  });

  private debounce?: ReturnType<typeof setTimeout>;

  onSearchInput(value: string): void {
    this.search.set(value);
    clearTimeout(this.debounce);
    this.debounce = setTimeout(() => this.emit(), 300);
  }

  toggleAdvanced(): void {
    this.advancedOpen.update((v) => !v);
  }

  apply(): void {
    this.emit();
    this.advancedOpen.set(false);
  }

  clear(): void {
    this.search.set('');
    this.dateRange.set(null);
    this.status.set(null);
    this.emit();
  }

  private emit(): void {
    const range = this.dateRange();
    this.filtersChange.emit({
      search: this.search().trim(),
      startDate: range?.[0] ?? null,
      endDate: range?.[1] ?? null,
      status: this.status(),
    });
  }
}

<div class="filter-bar">
  <!-- LEFT: search + advanced toggle -->
  <div class="filter-bar__left">
    <div class="search-box">
      <svg class="search-box__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
      </svg>
      <input
        class="search-box__input"
        type="text"
        [placeholder]="searchPlaceholder()"
        [value]="search()"
        (input)="onSearchInput($any($event.target).value)" />
      @if (search()) {
        <button class="search-box__clear" type="button" aria-label="Clear search" (click)="onSearchInput('')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      }
    </div>

    <button class="btn btn--ghost filter-toggle" type="button" [class.active]="advancedOpen()" (click)="toggleAdvanced()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
      </svg>
      <span>Filters</span>
      @if (activeCount() > 0) {
        <span class="filter-toggle__badge">{{ activeCount() }}</span>
      }
    </button>
  </div>

  <!-- RIGHT: actions -->
  <div class="filter-bar__actions">
    <button class="btn btn--ghost" type="button" (click)="exportPdf.emit()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
      <span>PDF</span>
    </button>
    <button class="btn btn--ghost" type="button" (click)="exportExcel.emit()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13l6 6M15 13l-6 6" /></svg>
      <span>Excel</span>
    </button>
    <button class="btn btn--primary" type="button" (click)="create.emit()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
      <span>New</span>
    </button>
  </div>

  <!-- ADVANCED PANEL -->
  @if (advancedOpen()) {
    <div class="filter-panel">
      <div class="filter-field">
        <label>Date range</label>
        <p-datepicker
          [ngModel]="dateRange()"
          (ngModelChange)="dateRange.set($event)"
          selectionMode="range"
          [readonlyInput]="true"
          dateFormat="dd/mm/yy"
          placeholder="Start — End"
          [showButtonBar]="true"
          appendTo="body"
          styleClass="filter-datepicker" />
      </div>

      <div class="filter-field">
        <label>Status</label>
        <p-select
          [options]="statusOptions()"
          [ngModel]="status()"
          (ngModelChange)="status.set($event)"
          optionLabel="label"
          optionValue="value"
          placeholder="All"
          [showClear]="true"
          appendTo="body"
          styleClass="filter-select" />
      </div>

      <div class="filter-panel__actions">
        <button class="btn btn--ghost" type="button" (click)="clear()">Clear</button>
        <button class="btn btn--primary" type="button" (click)="apply()">Apply</button>
      </div>
    </div>
  }
</div>

:host {
  display: block;
  font-family: var(--font-sans);
}

/* ── BAR ───────────────────────────────────── */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: color-mix(in srgb, var(--bg-surface) 55%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
}

.filter-bar__left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
  min-width: 240px;
}

.filter-bar__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
}

/* ── SEARCH BOX ────────────────────────────── */
.search-box {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
  max-width: 360px;
  height: 40px;
  padding: 0 var(--space-3);
  background: color-mix(in srgb, var(--text-primary) 5%, transparent);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  transition: border-color var(--transition), box-shadow var(--transition);
}
.search-box:focus-within {
  border-color: color-mix(in srgb, var(--accent-primary) 55%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 14%, transparent);
}
.search-box__icon { width: 16px; height: 16px; color: var(--text-muted); flex-shrink: 0; }
.search-box__input {
  flex: 1;
  min-width: 0;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
}
.search-box__input::placeholder { color: var(--text-muted); }
.search-box__clear {
  width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center;
  border: none; background: transparent;
  color: var(--text-muted); cursor: pointer; flex-shrink: 0;
}
.search-box__clear svg { width: 14px; height: 14px; }
.search-box__clear:hover { color: var(--text-primary); }

/* ── BUTTONS ───────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 40px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition);
}
.btn svg { width: 16px; height: 16px; }

.btn--ghost {
  background: color-mix(in srgb, var(--text-primary) 5%, transparent);
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
}
.btn--ghost:hover {
  background: color-mix(in srgb, var(--text-primary) 10%, transparent);
  border-color: var(--border-strong);
  color: var(--text-primary);
}

.btn--primary {
  background: var(--accent-primary);
  border: 1px solid transparent;
  color: var(--on-accent);
  font-weight: var(--font-semibold);
}
.btn--primary:hover {
  background: color-mix(in srgb, var(--accent-primary) 88%, #ffffff);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--accent-primary) 35%, transparent);
}

/* Filters toggle + badge */
.filter-toggle.active {
  border-color: color-mix(in srgb, var(--accent-primary) 45%, transparent);
  color: var(--accent-primary);
  background: color-mix(in srgb, var(--accent-primary) 10%, transparent);
}
.filter-toggle__badge {
  min-width: 18px; height: 18px; padding: 0 5px;
  border-radius: 9px;
  background: var(--accent-primary);
  color: var(--on-accent);
  font-size: 10px; font-weight: var(--font-bold);
  display: flex; align-items: center; justify-content: center;
}

/* ── ADVANCED PANEL ────────────────────────── */
.filter-panel {
  flex-basis: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--space-4);
  margin-top: var(--space-2);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-default);
  animation: panel-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes panel-in {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 220px;
}
.filter-field label {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.filter-panel__actions {
  display: flex;
  gap: var(--space-2);
  margin-left: auto;
}

/* ── PrimeNG trigger overrides (navy/aqua) ──── */
:host ::ng-deep .filter-select.p-select,
:host ::ng-deep .filter-datepicker .p-inputtext {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: var(--input-radius);
  color: var(--text-primary);
}
:host ::ng-deep .filter-select.p-select:not(.p-disabled):hover,
:host ::ng-deep .filter-datepicker .p-inputtext:hover {
  border-color: var(--input-border-hover);
}
:host ::ng-deep .filter-select.p-select.p-focus,
:host ::ng-deep .filter-datepicker .p-inputtext:focus {
  border-color: var(--input-border-focus);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 14%, transparent);
}
:host ::ng-deep .filter-select .p-select-label { color: var(--text-primary); }
:host ::ng-deep .filter-select .p-select-label.p-placeholder { color: var(--text-muted); }

/* ── RESPONSIVE ────────────────────────────── */
@media (max-width: 768px) {
  .filter-bar__left { width: 100%; flex-basis: 100%; }
  .search-box { max-width: none; }
  .filter-bar__actions { width: 100%; margin-left: 0; }
  .filter-bar__actions .btn { flex: 1; justify-content: center; }
  .filter-field { min-width: 100%; }
  .filter-panel__actions { width: 100%; margin-left: 0; }
  .filter-panel__actions .btn { flex: 1; justify-content: center; }
}

@media (prefers-reduced-motion: reduce) {
  .filter-panel { animation: none; }
}