import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SkyAppStyleLoader } from '@skyux/theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  protected readonly isLoaded = signal(false);

  constructor() {
    void inject(SkyAppStyleLoader)
      .loadStyles()
      .then(() => {
        this.isLoaded.set(true);
      });
  }
}
