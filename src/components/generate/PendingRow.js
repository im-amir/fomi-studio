'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import { useSimulatedProgress } from '@/hooks/useSimulatedProgress';
import { getAspectRatio } from '@/lib/constants';
import { describeRecipe } from '@/lib/recipe';
import { ROW_CLASS } from './BatchRow';
import { PromptCard } from './PromptCard';

/** @import { PendingBatch } from '@/hooks/useGenerate' */

/** @param {number} progress */
function phaseFor(progress) {
  if (progress < 35) return 'Composing';
  if (progress < 75) return 'Rendering';
  return 'Refining';
}

/**
 * Isolated so the 120ms progress ticks re-render only this label, not the feed.
 * @param {{ startedAt: number, count: number, noun: string }} props
 */
function ProgressLabel({ startedAt, count, noun }) {
  const progress = useSimulatedProgress(startedAt);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-ink-900">
        {phaseFor(progress)} {count} {noun}…{' '}
        <span className="text-ink-500 tabular-nums">{progress}%</span>
      </p>
      <div className="h-1 overflow-hidden rounded-full bg-panel-strong">
        <div
          className="h-full origin-left rounded-full bg-accent-500 transition-transform duration-base"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>
    </div>
  );
}

/**
 * Optimistic placeholder: the row appears the instant Generate is pressed, with tiles
 * in the exact aspect ratio, so the results drop in without any layout shift.
 * @param {{ pending: PendingBatch }} props
 */
export function PendingRow({ pending }) {
  const { request, id, startedAt } = pending;
  const [width, height] = getAspectRatio(request.aspectRatio).ratio;
  const noun =
    request.mode === 'video'
      ? request.count === 1
        ? 'clip'
        : 'clips'
      : request.count === 1
        ? 'image'
        : 'images';

  return (
    <section aria-label="Generating" aria-busy="true" className={ROW_CLASS}>
      <PromptCard
        prompt={request.prompt}
        model={request.model}
        recipe={describeRecipe(request)}
        status={<ProgressLabel startedAt={startedAt} count={request.count} noun={noun} />}
      />
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {Array.from({ length: request.count }, (_, slot) => (
          <li key={`${id}-${slot}`}>
            <Skeleton
              aspectRatio={`${width} / ${height}`}
              className="rounded-media"
              style={/** @type {React.CSSProperties} */ ({ '--shimmer-delay': `${slot * 80}ms` })}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
