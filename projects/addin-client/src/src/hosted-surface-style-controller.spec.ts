import { AddinClientReadyArgs } from '@blackbaud/sky-addin-client';
import { expect } from '@skyux-sdk/testing';

import {
  HOSTED_SURFACE_CLASSES,
  HOSTED_SURFACE_STYLE_ID,
  HostedSurfaceStyleController,
} from './hosted-surface-style-controller';

describe('HostedSurfaceStyleController', () => {
  const backdropFixtureStyleId = 'bb-skyux-addin-client-backdrop-fixture-style';
  const historicalBackdropStyleId =
    'bb-skyux-addin-client-historical-backdrop-style';
  let controller: HostedSurfaceStyleController;

  function update(
    readyArgs: AddinClientReadyArgs = {},
    addinType: Parameters<
      HostedSurfaceStyleController['update']
    >[0] = undefined,
  ) {
    return controller.update(addinType, readyArgs);
  }

  beforeEach(() => {
    controller = new HostedSurfaceStyleController(document);
  });

  afterEach(() => {
    controller.destroy();

    for (const className of Object.values(HOSTED_SURFACE_CLASSES)) {
      document.body.classList.remove(className);
    }

    document.getElementById(HOSTED_SURFACE_STYLE_ID)?.remove();
    document.getElementById(backdropFixtureStyleId)?.remove();
    document.getElementById(historicalBackdropStyleId)?.remove();
    document.body
      .querySelectorAll('sky-modal, .sky-modal-host-backdrop')
      .forEach((element) => element.remove());
    document.body.classList.remove(
      'sky-modal-body-open',
      'sky-modal-body-full-page',
    );
  });

  it('uses the container token for box, tile, flyout, and ambiguity', () => {
    for (const addinType of ['box', 'tile', 'flyout'] as const) {
      update({}, addinType);
      expect(document.body).toHaveCssClass(HOSTED_SURFACE_CLASSES.container);
    }

    update();
    expect(document.body).toHaveCssClass(HOSTED_SURFACE_CLASSES.container);
    expect(
      document.getElementById(HOSTED_SURFACE_STYLE_ID)?.textContent,
    ).toContain('--sky-color-background-container-base');
  });

  it('preserves page, full-page, and explicit style backgrounds', () => {
    update({}, 'page');
    expect(document.body).not.toHaveCssClass(HOSTED_SURFACE_CLASSES.container);

    update({ modalConfig: { fullPage: true } }, 'modal');
    expect(document.body).not.toHaveCssClass(
      HOSTED_SURFACE_CLASSES.transparent,
    );

    update({ modalConfig: { style: {} } });
    expect(document.body).not.toHaveCssClass(HOSTED_SURFACE_CLASSES.container);
  });

  it('makes automatic modal bodies transparent and restores a rendered backdrop', () => {
    update({ modalConfig: {} });

    expect(document.body).toHaveCssClass(HOSTED_SURFACE_CLASSES.transparent);
    expect(document.body).toHaveCssClass(
      HOSTED_SURFACE_CLASSES.restoreBackdrop,
    );
    expect(
      document.getElementById(HOSTED_SURFACE_STYLE_ID)?.textContent,
    ).toContain('.sky-modal-host-backdrop:not([hidden])');
  });

  it('keeps the compatible-host backdrop colored', () => {
    update({}, 'modal');

    expect(document.body).toHaveCssClass(HOSTED_SURFACE_CLASSES.transparent);
    expect(document.body).toHaveCssClass(
      HOSTED_SURFACE_CLASSES.restoreBackdrop,
    );
    expect(document.body).not.toHaveCssClass(
      HOSTED_SURFACE_CLASSES.transparentBackdrop,
    );
  });

  it('applies only the narrow backdrop fallback for explicit older-host style', () => {
    update({
      modalConfig: {
        style: {
          hostOverlay: false,
          transparentBackground: true,
        },
      },
    });

    expect(document.body).toHaveCssClass(
      HOSTED_SURFACE_CLASSES.transparentBackdrop,
    );
    expect(document.body).not.toHaveCssClass(
      HOSTED_SURFACE_CLASSES.transparent,
    );
    expect(document.body).not.toHaveCssClass(
      HOSTED_SURFACE_CLASSES.restoreBackdrop,
    );
  });

  it('keeps one older-host backdrop colorless and restores nested color', () => {
    const backdropStyle = document.createElement('style');
    backdropStyle.id = backdropFixtureStyleId;
    backdropStyle.textContent =
      '.sky-modal-host-backdrop { ' +
      'background-color: var(' +
      '--sky-override-modal-host-backdrop-color, rgb(1, 2, 3)); }';
    document.head.appendChild(backdropStyle);
    const backdrop = document.createElement('div');
    backdrop.classList.add('sky-modal-host-backdrop');
    document.body.appendChild(backdrop);

    update({ modalConfig: {} });
    expect(document.body).toHaveCssClass(
      HOSTED_SURFACE_CLASSES.transparentBackdrop,
    );
    expect(getComputedStyle(backdrop).backgroundColor).toBe('rgba(0, 0, 0, 0)');

    document.body.append(
      document.createElement('sky-modal'),
      document.createElement('sky-modal'),
    );
    document.body.classList.add('sky-modal-body-open');
    controller.refresh();

    expect(document.body).not.toHaveCssClass(
      HOSTED_SURFACE_CLASSES.transparentBackdrop,
    );
    expect(getComputedStyle(backdrop).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    );

    document.body.querySelector('sky-modal')?.remove();
    controller.refresh();

    expect(document.body).toHaveCssClass(
      HOSTED_SURFACE_CLASSES.transparentBackdrop,
    );
    expect(getComputedStyle(backdrop).backgroundColor).toBe('rgba(0, 0, 0, 0)');

    backdropStyle.remove();
  });

  it('reacts when a modal opens after ready without another update call', async () => {
    update();
    expect(document.body).toHaveCssClass(HOSTED_SURFACE_CLASSES.container);

    document.body.classList.add('sky-modal-body-open');
    document.body.appendChild(document.createElement('sky-modal'));
    await new Promise<void>((resolve) => setTimeout(resolve));

    expect(document.body).not.toHaveCssClass(HOSTED_SURFACE_CLASSES.container);
    expect(document.body).toHaveCssClass(HOSTED_SURFACE_CLASSES.transparent);
  });

  it('selects live full-page state before normal modal state', () => {
    update();
    document.body.classList.add(
      'sky-modal-body-open',
      'sky-modal-body-full-page',
    );
    document.body.appendChild(document.createElement('sky-modal'));
    controller.refresh();

    expect(document.body).not.toHaveCssClass(HOSTED_SURFACE_CLASSES.container);
    expect(document.body).not.toHaveCssClass(
      HOSTED_SURFACE_CLASSES.transparent,
    );
  });

  it('overrides historical display none only for a non-hidden automatic backdrop', () => {
    const historicalStyle = document.createElement('style');
    historicalStyle.id = historicalBackdropStyleId;
    historicalStyle.textContent = '.sky-modal-host-backdrop { display: none; }';
    document.head.appendChild(historicalStyle);
    const backdrop = document.createElement('div');
    backdrop.classList.add('sky-modal-host-backdrop');
    document.body.appendChild(backdrop);

    update({ modalConfig: {} });

    expect(getComputedStyle(backdrop).display).toBe('block');

    backdrop.hidden = true;
    expect(getComputedStyle(backdrop).display).toBe('none');

    historicalStyle.remove();
  });

  it('removes only classes and styles it owns', () => {
    document.body.classList.add(HOSTED_SURFACE_CLASSES.container);
    const unrelatedStyle = document.createElement('style');
    unrelatedStyle.id = HOSTED_SURFACE_STYLE_ID;
    unrelatedStyle.textContent = '.unrelated { color: red; }';
    document.head.appendChild(unrelatedStyle);

    update();
    const wrapperStyle = Array.from(
      document.head.querySelectorAll('style'),
    ).find((style) => style !== unrelatedStyle);

    controller.destroy();

    expect(document.body).toHaveCssClass(HOSTED_SURFACE_CLASSES.container);
    expect(unrelatedStyle.parentNode).toBe(document.head);
    expect(wrapperStyle?.parentNode).toBeNull();
  });

  it('disconnects reactive behavior on destroy', async () => {
    update();
    controller.destroy();
    document.body.classList.add('sky-modal-body-open');
    document.body.appendChild(document.createElement('sky-modal'));
    await new Promise<void>((resolve) => setTimeout(resolve));

    expect(document.body).not.toHaveCssClass(
      HOSTED_SURFACE_CLASSES.transparent,
    );
  });
});
