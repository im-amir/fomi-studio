'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Image as ImageIcon, Video } from 'lucide-react';
import { Accordion } from '@/components/ui/Accordion';
import { Segmented } from '@/components/ui/Segmented';
import { Skeleton } from '@/components/ui/Skeleton';
import { getStylePreset } from '@/data/style-presets';
import { DEFAULT_REQUEST, MODES } from '@/lib/constants';
import { cn } from '@/lib/format';
import { PromptComposer } from './PromptComposer';
import { SettingsRow } from './SettingsRow';
import { StylePresetPicker } from './StylePresetPicker';

/** @import { ComposerSettings } from '@/hooks/useComposerSettings' */
/** @import { GenerateButtonState } from './GenerateButton' */

const AdvancedSettings = dynamic(() => import('./AdvancedSettings'), {
  loading: () => <Skeleton className="h-64 rounded-control" />,
});

const MODE_ICONS = {
  image: <ImageIcon aria-hidden="true" className="size-3.5" />,
  video: <Video aria-hidden="true" className="size-3.5" />,
};
const MODE_OPTIONS = MODES.map((mode) => ({ ...mode, icon: MODE_ICONS[mode.value] }));

/**
 * @param {{
 *   composer: ComposerSettings,
 *   buttonState: GenerateButtonState,
 *   onGenerate: () => void,
 *   onCancel: () => void,
 *   textareaRef: React.RefObject<HTMLTextAreaElement | null>,
 *   className?: string,
 * }} props
 */
export function ControlPanel({
  composer,
  buttonState,
  onGenerate,
  onCancel,
  textareaRef,
  className,
}) {
  const { settings, setMode, setPrompt, setAdvanced, setStyle } = composer;
  // Advanced settings are code-split; mount them on first open and keep them mounted
  // so the collapse animation has content to animate.
  const [advancedMounted, setAdvancedMounted] = useState(false);
  const changedAdvanced = Object.entries(settings.advanced).filter(
    ([key, value]) =>
      value !==
      DEFAULT_REQUEST.advanced[/** @type {keyof typeof DEFAULT_REQUEST.advanced} */ (key)],
  ).length;

  return (
    <aside
      aria-label="Generation settings"
      className={cn('flex flex-col gap-4 rounded-panel bg-panel p-4', className)}
    >
      <Segmented
        label="Output type"
        value={settings.mode}
        onChange={setMode}
        options={MODE_OPTIONS}
      />
      <PromptComposer
        value={settings.prompt}
        onChange={setPrompt}
        buttonState={buttonState}
        onGenerate={onGenerate}
        onCancel={onCancel}
        textareaRef={textareaRef}
      />
      <SettingsRow composer={composer} />
      <div className="flex flex-col gap-3">
        <Accordion
          title="Advanced"
          summary={changedAdvanced ? `${changedAdvanced} changed` : 'Default'}
          onOpenChange={(open) => open && setAdvancedMounted(true)}
        >
          {advancedMounted && <AdvancedSettings value={settings.advanced} onChange={setAdvanced} />}
        </Accordion>
        <Accordion title="Styles" summary={getStylePreset(settings.style)?.label ?? 'None'}>
          <StylePresetPicker value={settings.style} onChange={setStyle} />
        </Accordion>
      </div>
    </aside>
  );
}
