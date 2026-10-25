'use client';

import { useLayoutEffect } from 'react';
import { PROMPT_MAX_LENGTH } from '@/lib/constants';
import { cn } from '@/lib/format';
import { GenerateButton } from './GenerateButton';

/** @import { GenerateButtonState } from './GenerateButton' */

const MAX_HEIGHT_PX = 360;
const COUNT_WARNING_RATIO = 0.9;

/**
 * Prompt field with the Generate action inside it, as in the mockup. Grows with the
 * text up to a cap, then scrolls. ⌘/Ctrl + Enter generates.
 * @param {{
 *   value: string,
 *   onChange: (value: string) => void,
 *   buttonState: GenerateButtonState,
 *   onGenerate: () => void,
 *   onCancel: () => void,
 *   textareaRef: React.RefObject<HTMLTextAreaElement | null>,
 *   className?: string,
 * }} props
 */
export function PromptComposer({
  value,
  onChange,
  buttonState,
  onGenerate,
  onCancel,
  textareaRef,
  className,
}) {
  const length = value.length;

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [value, textareaRef]);

  /** @param {React.KeyboardEvent<HTMLTextAreaElement>} event */
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      if (buttonState === 'ready' || buttonState === 'done') onGenerate();
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col rounded-panel border-[1.5px] border-ink-900 bg-surface shadow-md transition-[border-color,box-shadow] duration-fast',
        'focus-within:border-accent-600 focus-within:shadow-[0_0_0_3px_var(--color-accent-100)]',
        className,
      )}
    >
      <label htmlFor="prompt" className="sr-only">
        Prompt
      </label>
      <textarea
        ref={textareaRef}
        id="prompt"
        value={value}
        maxLength={PROMPT_MAX_LENGTH}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={5}
        placeholder="Describe what you imagine — the subject, the light, the mood…"
        className="min-h-32 w-full resize-none bg-transparent px-4 pt-3.5 text-base text-ink-900 outline-none placeholder:text-ink-500 focus-visible:shadow-none"
      />
      <div className="flex items-end justify-between gap-3 px-3 pt-1 pb-3">
        <span
          aria-hidden="true"
          className={cn(
            'pb-1 pl-1 text-2xs tabular-nums transition-opacity duration-fast',
            length === 0 ? 'opacity-0' : 'opacity-100',
            length > PROMPT_MAX_LENGTH * COUNT_WARNING_RATIO ? 'text-accent-700' : 'text-ink-500',
          )}
        >
          {length > PROMPT_MAX_LENGTH * COUNT_WARNING_RATIO
            ? `${length} / ${PROMPT_MAX_LENGTH}`
            : length}
        </span>
        <GenerateButton state={buttonState} onGenerate={onGenerate} onCancel={onCancel} />
      </div>
    </div>
  );
}
