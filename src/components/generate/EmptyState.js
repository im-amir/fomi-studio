'use client';

import { ArrowUpRight } from 'lucide-react';
import { Kbd } from '@/components/ui/Kbd';
import { EXAMPLE_PROMPTS } from '@/data/prompt-sets';
import { useModifierKey } from '@/hooks/useModifierKey';

/**
 * Shown when the canvas has nothing on it. Offers concrete starting points instead of a
 * blank area; picking one fills the prompt (it doesn't spend a generation).
 * @param {{ onPickPrompt: (prompt: string) => void }} props
 */
export function EmptyState({ onPickPrompt }) {
  const mod = useModifierKey();

  return (
    <section
      aria-labelledby="empty-title"
      className="mx-auto flex max-w-xl animate-fade-in flex-col items-center px-6 py-16 text-center"
    >
      <p className="text-sm font-medium text-accent-600">Your canvas is clear</p>
      <h2 id="empty-title" className="mt-2 font-display text-2xl text-balance text-ink-900">
        What will you make today?
      </h2>
      <p className="mt-3 text-base text-pretty text-ink-600">
        Describe a subject, the light and the mood. Start from one of these, or pick up past work
        from your history above.
      </p>
      <ul className="mt-8 flex w-full flex-col gap-2">
        {EXAMPLE_PROMPTS.map((example) => (
          <li key={example.label}>
            <button
              type="button"
              onClick={() => onPickPrompt(example.prompt)}
              className="group flex w-full items-center gap-4 rounded-control border border-line bg-surface px-4 py-3 text-left shadow-sm focus-ring transition-[border-color,translate] duration-fast hover:-translate-y-px hover:border-line-strong"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink-900">{example.label}</span>
                <span className="block truncate text-sm text-ink-500">{example.prompt}</span>
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 shrink-0 text-ink-500 transition-colors duration-fast group-hover:text-accent-600"
              />
            </button>
          </li>
        ))}
      </ul>
      {mod && (
        <p className="mt-6 flex items-center gap-1.5 text-sm text-ink-500">
          Press <Kbd>{mod}</Kbd>
          <Kbd>↵</Kbd> in the prompt to generate
        </p>
      )}
    </section>
  );
}
