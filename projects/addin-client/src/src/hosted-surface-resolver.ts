import {
  AddinClientReadyArgs,
  AddinModalStyle,
  AddinType,
} from '@blackbaud/sky-addin-client';

export type HostedSurfaceTreatment =
  | 'container'
  | 'full-page'
  | 'modal'
  | 'preserve';

export type HostedSurfaceBackdrop = 'normal' | 'preserve' | 'transparent';

export interface HostedSurfaceModalState {
  readonly fullPageModalOpen: boolean;
  readonly modalDepth: number;
  readonly modalOpen: boolean;
}

export interface HostedSurfaceResolverInput {
  readonly addinType: AddinType | undefined;
  readonly modalState: HostedSurfaceModalState;
  readonly readyArgs: AddinClientReadyArgs;
}

export interface HostedSurfaceResolution {
  readonly backdrop: HostedSurfaceBackdrop;
  readonly inferredModalStyle?: AddinModalStyle;
  /**
   * Whether the controller may override a historical consumer's `display:none` backdrop
   * styling. This is a distinct policy axis from `backdrop` (which governs color/opacity):
   * automatic modal treatment is currently the only path that owns display, but display
   * ownership and backdrop color ownership are independent and may diverge for future
   * treatments.
   */
  readonly restoreBackdropDisplay: boolean;
  readonly treatment: HostedSurfaceTreatment;
}

/**
 * Modal depth at which a legacy/older host's backdrop is treated as opaque ("normal")
 * rather than transparent, since a nested modal stacked atop another modal already has
 * an intervening backdrop providing contrast.
 */
const NESTED_MODAL_BACKDROP_DEPTH = 2;

function resolveModalBackdrop(
  modalDepth: number,
  forceNormal: boolean,
): HostedSurfaceBackdrop {
  return forceNormal || modalDepth >= NESTED_MODAL_BACKDROP_DEPTH
    ? 'normal'
    : 'transparent';
}

/**
 * Canonical treatment for every `AddinType` a compatible host may report, excluding
 * `'modal'` (which requires additional context such as `fullPage` and modal depth and is
 * handled separately). Declaring this as `Readonly<Record<AddinType, ...>>` forces any
 * future `AddinType` addition to be given an explicit mapping at compile time.
 */
const CANONICAL_ADDIN_TYPE_TREATMENT: Readonly<
  Record<AddinType, HostedSurfaceTreatment>
> = {
  'action-button': 'preserve',
  box: 'container',
  button: 'preserve',
  dataset: 'preserve',
  flyout: 'container',
  generic: 'preserve',
  modal: 'modal',
  page: 'preserve',
  tab: 'preserve',
  tile: 'container',
  'vertical-tab': 'preserve',
};

function modalResolution(
  compatibleHost: boolean,
  modalDepth: number,
): HostedSurfaceResolution {
  return {
    backdrop: resolveModalBackdrop(modalDepth, compatibleHost),
    inferredModalStyle: compatibleHost
      ? {
          hostOverlay: false,
          transparentBackground: true,
        }
      : { transparentBackground: true },
    restoreBackdropDisplay: true,
    treatment: 'modal',
  };
}

export function resolveHostedSurface(
  input: HostedSurfaceResolverInput,
): HostedSurfaceResolution {
  const { addinType, modalState, readyArgs } = input;
  const style = readyArgs.modalConfig?.style;

  if (style !== undefined) {
    const explicitOlderHostFallback =
      addinType === undefined &&
      style.hostOverlay === false &&
      style.transparentBackground === true;

    return {
      backdrop: explicitOlderHostFallback
        ? resolveModalBackdrop(modalState.modalDepth, false)
        : 'preserve',
      restoreBackdropDisplay: false,
      treatment: 'preserve',
    };
  }

  if (addinType !== undefined) {
    if (addinType === 'modal') {
      return readyArgs.modalConfig?.fullPage === true
        ? {
            backdrop: 'preserve',
            restoreBackdropDisplay: false,
            treatment: 'full-page',
          }
        : modalResolution(true, modalState.modalDepth);
    }

    return {
      backdrop: 'preserve',
      restoreBackdropDisplay: false,
      treatment: CANONICAL_ADDIN_TYPE_TREATMENT[addinType],
    };
  }

  if (readyArgs.modalConfig !== undefined) {
    return readyArgs.modalConfig.fullPage === true
      ? {
          backdrop: 'preserve',
          restoreBackdropDisplay: false,
          treatment: 'full-page',
        }
      : modalResolution(false, modalState.modalDepth);
  }

  if (
    readyArgs.boxConfig !== undefined ||
    readyArgs.tileConfig !== undefined
  ) {
    return {
      backdrop: 'preserve',
      restoreBackdropDisplay: false,
      treatment: 'container',
    };
  }

  if (
    readyArgs.tabConfig !== undefined ||
    readyArgs.buttonConfig !== undefined ||
    readyArgs.actionButtonConfig !== undefined
  ) {
    return {
      backdrop: 'preserve',
      restoreBackdropDisplay: false,
      treatment: 'preserve',
    };
  }

  if (modalState.fullPageModalOpen) {
    return {
      backdrop: 'preserve',
      restoreBackdropDisplay: false,
      treatment: 'full-page',
    };
  }

  if (modalState.modalOpen) {
    return modalResolution(false, modalState.modalDepth);
  }

  return {
    backdrop: 'preserve',
    restoreBackdropDisplay: false,
    treatment: 'container',
  };
}

export function withInferredModalStyle(
  readyArgs: AddinClientReadyArgs,
  style: AddinModalStyle | undefined,
): AddinClientReadyArgs {
  if (style === undefined) {
    return readyArgs;
  }

  return {
    ...readyArgs,
    modalConfig: {
      ...readyArgs.modalConfig,
      style,
    },
  };
}
