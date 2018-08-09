# SKY UX Add-in Client Library

The SKY UX Add-in Client Library wraps the lower-level [SKY Add-in Client Library](https://github.com/blackbaud/sky-addin-client) and provides an Angular service that can be more easily consumed by SKY UX SPAs. It also contains a plugin that injects the Environment ID context that gets passed down from the add-in host to the client into your SKY UX spa automatically, obviating the need to manually handle passing the Environment Id around.

## Installation

```
npm install --save @blackbaud/skyux-lib-addin-client
```

## Use

To use the service, import it into your SPA's `app-extras.module.ts` file and add it to the `providers` array:

```
import { NgModule } from '@angular/core';
import { AddinClientService } from '@blackbaud/skyux-lib-addin-client';

@NgModule({
  providers: [AddinClientService]
})
export class AppExtrasModule { }
```

Then, inject it into your component.

```
import { Component, OnInit } from '@angular/core';
import { AddinClientService } from '@blackbaud/skyux-lib-addin-client';
import { AddinClientInitArgs } @blackbaud/sky-addin-client/src/addin/client-interfaces';

@Component({
  selector: 'tile-one',
  templateUrl: './tile-one.component.html',
  styleUrls: ['./tile-one.component.scss']
})
export class TileOneComponent implements OnInit {
  public constituentId: string;
  constructor(private addinClientService: AddinClientService) {}

  public ngOnInit() {
    this.addinClientService.args.subscribe((args: AddinClientInitArgs) => {
      this.constituentId = args.context.recordId;
    });
  }
}
```

To use the plugin, you must add it to the `plugins` array in your `skyuxconfig.json` file. The plugin is included as a dependency of the library, so no need to install.

```
{
  "mode": "easy",
  "compileMode": "aot",
  "a11y": true,
  "plugins": [
    '@blackbaud/skyux-builder-plugin-addin-client'
  ],
  "params": {
    "envid": {
      "required": true
    }
  }
}
```
