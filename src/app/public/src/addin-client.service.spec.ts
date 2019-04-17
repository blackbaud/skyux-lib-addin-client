import {
  expect
} from '@skyux-sdk/testing';

import { AddinClientService } from './addin-client.service';
import { AddinClientShowModalArgs,
  AddinClientShowModalResult,
  AddinClientCloseModalArgs,
  AddinClientNavigateArgs,
  AddinClientOpenHelpArgs,
  AddinClientShowToastArgs,
  AddinToastStyle,
  AddinClientShowFlyoutArgs} from '@blackbaud/sky-addin-client';

describe('Addin Client Service', () => {
  let addinClientService: AddinClientService;

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

    spyOn(addinClientService.addinClient, 'showFlyout');

    addinClientService.showFlyout(showFlyoutArgs);

    expect(addinClientService.addinClient.showFlyout).toHaveBeenCalledWith(showFlyoutArgs);

    done();
  });
});
