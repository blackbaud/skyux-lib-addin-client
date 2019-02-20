[![npm](https://img.shields.io/npm/v/@blackbaud/skyux-lib-addin-client.svg)](https://www.npmjs.com/package/@blackbaud/skyux-lib-addin-client)
[![status](https://travis-ci.org/blackbaud/skyux-lib-addin-client.svg?branch=master)](https://travis-ci.org/blackbaud/skyux-lib-addin-client)

# SKY UX Add-in Client Library

The SKY UX Add-in Client Library wraps the lower-level [SKY Add-in Client Library](https://github.com/blackbaud/sky-addin-client) and provides an Angular service that can be more easily consumed by SKY UX SPAs. It also provides an optional plugin that can be used to inject the Environment ID context into your SKY UX SPA automatically, removing the need to track and manage the Environment ID in each component.

## Installation

Install both libraries as dependencies of your project using npm:

```
npm install --save @blackbaud/skyux-lib-addin-client
npm install --save @blackbaud/sky-addin-client
```

## Use

To use the service, import it into your SPA's `app-extras.module.ts` file and add it to the `providers` array:

```js
import {
  NgModule
} from '@angular/core';

import {
  AddinClientService
} from '@blackbaud/skyux-lib-addin-client';

@NgModule({
  providers: [AddinClientService]
})

export class AppExtrasModule { }
```

Then, inject it into your component as part of the constructor:

```js
import {
  Component,
  OnInit
} from '@angular/core';

import {
  AddinClientService
} from '@blackbaud/skyux-lib-addin-client';

import {
  AddinClientInitArgs
} from '@blackbaud/sky-addin-client';

@Component({
  selector: 'my-tile',
  templateUrl: './my-tile.component.html',
  styleUrls: ['./my-tile.component.scss']
})
export class MyTileComponent implements OnInit {
  public context: any;

  constructor(private addinClientService: AddinClientService) {}

  public ngOnInit() {
    this.addinClientService.args.subscribe((args: AddinClientInitArgs) => {
      this.context = args.context;

      args.ready({
        showUI: true,
        title: 'My tile',
        tileConfig: {
          summaryStyle: AddinTileSummaryStyle.Text,
          summaryText: 'Summary text',
          showHelp: true,
          showSettings: true
        }
      });
    });

    // Handle tile help icon click
    this.addinClientService.helpClick.subscribe(() => {
      this.showHelp();
    });

    // Handle tile settings icon click
    this.addinClientService.settingsClick.subscribe(() => {
      this.showSettingsModal();
    });
  }

  private showHelp() {
    // Define what happens when the help icon is clicked
  }

  private showSettingsModal() {
    // Define what happens when the settings icon is clicked
  }

}
```

The `AddinClientService` provides wrapper methods over the lower-level implementation.  So you can obtain a user identity token using the `getUserIdentityToken()` function (previously named `getAuthToken()`):

```js
this.addinClientService.getUserIdentityToken().subscribe((token: string) => {
  this.userIdentityToken = token;
});
  ```

You can navigate the host page using the `navigate` method:

```js
public invokeNavigation() {
  this.addinClientService.navigate({
    url: someUrl
  });
}
```

The help window can be popped using the `openHelp` method:

```js
public openHelp() {
  this.addinClientService.openHelp({
    helpKey: someHelpKey
  });
}
```

Finally, you can show a modal using the `showModal` method:

```js
this.addinClientService.showModal({
  url: someUrl,
  context: someContextObject
}).subscribe((modalResponse: any) => {

});
```

The optional plugin can be installed by running `npm install @blackbaud/skyux-builder-plugin-addin-client`, and then adding it to the `plugins` array in your `skyuxconfig.json` file:

```js
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

The plugin automatically injects the Environment ID into your component, making it available via the [SkyAppConfig](https://developer.blackbaud.com/skyux/learn/reference/configuration/apply-appsettings) service.

For more information on creating SKY Add-ins, view the documentation on the [SKY API Developer Portal](https://developer.blackbaud.com/skyapi/docs/addins)
