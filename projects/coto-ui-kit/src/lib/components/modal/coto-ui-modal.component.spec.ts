import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CotoUiModalComponent, CotoUiModalPosition } from './coto-ui-modal.component';

@Component({
  imports: [CotoUiModalComponent],
  template: `
    <coto-ui-modal
      [open]="open()"
      [position]="position()"
      [closeOnBackdropClick]="closeOnBackdropClick()"
      [scrollable]="scrollable()"
      (closed)="closedCount = closedCount + 1"
    >
      <p>Modal content</p>
    </coto-ui-modal>
  `,
})
class HostComponent {
  readonly open = signal(false);
  readonly position = signal<CotoUiModalPosition>('center');
  readonly closeOnBackdropClick = signal(true);
  readonly scrollable = signal(false);
  closedCount = 0;
}

describe('CotoUiModalComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  function backdrop(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.coto-ui-modal__backdrop');
  }

  function panel(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.coto-ui-modal__panel');
  }

  beforeEach(() => {
    document.body.style.overflow = '';
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders nothing while closed', () => {
    expect(backdrop()).toBeNull();
  });

  it('renders the dialog and projects content once opened', () => {
    host.open.set(true);
    fixture.detectChanges();

    const panelEl = panel();
    expect(panelEl).not.toBeNull();
    expect(panelEl?.getAttribute('role')).toBe('dialog');
    expect(panelEl?.getAttribute('aria-modal')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('Modal content');
  });

  it('applies a backdrop class matching the position input', () => {
    host.open.set(true);
    host.position.set('bottom');
    fixture.detectChanges();

    expect(backdrop()?.classList.contains('coto-ui-modal__backdrop--bottom')).toBe(true);
  });

  it('emits closed when the close button is clicked', () => {
    host.open.set(true);
    fixture.detectChanges();

    fixture.debugElement.query(By.css('.coto-ui-modal__close')).nativeElement.click();

    expect(host.closedCount).toBe(1);
  });

  it('emits closed when the backdrop is clicked and closeOnBackdropClick is true', () => {
    host.open.set(true);
    fixture.detectChanges();

    backdrop()?.click();

    expect(host.closedCount).toBe(1);
  });

  it('does not emit closed on backdrop click when closeOnBackdropClick is false', () => {
    host.open.set(true);
    host.closeOnBackdropClick.set(false);
    fixture.detectChanges();

    backdrop()?.click();

    expect(host.closedCount).toBe(0);
  });

  it('does not emit closed when clicking inside the panel', () => {
    host.open.set(true);
    fixture.detectChanges();

    panel()?.click();

    expect(host.closedCount).toBe(0);
  });

  it('locks body scroll while a non-scrollable modal is open, and unlocks it on close', () => {
    host.open.set(true);
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('hidden');

    host.open.set(false);
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('');
  });

  it('does not lock body scroll when scrollable is true', () => {
    host.scrollable.set(true);
    host.open.set(true);
    fixture.detectChanges();

    expect(document.body.style.overflow).toBe('');
  });

  it('stacks z-index above any already-open modal', () => {
    const other = TestBed.createComponent(HostComponent);
    other.componentInstance.open.set(true);
    other.detectChanges();

    host.open.set(true);
    fixture.detectChanges();

    const firstZ = Number((other.nativeElement.querySelector('.coto-ui-modal__backdrop') as HTMLElement).style.zIndex);
    const secondZ = Number((backdrop() as HTMLElement).style.zIndex);
    expect(secondZ).toBeGreaterThan(firstZ);
  });
});
