'use client';

import { useLayoutEffect, useRef } from 'react';
import { PROMPT_MAX_LENGTH } from '@/lib/constants';
import { cn } from '@/lib/format';

/**
 * Auto-growing prompt field (up to `maxHeight`, then scrolls). ⌘/Ctrl + Enter submits.
 * Marked with data-prompt-input so the workspace can focus whichever copy is visible
 * (panel on tablet/desktop, dock on phones).
 * @param {{
 *   id: string,
 *   value: string,
 *   onChange: (value: string) => void,
 *   onSubmit: () => void,
 *   rows: number,
 *   maxHeight: number,
 *   placeholder?: string,
 *   className?: string,
 * }} props
 */
export function PromptTextarea({
  id,
  value,
  onChange,
  onSubmit,
  rows,
  maxHeight,
  placeholder = 'Describe what you imagine — the subject, the light, the mood…',
  className,
}) {
  /** @type {React.RefObject<HTMLTextAreaElement | null>} */
  const ref = useRef(null);

  useLayoutEffect(() => {
    const textarea = ref.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, [value, maxHeight]);

  return (
    <>
      <label htmlFor={id} className="sr-only">
        Prompt
      </label>
      <textarea
        ref={ref}
        id={id}
        data-prompt-input
        value={value}
        rows={rows}
        maxLength={PROMPT_MAX_LENGTH}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            onSubmit();
          }
        }}
        className={cn(
          'w-full resize-none bg-transparent text-base text-ink-900 outline-none placeholder:text-ink-500 focus-visible:shadow-none',
          className,
        )}
      />
    </>
  );
}

/** Focuses the prompt field that is currently on screen. */
export function focusVisiblePrompt() {
  const fields = /** @type {NodeListOf<HTMLTextAreaElement>} */ (
    document.querySelectorAll('[data-prompt-input]')
  );
  [...fields].find((field) => field.offsetParent !== null)?.focus();
}
