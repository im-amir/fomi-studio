'use client';

import { useState } from 'react';
import { Download, Heart, Image as ImageIcon, Plus, Sparkles, Video } from 'lucide-react';
import { AspectRatioIcon } from '@/components/shared/AspectRatioIcon';
import { Accordion } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { Kbd } from '@/components/ui/Kbd';
import { Segmented } from '@/components/ui/Segmented';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tooltip } from '@/components/ui/Tooltip';
import { MODELS } from '@/data/models';
import { STYLE_PRESETS } from '@/data/style-presets';
import { useModifierKey } from '@/hooks/useModifierKey';
import { ASPECT_RATIOS, IMAGE_COUNTS } from '@/lib/constants';

/** @param {{ title: string, children: React.ReactNode }} props */
function Row({ title, children }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[10rem_1fr] sm:items-center">
      <h3 className="text-sm font-medium text-ink-500">{title}</h3>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export function PrimitivesShowcase() {
  const mod = useModifierKey();
  const [mode, setMode] = useState(/** @type {'image' | 'video'} */ ('image'));
  const [count, setCount] = useState(4);
  const [ratio, setRatio] = useState(/** @type {import('@/lib/types').AspectRatioId} */ ('4:5'));
  const [model, setModel] = useState(MODELS[0].id);
  const [style, setStyle] = useState(/** @type {string | null} */ ('cinematic'));
  const [favorite, setFavorite] = useState(false);

  return (
    <section
      aria-labelledby="primitives-title"
      className="flex flex-col gap-6 rounded-panel bg-panel p-6"
    >
      <h2 id="primitives-title" className="text-lg font-semibold text-ink-900">
        Primitives
      </h2>

      <Row title="Button">
        <Button icon={<Plus className="size-4" />}>Generate</Button>
        <Button variant="secondary">Reuse prompt</Button>
        <Button variant="ghost">Cancel</Button>
        <Button loading>Generating</Button>
        <Tooltip id="demo-disabled-hint" content="Write a prompt first">
          <Button disabled aria-describedby="demo-disabled-hint">
            Generate
          </Button>
        </Tooltip>
        <Button size="lg" icon={<Sparkles className="size-4" />}>
          Generate
        </Button>
      </Row>

      <Row title="IconButton">
        <IconButton label="Download">
          <Download />
        </IconButton>
        <IconButton label="Download" variant="secondary">
          <Download />
        </IconButton>
        <IconButton
          label={favorite ? 'Remove from favourites' : 'Add to favourites'}
          variant="overlay"
          pressed={favorite}
          onClick={() => setFavorite((value) => !value)}
        >
          <Heart className={favorite ? 'fill-accent-600 text-accent-600' : undefined} />
        </IconButton>
        <IconButton label="Download" disabled>
          <Download />
        </IconButton>
      </Row>

      <Row title="Segmented">
        <Segmented
          label="Output type"
          className="w-56"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'image', label: 'Image', icon: <ImageIcon className="size-3.5" /> },
            { value: 'video', label: 'Video', icon: <Video className="size-3.5" /> },
          ]}
        />
      </Row>

      <Row title="Select">
        <Select
          label="Number of images"
          className="w-28"
          value={count}
          onChange={setCount}
          options={IMAGE_COUNTS.map((value) => ({ value, label: `${value} images` }))}
          renderValue={(option) => (
            <>
              <span className="text-ink-500">#</span> {option.value}
            </>
          )}
        />
        <Select
          label="Aspect ratio"
          className="w-24"
          value={ratio}
          onChange={setRatio}
          options={ASPECT_RATIOS.map((option) => ({
            value: option.value,
            label: option.value,
            description: option.label,
            icon: <AspectRatioIcon ratio={option.ratio} />,
          }))}
        />
        <Select
          label="Model"
          className="w-48"
          value={model}
          onChange={setModel}
          options={MODELS.map((option) => ({
            value: option.id,
            label: option.name,
            description: option.description,
          }))}
          renderValue={(option) => (
            <>
              <span className="text-ink-500">Model</span>{' '}
              <span className="font-semibold">{option.label}</span>
            </>
          )}
        />
      </Row>

      <Row title="Chip">
        {STYLE_PRESETS.slice(0, 4).map((preset) => (
          <Chip
            key={preset.id}
            selected={style === preset.id}
            onClick={() => setStyle((current) => (current === preset.id ? null : preset.id))}
          >
            {preset.label}
          </Chip>
        ))}
        <Chip tone="accent">Fomi Portrait</Chip>
      </Row>

      <Row title="Kbd">
        <span className="flex items-center gap-1 text-sm text-ink-600">
          {mod && <Kbd>{mod}</Kbd>}
          <Kbd>↵</Kbd> to generate
        </span>
      </Row>

      <Row title="Accordion">
        <div className="flex w-72 flex-col gap-3">
          <Accordion title="Advanced" summary="Seed: random">
            <p className="text-sm text-ink-600">
              Seed, guidance, negative prompt and quality live here.
            </p>
          </Accordion>
          <Accordion title="Styles" defaultOpen>
            <p className="text-sm text-ink-600">Style presets render here.</p>
          </Accordion>
        </div>
      </Row>

      <Row title="Skeleton">
        {ASPECT_RATIOS.map((option) => (
          <Skeleton
            key={option.value}
            aspectRatio={`${option.ratio[0]} / ${option.ratio[1]}`}
            className="w-24 rounded-media"
          />
        ))}
      </Row>
    </section>
  );
}
