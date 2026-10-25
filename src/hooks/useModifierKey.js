'use client';

import { useSyncExternalStore } from 'react';
import { isApplePlatform } from '@/lib/platform';

const noopSubscribe = () => () => {};

/**
 * "⌘" or "Ctrl" for shortcut hints. null during SSR/hydration so the hint appears
 * once the platform is known instead of flashing the wrong key.
 * @returns {'⌘' | 'Ctrl' | null}
 */
export function useModifierKey() {
  return useSyncExternalStore(
    noopSubscribe,
    () => (isApplePlatform() ? '⌘' : 'Ctrl'),
    () => null,
  );
}
