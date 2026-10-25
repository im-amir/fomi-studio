import { Ban, Lock } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

/** @import { Direction } from '@/lib/studio/types' */

/**
 * The project's standing brief. Every take inherits it — palette, locked ingredients and
 * the avoid-list — so a prompt only has to say what's different this time.
 * @param {{ direction: Direction }} props
 */
export function DirectionBar({ direction }) {
  return (
    <section
      aria-labelledby="direction-title"
      className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-panel bg-panel px-5 py-3"
    >
      <div className="flex min-w-0 flex-1 basis-80 items-baseline gap-3">
        <h2
          id="direction-title"
          className="shrink-0 text-xs font-semibold tracking-wide text-accent-700 uppercase"
        >
          Direction
        </h2>
        <p className="truncate text-sm text-ink-600" title={direction.brief}>
          {direction.brief}
        </p>
      </div>

      <ul aria-label="Palette" className="flex -space-x-1.5">
        {direction.palette.map((swatch) => (
          <li key={swatch.hex}>
            <Tooltip content={`${swatch.name} ${swatch.hex}`} side="bottom">
              <span
                role="img"
                aria-label={swatch.name}
                tabIndex={0}
                className="block size-6 rounded-full ring-2 focus-ring ring-panel"
                style={{ backgroundColor: swatch.hex }}
              />
            </Tooltip>
          </li>
        ))}
      </ul>

      <ul aria-label="Locked for every take" className="flex flex-wrap gap-1.5">
        {direction.locked.map((item) => (
          <li
            key={item.label}
            title={item.value}
            className="inline-flex h-7 items-center gap-1.5 rounded-full bg-surface px-2.5 text-xs text-ink-900 shadow-sm"
          >
            <Lock aria-hidden="true" className="size-3 text-ink-500" />
            <span className="text-ink-500">{item.label}</span>
            <span className="max-w-40 truncate">{item.value}</span>
          </li>
        ))}
      </ul>

      <p className="flex items-center gap-1.5 text-xs text-ink-600">
        <Ban aria-hidden="true" className="size-3.5 text-ink-500" />
        <span className="sr-only">Avoid:</span>
        {direction.avoid.join(', ')}
      </p>
    </section>
  );
}
