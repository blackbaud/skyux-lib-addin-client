[![npm](https://img.shields.io/npm/v/@blackbaud/skyux-lib-addin-client.svg)](https://www.npmjs.com/package/@blackbaud/skyux-lib-addin-client)
![SKY UX CI](https://github.com/blackbaud/skyux-lib-addin-client/workflows/SKY%20UX%20CI/badge.svg)
[![coverage](https://codecov.io/gh/blackbaud/skyux-lib-addin-client/branch/master/graphs/badge.svg?branch=master)](https://codecov.io/gh/blackbaud/skyux-lib-addin-client/branch/master)

# SKY UX Add-in Client Library

The SKY UX Add-in Client Library wraps the lower-level [SKY Add-in Client Library](https://github.com/blackbaud/sky-addin-client) and provides an Angular service that can be more easily consumed by SKY UX SPAs. It also provides an optional plugin that can be used to inject the Environment ID context into your SKY UX SPA automatically, removing the need to track and manage the Environment ID in each component.

## Installation

Install the library as a dependency of your project using npm. The SKY UX Add-in Client Library has a direct dependency on the SKY Add-in Client Library, so it doesn't need to be installed separately:

```
npm install --save @blackbaud/skyux-lib-addin-client
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
          showInlineHelp: true,
          showSettings: true
        }
      });
    });

    // Handle tile inline help icon click
    this.addinClientService.inlineHelpClick.subscribe(() => {
      this.showHelp();
    });

    // Handle tile settings icon click
    this.addinClientService.settingsClick.subscribe(() => {
      this.showSettings();
    });
  }

  private showHelp() {
    // Define what happens when the inline help icon is clicked
  }

  private showSettings() {
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
this.addinClientService.navigate({
  url: someUrl
});
```

The help window can be popped using the `openHelp` method:

```js
this.addinClientService.openHelp({
  helpKey: someHelpKey
});
```

You can show a modal using the `showModal` method:

```js
this.addinClientService.showModal({
  url: someUrl,
  context: someContextObject
}).subscribe((modalResponse: any) => {
  // Define response from closing a modal
});
```

You can show a toast using the `showToast` method:

```js
this.addinClientService.showToast({
  message: someMessage,
  style: AddinToastStyle.Info
});
```

You can show a flyout using the `showFlyout` method:

```js
this.addinClientService.showFlyout({
  url: someUrl,
  context: someContextObject
}).subscribe(() => {
  // Define what happens when a flyout has closed
});
```

You can show a confirm dialog using the `showConfirm` method:

```js
this.addinClientService.showConfirm({
  message: 'confirm title',
  body: 'confirm message body',
  buttons: [
    {
      action: 'ok',
      text: 'OK',
      autofocus: true,
      style: AddinConfirmButtonStyle.Primary
    },
    {
      action: 'cancel',
      text: 'Cancel',
      style: AddinConfirmButtonStyle.Link
    }
  ]
}).subscribe((action) => {
  // Handle the action returned when the dialog closes
});
```

You can show an error dialog using the `showError` method:

```js
this.addinClientService.showError({
  closeText: 'OK',
  description: 'An unexpected error occurred',
  title: 'Error'
});
```

You can handle entry form and data add-in events using the `addEventHandler` method:

```js
this.addinClientService.addEventHandler({
  eventType: 'form-data-update'
}).addinEvent.subscribe((addinEvent: AddinEvent) => {
  // get updated data from addinEvent.context object
});

this.addinClientService.addEventHandler({
  eventType: 'form-save'
}).addinEvent.subscribe((addinEvent: AddinEvent) => {
  // handle the save event, asynchronously

  addinEvent.done(); // When done, call the done function (tells the entry form it's OK to close)
});

this.addinClientService.addEventHandler({
  eventType: 'form-cancel'
}).addinEvent.subscribe((addinEvent: AddinEvent) => {
  // handle the cancel event, asynchronously

  addinEvent.done(); // When done, call the done function (tells the entry form it's OK to close)
});

this.addinClientService.addEventHandler({
  eventType: 'load-data'
}).addinEvent.subscribe((addinEvent: AddinEvent) => {
  // retrieve data based on the addinEvent.context object
  const data = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
  ];
  
  addinEvent.done(data);
});
```

You can send a custom event to the host page, as long as the host supports the event type.
Before sending an event to the host page, you must subscribe to the AddinClientService's init `args`
event and check the `supportedEventTypes` property to determine what event types the host page
will handle.

```js
this.addinClientService.args.subscribe((args: AddinClientInitArgs) => {
  this.supportedEventTypes = args.supportedEventTypes;

  args.ready({
    showUI: true
  });
});

// Before sending event, check to make sure the event is supported by the host page
if (this.supportedEventTypes.includes('my-event-type')) {
  // To send add-in events to the host, call the sendEvent method
  this.addinClientService.sendEvent({
    type: 'my-event-type',
    context: { /* context object to pass to host page */ }
  }).subscribe(() => {
    // host page received the event
  }, (err) => {
    // an error occurred while attempting to send the event
  });
}
```

To determine the add-in extension points that support custom events,
please see https://developer.blackbaud.com/skyapi/docs/addins/concepts/extension-points.

Finally, you can show/hide a page-blocking wait using the `showWait` and `hideWait` methods:

```js
this.addinClientService.showWait();
// Execute code
this.addinClientService.hideWait();
```

## Additional configuration

The SKY UX Add-in Client allows for additional configuration to be specified by extending `AddinClientConfigService`.

You can allow additional origins where your add-in client may run within a Blackbaud host page. Additional origins are supplied as regular expression patterns. The `AddinClientService` already allows several Blackbaud host origins by default. If you find a need to extend the defaults, you may do so by overriding the `AddinClientConfigService`'s `getAddinClientConfig()` method.

```js
class AddinConfigService extends AddinClientConfigService {
  public override getAddinClientConfig(): AddinClientConfig {
    return {
      allowedOrigins: [
        /^https\:\/\/[\w\-\.]+\.additionalblackbauddomain\.com$/
      ]
    };
  }
}

@NgModule({
  // specify providers
  providers: [
    AddinClientService,
    {
      provide: AddinClientConfigService,
      useClass: AddinConfigService
    }
  ]
})
export class MyModule { }
```

For more information on creating SKY Add-ins, view the documentation on the [SKY Developer Portal](https://developer.blackbaud.com/skyapi/docs/addins)
