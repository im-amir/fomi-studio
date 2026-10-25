'use client';

import { useSyncExternalStore } from 'react';

const TICK_MS = 60_000;
/** @type {Set<() => void>} */
const listeners = new Set();
let now = 0;
/** @type {ReturnType<typeof setInterval> | null} */
let timer = null;

/** @param {() => void} onChange */
function subscribe(onChange) {
  listeners.add(onChange);
  if (!timer) {
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((listener) => listener());
    }, TICK_MS);
  }
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function getSnapshot() {
  if (!now) now = Date.now();
  return now;
}

/**
 * Current time for relative labels ("3 hr. ago"), shared by every subscriber and refreshed
 * each minute. Returns null during SSR/hydration so server and client markup match.
 * @returns {number | null}
 */
export function useNow() {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
