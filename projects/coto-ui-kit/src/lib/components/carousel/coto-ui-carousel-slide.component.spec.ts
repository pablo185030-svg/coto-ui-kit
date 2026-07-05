import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CotoUiCarouselSlideComponent } from './coto-ui-carousel-slide.component';

@Component({
  imports: [CotoUiCarouselSlideComponent],
  template: `<coto-ui-carousel-slide>Projected content</coto-ui-carousel-slide>`,
})
class HostWithProjectedContent {}

describe('CotoUiCarouselSlideComponent', () => {
  let fixture: ComponentFixture<CotoUiCarouselSlideComponent>;
  let component: CotoUiCarouselSlideComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CotoUiCarouselSlideComponent] });
    fixture = TestBed.createComponent(CotoUiCarouselSlideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('starts inactive', () => {
    expect(component.active()).toBe(false);
    expect(fixture.nativeElement.classList.contains('coto-ui-carousel-slide--active')).toBe(false);
    expect(fixture.nativeElement.getAttribute('aria-hidden')).toBe('true');
  });

  it('reflects the active signal onto the host class and aria-hidden', () => {
    component.active.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.classList.contains('coto-ui-carousel-slide--active')).toBe(true);
    expect(fixture.nativeElement.getAttribute('aria-hidden')).toBe('false');
  });

  it('exposes group/slide ARIA roles', () => {
    expect(fixture.nativeElement.getAttribute('role')).toBe('group');
    expect(fixture.nativeElement.getAttribute('aria-roledescription')).toBe('slide');
  });

  it('projects content', () => {
    const withContent = TestBed.createComponent(HostWithProjectedContent);
    withContent.detectChanges();
    expect(withContent.nativeElement.textContent).toContain('Projected content');
  });
});
