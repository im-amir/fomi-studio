'use client';

import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Segmented';
import { useModalDialog } from '@/hooks/useModalDialog';
import { MODE_OPTIONS } from './ControlPanel';
import { GenerationSettings } from './GenerationSettings';

/** @import { ComposerSettings } from '@/hooks/useComposerSettings' */

/**
 * Phone bottom sheet with the same settings as the desktop panel. A native modal
 * <dialog>, so focus is trapped, Escape/back closes it and focus returns to the dock.
 * Changes apply immediately; "Done" just closes.
 * @param {{ composer: ComposerSettings, onClose: () => void }} props
 */
export default function SettingsSheet({ composer, onClose }) {
  const { dialogRef, close } = useModalDialog(onClose);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="settings-sheet-title"
      onClick={(event) => event.target === event.currentTarget && close()}
      className="mx-0 mt-auto mb-0 max-h-[85dvh] w-full max-w-none animate-sheet-up overflow-y-auto overscroll-contain rounded-t-panel bg-canvas p-0 text-ink-900 shadow-lg backdrop:bg-scrim"
    >
      <div className="flex flex-col gap-4 px-4 pt-2 pb-[max(env(safe-area-inset-bottom),1rem)]">
        <span aria-hidden="true" className="mx-auto h-1 w-10 rounded-full bg-line-strong/40" />
        <header className="flex items-center justify-between">
          <h2 id="settings-sheet-title" className="text-lg font-semibold">
            Settings
          </h2>
          <Button size="sm" variant="secondary" onClick={close}>
            Done
          </Button>
        </header>
        <Segmented
          label="Output type"
          value={composer.settings.mode}
          onChange={composer.setMode}
          options={MODE_OPTIONS}
        />
        <GenerationSettings composer={composer} />
      </div>
    </dialog>
  );
}
