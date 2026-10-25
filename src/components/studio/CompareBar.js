'use client';

import Image from 'next/image';
import { Columns2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Kbd } from '@/components/ui/Kbd';
import { cn } from '@/lib/format';
import { squareCrop } from '@/lib/media';
import { COMPARE_LIMIT } from './useStudio';

/** @import { Generation } from '@/lib/types' */

/**
 * Appears once something is queued for comparison (C on an image) and opens the
 * side-by-side view when there are at least two.
 * @param {{ items: Generation[], onOpen: () => void, onClear: () => void, className?: string }} props
 */
export function CompareBar({ items, onOpen, onClear, className }) {
  const ready = items.length >= 2;
  return (
    <section
      aria-label="Compare queue"
      className={cn(
        'flex animate-pop-in items-center gap-3 rounded-panel bg-ink-900 py-2 pr-2 pl-4 text-canvas shadow-lg',
        className,
      )}
    >
      <Columns2 aria-hidden="true" className="size-4 shrink-0" />
      <ul className="flex gap-1.5">
        {items.map((item, index) => (
          <li key={item.id} className="relative size-9 overflow-hidden rounded-[6px]">
            <Image
              src={squareCrop(item.src)}
              alt={`Compare ${index + 1}`}
              fill
              sizes="36px"
              className="object-cover"
            />
          </li>
        ))}
      </ul>
      <p className="min-w-0 flex-1 truncate text-sm">
        {ready
          ? `${items.length} of ${COMPARE_LIMIT} ready`
          : 'Press C on one more image to compare'}
      </p>
      <Button
        size="sm"
        variant="ghost"
        onClick={onClear}
        className="text-canvas/80 hover:bg-white/10 hover:text-canvas"
      >
        Clear
      </Button>
      <Button size="sm" disabled={!ready} onClick={onOpen} aria-keyshortcuts="Shift+C">
        Compare
        <Kbd className="ml-1 border-current/30 max-md:hidden">⇧C</Kbd>
      </Button>
    </section>
  );
}
