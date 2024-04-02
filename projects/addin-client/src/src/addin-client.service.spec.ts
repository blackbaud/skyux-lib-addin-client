import {
  TestBed
} from '@angular/core/testing';
import {
  AddinClientCloseModalArgs,
  AddinClientInitArgs,
  AddinClientNavigateArgs,
  AddinClientOpenHelpArgs,
  AddinClientShowConfirmArgs,
  AddinClientShowErrorArgs,
  AddinClientShowFlyoutArgs,
  AddinClientShowFlyoutResult,
  AddinClientShowModalArgs,
  AddinClientShowModalResult,
  AddinClientShowToastArgs,
  AddinClientThemeSettings,
  AddinConfirmButtonStyle,
  AddinEventCallback,
  AddinToastStyle
} from '@blackbaud/sky-addin-client';
import {
  expect
} from '@skyux-sdk/testing';
import { SkyAppConfig } from '@skyux/config';
import { SkyTheme, SkyThemeMode, SkyThemeService, SkyThemeSettings } from '@skyux/theme';
import {
  AddinClientService
} from './addin-client.service';
import {
  AddinEventHandlerInstance
} from './events';

describe('Addin Client Service', () => {

  describe('Without app config', () => {
    let addinClientService: AddinClientService;
    beforeEach(() => {
      TestBed.configureTestingModule(
        {
          providers: [
            AddinClientService,
            SkyThemeService
          ]
        }
      );

      addinClientService = TestBed.inject(AddinClientService);
    });

    it('should instantiate an AddinClient', (done) => {
      expect(addinClientService.addinClient).toExist();
      done();
    });

    it('service consumer can subscribe to init args', (done) => {
      const initArgs: AddinClientInitArgs = {
        envId: 'envid',
        ready: () => {}
      };

      let addinClientArgs = (addinClientService.addinClient as any).args;

      addinClientService.args.subscribe((args) => {
        expect(args).toEqual(initArgs);

        done();
      });

      addinClientArgs.callbacks.init(initArgs);
    });

    it('service consumer can subscribe to init args with additional properties', (done) => {
      const themeService = TestBed.inject(SkyThemeService);
      const themeServiceInitSpy = spyOn(themeService, 'init').and.callThrough();

      const initArgs: AddinClientInitArgs = {
        envId: 'envid',
        context: {
          test: '123'
        },
        supportedEventTypes: ['form-change'],
        themeSettings: {
          mode: 'light',
          theme: 'default'
        },
        ready: () => {}
      };

      let addinClientArgs = (addinClientService.addinClient as any).args;

      addinClientService.args.subscribe((args) => {
        expect(args).toEqual(initArgs);

        expect(themeServiceInitSpy.calls.mostRecent().args[2])
          .toEqual(new SkyThemeSettings(SkyTheme.presets.default, SkyThemeMode.presets.light))

        done();
      });

      addinClientArgs.callbacks.init(initArgs);
    });

    it('service consumer can subscribe to buttonClick', (done) => {
      let addinClientArgs = (addinClientService.addinClient as any).args;

      spyOn(addinClientService.buttonClick, 'emit').and.callThrough();

      addinClientArgs.callbacks.buttonClick();

      expect(addinClientService.buttonClick.emit).toHaveBeenCalled();

      done();
    });

    it('service consumer can subscribe to updateContext', (done) => {
      let addinClientArgs = (addinClientService.addinClient as any).args;

      spyOn(addinClientService.updateContext, 'emit').and.callThrough();

      let newContext: {
        id: '123'
      };

      addinClientArgs.callbacks.updateContext(newContext);

      expect(addinClientService.updateContext.emit).toHaveBeenCalled();
      expect(addinClientService.updateContext.emit).toHaveBeenCalledWith(newContext);

      done();
    });

    it('service consumer can subscribe to helpClick', (done) => {
      let addinClientArgs = (addinClientService.addinClient as any).args;

      spyOn(addinClientService.helpClick, 'emit').and.callThrough();

      addinClientArgs.callbacks.helpClick();

      expect(addinClientService.helpClick.emit).toHaveBeenCalled();

      done();
    });

    it('service consumer can subscribe to settingsClick', (done) => {
      let addinClientArgs = (addinClientService.addinClient as any).args;

      spyOn(addinClientService.settingsClick, 'emit').and.callThrough();

      addinClientArgs.callbacks.settingsClick();

      expect(addinClientService.settingsClick.emit).toHaveBeenCalled();

      done();
    });

    it('service consumer can subscribe to flyoutNextClick', (done) => {
      let addinClientArgs = (addinClientService.addinClient as any).args;

      spyOn(addinClientService.flyoutNextClick, 'emit').and.callThrough();

      addinClientArgs.callbacks.flyoutNextClick();

      expect(addinClientService.flyoutNextClick.emit).toHaveBeenCalled();

      done();
    });

    it('service consumer can subscribe to flyoutPreviousClick', (done) => {
      let addinClientArgs = (addinClientService.addinClient as any).args;

      spyOn(addinClientService.flyoutPreviousClick, 'emit').and.callThrough();

      addinClientArgs.callbacks.flyoutPreviousClick();

      expect(addinClientService.flyoutPreviousClick.emit).toHaveBeenCalled();

      done();
    });

    it('client handles UX theme change - default', (done) => {
      const themeService = TestBed.inject(SkyThemeService);

      let addinClientArgs = (addinClientService.addinClient as any).args;

      const initArgs: AddinClientInitArgs = {
        envId: 'envid',
        context: {
          test: '123'
        },
        supportedEventTypes: ['form-change'],
        themeSettings: {
          mode: 'dark',
          theme: 'modern'
        },
        ready: () => {}
      };

      // init client
      addinClientArgs.callbacks.init(initArgs);

      let settings: AddinClientThemeSettings = {
        mode: 'light',
        theme: 'default'
      };

      const setThemeSpy = spyOn(themeService, 'setTheme').and.callThrough();
      addinClientArgs.callbacks.themeChange(settings);

      expect(setThemeSpy.calls.mostRecent().args[0]).toEqual(new SkyThemeSettings(
        SkyTheme.presets.default,
        SkyThemeMode.presets.light
      ));

      done();
    });

    it('client handles UX theme change - modern', (done) => {
      const themeService = TestBed.inject(SkyThemeService);

      let addinClientArgs = (addinClientService.addinClient as any).args;

      const initArgs: AddinClientInitArgs = {
        envId: 'envid',
        context: {
          test: '123'
        },
        supportedEventTypes: ['form-change'],
        themeSettings: {
          mode: 'light',
          theme: 'default'
        },
        ready: () => {}
      };

      // init client
      addinClientArgs.callbacks.init(initArgs);

      let settings: AddinClientThemeSettings = {
        mode: 'dark',
        theme: 'modern'
      };

      const setThemeSpy = spyOn(themeService, 'setTheme').and.callThrough();
      addinClientArgs.callbacks.themeChange(settings);

      expect(setThemeSpy.calls.mostRecent().args[0]).toEqual(new SkyThemeSettings(
        SkyTheme.presets.modern,
        SkyThemeMode.presets.dark
      ));

      done();
    });

    it('theme change undefined', (done) => {
      const themeService = TestBed.inject(SkyThemeService);

      let addinClientArgs = (addinClientService.addinClient as any).args;

      const initArgs: AddinClientInitArgs = {
        envId: 'envid',
        context: {
          test: '123'
        },
        supportedEventTypes: ['form-change'],
        themeSettings: {
          mode: 'light',
          theme: 'default'
        },
        ready: () => {}
      };

      // init client
      addinClientArgs.callbacks.init(initArgs);

      const setThemeSpy = spyOn(themeService, 'setTheme');
      addinClientArgs.callbacks.themeChange(undefined);

      expect(setThemeSpy).not.toHaveBeenCalled();

      done();
    });

    it('consumers can close modals through AddinClient', (done) => {
      let closeModalArgs: AddinClientCloseModalArgs = {
        context: {
          closed: true
        }
      };

      spyOn(addinClientService.addinClient, 'closeModal');

      addinClientService.closeModal(closeModalArgs);

      expect(addinClientService.addinClient.closeModal).toHaveBeenCalledWith(closeModalArgs);

      done();
    });

    it('consumers can show modals through AddinClient', (done) => {
      let modalResponse: AddinClientShowModalResult = {
        modalClosed: new Promise<any>((resolve) => {
          resolve({
            closed: true
          });
        })
      };

      spyOn(addinClientService.addinClient, 'showModal').and.returnValue(modalResponse);

      let modalArgs: AddinClientShowModalArgs = {
        url: 'https://www.example.com/modal',
        context: {
          id: '24'
        }
      };

      addinClientService.showModal(modalArgs).subscribe((result) => {
        expect(addinClientService.addinClient.showModal).toHaveBeenCalledWith(modalArgs);

        expect(result).toEqual({
          closed: true
        });

        done();
      });
    });

    it('consumers can navigate through AddinClient', (done) => {
      let navigateArgs: AddinClientNavigateArgs = {
        url: 'https://www.example.com'
      };

      spyOn(addinClientService.addinClient, 'navigate');

      addinClientService.navigate(navigateArgs);

      expect(addinClientService.addinClient.navigate).toHaveBeenCalledWith(navigateArgs);

      done();
    });

    it('consumers can open help through AddinClient', (done) => {
      let openHelpArgs: AddinClientOpenHelpArgs = {
        helpKey: 'Applications.html'
      };

      spyOn(addinClientService.addinClient, 'openHelp');

      addinClientService.openHelp(openHelpArgs);

      expect(addinClientService.addinClient.openHelp).toHaveBeenCalledWith(openHelpArgs);

      done();
    });

    it('consumers can get a user identity token through AddinClient', (done) => {
      let uitPromise = new Promise<any>((resolve) => {
        resolve('token');
      });

      spyOn(addinClientService.addinClient, 'getUserIdentityToken').and.returnValue(uitPromise);

      addinClientService.getUserIdentityToken().subscribe((token) => {
        expect(addinClientService.addinClient.getUserIdentityToken).toHaveBeenCalled();

        expect(token).toEqual('token');

        done();
      });
    });

    it('consumers can get (deprecated) auth token through AddinClient', (done) => {
      let uitPromise = new Promise<any>((resolve) => {
        resolve('token');
      });

      spyOn(addinClientService.addinClient, 'getUserIdentityToken').and.returnValue(uitPromise);

      addinClientService.getAuthToken().subscribe((token) => {
        expect(addinClientService.addinClient.getUserIdentityToken).toHaveBeenCalled();

        expect(token).toEqual('token');

        done();
      });
    });

    it('consumers can show a toast through AddinClient', (done) => {
      let showToastArgs: AddinClientShowToastArgs = {
        message: 'a toast message',
        style: AddinToastStyle.Success
      };

      spyOn(addinClientService.addinClient, 'showToast');

      addinClientService.showToast(showToastArgs);

      expect(addinClientService.addinClient.showToast).toHaveBeenCalledWith(showToastArgs);

      done();
    });

    it('consumers can show a flyout through AddinClient', (done) => {
      let showFlyoutArgs: AddinClientShowFlyoutArgs = {
        context: {
          userData: 'some data'
        },
        defaultWidth: 600,
        iteratorNextDisabled: false,
        iteratorPreviousDisabled: true,
        maxWidth: 1000,
        minWidth: 200,
        permalink: {
          label: 'some label',
          url: 'some url'
        },
        showIterator: true,
        url: 'some url'
      };

      let flyoutResponse: AddinClientShowFlyoutResult = {
        flyoutClosed: new Promise<void>((resolve) => {
          resolve();
        })
      };

      spyOn(addinClientService.addinClient, 'showFlyout').and.returnValue(flyoutResponse);

      addinClientService.showFlyout(showFlyoutArgs).subscribe((result) => {
        expect(addinClientService.addinClient.showFlyout).toHaveBeenCalledWith(showFlyoutArgs);

        expect(result).toBe(undefined);

        done();
      });
    });

    it('consumers can close flyouts through AddinClient', (done) => {
      spyOn(addinClientService.addinClient, 'closeFlyout');

      addinClientService.closeFlyout();

      expect(addinClientService.addinClient.closeFlyout).toHaveBeenCalledWith();

      done();
    });

    it('consumers can show a confirm dialog through AddinClient', (done) => {
      let showConfirmArgs: AddinClientShowConfirmArgs = {
        body: 'Confirm dialog body text',
        buttons: [
          {
            action: 'action 1',
            text: 'Action 1'
          },
          {
            action: 'action 2',
            autofocus: true,
            style: AddinConfirmButtonStyle.Primary,
            text: 'Action 2'
          }
        ],
        message: 'This is a confirm'
      };

      let confirmResponse: Promise<string> = new Promise<string>((resolve) => {
        resolve('some action');
      });

      spyOn(addinClientService.addinClient, 'showConfirm').and.returnValue(confirmResponse);

      addinClientService.showConfirm(showConfirmArgs).subscribe((result) => {
        expect(addinClientService.addinClient.showConfirm).toHaveBeenCalledWith(showConfirmArgs);

        expect(result).toBe('some action');

        done();
      });
    });

    it('consumers can show an error dialog through AddinClient', (done) => {
      let showErrorArgs: AddinClientShowErrorArgs = {
        closeText: 'Close',
        description: 'Error desc',
        title: 'Error title'
      };

      spyOn(addinClientService.addinClient, 'showError');

      addinClientService.showError(showErrorArgs);

      expect(addinClientService.addinClient.showError).toHaveBeenCalledWith(showErrorArgs);

      done();
    });

    it('consumers can begin page blocking wait indicators through AddinClient', () => {
      spyOn(addinClientService.addinClient, 'showWait').and.stub();

      addinClientService.showWait();

      expect(addinClientService.addinClient.showWait).toHaveBeenCalledWith();
    });

    it('consumers can end page blocking wait indicators through AddinClient', () => {
      spyOn(addinClientService.addinClient, 'hideWait').and.stub();

      addinClientService.hideWait();

      expect(addinClientService.addinClient.hideWait).toHaveBeenCalledWith();
    });

    it('consumers can register an add-in event', (done) => {
      const addEventHandlerSpy = spyOn(addinClientService.addinClient, 'addEventHandler');

      const eventHandlerInstance: AddinEventHandlerInstance = addinClientService.addEventHandler('form-data-update');
      spyOn(eventHandlerInstance.addinEvent, 'emit');

      expect(addinClientService.addinClient.addEventHandler).toHaveBeenCalled();

      const mostRecentCall = addEventHandlerSpy.calls.mostRecent();
      const eventTypeArg = mostRecentCall.args[0];
      expect(eventTypeArg).toBe('form-data-update');

      const addinEventCallback: AddinEventCallback = mostRecentCall.args[1];
      const context: any = {
        constituent_id: '280',
        gift_type: 'donation'
      };
      let doneCallback: () => void;
      addinEventCallback(context, doneCallback);

      expect(eventHandlerInstance.addinEvent.emit).toHaveBeenCalledWith({
        context,
        done: doneCallback
      });

      done();
    });

    it('consumers can send an add-in event', (done) => {
      const sendEventSpy = spyOn(addinClientService.addinClient, 'sendEvent')
        .and.returnValue(Promise.resolve());

      addinClientService.sendEvent({
        context: 'some-context',
        type: 'update-settings'
      }).subscribe(() => {
        expect(addinClientService.addinClient.sendEvent).toHaveBeenCalled();

        const mostRecentCall = sendEventSpy.calls.mostRecent();
        const eventArgs = mostRecentCall.args[0];
        expect(eventArgs.context).toBe('some-context');
        expect(eventArgs.type).toBe('update-settings');

        done();
      });
    });

    it('destroys the addin client', (done) => {
      spyOn(addinClientService.addinClient, 'destroy').and.stub();

      addinClientService.destroy();

      expect(addinClientService.addinClient.destroy).toHaveBeenCalled();

      done();
    });
  });

  describe('With app config', () => {
    let addinClientService: AddinClientService;

    class MockSkyAppConfig {
      public get skyux(): any {
        return {};
      }
    };

    beforeEach(() => {
      TestBed.configureTestingModule(
        {
          providers: [
            AddinClientService,
            SkyThemeService,
            {
              provide: SkyAppConfig, useClass: MockSkyAppConfig
            }
          ]
        }
      );

      addinClientService = TestBed.inject(AddinClientService);
    });

    it('should instantiate an AddinClient', (done) => {
      expect(addinClientService.addinClient).toExist();
      done();
    });

    it('no app theming config', (done) => {
      const appConfig = TestBed.inject(SkyAppConfig);
      const themeService = TestBed.inject(SkyThemeService);
      const themeServiceInitSpy = spyOn(themeService, 'init');
      spyOnProperty(appConfig, 'skyux').and.returnValue({
        app: {
        }
      });

      const initArgs: AddinClientInitArgs = {
        envId: 'envid',
        context: {
          test: '123'
        },
        themeSettings: {
          mode: 'light',
          theme: 'default'
        },
        ready: () => {}
      };

      let addinClientArgs = (addinClientService.addinClient as any).args;

      addinClientService.args.subscribe((args) => {
        expect(args).toEqual(initArgs);

        expect(themeServiceInitSpy).not.toHaveBeenCalled();

        done();
      });

      addinClientArgs.callbacks.init(initArgs);
    });

    it('no supported themes config', (done) => {
      const appConfig = TestBed.inject(SkyAppConfig);
      const themeService = TestBed.inject(SkyThemeService);
      const themeServiceInitSpy = spyOn(themeService, 'init');
      spyOnProperty(appConfig, 'skyux').and.returnValue({
        app: {
          theming: {
          }
        }
      } as any);

      const initArgs: AddinClientInitArgs = {
        envId: 'envid',
        context: {
          test: '123'
        },
        themeSettings: {
          mode: 'light',
          theme: 'default'
        },
        ready: () => {}
      };

      let addinClientArgs = (addinClientService.addinClient as any).args;

      addinClientService.args.subscribe((args) => {
        expect(args).toEqual(initArgs);

        expect(themeServiceInitSpy).not.toHaveBeenCalled();

        done();
      });

      addinClientArgs.callbacks.init(initArgs);
    });

    it('app does not support host theme', (done) => {
      const appConfig = TestBed.inject(SkyAppConfig);
      const themeService = TestBed.inject(SkyThemeService);
      const themeServiceInitSpy = spyOn(themeService, 'init');
      spyOnProperty(appConfig, 'skyux').and.returnValue({
        app: {
          theming: {
            supportedThemes: ['default'],
            theme: 'default'
          }
        }
      });

      const initArgs: AddinClientInitArgs = {
        envId: 'envid',
        context: {
          test: '123'
        },
        themeSettings: {
          mode: 'light',
          theme: 'modern'
        },
        ready: () => {}
      };

      let addinClientArgs = (addinClientService.addinClient as any).args;

      addinClientService.args.subscribe((args) => {
        expect(args).toEqual(initArgs);

        expect(themeServiceInitSpy).not.toHaveBeenCalled();

        done();
      });

      addinClientArgs.callbacks.init(initArgs);
    });

    it('app supports host theme', (done) => {
      const appConfig = TestBed.inject(SkyAppConfig);
      const themeService = TestBed.inject(SkyThemeService);
      const themeServiceInitSpy = spyOn(themeService, 'init');
      spyOnProperty(appConfig, 'skyux').and.returnValue({
        app: {
          theming: {
            supportedThemes: ['default', 'modern'],
            theme: 'default'
          }
        }
      });

      const initArgs: AddinClientInitArgs = {
        envId: 'envid',
        context: {
          test: '123'
        },
        themeSettings: {
          mode: 'light',
          theme: 'modern'
        },
        ready: () => {}
      };

      let addinClientArgs = (addinClientService.addinClient as any).args;

      addinClientService.args.subscribe((args) => {
        expect(args).toEqual(initArgs);

        expect(themeServiceInitSpy.calls.mostRecent().args[2])
          .toEqual(new SkyThemeSettings(SkyTheme.presets.modern, SkyThemeMode.presets.light))

        done();
      });

      addinClientArgs.callbacks.init(initArgs);
    });

    it('destroys the addin client', (done) => {
      spyOn(addinClientService.addinClient, 'destroy').and.stub();

      addinClientService.destroy();

      expect(addinClientService.addinClient.destroy).toHaveBeenCalled();

      done();
    });
  });
});
