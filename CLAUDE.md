# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`coto-ui-kit` is an Angular library (built with `ng-packagr`) that centralizes Coto Digital's design system — based on Material Design 3 guidelines documented in Nexo/zeroheight — for reuse across every Angular project: color palette, typography, elevation, shape, and theming in one place, plus a small set of themeable components. It's an Angular CLI workspace whose only project is the publishable library at `projects/coto-ui-kit`.

## Commands

```bash
yarn install                 # install deps (yarn 1.22, Node pinned via .nvmrc: 24.16.0)
yarn build                   # ng build coto-ui-kit -> dist/coto-ui-kit
yarn build:watch             # incremental build on file changes
yarn test                    # ng test coto-ui-kit -> Vitest via @angular/build:unit-test
yarn pack                    # build + npm pack from dist/coto-ui-kit (local tarball)
yarn publish:lib             # build + npm publish from dist/coto-ui-kit
```

There is no linter or formatter configured in this repo — don't assume `yarn lint` exists.

### Testing

- Runner: Vitest, wired through Angular's native `@angular/build:unit-test` builder (`projects/coto-ui-kit`'s `test` target in `angular.json`, config in `projects/coto-ui-kit/tsconfig.spec.json`). Spec files live next to the source they test as `*.spec.ts` and are picked up automatically — no per-file registration needed.
- `describe`/`it`/`expect`/`beforeEach`/`vi`/etc. are global (`types: ["vitest/globals"]` in `tsconfig.spec.json`), so spec files don't need `import { ... } from 'vitest'` for the core API; still import `vi` explicitly when using fake timers or spies.
- Run the whole suite with `yarn test` (add `-- --watch` for watch mode, or e.g. `npx ng test coto-ui-kit --filter="carousel"` to scope to matching test names while iterating on a single spec).
- Every exported component in `src/lib/components/` must have a matching `*.spec.ts` covering its public inputs/outputs, DOM output (classes, ARIA attributes, projected content), and user-driven interactions (clicks, keyboard, hover) — see `coto-ui-carousel.component.spec.ts` and `coto-ui-modal.component.spec.ts` for the expected shape (host wrapper component with signal-based inputs, `TestBed.createComponent`, `By.css`/`By.directive` queries).
- When you add a new component, add its spec in the same PR. When you change a component's behavior (new input, changed DOM structure, new interaction), update its existing spec(s) to match — don't leave assertions describing the old behavior. Run `yarn test` before considering the change done.
- Effect-driven state (e.g. signals synced via `effect()` in a constructor) may not be reflected synchronously after `fixture.detectChanges()`; use `await fixture.whenStable()` when asserting on it.

## Architecture

- **Workspace root** (`angular.json`, root `package.json`, `tsconfig.json`) only holds devDependencies and build scripts; there's nothing to run at the root besides the `yarn` scripts above.
- **`projects/coto-ui-kit/`** is the actual publishable package (npm name `coto-ui-kit`, currently unscoped/`restricted` access).
  - `src/public-api.ts` is the single entry point — anything meant to be consumable by apps (tokens, services, components) must be re-exported here, or it won't ship in `dist/coto-ui-kit`.
  - `src/lib/tokens/` — typed TS mirrors of the design tokens (`color-tokens.ts`, `typography-tokens.ts`, `breakpoint-tokens.ts`). `color-tokens.ts` also maps each M3 color role to its `--mat-sys-*` CSS custom property name and exposes `readCotoColor()` to read resolved values at runtime.
  - `src/lib/services/theme.service.ts` — `CotoThemeService` (root-provided), toggles light/dark by adding/removing the `coto-dark-theme` class on `<html>`, persists the choice in `localStorage`, and exposes `getColor()` for consumers that can't use `var(--mat-sys-*)` directly (e.g. canvas/charts).
  - `src/lib/components/` — standalone, theme-token-driven components (e.g. `coto-ui-carousel`). They never hardcode colors/elevation/radii; they read `--mat-sys-*` custom properties so they automatically match whatever theme is active.
  - `styles/` is the **single visual source of truth**, separate from and authoritative over the TS tokens — TS files must be kept in sync with these manually:
    - `_tokens.scss` — seed colors + typography font families (feeds `mat.theme()`).
    - `_typography.scss` — full M3 type scale (Display/Headline/Title/Body/Label × large/medium/small), applied as explicit overrides since `mat.theme()` alone doesn't produce Nexo's exact sizes.
    - `_color-scheme.scss` — full M3 color scheme role-by-role for light and dark (`$coto-color-scheme-light`/`-dark`), applied on top of Material's generated tonal palette so colors are pixel-perfect per Nexo instead of algorithm-derived.
    - `_elevation.scss`, `_shape.scss` — exact box-shadow per elevation level and corner/border-radius scale. Shape is marked "in progress" upstream in zeroheight — expect it to change before a stable release.
    - `_theme.scss` — exposes the public `coto.theme($theme-type, $density)` and `coto.dark-theme($density)` mixins, layering `mat.theme()` + the above overrides. This is the only mixin consuming apps call.
    - `_index.scss` — the package's style entry point (referenced by `ng-package.json`'s `assets`, so raw `.scss` files ship in the published package for consumers to `@use`).

## The "one place, n projects" model

Consuming Angular projects never define their own Material theme: they `@use 'coto-ui-kit/styles' as coto;` and call `coto.theme()` once in their global stylesheet. All Angular Material components — and any custom CSS using `var(--mat-sys-*)` — inherit the palette/typography automatically. Changing the design system means editing `_tokens.scss`/`_color-scheme.scss` once here, bumping the package version, and each consumer picking it up with a normal dependency update — no app-side code changes. Keep this invariant in mind: token/scheme changes belong in `styles/`, not in individual components, and any new component should read `--mat-sys-*` rather than introducing its own colors.

## Conventions

- Folders and files must be named in kebab-case (e.g. `coto-ui-carousel/`, `theme.service.ts`).
- New components go under `src/lib/components/`, follow the carousel's pattern (standalone, `ChangeDetectionStrategy`, signal-based inputs/state, styles driven entirely by `--mat-sys-*` tokens), and must be re-exported from `public-api.ts` to be part of the published package.
- New components must ship with a `*.spec.ts` (see Testing above); `tsconfig.lib.json` already excludes `**/*.spec.ts` so specs never leak into the published `dist/coto-ui-kit` output.
