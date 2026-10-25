'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/format';

const OPEN_DELAY_MS = 350;

const SIDES = {
  top: 'bottom-full mb-2 origin-bottom',
  bottom: 'top-full mt-2 origin-top',
};

const ALIGNS = {
  center: 'left-1/2 -translate-x-1/2',
  start: 'left-0',
  end: 'right-0',
};

/**
 * Hover/focus hint. Opens after a short delay on hover (so sweeping the cursor across a
 * toolbar doesn't flash tooltips), immediately on keyboard focus, and closes on Escape
 * (WCAG 1.4.13). Pass `id` and point the trigger's aria-describedby at it when the
 * tooltip adds information beyond the trigger's own label.
 *
 * @param {{
 *   content: React.ReactNode,
 *   children: React.ReactNode,
 *   side?: keyof typeof SIDES,
 *   align?: keyof typeof ALIGNS,
 *   id?: string,
 *   className?: string,
 * }} props
 */
export function Tooltip({ content, children, side = 'top', align = 'center', id, className }) {
  const [open, setOpen] = useState(false);
  /** @type {React.RefObject<ReturnType<typeof setTimeout> | null>} */
  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };
  const show = (delay = 0) => {
    clearTimer();
    timerRef.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    clearTimer();
    setOpen(false);
  };

  useEffect(() => clearTimer, []);

  useEffect(() => {
    if (!open) return;
    /** @param {KeyboardEvent} event */
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <span
      className={cn('relative inline-flex', className)}
      onPointerEnter={(event) => event.pointerType === 'mouse' && show(OPEN_DELAY_MS)}
      onPointerLeave={hide}
      onFocus={(event) => event.target.matches(':focus-visible') && show()}
      onBlur={hide}
      onPointerDown={hide}
    >
      {children}
      <span
        id={id}
        role={id ? 'tooltip' : undefined}
        aria-hidden={id ? undefined : true}
        className={cn(
          'pointer-events-none absolute z-50 w-max max-w-64 rounded-chip bg-ink-900 px-2.5 py-1.5 text-xs font-medium text-canvas shadow-md',
          'transition-[opacity,scale,visibility] duration-fast',
          SIDES[side],
          ALIGNS[align],
          open ? 'scale-100 opacity-100' : 'invisible scale-95 opacity-0',
        )}
      >
        {content}
      </span>
    </span>
  );
}
