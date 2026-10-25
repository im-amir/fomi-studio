'use client';

import { createContext, use, useCallback, useEffect, useRef, useState } from 'react';
import { Check, CircleAlert } from 'lucide-react';
import { cn } from '@/lib/format';

const DEFAULT_DURATION_MS = 3200;
const MAX_VISIBLE = 3;

/** @typedef {'success' | 'error' | 'neutral'} ToastTone */
/** @typedef {{ id: number, message: string, tone: ToastTone }} Toast */
/** @typedef {(message: string, options?: { tone?: ToastTone, duration?: number }) => void} ShowToast */

/** @type {React.Context<ShowToast | null>} */
const ToastContext = createContext(/** @type {ShowToast | null} */ (null));

const ICONS = {
  success: <Check aria-hidden="true" className="size-4" />,
  error: <CircleAlert aria-hidden="true" className="size-4 text-danger" />,
  neutral: null,
};

/**
 * Lightweight confirmations for actions that have no other visible result
 * (copy, download, upscale). Announced politely to screen readers.
 * @param {{ children: React.ReactNode }} props
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState(/** @type {Toast[]} */ ([]));
  const nextId = useRef(0);
  /** @type {React.RefObject<Map<number, ReturnType<typeof setTimeout>>>} */
  const timers = useRef(new Map());

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  /** @type {ShowToast} */
  const show = useCallback((message, { tone = 'neutral', duration = DEFAULT_DURATION_MS } = {}) => {
    const id = nextId.current++;
    setToasts((current) => [...current.slice(-(MAX_VISIBLE - 1)), { id, message, tone }]);
    timers.current.set(
      id,
      setTimeout(() => {
        timers.current.delete(id);
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, duration),
    );
  }, []);

  return (
    <ToastContext value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex flex-col items-center gap-2 px-4 max-lg:bottom-28"
      >
        {toasts.map((toast) => (
          <p
            key={toast.id}
            className={cn(
              'flex animate-pop-in items-center gap-2 rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-canvas shadow-lg',
              toast.tone === 'error' && 'bg-danger-soft text-danger',
            )}
          >
            {ICONS[toast.tone]}
            {toast.message}
          </p>
        ))}
      </div>
    </ToastContext>
  );
}

export function useToast() {
  const show = use(ToastContext);
  if (!show) throw new Error('useToast must be used inside <ToastProvider>');
  return show;
}
