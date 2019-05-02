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
  AddinClientShowFlyoutResult
} from '@blackbaud/sky-addin-client';

@Injectable()
export class AddinClientService {
  public readonly addinClient: AddinClient;

  // Init args
  private _args: AsyncSubject<AddinClientInitArgs> = new AsyncSubject<AddinClientInitArgs>();
  public args: Observable<AddinClientInitArgs> = this._args.asObservable();

  // Addin Client Events
  /**
   * Event emitted for button add-ins indicating that the button was clicked.
   */
  public buttonClick: EventEmitter<any> = new EventEmitter(true);

  /**
   * Event emitted for flyout add-ins indicating that the next button was clicked.
   */
  public flyoutNextClick: EventEmitter<any> = new EventEmitter(true);

  /**
   * Event emitted for flyout add-ins indicating that the previous button was clicked.
   */
  public flyoutPreviousClick: EventEmitter<any> = new EventEmitter(true);

  /**
   * Event emitted for tile add-ins indicating that the help button was clicked.
   */
  public helpClick: EventEmitter<any> = new EventEmitter(true);

  /**
   * Event emitted for tile add-ins indicating that the settings button was clicked.
   */
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

  /**
   * Informs the host to close this modal add-in.
   * Should only be used from within the modal add-in and not the parent add-in.
   * @param args Arguments to provide a context object back to the parent add-in.
   */
  public closeModal(args: AddinClientCloseModalArgs): void {
    this.addinClient.closeModal(args);
  }

  /**
   * Requests the host page to launch a modal add-in.
   * @param args Arguments for launching the modal.
   * @returns Returns an observable that will publish a value when the modal add-in is closed.
   * Observables will publish values with context data passed from the modal add-in's closeModal call.
   */
  public showModal(args: AddinClientShowModalArgs): Observable<any> {
    let modalReturn: AddinClientShowModalResult = this.addinClient.showModal(args);
    return Observable.fromPromise(modalReturn.modalClosed);
  }

  /**
   * Cleans up the AddinClient, releasing all resources.
   */
  public destroy(): void {
    this.addinClient.destroy();
  }

  /**
   * Requests the host page to navigate.
   * @param args Arguments describing the navigation request.
   */
  public navigate(args: AddinClientNavigateArgs): void {
    this.addinClient.navigate(args);
  }

  /**
   * Informs the host to open the help tab with the specified help key.
   * @param args Arguments for launching the help tab.
   */
  public openHelp(args: AddinClientOpenHelpArgs): void {
    this.addinClient.openHelp(args);
  }

  /**
   * Requests a user identity token for the current user.
   * @returns Returns an observable which will publish the token value.
   */
  public getUserIdentityToken(): Observable<string> {
    return Observable.fromPromise(this.addinClient.getUserIdentityToken());
  }

  /**
   * @deprecated Use getUserIdentityToken
   */
  public getAuthToken(): Observable<string> {
    return Observable.fromPromise(this.addinClient.getUserIdentityToken());
  }

  /**
   * Informs the host to show a toast message.
   * @param args Arguments for showing a toast.
   */
  public showToast(args: AddinClientShowToastArgs): void {
    this.addinClient.showToast(args);
  }

  /**
   * Requests the host page to launch a flyout add-in.
   * @param args Arguments for launching the flyout.
   */
  public showFlyout(args: AddinClientShowFlyoutArgs): Observable<void> {
    const flyoutReturn: AddinClientShowFlyoutResult = this.addinClient.showFlyout(args);
    return Observable.fromPromise(flyoutReturn.flyoutClosed);
  }

  /**
   * Requests the host page to close the flyout add-in.
   */
  public closeFlyout(): void {
    this.addinClient.closeFlyout();
  }
}
