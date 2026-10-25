'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { GitBranch } from 'lucide-react';
import { revealWithin } from '@/lib/dom';
import { cn } from '@/lib/format';
import { LAYOUT } from '@/lib/studio/layout';
import { diffRecipe } from '@/lib/studio/recipe';
import styles from './LineageCanvas.module.css';
import { TakeCard } from './TakeCard';

/** @import { StudioProject } from '@/lib/studio/types' */
/** @typedef {ReturnType<typeof import('@/lib/studio/layout').layoutLineage>} LineageLayout */

/**
 * The project as a family tree laid out in lanes: one row per branch, time flowing
 * right. Branch lines start at the exact take they grew from, so you can always trace
 * how a result came to be. Opens centred on the newest take.
 * @param {{
 *   project: StudioProject,
 *   layout: LineageLayout,
 *   picks: Set<string>,
 *   rejects: Set<string>,
 *   compareIds: string[],
 *   selectedImageId: string | null,
 *   onSelectImage: (imageId: string) => void,
 *   takeLabel: (takeId: string) => string,
 *   pending: import('./useStudio').PendingBranch | null,
 *   onRetryPending: () => void,
 *   onCancelPending: () => void,
 *   className?: string,
 * }} props
 */
export function LineageCanvas({
  project,
  layout,
  picks,
  rejects,
  compareIds,
  selectedImageId,
  onSelectImage,
  takeLabel,
  pending,
  onRetryPending,
  onCancelPending,
  className,
}) {
  /** @type {React.RefObject<HTMLDivElement | null>} */
  const scrollerRef = useRef(null);

  const takeById = useMemo(
    () => new Map(project.takes.map((take) => [take.id, take])),
    [project.takes],
  );
  const branchSources = useMemo(
    () =>
      new Set(project.takes.flatMap((take) => (take.sourceImageId ? [take.sourceImageId] : []))),
    [project.takes],
  );
  const hueOf = useMemo(
    () => new Map(project.branches.map((branch) => [branch.id, branch.hue])),
    [project.branches],
  );

  const newestTakeId = project.takes.at(-1)?.id;
  useEffect(() => {
    const scroller = scrollerRef.current;
    const box = newestTakeId ? layout.boxes.get(newestTakeId) : undefined;
    if (!scroller || !box) return;
    scroller.scrollTo({
      left: box.x + LAYOUT.cardWidth / 2 - scroller.clientWidth / 2,
      top: box.y + LAYOUT.cardHeight / 2 - scroller.clientHeight / 2,
    });
  }, [layout, newestTakeId]);

  /** Scroll only the canvas, keeping clear of the sticky lane names. */
  const reveal = useCallback(
    /** @param {string} selector */ (selector) => {
      const scroller = scrollerRef.current;
      const element = scroller?.querySelector(selector);
      if (scroller && element)
        revealWithin(scroller, element, { left: layout.laneHeaderWidth + 16 });
    },
    [layout.laneHeaderWidth],
  );
  const compact = layout.laneHeaderWidth < LAYOUT.laneHeaderWidth;

  // Bring a new take into view the moment it starts generating.
  const pendingTakeId = pending?.take.id;
  useEffect(() => {
    if (!pendingTakeId) return;
    reveal(`[data-take-id="${pendingTakeId}"]`);
  }, [pendingTakeId, reveal]);

  // Keep the selection in view as it moves with the keyboard.
  useEffect(() => {
    if (!selectedImageId) return;
    reveal(`[data-image-id="${selectedImageId}"]`);
  }, [selectedImageId, reveal]);

  return (
    <div
      ref={scrollerRef}
      role="region"
      aria-label="Lineage"
      tabIndex={0}
      className={cn(
        styles.surface,
        'overflow-auto overscroll-contain rounded-panel border border-line focus-ring',
        className,
      )}
    >
      <div className="relative" style={{ width: layout.width, height: layout.height }}>
        <ol aria-label="Branches" className="sticky left-0 z-10 w-fit">
          {project.branches.map((branch) => {
            const takes = project.takes.filter((take) => take.branchId === branch.id);
            const origin = takes[0]?.parentTakeId ? takeById.get(takes[0].parentTakeId) : undefined;
            return (
              <li
                key={branch.id}
                className={cn(
                  styles.laneHeader,
                  branch.id === pending?.newBranch?.id && 'animate-fade-in',
                  'flex flex-col justify-center gap-1 border-b border-line/60 last:border-b-0',
                  compact ? 'items-center' : 'pr-8 pl-5',
                )}
                style={{ width: layout.laneHeaderWidth, height: LAYOUT.laneHeight }}
              >
                {/* Phones: just the lane colour; the name stays for screen readers. */}
                <span
                  className={cn(
                    'flex items-center gap-2 text-sm font-semibold text-ink-900',
                    compact && '[&>span:last-child]:sr-only',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: `var(--color-lane-${branch.hue})` }}
                  />
                  <span>{branch.name}</span>
                </span>
                <span className={cn('pl-4.5 text-xs text-ink-500', compact && 'sr-only')}>
                  {takes.length} {takes.length === 1 ? 'take' : 'takes'}
                </span>
                {origin && (
                  <span
                    className={cn(
                      'flex items-center gap-1 pl-4.5 text-xs text-ink-500',
                      compact && 'sr-only',
                    )}
                  >
                    <GitBranch aria-hidden="true" className="size-3" />
                    from {takeLabel(origin.id)}
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          width={layout.width}
          height={layout.height}
        >
          {layout.connectors.map((connector) => (
            <path
              key={connector.id}
              d={connector.path}
              // pathLength=1 lets the CSS draw animation work for any path length.
              pathLength={connector.childId === pending?.take.id ? 1 : undefined}
              className={cn(
                styles.connector,
                !connector.branch && styles.trunk,
                connector.childId === pending?.take.id && styles.drawIn,
              )}
              style={{ stroke: `var(--color-lane-${connector.hue})` }}
            />
          ))}
        </svg>

        {project.takes.map((take) => {
          const box = layout.boxes.get(take.id);
          if (!box) return null;
          const parent = take.parentTakeId ? takeById.get(take.parentTakeId) : undefined;
          return (
            <TakeCard
              key={take.id}
              take={take}
              label={takeLabel(take.id)}
              hue={hueOf.get(take.branchId) ?? 1}
              changes={diffRecipe(parent?.recipe ?? null, take.recipe)}
              x={box.x}
              y={box.y}
              picks={picks}
              rejects={rejects}
              compareIds={compareIds}
              branchSources={branchSources}
              selectedImageId={selectedImageId}
              onSelectImage={onSelectImage}
              pending={
                pending?.take.id === take.id
                  ? {
                      error: pending.error,
                      startedAt: pending.startedAt,
                      onRetry: onRetryPending,
                      onCancel: onCancelPending,
                    }
                  : null
              }
            />
          );
        })}
      </div>
    </div>
  );
}
