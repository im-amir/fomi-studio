'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Heart, Minus, Plus, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Kbd } from '@/components/ui/Kbd';
import { useModalDialog } from '@/hooks/useModalDialog';
import { cn } from '@/lib/format';
import { diffRecipe } from '@/lib/studio/recipe';

/** @import { Take } from '@/lib/studio/types' */
/** @import { Generation } from '@/lib/types' */

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const IDENTITY = { scale: 1, x: 0, y: 0 };
const GRID = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-2 xl:grid-cols-4' };

/** @param {number} value @param {number} min @param {number} max */
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Keeps the zoomed image covering its pane: at scale s the image may move at most
 * (s - 1) / 2 of its size in either direction.
 * @param {{ scale: number, x: number, y: number }} view
 */
function bounded({ scale, x, y }) {
  const limit = ((scale - 1) / 2) * 100;
  return { scale, x: clamp(x, -limit, limit), y: clamp(y, -limit, limit) };
}

/**
 * Side-by-side comparison of 2–4 results with synced zoom and pan, to pick a winner on
 * detail rather than thumbnails. The transform is stored in % of the pane, so it stays
 * in sync across panes of different pixel sizes. Each pane lists how its recipe differs
 * from the first, so you know what you're actually comparing.
 * @param {{
 *   entries: { item: Generation, take: Take, label: string }[],
 *   picks: Set<string>,
 *   onTogglePick: (id: string) => void,
 *   onRemove: (id: string) => void,
 *   onClose: () => void,
 * }} props
 */
export default function CompareView({ entries, picks, onTogglePick, onRemove, onClose }) {
  const { dialogRef, close } = useModalDialog(onClose);
  const [view, setView] = useState(IDENTITY);
  /** @type {React.RefObject<{ x: number, y: number, width: number, height: number } | null>} */
  const dragRef = useRef(null);
  const reference = entries[0];

  /** @param {number} factor @param {number} [originX] @param {number} [originY] -0.5..0.5 of the pane */
  const zoom = (factor, originX = 0, originY = 0) =>
    setView((current) => {
      const scale = clamp(current.scale * factor, MIN_SCALE, MAX_SCALE);
      const ratio = scale / current.scale;
      // Zoom towards the pointer: the point under it stays put.
      return bounded({
        scale,
        x: current.x * ratio - originX * 100 * (ratio - 1),
        y: current.y * ratio - originY * 100 * (ratio - 1),
      });
    });

  /** @param {React.WheelEvent<HTMLDivElement>} event */
  const handleWheel = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    zoom(
      event.deltaY < 0 ? 1.15 : 1 / 1.15,
      (event.clientX - rect.left) / rect.width - 0.5,
      (event.clientY - rect.top) / rect.height - 0.5,
    );
  };

  /** @param {React.PointerEvent<HTMLDivElement>} event */
  const handlePointerDown = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      width: rect.width,
      height: rect.height,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  /** @param {React.PointerEvent<HTMLDivElement>} event */
  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = ((event.clientX - drag.x) / drag.width) * 100;
    const dy = ((event.clientY - drag.y) / drag.height) * 100;
    dragRef.current = { ...drag, x: event.clientX, y: event.clientY };
    setView((current) => bounded({ ...current, x: current.x + dx, y: current.y + dy }));
  };

  /** @param {React.KeyboardEvent} event */
  const handleKeyDown = (event) => {
    if (event.key === '+' || event.key === '=') zoom(1.25);
    if (event.key === '-') zoom(1 / 1.25);
    if (event.key === '0') setView(IDENTITY);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="compare-title"
      onKeyDown={handleKeyDown}
      className="m-0 size-full max-h-none max-w-none animate-fade-in bg-canvas p-0 text-ink-900 backdrop:bg-scrim"
    >
      <div className="flex h-full flex-col gap-4 p-4 md:p-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="compare-title" className="font-display text-xl">
              Compare {entries.length}
            </h2>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-500">
              Scroll to zoom · drag to pan · double-click to reset
              <span className="inline-flex items-center gap-1 max-md:hidden">
                <Kbd>+</Kbd>
                <Kbd>−</Kbd>
                <Kbd>0</Kbd>
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <IconButton label="Zoom out" variant="secondary" onClick={() => zoom(1 / 1.25)}>
              <Minus />
            </IconButton>
            <span className="w-12 text-center text-sm text-ink-600 tabular-nums">
              {Math.round(view.scale * 100)}%
            </span>
            <IconButton label="Zoom in" variant="secondary" onClick={() => zoom(1.25)}>
              <Plus />
            </IconButton>
            <IconButton label="Reset zoom" variant="secondary" onClick={() => setView(IDENTITY)}>
              <RotateCcw />
            </IconButton>
            <IconButton label="Close compare" onClick={close}>
              <X />
            </IconButton>
          </div>
        </header>

        <ul
          className={cn(
            'grid min-h-0 flex-1 auto-rows-[minmax(16rem,1fr)] gap-4 overflow-y-auto',
            GRID[/** @type {2 | 3 | 4} */ (entries.length)],
          )}
        >
          {entries.map(({ item, take, label }, index) => {
            const changes = index === 0 ? [] : diffRecipe(reference.take.recipe, take.recipe);
            const picked = picks.has(item.id);
            return (
              <li key={item.id} className="flex min-h-0 flex-col gap-2">
                <div
                  onWheel={handleWheel}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={() => (dragRef.current = null)}
                  onDoubleClick={() => setView(IDENTITY)}
                  className={cn(
                    'relative min-h-0 flex-1 touch-none overflow-hidden rounded-media bg-panel-strong',
                    view.scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in',
                  )}
                >
                  <div
                    className="absolute inset-0 will-change-transform"
                    style={{ transform: `translate(${view.x}%, ${view.y}%) scale(${view.scale})` }}
                  >
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="(min-width: 768px) 45vw, 100vw"
                      placeholder={item.blurDataURL ? 'blur' : 'empty'}
                      blurDataURL={item.blurDataURL}
                      draggable={false}
                      className="object-contain select-none"
                    />
                  </div>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-ink-500">
                      {index === 0
                        ? 'Reference'
                        : changes.length
                          ? changes.map((change) => `${change.label}: ${change.to}`).join(' · ')
                          : 'Same recipe, different seed'}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      aria-pressed={picked}
                      onClick={() => onTogglePick(item.id)}
                      icon={
                        <Heart
                          className={cn('size-4', picked && 'fill-accent-600 text-accent-600')}
                        />
                      }
                    >
                      {picked ? 'Picked' : 'Pick'}
                    </Button>
                    <IconButton
                      label="Remove from compare"
                      size="sm"
                      onClick={() => onRemove(item.id)}
                    >
                      <X />
                    </IconButton>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </dialog>
  );
}
