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

/**
 * Marks the style element owned by a controller. An attribute rather than an ID, so it
 * doesn't need to be unique in the document.
 */
export const HOSTED_SURFACE_STYLE_ATTRIBUTE =
  'data-bb-skyux-addin-client-hosted-surface';

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

// SKY UX styles the body as a page; container add-ins use SKY UX's container color for
// the theme and mode on the body instead. SKY UX defines the documented theme token once
// a theme is set up, and the root-level variable covers a body without a theme.
const STYLE_TEXT = `
body.${HOSTED_SURFACE_CLASSES.container} {
  background-color: var(
    --sky-theme-color-background-container-default,
    var(--sky-background-color-container-default)
  ) !important;
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
  readonly #nonce: string | null;
  readonly #ownedClasses = new Set<string>();

  #input: ControllerInput | undefined;
  #observer: MutationObserver | undefined;
  #styleElement: HTMLStyleElement | undefined;

  /**
   * @param documentRef The add-in document.
   * @param nonce The Content Security Policy nonce for the injected style element, as
   * provided to Angular through `CSP_NONCE` or the `ngCspNonce` attribute.
   */
  constructor(documentRef: Document, nonce: string | null = null) {
    this.#document = documentRef;
    this.#nonce = nonce;
  }

  public update(
    addinType: AddinType | undefined,
    readyArgs: AddinClientReadyArgs,
  ): HostedSurfaceResolution {
    const input: ControllerInput = { addinType, readyArgs };

    this.#input = input;
    this.#observe();

    return this.#applyResolution(input);
  }

  public refresh(): void {
    if (this.#input !== undefined) {
      this.#applyResolution(this.#input);
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

  #applyResolution(input: ControllerInput): HostedSurfaceResolution {
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
    style.setAttribute(HOSTED_SURFACE_STYLE_ATTRIBUTE, '');

    if (this.#nonce) {
      style.setAttribute('nonce', this.#nonce);
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

    // The observer only watches attributes and child lists, so this is a childList record.
    return (
      this.#containsModalNode(record.addedNodes) ||
      this.#containsModalNode(record.removedNodes)
    );
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
