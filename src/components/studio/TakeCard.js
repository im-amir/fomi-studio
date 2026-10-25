'use client';

import { memo } from 'react';
import Image from 'next/image';
import { GitBranch, Heart } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { useNow } from '@/hooks/useNow';
import { cn, formatRelativeTime } from '@/lib/format';
import { squareCrop } from '@/lib/media';
import { LAYOUT } from '@/lib/studio/layout';

/** @import { Take } from '@/lib/studio/types' */
/** @import { RecipeChange } from '@/lib/studio/recipe' */

/** @param {{ changes: RecipeChange[] }} props */
function ChangeChip({ changes }) {
  if (changes.length === 0) {
    return <span className="truncate text-xs font-medium text-ink-600">Starting point</span>;
  }
  const [first, ...rest] = changes;
  const detail = changes
    .map((change) => `${change.label}: ${change.from} → ${change.to}`)
    .join('\n');
  return (
    <Tooltip content={<span className="whitespace-pre-line">{detail}</span>} className="min-w-0">
      <span
        tabIndex={0}
        aria-label={`Changed — ${detail}`}
        className="inline-flex min-w-0 items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-xs text-ink-900 shadow-sm focus-ring"
      >
        <span className="shrink-0 text-ink-500">{first.label}</span>
        <span className="truncate">{first.to}</span>
        {rest.length > 0 && <span className="shrink-0 text-ink-500">+{rest.length}</span>}
      </span>
    </Tooltip>
  );
}

/**
 * One take on the lineage canvas: what changed, the results, and which of them were
 * picked, rejected or branched from. Memoised — the canvas holds every take.
 * @param {{
 *   take: Take,
 *   label: string,
 *   hue: number,
 *   changes: RecipeChange[],
 *   x: number,
 *   y: number,
 *   picks: Set<string>,
 *   rejects: Set<string>,
 *   compareIds: string[],
 *   branchSources: Set<string>,
 *   selectedImageId: string | null,
 *   onSelectImage: (imageId: string) => void,
 * }} props
 */
function TakeCardComponent({
  take,
  label,
  hue,
  changes,
  x,
  y,
  picks,
  rejects,
  compareIds,
  branchSources,
  selectedImageId,
  onSelectImage,
}) {
  const now = useNow();
  const pickCount = take.items.filter((item) => picks.has(item.id)).length;

  return (
    <article
      aria-label={`${label}: ${changes.length ? changes.map((change) => `${change.label} ${change.to}`).join(', ') : 'starting point'}`}
      className="absolute flex flex-col gap-2 rounded-panel border border-line bg-surface p-3 shadow-sm"
      style={{ left: x, top: y, width: LAYOUT.cardWidth, height: LAYOUT.cardHeight }}
    >
      <header className="flex h-6 items-center gap-2">
        <span
          aria-hidden="true"
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: `var(--color-lane-${hue})` }}
        />
        <span className="shrink-0 font-mono text-xs text-ink-500">{label}</span>
        <ChangeChip changes={changes} />
      </header>

      <ul className="grid grid-cols-4 gap-2">
        {take.items.map((item, index) => {
          const picked = picks.has(item.id);
          const rejected = rejects.has(item.id);
          const selected = item.id === selectedImageId;
          return (
            <li key={item.id}>
              <button
                type="button"
                data-image-id={item.id}
                aria-pressed={selected}
                aria-label={`${label}, image ${index + 1}${picked ? ', picked' : ''}${rejected ? ', rejected' : ''}`}
                onClick={() => onSelectImage(item.id)}
                className={cn(
                  'relative block aspect-square w-full overflow-hidden rounded-chip bg-panel-strong focus-ring transition-[box-shadow,opacity] duration-fast',
                  selected &&
                    'shadow-[0_0_0_2px_var(--color-surface),0_0_0_4px_var(--color-accent-600)]',
                  rejected && 'opacity-40',
                )}
              >
                <Image
                  src={squareCrop(item.src)}
                  alt=""
                  fill
                  sizes={`${LAYOUT.thumbSize}px`}
                  placeholder={item.blurDataURL ? 'blur' : 'empty'}
                  blurDataURL={item.blurDataURL}
                  className={cn('object-cover', rejected && 'grayscale')}
                />
                {picked && (
                  <span className="absolute top-1.5 right-1.5 inline-flex size-5 items-center justify-center rounded-full bg-surface/90 shadow-sm">
                    <Heart aria-hidden="true" className="size-3 fill-accent-600 text-accent-600" />
                  </span>
                )}
                {compareIds.includes(item.id) && (
                  <span className="absolute top-1.5 left-1.5 inline-flex size-5 items-center justify-center rounded-full bg-accent-600 text-2xs font-semibold text-on-accent">
                    <span className="sr-only">Comparing, </span>
                    {compareIds.indexOf(item.id) + 1}
                  </span>
                )}
                {branchSources.has(item.id) && (
                  <span className="absolute bottom-1.5 left-1.5 inline-flex size-5 items-center justify-center rounded-full bg-ink-900/70 text-white">
                    <GitBranch aria-hidden="true" className="size-3" />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <footer className="mt-auto flex items-center justify-between text-xs text-ink-500">
        <span>{now ? formatRelativeTime(take.createdAt, now) : ' '}</span>
        {pickCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <Heart aria-hidden="true" className="size-3 fill-current" />
            {pickCount} {pickCount === 1 ? 'pick' : 'picks'}
          </span>
        )}
      </footer>
    </article>
  );
}

export const TakeCard = memo(TakeCardComponent);
