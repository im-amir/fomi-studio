'use client';

import { useEffect, useEffectEvent } from 'react';
import { isApplePlatform } from '@/lib/platform';

/**
 * @typedef {Record<string, (event: KeyboardEvent) => void>} HotkeyMap
 * Keys are combos like "mod+enter", "escape", "arrowleft", "shift+/".
 * "mod" is ⌘ on Apple platforms and Ctrl elsewhere.
 */

/** @param {EventTarget | null} target */
function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

/**
 * @param {string} combo
 * @param {KeyboardEvent} event
 * @param {boolean} apple
 */
function matches(combo, event, apple) {
  const parts = combo.toLowerCase().split('+');
  const key = parts.pop();
  const wantsMod = parts.includes('mod');
  const mod = apple ? event.metaKey : event.ctrlKey;
  return (
    event.key.toLowerCase() === key &&
    mod === wantsMod &&
    event.shiftKey === parts.includes('shift') &&
    event.altKey === parts.includes('alt')
  );
}

/**
 * Global keyboard shortcuts. Plain-key shortcuts are ignored while typing so they never
 * steal characters; combos with "mod" and Escape still work inside fields.
 * @param {HotkeyMap} bindings
 * @param {{ enabled?: boolean }} [options]
 */
export function useHotkeys(bindings, { enabled = true } = {}) {
  const onKeyDown = useEffectEvent(
    /** @param {KeyboardEvent} event */ (event) => {
      // A focused widget (listbox, radio group…) already handled this key.
      if (event.defaultPrevented) return;
      const apple = isApplePlatform();
      for (const [combo, handler] of Object.entries(bindings)) {
        if (!matches(combo, event, apple)) continue;
        const worksWhileTyping = combo.includes('mod') || combo === 'escape';
        if (isTypingTarget(event.target) && !worksWhileTyping) return;
        event.preventDefault();
        handler(event);
        return;
      }
    },
  );

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
