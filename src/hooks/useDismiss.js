'use client';

import { useEffect, useEffectEvent } from 'react';

/**
 * Closes a popover on Escape or on a pointer press outside `refs`.
 * @param {boolean} open
 * @param {React.RefObject<HTMLElement | null>[]} refs  elements that count as "inside"
 * @param {(reason: 'escape' | 'outside') => void} onDismiss
 */
export function useDismiss(open, refs, onDismiss) {
  const handlePointerDown = useEffectEvent(
    /** @param {PointerEvent} event */ (event) => {
      const target = /** @type {Node} */ (event.target);
      if (refs.some((ref) => ref.current?.contains(target))) return;
      onDismiss('outside');
    },
  );

  const handleKeyDown = useEffectEvent(
    /** @param {KeyboardEvent} event */ (event) => {
      if (event.key !== 'Escape') return;
      // preventDefault too: inside a modal <dialog>, Escape's default action closes the
      // whole dialog, not just this popover.
      event.preventDefault();
      event.stopPropagation();
      onDismiss('escape');
    },
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);
}
