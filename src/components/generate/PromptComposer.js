'use client';

import { ViewTransition } from 'react';
import { PROMPT_MAX_LENGTH, PROMPT_MIN_WORDS } from '@/lib/constants';
import { cn, countWords } from '@/lib/format';
import { GenerateButton } from './GenerateButton';
import { PromptTextarea } from './PromptTextarea';

/** @import { GenerateButtonState } from './GenerateButton' */

const COUNT_WARNING_RATIO = 0.9;

/**
 * Prompt field with the Generate action inside it, as in the mockup.
 *
 * Named for React's <ViewTransition>: on desktop it lives in the centre of an empty canvas
 * and in the side panel once there are results; rendering it in only one place at a time
 * lets the browser morph it from one spot to the other.
 * @param {{
 *   id: string,
 *   value: string,
 *   onChange: (value: string) => void,
 *   buttonState: GenerateButtonState,
 *   onGenerate: () => void,
 *   onCancel: () => void,
 *   autoFocus?: boolean,
 *   className?: string,
 * }} props
 */
export function PromptComposer({
  id,
  value,
  onChange,
  buttonState,
  onGenerate,
  onCancel,
  autoFocus = false,
  className,
}) {
  const length = value.length;
  const nearLimit = length > PROMPT_MAX_LENGTH * COUNT_WARNING_RATIO;
  const words = countWords(value);
  const wordsNeeded = Math.max(0, PROMPT_MIN_WORDS - words);

  return (
    <ViewTransition name="prompt-composer" share="morph" default="none">
      <div
        className={cn(
          'flex flex-col rounded-panel border-[1.5px] border-ink-900 bg-surface shadow-md transition-[border-color,box-shadow] duration-fast',
          'focus-within:border-accent-600 focus-within:shadow-[0_0_0_3px_var(--color-accent-100)]',
          className,
        )}
      >
        <PromptTextarea
          id={id}
          value={value}
          onChange={onChange}
          onSubmit={() => (buttonState === 'ready' || buttonState === 'done') && onGenerate()}
          rows={5}
          maxHeight={360}
          autoFocus={autoFocus}
          className="min-h-32 px-4 pt-3.5"
        />
        <div className="flex items-end justify-between gap-3 px-3 pt-1 pb-3">
          <span
            aria-hidden="true"
            className={cn(
              'pb-1 pl-1 text-2xs tabular-nums transition-opacity duration-fast',
              length === 0 ? 'opacity-0' : 'opacity-100',
              nearLimit ? 'text-accent-700' : 'text-ink-500',
            )}
          >
            {wordsNeeded > 0
              ? `${words}/${PROMPT_MIN_WORDS} words`
              : nearLimit
                ? `${length} / ${PROMPT_MAX_LENGTH}`
                : length}
          </span>
          <GenerateButton
            state={buttonState}
            wordsNeeded={wordsNeeded}
            onGenerate={onGenerate}
            onCancel={onCancel}
          />
        </div>
      </div>
    </ViewTransition>
  );
}
