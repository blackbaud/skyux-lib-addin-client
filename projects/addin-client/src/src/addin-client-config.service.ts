import {
  AddinClientConfig,
  AddinClientReadyArgs,
  AddinType
} from "@blackbaud/sky-addin-client";

/**
 * How the add-in client styles the add-in document for its hosted surface.
 * - `'automatic'`: adapts the document background to the hosted surface.
 * - `'preserve'`: leaves the add-in's own background styling unchanged.
 * - `'container'`: uses the SKY UX container background, whatever the hosted surface.
 */
export type AddinClientHostedSurfaceMode = 'automatic' | 'preserve' | 'container';

/**
 * What the add-in client knows about the hosted surface when it asks for the
 * hosted surface mode.
 */
export interface AddinClientHostedSurfaceContext {
  /**
   * The add-in type the host reported, or `undefined` when the host doesn't report one
   * or reports a type this client doesn't recognize.
   */
  readonly addinType: AddinType | undefined;

  /**
   * The arguments the add-in passed to `ready()`.
   */
  readonly readyArgs: AddinClientReadyArgs;
}

/**
 * Implement this class with your own data to initialize the add-in client service.
 */
export abstract class AddinClientConfigService {
  /**
   * Gets the AddinClientConfig object that will be injected the
   * AddinClient instance when instantiated.
   */
  public getAddinClientConfig(): AddinClientConfig {
    return {};
  }

  /**
   * Gets how the add-in client styles the add-in document for its hosted surface. The
   * client asks on every `ready()` call, so an add-in can choose per add-in type, per
   * route, or per `ready()` call. Return `'preserve'` to keep the add-in's own background
   * styling, or `'container'` to use the SKY UX container background.
   * @param context The hosted surface the add-in is being made ready for.
   */
  public getHostedSurfaceMode(
    context: AddinClientHostedSurfaceContext
  ): AddinClientHostedSurfaceMode {
    return 'automatic';
  }
}
