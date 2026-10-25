'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { useModalDialog } from '@/hooks/useModalDialog';
import { getModel } from '@/data/models';
import { useNow } from '@/hooks/useNow';
import { formatRelativeTime } from '@/lib/format';

/** @import { Batch } from '@/lib/types' */

/**
 * Everything generated before, paginated through /api/history. Opened from
 * "History · View all" and the Gallery link. Code-split like the viewer.
 * @param {{
 *   items: Batch[],
 *   hasMore: boolean,
 *   loading: boolean,
 *   failed: boolean,
 *   onLoadMore: () => void,
 *   onSelect: (batch: Batch) => void,
 *   onClose: () => void,
 * }} props
 */
export default function HistoryDialog({
  items,
  hasMore,
  loading,
  failed,
  onLoadMore,
  onSelect,
  onClose,
}) {
  const { dialogRef, close } = useModalDialog(onClose);
  const now = useNow();

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="history-title"
      onClick={(event) => event.target === event.currentTarget && close()}
      className="m-auto max-h-[min(48rem,calc(100dvh-2rem))] w-[min(64rem,calc(100vw-2rem))] animate-pop-in rounded-panel bg-canvas p-0 text-ink-900 shadow-lg backdrop:bg-scrim"
    >
      <div className="flex max-h-[inherit] flex-col">
        <header className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 id="history-title" className="font-display text-xl">
              History
            </h2>
            <p className="text-sm text-ink-500">Open any past run on the canvas.</p>
          </div>
          <IconButton label="Close history" onClick={close} tooltipSide="bottom">
            <X />
          </IconButton>
        </header>

        <div className="overflow-y-auto p-6">
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((batch) => {
              const cover = batch.items[0];
              return (
                <li key={batch.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(batch)}
                    className="group w-full rounded-media text-left focus-ring"
                  >
                    <span className="relative block aspect-square overflow-hidden rounded-media bg-panel-strong">
                      <Image
                        src={
                          batch.mode === 'video' ? /** @type {string} */ (cover.poster) : cover.src
                        }
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 15rem, 45vw"
                        placeholder={cover.blurDataURL ? 'blur' : 'empty'}
                        blurDataURL={cover.blurDataURL}
                        className="object-cover transition-[scale] duration-slow group-hover:scale-[1.03]"
                      />
                      <span className="absolute right-2 bottom-2 rounded-full bg-ink-900/70 px-2 py-0.5 text-2xs font-medium text-white">
                        {batch.items.length} {batch.mode === 'video' ? 'clips' : 'images'}
                      </span>
                    </span>
                    <span className="mt-2 line-clamp-2 text-sm text-ink-900">{batch.prompt}</span>
                    <span className="mt-0.5 block text-xs text-ink-500">
                      {getModel(batch.model)?.name}
                      {now && ` · ${formatRelativeTime(batch.createdAt, now)}`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex flex-col items-center gap-2">
            {failed && (
              <p role="alert" className="text-sm text-danger">
                Couldn’t load more history.
              </p>
            )}
            {hasMore ? (
              <Button variant="secondary" loading={loading} onClick={onLoadMore}>
                {failed ? 'Try again' : 'Load more'}
              </Button>
            ) : (
              <p className="text-sm text-ink-500">That’s everything.</p>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
