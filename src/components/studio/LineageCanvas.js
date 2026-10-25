'use client';

import { useEffect, useMemo, useRef } from 'react';
import { GitBranch } from 'lucide-react';
import { cn } from '@/lib/format';
import { LAYOUT, layoutLineage } from '@/lib/studio/layout';
import { diffRecipe } from '@/lib/studio/recipe';
import styles from './LineageCanvas.module.css';
import { TakeCard } from './TakeCard';

/** @import { StudioProject, Take } from '@/lib/studio/types' */

/**
 * The project as a family tree laid out in lanes: one row per branch, time flowing
 * right. Branch lines start at the exact take they grew from, so you can always trace
 * how a result came to be. Opens scrolled to the newest work.
 * @param {{
 *   project: StudioProject,
 *   picks: Set<string>,
 *   rejects: Set<string>,
 *   selectedImageId: string | null,
 *   onSelectImage: (imageId: string) => void,
 *   className?: string,
 * }} props
 */
export function LineageCanvas({
  project,
  picks,
  rejects,
  selectedImageId,
  onSelectImage,
  className,
}) {
  /** @type {React.RefObject<HTMLDivElement | null>} */
  const scrollerRef = useRef(null);
  const layout = useMemo(() => layoutLineage(project), [project]);

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

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollLeft = scroller.scrollWidth;
  }, []);

  /** @param {Take} take */
  const labelOf = (take) => `T${project.takes.indexOf(take) + 1}`;

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
                  'flex flex-col justify-center gap-1 border-b border-line/60 pr-8 pl-5 last:border-b-0',
                )}
                style={{ width: LAYOUT.laneHeaderWidth, height: LAYOUT.laneHeight }}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                  <span
                    aria-hidden="true"
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: `var(--color-lane-${branch.hue})` }}
                  />
                  {branch.name}
                </span>
                <span className="pl-4.5 text-xs text-ink-500">
                  {takes.length} {takes.length === 1 ? 'take' : 'takes'}
                </span>
                {origin && (
                  <span className="flex items-center gap-1 pl-4.5 text-xs text-ink-500">
                    <GitBranch aria-hidden="true" className="size-3" />
                    from {labelOf(origin)}
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
              className={cn(styles.connector, !connector.branch && styles.trunk)}
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
              label={labelOf(take)}
              hue={hueOf.get(take.branchId) ?? 1}
              changes={diffRecipe(parent?.recipe ?? null, take.recipe)}
              x={box.x}
              y={box.y}
              picks={picks}
              rejects={rejects}
              branchSources={branchSources}
              selectedImageId={selectedImageId}
              onSelectImage={onSelectImage}
            />
          );
        })}
      </div>
    </div>
  );
}
