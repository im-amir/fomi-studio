'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Accordion } from '@/components/ui/Accordion';
import { Skeleton } from '@/components/ui/Skeleton';
import { getStylePreset } from '@/data/style-presets';
import { DEFAULT_REQUEST } from '@/lib/constants';
import { SettingsRow } from './SettingsRow';
import { StylePresetPicker } from './StylePresetPicker';

/** @import { ComposerSettings } from '@/hooks/useComposerSettings' */

/** "None", "Film", "Film, Anime" or "Film +2" — short enough for the collapsed row. */
function stylesSummary(/** @type {string[]} */ ids) {
  const labels = ids.flatMap((id) => getStylePreset(id)?.label ?? []);
  if (labels.length === 0) return 'None';
  return labels.length <= 2 ? labels.join(', ') : `${labels[0]} +${labels.length - 1}`;
}

const AdvancedSettings = dynamic(() => import('./AdvancedSettings'), {
  loading: () => <Skeleton className="h-64 rounded-control" />,
});

/**
 * Count/ratio/model, Advanced and Styles — shared by the desktop/tablet panel and the
 * phone settings sheet so both stay identical.
 * @param {{ composer: ComposerSettings }} props
 */
export function GenerationSettings({ composer }) {
  const { settings, setAdvanced, toggleStyle } = composer;
  // Advanced settings are code-split; mount them on first open and keep them mounted
  // so the collapse animation has content to animate.
  const [advancedMounted, setAdvancedMounted] = useState(false);
  const changedAdvanced = Object.entries(settings.advanced).filter(
    ([key, value]) =>
      value !==
      DEFAULT_REQUEST.advanced[/** @type {keyof typeof DEFAULT_REQUEST.advanced} */ (key)],
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <SettingsRow composer={composer} />
      <div className="flex flex-col gap-3">
        <Accordion
          title="Advanced"
          summary={changedAdvanced ? `${changedAdvanced} changed` : 'Default'}
          onOpenChange={(open) => open && setAdvancedMounted(true)}
        >
          {advancedMounted && <AdvancedSettings value={settings.advanced} onChange={setAdvanced} />}
        </Accordion>
        <Accordion title="Styles" summary={stylesSummary(settings.styles)}>
          <StylePresetPicker value={settings.styles} onToggle={toggleStyle} />
        </Accordion>
      </div>
    </div>
  );
}
