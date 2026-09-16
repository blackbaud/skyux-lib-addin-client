import { AddinClientReadyArgs, AddinType } from '@blackbaud/sky-addin-client';

import {
  HostedSurfaceResolution,
  resolveHostedSurface,
} from './hosted-surface-resolver';

export const HOSTED_SURFACE_CLASSES = {
  container: 'bb-skyux-addin-client-container-background',
  restoreBackdrop: 'bb-skyux-addin-client-modal-backdrop-rendered',
  transparent: 'bb-skyux-addin-client-modal-background-transparent',
  transparentBackdrop: 'bb-skyux-addin-client-modal-backdrop-transparent',
} as const;

export const HOSTED_SURFACE_STYLE_ID =
  'bb-skyux-addin-client-hosted-surface-style';

/**
 * Body classes that feed `resolveHostedSurface`'s live modal state. A mutation observer
 * refresh is only warranted when one of these markers' presence actually changes; every
 * other body class (including the controller's own {@link HOSTED_SURFACE_CLASSES}) is
 * irrelevant to resolution and must not trigger a refresh.
 */
const MODAL_MARKER_CLASSES = [
  'sky-modal-body-open',
  'sky-modal-body-full-page',
] as const;

const STYLE_TEXT = `
body.${HOSTED_SURFACE_CLASSES.container} {
  background-color: var(--sky-color-background-container-base) !important;
}

body.${HOSTED_SURFACE_CLASSES.transparent} {
  background-color: transparent !important;
}

body.${HOSTED_SURFACE_CLASSES.restoreBackdrop}
  .sky-modal-host-backdrop:not([hidden]) {
  display: block !important;
}

body.${HOSTED_SURFACE_CLASSES.transparentBackdrop}
  .sky-modal-host-backdrop {
  --sky-override-modal-host-backdrop-color: transparent;
}
`;

interface ControllerInput {
  readonly addinType: AddinType | undefined;
  readonly readyArgs: AddinClientReadyArgs;
}

export class HostedSurfaceStyleController {
  readonly #document: Document;
  readonly #ownedClasses = new Set<string>();

  #input: ControllerInput | undefined;
  #observer: MutationObserver | undefined;
  #styleElement: HTMLStyleElement | undefined;

  constructor(documentRef: Document) {
    this.#document = documentRef;
  }

  public update(
    addinType: AddinType | undefined,
    readyArgs: AddinClientReadyArgs,
  ): HostedSurfaceResolution {
    this.#input = { addinType, readyArgs };
    this.#observe();

    return this.#applyCurrentResolution();
  }

  public refresh(): void {
    if (this.#input !== undefined) {
      this.#applyCurrentResolution();
    }
  }

  public destroy(): void {
    this.#observer?.disconnect();
    this.#observer = undefined;
    this.#input = undefined;

    for (const className of this.#ownedClasses) {
      this.#document.body.classList.remove(className);
    }

    this.#ownedClasses.clear();
    this.#styleElement?.remove();
    this.#styleElement = undefined;
  }

  #applyCurrentResolution(): HostedSurfaceResolution {
    const input = this.#input;

    if (input === undefined) {
      throw new Error('Hosted surface input must be set before resolution.');
    }

    const resolution = resolveHostedSurface({
      ...input,
      modalState: {
        fullPageModalOpen: this.#document.body.classList.contains(
          'sky-modal-body-full-page',
        ),
        modalDepth: this.#document.body.querySelectorAll('sky-modal').length,
        modalOpen: this.#document.body.classList.contains(
          'sky-modal-body-open',
        ),
      },
    });

    this.#setClass(
      HOSTED_SURFACE_CLASSES.container,
      resolution.treatment === 'container',
    );
    this.#setClass(
      HOSTED_SURFACE_CLASSES.transparent,
      resolution.treatment === 'modal',
    );
    this.#setClass(
      HOSTED_SURFACE_CLASSES.restoreBackdrop,
      resolution.restoreBackdropDisplay,
    );
    this.#setClass(
      HOSTED_SURFACE_CLASSES.transparentBackdrop,
      resolution.backdrop === 'transparent',
    );

    const needsStyle =
      resolution.treatment === 'container' ||
      resolution.treatment === 'modal' ||
      resolution.restoreBackdropDisplay ||
      resolution.backdrop === 'transparent';

    if (needsStyle) {
      this.#ensureStyle();
    } else {
      this.#styleElement?.remove();
      this.#styleElement = undefined;
    }

    return resolution;
  }

  #ensureStyle(): void {
    if (this.#styleElement?.parentNode) {
      return;
    }

    const style = this.#document.createElement('style');

    if (!this.#document.getElementById(HOSTED_SURFACE_STYLE_ID)) {
      style.id = HOSTED_SURFACE_STYLE_ID;
    }

    style.textContent = STYLE_TEXT;
    this.#document.head.appendChild(style);
    this.#styleElement = style;
  }

  #observe(): void {
    if (this.#observer !== undefined) {
      return;
    }

    this.#observer = new MutationObserver((records) =>
      this.#handleMutations(records),
    );
    this.#observer.observe(this.#document.body, {
      attributeFilter: ['class'],
      attributeOldValue: true,
      attributes: true,
      childList: true,
      subtree: true,
    });
  }

  #handleMutations(records: MutationRecord[]): void {
    for (const record of records) {
      if (this.#isRelevantMutation(record)) {
        this.refresh();
        return;
      }
    }
  }

  /**
   * Only two mutation shapes can change what `resolveHostedSurface` computes:
   * - the body's own `class` attribute gaining or losing a {@link MODAL_MARKER_CLASSES}
   *   marker (checked against `oldValue`, so the controller's own class writes and
   *   unrelated consumer classes are both ignored); and
   * - a `childList` change whose added/removed node is a `sky-modal` element or contains
   *   one anywhere in its subtree (nested modals affect `modalDepth`).
   * Attribute mutations on descendants (subtree class changes) and childList changes
   * that touch unrelated DOM are deliberately excluded.
   */
  #isRelevantMutation(record: MutationRecord): boolean {
    if (record.type === 'attributes') {
      return (
        record.target === this.#document.body &&
        this.#modalMarkerPresenceChanged(record.oldValue)
      );
    }

    if (record.type === 'childList') {
      return (
        this.#containsModalNode(record.addedNodes) ||
        this.#containsModalNode(record.removedNodes)
      );
    }

    return false;
  }

  #modalMarkerPresenceChanged(oldValue: string | null): boolean {
    const previousClasses = new Set(
      (oldValue ?? '').split(/\s+/).filter((value) => value.length > 0),
    );
    const currentClasses = this.#document.body.classList;

    return MODAL_MARKER_CLASSES.some(
      (marker) => previousClasses.has(marker) !== currentClasses.contains(marker),
    );
  }

  #containsModalNode(nodes: NodeList): boolean {
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index];

      if (node.nodeType !== Node.ELEMENT_NODE) {
        continue;
      }

      const element = node as Element;

      if (element.localName === 'sky-modal' || element.querySelector('sky-modal')) {
        return true;
      }
    }

    return false;
  }

  #setClass(className: string, enabled: boolean): void {
    if (enabled) {
      if (!this.#document.body.classList.contains(className)) {
        this.#document.body.classList.add(className);
        this.#ownedClasses.add(className);
      }

      return;
    }

    if (this.#ownedClasses.delete(className)) {
      this.#document.body.classList.remove(className);
    }
  }
}
