'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/format';

const OPEN_DELAY_MS = 350;
const GAP_PX = 8;
const VIEWPORT_MARGIN_PX = 8;

/**
 * Hover/focus hint. Opens after a short delay on hover (so sweeping the cursor across a
 * toolbar doesn't flash tooltips), immediately on keyboard focus, and closes on Escape
 * (WCAG 1.4.13). Rendered in a portal with fixed positioning so scroll containers can't
 * clip it, and clamped to the viewport.
 *
 * Pass `id` and point the trigger's aria-describedby at it when the tooltip adds
 * information beyond the trigger's own label; otherwise it's hidden from assistive tech.
 *
 * @param {{
 *   content: React.ReactNode,
 *   children: React.ReactNode,
 *   side?: 'top' | 'bottom',
 *   id?: string,
 *   className?: string,
 * }} props
 */
export function Tooltip({ content, children, side = 'top', id, className }) {
  const [anchor, setAnchor] = useState(/** @type {{ x: number, y: number } | null} */ (null));
  /** @type {React.RefObject<HTMLSpanElement | null>} */
  const triggerRef = useRef(null);
  /** @type {React.RefObject<HTMLSpanElement | null>} */
  const bubbleRef = useRef(null);
  /** @type {React.RefObject<ReturnType<typeof setTimeout> | null>} */
  const timerRef = useRef(null);
  const open = anchor !== null;

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };
  const show = (delay = 0) => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setAnchor({
        x: rect.left + rect.width / 2,
        y: side === 'top' ? rect.top - GAP_PX : rect.bottom + GAP_PX,
      });
    }, delay);
  };
  const hide = () => {
    clearTimer();
    setAnchor(null);
  };

  useEffect(() => clearTimer, []);

  useEffect(() => {
    if (!open) return;
    /** @param {KeyboardEvent} event */
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setAnchor(null);
    };
    const onScroll = () => setAnchor(null);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScroll, { capture: true });
    };
  }, [open]);

  // Keep the bubble inside the viewport once its width is known.
  useLayoutEffect(() => {
    const bubble = bubbleRef.current;
    if (!bubble || !anchor) return;
    const half = bubble.offsetWidth / 2;
    const min = VIEWPORT_MARGIN_PX + half;
    const max = window.innerWidth - VIEWPORT_MARGIN_PX - half;
    bubble.style.left = `${Math.min(Math.max(anchor.x, min), max)}px`;
  }, [anchor]);

  return (
    <span
      ref={triggerRef}
      className={cn('inline-flex', className)}
      onPointerEnter={(event) => event.pointerType === 'mouse' && show(OPEN_DELAY_MS)}
      onPointerLeave={hide}
      onFocus={(event) => event.target.matches(':focus-visible') && show()}
      onBlur={hide}
      onPointerDown={hide}
    >
      {children}
      {/* Keeps aria-describedby resolvable while the visual bubble is closed. */}
      {id && !open && (
        <span id={id} className="sr-only">
          {content}
        </span>
      )}
      {open &&
        createPortal(
          <span
            ref={bubbleRef}
            id={id}
            role={id ? 'tooltip' : undefined}
            aria-hidden={id ? undefined : true}
            className={cn(
              'pointer-events-none fixed z-[70] w-max max-w-64 -translate-x-1/2 animate-pop-in rounded-chip bg-ink-900 px-2.5 py-1.5 text-xs font-medium text-canvas shadow-md',
              side === 'top' && '-translate-y-full',
            )}
            style={{ left: anchor.x, top: anchor.y }}
          >
            {content}
          </span>,
          document.body,
        )}
    </span>
  );
}
