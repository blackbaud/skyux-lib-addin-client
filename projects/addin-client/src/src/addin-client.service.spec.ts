import {
  TestBed
} from '@angular/core/testing';

import {
  expect
} from '@skyux-sdk/testing';

import {
  AddinClientService
} from './addin-client.service';

import {
  AddinEventHandlerInstance
} from './events';

import {
  AddinClientShowModalArgs,
  AddinClientShowModalResult,
  AddinClientCloseModalArgs,
  AddinClientNavigateArgs,
  AddinClientOpenHelpArgs,
  AddinClientShowToastArgs,
  AddinToastStyle,
  AddinClientShowFlyoutArgs,
  AddinClientShowFlyoutResult,
  AddinClientShowConfirmArgs,
  AddinConfirmButtonStyle,
  AddinClientShowErrorArgs,
  AddinEventCallback
} from '@blackbaud/sky-addin-client';

describe('Addin Client Service', () => {
  let addinClientService: AddinClientService;

  beforeEach(() => {
    TestBed.configureTestingModule(
      {
        providers: [
          AddinClientService
        ]
      }
    );

    addinClientService = TestBed.inject(AddinClientService);
  });

  it('should instantiate an AddinClient', (done) => {
    addinClientService = new AddinClientService();
    expect(addinClientService.addinClient).toExist();
    done();
  });

  it('service consumer can subscribe to buttonClick', (done) => {
    addinClientService = new AddinClientService();

    let addinClientArgs = (addinClientService.addinClient as any).args;

    spyOn(addinClientService.buttonClick, 'emit').and.callThrough();

    addinClientArgs.callbacks.buttonClick();

    expect(addinClientService.buttonClick.emit).toHaveBeenCalled();

    done();
  });

  it('service consumer can subscribe to updateContext', (done) => {
    addinClientService = new AddinClientService();

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
    addinClientService = new AddinClientService();

    let addinClientArgs = (addinClientService.addinClient as any).args;

    spyOn(addinClientService.helpClick, 'emit').and.callThrough();

    addinClientArgs.callbacks.helpClick();

    expect(addinClientService.helpClick.emit).toHaveBeenCalled();

    done();
  });

  it('service consumer can subscribe to settingsClick', (done) => {
    addinClientService = new AddinClientService();

    let addinClientArgs = (addinClientService.addinClient as any).args;

    spyOn(addinClientService.settingsClick, 'emit').and.callThrough();

    addinClientArgs.callbacks.settingsClick();

    expect(addinClientService.settingsClick.emit).toHaveBeenCalled();

    done();
  });

  it('service consumer can subscribe to flyoutNextClick', (done) => {
    addinClientService = new AddinClientService();

    let addinClientArgs = (addinClientService.addinClient as any).args;

    spyOn(addinClientService.flyoutNextClick, 'emit').and.callThrough();

    addinClientArgs.callbacks.flyoutNextClick();

    expect(addinClientService.flyoutNextClick.emit).toHaveBeenCalled();

    done();
  });

  it('service consumer can subscribe to flyoutPreviousClick', (done) => {
    addinClientService = new AddinClientService();

    let addinClientArgs = (addinClientService.addinClient as any).args;

    spyOn(addinClientService.flyoutPreviousClick, 'emit').and.callThrough();

    addinClientArgs.callbacks.flyoutPreviousClick();

    expect(addinClientService.flyoutPreviousClick.emit).toHaveBeenCalled();

    done();
  });

  it('consumers can close modals through AddinClient', (done) => {
    addinClientService = new AddinClientService();

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
    addinClientService = new AddinClientService();

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
    addinClientService = new AddinClientService();

    let navigateArgs: AddinClientNavigateArgs = {
      url: 'https://www.example.com'
    };

    spyOn(addinClientService.addinClient, 'navigate');

    addinClientService.navigate(navigateArgs);

    expect(addinClientService.addinClient.navigate).toHaveBeenCalledWith(navigateArgs);

    done();
  });

  it('consumers can open help through AddinClient', (done) => {
    addinClientService = new AddinClientService();

    let openHelpArgs: AddinClientOpenHelpArgs = {
      helpKey: 'Applications.html'
    };

    spyOn(addinClientService.addinClient, 'openHelp');

    addinClientService.openHelp(openHelpArgs);

    expect(addinClientService.addinClient.openHelp).toHaveBeenCalledWith(openHelpArgs);

    done();
  });

  it('consumers can get a user identity token through AddinClient', (done) => {
    addinClientService = new AddinClientService();

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
    addinClientService = new AddinClientService();

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
    addinClientService = new AddinClientService();

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
    addinClientService = new AddinClientService();

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
    addinClientService = new AddinClientService();

    spyOn(addinClientService.addinClient, 'closeFlyout');

    addinClientService.closeFlyout();

    expect(addinClientService.addinClient.closeFlyout).toHaveBeenCalledWith();

    done();
  });

  it('consumers can show a confirm dialog through AddinClient', (done) => {
    addinClientService = new AddinClientService();

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
    addinClientService = new AddinClientService();

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
    addinClientService = new AddinClientService();

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
    addinClientService = new AddinClientService();

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

});
