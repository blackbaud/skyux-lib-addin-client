import { Injectable, EventEmitter } from '@angular/core';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import {
  AddinClient,
  AddinClientInitArgs,
  AddinClientCloseModalArgs,
  AddinClientShowModalArgs,
  AddinClientShowModalResult,
  AddinClientNavigateArgs,
  AddinClientOpenHelpArgs,
  AddinClientShowToastArgs,
  AddinClientShowFlyoutArgs,
  AddinClientUpdateFlyoutArgs,
  AddinClientShowFlyoutResult
} from '@blackbaud/sky-addin-client';

@Injectable()
export class AddinClientService {
  public readonly addinClient: AddinClient;

  // Init args
  private _args: AsyncSubject<AddinClientInitArgs> = new AsyncSubject<AddinClientInitArgs>();
  public args: Observable<AddinClientInitArgs> = this._args.asObservable();

  // Addin Client Events
  public buttonClick: EventEmitter<any> = new EventEmitter(true);
  public flyoutCloseClick: EventEmitter<any> = new EventEmitter(true);
  public flyoutNextClick: EventEmitter<any> = new EventEmitter(true);
  public flyoutPreviousClick: EventEmitter<any> = new EventEmitter(true);
  public helpClick: EventEmitter<any> = new EventEmitter(true);
  public settingsClick: EventEmitter<any> = new EventEmitter(true);

  constructor() {
    this.addinClient = new AddinClient({
      callbacks: {
        init: (args: AddinClientInitArgs) => {
          this._args.next(args);
          this._args.complete();
        },
        buttonClick: () => {
          this.buttonClick.emit();
        },
        flyoutNextClick: () => {
          this.flyoutNextClick.emit();
        },
        flyoutPreviousClick: () => {
          this.flyoutPreviousClick.emit();
        },
        helpClick: () => {
          this.helpClick.emit();
        },
        settingsClick: () => {
          this.settingsClick.emit();
        }
      }
    });
  }

  public closeModal(args: AddinClientCloseModalArgs): void {
    this.addinClient.closeModal(args);
  }

  public showModal(args: AddinClientShowModalArgs): Observable<any> {
    let modalReturn: AddinClientShowModalResult = this.addinClient.showModal(args);
    return Observable.fromPromise(modalReturn.modalClosed);
  }

  public destroy(): void {
    this.addinClient.destroy();
  }

  public navigate(args: AddinClientNavigateArgs): void {
    this.addinClient.navigate(args);
  }

  public openHelp(args: AddinClientOpenHelpArgs): void {
    this.addinClient.openHelp(args);
  }

  public getUserIdentityToken(): Observable<string> {
    return Observable.fromPromise(this.addinClient.getUserIdentityToken());
  }

  /**
   * @deprecated Use getUserIdentityToken
   */
  public getAuthToken(): Observable<string> {
    return Observable.fromPromise(this.addinClient.getUserIdentityToken());
  }

  public showToast(args: AddinClientShowToastArgs): void {
    this.addinClient.showToast(args);
  }

  public showFlyout(args: AddinClientShowFlyoutArgs): Observable<any> {
    let flyoutReturn: AddinClientShowFlyoutResult = this.addinClient.showFlyout(args);
    return Observable.fromPromise(flyoutReturn.flyoutClosed);
  }

  public updateFlyout(args: AddinClientUpdateFlyoutArgs): void {
    this.addinClient.updateFlyout(args);
  }
}
