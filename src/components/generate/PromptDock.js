'use client';

import { SlidersHorizontal } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { getModel } from '@/data/models';
import { PROMPT_MIN_WORDS } from '@/lib/constants';
import { countWords } from '@/lib/format';
import { GenerateButton } from './GenerateButton';
import { PromptTextarea } from './PromptTextarea';

/** @import { ComposerSettings } from '@/hooks/useComposerSettings' */
/** @import { GenerateButtonState } from './GenerateButton' */

/**
 * Phone composer: docked to the bottom like a chat input so it's always under the thumb
 * while results fill the screen. Settings live one tap away in a sheet; their summary
 * stays visible here so you always know what the next run will use.
 * @param {{
 *   composer: ComposerSettings,
 *   buttonState: GenerateButtonState,
 *   onGenerate: () => void,
 *   onCancel: () => void,
 *   onOpenSettings: () => void,
 * }} props
 */
export function PromptDock({ composer, buttonState, onGenerate, onCancel, onOpenSettings }) {
  const { settings, setPrompt } = composer;
  const summary = [
    settings.mode === 'video' ? 'Video' : 'Image',
    `${settings.count}×`,
    settings.aspectRatio,
    getModel(settings.model)?.name.replace('Fomi ', ''),
  ].join(' · ');

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/95 px-3 pt-2 pb-[max(env(safe-area-inset-bottom),0.75rem)] backdrop-blur-md md:hidden">
      <p aria-hidden="true" className="mb-1.5 px-1 text-2xs text-ink-500">
        {summary}
      </p>
      <div className="flex items-end gap-1.5 rounded-panel border-[1.5px] border-ink-900 bg-surface p-1 transition-[border-color,box-shadow] duration-fast focus-within:border-accent-600 focus-within:shadow-[0_0_0_3px_var(--color-accent-100)]">
        <IconButton label={`Settings: ${summary}`} tooltip={false} onClick={onOpenSettings}>
          <SlidersHorizontal />
        </IconButton>
        <PromptTextarea
          id="prompt-dock"
          value={settings.prompt}
          onChange={setPrompt}
          onSubmit={() => (buttonState === 'ready' || buttonState === 'done') && onGenerate()}
          rows={1}
          maxHeight={144}
          placeholder="Describe what you imagine…"
          className="min-h-10 py-2.5 text-md"
        />
        <GenerateButton
          compact
          hintId="generate-hint-dock"
          state={buttonState}
          wordsNeeded={Math.max(0, PROMPT_MIN_WORDS - countWords(settings.prompt))}
          onGenerate={onGenerate}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
}
