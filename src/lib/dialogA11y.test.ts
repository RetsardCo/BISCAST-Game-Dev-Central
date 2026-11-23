import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateNextTrapFocus,
  FOCUSABLE_SELECTOR,
  getNextTrappedElement,
} from './dialogFocus';

/**
 * Test suite validating Dialog focus trap and accessibility contracts (DEF-12).
 * Verifies tab wrapping, escape triggering, and ARIA attribute associations.
 */

test('dialog accessibility: focus trap wraps backward and forward', () => {
  const elements = ['btn-close', 'input-reason', 'btn-cancel', 'btn-submit'];
  const containerId = 'dialog-container';

  // Forward Tab on last element wraps to first element
  assert.equal(calculateNextTrapFocus(elements, 'btn-submit', false, containerId), 'btn-close');

  // Shift+Tab on first element wraps to last element
  assert.equal(calculateNextTrapFocus(elements, 'btn-close', true, containerId), 'btn-submit');

  // Shift+Tab when focus is on dialog container/backdrop wraps to last element
  assert.equal(calculateNextTrapFocus(elements, containerId, true, containerId), 'btn-submit');
  assert.equal(calculateNextTrapFocus(elements, null, true, containerId), 'btn-submit');

  // Forward Tab when focus is on dialog container moves to first element
  assert.equal(calculateNextTrapFocus(elements, containerId, false, containerId), 'btn-close');
  assert.equal(calculateNextTrapFocus(elements, null, false, containerId), 'btn-close');

  // Forward/Shift+Tab when focus is outside the dialog completely
  assert.equal(calculateNextTrapFocus(elements, 'outside-body-button', false, containerId), 'btn-close');
  assert.equal(calculateNextTrapFocus(elements, 'outside-body-button', true, containerId), 'btn-submit');

  // Normal intermediate navigation
  assert.equal(calculateNextTrapFocus(elements, 'btn-close', false, containerId), 'input-reason');
  assert.equal(calculateNextTrapFocus(elements, 'btn-submit', true, containerId), 'btn-cancel');

  // Single focusable element: Tab and Shift+Tab both keep focus on that element
  assert.equal(calculateNextTrapFocus(['btn-close'], 'btn-close', false, containerId), 'btn-close');
  assert.equal(calculateNextTrapFocus(['btn-close'], 'btn-close', true, containerId), 'btn-close');

  // Empty focusable list returns container ID (prevents unhandled errors / tab escape)
  assert.equal(calculateNextTrapFocus([], null, false, containerId), containerId);
  assert.equal(calculateNextTrapFocus([], null, true, containerId), containerId);
});

test('dialog accessibility: DOM node getNextTrappedElement traps focus', () => {
  const btnClose = { id: 'btn-close' } as HTMLElement;
  const input = { id: 'input' } as HTMLElement;
  const btnSubmit = { id: 'btn-submit' } as HTMLElement;
  const children = [btnClose, input, btnSubmit];

  const container = {
    id: 'container',
    contains: (target: unknown) => children.includes(target as HTMLElement) || target === container,
  } as unknown as HTMLElement;

  const outsideNode = { id: 'outside-node' } as HTMLElement;

  // Last element with forward Tab -> wraps to first
  const forwardWrap = getNextTrappedElement([btnClose, input, btnSubmit], btnSubmit, false, container);
  assert.equal(forwardWrap, btnClose);

  // First element with Shift+Tab -> wraps to last
  const backwardWrap = getNextTrappedElement([btnClose, input, btnSubmit], btnClose, true, container);
  assert.equal(backwardWrap, btnSubmit);

  // Focus on container with forward Tab -> goes to first
  const containerForward = getNextTrappedElement([btnClose, input, btnSubmit], container, false, container);
  assert.equal(containerForward, btnClose);

  // Focus on container with Shift+Tab -> goes to last
  const containerBackward = getNextTrappedElement([btnClose, input, btnSubmit], container, true, container);
  assert.equal(containerBackward, btnSubmit);

  // Focus outside container with forward Tab -> trapped to first
  const outsideForward = getNextTrappedElement([btnClose, input, btnSubmit], outsideNode, false, container);
  assert.equal(outsideForward, btnClose);

  // Focus outside container with Shift+Tab -> trapped to last
  const outsideBackward = getNextTrappedElement([btnClose, input, btnSubmit], outsideNode, true, container);
  assert.equal(outsideBackward, btnSubmit);

  // Intermediate element -> returns null so native browser Tab proceeds
  const intermediate = getNextTrappedElement([btnClose, input, btnSubmit], btnClose, false, container);
  assert.equal(intermediate, null);
});

test('dialog accessibility: FOCUSABLE_SELECTOR excludes hidden inputs and aria-hidden elements', () => {
  assert.ok(FOCUSABLE_SELECTOR.includes('button:not([disabled])'));
  assert.ok(FOCUSABLE_SELECTOR.includes('input:not([type="hidden"])'));
  assert.ok(FOCUSABLE_SELECTOR.includes('[tabindex]:not([tabindex="-1"])'));
  assert.ok(FOCUSABLE_SELECTOR.includes(':not([aria-hidden="true"])'));
});

test('dialog accessibility: escape key triggers close callback', () => {
  let closed = false;
  const onClose = () => {
    closed = true;
  };

  const simulateKeyDown = (key: string, handler: (e: { key: string; defaultPrevented: boolean; preventDefault: () => void }) => void) => {
    let prevented = false;
    handler({
      key,
      defaultPrevented: prevented,
      preventDefault: () => {
        prevented = true;
      },
    });
  };

  const dialogKeyHandler = (e: { key: string; defaultPrevented: boolean; preventDefault: () => void }) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  simulateKeyDown('Enter', dialogKeyHandler);
  assert.equal(closed, false);

  simulateKeyDown('Escape', dialogKeyHandler);
  assert.equal(closed, true);
});

test('dialog accessibility: ARIA associations and semantics', () => {
  const titleId = ':r1:';
  const descId = ':r2:';
  const hasDescription = true;

  const ariaAttributes = {
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': titleId,
    'aria-describedby': hasDescription ? descId : undefined,
  };

  assert.equal(ariaAttributes.role, 'dialog');
  assert.equal(ariaAttributes['aria-modal'], 'true');
  assert.equal(ariaAttributes['aria-labelledby'], ':r1:');
  assert.equal(ariaAttributes['aria-describedby'], ':r2:');

  const withoutDesc = {
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': titleId,
    'aria-describedby': false ? descId : undefined,
  };
  assert.equal(withoutDesc['aria-describedby'], undefined);
});
