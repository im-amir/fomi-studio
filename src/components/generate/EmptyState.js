'use client';

import { Kbd } from '@/components/ui/Kbd';
import { useModifierKey } from '@/hooks/useModifierKey';
import { ExampleGrid } from './ExampleGrid';

/** @import { ExamplePrompt } from '@/lib/types' */

/**
 * Shown when the canvas has nothing on it: the prompt takes centre stage, and starters
 * fill the width as pictures, so the first screen shows what the tool makes instead of
 * empty space. Picking one fills the prompt (it doesn't spend a generation).
 * @param {{
 *   examples: ExamplePrompt[],
 *   onPickPrompt: (prompt: string) => void,
 *   composer: React.ReactNode,
 * }} props
 */
export function EmptyState({ examples, onPickPrompt, composer }) {
  const mod = useModifierKey();

  return (
    <section
      aria-labelledby="empty-title"
      className="flex animate-fade-in flex-col items-center pt-8 pb-16 lg:pt-4"
    >
      <div className="flex w-full max-w-3xl flex-col items-center text-center">
        <p className="text-sm font-medium text-accent-600">Your canvas is clear</p>
        <h2 id="empty-title" className="mt-2 font-display text-2xl text-balance text-ink-900">
          What will you make today?
        </h2>
        <div className="mt-6 w-full text-left">{composer}</div>
        {mod && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-500">
            Press <Kbd>{mod}</Kbd>
            <Kbd>↵</Kbd> in the prompt to generate
          </p>
        )}
      </div>

      {examples.length > 0 && (
        <div className="mt-10 w-full max-w-6xl">
          <h3 className="text-sm font-medium text-ink-500">Or start from one of these</h3>
          <ExampleGrid examples={examples} onPick={onPickPrompt} eager className="mt-3" />
        </div>
      )}
    </section>
  );
}
