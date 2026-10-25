'use client';

import { memo } from 'react';
import { cn } from '@/lib/format';
import { GenerationGrid } from './GenerationGrid';
import { PromptCard } from './PromptCard';

/** @import { Batch, Generation } from '@/lib/types' */
/** @import { TileAction } from '@/components/shared/MediaTile' */

export const ROW_CLASS = 'grid gap-4 lg:grid-cols-[minmax(13rem,17.25rem)_minmax(0,1fr)]';

/**
 * @param {{
 *   batch: Batch,
 *   highlighted: boolean,
 *   eager: boolean,
 *   prioritize: boolean,
 *   favorites: Set<string>,
 *   upscaled: Set<string>,
 *   onOpen: (id: string) => void,
 *   onAction: (action: TileAction, item: Generation) => void,
 *   onCopyPrompt: (batch: Batch) => void,
 *   onReuse: (batch: Batch) => void,
 *   onHide: (id: string) => void,
 * }} props
 */
function BatchRowComponent({
  batch,
  highlighted,
  eager,
  prioritize,
  favorites,
  upscaled,
  onOpen,
  onAction,
  onCopyPrompt,
  onReuse,
  onHide,
}) {
  return (
    <section
      id={`batch-${batch.id}`}
      aria-label={`Batch: ${batch.prompt.slice(0, 60)}`}
      className={cn(
        ROW_CLASS,
        'scroll-mt-32 rounded-panel transition-shadow duration-slow',
        highlighted && 'shadow-[0_0_0_2px_var(--color-canvas),0_0_0_4px_var(--color-accent-500)]',
      )}
    >
      <PromptCard
        batch={batch}
        onCopy={() => onCopyPrompt(batch)}
        onReuse={() => onReuse(batch)}
        onHide={() => onHide(batch.id)}
      />
      <GenerationGrid
        items={batch.items}
        label={`${batch.items.length} results`}
        eager={eager}
        prioritizeFirstRow={prioritize}
        favorites={favorites}
        upscaled={upscaled}
        onOpen={onOpen}
        onAction={onAction}
      />
    </section>
  );
}

export const BatchRow = memo(BatchRowComponent);
