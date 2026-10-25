'use client';

import { X } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { Kbd } from '@/components/ui/Kbd';
import { useModalDialog } from '@/hooks/useModalDialog';

const GROUPS = [
  {
    title: 'Move',
    keys: [
      [['←', '→'], 'Previous / next image in the lane'],
      [['↑', '↓'], 'Nearest take in the lane above / below'],
      [['↵'], 'View full size'],
    ],
  },
  {
    title: 'Decide',
    keys: [
      [['P'], 'Pick (keep)'],
      [['X'], 'Reject'],
      [['C'], 'Add to compare'],
      [['⇧', 'C'], 'Open compare'],
    ],
  },
  {
    title: 'Create',
    keys: [
      [['B'], 'Branch from the selected image'],
      [['⌘', 'K'], 'Command bar'],
      [['?'], 'This list'],
    ],
  },
];

/**
 * Every Studio shortcut on one sheet (opened with ?), so the keyboard-first workflow is
 * discoverable rather than folklore.
 * @param {{ onClose: () => void }} props
 */
export default function ShortcutsSheet({ onClose }) {
  const { dialogRef, close } = useModalDialog(onClose);
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="shortcuts-title"
      onClick={(event) => event.target === event.currentTarget && close()}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] animate-pop-in rounded-panel bg-surface p-0 text-ink-900 shadow-lg backdrop:bg-scrim"
    >
      <div className="flex flex-col gap-5 p-6">
        <header className="flex items-center justify-between">
          <h2 id="shortcuts-title" className="font-display text-xl">
            Keyboard shortcuts
          </h2>
          <IconButton label="Close shortcuts" onClick={close}>
            <X />
          </IconButton>
        </header>
        {GROUPS.map((group) => (
          <section key={group.title} aria-label={group.title}>
            <h3 className="mb-2 text-xs font-semibold tracking-wide text-ink-500 uppercase">
              {group.title}
            </h3>
            <dl className="flex flex-col gap-2">
              {group.keys.map(([keys, action]) => (
                <div
                  key={String(action)}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <dt className="text-ink-600">{action}</dt>
                  <dd className="flex shrink-0 gap-1">
                    {
                      /** @type {string[]} */ (keys).map((key) => (
                        <Kbd key={key}>{key}</Kbd>
                      ))
                    }
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </dialog>
  );
}
