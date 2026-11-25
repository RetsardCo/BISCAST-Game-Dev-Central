/**
 * Accessibility and keyboard focus trapping helpers for modal dialogs (DEF-12 & NEW-04).
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
 * Respects computed styles (display: none / visibility: hidden) and ancestor hidden/inert state.
 */
export function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  const elements = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return elements.filter((el) => {
    if (
      el.hasAttribute('hidden') ||
      el.getAttribute('aria-hidden') === 'true' ||
      el.hasAttribute('inert')
    ) {
      return false;
    }

    if (
      typeof el.closest === 'function' &&
      el.closest('[hidden], [aria-hidden="true"], [inert]')
    ) {
      return false;
    }

    const win = el.ownerDocument?.defaultView ?? (typeof window !== 'undefined' ? window : null);
    if (win && typeof win.getComputedStyle === 'function') {
      const computed = win.getComputedStyle(el);
      if (computed.display === 'none' || computed.visibility === 'hidden') {
        return false;
      }
    } else if (el.style?.display === 'none' || el.style?.visibility === 'hidden') {
      return false;
    }

    // Filter out zero-size hidden elements (while allowing position: fixed elements with non-zero box)
    if (typeof el.offsetParent !== 'undefined' && typeof el.offsetWidth !== 'undefined') {
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

  const isOutside = container ? !container.contains(activeElement) : false;
  const isContainer = activeElement === container;

  if (isShiftTab) {
    if (activeElement === first || isContainer || isOutside) {
      return last;
    }
    return null;
  }

  if (activeElement === last || isContainer || isOutside) {
    return first;
  }
  return null;
}

/**
 * Keyboard handler wired directly into Dialog.tsx for Escape dismissal and Tab trapping.
 * Returns true if the event was handled and default browser handling was prevented.
 */
export function handleDialogKeyDown(
  event: Pick<KeyboardEvent, 'key' | 'shiftKey' | 'preventDefault'>,
  dialogEl: HTMLElement | null,
  onClose: () => void,
  activeElement?: Element | null
): boolean {
  if (event.key === 'Escape') {
    event.preventDefault();
    onClose();
    return true;
  }

  if (event.key === 'Tab') {
    if (!dialogEl) return false;
    const focusables = getFocusableElements(dialogEl);

    if (focusables.length === 0) {
      event.preventDefault();
      dialogEl.focus();
      return true;
    }

    const currentActive =
      activeElement !== undefined
        ? activeElement
        : typeof document !== 'undefined'
          ? document.activeElement
          : null;

    const nextTarget = getNextTrappedElement(
      focusables,
      currentActive,
      event.shiftKey,
      dialogEl
    );

    if (nextTarget) {
      event.preventDefault();
      nextTarget.focus();
      return true;
    }
  }

  return false;
}

/**
 * Lifecycle helper wired into Dialog.tsx to lock background scroll, place initial focus inside
 * the dialog, and restore scroll + trigger focus safely on close/unmount.
 */
export function setupDialogFocusAndScrollLock(
  dialogRef: { current: HTMLElement | null },
  doc: Document = document,
  scheduleFrame: (cb: FrameRequestCallback) => number = requestAnimationFrame,
  cancelFrame: (id: number) => void = cancelAnimationFrame
): () => void {
  const triggerEl = doc.activeElement as HTMLElement | null;
  const originalOverflow = doc.body.style.overflow;
  doc.body.style.overflow = 'hidden';

  const rafId = scheduleFrame(() => {
    if (!dialogRef.current) return;
    const focusables = getFocusableElements(dialogRef.current);
    if (focusables.length > 0) {
      focusables[0].focus();
    } else {
      dialogRef.current.focus();
    }
  });

  return () => {
    cancelFrame(rafId);
    doc.body.style.overflow = originalOverflow;
    if (triggerEl && typeof triggerEl.focus === 'function') {
      if (doc.contains(triggerEl)) {
        triggerEl.focus();
      }
    }
  };
}
