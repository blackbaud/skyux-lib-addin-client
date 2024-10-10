import {
  EventEmitter,
  Injectable,
  RendererFactory2,
  inject
} from '@angular/core';
import {
  AddinClient,
  AddinClientCloseModalArgs,
  AddinClientEventArgs,
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
  AddinEventCallback
} from '@blackbaud/sky-addin-client';
import {
  SkyAppConfig, SkyuxConfigAppSupportedTheme
} from '@skyux/config';
import {
  SkyTheme,
  SkyThemeMode,
  SkyThemeService,
  SkyThemeSettings
} from '@skyux/theme';
import {
  AsyncSubject,
  Observable,
  from
} from 'rxjs';
import { AddinClientConfigService } from './addin-client-config.service';
import {
  AddinEvent,
  AddinEventHandlerInstance
} from './events';

@Injectable({
  providedIn: 'root'
})
export class AddinClientService {
  public readonly addinClient: AddinClient;

  // Init args
  private _args: AsyncSubject<AddinClientInitArgs> = new AsyncSubject<AddinClientInitArgs>();
  public args: Observable<AddinClientInitArgs> = this._args.asObservable();

  // Addin Client Events
  /**
   * Event emitted for box add-ins indicating that a control action button was clicked.
   */
  public actionClick: EventEmitter<string> = new EventEmitter(true);

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
   * @deprecated Use tile inline help instead and handle the {@link inlineHelpClick} emitter.
   */
  public helpClick: EventEmitter<any> = new EventEmitter(true);

  /**
   * Event emitted indicating that the inline help button was clicked.
   */
  public inlineHelpClick: EventEmitter<any> = new EventEmitter(true);

  /**
   * Event emitted for tile add-ins indicating that the settings button was clicked.
   */
  public settingsClick: EventEmitter<any> = new EventEmitter(true);

  #config = inject(SkyAppConfig, { optional: true });
  #rendererFactory = inject(RendererFactory2);
  #themeService = inject(SkyThemeService);
  #addinClientConfigService = inject(AddinClientConfigService, { optional: true });

  constructor() {
    this.addinClient = new AddinClient({
      callbacks: {
        init: (args: AddinClientInitArgs) => {
          this.initializeTheme(args?.themeSettings);

          this._args.next(args);
          this._args.complete();
        },
        actionClick: (action: string) => {
          this.actionClick.emit(action);
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
        inlineHelpClick: () => {
          this.inlineHelpClick.emit();
        },
        settingsClick: () => {
          this.settingsClick.emit();
        },
        updateContext: (context: any) => {
          this.updateContext.emit(context);
        },
        themeChange: (settings: AddinClientThemeSettings) => {
          this.setTheme(settings);
        }
      },
      config: this.#addinClientConfigService?.getAddinClientConfig()
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

  /**
   * Sends an event to be handled by the host page.
   * @param args The event arguments to be sent to the host page.
   * @returns Returns an observable which will complete when the add-in host page receives the
   * message. The request will fail if a subsequent event occurs, for the same event type, within
   * 200 milliseconds. A failure can also occur if an event type is not one of the supported types
   * from the host page.
   * @see AddinClientInitArgs#supportedEventTypes
   */
  public sendEvent(args: AddinClientEventArgs): Observable<void> {
    return from(this.addinClient.sendEvent(args));
  }

  private initializeTheme(themeSettings: AddinClientThemeSettings): void {
    if (!themeSettings) {
      return;
    }

    const hostTheme = AddinClientService.toSkyTheme(themeSettings.theme);
    const hostThemeMode = AddinClientService.toSkyThemeMode(themeSettings.mode);

    if (!this.#config) {
      // no app config, initialize host theme
      this.initializeTheme_(hostTheme, hostThemeMode);
      return;
    }

    const themingConfig = this.#config.skyux.app?.theming;

    if (
      themingConfig?.supportedThemes &&
      themingConfig.supportedThemes.indexOf(themeSettings.theme as SkyuxConfigAppSupportedTheme) !== -1
    ) {
      // app supports host theme, initialize host theme
      this.initializeTheme_(hostTheme, hostThemeMode);
      return;
    }

    // app does not support host theme, do nothing to initialize the app's default theme
  }

  private initializeTheme_(theme: SkyTheme, themeMode: SkyThemeMode): void {
    this.#themeService.init(
      document.body,
      this.#rendererFactory.createRenderer(undefined, undefined),
      new SkyThemeSettings(theme, themeMode)
    );
  }

  private setTheme(settings: AddinClientThemeSettings): void {
    if (!settings) {
      return;
    }

    this.#themeService.setTheme(new SkyThemeSettings(
      AddinClientService.toSkyTheme(settings.theme),
      AddinClientService.toSkyThemeMode(settings.mode)
    ));
  }

  private static toSkyTheme(theme: string): SkyTheme {
    switch (theme) {
      case 'modern':
        return SkyTheme.presets.modern;
      default:
        return SkyTheme.presets.default;
    }
  }

  private static toSkyThemeMode(mode: string): SkyThemeMode {
    switch (mode) {
      case 'dark':
        return SkyThemeMode.presets.dark;
      default:
        return SkyThemeMode.presets.light;
    }
  }
}
