/* eslint-disable @angular-eslint/prefer-inject */
import {
  Component,
  Renderer2,
  ChangeDetectionStrategy
} from '@angular/core';

import {
  SkyAppStyleLoader,
  SkyTheme,
  SkyThemeMode,
  SkyThemeService,
  SkyThemeSettings
} from '@skyux/theme';

@Component({
    selector: 'app-root',
    // isLoaded is set in a promise callback, which OnPush wouldn't render.
    // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './app.component.html',
    
})
export class AppComponent {
  public isLoaded = false;

  constructor(
    renderer: Renderer2,
    themeService: SkyThemeService,
    styleLoader: SkyAppStyleLoader
  ) {
    themeService.init(
      document.body,
      renderer,
      new SkyThemeSettings(
        SkyTheme.presets['default'],
        SkyThemeMode.presets.light
      )
    );

    styleLoader.loadStyles().then(() => {
      this.isLoaded = true;
    });
  }
}
