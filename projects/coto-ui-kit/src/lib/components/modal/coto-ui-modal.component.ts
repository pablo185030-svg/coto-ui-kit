import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { ModalStackService } from './modal-stack.service';

export type CotoUiModalPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

/**
 * Stackable modal shell with a liquid-glass panel. Visibility is controlled
 * by the parent via the `open` input (e.g. `[open]="isOpen()"`); the parent
 * is notified through `closed` (backdrop click or the close button) so it
 * can flip that state back to `false`.
 */
@Component({
  selector: 'coto-ui-modal',
  template: `
    @if (open()) {
      <div
        class="coto-ui-modal__backdrop coto-ui-modal__backdrop--{{ position() }}"
        [style.z-index]="zIndex"
        (click)="onBackdropClick()"
      >
        <div
          class="coto-ui-modal__panel"
          [class.coto-ui-modal__panel--scrollable]="scrollable()"
          role="dialog"
          aria-modal="true"
          (click)="$event.stopPropagation()"
        >
          <button
            type="button"
            class="coto-ui-modal__close"
            aria-label="Close"
            (click)="close()"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            </svg>
          </button>
          <ng-content />
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      /* Full-viewport scrim; flex alignment places the panel per position()
         without a different layout branch per position. Blurs/saturates the
         page content behind it instead of just dimming it with a flat tint. */
      .coto-ui-modal__backdrop {
        position: fixed;
        inset: 0;
        display: flex;
        background: rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(8px) saturate(180%);
        -webkit-backdrop-filter: blur(8px) saturate(180%);
        padding: 1rem;
      }

      /* Slightly above true vertical center — flex-start plus a top offset
         reads better than align-items: center, which visually sits too low
         once the panel's height is accounted for. */
      .coto-ui-modal__backdrop--center {
        align-items: flex-start;
        justify-content: center;
        padding-top: 10vh;
      }

      .coto-ui-modal__backdrop--top {
        align-items: flex-start;
        justify-content: center;
      }

      .coto-ui-modal__backdrop--bottom {
        align-items: flex-end;
        justify-content: center;
      }

      .coto-ui-modal__backdrop--left {
        align-items: center;
        justify-content: flex-start;
      }

      .coto-ui-modal__backdrop--right {
        align-items: center;
        justify-content: flex-end;
      }

      /* Liquid-glass (glassmorphism) panel: blurred/saturated translucent
         white backdrop with a hairline top highlight. Always white regardless
         of theme since it sits on top of a dark scrim, so the text color is
         fixed too rather than following the theme token. */
      .coto-ui-modal__panel {
        position: relative;
        width: 100%;
        max-width: 32rem;
        max-height: calc(100vh - 2rem);
        border-radius: var(--mat-sys-corner-large, 16px);
        border-top: 1px solid rgba(255, 255, 255, 0.6);
        background: var(--mat-sys-surface-container-bright, #eef4f9);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.5),
          0 8px 32px rgba(0, 0, 0, 0.25);
        color: #1a1a1a;
        padding: 1.5rem;
        overflow: hidden;
      }

      .coto-ui-modal__panel--scrollable {
        overflow-y: auto;
      }

      /* tablet-portrait (min-width: 768px) — see COTO_BREAKPOINTS */
      @media (min-width: 768px) {
        .coto-ui-modal__panel {
          padding: 2rem;
        }
      }

      .coto-ui-modal__close {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: inherit;
        cursor: pointer;
      }

      .coto-ui-modal__close:hover {
        background: rgba(26, 26, 26, 0.1);
      }

      .coto-ui-modal__close svg {
        width: 20px;
        height: 20px;
        fill: currentColor;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CotoUiModalComponent {
  /** Whether the modal is visible. Controlled by the parent, e.g. `[open]="isOpen()"`. */
  readonly open = input(false);
  /** Where the panel is anchored within the viewport. */
  readonly position = input<CotoUiModalPosition>('center');
  /** Whether clicking the backdrop closes the modal. */
  readonly closeOnBackdropClick = input(true);
  /** Whether the panel content scrolls internally instead of locking page scroll. */
  readonly scrollable = input(false);

  /** Emitted when the modal should close (backdrop click or close button). */
  readonly closed = output<void>();

  private readonly modalStackService = inject(ModalStackService);
  private readonly id = Symbol('coto-ui-modal');
  private isRegistered = false;

  protected zIndex = 0;

  constructor() {
    effect(() => {
      if (this.open()) {
        this.registerOpenState();
      } else {
        this.registerClosedState();
      }
    });

    inject(DestroyRef).onDestroy(() => this.registerClosedState());
  }

  /**
   * Closes the modal when the backdrop is clicked, unless disabled.
   */
  protected onBackdropClick(): void {
    if (this.closeOnBackdropClick()) {
      this.close();
    }
  }

  /**
   * Closes the modal via its close button, regardless of backdrop config.
   */
  protected close(): void {
    this.closed.emit();
  }

  private registerOpenState(): void {
    if (this.isRegistered) {
      return;
    }
    this.isRegistered = true;
    this.zIndex = this.modalStackService.register(this.id);
    if (!this.scrollable()) {
      this.modalStackService.lockBodyScroll();
    }
  }

  private registerClosedState(): void {
    if (!this.isRegistered) {
      return;
    }
    this.isRegistered = false;
    this.modalStackService.unregister(this.id);
    if (!this.scrollable()) {
      this.modalStackService.unlockBodyScroll();
    }
  }
}
