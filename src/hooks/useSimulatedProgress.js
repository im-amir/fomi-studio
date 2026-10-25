'use client';

import { useEffect, useState } from 'react';

const TICK_MS = 120;
const CEILING = 95;

/**
 * Estimated progress for a request that doesn't report any. Eases toward 95% around
 * `expectedMs` and never reaches 100 on its own — completion is shown by the result.
 * Keep the consumer small: it re-renders every tick.
 * @param {number | null} startedAt epoch ms, or null when idle
 * @param {number} [expectedMs]
 */
export function useSimulatedProgress(startedAt, expectedMs = 2250) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (startedAt === null) return;
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, [startedAt]);

  if (startedAt === null) return 0;
  const elapsed = Math.max(0, now - startedAt);
  return Math.round(CEILING * (1 - Math.exp((-2.2 * elapsed) / expectedMs)));
}
