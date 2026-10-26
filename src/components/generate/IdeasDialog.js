'use client';

import { X } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { useModalDialog } from '@/hooks/useModalDialog';
import { ExampleGrid } from './ExampleGrid';

/** @import { ExamplePrompt } from '@/lib/types' */

/**
 * The empty canvas's starters, reachable once results have taken the centre.
 * Opened from the lightbulb in the prompt; code-split like the other dialogs.
 * @param {{
 *   examples: ExamplePrompt[],
 *   onPick: (prompt: string) => void,
 *   onClose: () => void,
 * }} props
 */
export default function IdeasDialog({ examples, onPick, onClose }) {
  const { dialogRef, close } = useModalDialog(onClose);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="ideas-title"
      onClick={(event) => event.target === event.currentTarget && close()}
      className="m-auto max-h-[min(48rem,calc(100dvh-2rem))] w-[min(64rem,calc(100vw-2rem))] animate-pop-in rounded-panel bg-canvas p-0 text-ink-900 shadow-lg backdrop:bg-scrim"
    >
      <div className="flex max-h-[inherit] flex-col">
        <header className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 id="ideas-title" className="font-display text-xl">
              Ideas
            </h2>
            <p className="text-sm text-ink-500">Pick one to fill the prompt, then make it yours.</p>
          </div>
          <IconButton label="Close ideas" onClick={close} tooltipSide="bottom">
            <X />
          </IconButton>
        </header>
        <div className="overflow-y-auto p-6 max-sm:p-4">
          <ExampleGrid
            examples={examples}
            onPick={(prompt) => {
              close();
              onPick(prompt);
            }}
          />
        </div>
      </div>
    </dialog>
  );
}
