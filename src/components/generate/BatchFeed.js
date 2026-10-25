'use client';

import { BatchRow } from './BatchRow';
import { EmptyState } from './EmptyState';
import { ErrorRow } from './ErrorRow';
import { PendingRow } from './PendingRow';

/** @import { Batch, Generation } from '@/lib/types' */
/** @import { GenerateState } from '@/hooks/useGenerate' */
/** @import { TileAction } from '@/components/shared/MediaTile' */

/**
 * Newest first: the in-flight (or failed) run sits on top where its results will land.
 * @param {{
 *   batches: Batch[],
 *   generation: GenerateState,
 *   highlightedId: string | null,
 *   favorites: Set<string>,
 *   upscaled: Set<string>,
 *   onOpen: (id: string) => void,
 *   onAction: (action: TileAction, item: Generation) => void,
 *   onCopyPrompt: (batch: Batch) => void,
 *   onReuse: (batch: Batch) => void,
 *   onHide: (id: string) => void,
 *   onRetry: () => void,
 *   onDismissError: () => void,
 *   onPickPrompt: (prompt: string) => void,
 * }} props
 */
export function BatchFeed({
  batches,
  generation,
  highlightedId,
  favorites,
  upscaled,
  onOpen,
  onAction,
  onCopyPrompt,
  onReuse,
  onHide,
  onRetry,
  onDismissError,
  onPickPrompt,
}) {
  if (batches.length === 0 && generation.status === 'idle') {
    return <EmptyState onPickPrompt={onPickPrompt} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {generation.status === 'generating' && (
        <PendingRow key={generation.pending.id} pending={generation.pending} />
      )}
      {generation.status === 'error' && (
        <ErrorRow
          error={generation.error}
          request={generation.request}
          onRetry={onRetry}
          onDismiss={onDismissError}
        />
      )}
      {batches.map((batch, index) => (
        <BatchRow
          key={batch.id}
          batch={batch}
          highlighted={batch.id === highlightedId}
          // The first two batches are above the fold on desktop; either can hold the LCP.
          eager={index < 2}
          prioritize={index === 0}
          favorites={favorites}
          upscaled={upscaled}
          onOpen={onOpen}
          onAction={onAction}
          onCopyPrompt={onCopyPrompt}
          onReuse={onReuse}
          onHide={onHide}
        />
      ))}
    </div>
  );
}
