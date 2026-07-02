# coto-ui-kit

Angular library (ng-packagr) that centralizes Coto Digital's design
system (based on the Material Design 3 guidelines documented in Nexo)
for every Angular project (currently Angular 21.1): color palette,
typography, and theming in one place.

## ⚠️ Token status

- **Typography**: ✅ complete. Families: Poppins (titles/headlines/
  titles and, as an exception, labels) + Open Sans (body). Full M3 type
  scale (Display, Headline, Title, Body, Label — each with
  large/medium/small) in `styles/_typography.scss`, with exact size,
  line-height, tracking, and weight per Nexo.
- **Colors — light and dark mode**: ✅ both complete. Full M3 scheme
  (primary, secondary, tertiary, error, surface/neutral, outline,
  containers, fixed variants) in `styles/_color-scheme.scss`
  (`$coto-color-scheme-light` and `$coto-color-scheme-dark`),
  pixel-perfect per Nexo's export.
- **Elevations**: ✅ complete (levels 1-5) in `styles/_elevation.scss`,
  mapped to `--mat-sys-level1`...`--mat-sys-level5`.
- **Corner / shape** (`styles/_shape.scss`): loaded (none=0, xs=4, s=8,
  m=12, l=16, xl=28, full=9999, in px). ⚠️ This section is marked "In
  progress" in zeroheight (unlike the rest, which are "Ready") — it may
  change, worth reviewing before a stable release.

## Structure

```
coto-ui-kit/
├── angular.json
├── package.json                  # workspace root (devDependencies, scripts)
├── tsconfig.json
└── projects/coto-ui-kit/         # the publishable library (npm package: "coto-ui-kit")
    ├── package.json              # package name: coto-ui-kit
    ├── ng-package.json           # ng-packagr config
    ├── src/
    │   ├── public-api.ts         # TS exports (tokens, CotoThemeService)
    │   └── lib/
    │       ├── tokens/           # typed tokens (color-tokens.ts, typography-tokens.ts)
    │       └── services/
    │           └── theme.service.ts   # light/dark toggle, reads color roles
    └── styles/                   # tokens and theme in SCSS (single visual source of truth)
        ├── _tokens.scss          # <- seed colors + typography families
        ├── _typography.scss      # <- type scale (size/line-height/tracking per level)
        ├── _color-scheme.scss    # <- full M3 color scheme, role by role (light; dark pending)
        ├── _elevation.scss       # <- exact box-shadow per elevation level (level1-5)
        ├── _shape.scss           # <- corner scale / border-radius (none...full)
        ├── _theme.scss           # coto.theme() mixin on top of Angular Material M3
        └── _index.scss           # public styles entry point
```

## How "one place, n projects" works

- **Typography**: families and scale live in `_tokens.scss` +
  `_typography.scss`. The `coto.theme()` mixin in `_theme.scss` applies
  the base with `mat.theme()` and then overrides every level
  (Display/Headline/Title/Body/Label) as a CSS custom property
  (`--mat-sys-*`).
- **Color**: the seed colors in `_tokens.scss` feed `mat.theme()` to
  generate a full tonal base (including an approximate dark mode). On
  top of that, `_color-scheme.scss` overrides every role of the
  **light** scheme with Nexo's exact value, so containers/on-colors/
  surface don't depend on Material's generator algorithm but on what
  the design actually defined.
- Each consuming project **never defines its own colors**: it just
  imports the library's mixin. If the palette changes tomorrow,
  `_tokens.scss` gets edited once, the package version bumps
  (`npm version minor`), it's published, and every project updates with
  `npm update coto-ui-kit` — no app code changes needed.
- Angular Material components (and your own, if you use
  `var(--mat-sys-primary)` in their CSS) inherit the color automatically
  because they read the same system variables.

## Local build (run this on your machine — this sandbox has no npm access)

```bash
cd coto-ui-kit
yarn install
yarn build
# generates dist/coto-ui-kit, ready to publish/consume
```

## Publishing to a private registry

Configure `.npmrc` (workspace root or project-level) to point to your
registry (Verdaccio, GitHub Packages, Azure Artifacts, private npm,
etc.). If you decide to publish under an organization scope (e.g.
`@coto`), update the `name` field in
`projects/coto-ui-kit/package.json` to `@coto/coto-ui-kit` before
publishing; as it stands it publishes unscoped, as `coto-ui-kit`.

```
coto-ui-kit:registry=https://your-private-registry.com/
```

Then:

```bash
npm run publish:lib
```

This builds and runs `npm publish` from `dist/coto-ui-kit` (that's
where the real `package.json` that gets published lives, generated from
`projects/coto-ui-kit/package.json`).

### Alternative while there's no registry yet: `npm link` / `file:` dependency

```bash
# in coto-ui-kit/dist/coto-ui-kit
npm link

# in each consuming Angular project
npm link coto-ui-kit
```

or in the consuming project's `package.json`:

```json
"dependencies": {
  "coto-ui-kit": "file:../coto-ui-kit/dist/coto-ui-kit"
}
```

## Consuming the library in an Angular project

1. Install (once published or linked):
   ```bash
   npm install coto-ui-kit @angular/material
   ```
0. **Load the typefaces.** Poppins and Open Sans aren't system fonts:
   each consuming app must load them (the library doesn't embed them).
   Recommended: a `<link>` in `index.html`'s `<head>` (better for
   performance than a CSS `@import`, which blocks rendering):
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link
     href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Open+Sans:wght@400;500;600&display=swap"
     rel="stylesheet">
   ```
   Adjust the weights (`wght@...`) to whatever you actually use.
2. In `styles.scss` (or the app's global stylesheet):
   ```scss
   @use '@angular/material' as mat;
   @use 'coto-ui-kit/styles' as coto;

   html {
     @include mat.core();
     @include coto.theme(); // Coto UI Kit's palette and typography, light by default
   }

   @include coto.dark-theme(); // adds dark mode support under .coto-dark-theme
   ```
3. In TS, to toggle the mode or read a color at runtime:
   ```ts
   import { CotoThemeService } from 'coto-ui-kit';

   constructor(private theme: CotoThemeService) {}

   toggleDarkMode() {
     this.theme.toggle();
   }
   ```

From here on, every Angular Material component (buttons, inputs, cards,
etc.) in that project automatically uses Coto UI Kit's palette, with no
need for each app to define its own theme.

## Components

### `<coto-ui-carousel>`

Generic, themeable carousel (promotional banners, product galleries,
etc). Slides are content-projected via `<coto-ui-carousel-slide>` — the
carousel only owns the mechanics (active slide, dots, arrows, autoplay,
keyboard navigation, ARIA); slide content is entirely up to you. Colors,
elevation, and corner radius come straight from the theme tokens
(`--mat-sys-*`), so it matches Nexo automatically.

```ts
import { CotoUiCarouselComponent, CotoUiCarouselSlideComponent } from 'coto-ui-kit';

@Component({
  selector: 'app-promo',
  imports: [CotoUiCarouselComponent, CotoUiCarouselSlideComponent],
  template: `
    <coto-ui-carousel ariaLabel="Promotions" aspectRatio="21 / 9">
      <coto-ui-carousel-slide>
        <!-- any markup: image, overlays, CTA buttons, price tags, etc. -->
      </coto-ui-carousel-slide>
      <coto-ui-carousel-slide>
        ...
      </coto-ui-carousel-slide>
    </coto-ui-carousel>
  `,
})
export class PromoComponent {}
```

Inputs:

| Input          | Type      | Default              | Description                                    |
| -------------- | --------- | --------------------- | ----------------------------------------------- |
| `ariaLabel`    | `string`  | `'Carousel'`           | Accessible label for the carousel region.       |
| `autoplayMs`   | `number`  | `6000`                | Autoplay interval; `0` disables autoplay.       |
| `showArrows`   | `boolean` | `true`                 | Show/hide the prev/next controls.               |
| `showDots`     | `boolean` | `true`                 | Show/hide the dot indicators.                   |
| `dotsPosition` | `'overlay' \| 'below'` | `'overlay'` | `'overlay'` draws dots over the bottom of the image; `'below'` renders them outside it, in normal flow. |
| `aspectRatio`  | `string`  | `'21 / 9'`             | CSS `aspect-ratio` of the slide viewport.       |
| `prevLabel` / `nextLabel` / `dotsLabel` | `string` | (English defaults) | Override for i18n. |

Behavior: autoplay pauses on hover/focus; `ArrowLeft`/`ArrowRight`
navigate when the carousel is focused, `Home`/`End` jump to the
first/last slide; dots use `role="tablist"`/`role="tab"` with
`aria-selected`.

## Suggested next steps

- Add more components as needed (cards, price tags, badges) under
  `src/lib/components/`, following the same pattern as the carousel
  (standalone, theme-token-driven styles), and export them from
  `public-api.ts`.
- Add a CI pipeline that runs `npm run build` on every release and
  automatically publishes to the private registry.
- Consider adding Storybook to this same repo to visually document the
  tokens and components.
