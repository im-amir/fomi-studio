'use client';

import { CircleAlert, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROW_CLASS } from './BatchRow';
import { PromptCard } from './PromptCard';

/** @import { ApiError } from '@/lib/api' */
/** @import { GenerateRequest } from '@/lib/types' */

/**
 * Failure stays where the results would have been, with the prompt that failed beside
 * it — and the composer keeps the prompt, so retrying costs one click.
 * @param {{ error: ApiError, request: GenerateRequest, onRetry: () => void, onDismiss: () => void }} props
 */
export function ErrorRow({ error, request, onRetry, onDismiss }) {
  return (
    <section aria-label="Generation failed" className={ROW_CLASS}>
      <PromptCard batch={request} />
      <div
        role="alert"
        className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-panel border border-dashed border-danger/40 bg-danger-soft p-6 text-center"
      >
        <CircleAlert aria-hidden="true" className="size-6 text-danger" />
        <div>
          <p className="text-md font-semibold text-ink-900">That didn’t render</p>
          <p className="mt-1 max-w-md text-base text-ink-600">{error.message}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onRetry} icon={<RotateCcw className="size-4" />}>
            Try again
          </Button>
          <Button variant="ghost" onClick={onDismiss}>
            Dismiss
          </Button>
        </div>
      </div>
    </section>
  );
}
