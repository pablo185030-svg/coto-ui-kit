/**
 * SINGLE SOURCE OF TRUTH (TS) for Coto UI Kit's color palette
 * (Material Design 3, following Nexo's real export — Colors > Color
 * Schemes > Light Mode). Must mirror the same values as
 * `projects/coto-ui-kit/styles/_tokens.scss` (seeds) and
 * `_color-scheme.scss` (full scheme, role by role).
 *
 * Dark mode: pending — Nexo hasn't exported the dark scheme yet. Until
 * then, the dark theme uses the base that Angular Material generates
 * automatically from the seed colors below (approximate, not
 * pixel-perfect).
 */

export interface M3SeedColors {
  primary: string;
  secondary: string;
  tertiary: string;
  error: string;
  neutral: string;
  neutralVariant: string;
}

export const COTO_SEED_COLORS: M3SeedColors = {
  primary: '#C41113',
  secondary: '#006494',
  tertiary: '#7436D1',
  error: '#BA1A1A',
  // No explicit "neutral" seed from Nexo; approximated from
  // outline/outline-variant until the real value or dark mode is available.
  neutral: '#797979',
  neutralVariant: '#C9C9C9',
};

/**
 * M3 color roles exposed as CSS custom property names.
 * In light mode they take Nexo's exact value (see `_color-scheme.scss`,
 * which applies them as an override on top of what `mat.theme()`
 * generates); in dark mode it's still Material's generated approximation.
 */
export const COTO_COLOR_ROLE_VARS = {
  primary: '--mat-sys-primary',
  onPrimary: '--mat-sys-on-primary',
  primaryContainer: '--mat-sys-primary-container',
  onPrimaryContainer: '--mat-sys-on-primary-container',
  primaryFixed: '--mat-sys-primary-fixed',
  primaryFixedDim: '--mat-sys-primary-fixed-dim',
  onPrimaryFixed: '--mat-sys-on-primary-fixed',
  onPrimaryFixedVariant: '--mat-sys-on-primary-fixed-variant',
  inversePrimary: '--mat-sys-inverse-primary',
  secondary: '--mat-sys-secondary',
  onSecondary: '--mat-sys-on-secondary',
  secondaryContainer: '--mat-sys-secondary-container',
  onSecondaryContainer: '--mat-sys-on-secondary-container',
  secondaryFixed: '--mat-sys-secondary-fixed',
  secondaryFixedDim: '--mat-sys-secondary-fixed-dim',
  onSecondaryFixed: '--mat-sys-on-secondary-fixed',
  onSecondaryFixedVariant: '--mat-sys-on-secondary-fixed-variant',
  tertiary: '--mat-sys-tertiary',
  onTertiary: '--mat-sys-on-tertiary',
  tertiaryContainer: '--mat-sys-tertiary-container',
  onTertiaryContainer: '--mat-sys-on-tertiary-container',
  tertiaryFixed: '--mat-sys-tertiary-fixed',
  tertiaryFixedDim: '--mat-sys-tertiary-fixed-dim',
  onTertiaryFixed: '--mat-sys-on-tertiary-fixed',
  onTertiaryFixedVariant: '--mat-sys-on-tertiary-fixed-variant',
  error: '--mat-sys-error',
  onError: '--mat-sys-on-error',
  errorContainer: '--mat-sys-error-container',
  onErrorContainer: '--mat-sys-on-error-container',
  surface: '--mat-sys-surface',
  surfaceDim: '--mat-sys-surface-dim',
  surfaceBright: '--mat-sys-surface-bright',
  surfaceVariant: '--mat-sys-surface-variant',
  surfaceContainerLowest: '--mat-sys-surface-container-lowest',
  surfaceContainerLow: '--mat-sys-surface-container-low',
  surfaceContainer: '--mat-sys-surface-container',
  surfaceContainerHigh: '--mat-sys-surface-container-high',
  surfaceContainerHighest: '--mat-sys-surface-container-highest',
  onSurface: '--mat-sys-on-surface',
  onSurfaceVariant: '--mat-sys-on-surface-variant',
  inverseSurface: '--mat-sys-inverse-surface',
  inverseOnSurface: '--mat-sys-inverse-on-surface',
  outline: '--mat-sys-outline',
  outlineVariant: '--mat-sys-outline-variant',
  background: '--mat-sys-background',
  onBackground: '--mat-sys-on-background',
  scrim: '--mat-sys-scrim',
  shadow: '--mat-sys-shadow',
} as const;

export type CotoColorRole = keyof typeof COTO_COLOR_ROLE_VARS;

/** Reads the resolved value of a color role from the DOM at runtime. */
export function readCotoColor(role: CotoColorRole, el: HTMLElement = document.documentElement): string {
  return getComputedStyle(el).getPropertyValue(COTO_COLOR_ROLE_VARS[role]).trim();
}
