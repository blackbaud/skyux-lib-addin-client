import { inject, Injectable, Provider } from '@angular/core';
import { SkyHelpOpenArgs, SkyHelpService } from '@skyux/core';
import { AddinClientService } from '../addin-client.service';

@Injectable({ providedIn: 'root' })
export class AddinClientHelpService extends SkyHelpService {
  private skyAddinClientService = inject(AddinClientService);

  /** @inheritdoc */
  public override openHelp(args?: SkyHelpOpenArgs): void {
    if (!args) {
      return;
    }

    this.skyAddinClientService.openHelp(args);
  }

  /** @inheritdoc */
  public override updateHelp(): void {
    throw new Error('Not implemented');
  }
}

/** Provide addin client help service */
export function provideAddinClientHelp(): Provider[] {
  return [{ provide: SkyHelpService, useClass: AddinClientHelpService }];
}
