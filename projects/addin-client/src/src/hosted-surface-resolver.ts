import {
  AddinClientReadyArgs,
  AddinModalStyle,
  AddinType,
} from '@blackbaud/sky-addin-client';

import { AddinClientHostedSurfaceMode } from './addin-client-config.service';

export type HostedSurfaceTreatment =
  'container' | 'full-page' | 'modal' | 'preserve';

export type HostedSurfaceBackdrop = 'normal' | 'preserve' | 'transparent';

export interface HostedSurfaceModalState {
  readonly fullPageModalOpen: boolean;
  readonly modalDepth: number;
  readonly modalOpen: boolean;
}

export interface HostedSurfaceResolverInput {
  /**
   * The add-in type reported by the host. The vanilla client passes `undefined` both for
   * an older host that omits the type and for a type it doesn't recognize, so either host
   * is resolved as an older host.
   */
  readonly addinType: AddinType | undefined;
  readonly modalState: HostedSurfaceModalState;
  /**
   * The mode the add-in requested. `'preserve'` and `'container'` replace the resolved
   * treatment; `'automatic'` or `undefined` resolves one.
   */
  readonly mode?: AddinClientHostedSurfaceMode;
  readonly readyArgs: AddinClientReadyArgs;
}

export interface HostedSurfaceResolution {
  readonly backdrop: HostedSurfaceBackdrop;
  /**
   * Modal style to send to the vanilla client's `ready()`. Set only when the treatment
   * can't change after `ready()`: the vanilla client applies it as inline `!important`
   * declarations that the controller can't undo when live modal state changes.
   */
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
 * Canonical treatment for every `AddinType`, whether a compatible host reports it or it is
 * inferred from `ready()`. `'modal'` is resolved separately because it also depends on
 * `fullPage`, modal depth, and whether the host reports types. Declaring this as
 * `Readonly<Record<AddinType, ...>>` forces any future `AddinType` addition to be given an
 * explicit mapping at compile time.
 *
 * SKY UX boxes, tiles, and flyouts give their content the container background, so add-ins
 * in them get it too. SKY UX tabs don't, so tab content shows whatever is behind the tabset,
 * usually the page, and a tab add-in keeps its own page background.
 */
const CANONICAL_ADDIN_TYPE_TREATMENT: Readonly<
  Record<AddinType, HostedSurfaceTreatment>
> = {
  'action-button': 'preserve',
  box: 'container',
  button: 'preserve',
  dataset: 'preserve',
  flyout: 'container',
  generic: 'container',
  modal: 'modal',
  page: 'preserve',
  tab: 'preserve',
  tile: 'container',
  'vertical-tab-form': 'container',
};

/**
 * The `ready()` configuration fields that identify an add-in type when the host does not
 * report one, in precedence order. An inferred type is resolved exactly like a reported
 * one, so the two paths cannot drift apart.
 */
const READY_ARGS_ADDIN_TYPES: ReadonlyArray<
  readonly [keyof AddinClientReadyArgs, AddinType]
> = [
  ['modalConfig', 'modal'],
  ['boxConfig', 'box'],
  ['tabConfig', 'tab'],
  ['tileConfig', 'tile'],
  ['buttonConfig', 'button'],
  ['actionButtonConfig', 'action-button'],
];

/**
 * The type an add-in is treated as when neither the host nor `ready()` identifies it. It is
 * the type a host reports when a host component does not specify one.
 */
const UNIDENTIFIED_ADDIN_TYPE: AddinType = 'generic';

const FULL_PAGE_RESOLUTION: HostedSurfaceResolution = {
  backdrop: 'preserve',
  restoreBackdropDisplay: false,
  treatment: 'full-page',
};

function inferAddinType(
  readyArgs: AddinClientReadyArgs,
): AddinType | undefined {
  return READY_ARGS_ADDIN_TYPES.find(
    ([field]) => readyArgs[field] !== undefined,
  )?.[1];
}

/**
 * Resolves the treatment for an add-in type, whether the host reported it or it was
 * inferred from `ready()`. Only modal treatment depends on whether the host reports types,
 * because only such a host honors `hostOverlay`.
 */
function resolveAddinType(
  addinType: AddinType,
  readyArgs: AddinClientReadyArgs,
  modalDepth: number,
  hostReportsType: boolean,
): HostedSurfaceResolution {
  if (addinType === 'modal') {
    return readyArgs.modalConfig?.fullPage === true
      ? FULL_PAGE_RESOLUTION
      : modalResolution(hostReportsType, modalDepth);
  }

  return {
    backdrop: 'preserve',
    restoreBackdropDisplay: false,
    treatment: CANONICAL_ADDIN_TYPE_TREATMENT[addinType],
  };
}

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
  const { addinType, modalState, mode, readyArgs } = input;

  // A requested treatment replaces every resolved one, including the older-host fallback
  // for an explicit modal style.
  if (mode === 'preserve' || mode === 'container') {
    return {
      backdrop: 'preserve',
      restoreBackdropDisplay: false,
      treatment: mode,
    };
  }

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
    return resolveAddinType(addinType, readyArgs, modalState.modalDepth, true);
  }

  const inferredAddinType = inferAddinType(readyArgs);

  if (inferredAddinType !== undefined) {
    return resolveAddinType(
      inferredAddinType,
      readyArgs,
      modalState.modalDepth,
      false,
    );
  }

  if (modalState.fullPageModalOpen) {
    return FULL_PAGE_RESOLUTION;
  }

  if (modalState.modalOpen) {
    // Live modal markers can change after ready(), so the controller alone owns this
    // treatment and the vanilla client receives no style.
    return {
      backdrop: resolveModalBackdrop(modalState.modalDepth, false),
      restoreBackdropDisplay: true,
      treatment: 'modal',
    };
  }

  return resolveAddinType(
    UNIDENTIFIED_ADDIN_TYPE,
    readyArgs,
    modalState.modalDepth,
    false,
  );
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
