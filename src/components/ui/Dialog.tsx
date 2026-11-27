import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { handleDialogKeyDown, setupDialogFocusAndScrollLock } from '../../lib/dialogFocus';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Dialog({ open, onClose, title, description, children }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  // Scroll lock, initial focus, and focus restoration
  useEffect(() => {
    if (!open) return;
    return setupDialogFocusAndScrollLock(dialogRef);
  }, [open]);

  // Focus trap and Escape key listener
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      handleDialogKeyDown(event, dialogRef.current, onClose);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
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
