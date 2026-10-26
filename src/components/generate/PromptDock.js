'use client';

import { ViewTransition } from 'react';
import { Lightbulb, SlidersHorizontal } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { getModel } from '@/data/models';
import { PROMPT_MIN_WORDS } from '@/lib/constants';
import { countWords } from '@/lib/format';
import { GenerateButton } from './GenerateButton';
import { PromptTextarea } from './PromptTextarea';

/** @import { ComposerSettings } from '@/hooks/useComposerSettings' */
/** @import { GenerateRequest } from '@/lib/types' */
/** @import { GenerateButtonState } from './GenerateButton' */

/**
 * "Image · 4× · 2:3 · Studio": what the next run will use, for composers that keep the
 * settings behind a button.
 * @param {GenerateRequest} settings
 */
export function settingsSummary(settings) {
  return [
    settings.mode === 'video' ? 'Video' : 'Image',
    `${settings.count}×`,
    settings.aspectRatio,
    getModel(settings.model)?.name.replace('Fomi ', ''),
  ].join(' · ');
}

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
 *   onOpenIdeas: () => void,
 * }} props
 */
export function PromptDock({
  composer,
  buttonState,
  onGenerate,
  onCancel,
  onOpenSettings,
  onOpenIdeas,
}) {
  const { settings, setPrompt } = composer;
  const summary = settingsSummary(settings);

  return (
    <section
      aria-label="Prompt"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/95 px-3 pt-2 pb-[max(env(safe-area-inset-bottom),0.75rem)] backdrop-blur-md md:hidden"
    >
      <div className="mb-1 flex items-center justify-between gap-2 pl-1">
        <p aria-hidden="true" className="truncate text-2xs text-ink-500">
          {summary}
        </p>
        {/* Up here rather than beside the field, so the prompt keeps its width. */}
        <button
          type="button"
          onClick={onOpenIdeas}
          className="flex h-7 shrink-0 items-center gap-1 rounded-chip px-2 text-xs font-medium text-ink-600 focus-ring transition-colors duration-fast active:bg-panel-strong"
        >
          <Lightbulb aria-hidden="true" className="size-3.5" />
          Ideas
        </button>
      </div>
      {/* Shares the composer's name so the centred prompt morphs into the dock. */}
      <ViewTransition name="prompt-composer" share="morph" default="none">
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
      </ViewTransition>
    </section>
  );
}
