import {
  EventEmitter
} from '@angular/core';

import {
  AddinEvent
} from './addin-event';

/**
 * Allows you to process events from an event handler.
 */
export class AddinEventHandlerInstance {

  /**
   * An event that emits when a new add-in event has occurred.
   */
  public addinEvent: EventEmitter<AddinEvent>;
}
