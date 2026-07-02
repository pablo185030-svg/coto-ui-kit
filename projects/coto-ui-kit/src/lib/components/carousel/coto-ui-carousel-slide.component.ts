import { Component, signal } from '@angular/core';

/**
 * A single slide of `<coto-ui-carousel>`. Fully content-projected — put
 * whatever markup you want inside (image, text overlays, CTAs, price
 * tags, etc). The parent carousel controls visibility via the `active`
 * signal; it is not meant to be set from templates.
 */
@Component({
  selector: 'coto-ui-carousel-slide',
  template: `<ng-content />`,
  host: {
    class: 'coto-ui-carousel-slide',
    '[class.coto-ui-carousel-slide--active]': 'active()',
    '[attr.aria-hidden]': '!active()',
    role: 'group',
    '[attr.aria-roledescription]': '"slide"',
  },
  styles: [
    `
      :host {
        position: absolute;
        inset: 0;
        display: block;
        opacity: 0;
        pointer-events: none;
        transition: opacity 450ms ease;
      }

      :host(.coto-ui-carousel-slide--active) {
        opacity: 1;
        pointer-events: auto;
      }
    `,
  ],
})
export class CotoUiCarouselSlideComponent {
  /** Set by CotoUiCarouselComponent. Not intended to be set directly. */
  readonly active = signal(false);
}
