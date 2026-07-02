import { Component, DestroyRef, computed, contentChildren, effect, inject, input, signal } from '@angular/core';
import { CotoUiCarouselSlideComponent } from './coto-ui-carousel-slide.component';

/**
 * Generic, themeable carousel for promotional banners, product galleries,
 * etc. Slides are fully content-projected via `<coto-ui-carousel-slide>` —
 * this component only owns the mechanics (active slide, dots, arrows,
 * autoplay, keyboard/ARIA), not the slide content itself. Colors,
 * elevation, and corner radius come straight from coto-ui-kit's theme
 * tokens (--mat-sys-*), so it automatically matches Nexo's design without
 * any extra styling in the consuming app.
 *
 * Usage:
 * ```html
 * <coto-ui-carousel ariaLabel="Promotions" aspectRatio="21 / 9">
 *   <coto-ui-carousel-slide>...</coto-ui-carousel-slide>
 *   <coto-ui-carousel-slide>...</coto-ui-carousel-slide>
 *   <p cotoUiCarouselCaption>Optional caption/legal text, rendered
 *     between the slide viewport and the dots.</p>
 * </coto-ui-carousel>
 * ```
 */
@Component({
  selector: 'coto-ui-carousel',
  template: `
    <div class="coto-ui-carousel__viewport" [style.aspect-ratio]="aspectRatio()">
      <ng-content />
    </div>

    <ng-content select="[cotoUiCarouselCaption]" />

    @if (showArrows() && slideCount() > 1) {
      <button
        type="button"
        class="coto-ui-carousel__arrow coto-ui-carousel__arrow--prev"
        [attr.aria-label]="prevLabel()"
        (click)="prev()"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </button>
      <button
        type="button"
        class="coto-ui-carousel__arrow coto-ui-carousel__arrow--next"
        [attr.aria-label]="nextLabel()"
        (click)="next()"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="m8.59 16.59 1.41 1.41 6-6-6-6-1.41 1.41L13.17 12z" />
        </svg>
      </button>
    }

    @if (showDots() && slideCount() > 1) {
      <div
        class="coto-ui-carousel__dots"
        [class.coto-ui-carousel__dots--below]="dotsPosition() === 'below'"
        role="tablist"
        [attr.aria-label]="dotsLabel()"
      >
        @for (slide of slides(); track slide; let i = $index) {
          <button
            type="button"
            role="tab"
            class="coto-ui-carousel__dot"
            [class.coto-ui-carousel__dot--active]="i === activeIndex()"
            [attr.aria-selected]="i === activeIndex()"
            [attr.aria-label]="dotLabel(i)"
            (click)="goTo(i)"
          ></button>
        }
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
        border-radius: var(--mat-sys-corner-large, 16px);
        overflow: hidden;
        outline: none;
      }

      :host(:focus-visible) {
        outline: 2px solid var(--mat-sys-primary, #6750a4);
        outline-offset: 2px;
      }

      .coto-ui-carousel__viewport {
        position: relative;
        width: 100%;
        background: var(--mat-sys-surface-container, #e7eff6);
        /* Establish a stacking context so any z-index used by projected
           slide content (e.g. a full-bleed overlay) is confined to the
           viewport and can never paint above the arrows/dots below,
           which live outside it as siblings. Without this, a z-index
           set deep inside a slide "escapes" to the nearest ancestor
           stacking context — which, absent this rule, is the document
           root — and can end up ranking above controls it was never
           meant to compete with. */
        isolation: isolate;
      }

      .coto-ui-carousel__arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 40px;
        border-radius: var(--mat-sys-corner-full, 9999px);
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--mat-sys-surface, #fff);
        color: var(--mat-sys-on-surface, #1a1a1a);
        box-shadow: var(
          --mat-sys-level2,
          0 1px 8px rgba(0, 0, 0, 0.12),
          0 3px 4px rgba(0, 0, 0, 0.14),
          0 3px 3px -2px rgba(0, 0, 0, 0.02)
        );
        cursor: pointer;
        transition:
          background 200ms ease,
          opacity 200ms ease;
        padding: 0;
        /* Hidden until the carousel is hovered/focused (see rules below);
           pointer-events: none while hidden so it can't be clicked or
           accidentally intercept hover before it's visible. */
        opacity: 0;
        pointer-events: none;
      }

      :host(:hover) .coto-ui-carousel__arrow,
      :host(:focus-within) .coto-ui-carousel__arrow {
        opacity: 1;
        pointer-events: auto;
      }

      .coto-ui-carousel__arrow:hover {
        background: var(--mat-sys-surface-container-high, #e1e9f0);
      }

      .coto-ui-carousel__arrow svg {
        width: 22px;
        height: 22px;
        fill: currentColor;
      }

      .coto-ui-carousel__arrow--prev {
        left: 12px;
      }

      .coto-ui-carousel__arrow--next {
        right: 12px;
      }

      .coto-ui-carousel__dots {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 12px;
        display: flex;
        justify-content: center;
        gap: 8px;
      }

      .coto-ui-carousel__dots--below {
        position: static;
        padding: 12px 0;
        background: var(--mat-sys-surface, #fff);
      }

      .coto-ui-carousel__dot {
        width: 8px;
        height: 8px;
        border-radius: var(--mat-sys-corner-full, 9999px);
        border: none;
        padding: 0;
        background: var(--mat-sys-outline-variant, #c9c9c9);
        cursor: pointer;
        transition:
          background 200ms ease,
          width 200ms ease;
      }

      .coto-ui-carousel__dot--active {
        width: 22px;
        background: var(--mat-sys-primary, #6750a4);
      }
    `,
  ],
  host: {
    tabindex: '0',
    role: 'region',
    '[attr.aria-roledescription]': '"carousel"',
    '[attr.aria-label]': 'ariaLabel()',
    '(mouseenter)': 'pause()',
    '(mouseleave)': 'resume()',
    '(focusin)': 'pause()',
    '(focusout)': 'resume()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class CotoUiCarouselComponent {
  /** Accessible label for the whole carousel region. */
  readonly ariaLabel = input('Carousel');
  /** Autoplay interval in ms. Set to 0 to disable autoplay. */
  readonly autoplayMs = input(6000);
  /** Show/hide the prev/next arrow controls. */
  readonly showArrows = input(true);
  /** Show/hide the dot indicators. */
  readonly showDots = input(true);
  /** 'overlay' (default) draws dots over the bottom of the slide; 'below' renders them in normal flow, outside the image. */
  readonly dotsPosition = input<'overlay' | 'below'>('overlay');
  /** CSS aspect-ratio for the slide viewport, e.g. '21 / 9' or '1650 / 580'. */
  readonly aspectRatio = input('21 / 9');
  readonly prevLabel = input('Previous slide');
  readonly nextLabel = input('Next slide');
  readonly dotsLabel = input('Slide navigation');

  readonly slides = contentChildren(CotoUiCarouselSlideComponent);
  readonly slideCount = computed(() => this.slides().length);
  readonly activeIndex = signal(0);

  private readonly destroyRef = inject(DestroyRef);
  private timerId: ReturnType<typeof setInterval> | undefined;
  private isPaused = false;

  constructor() {
    // Keep every projected slide's `active` state in sync with activeIndex.
    effect(() => {
      const idx = this.activeIndex();
      this.slides().forEach((slide, i) => slide.active.set(i === idx));
    });

    // (Re)start autoplay whenever the interval or slide count changes.
    effect(() => {
      const ms = this.autoplayMs();
      const count = this.slideCount();
      this.stopAutoplay();
      if (ms > 0 && count > 1) {
        this.startAutoplay(ms);
      }
    });

    this.destroyRef.onDestroy(() => this.stopAutoplay());
  }

  next(): void {
    const count = this.slideCount();
    if (count === 0) return;
    this.activeIndex.set((this.activeIndex() + 1) % count);
  }

  prev(): void {
    const count = this.slideCount();
    if (count === 0) return;
    this.activeIndex.set((this.activeIndex() - 1 + count) % count);
  }

  goTo(index: number): void {
    const count = this.slideCount();
    if (count === 0) return;
    this.activeIndex.set(((index % count) + count) % count);
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  dotLabel(index: number): string {
    return `Go to slide ${index + 1} of ${this.slideCount()}`;
  }

  onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        this.next();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.prev();
        break;
      case 'Home':
        event.preventDefault();
        this.goTo(0);
        break;
      case 'End':
        event.preventDefault();
        this.goTo(this.slideCount() - 1);
        break;
    }
  }

  private startAutoplay(ms: number): void {
    this.timerId = setInterval(() => {
      if (!this.isPaused) {
        this.next();
      }
    }, ms);
  }

  private stopAutoplay(): void {
    if (this.timerId !== undefined) {
      clearInterval(this.timerId);
      this.timerId = undefined;
    }
  }
}
