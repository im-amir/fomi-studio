'use client';

import { useEffect, useState } from 'react';

const EPSILON_PX = 2;

/**
 * Tracks whether a horizontal scroller can scroll further left/right, to show
 * edge fades and arrow buttons only when they mean something.
 * @param {React.RefObject<HTMLElement | null>} ref
 * @param {unknown} contentKey  changes when the content changes (e.g. item count)
 */
export function useScrollEdges(ref, contentKey) {
  const [edges, setEdges] = useState({ start: false, end: false });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = element;
      const start = scrollLeft > EPSILON_PX;
      const end = scrollLeft + clientWidth < scrollWidth - EPSILON_PX;
      setEdges((current) =>
        current.start === start && current.end === end ? current : { start, end },
      );
    };
    update();
    element.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      element.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [ref, contentKey]);

  return edges;
}
