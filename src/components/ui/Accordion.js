'use client';

import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/format';

/**
 * Disclosure section. Height animates via grid-template-rows (0fr → 1fr), which lets the
 * content keep its natural height without measuring it in JS. Collapsed content is
 * `inert`, so it's skipped by Tab and screen readers.
 *
 * Controlled (`open` + `onOpenChange`) or uncontrolled (`defaultOpen`).
 *
 * @param {{
 *   title: React.ReactNode,
 *   children: React.ReactNode,
 *   summary?: React.ReactNode,
 *   defaultOpen?: boolean,
 *   open?: boolean,
 *   onOpenChange?: (open: boolean) => void,
 *   className?: string,
 * }} props
 */
export function Accordion({
  title,
  children,
  summary,
  defaultOpen = false,
  open,
  onOpenChange,
  className,
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = open ?? uncontrolledOpen;
  const contentId = useId();

  const toggle = () => {
    setUncontrolledOpen(!isOpen);
    onOpenChange?.(!isOpen);
  };

  return (
    <section className={cn('rounded-panel bg-surface shadow-sm', className)}>
      <h3>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={toggle}
          className="group flex h-11 w-full items-center gap-2 rounded-panel px-4 text-left text-base font-medium text-ink-900 focus-ring"
        >
          <span className="flex-1">{title}</span>
          {summary && !isOpen && (
            <span className="truncate text-sm font-normal text-ink-500">{summary}</span>
          )}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'size-4 shrink-0 text-ink-500 transition-[rotate,color] duration-base group-hover:text-ink-900',
              isOpen && 'rotate-180',
            )}
          />
        </button>
      </h3>
      <div
        id={contentId}
        inert={!isOpen}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-base',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-4 pt-1 pb-4">{children}</div>
        </div>
      </div>
    </section>
  );
}
