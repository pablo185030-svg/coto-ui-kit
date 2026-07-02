/**
 * SINGLE SOURCE OF TRUTH (TS) for Coto UI Kit's responsive breakpoints.
 * Must mirror the same values as
 * `projects/coto-ui-kit/styles/_breakpoints.scss`.
 *
 * Mobile-first: these are `min-width` thresholds. Pair with Angular
 * CDK's `BreakpointObserver` (`.observe(\`(min-width: ${COTO_BREAKPOINTS.tabletLandscape}px)\`)`)
 * or a plain `window.matchMedia(...)` call.
 */

export interface CotoBreakpoints {
  mobile: number;
  tabletPortrait: number;
  tabletLandscape: number;
  desktopSmall: number;
  desktopLarge: number;
}

export const COTO_BREAKPOINTS: CotoBreakpoints = {
  mobile: 320,
  tabletPortrait: 768,
  tabletLandscape: 1024,
  desktopSmall: 1366,
  desktopLarge: 1920,
};
