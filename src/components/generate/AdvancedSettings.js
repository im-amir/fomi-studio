'use client';

import { Dices } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { Segmented } from '@/components/ui/Segmented';
import { GUIDANCE, NEGATIVE_PROMPT_MAX_LENGTH, QUALITIES, SEED_MAX } from '@/lib/constants';

/** @import { AdvancedSettings as AdvancedSettingsValue } from '@/lib/types' */

const FIELD_CLASS =
  'w-full rounded-control border border-line-strong bg-surface px-3 text-sm text-ink-900 transition-[border-color] duration-fast placeholder:text-ink-500 hover:border-ink-600 focus-ring';

/**
 * Power settings most runs never touch, so they live behind the Advanced disclosure and
 * are code-split (loaded the first time it opens).
 * @param {{ value: AdvancedSettingsValue, onChange: (patch: Partial<AdvancedSettingsValue>) => void }} props
 */
export default function AdvancedSettings({ value, onChange }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="seed" className="text-sm font-medium text-ink-900">
            Seed
          </label>
          <span id="seed-hint" className="text-xs text-ink-500">
            Fix it to reproduce a result
          </span>
        </div>
        <div className="mt-1.5 flex gap-2">
          <input
            id="seed"
            inputMode="numeric"
            aria-describedby="seed-hint"
            placeholder="Random"
            value={value.seed ?? ''}
            onChange={(event) => {
              const digits = event.target.value.replace(/\D/g, '');
              onChange({ seed: digits ? Math.min(Number(digits), SEED_MAX) : null });
            }}
            className={`${FIELD_CLASS} h-9 font-mono tabular-nums`}
          />
          <IconButton
            label="Roll a new seed"
            variant="secondary"
            size="sm"
            className="size-9"
            onClick={() => onChange({ seed: Math.floor(Math.random() * SEED_MAX) })}
          >
            <Dices />
          </IconButton>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="guidance" className="text-sm font-medium text-ink-900">
            Guidance
          </label>
          <output htmlFor="guidance" className="text-sm text-ink-600 tabular-nums">
            {value.guidance.toFixed(1)}
          </output>
        </div>
        <input
          id="guidance"
          type="range"
          min={GUIDANCE.min}
          max={GUIDANCE.max}
          step={GUIDANCE.step}
          value={value.guidance}
          aria-describedby="guidance-hint"
          onChange={(event) => onChange({ guidance: Number(event.target.value) })}
          className="mt-2 w-full cursor-pointer accent-accent-600"
        />
        <p id="guidance-hint" className="flex justify-between text-xs text-ink-500">
          <span>Looser</span>
          <span>Closer to prompt</span>
        </p>
      </div>

      <div>
        <label htmlFor="negative-prompt" className="text-sm font-medium text-ink-900">
          Avoid
        </label>
        <textarea
          id="negative-prompt"
          rows={2}
          maxLength={NEGATIVE_PROMPT_MAX_LENGTH}
          placeholder="e.g. text, watermark, extra fingers"
          value={value.negativePrompt}
          onChange={(event) => onChange({ negativePrompt: event.target.value })}
          className={`${FIELD_CLASS} mt-1.5 resize-none py-2`}
        />
      </div>

      <div>
        <p aria-hidden="true" className="text-sm font-medium text-ink-900">
          Quality
        </p>
        <Segmented
          label="Quality"
          className="mt-1.5 border border-line"
          value={value.quality}
          onChange={(quality) => onChange({ quality })}
          options={QUALITIES}
        />
      </div>
    </div>
  );
}
