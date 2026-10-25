'use client';

import { useRef } from 'react';
import { cn } from '@/lib/format';

const NEXT_KEYS = ['ArrowRight', 'ArrowDown'];
const PREV_KEYS = ['ArrowLeft', 'ArrowUp'];

/**
 * Segmented control (ARIA radiogroup). The thumb slides with a transform, and arrow keys
 * move the selection like native radios: one Tab stop, arrows to change.
 *
 * @template {string} T
 * @param {{
 *   label: string,
 *   options: { value: T, label: string, icon?: React.ReactNode }[],
 *   value: T,
 *   onChange: (value: T) => void,
 *   className?: string,
 * }} props
 */
export function Segmented({ label, options, value, onChange, className }) {
  /** @type {React.RefObject<(HTMLButtonElement | null)[]>} */
  const optionRefs = useRef([]);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  /** @param {React.KeyboardEvent} event */
  const handleKeyDown = (event) => {
    const step = NEXT_KEYS.includes(event.key) ? 1 : PREV_KEYS.includes(event.key) ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const nextIndex = (selectedIndex + step + options.length) % options.length;
    onChange(options[nextIndex].value);
    optionRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn('relative isolate grid h-9 rounded-full bg-surface p-1 shadow-sm', className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 -z-10 rounded-full bg-panel-strong transition-transform duration-slow"
        style={{
          width: `calc((100% - 0.5rem) / ${options.length})`,
          transform: `translateX(${selectedIndex * 100}%)`,
        }}
      />
      {options.map((option, index) => {
        const selected = index === selectedIndex;
        return (
          <button
            key={option.value}
            ref={(node) => {
              optionRefs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-full text-xs font-medium focus-ring transition-colors duration-fast',
              selected ? 'text-ink-900' : 'text-ink-500 hover:text-ink-900',
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
