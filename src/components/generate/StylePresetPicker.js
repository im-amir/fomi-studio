'use client';

import Image from 'next/image';
import { Chip } from '@/components/ui/Chip';
import { STYLE_PRESETS, STYLE_PREVIEW_PHOTO_ID } from '@/data/style-presets';
import { cn } from '@/lib/format';
import styles from './StylePresetPicker.module.css';

const PREVIEW_SRC = `https://images.unsplash.com/photo-${STYLE_PREVIEW_PHOTO_ID}?ar=1:1&fit=crop&crop=faces`;

/**
 * Toggle chips: selecting the active preset again clears it (no style = model default).
 * @param {{ value: string | null, onChange: (value: string | null) => void }} props
 */
export function StylePresetPicker({ value, onChange }) {
  return (
    <ul aria-label="Style presets" className="flex flex-wrap gap-2">
      {STYLE_PRESETS.map((preset) => (
        <li key={preset.id}>
          <Chip
            selected={value === preset.id}
            onClick={() => onChange(value === preset.id ? null : preset.id)}
            leading={
              <span className="relative size-6 shrink-0 overflow-hidden rounded-full">
                <Image
                  src={PREVIEW_SRC}
                  alt=""
                  fill
                  sizes="24px"
                  className={cn('object-cover', styles[preset.id])}
                />
              </span>
            }
          >
            {preset.label}
          </Chip>
        </li>
      ))}
    </ul>
  );
}
