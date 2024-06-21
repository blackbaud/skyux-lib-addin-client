import { AddinClientConfig } from "@blackbaud/sky-addin-client";

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
}
