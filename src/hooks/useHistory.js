'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchHistory, isAbortError } from '@/lib/api';

/** @import { Batch, HistoryPage } from '@/lib/types' */

/**
 * Paginated history. The first page comes from the server render (no loading flash);
 * later pages load on demand. New generations are prepended locally.
 * @param {HistoryPage} initialPage
 */
export function useHistory(initialPage) {
  const [items, setItems] = useState(initialPage.items);
  const [nextCursor, setNextCursor] = useState(initialPage.nextCursor);
  const [status, setStatus] = useState(/** @type {'idle' | 'loading' | 'error'} */ ('idle'));
  /** @type {React.RefObject<AbortController | null>} */
  const controllerRef = useRef(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const loadMore = useCallback(async () => {
    if (!nextCursor || controllerRef.current) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus('loading');
    try {
      const page = await fetchHistory({ cursor: nextCursor, signal: controller.signal });
      setItems((current) => {
        const known = new Set(current.map((batch) => batch.id));
        return [...current, ...page.items.filter((batch) => !known.has(batch.id))];
      });
      setNextCursor(page.nextCursor);
      setStatus('idle');
    } catch (error) {
      if (!isAbortError(error)) setStatus('error');
    } finally {
      controllerRef.current = null;
    }
  }, [nextCursor]);

  const prepend = useCallback(
    /** @param {Batch} batch */ (batch) => {
      setItems((current) => [batch, ...current.filter((item) => item.id !== batch.id)]);
    },
    [],
  );

  return { items, status, hasMore: nextCursor !== null, loadMore, prepend };
}
