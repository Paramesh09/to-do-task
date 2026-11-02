import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function BottomSheet({ open, title, onClose, children }) {
  const titleId = useId();
  const panelRef = useRef(null);
  // kept in a ref so a new onClose on every render doesn't re-run the effect (and steal focus)
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => e.key === 'Escape' && onCloseRef.current();
    document.addEventListener('keydown', onKeyDown);

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const previouslyFocused = document.activeElement;
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-40 flex items-end justify-center md:items-center md:p-6">
      <div className="animate-fade absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="animate-sheet relative flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] outline-none md:max-w-lg md:rounded-2xl"
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line md:hidden" />
        <header className="flex items-center justify-between px-6 pt-4 pb-2">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 rounded-full p-2 text-ink transition hover:bg-brand-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </header>
        <div className="overflow-y-auto px-6 pt-2 pb-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}
