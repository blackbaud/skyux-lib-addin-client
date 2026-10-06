import { AddinClientReadyArgs } from '@blackbaud/sky-addin-client';
import { expect } from '@skyux-sdk/testing';

import {
  HOSTED_SURFACE_CLASSES,
  HOSTED_SURFACE_STYLE_ATTRIBUTE,
  HostedSurfaceStyleController,
} from './hosted-surface-style-controller';

describe('HostedSurfaceStyleController', () => {
  const backdropFixtureStyleId = 'bb-skyux-addin-client-backdrop-fixture-style';
  const historicalBackdropStyleId =
    'bb-skyux-addin-client-historical-backdrop-style';
  const hostedStyleSelector = `style[${HOSTED_SURFACE_STYLE_ATTRIBUTE}]`;
  let controller: HostedSurfaceStyleController;

  function hostedStyle(): HTMLStyleElement | null {
    return document.head.querySelector<HTMLStyleElement>(hostedStyleSelector);
  }

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

    document
      .querySelectorAll(hostedStyleSelector)
      .forEach((element) => element.remove());
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

  it('uses the container token for container add-in types and ambiguity', () => {
    for (const addinType of [
      'box',
      'tile',
      'flyout',
      'generic',
      'vertical-tab-form',
    ] as const) {
      update({}, addinType);
      expect(document.body).toHaveCssClass(HOSTED_SURFACE_CLASSES.container);
    }

    update({ boxConfig: {} });
    expect(document.body).toHaveCssClass(HOSTED_SURFACE_CLASSES.container);

    update();
    expect(document.body).toHaveCssClass(HOSTED_SURFACE_CLASSES.container);
    expect(hostedStyle()?.textContent).toContain(
      '--sky-theme-color-background-container-default',
    );
  });

  it('matches a SKY UX box in the body theme and mode', () => {
    const themes: Record<string, string[]> = {
      'no theme': [],
      default: ['sky-theme-default'],
      'modern light': [
        'sky-theme-modern',
        'sky-theme-brand-base',
        'sky-theme-mode-light',
      ],
      'modern dark': [
        'sky-theme-modern',
        'sky-theme-brand-base',
        'sky-theme-mode-dark',
      ],
    };
    const bodyColors: Record<string, string> = {};
    const boxColors: Record<string, string> = {};

    // Other specs may leave SKY UX theme classes on the shared body.
    const savedThemeClasses = Array.from(document.body.classList).filter(
      (className) => className.startsWith('sky-theme-'),
    );
    document.body.classList.remove(...savedThemeClasses);
    const box = document.createElement('div');
    box.classList.add('sky-box');
    document.body.appendChild(box);

    try {
      update({}, 'tile');

      for (const [label, themeClasses] of Object.entries(themes)) {
        document.body.classList.add(...themeClasses);
        document.body.getAnimations({ subtree: true }).forEach((animation) =>
          animation.finish(),
        );

        bodyColors[label] = getComputedStyle(document.body).backgroundColor;
        boxColors[label] = getComputedStyle(box).backgroundColor;

        document.body.classList.remove(...themeClasses);
      }
    } finally {
      box.remove();
      document.body.classList.add(...savedThemeClasses);
    }

    expect(bodyColors).toEqual(boxColors);
    expect(boxColors['modern dark']).not.toBe(boxColors['modern light']);
  });

  it('applies the CSP nonce to its style element', () => {
    controller.destroy();
    controller = new HostedSurfaceStyleController(document, 'test-nonce');

    update();

    expect(hostedStyle()?.nonce).toBe('test-nonce');
  });

  it('omits the nonce when none is provided', () => {
    update();

    expect(hostedStyle()?.hasAttribute('nonce')).toBeFalse();
  });

  it('preserves page, tab, full-page, and explicit style backgrounds', () => {
    update({}, 'page');
    expect(document.body).not.toHaveCssClass(HOSTED_SURFACE_CLASSES.container);

    update({}, 'tab');
    expect(document.body).not.toHaveCssClass(HOSTED_SURFACE_CLASSES.container);

    update({ tabConfig: {} });
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
    expect(hostedStyle()?.textContent).toContain(
      '.sky-modal-host-backdrop:not([hidden])',
    );
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

  it('reacts when a nested modal opens after ready without another update call', async () => {
    update();
    expect(document.body).toHaveCssClass(HOSTED_SURFACE_CLASSES.container);

    const container = document.createElement('div');
    document.body.appendChild(container);

    document.body.classList.add('sky-modal-body-open');
    container.appendChild(document.createElement('sky-modal'));
    await new Promise<void>((resolve) => setTimeout(resolve));

    expect(document.body).not.toHaveCssClass(HOSTED_SURFACE_CLASSES.container);
    expect(document.body).toHaveCssClass(HOSTED_SURFACE_CLASSES.transparent);

    container.remove();
  });

  it('refreshes when a container holding a nested modal is removed', async () => {
    const container = document.createElement('div');
    container.appendChild(document.createElement('sky-modal'));
    document.body.appendChild(container);
    update({ modalConfig: {} });
    await new Promise<void>((resolve) => setTimeout(resolve));

    const refreshSpy = spyOn(controller, 'refresh').and.callThrough();

    container.remove();
    await new Promise<void>((resolve) => setTimeout(resolve));

    expect(refreshSpy).toHaveBeenCalled();
  });

  it('refreshes when a body without a class attribute gains a modal marker', async () => {
    const savedClass = document.body.getAttribute('class');
    document.body.removeAttribute('class');

    try {
      // A Page add-in is preserved, so the controller adds no body classes and the
      // class attribute stays absent until the modal marker is added.
      update({}, 'page');
      await new Promise<void>((resolve) => setTimeout(resolve));

      const refreshSpy = spyOn(controller, 'refresh').and.callThrough();

      document.body.classList.add('sky-modal-body-open');
      await new Promise<void>((resolve) => setTimeout(resolve));

      expect(refreshSpy).toHaveBeenCalled();
    } finally {
      if (savedClass === null) {
        document.body.removeAttribute('class');
      } else {
        document.body.setAttribute('class', savedClass);
      }
    }
  });

  it('ignores text nodes added to or removed from the body', async () => {
    update();
    await new Promise<void>((resolve) => setTimeout(resolve));

    const refreshSpy = spyOn(controller, 'refresh').and.callThrough();
    const text = document.createTextNode('text');

    document.body.appendChild(text);
    text.remove();
    await new Promise<void>((resolve) => setTimeout(resolve));

    expect(refreshSpy).not.toHaveBeenCalled();
  });

  it('does not refresh for unrelated body class changes or unrelated descendant DOM churn', async () => {
    update();
    // Allow any mutation records produced by the initial update()'s own class writes
    // to flush before spying, so only mutations from *this* test are observed.
    await new Promise<void>((resolve) => setTimeout(resolve));

    const refreshSpy = spyOn(controller, 'refresh').and.callThrough();

    document.body.classList.add('some-consumer-owned-class');
    document.body.classList.remove('some-consumer-owned-class');

    const unrelatedContainer = document.createElement('div');
    const unrelatedChild = document.createElement('span');
    unrelatedContainer.appendChild(unrelatedChild);
    document.body.appendChild(unrelatedContainer);
    unrelatedContainer.remove();

    await new Promise<void>((resolve) => setTimeout(resolve));

    expect(refreshSpy).not.toHaveBeenCalled();
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
    unrelatedStyle.setAttribute(HOSTED_SURFACE_STYLE_ATTRIBUTE, '');
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
