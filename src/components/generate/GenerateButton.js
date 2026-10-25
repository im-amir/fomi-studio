'use client';

import { ArrowUp, Check, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Tooltip } from '@/components/ui/Tooltip';
import { useModifierKey } from '@/hooks/useModifierKey';
import { cn } from '@/lib/format';

/** @typedef {'ready' | 'empty' | 'generating' | 'done'} GenerateButtonState */

const COMPACT_CLASS = 'size-10 shrink-0 rounded-full px-0';

/**
 * The primary action. While generating it becomes Cancel (same place, same size) so
 * stopping is never a hunt; a brief tick confirms success. `compact` is the icon-only
 * version for the phone dock.
 * @param {{
 *   state: GenerateButtonState,
 *   onGenerate: () => void,
 *   onCancel: () => void,
 *   compact?: boolean,
 *   hintId?: string,
 * }} props
 */
export function GenerateButton({
  state,
  onGenerate,
  onCancel,
  compact = false,
  hintId = 'generate-hint',
}) {
  const mod = useModifierKey();

  if (state === 'generating') {
    return (
      <Button
        size={compact ? 'md' : 'lg'}
        variant="secondary"
        aria-label={compact ? 'Cancel generation' : undefined}
        onClick={onCancel}
        className={cn('group/cancel', compact ? COMPACT_CLASS : 'min-w-34')}
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
        {!compact && 'Cancel'}
      </Button>
    );
  }

  const hint =
    state === 'empty'
      ? 'Describe what you want to create first'
      : `Generate${mod ? ` · ${mod} ↵` : ''}`;
  const idleIcon = compact ? <ArrowUp className="size-5" /> : <Sparkles className="size-4" />;

  return (
    <Tooltip content={hint} id={hintId}>
      <Button
        size={compact ? 'md' : 'lg'}
        disabled={state === 'empty'}
        aria-label={compact ? 'Generate' : undefined}
        aria-describedby={hintId}
        onClick={onGenerate}
        className={compact ? COMPACT_CLASS : 'min-w-34'}
        icon={state === 'done' ? <Check className="size-4 animate-pop-in" /> : idleIcon}
      >
        {!compact && (state === 'done' ? 'Done' : 'Generate')}
      </Button>
    </Tooltip>
  );
}
