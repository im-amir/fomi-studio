'use client';

import { useState } from 'react';
import { MediaTile } from '@/components/shared/MediaTile';

/** @import { Generation } from '@/lib/types' */
/** @import { TileAction } from '@/components/shared/MediaTile' */

// Batches come in 1, 2, 4 or 8, so 4 columns from tablet up (2 on phones) always fill
// whole rows; 3 columns would orphan a tile. Tiles are ~1/4 of the feed, 1/2 on phones.
export const TILE_SIZES =
  '(min-width: 1536px) 15vw, (min-width: 1280px) 14vw, (min-width: 1024px) 15vw, (min-width: 768px) 22vw, 50vw';

/** Number of tiles in the first rendered row — the real column count at this width. */
function columnCount(/** @type {HTMLElement} */ grid) {
  const children = [...grid.children];
  const firstTop = /** @type {HTMLElement} */ (children[0])?.offsetTop;
  return Math.max(
    1,
    children.filter((child) => /** @type {HTMLElement} */ (child).offsetTop === firstTop).length,
  );
}

/**
 * One Tab stop per grid; arrow keys move between tiles (roving tabindex), Home/End jump.
 * @param {{
 *   items: Generation[],
 *   label: string,
 *   eager?: boolean,
 *   prioritizeFirstRow?: boolean,
 *   favorites: Set<string>,
 *   upscaled: Set<string>,
 *   onOpen: (id: string) => void,
 *   onAction: (action: TileAction, item: Generation) => void,
 * }} props
 */
export function GenerationGrid({
  items,
  label,
  eager = false,
  prioritizeFirstRow = false,
  favorites,
  upscaled,
  onOpen,
  onAction,
}) {
  const [focusIndex, setFocusIndex] = useState(0);
  const activeIndex = Math.min(focusIndex, items.length - 1);

  /** @param {React.KeyboardEvent<HTMLUListElement>} event */
  const handleKeyDown = (event) => {
    const grid = event.currentTarget;
    const columns = columnCount(grid);
    const last = items.length - 1;
    /** @type {Record<string, number>} */
    const targets = {
      ArrowLeft: activeIndex - 1,
      ArrowRight: activeIndex + 1,
      ArrowUp: activeIndex - columns,
      ArrowDown: activeIndex + columns,
      Home: 0,
      End: last,
    };
    if (!(event.key in targets)) return;
    const next = targets[event.key];
    if (next < 0 || next > last) return;
    event.preventDefault();
    setFocusIndex(next);
    const tiles = /** @type {NodeListOf<HTMLButtonElement>} */ (
      grid.querySelectorAll('button[data-tile]')
    );
    tiles.item(next)?.focus();
  };

  return (
    <ul
      aria-label={label}
      onKeyDown={handleKeyDown}
      className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
    >
      {items.map((item, index) => (
        <li key={item.id} onFocus={() => setFocusIndex(index)}>
          <MediaTile
            item={item}
            index={index}
            sizes={TILE_SIZES}
            eager={eager}
            highPriority={prioritizeFirstRow && index < 4}
            favorite={favorites.has(item.id)}
            upscaled={upscaled.has(item.id)}
            tabIndex={index === activeIndex ? 0 : -1}
            onOpen={onOpen}
            onAction={onAction}
          />
        </li>
      ))}
    </ul>
  );
}
