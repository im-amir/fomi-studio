'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { useScrollEdges } from '@/hooks/useScrollEdges';
import { cn } from '@/lib/format';
import { HistoryThumb } from './HistoryThumb';

/** @import { Batch } from '@/lib/types' */

const NAV_KEYS = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];

/**
 * Recent generations. Scrolls inside itself (never the page), snaps to thumbnails and
 * is one Tab stop: arrow keys move between thumbnails.
 * @param {{
 *   items: Batch[],
 *   activeBatchId: string | null,
 *   onSelect: (batch: Batch) => void,
 *   onViewAll: () => void,
 *   className?: string,
 * }} props
 */
export function HistoryStrip({ items, activeBatchId, onSelect, onViewAll, className }) {
  /** @type {React.RefObject<HTMLUListElement | null>} */
  const scrollerRef = useRef(null);
  const edges = useScrollEdges(scrollerRef, items.length);
  const tabbableIndex = Math.max(
    0,
    items.findIndex((batch) => batch.id === activeBatchId),
  );

  /** @param {1 | -1} direction */
  const scrollByPage = (direction) => {
    const scroller = scrollerRef.current;
    scroller?.scrollBy({ left: direction * scroller.clientWidth * 0.8, behavior: 'smooth' });
  };

  /** @param {React.KeyboardEvent<HTMLUListElement>} event */
  const handleKeyDown = (event) => {
    if (!NAV_KEYS.includes(event.key)) return;
    const buttons = [...(scrollerRef.current?.querySelectorAll('button') ?? [])];
    const current = buttons.indexOf(/** @type {HTMLButtonElement} */ (document.activeElement));
    const last = buttons.length - 1;
    const next = {
      ArrowLeft: Math.max(current - 1, 0),
      ArrowRight: Math.min(current + 1, last),
      Home: 0,
      End: last,
    }[/** @type {'ArrowLeft' | 'ArrowRight' | 'Home' | 'End'} */ (event.key)];
    event.preventDefault();
    buttons[next]?.focus();
    buttons[next]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  };

  return (
    <section
      aria-label="History"
      className={cn(
        'flex items-center gap-3 rounded-panel bg-surface p-2 shadow-md md:h-26 md:gap-4 md:p-3',
        className,
      )}
    >
      <button
        type="button"
        onClick={onViewAll}
        className="flex size-16 shrink-0 flex-col items-center justify-center rounded-media border border-line bg-surface text-center focus-ring transition-[border-color,scale] duration-fast hover:border-line-strong active:scale-[0.97] md:size-20"
      >
        <span className="text-sm font-semibold text-ink-900 md:text-md">History</span>
        <span className="text-2xs text-ink-500">View all</span>
      </button>
      <span aria-hidden="true" className="h-10 w-px shrink-0 bg-line max-md:hidden" />

      <div className="relative min-w-0 flex-1">
        <ul
          ref={scrollerRef}
          onKeyDown={handleKeyDown}
          className="flex snap-x snap-mandatory scroll-px-1 [scrollbar-width:none] gap-3 overflow-x-auto overscroll-x-contain scroll-smooth p-1 md:gap-4"
        >
          {items.map((batch, index) => (
            <li key={batch.id} className="shrink-0 snap-start">
              <HistoryThumb
                batch={batch}
                active={batch.id === activeBatchId}
                tabIndex={index === tabbableIndex ? 0 : -1}
                onSelect={onSelect}
              />
            </li>
          ))}
        </ul>

        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-surface to-transparent transition-opacity duration-base',
            edges.start ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-surface to-transparent transition-opacity duration-base',
            edges.end ? 'opacity-100' : 'opacity-0',
          )}
        />
        {edges.start && (
          <IconButton
            label="Scroll history back"
            variant="secondary"
            size="sm"
            tabIndex={-1}
            className="absolute top-1/2 left-1 -translate-y-1/2 rounded-full max-lg:hidden"
            onClick={() => scrollByPage(-1)}
          >
            <ChevronLeft />
          </IconButton>
        )}
        {edges.end && (
          <IconButton
            label="Scroll history forward"
            variant="secondary"
            size="sm"
            tabIndex={-1}
            className="absolute top-1/2 right-1 -translate-y-1/2 rounded-full max-lg:hidden"
            onClick={() => scrollByPage(1)}
          >
            <ChevronRight />
          </IconButton>
        )}
      </div>
    </section>
  );
}
