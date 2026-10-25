'use client';

import { Image as ImageIcon, Video } from 'lucide-react';
import { Segmented } from '@/components/ui/Segmented';
import { MODES } from '@/lib/constants';
import { cn } from '@/lib/format';
import { GenerationSettings } from './GenerationSettings';
import { PromptComposer } from './PromptComposer';

/** @import { ComposerSettings } from '@/hooks/useComposerSettings' */
/** @import { GenerateButtonState } from './GenerateButton' */

const MODE_ICONS = {
  image: <ImageIcon aria-hidden="true" className="size-3.5" />,
  video: <Video aria-hidden="true" className="size-3.5" />,
};
export const MODE_OPTIONS = MODES.map((mode) => ({ ...mode, icon: MODE_ICONS[mode.value] }));

/**
 * The composer as a panel: one column beside the results on desktop, two columns
 * (write | tune) above them on tablets. Phones use the docked composer instead.
 * @param {{
 *   composer: ComposerSettings,
 *   buttonState: GenerateButtonState,
 *   onGenerate: () => void,
 *   onCancel: () => void,
 *   className?: string,
 * }} props
 */
export function ControlPanel({ composer, buttonState, onGenerate, onCancel, className }) {
  const { settings, setMode, setPrompt } = composer;

  return (
    <aside
      aria-label="Generation settings"
      className={cn(
        'flex flex-col gap-4 rounded-panel bg-panel p-4 max-md:hidden md:max-lg:grid md:max-lg:grid-cols-2 md:max-lg:items-start md:max-lg:gap-6 md:max-lg:p-5',
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        <Segmented
          label="Output type"
          value={settings.mode}
          onChange={setMode}
          options={MODE_OPTIONS}
        />
        <PromptComposer
          id="prompt"
          value={settings.prompt}
          onChange={setPrompt}
          buttonState={buttonState}
          onGenerate={onGenerate}
          onCancel={onCancel}
        />
      </div>
      <GenerationSettings composer={composer} />
    </aside>
  );
}
