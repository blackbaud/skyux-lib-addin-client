import { provideZoneChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterOutlet, provideRouter } from '@angular/router';

import { SkyAppStyleLoader } from '@skyux/theme';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let resolveStyles: () => void;

  beforeEach(() => {
    // The real loader waits for web fonts, so it is replaced with a promise
    // each test settles itself.
    const stylesLoaded = new Promise<void>((resolve) => {
      resolveStyles = resolve;
    });

    TestBed.configureTestingModule({
      imports: [AppComponent],
      // Matches the application's providers in main.ts.
      providers: [
        provideZoneChangeDetection(),
        provideRouter([]),
        {
          provide: SkyAppStyleLoader,
          useValue: { loadStyles: (): Promise<void> => stylesLoaded },
        },
      ],
    });
  });

  function createComponent(): ReturnType<
    typeof TestBed.createComponent<AppComponent>
  > {
    const fixture = TestBed.createComponent(AppComponent);

    // Detect changes the way the running application does, so the component's
    // change detection strategy is respected.
    fixture.autoDetectChanges();

    return fixture;
  }

  function hasRouterOutlet(
    fixture: ReturnType<typeof TestBed.createComponent<AppComponent>>,
  ): boolean {
    return fixture.debugElement.query(By.directive(RouterOutlet)) !== null;
  }

  it('should not render routes before the SKY UX styles load', async () => {
    const fixture = createComponent();

    await fixture.whenStable();

    expect(hasRouterOutlet(fixture)).toBeFalse();
  });

  it('should render routes once the SKY UX styles load', async () => {
    const fixture = createComponent();

    resolveStyles();
    await fixture.whenStable();

    expect(hasRouterOutlet(fixture)).toBeTrue();
  });
});
