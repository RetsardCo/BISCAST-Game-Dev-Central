/**
 * Accessibility and keyboard focus trapping helpers for modal dialogs (DEF-12).
 * Follows W3C WAI-ARIA Dialog (Modal) pattern:
 * - Initial focus placement
 * - Tab/Shift+Tab focus trapping within modal boundary
 * - Escape key dismissal
 * - Focus restoration to triggering element
 */

export const FOCUSABLE_SELECTOR = [
  'button:not([disabled]):not([aria-hidden="true"])',
  '[href]:not([aria-hidden="true"])',
  'input:not([type="hidden"]):not([disabled]):not([aria-hidden="true"])',
  'select:not([disabled]):not([aria-hidden="true"])',
  'textarea:not([disabled]):not([aria-hidden="true"])',
  '[tabindex]:not([tabindex="-1"]):not([aria-hidden="true"])',
].join(', ');

/**
 * Returns all visible, focusable HTML elements within a container element.
 */
export function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  const elements = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return elements.filter((el) => {
    // Exclude elements with display: none or hidden attribute
    if (el.hasAttribute('hidden') || el.getAttribute('aria-hidden') === 'true') {
      return false;
    }
    // Check computed or inline display if available
    if (el.style.display === 'none' || el.style.visibility === 'hidden') {
      return false;
    }
    // Filter out zero-size hidden elements unless in an unrendered test environment
    if (typeof el.offsetParent !== 'undefined' && typeof el.offsetWidth !== 'undefined') {
      // In JSDOM or detached trees offsetParent is null; allow if offsetWidth not explicitly 0 with display none
      if (el.offsetParent === null && el.offsetWidth === 0 && el.offsetHeight === 0) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Calculates the next element to focus when Tab or Shift+Tab is pressed in a modal dialog.
 * Returns the target element if a focus wrap or trap intervention is required,
 * or null if standard browser sequential focus should proceed.
 */
export function getNextTrappedElement(
  focusables: HTMLElement[],
  activeElement: Element | null,
  isShiftTab: boolean,
  container?: HTMLElement | null
): HTMLElement | null {
  if (focusables.length === 0) {
    return container ?? null;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  // If focus is currently outside the container, or on the container itself
  const isOutside = container ? !container.contains(activeElement) : false;
  const isContainer = activeElement === container;

  if (isShiftTab) {
    if (activeElement === first || isContainer || isOutside) {
      return last;
    }
    return null;
  } else {
    if (activeElement === last || isContainer || isOutside) {
      return first;
    }
    return null;
  }
}

/**
 * Pure identifier-based focus trap state resolver for unit testing and headless validation.
 */
export function calculateNextTrapFocus(
  focusables: string[],
  currentFocused: string | null,
  isShiftTab: boolean,
  containerId?: string | null
): string | null {
  if (focusables.length === 0) return containerId ?? null;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  const isOutside = currentFocused === null || (containerId ? currentFocused === containerId : false) || !focusables.includes(currentFocused);

  if (isShiftTab) {
    if (currentFocused === first || isOutside) {
      return last;
    }
    const idx = focusables.indexOf(currentFocused);
    return idx > 0 ? focusables[idx - 1] : last;
  } else {
    if (currentFocused === last || isOutside) {
      return first;
    }
    const idx = focusables.indexOf(currentFocused);
    return idx >= 0 && idx < focusables.length - 1 ? focusables[idx + 1] : first;
  }
}
