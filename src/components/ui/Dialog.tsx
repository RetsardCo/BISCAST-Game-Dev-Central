import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { getFocusableElements, getNextTrappedElement } from '../../lib/dialogFocus';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Dialog({ open, onClose, title, description, children }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  // Scroll lock, initial focus, and focus restoration
  useEffect(() => {
    if (!open) return;

    // Capture triggering element for focus restoration upon close
    triggerRef.current = document.activeElement as HTMLElement | null;

    // Lock background body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move initial focus into dialog
    const rafId = requestAnimationFrame(() => {
      if (!dialogRef.current) return;
      const focusables = getFocusableElements(dialogRef.current);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        dialogRef.current.focus();
      }
    });

    return () => {
      cancelAnimationFrame(rafId);
      document.body.style.overflow = originalOverflow;
      if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
        if (document.contains(triggerRef.current)) {
          triggerRef.current.focus();
        }
      }
    };
  }, [open]);

  // Focus trap and Escape key listener
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        if (!dialogRef.current) return;
        const focusables = getFocusableElements(dialogRef.current);

        if (focusables.length === 0) {
          event.preventDefault();
          dialogRef.current.focus();
          return;
        }

        const nextTarget = getNextTrappedElement(
          focusables,
          document.activeElement,
          event.shiftKey,
          dialogRef.current
        );

        if (nextTarget) {
          event.preventDefault();
          nextTarget.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className="w-full max-w-lg rounded-xl border border-[#2E2E42] bg-[#111118] p-6 text-[#F8F8FA] outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#242433] pb-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-[#F8F8FA]">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1 text-sm text-[#B8B8CA]">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#B8B8CA] hover:bg-[#181822] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
