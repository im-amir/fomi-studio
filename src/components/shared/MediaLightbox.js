'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight, Download, Heart, ImageUpscale, Shuffle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { useModalDialog } from '@/hooks/useModalDialog';
import { getModel } from '@/data/models';
import { cn } from '@/lib/format';
import { MetadataList } from './MetadataList';

/** @import { Generation } from '@/lib/types' */
/** @import { TileAction } from './MediaTile' */

/**
 * Full-size viewer on a native modal <dialog>: the browser traps focus, closes on Escape
 * and returns focus to the tile that opened it. ← / → step through results.
 * Loaded with next/dynamic — nobody needs it until they click a result.
 *
 * @param {{
 *   items: Generation[],
 *   index: number,
 *   favorites: Set<string>,
 *   upscaled: Set<string>,
 *   onIndexChange: (index: number) => void,
 *   onClose: () => void,
 *   onAction: (action: TileAction, item: Generation) => void,
 * }} props
 */
export default function MediaLightbox({
  items,
  index,
  favorites,
  upscaled,
  onIndexChange,
  onClose,
  onAction,
}) {
  const { dialogRef, close } = useModalDialog(onClose);
  const item = items[index];
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;

  if (!item) return null;
  const isVideo = item.type === 'video';
  const favorite = favorites.has(item.id);

  /** @param {React.KeyboardEvent} event */
  const handleKeyDown = (event) => {
    if (event.target instanceof HTMLVideoElement) return;
    if (event.key === 'ArrowLeft' && hasPrev) onIndexChange(index - 1);
    if (event.key === 'ArrowRight' && hasNext) onIndexChange(index + 1);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label={`Viewer: ${item.alt}`}
      onKeyDown={handleKeyDown}
      className="m-0 size-full max-h-none max-w-none animate-fade-in bg-canvas p-0 text-ink-900 backdrop:bg-scrim"
    >
      <div className="grid h-full grid-rows-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-1">
        <div className="relative flex min-h-0 items-center justify-center p-4 lg:p-10">
          <div
            key={item.id}
            className="relative max-h-full w-full animate-pop-in overflow-hidden rounded-media bg-panel-strong shadow-lg"
            style={{
              aspectRatio: `${item.width} / ${item.height}`,
              maxWidth: `calc((100dvh - 5rem) * ${item.width / item.height})`,
            }}
          >
            {isVideo ? (
              <video
                src={item.src}
                poster={item.poster}
                controls
                autoPlay
                muted
                loop
                playsInline
                className="size-full object-cover"
              />
            ) : (
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 70vw, 100vw"
                placeholder={item.blurDataURL ? 'blur' : 'empty'}
                blurDataURL={item.blurDataURL}
                className="object-cover"
              />
            )}
          </div>

          <IconButton
            label="Previous result"
            variant="secondary"
            disabled={!hasPrev}
            onClick={() => onIndexChange(index - 1)}
            className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full"
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            label="Next result"
            variant="secondary"
            disabled={!hasNext}
            onClick={() => onIndexChange(index + 1)}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full"
          >
            <ChevronRight />
          </IconButton>
        </div>

        <aside className="flex min-h-0 flex-col gap-5 overflow-y-auto border-line bg-surface p-5 max-lg:border-t lg:border-l">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-500 tabular-nums" aria-live="polite">
              {index + 1} / {items.length}
            </p>
            <IconButton label="Close viewer" onClick={close} tooltipSide="bottom">
              <X />
            </IconButton>
          </div>

          <p className="text-base text-ink-900">{item.prompt}</p>

          <MetadataList
            entries={[
              ['Model', getModel(item.model)?.name ?? item.model],
              [
                'Seed',
                <span key="seed" className="font-mono">
                  {item.seed}
                </span>,
              ],
              ['Size', `${item.width} × ${item.height}${upscaled.has(item.id) ? ' → 2×' : ''}`],
              ['Aspect ratio', item.aspectRatio],
            ]}
          />

          <div className="mt-auto grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              icon={
                <Heart className={cn('size-4', favorite && 'fill-accent-600 text-accent-600')} />
              }
              aria-pressed={favorite}
              onClick={() => onAction('favorite', item)}
            >
              {favorite ? 'Favourited' : 'Favourite'}
            </Button>
            <Button
              variant="secondary"
              icon={<Download className="size-4" />}
              onClick={() => onAction('download', item)}
            >
              Download
            </Button>
            {!isVideo && (
              <Button
                variant="secondary"
                icon={<ImageUpscale className="size-4" />}
                disabled={upscaled.has(item.id)}
                onClick={() => onAction('upscale', item)}
              >
                {upscaled.has(item.id) ? 'Upscaled' : 'Upscale 2×'}
              </Button>
            )}
            <Button
              icon={<Shuffle className="size-4" />}
              className={cn(isVideo && 'col-span-2')}
              onClick={() => {
                onAction('variations', item);
                close();
              }}
            >
              More like this
            </Button>
          </div>
        </aside>
      </div>
    </dialog>
  );
}
