'use client';

import { memo, useRef, useState } from 'react';
import Image from 'next/image';
import { Download, Expand, Heart, ImageUpscale, Shuffle } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { cn, formatDuration } from '@/lib/format';
import styles from './MediaTile.module.css';

/** @import { Generation } from '@/lib/types' */
/** @typedef {'download' | 'upscale' | 'variations' | 'favorite'} TileAction */

/**
 * One generated image or video. Memoised with primitive/stable props so a new batch
 * arriving doesn't re-render the tiles already on screen.
 *
 * The "open" button covers the tile and is the grid's roving focus target; the quick
 * actions are mouse shortcuts (tabIndex -1) — every one of them is also in the viewer.
 *
 * `reveal` fades media in once loaded (new results); it's off for media in the first
 * paint, because an image at opacity 0 doesn't count as painted for LCP.
 *
 * @param {{
 *   item: Generation,
 *   index: number,
 *   sizes: string,
 *   eager?: boolean,
 *   reveal?: boolean,
 *   highPriority?: boolean,
 *   favorite: boolean,
 *   upscaled: boolean,
 *   tabIndex: number,
 *   onOpen: (id: string) => void,
 *   onAction: (action: TileAction, item: Generation) => void,
 * }} props
 */
function MediaTileComponent({
  item,
  index,
  sizes,
  eager = false,
  reveal = true,
  highPriority = false,
  favorite,
  upscaled,
  tabIndex,
  onOpen,
  onAction,
}) {
  const [loaded, setLoaded] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  /** @type {React.RefObject<HTMLVideoElement | null>} */
  const videoRef = useRef(null);
  const isVideo = item.type === 'video';

  const playPreview = () => {
    videoRef.current?.play().catch(() => {});
  };
  const stopPreview = () => {
    videoRef.current?.pause();
  };

  return (
    <div
      className={cn(
        styles.tile,
        'group @container relative overflow-hidden rounded-media bg-panel-strong',
      )}
      style={
        /** @type {React.CSSProperties} */ ({
          aspectRatio: `${item.width} / ${item.height}`,
          '--i': index,
        })
      }
      onPointerEnter={isVideo ? playPreview : undefined}
      onPointerLeave={isVideo ? stopPreview : undefined}
    >
      {item.blurDataURL && (
        <div
          aria-hidden="true"
          className={styles.preview}
          style={{ backgroundImage: `url(${item.blurDataURL})` }}
        />
      )}

      <button
        type="button"
        data-tile
        tabIndex={tabIndex}
        aria-label={`Open ${isVideo ? 'video' : 'image'}: ${item.alt}`}
        onClick={() => onOpen(item.id)}
        onFocus={isVideo ? playPreview : undefined}
        onBlur={isVideo ? stopPreview : undefined}
        className="absolute inset-0 block size-full cursor-zoom-in rounded-media focus-ring"
      >
        <Image
          src={isVideo ? /** @type {string} */ (item.poster) : item.src}
          alt=""
          fill
          sizes={sizes}
          // Which tile is the LCP depends on viewport size, so eager + high priority
          // beats preloading one specific image (Next 16 guidance).
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={highPriority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          className={cn(reveal && styles.media, reveal && loaded && styles.loaded, 'object-cover')}
        />
        {isVideo && (
          <video
            ref={videoRef}
            src={item.src}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            onPlaying={() => setPreviewing(true)}
            onPause={() => setPreviewing(false)}
            className={cn(
              'absolute inset-0 size-full object-cover transition-opacity duration-base',
              previewing ? 'opacity-100' : 'opacity-0',
            )}
          />
        )}
      </button>

      <div className="pointer-events-none absolute top-2 left-2 flex gap-1.5">
        {isVideo && item.duration !== undefined && (
          <span className="rounded-full bg-ink-900/70 px-2 py-0.5 text-2xs font-medium text-white tabular-nums backdrop-blur-sm">
            {formatDuration(item.duration)}
          </span>
        )}
        {upscaled && (
          <span className="rounded-full bg-surface/90 px-2 py-0.5 text-2xs font-semibold text-ink-900">
            2×
          </span>
        )}
      </div>

      <div
        className={cn(
          styles.scrim,
          'pointer-events-none absolute inset-0 flex items-end justify-between p-2 opacity-0 transition-opacity duration-base group-focus-within:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100',
        )}
      >
        <IconButton
          label={favorite ? 'Remove from favourites' : 'Add to favourites'}
          variant="overlay"
          size="sm"
          tabIndex={-1}
          pressed={favorite}
          className="pointer-events-auto"
          onClick={() => onAction('favorite', item)}
        >
          <Heart className={cn(favorite && 'fill-accent-600 text-accent-600')} />
        </IconButton>
        <div className="pointer-events-auto flex gap-1.5">
          {/* Narrow tiles keep only favourite + open; everything else is in the viewer. */}
          <div className="flex gap-1.5 @max-[11rem]:hidden">
            <IconButton
              label="Download"
              variant="overlay"
              size="sm"
              tabIndex={-1}
              onClick={() => onAction('download', item)}
            >
              <Download />
            </IconButton>
            {!isVideo && (
              <IconButton
                label={upscaled ? 'Already upscaled' : 'Upscale 2×'}
                variant="overlay"
                size="sm"
                tabIndex={-1}
                disabled={upscaled}
                onClick={() => onAction('upscale', item)}
              >
                <ImageUpscale />
              </IconButton>
            )}
            <IconButton
              label="More like this"
              variant="overlay"
              size="sm"
              tabIndex={-1}
              onClick={() => onAction('variations', item)}
            >
              <Shuffle />
            </IconButton>
          </div>
          <IconButton
            label="Open"
            variant="overlay"
            size="sm"
            tabIndex={-1}
            onClick={() => onOpen(item.id)}
          >
            <Expand />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

export const MediaTile = memo(MediaTileComponent);
