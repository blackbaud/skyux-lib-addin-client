[![npm](https://img.shields.io/npm/v/@blackbaud/skyux-lib-addin-client.svg)](https://www.npmjs.com/package/@blackbaud/skyux-lib-addin-client)
[![status](https://travis-ci.org/blackbaud/skyux-lib-addin-client.svg?branch=master)](https://travis-ci.org/blackbaud/skyux-lib-addin-client)

# SKY UX Add-in Client Library

The SKY UX Add-in Client Library wraps the lower-level [SKY Add-in Client Library](https://github.com/blackbaud/sky-addin-client) and provides an Angular service that can be more easily consumed by SKY UX SPAs. It also contains a plugin that injects the Environment ID context that gets passed down from the add-in host to the client into your SKY UX SPA automatically, obviating the need to manually handle passing the Environment ID around.

## Installation

Install the library as a dependency of your project using npm:

```
npm install --save @blackbaud/skyux-lib-addin-client
```

## Use

To use the service, import it into your SPA's `app-extras.module.ts` file and add it to the `providers` array:

```js
import { NgModule } from '@angular/core';
import { AddinClientService } from '@blackbaud/skyux-lib-addin-client';

@NgModule({
  providers: [AddinClientService]
})
export class AppExtrasModule { }
```

Then, inject it into your component:

```js
import { Component, OnInit } from '@angular/core';
import { AddinClientService } from '@blackbaud/skyux-lib-addin-client';
import { AddinClientService } from '@blackbaud/skyux-lib-addin-client';

@Component({
  selector: 'tile-one',
  templateUrl: './tile-one.component.html',
  styleUrls: ['./tile-one.component.scss']
})
export class TileOneComponent implements OnInit {
  public context: any;

  constructor(private addinClientService: AddinClientService) {}

  public ngOnInit() {
    this.addinClientService.args.subscribe((args: AddinClientInitArgs) => {
      this.context = args.context;

      args.ready({
        showUI: true,
        title: 'My tile'
      });
    });
  }

}
```

The `AddinClientService` provides wrapper methods over the lower-level implementation, so for example you can obtain a user identity token using the `getAuthToken()` function:

```js
this.addinClientService.getAuthToken().subscribe((token: string) => {
  this.userIdentityToken = token;
});
  ```

You can navigate the host page using the `navigate` method:

```js
public invokeNavigation() {
  this.addinClientService.navigate({ url: someUrl });
}
```

The help window can be popped using the `openHelp` method:

```js
public openHelp() {
  this.addinClientService.openHelp({ helpKey: someHelpKey });
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

To use the plugin, you must add it to the `plugins` array in your `skyuxconfig.json` file. The plugin is included as a dependency of the library, so no need to install.

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

For more information on creating SKY Add-ins, view the documentation on the [SKY API Developer Portal](https://apidocs.sky.blackbaud.com/docs/addins)
