'use client';

import { Check, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Tooltip } from '@/components/ui/Tooltip';
import { useModifierKey } from '@/hooks/useModifierKey';

/** @typedef {'ready' | 'empty' | 'generating' | 'done'} GenerateButtonState */

const HINT_ID = 'generate-hint';

/**
 * The primary action. While generating it becomes Cancel (same place, same size) so
 * stopping is never a hunt; a brief tick confirms success.
 * @param {{ state: GenerateButtonState, onGenerate: () => void, onCancel: () => void }} props
 */
export function GenerateButton({ state, onGenerate, onCancel }) {
  const mod = useModifierKey();

  if (state === 'generating') {
    return (
      <Button
        size="lg"
        variant="secondary"
        onClick={onCancel}
        className="group/cancel min-w-34"
        icon={
          <span className="relative inline-flex size-4 items-center justify-center">
            <Spinner className="text-accent-600 transition-opacity duration-fast group-hover/cancel:opacity-0" />
            <X
              aria-hidden="true"
              className="absolute size-4 opacity-0 transition-opacity duration-fast group-hover/cancel:opacity-100"
            />
          </span>
        }
      >
        Cancel
      </Button>
    );
  }

  const hint =
    state === 'empty'
      ? 'Describe what you want to create first'
      : `Generate${mod ? ` · ${mod} ↵` : ''}`;

  return (
    <Tooltip content={hint} id={HINT_ID}>
      <Button
        size="lg"
        disabled={state === 'empty'}
        aria-describedby={HINT_ID}
        onClick={onGenerate}
        className="min-w-34"
        icon={
          state === 'done' ? (
            <Check className="size-4 animate-pop-in" />
          ) : (
            <Sparkles className="size-4" />
          )
        }
      >
        {state === 'done' ? 'Done' : 'Generate'}
      </Button>
    </Tooltip>
  );
}
