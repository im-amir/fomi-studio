'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useGenerate } from '@/hooks/useGenerate';
import { useHistory } from '@/hooks/useHistory';
import { useSimulatedProgress } from '@/hooks/useSimulatedProgress';
import { DEFAULT_REQUEST, getAspectRatio } from '@/lib/constants';

/** @import { Batch, HistoryPage } from '@/lib/types' */

/** @param {{ startedAt: number }} props */
function ProgressLabel({ startedAt }) {
  const progress = useSimulatedProgress(startedAt);
  return <span className="tabular-nums">{progress}%</span>;
}

/** @param {{ batch: Batch }} props */
function BatchPreview({ batch }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {batch.items.map((item) => (
        <div
          key={item.id}
          className="relative overflow-hidden rounded-media"
          style={{ aspectRatio: `${item.width} / ${item.height}` }}
        >
          <Image
            src={item.type === 'video' ? /** @type {string} */ (item.poster) : item.src}
            alt={item.alt}
            fill
            sizes="200px"
            placeholder={item.blurDataURL ? 'blur' : 'empty'}
            blurDataURL={item.blurDataURL}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

/** @param {{ initialHistory: HistoryPage }} props */
export function ApiPlayground({ initialHistory }) {
  const [prompt, setPrompt] = useState('Redhead portrait in a cream sweater');
  const [batches, setBatches] = useState(/** @type {Batch[]} */ ([]));
  const { state, generate, cancel } = useGenerate();
  const history = useHistory(initialHistory);

  const run = async () => {
    const batch = await generate({ ...DEFAULT_REQUEST, prompt });
    if (batch) setBatches((current) => [batch, ...current]);
  };

  const pendingRatio =
    state.status === 'generating' ? getAspectRatio(state.pending.request.aspectRatio) : null;

  return (
    <section aria-labelledby="api-title" className="flex flex-col gap-6 rounded-panel bg-panel p-6">
      <h2 id="api-title" className="text-lg font-semibold text-ink-900">
        Mock API · useGenerate · useHistory
      </h2>
      <p className="text-sm text-ink-600">
        Include the word “fail” to see the error path. Starting a new run cancels the one in flight.
      </p>

      <div className="flex flex-wrap gap-3">
        <label className="sr-only" htmlFor="playground-prompt">
          Prompt
        </label>
        <input
          id="playground-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          className="h-10 min-w-0 flex-1 rounded-control border border-line-strong bg-surface px-3 text-base focus-ring"
        />
        <Button onClick={run} disabled={!prompt.trim()}>
          Generate
        </Button>
        {state.status === 'generating' && (
          <Button variant="secondary" onClick={cancel}>
            Cancel
          </Button>
        )}
      </div>

      <p role="status" className="text-sm text-ink-600">
        Status: <strong className="text-ink-900">{state.status}</strong>
        {state.status === 'generating' && (
          <>
            {' · '}
            <ProgressLabel startedAt={state.pending.startedAt} />
          </>
        )}
        {state.status === 'error' && (
          <span className="text-danger">
            {' '}
            · {state.error.code}: {state.error.message}
          </span>
        )}
      </p>

      {pendingRatio && state.status === 'generating' && (
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: state.pending.request.count }, (_, slot) => (
            <Skeleton
              key={`${state.pending.id}-${slot}`}
              aspectRatio={`${pendingRatio.ratio[0]} / ${pendingRatio.ratio[1]}`}
              className="rounded-media"
            />
          ))}
        </div>
      )}
      {batches.map((batch) => (
        <BatchPreview key={batch.id} batch={batch} />
      ))}

      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-ink-900">History ({history.items.length})</h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={history.loadMore}
          disabled={!history.hasMore}
          loading={history.status === 'loading'}
        >
          {history.hasMore ? 'Load more' : 'All loaded'}
        </Button>
      </div>
      <ul className="flex gap-2 overflow-x-auto pb-2">
        {history.items.map((batch) => {
          const cover = batch.items[0];
          return (
            <li key={batch.id} className="relative size-20 shrink-0 overflow-hidden rounded-chip">
              <Image
                src={cover.type === 'video' ? /** @type {string} */ (cover.poster) : cover.src}
                alt={cover.alt}
                fill
                sizes="80px"
                placeholder={cover.blurDataURL ? 'blur' : 'empty'}
                blurDataURL={cover.blurDataURL}
                className="object-cover"
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
