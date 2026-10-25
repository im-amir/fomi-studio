'use client';

import { memo } from 'react';
import { cn } from '@/lib/format';
import { describeRecipe } from '@/lib/recipe';
import { GenerationGrid } from './GenerationGrid';
import { PromptCard } from './PromptCard';

/** @import { Batch, Generation } from '@/lib/types' */
/** @import { TileAction } from '@/components/shared/MediaTile' */

// Card beside the images from 1280px; below that the panel leaves too little width, so
// the card sits above them (as on tablets) and the images keep a useful size.
export const ROW_CLASS = 'grid gap-4 xl:grid-cols-[minmax(13rem,17.25rem)_minmax(0,1fr)]';

/**
 * @param {{
 *   batch: Batch,
 *   highlighted: boolean,
 *   eager: boolean,
 *   reveal: boolean,
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
  reveal,
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
        prompt={batch.prompt}
        model={batch.model}
        recipe={describeRecipe({ ...batch, count: batch.items.length })}
        createdAt={batch.createdAt}
        onCopy={() => onCopyPrompt(batch)}
        onReuse={() => onReuse(batch)}
        onHide={() => onHide(batch.id)}
      />
      <GenerationGrid
        items={batch.items}
        label={`${batch.items.length} results`}
        eager={eager}
        reveal={reveal}
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
