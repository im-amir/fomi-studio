'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Subscribes to a CSS media query. Returns `serverValue` during SSR and hydration,
 * so prefer CSS for layout and use this only for behaviour that must differ.
 * @param {string} query
 * @param {boolean} [serverValue]
 */
export function useMediaQuery(query, serverValue = false) {
  const subscribe = useCallback(
    /** @param {() => void} onChange */
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
