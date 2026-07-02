import { Injectable, signal } from '@angular/core';
import { CotoColorRole, readCotoColor } from '../tokens/color-tokens';

export type CotoThemeMode = 'light' | 'dark';

const DARK_CLASS = 'coto-dark-theme';
const STORAGE_KEY = 'coto-ui-kit.theme-mode';

/**
 * Shared service to toggle light/dark mode and read M3 color roles at
 * runtime (useful for canvas/charts that can't use `var(--mat-sys-*)`
 * directly in CSS). Registered at the root level ('providedIn: root'),
 * so each consuming app gets a single instance with no extra setup.
 */
@Injectable({ providedIn: 'root' })
export class CotoThemeService {
  readonly mode = signal<CotoThemeMode>(this.readInitialMode());

  constructor() {
    this.applyClass(this.mode());
  }

  setMode(mode: CotoThemeMode): void {
    this.mode.set(mode);
    this.applyClass(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // localStorage may not be available (SSR); not critical.
    }
  }

  toggle(): void {
    this.setMode(this.mode() === 'light' ? 'dark' : 'light');
  }

  /** Reads the resolved value (hex/rgb) of a currently active M3 color role. */
  getColor(role: CotoColorRole): string {
    return readCotoColor(role);
  }

  private applyClass(mode: CotoThemeMode): void {
    if (typeof document === 'undefined') return; // SSR guard
    document.documentElement.classList.toggle(DARK_CLASS, mode === 'dark');
  }

  private readInitialMode(): CotoThemeMode {
    try {
      // `typeof localStorage === 'undefined'` alone isn't enough: some
      // environments (SSR shims, certain test runners) expose a
      // `localStorage` global that isn't a real Storage implementation
      // (e.g. missing `getItem`). Guard with try/catch too.
      if (typeof localStorage === 'undefined' || typeof localStorage.getItem !== 'function') {
        return 'light';
      }
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }
}
