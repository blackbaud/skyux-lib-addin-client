import { AddinClientReadyArgs, AddinType } from '@blackbaud/sky-addin-client';

import { AddinClientHostedSurfaceMode } from './addin-client-config.service';
import {
  HostedSurfaceModalState,
  HostedSurfaceResolution,
  resolveHostedSurface,
  withInferredModalStyle,
} from './hosted-surface-resolver';

describe('hosted surface resolver', () => {
  const closed: HostedSurfaceModalState = {
    fullPageModalOpen: false,
    modalDepth: 0,
    modalOpen: false,
  };

  function resolve(
    addinType: AddinType | undefined,
    readyArgs: AddinClientReadyArgs = {},
    modalState: HostedSurfaceModalState = closed,
    mode?: AddinClientHostedSurfaceMode,
  ) {
    return resolveHostedSurface({ addinType, modalState, mode, readyArgs });
  }

  it('preserves every defined modal style object', () => {
    const liveModal: HostedSurfaceModalState = {
      fullPageModalOpen: false,
      modalDepth: 1,
      modalOpen: true,
    };

    for (const style of [
      {},
      { transparentBackground: true },
      { hostOverlay: false },
      { transparentBackground: false, hostOverlay: true },
    ]) {
      expect(
        resolve(undefined, { modalConfig: { style } }, liveModal).treatment,
      ).toBe('preserve');
    }
  });

  it('retains the explicit two-option fallback only for an older host', () => {
    const readyArgs: AddinClientReadyArgs = {
      modalConfig: {
        style: {
          hostOverlay: false,
          transparentBackground: true,
        },
      },
    };

    expect(resolve(undefined, readyArgs).backdrop).toBe('transparent');
    expect(
      resolve(undefined, readyArgs, {
        fullPageModalOpen: false,
        modalDepth: 2,
        modalOpen: true,
      }).backdrop,
    ).toBe('normal');
    expect(resolve('modal', readyArgs).backdrop).toBe('preserve');
  });

  it('maps authoritative compatible-host types', () => {
    expect(resolve('modal').treatment).toBe('modal');
    expect(resolve('modal').inferredModalStyle).toEqual({
      hostOverlay: false,
      transparentBackground: true,
    });
    expect(
      resolve('modal', { modalConfig: { fullPage: true } }).treatment,
    ).toBe('full-page');
    expect(resolve('page').treatment).toBe('preserve');
    expect(
      resolve(
        'page',
        { modalConfig: {} },
        {
          fullPageModalOpen: false,
          modalDepth: 1,
          modalOpen: true,
        },
      ).treatment,
    ).toBe('preserve');

    for (const type of [
      'box',
      'tile',
      'flyout',
      'generic',
      'vertical-tab-form',
    ] as const) {
      expect(resolve(type).treatment).toBe('container');
    }

    for (const type of ['action-button', 'button', 'dataset', 'tab'] as const) {
      expect(resolve(type).treatment).toBe('preserve');
    }
  });

  it('uses older-host ready fields before live modal markers', () => {
    const open: HostedSurfaceModalState = {
      fullPageModalOpen: true,
      modalDepth: 1,
      modalOpen: true,
    };

    expect(resolve(undefined, { boxConfig: {} }, open).treatment).toBe(
      'container',
    );
    expect(resolve(undefined, { tileConfig: {} }, open).treatment).toBe(
      'container',
    );

    for (const readyArgs of [
      { tabConfig: {} },
      { buttonConfig: {} },
      { actionButtonConfig: {} },
    ] as AddinClientReadyArgs[]) {
      expect(resolve(undefined, readyArgs, open).treatment).toBe('preserve');
    }
  });

  it('resolves each ready() configuration like the add-in type it identifies', () => {
    const configuredTypes = [
      [{ modalConfig: {} }, 'modal'],
      [{ boxConfig: {} }, 'box'],
      [{ tabConfig: {} }, 'tab'],
      [{ tileConfig: {} }, 'tile'],
      [{ buttonConfig: {} }, 'button'],
      [{ actionButtonConfig: {} }, 'action-button'],
    ] as ReadonlyArray<readonly [AddinClientReadyArgs, AddinType]>;

    for (const [readyArgs, addinType] of configuredTypes) {
      expect(resolve(undefined, readyArgs).treatment)
        .withContext(addinType)
        .toBe(resolve(addinType).treatment);
    }
  });

  it('treats an add-in nothing identifies like a generic add-in', () => {
    expect(resolve(undefined).treatment).toBe(resolve('generic').treatment);
  });

  it('applies a requested treatment instead of resolving one', () => {
    const liveModal: HostedSurfaceModalState = {
      fullPageModalOpen: false,
      modalDepth: 1,
      modalOpen: true,
    };
    const requested = (
      treatment: 'container' | 'preserve',
    ): HostedSurfaceResolution => ({
      backdrop: 'preserve',
      restoreBackdropDisplay: false,
      treatment,
    });

    expect(resolve('page', {}, closed, 'container')).toEqual(
      requested('container'),
    );
    expect(resolve('generic', {}, closed, 'container')).toEqual(
      requested('container'),
    );
    expect(resolve('tile', {}, closed, 'preserve')).toEqual(
      requested('preserve'),
    );
    expect(resolve(undefined, {}, liveModal, 'preserve')).toEqual(
      requested('preserve'),
    );
    expect(
      resolve(
        undefined,
        {
          modalConfig: {
            style: { hostOverlay: false, transparentBackground: true },
          },
        },
        liveModal,
        'preserve',
      ),
    ).toEqual(requested('preserve'));
  });

  it('resolves automatically when the requested mode is automatic', () => {
    expect(resolve('tile', {}, closed, 'automatic')).toEqual(resolve('tile'));
    expect(resolve('modal', {}, closed, 'automatic')).toEqual(
      resolve('modal'),
    );
  });

  it('treats older-host modal config as normal or full page', () => {
    expect(resolve(undefined, { modalConfig: {} }).inferredModalStyle).toEqual({
      transparentBackground: true,
    });
    expect(
      resolve(undefined, { modalConfig: { fullPage: true } }).treatment,
    ).toBe('full-page');
  });

  it('uses live full-page and normal modal markers for an unidentified host', () => {
    expect(
      resolve(
        undefined,
        {},
        {
          fullPageModalOpen: true,
          modalDepth: 1,
          modalOpen: true,
        },
      ).treatment,
    ).toBe('full-page');
    expect(
      resolve(
        undefined,
        {},
        {
          fullPageModalOpen: false,
          modalDepth: 1,
          modalOpen: true,
        },
      ).treatment,
    ).toBe('modal');
  });

  it('keeps live modal inference reversible by sending no modal style', () => {
    const liveModal = resolve(
      undefined,
      {},
      {
        fullPageModalOpen: false,
        modalDepth: 1,
        modalOpen: true,
      },
    );

    expect(liveModal.inferredModalStyle).toBeUndefined();
    expect(liveModal.backdrop).toBe('transparent');
    expect(liveModal.restoreBackdropDisplay).toBe(true);
  });

  it('uses container treatment for remaining older-host ambiguity', () => {
    expect(resolve(undefined).treatment).toBe('container');
  });

  it('restores old-host backdrop color at nested modal depth', () => {
    expect(
      resolve(
        undefined,
        { modalConfig: {} },
        {
          fullPageModalOpen: false,
          modalDepth: 1,
          modalOpen: true,
        },
      ).backdrop,
    ).toBe('transparent');
    expect(
      resolve(
        undefined,
        { modalConfig: {} },
        {
          fullPageModalOpen: false,
          modalDepth: 2,
          modalOpen: true,
        },
      ).backdrop,
    ).toBe('normal');
  });

  it('grants display ownership only for automatic modal treatment', () => {
    expect(resolve('modal').restoreBackdropDisplay).toBe(true);

    const explicitOlderHostFallback: AddinClientReadyArgs = {
      modalConfig: {
        style: {
          hostOverlay: false,
          transparentBackground: true,
        },
      },
    };
    expect(
      resolve(undefined, explicitOlderHostFallback).restoreBackdropDisplay,
    ).toBe(false);

    expect(resolve('box').restoreBackdropDisplay).toBe(false);
  });

  it('keeps compatible-host modal backdrop normal at every modal depth', () => {
    for (const modalDepth of [0, 1, 2, 5]) {
      expect(
        resolve(
          'modal',
          {},
          {
            fullPageModalOpen: false,
            modalDepth,
            modalOpen: modalDepth > 0,
          },
        ).backdrop,
      ).toBe('normal');
    }
  });

  it('keeps an explicit style treatment even when modalConfig.fullPage is true', () => {
    const readyArgsWithoutAddinType: AddinClientReadyArgs = {
      modalConfig: {
        fullPage: true,
        style: { transparentBackground: true },
      },
    };
    const withoutAddinType = resolve(undefined, readyArgsWithoutAddinType);
    expect(withoutAddinType.treatment).toBe('preserve');
    expect(withoutAddinType.restoreBackdropDisplay).toBe(false);

    const readyArgsWithModalAddinType: AddinClientReadyArgs = {
      modalConfig: {
        fullPage: true,
        style: { transparentBackground: true },
      },
    };
    const withModalAddinType = resolve('modal', readyArgsWithModalAddinType);
    expect(withModalAddinType.treatment).toBe('preserve');
    expect(withModalAddinType.restoreBackdropDisplay).toBe(false);
  });

  it('adds inferred style immutably and preserves pass-through identity', () => {
    const readyArgs: AddinClientReadyArgs = { showUI: true };

    expect(withInferredModalStyle(readyArgs, undefined)).toBe(readyArgs);

    const prepared = withInferredModalStyle(readyArgs, {
      hostOverlay: false,
      transparentBackground: true,
    });

    expect(prepared).not.toBe(readyArgs);
    expect(prepared.modalConfig).toEqual({
      style: {
        hostOverlay: false,
        transparentBackground: true,
      },
    });
    expect(readyArgs.modalConfig).toBeUndefined();
  });
});
