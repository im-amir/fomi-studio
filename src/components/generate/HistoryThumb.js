'use client';

import { memo } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn, truncateWords } from '@/lib/format';

/** @import { Batch } from '@/lib/types' */

/**
 * Memoised: the strip re-renders on every history change, but each thumbnail only
 * needs to when its own batch or active state changes.
 * @param {{
 *   batch: Batch,
 *   active: boolean,
 *   tabIndex: number,
 *   onSelect: (batch: Batch) => void,
 * }} props
 */
function HistoryThumbComponent({ batch, active, tabIndex, onSelect }) {
  const cover = batch.items[0];
  const isVideo = batch.mode === 'video';
  const label = truncateWords(batch.prompt, 90);

  return (
    <Tooltip content={label} side="bottom">
      <button
        type="button"
        tabIndex={tabIndex}
        aria-label={`Open: ${label}`}
        aria-current={active || undefined}
        onClick={() => onSelect(batch)}
        className={cn(
          'relative block size-20 overflow-hidden rounded-chip bg-panel-strong focus-ring transition-[scale,box-shadow] duration-fast hover:scale-[1.04] active:scale-[0.97]',
          active && 'ring-2 ring-accent-600 ring-offset-2 ring-offset-surface',
        )}
      >
        <Image
          src={isVideo ? /** @type {string} */ (cover.poster) : cover.src}
          alt=""
          fill
          sizes="80px"
          placeholder={cover.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={cover.blurDataURL}
          className="object-cover"
        />
        {isVideo && (
          <span className="absolute right-1 bottom-1 inline-flex size-5 items-center justify-center rounded-full bg-ink-900/70 text-canvas">
            <Play aria-hidden="true" className="size-2.5 fill-current" />
          </span>
        )}
      </button>
    </Tooltip>
  );
}

export const HistoryThumb = memo(HistoryThumbComponent);
