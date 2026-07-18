import { type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, footer, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save the previously focused element
    previouslyFocusedRef.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && contentRef.current) {
        const focusable = contentRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    // Focus first focusable element ONLY on initial open, not on re-renders
    const timer = setTimeout(() => {
      if (contentRef.current && !contentRef.current.contains(document.activeElement)) {
        const firstFocusable = contentRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }
    }, 0);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      clearTimeout(timer);
      // Restore focus to the previously focused element
      previouslyFocusedRef.current?.focus();
      previouslyFocusedRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === overlayRef.current) onClose();
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Content */}
          <motion.div
            ref={contentRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`relative z-10 w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 shadow-2xl ${className ?? ""}`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 focus:ring-2 focus:ring-slate-500 focus:outline-none"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 text-sm text-slate-300">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
