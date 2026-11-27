import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { Dialog } from '../components/ui/Dialog';
import {
  FOCUSABLE_SELECTOR,
  getFocusableElements,
  getNextTrappedElement,
  handleDialogKeyDown,
  setupDialogFocusAndScrollLock,
} from './dialogFocus';

registerHooks({
  load(url, context, nextLoad) {
    if (/\.(jpe?g|png|webp|svg|gif|avif|ico)$/i.test(url)) {
      return {
        format: 'module',
        shortCircuit: true,
        source: 'export default "/assets/sample.jpg";',
      };
    }
    return nextLoad(url, context);
  },
});

/**
 * Test suite validating real Dialog component rendering, focus trap handlers,
 * computed-style focusable visibility filtering, scroll-lock lifecycle, and
 * SubmitGamePage accessibility wiring (DEF-12 & NEW-04).
 */

test('Dialog component renders role="dialog", aria-modal, matching aria-labelledby/describedby, and omits DOM when closed', () => {
  const closedMarkup = renderToStaticMarkup(
    React.createElement(Dialog, {
      open: false,
      onClose: () => {},
      title: 'Hidden Modal',
      description: 'Should not render',
      children: React.createElement('button', { type: 'button' }, 'Action'),
    })
  );
  assert.equal(closedMarkup, '');

  const withDescMarkup = renderToStaticMarkup(
    React.createElement(Dialog, {
      open: true,
      onClose: () => {},
      title: 'Report Content Issue',
      description: 'Reports remain in local browser memory only.',
      children: React.createElement('button', { type: 'button' }, 'Submit'),
    })
  );
  assert.ok(withDescMarkup.includes('role="dialog"'));
  assert.ok(withDescMarkup.includes('aria-modal="true"'));
  assert.ok(withDescMarkup.includes('tabindex="-1"') || withDescMarkup.includes('tabIndex="-1"'));
  assert.ok(withDescMarkup.includes('aria-label="Close dialog"'));

  const labelledByMatch = /aria-labelledby="([^"]+)"/.exec(withDescMarkup);
  assert.ok(labelledByMatch, 'Dialog must define aria-labelledby');
  assert.ok(
    withDescMarkup.includes(`<h2 id="${labelledByMatch[1]}"`),
    'Dialog heading id must match aria-labelledby'
  );

  const describedByMatch = /aria-describedby="([^"]+)"/.exec(withDescMarkup);
  assert.ok(describedByMatch, 'Dialog with description must define aria-describedby');
  assert.ok(
    withDescMarkup.includes(`<p id="${describedByMatch[1]}"`),
    'Dialog description id must match aria-describedby'
  );

  const withoutDescMarkup = renderToStaticMarkup(
    React.createElement(Dialog, {
      open: true,
      onClose: () => {},
      title: 'Screenshot Lightbox',
      children: React.createElement('p', null, 'Preview image'),
    })
  );
  assert.ok(/aria-labelledby="([^"]+)"/.test(withoutDescMarkup));
  assert.equal(withoutDescMarkup.includes('aria-describedby='), false);
});

test('getFocusableElements filters by computed styles, ancestor hidden/inert attributes, and zero-size layout', () => {
  interface MockElementSpec {
    id: string;
    hidden?: boolean;
    ariaHidden?: string | null;
    inert?: boolean;
    hasHiddenAncestor?: boolean;
    inlineDisplay?: string;
    inlineVisibility?: string;
    computedDisplay?: string;
    computedVisibility?: string;
    offsetParent?: object | null;
    offsetWidth?: number;
    offsetHeight?: number;
  }

  const makeMockElement = (spec: MockElementSpec) => {
    const el = {
      id: spec.id,
      style: {
        display: spec.inlineDisplay ?? '',
        visibility: spec.inlineVisibility ?? '',
      },
      offsetParent: spec.offsetParent === undefined ? {} : spec.offsetParent,
      offsetWidth: spec.offsetWidth ?? 100,
      offsetHeight: spec.offsetHeight ?? 32,
      ownerDocument: {
        defaultView: {
          getComputedStyle: () => ({
            display: spec.computedDisplay ?? 'block',
            visibility: spec.computedVisibility ?? 'visible',
          }),
        },
      },
      hasAttribute: (attr: string) =>
        (attr === 'hidden' && Boolean(spec.hidden)) ||
        (attr === 'inert' && Boolean(spec.inert)),
      getAttribute: (attr: string) =>
        attr === 'aria-hidden' ? (spec.ariaHidden ?? null) : null,
      closest: (selector: string) =>
        spec.hasHiddenAncestor && selector.includes('[hidden]') ? {} : null,
    };
    return el as unknown as HTMLElement;
  };

  const visibleBtn = makeMockElement({ id: 'visible-btn' });
  const fixedVisibleBtn = makeMockElement({
    id: 'fixed-visible-btn',
    offsetParent: null,
    offsetWidth: 80,
    offsetHeight: 32,
  });
  const computedDisplayNoneBtn = makeMockElement({
    id: 'computed-none-btn',
    inlineDisplay: '',
    computedDisplay: 'none',
  });
  const computedVisibilityHiddenBtn = makeMockElement({
    id: 'computed-hidden-btn',
    inlineVisibility: '',
    computedVisibility: 'hidden',
  });
  const hiddenAttrBtn = makeMockElement({ id: 'hidden-attr-btn', hidden: true });
  const ariaHiddenBtn = makeMockElement({ id: 'aria-hidden-btn', ariaHidden: 'true' });
  const inertBtn = makeMockElement({ id: 'inert-btn', inert: true });
  const ancestorHiddenBtn = makeMockElement({ id: 'ancestor-hidden-btn', hasHiddenAncestor: true });
  const zeroSizeDetachedBtn = makeMockElement({
    id: 'zero-size-btn',
    offsetParent: null,
    offsetWidth: 0,
    offsetHeight: 0,
  });

  const container = {
    querySelectorAll: () => [
      visibleBtn,
      fixedVisibleBtn,
      computedDisplayNoneBtn,
      computedVisibilityHiddenBtn,
      hiddenAttrBtn,
      ariaHiddenBtn,
      inertBtn,
      ancestorHiddenBtn,
      zeroSizeDetachedBtn,
    ],
  } as unknown as HTMLElement;

  const result = getFocusableElements(container);
  assert.deepEqual(
    result.map((el) => el.id),
    ['visible-btn', 'fixed-visible-btn']
  );
  assert.deepEqual(getFocusableElements(null), []);
});

test('getNextTrappedElement enforces forward, backward, outside, container, single, and empty boundaries', () => {
  const btnClose = { id: 'btn-close' } as HTMLElement;
  const input = { id: 'input' } as HTMLElement;
  const btnSubmit = { id: 'btn-submit' } as HTMLElement;
  const children = [btnClose, input, btnSubmit];

  const container = {
    id: 'container',
    contains: (target: unknown) => children.includes(target as HTMLElement) || target === container,
  } as unknown as HTMLElement;

  const outsideNode = { id: 'outside-node' } as HTMLElement;

  assert.equal(getNextTrappedElement(children, btnSubmit, false, container), btnClose);
  assert.equal(getNextTrappedElement(children, btnClose, true, container), btnSubmit);
  assert.equal(getNextTrappedElement(children, container, false, container), btnClose);
  assert.equal(getNextTrappedElement(children, container, true, container), btnSubmit);
  assert.equal(getNextTrappedElement(children, outsideNode, false, container), btnClose);
  assert.equal(getNextTrappedElement(children, outsideNode, true, container), btnSubmit);
  assert.equal(getNextTrappedElement(children, null, false, container), btnClose);
  assert.equal(getNextTrappedElement(children, null, true, container), btnSubmit);
  assert.equal(getNextTrappedElement(children, btnClose, false, container), null);

  // Single focusable element wraps back to itself in both directions
  assert.equal(getNextTrappedElement([btnClose], btnClose, false, container), btnClose);
  assert.equal(getNextTrappedElement([btnClose], btnClose, true, container), btnClose);

  // Empty focusables list targets container itself
  assert.equal(getNextTrappedElement([], null, false, container), container);
  assert.equal(getNextTrappedElement([], null, true, container), container);
});

test('handleDialogKeyDown handles Escape, Tab/Shift+Tab wrapping, intermediate Tab, and zero-focusables', () => {
  const focusCalls: string[] = [];
  const makeFocusable = (id: string) =>
    ({
      id,
      style: { display: '', visibility: '' },
      hasAttribute: () => false,
      getAttribute: () => null,
      focus: () => {
        focusCalls.push(id);
      },
    }) as unknown as HTMLElement;

  const first = makeFocusable('first');
  const middle = makeFocusable('middle');
  const last = makeFocusable('last');
  let items = [first, middle, last];

  const dialogEl = {
    id: 'dialog-root',
    focus: () => {
      focusCalls.push('dialog-root');
    },
    contains: (target: unknown) => items.includes(target as HTMLElement) || target === dialogEl,
    querySelectorAll: () => items,
  } as unknown as HTMLElement;

  let closedCount = 0;
  let preventedCount = 0;
  const createKeyEvent = (key: string, shiftKey = false) => ({
    key,
    shiftKey,
    preventDefault: () => {
      preventedCount += 1;
    },
  });

  // Non-navigation key is ignored
  assert.equal(
    handleDialogKeyDown(createKeyEvent('Enter'), dialogEl, () => {
      closedCount += 1;
    }),
    false
  );
  assert.equal(closedCount, 0);
  assert.equal(preventedCount, 0);

  // Escape prevents default and calls onClose
  assert.equal(
    handleDialogKeyDown(createKeyEvent('Escape'), dialogEl, () => {
      closedCount += 1;
    }),
    true
  );
  assert.equal(closedCount, 1);
  assert.equal(preventedCount, 1);

  // Forward Tab on last element wraps to first
  assert.equal(
    handleDialogKeyDown(createKeyEvent('Tab', false), dialogEl, () => {}, last),
    true
  );
  assert.deepEqual(focusCalls, ['first']);
  assert.equal(preventedCount, 2);

  // Backward Shift+Tab on first element wraps to last
  assert.equal(
    handleDialogKeyDown(createKeyEvent('Tab', true), dialogEl, () => {}, first),
    true
  );
  assert.deepEqual(focusCalls, ['first', 'last']);
  assert.equal(preventedCount, 3);

  // Intermediate Tab allows browser native traversal
  assert.equal(
    handleDialogKeyDown(createKeyEvent('Tab', false), dialogEl, () => {}, first),
    false
  );
  assert.equal(preventedCount, 3);

  // Zero focusables falls back to dialog container
  items = [];
  assert.equal(
    handleDialogKeyDown(createKeyEvent('Tab', false), dialogEl, () => {}, dialogEl),
    true
  );
  assert.deepEqual(focusCalls, ['first', 'last', 'dialog-root']);
  assert.equal(preventedCount, 4);
});

test('setupDialogFocusAndScrollLock locks scroll, moves initial focus, and restores trigger focus safely', () => {
  const focusLog: string[] = [];
  const triggerBtn = {
    id: 'trigger-btn',
    focus: () => focusLog.push('trigger-btn'),
  } as unknown as HTMLElement;
  const closeBtn = {
    id: 'close-btn',
    style: { display: '', visibility: '' },
    hasAttribute: () => false,
    getAttribute: () => null,
    focus: () => focusLog.push('close-btn'),
  } as unknown as HTMLElement;

  let focusables = [closeBtn];
  const dialogEl = {
    id: 'dialog-root',
    focus: () => focusLog.push('dialog-root'),
    querySelectorAll: () => focusables,
  } as unknown as HTMLElement;

  let triggerContained = true;
  const mockDoc = {
    activeElement: triggerBtn,
    body: { style: { overflow: 'auto' } },
    contains: (el: unknown) => (el === triggerBtn ? triggerContained : false),
  } as unknown as Document;

  const rafState: { cb: FrameRequestCallback | null; canceledId: number | null } = {
    cb: null,
    canceledId: null,
  };

  const cleanup = setupDialogFocusAndScrollLock(
    { current: dialogEl },
    mockDoc,
    (cb) => {
      rafState.cb = cb;
      return 42;
    },
    (id) => {
      rafState.canceledId = id;
    }
  );

  assert.equal(mockDoc.body.style.overflow, 'hidden');
  assert.ok(rafState.cb !== null);
  rafState.cb(0);
  assert.deepEqual(focusLog, ['close-btn']);

  cleanup();
  assert.equal(rafState.canceledId, 42);
  assert.equal(mockDoc.body.style.overflow, 'auto');
  assert.deepEqual(focusLog, ['close-btn', 'trigger-btn']);

  // Zero focusables falls back to dialog container and skips detached trigger restoration
  focusables = [];
  triggerContained = false;
  focusLog.length = 0;

  const cleanupDetached = setupDialogFocusAndScrollLock(
    { current: dialogEl },
    mockDoc,
    (cb) => {
      cb(0);
      return 77;
    },
    () => {}
  );
  assert.deepEqual(focusLog, ['dialog-root']);
  cleanupDetached();
  assert.deepEqual(focusLog, ['dialog-root']);
});

test('FOCUSABLE_SELECTOR excludes hidden inputs, disabled controls, and aria-hidden elements', () => {
  assert.ok(FOCUSABLE_SELECTOR.includes('button:not([disabled])'));
  assert.ok(FOCUSABLE_SELECTOR.includes('input:not([type="hidden"])'));
  assert.ok(FOCUSABLE_SELECTOR.includes('[tabindex]:not([tabindex="-1"])'));
  assert.ok(FOCUSABLE_SELECTOR.includes(':not([aria-hidden="true"])'));
});

test('NEW-04 regression: SubmitGamePage wires aria-invalid on all validated inputs including sub-cover', async () => {
  const { PrototypeStoreProvider } = await import('../context/PrototypeStoreContext');
  const { SubmitGamePage } = await import('../pages/SubmitGamePage');

  const markup = renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(
        PrototypeStoreProvider,
        null,
        React.createElement(SubmitGamePage)
      )
    )
  );

  for (const fieldId of ['sub-title', 'sub-short', 'sub-desc', 'sub-year', 'sub-itch', 'sub-trailer', 'sub-cover', 'sub-rights']) {
    const tagMatch = new RegExp(`<[^>]*id="${fieldId}"[^>]*>`).exec(markup);
    assert.ok(tagMatch, `Expected form field #${fieldId} in SubmitGamePage markup`);
    assert.ok(
      tagMatch[0].includes('aria-invalid="false"'),
      `Field #${fieldId} must expose aria-invalid attribute (found: ${tagMatch[0]})`
    );
  }
});
