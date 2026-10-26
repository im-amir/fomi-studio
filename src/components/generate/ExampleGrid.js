'use client';

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/format';

/** @import { ExamplePrompt } from '@/lib/types' */

/**
 * Starter prompts as picture cards, for the empty canvas and the Ideas dialog.
 * Picking one fills the prompt; it doesn't spend a generation.
 * `eager` loads the first row straight away, for when the grid is above the fold and
 * holds the biggest thing on screen.
 * @param {{
 *   examples: ExamplePrompt[],
 *   onPick: (prompt: string) => void,
 *   eager?: boolean,
 *   className?: string,
 * }} props
 */
export function ExampleGrid({ examples, onPick, eager = false, className }) {
  return (
    <ul className={cn('grid grid-cols-2 gap-3 md:grid-cols-4', className)}>
      {examples.map((example, index) => (
        <li key={example.label}>
          <button
            type="button"
            onClick={() => onPick(example.prompt)}
            className="group relative block aspect-[4/5] w-full overflow-hidden rounded-panel bg-panel text-left shadow-sm focus-ring transition-[scale] duration-fast active:scale-[0.98]"
          >
            <Image
              src={example.src}
              alt=""
              fill
              sizes="(min-width: 1280px) 18rem, (min-width: 768px) 22vw, 45vw"
              loading={eager && index < 4 ? 'eager' : 'lazy'}
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
              <span className="line-clamp-2 text-xs text-white/80 max-sm:hidden">
                {example.prompt}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
