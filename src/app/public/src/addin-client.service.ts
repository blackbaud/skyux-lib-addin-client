import {
  AsyncSubject,
  Observable,
  from
} from 'rxjs';

import {
  Injectable,
  EventEmitter
} from '@angular/core';

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
  AddinClientShowFlyoutResult,
  AddinClientShowConfirmArgs,
  AddinClientShowErrorArgs,
  AddinEventCallback
} from '@blackbaud/sky-addin-client';

import {
  AddinEvent,
  AddinEventHandlerInstance
} from './events';

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
   * Event emitted for add-ins when context information has been updated
   */
  public updateContext: EventEmitter<any> = new EventEmitter();

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
   * @deprecated See _Deprecated help support_ in README
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
        },
        updateContext: (context: any) => {
          this.updateContext.emit(context);
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
    return from(modalReturn.modalClosed);
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
   * @deprecated See _Deprecated help support_ in README
   */
  public openHelp(args: AddinClientOpenHelpArgs): void {
    this.addinClient.openHelp(args);
  }

  /**
   * Requests a user identity token for the current user.
   * @returns Returns an observable which will publish the token value.
   */
  public getUserIdentityToken(): Observable<string> {
    return from(this.addinClient.getUserIdentityToken());
  }

  /**
   * @deprecated Use getUserIdentityToken
   */
  public getAuthToken(): Observable<string> {
    return from(this.addinClient.getUserIdentityToken());
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
   * @returns Returns an observable that will notify when the flyout add-in is closed.
   */
  public showFlyout(args: AddinClientShowFlyoutArgs): Observable<void> {
    const flyoutReturn: AddinClientShowFlyoutResult = this.addinClient.showFlyout(args);
    return from(flyoutReturn.flyoutClosed);
  }

  /**
   * Requests the host page to close the flyout add-in.
   */
  public closeFlyout(): void {
    this.addinClient.closeFlyout();
  }

  /**
   * Requests the host page to show a confirm dialog.
   * @param args Arguments for showing a confirm dialog.
   * @returns Returns an observable which will publish the confirm action value.
   */
  public showConfirm(args: AddinClientShowConfirmArgs): Observable<string> {
    return from(this.addinClient.showConfirm(args));
  }

  /**
   * Informs the host to show an error dialog.
   * @param args Arguments for showing an error dialog.
   */
  public showError(args: AddinClientShowErrorArgs): void {
    this.addinClient.showError(args);
  }

  /**
   * Requests the host page to show a page blocking wait indicator.
   */
  public showWait(): void {
    this.addinClient.showWait();
  }

  /**
   * Requests the host page to hide a page blocking wait indicator.
   */
  public hideWait(): void {
    this.addinClient.hideWait();
  }

  /**
   * Registers an event handler for the provided event type.
   * @param eventType The event type to register.
   * @returns AddinEventHandlerInstance
   */
  public addEventHandler(eventType: string): AddinEventHandlerInstance {
    let eventHandlerInstance = new AddinEventHandlerInstance();
    eventHandlerInstance.addinEvent = new EventEmitter<AddinEvent>();

    const eventCallback: AddinEventCallback = (context, done) => {
      eventHandlerInstance.addinEvent.emit({
        context,
        done
      });
    };
    this.addinClient.addEventHandler(eventType, eventCallback);

    return eventHandlerInstance;
  }
}
