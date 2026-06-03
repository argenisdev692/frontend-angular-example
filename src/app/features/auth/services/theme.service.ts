import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'theme-preference';

  // Current theme signal (default dark to match existing design)
  private _mode = signal<ThemeMode>('dark');
  readonly mode = this._mode.asReadonly();

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const stored = localStorage.getItem(this.storageKey) as ThemeMode | null;
    const initial: ThemeMode = stored === 'light' || stored === 'dark' ? stored : 'dark';
    this._mode.set(initial);
    this.apply(initial);
  }

  toggle(): void {
    const next: ThemeMode = this._mode() === 'dark' ? 'light' : 'dark';
    this.set(next);
  }

  set(mode: ThemeMode): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this._mode.set(mode);
    localStorage.setItem(this.storageKey, mode);
    this.apply(mode);
  }

  private apply(mode: ThemeMode): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const html = document.documentElement;

    if (mode === 'dark') {
      html.classList.add('dark');
      html.removeAttribute('data-theme');
    } else {
      html.classList.remove('dark');
      html.setAttribute('data-theme', 'light');
    }
  }
}
