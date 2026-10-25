'use client';

import Image from 'next/image';
import { Heart, PackageCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/format';
import { squareCrop } from '@/lib/media';

/** @import { Generation } from '@/lib/types' */

/**
 * The keepers, across every branch, in the order they were picked — the end of the
 * loop. Clicking one jumps to it on the canvas; Export hands them off with their recipes.
 * @param {{
 *   items: Generation[],
 *   selectedImageId: string | null,
 *   onSelect: (id: string) => void,
 *   onUnpick: (id: string) => void,
 *   onExport: () => void,
 *   className?: string,
 * }} props
 */
export function SelectsTray({ items, selectedImageId, onSelect, onUnpick, onExport, className }) {
  return (
    <section
      aria-labelledby="selects-title"
      className={cn(
        'flex items-center gap-4 rounded-panel border border-line bg-surface p-3',
        className,
      )}
    >
      <h2
        id="selects-title"
        className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-ink-900"
      >
        <Heart aria-hidden="true" className="size-4 fill-accent-600 text-accent-600" />
        Selects
        <span className="font-normal text-ink-500 tabular-nums">{items.length}</span>
      </h2>

      {items.length === 0 ? (
        <p className="flex-1 text-sm text-ink-500">Press P on an image to keep it here.</p>
      ) : (
        <ul className="flex min-w-0 flex-1 [scrollbar-width:none] gap-2 overflow-x-auto p-1">
          {items.map((item) => (
            <li key={item.id} className="group relative shrink-0 animate-pop-in">
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-label={`Go to pick: ${item.alt}`}
                className={cn(
                  'relative block size-14 overflow-hidden rounded-chip bg-panel-strong focus-ring',
                  item.id === selectedImageId &&
                    'shadow-[0_0_0_2px_var(--color-surface),0_0_0_4px_var(--color-accent-600)]',
                )}
              >
                <Image
                  src={squareCrop(item.src)}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </button>
              <button
                type="button"
                onClick={() => onUnpick(item.id)}
                aria-label="Remove from selects"
                className="absolute -top-1.5 -right-1.5 inline-flex size-5 items-center justify-center rounded-full bg-ink-900 text-canvas opacity-0 focus-ring transition-opacity duration-fast group-focus-within:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100"
              >
                <X aria-hidden="true" className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Button
        size="sm"
        variant="secondary"
        disabled={items.length === 0}
        onClick={onExport}
        icon={<PackageCheck className="size-4" />}
      >
        Export
      </Button>
    </section>
  );
}
