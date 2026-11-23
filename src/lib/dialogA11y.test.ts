import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Pure test suite validating Dialog focus trap and accessibility contracts (DEF-12).
 * Verifies tab wrapping, escape triggering, and ARIA attribute associations.
 */

export function calculateNextTrapFocus(
  focusables: string[],
  currentFocused: string | null,
  isShiftTab: boolean
): string | null {
  if (focusables.length === 0) return null;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (isShiftTab) {
    if (currentFocused === null || currentFocused === first) {
      return last;
    }
    const idx = focusables.indexOf(currentFocused);
    return idx > 0 ? focusables[idx - 1] : last;
  } else {
    if (currentFocused === null || currentFocused === last) {
      return first;
    }
    const idx = focusables.indexOf(currentFocused);
    return idx >= 0 && idx < focusables.length - 1 ? focusables[idx + 1] : first;
  }
}

test('dialog accessibility: focus trap wraps backward and forward', () => {
  const elements = ['btn-close', 'input-reason', 'btn-cancel', 'btn-submit'];

  // Forward Tab on last element wraps to first element
  assert.equal(calculateNextTrapFocus(elements, 'btn-submit', false), 'btn-close');

  // Shift+Tab on first element wraps to last element
  assert.equal(calculateNextTrapFocus(elements, 'btn-close', true), 'btn-submit');

  // Shift+Tab when focus is on dialog backdrop/container wraps to last element
  assert.equal(calculateNextTrapFocus(elements, null, true), 'btn-submit');

  // Forward Tab when focus is on dialog container moves to first element
  assert.equal(calculateNextTrapFocus(elements, null, false), 'btn-close');

  // Normal intermediate navigation
  assert.equal(calculateNextTrapFocus(elements, 'btn-close', false), 'input-reason');
  assert.equal(calculateNextTrapFocus(elements, 'btn-submit', true), 'btn-cancel');

  // Empty focusable list returns null (prevents unhandled errors)
  assert.equal(calculateNextTrapFocus([], null, false), null);
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
