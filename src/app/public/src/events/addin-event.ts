/**
 * Contains data for an add-in event and allows you to indicate that an event
 * has been processed
 */
export class AddinEvent {

  /**
   * The data that an add-in event has returned.
   */
  public context: any;

  /**
   * A function to call indicating that the add-in event is processed.
   */
  public done?: () => void;
}
