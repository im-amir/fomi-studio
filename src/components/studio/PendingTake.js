'use client';

import { RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSimulatedProgress } from '@/hooks/useSimulatedProgress';

/** @import { ApiError } from '@/lib/api' */

/**
 * Isolated so progress ticks re-render only this line, not the canvas.
 * @param {{ startedAt: number }} props
 */
function Progress({ startedAt }) {
  const progress = useSimulatedProgress(startedAt);
  return <span className="tabular-nums">Rendering… {progress}%</span>;
}

/**
 * Body of a take that is still generating (or failed): placeholders in the exact slot the
 * results will fill, so nothing on the canvas moves when they arrive.
 * @param {{ error: ApiError | null, startedAt: number, onRetry: () => void, onCancel: () => void }} props
 */
export function PendingTake({ error, startedAt, onRetry, onCancel }) {
  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-1 flex-col justify-center gap-2 rounded-chip bg-danger-soft p-3"
      >
        <p className="text-sm text-ink-900">{error.message}</p>
        <div className="flex gap-2">
          <Button size="sm" onClick={onRetry} icon={<RotateCcw className="size-3.5" />}>
            Retry
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel} icon={<X className="size-3.5" />}>
            Discard
          </Button>
        </div>
      </div>
    );
  }
  return (
    <>
      <ul aria-hidden="true" className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((slot) => (
          <li key={slot}>
            <Skeleton aspectRatio="1 / 1" className="rounded-chip" />
          </li>
        ))}
      </ul>
      <footer className="mt-auto flex items-center justify-between text-xs text-ink-500">
        <Progress startedAt={startedAt} />
        <button
          type="button"
          onClick={onCancel}
          className="rounded-sm focus-ring hover:text-ink-900"
        >
          Cancel
        </button>
      </footer>
    </>
  );
}
