'use client';

import { useId, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useModalDialog } from '@/hooks/useModalDialog';
import { cn } from '@/lib/format';
import { Kbd } from './Kbd';

/**
 * @typedef {object} Command
 * @property {string} id
 * @property {string} title
 * @property {string} group
 * @property {string} [detail]     secondary line (e.g. what a take changed)
 * @property {string} [shortcut]   shown as a hint; the palette doesn't bind it
 * @property {string} [keywords]   extra search terms
 * @property {() => void} run
 */

/**
 * ⌘K: every action and destination, searchable — the fast path for people who live in
 * the app. ARIA combobox: focus stays in the input, ↑/↓ move the active option, Enter
 * runs it, Escape closes. Native modal <dialog>, so focus returns to where it was.
 * @param {{ commands: Command[], onClose: () => void, placeholder?: string }} props
 */
export default function CommandPalette({
  commands,
  onClose,
  placeholder = 'Type a command or search…',
}) {
  const { dialogRef, close } = useModalDialog(onClose);
  const listId = useId();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return commands.filter((command) => {
      const haystack =
        `${command.title} ${command.group} ${command.detail ?? ''} ${command.keywords ?? ''}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }, [commands, query]);
  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));

  /** @param {Command} command */
  const runCommand = (command) => {
    close();
    // Run after the dialog has closed and returned focus, so commands that move focus win.
    requestAnimationFrame(() => command.run());
  };

  /** @param {React.KeyboardEvent<HTMLInputElement>} event */
  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((activeIndex + step + results.length) % Math.max(results.length, 1));
    } else if (event.key === 'Enter' && results[activeIndex]) {
      event.preventDefault();
      runCommand(results[activeIndex]);
    }
  };

  const optionId = (/** @type {number} */ index) => `${listId}-${index}`;

  return (
    <dialog
      ref={dialogRef}
      aria-label="Command bar"
      onClick={(event) => event.target === event.currentTarget && close()}
      className="mx-auto mt-[12vh] w-[min(36rem,calc(100vw-2rem))] animate-pop-in overflow-hidden rounded-panel border border-line bg-surface p-0 text-ink-900 shadow-lg backdrop:bg-scrim"
    >
      <div className="flex items-center gap-2 border-b border-line px-4">
        <Search aria-hidden="true" className="size-4 shrink-0 text-ink-500" />
        <input
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={results.length ? optionId(activeIndex) : undefined}
          aria-autocomplete="list"
          aria-label="Search commands"
          autoFocus
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-12 w-full bg-transparent text-md outline-none placeholder:text-ink-500 focus-visible:shadow-none"
        />
      </div>
      <ul
        id={listId}
        role="listbox"
        aria-label="Commands"
        className="max-h-[50vh] overflow-y-auto p-2"
      >
        {results.length === 0 && (
          <li className="px-3 py-6 text-center text-sm text-ink-500">No matching commands</li>
        )}
        {results.map((command, index) => (
          <li
            key={command.id}
            id={optionId(index)}
            role="option"
            aria-selected={index === activeIndex}
            onPointerMove={() => setActive(index)}
            onClick={() => runCommand(command)}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-control px-3 py-2',
              index === activeIndex && 'bg-panel',
            )}
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{command.title}</span>
              {command.detail && (
                <span className="block truncate text-xs text-ink-500">{command.detail}</span>
              )}
            </span>
            {(index === 0 || results[index - 1].group !== command.group) && (
              <span className="shrink-0 text-2xs tracking-wide text-ink-500 uppercase">
                {command.group}
              </span>
            )}
            {command.shortcut && <Kbd>{command.shortcut}</Kbd>}
          </li>
        ))}
      </ul>
    </dialog>
  );
}
