import { AddinClientConfig } from "@blackbaud/sky-addin-client";

/**
 * How the add-in client styles the add-in document for its hosted surface.
 * - `'automatic'`: adapts the document background to the hosted surface.
 * - `'preserve'`: leaves the add-in's own background styling unchanged.
 */
export type AddinClientHostedSurfaceMode = 'automatic' | 'preserve';

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
   * Gets how the add-in client styles the add-in document for its hosted surface.
   * Return `'preserve'` to keep the add-in's own background styling.
   */
  public getHostedSurfaceMode(): AddinClientHostedSurfaceMode {
    return 'automatic';
  }
}
