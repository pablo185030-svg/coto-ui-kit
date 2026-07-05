import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { CotoUiCarouselComponent } from './coto-ui-carousel.component';
import { CotoUiCarouselSlideComponent } from './coto-ui-carousel-slide.component';

@Component({
  imports: [CotoUiCarouselComponent, CotoUiCarouselSlideComponent],
  template: `
    <coto-ui-carousel
      [autoplayMs]="autoplayMs()"
      [showArrows]="showArrows()"
      [showDots]="showDots()"
    >
      @for (label of slideLabels(); track label) {
        <coto-ui-carousel-slide>{{ label }}</coto-ui-carousel-slide>
      }
    </coto-ui-carousel>
  `,
})
class HostComponent {
  readonly autoplayMs = signal(0);
  readonly showArrows = signal(true);
  readonly showDots = signal(true);
  readonly slideLabels = signal(['Slide 1', 'Slide 2', 'Slide 3']);
}

describe('CotoUiCarouselComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let carouselDebugEl: ReturnType<ComponentFixture<HostComponent>['debugElement']['query']>;
  let carousel: CotoUiCarouselComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    carouselDebugEl = fixture.debugElement.query(By.directive(CotoUiCarouselComponent));
    carousel = carouselDebugEl.componentInstance;
  });

  it('starts on the first slide', () => {
    expect(carousel.activeIndex()).toBe(0);
    expect(carousel.slideCount()).toBe(3);
  });

  it('advances to the next slide and wraps around at the end', () => {
    carousel.next();
    expect(carousel.activeIndex()).toBe(1);
    carousel.next();
    expect(carousel.activeIndex()).toBe(2);
    carousel.next();
    expect(carousel.activeIndex()).toBe(0);
  });

  it('goes to the previous slide and wraps around at the start', () => {
    carousel.prev();
    expect(carousel.activeIndex()).toBe(2);
  });

  it('jumps to an arbitrary slide with goTo, wrapping out-of-range indexes', () => {
    carousel.goTo(1);
    expect(carousel.activeIndex()).toBe(1);
    carousel.goTo(5);
    expect(carousel.activeIndex()).toBe(2);
  });

  it('syncs the active state onto the projected slide components', async () => {
    carousel.goTo(1);
    await fixture.whenStable();

    const slides = carousel.slides();
    expect(slides[0].active()).toBe(false);
    expect(slides[1].active()).toBe(true);
    expect(slides[2].active()).toBe(false);
  });

  it('navigates with ArrowRight/ArrowLeft/Home/End keys', () => {
    carousel.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(carousel.activeIndex()).toBe(1);

    carousel.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(carousel.activeIndex()).toBe(0);

    carousel.onKeydown(new KeyboardEvent('keydown', { key: 'End' }));
    expect(carousel.activeIndex()).toBe(2);

    carousel.onKeydown(new KeyboardEvent('keydown', { key: 'Home' }));
    expect(carousel.activeIndex()).toBe(0);
  });

  it('renders one arrow pair and one dot per slide when there is more than one slide', () => {
    const arrows = carouselDebugEl.queryAll(By.css('.coto-ui-carousel__arrow'));
    const dots = carouselDebugEl.queryAll(By.css('.coto-ui-carousel__dot'));
    expect(arrows.length).toBe(2);
    expect(dots.length).toBe(3);
  });

  it('marks the dot matching the active index as selected', () => {
    carousel.goTo(1);
    fixture.detectChanges();

    const dots = carouselDebugEl.queryAll(By.css('.coto-ui-carousel__dot'));
    expect(dots[0].nativeElement.getAttribute('aria-selected')).toBe('false');
    expect(dots[1].nativeElement.getAttribute('aria-selected')).toBe('true');
  });

  it('navigates when a dot is clicked', () => {
    const dots = carouselDebugEl.queryAll(By.css('.coto-ui-carousel__dot'));
    dots[2].nativeElement.click();
    expect(carousel.activeIndex()).toBe(2);
  });

  it('navigates when the prev/next arrows are clicked', () => {
    carouselDebugEl.query(By.css('.coto-ui-carousel__arrow--next')).nativeElement.click();
    expect(carousel.activeIndex()).toBe(1);

    carouselDebugEl.query(By.css('.coto-ui-carousel__arrow--prev')).nativeElement.click();
    expect(carousel.activeIndex()).toBe(0);
  });

  it('hides the arrows when showArrows is false', () => {
    host.showArrows.set(false);
    fixture.detectChanges();
    expect(carouselDebugEl.queryAll(By.css('.coto-ui-carousel__arrow')).length).toBe(0);
  });

  it('hides the dots when showDots is false', () => {
    host.showDots.set(false);
    fixture.detectChanges();
    expect(carouselDebugEl.queryAll(By.css('.coto-ui-carousel__dot')).length).toBe(0);
  });

  it('hides arrows and dots when there is only one slide', () => {
    host.slideLabels.set(['Only slide']);
    fixture.detectChanges();
    expect(carouselDebugEl.queryAll(By.css('.coto-ui-carousel__arrow')).length).toBe(0);
    expect(carouselDebugEl.queryAll(By.css('.coto-ui-carousel__dot')).length).toBe(0);
  });

  it('exposes the carousel region ARIA attributes', () => {
    const el = carouselDebugEl.nativeElement as HTMLElement;
    expect(el.getAttribute('role')).toBe('region');
    expect(el.getAttribute('aria-roledescription')).toBe('carousel');
    expect(el.getAttribute('aria-label')).toBe('Carousel');
  });

  it('auto-advances on the configured interval and stops when autoplayMs is 0', async () => {
    vi.useFakeTimers();
    try {
      host.autoplayMs.set(1000);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(carousel.activeIndex()).toBe(0);
      await vi.advanceTimersByTimeAsync(1000);
      expect(carousel.activeIndex()).toBe(1);
      await vi.advanceTimersByTimeAsync(1000);
      expect(carousel.activeIndex()).toBe(2);

      host.autoplayMs.set(0);
      fixture.detectChanges();
      await fixture.whenStable();
      await vi.advanceTimersByTimeAsync(5000);
      expect(carousel.activeIndex()).toBe(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('pauses autoplay while hovered and resumes on mouse leave', async () => {
    vi.useFakeTimers();
    try {
      host.autoplayMs.set(1000);
      fixture.detectChanges();
      await fixture.whenStable();

      const el = carouselDebugEl.nativeElement as HTMLElement;
      el.dispatchEvent(new MouseEvent('mouseenter'));
      await vi.advanceTimersByTimeAsync(3000);
      expect(carousel.activeIndex()).toBe(0);

      el.dispatchEvent(new MouseEvent('mouseleave'));
      await vi.advanceTimersByTimeAsync(1000);
      expect(carousel.activeIndex()).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
