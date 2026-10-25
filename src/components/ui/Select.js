'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useDismiss } from '@/hooks/useDismiss';
import { cn } from '@/lib/format';

/**
 * @template {string | number} T
 * @typedef {object} SelectOption
 * @property {T} value
 * @property {string} label
 * @property {string} [description]
 * @property {React.ReactNode} [icon]
 */

const PLACEMENTS = {
  bottom: 'top-full mt-1.5 origin-top',
  top: 'bottom-full mb-1.5 origin-bottom',
};
const ALIGNS = { start: 'left-0', end: 'right-0' };

/**
 * Compact select built on the ARIA listbox pattern: focus moves to the list while it's
 * open and aria-activedescendant tracks the highlighted option. Supports arrows,
 * Home/End, Enter/Space, Escape, Tab and type-ahead, plus icons and descriptions per
 * option, which a native <select> can't render.
 *
 * @template {string | number} T
 * @param {{
 *   label: string,
 *   options: SelectOption<T>[],
 *   value: T,
 *   onChange: (value: T) => void,
 *   renderValue?: (option: SelectOption<T>) => React.ReactNode,
 *   placement?: keyof typeof PLACEMENTS,
 *   align?: keyof typeof ALIGNS,
 *   className?: string,
 * }} props
 */
export function Select({
  label,
  options,
  value,
  onChange,
  renderValue,
  placement = 'bottom',
  align = 'start',
  className,
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  /** @type {React.RefObject<HTMLButtonElement | null>} */
  const triggerRef = useRef(null);
  /** @type {React.RefObject<HTMLUListElement | null>} */
  const listRef = useRef(null);

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selected = options[selectedIndex];
  const optionId = (/** @type {number} */ index) => `${id}-option-${index}`;

  const openList = (index = selectedIndex) => {
    setActiveIndex(index);
    setOpen(true);
  };
  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };
  const choose = (/** @type {number} */ index) => {
    onChange(options[index].value);
    close();
  };

  useDismiss(open, [triggerRef, listRef], (reason) => close(reason === 'escape'));

  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.getElementById(`${id}-option-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex, id]);

  /** @param {React.KeyboardEvent} event */
  const handleTriggerKeyDown = (event) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      openList();
    }
  };

  /** @param {React.KeyboardEvent} event */
  const handleListKeyDown = (event) => {
    const last = options.length - 1;
    const moves = {
      ArrowDown: Math.min(activeIndex + 1, last),
      ArrowUp: Math.max(activeIndex - 1, 0),
      Home: 0,
      End: last,
    };
    if (event.key in moves) {
      event.preventDefault();
      setActiveIndex(moves[/** @type {keyof typeof moves} */ (event.key)]);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(activeIndex);
    } else if (event.key === 'Tab') {
      close(false);
    } else if (event.key.length === 1) {
      const char = event.key.toLowerCase();
      const ordered = [...options.slice(activeIndex + 1), ...options.slice(0, activeIndex + 1)];
      const match = ordered.find((option) => option.label.toLowerCase().startsWith(char));
      if (match) setActiveIndex(options.indexOf(match));
    }
  };

  return (
    <div className={cn('relative', className)}>
      <span id={`${id}-label`} className="sr-only">
        {label}
      </span>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => (open ? close() : openList())}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          'flex h-8 w-full items-center gap-1.5 rounded-chip bg-surface pr-2 pl-2.5 text-xs text-ink-900 shadow-sm',
          'focus-ring transition-[box-shadow,background-color] duration-fast hover:bg-canvas',
          open && 'bg-canvas',
        )}
      >
        <span
          id={`${id}-value`}
          className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-left"
        >
          {renderValue ? renderValue(selected) : selected.label}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'size-3.5 shrink-0 text-ink-600 transition-[rotate] duration-base',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={`${id}-label`}
          aria-activedescendant={optionId(activeIndex)}
          onKeyDown={handleListKeyDown}
          className={cn(
            'absolute z-40 max-h-72 min-w-full animate-pop-in overflow-auto rounded-control border border-line bg-surface p-1 shadow-lg outline-none',
            PLACEMENTS[placement],
            ALIGNS[align],
          )}
        >
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            return (
              <li
                key={option.value}
                id={optionId(index)}
                role="option"
                aria-selected={isSelected}
                onPointerMove={() => setActiveIndex(index)}
                onClick={() => choose(index)}
                className={cn(
                  'flex min-h-9 cursor-pointer items-center gap-2.5 rounded-chip px-2.5 py-1.5 text-sm whitespace-nowrap text-ink-900',
                  index === activeIndex && 'bg-panel',
                )}
              >
                {option.icon && <span className="flex shrink-0 text-ink-600">{option.icon}</span>}
                <span className="flex-1">
                  <span className="block font-medium">{option.label}</span>
                  {option.description && (
                    <span className="block text-xs text-ink-500">{option.description}</span>
                  )}
                </span>
                <Check
                  aria-hidden="true"
                  className={cn('size-4 shrink-0 text-accent-600', !isSelected && 'invisible')}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
