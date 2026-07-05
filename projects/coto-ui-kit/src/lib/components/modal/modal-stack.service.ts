import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const BASE_Z_INDEX = 1000;

/**
 * Coordinates z-index stacking and body scroll locking across every open
 * `CotoUiModalComponent` instance, so multiple modals can be opened on top of
 * each other (e.g. a confirmation modal opened from within another modal)
 * without fighting over the same z-index or unlocking the page scroll too
 * early.
 */
@Injectable({ providedIn: 'root' })
export class ModalStackService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly stack = signal<readonly symbol[]>([]);
  private scrollLockCount = 0;

  /**
   * Registers a newly opened modal and returns the z-index it should use,
   * higher than any other currently open modal.
   */
  register(id: symbol): number {
    this.stack.update((ids) => [...ids, id]);
    return BASE_Z_INDEX + this.stack().indexOf(id) * 2;
  }

  /**
   * Removes a modal from the stack once it closes.
   */
  unregister(id: symbol): void {
    this.stack.update((ids) => ids.filter((stackedId) => stackedId !== id));
  }

  /**
   * Prevents the underlying page from scrolling while at least one
   * non-scrollable modal is open.
   */
  lockBodyScroll(): void {
    this.scrollLockCount += 1;
    if (this.isBrowser && this.scrollLockCount === 1) {
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Restores page scrolling once the last modal requiring a lock closes.
   */
  unlockBodyScroll(): void {
    this.scrollLockCount = Math.max(0, this.scrollLockCount - 1);
    if (this.isBrowser && this.scrollLockCount === 0) {
      document.body.style.overflow = '';
    }
  }
}
