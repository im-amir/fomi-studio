'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** @import { Batch } from '@/lib/types' */

const HIGHLIGHT_MS = 1400;

/**
 * The batches on the canvas (newest first) plus per-item marks. The canvas is a working
 * set: hiding a batch here doesn't delete it from history.
 * @param {Batch[]} initialBatches
 */
export function useCanvasFeed(initialBatches) {
  const [batches, setBatches] = useState(initialBatches);
  // Batches in the first server render are painted immediately (no fade), so they count
  // for LCP; only results that arrive later animate in.
  const [initialIds] = useState(() => new Set(initialBatches.map((batch) => batch.id)));
  const [favorites, setFavorites] = useState(() => new Set(/** @type {string[]} */ ([])));
  const [upscaled, setUpscaled] = useState(() => new Set(/** @type {string[]} */ ([])));
  const [highlightedId, setHighlightedId] = useState(/** @type {string | null} */ (null));
  /** @type {React.RefObject<ReturnType<typeof setTimeout> | null>} */
  const highlightTimer = useRef(null);

  useEffect(
    () => () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    },
    [],
  );

  const highlight = useCallback(
    /** @param {string} id */ (id) => {
      setHighlightedId(id);
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
      highlightTimer.current = setTimeout(() => setHighlightedId(null), HIGHLIGHT_MS);
    },
    [],
  );

  const add = useCallback(
    /** @param {Batch} batch */ (batch) => {
      setBatches((current) => [batch, ...current.filter((item) => item.id !== batch.id)]);
    },
    [],
  );

  /** Brings a batch onto the canvas (if needed) and flags it so the UI can scroll to it. */
  const show = useCallback(
    /** @param {Batch} batch */ (batch) => {
      setBatches((current) =>
        current.some((item) => item.id === batch.id) ? current : [batch, ...current],
      );
      highlight(batch.id);
    },
    [highlight],
  );

  const remove = useCallback(
    /** @param {string} id */ (id) => {
      setBatches((current) => current.filter((item) => item.id !== id));
    },
    [],
  );

  const toggleFavorite = useCallback(
    /** @param {string} id */ (id) => {
      setFavorites((current) => {
        const next = new Set(current);
        if (!next.delete(id)) next.add(id);
        return next;
      });
    },
    [],
  );

  const markUpscaled = useCallback(
    /** @param {string} id */ (id) => {
      setUpscaled((current) => new Set(current).add(id));
    },
    [],
  );

  return {
    batches,
    initialIds,
    favorites,
    upscaled,
    highlightedId,
    add,
    show,
    remove,
    toggleFavorite,
    markUpscaled,
  };
}
