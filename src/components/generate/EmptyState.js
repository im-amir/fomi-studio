'use client';

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { Kbd } from '@/components/ui/Kbd';
import { useModifierKey } from '@/hooks/useModifierKey';

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
          <ul className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            {examples.map((example, index) => (
              <li key={example.label}>
                <button
                  type="button"
                  aria-label={`Use prompt: ${example.label}`}
                  aria-describedby={`example-${index}`}
                  onClick={() => onPickPrompt(example.prompt)}
                  className="group relative block aspect-[4/5] w-full overflow-hidden rounded-panel bg-panel text-left shadow-sm focus-ring"
                >
                  <Image
                    src={example.src}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 18rem, (min-width: 768px) 22vw, 45vw"
                    // The first row is above the fold and is the biggest thing on screen.
                    loading={index < 4 ? 'eager' : 'lazy'}
                    placeholder={example.blurDataURL ? 'blur' : 'empty'}
                    blurDataURL={example.blurDataURL}
                    className="object-cover transition-[scale] duration-slow group-hover:scale-[1.04] group-focus-visible:scale-[1.04]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-[rgb(20_14_10/0.78)] via-[rgb(20_14_10/0.3)] to-transparent"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-3 text-white">
                    <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                      {example.label}
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-4 shrink-0 opacity-70 transition-[opacity,translate] duration-fast group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                      />
                    </span>
                    <span
                      id={`example-${index}`}
                      className="line-clamp-2 text-xs text-white/80 max-sm:hidden"
                    >
                      {example.prompt}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
