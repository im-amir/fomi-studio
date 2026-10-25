'use client';

import { AspectRatioIcon } from '@/components/shared/AspectRatioIcon';
import { Select } from '@/components/ui/Select';
import { MODELS } from '@/data/models';
import { ASPECT_RATIOS, IMAGE_COUNTS, VIDEO_COUNTS, getAspectRatio } from '@/lib/constants';

/** @import { ComposerSettings } from '@/hooks/useComposerSettings' */

const RATIO_OPTIONS = ASPECT_RATIOS.map((option) => ({
  value: option.value,
  label: option.value,
  description: option.label,
  icon: <AspectRatioIcon ratio={option.ratio} />,
}));

/**
 * Count · ratio · model: the three settings changed most often, one click away.
 * @param {{ composer: ComposerSettings, placement?: 'top' | 'bottom' }} props
 */
export function SettingsRow({ composer, placement = 'bottom' }) {
  const { settings, setCount, setAspectRatio, setModel } = composer;
  const isVideo = settings.mode === 'video';
  const noun = isVideo ? 'clips' : 'images';
  const counts = isVideo ? VIDEO_COUNTS : IMAGE_COUNTS;
  const models = MODELS.filter((model) => model.modes.includes(settings.mode));

  return (
    <div className="grid grid-cols-[auto_auto_minmax(0,1fr)] gap-1.5">
      <Select
        label={`Number of ${noun}`}
        value={settings.count}
        onChange={setCount}
        placement={placement}
        options={counts.map((value) => ({
          value,
          label: `${value} ${value === 1 ? noun.slice(0, -1) : noun}`,
        }))}
        renderValue={(option) => (
          <>
            <span aria-hidden="true" className="text-ink-500">
              #
            </span>
            {option.value}
          </>
        )}
      />
      <Select
        label="Aspect ratio"
        value={settings.aspectRatio}
        onChange={setAspectRatio}
        placement={placement}
        options={RATIO_OPTIONS}
        renderValue={(option) => (
          <>
            <AspectRatioIcon
              ratio={getAspectRatio(option.value).ratio}
              className="shrink-0 text-ink-500"
            />
            {option.label}
          </>
        )}
      />
      <Select
        label="Model"
        value={settings.model}
        onChange={setModel}
        placement={placement}
        align="end"
        options={models.map((model) => ({
          value: model.id,
          label: model.name,
          description: model.description,
        }))}
        renderValue={(option) => (
          <>
            <span className="text-ink-500">Model</span>
            <span className="truncate font-semibold">{option.label.replace('Fomi ', '')}</span>
          </>
        )}
      />
    </div>
  );
}
