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
  readonly restoreBackdropDisplay: boolean;
  readonly treatment: HostedSurfaceTreatment;
}

function modalResolution(
  compatibleHost: boolean,
  modalDepth: number,
): HostedSurfaceResolution {
  return {
    backdrop: compatibleHost || modalDepth >= 2 ? 'normal' : 'transparent',
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
        ? modalState.modalDepth >= 2
          ? 'normal'
          : 'transparent'
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
      treatment:
        addinType === 'box' ||
        addinType === 'tile' ||
        addinType === 'flyout'
          ? 'container'
          : 'preserve',
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
