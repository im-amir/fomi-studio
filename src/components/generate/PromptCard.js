'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { Copy, CornerUpLeft, EyeOff } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { getModel } from '@/data/models';
import { getStylePreset } from '@/data/style-presets';
import { useNow } from '@/hooks/useNow';
import { cn, formatRelativeTime } from '@/lib/format';

/** @import { Batch } from '@/lib/types' */

/**
 * The prompt and settings behind a batch, so results never lose their context.
 * Long prompts clamp with a "Show more" toggle; actions appear on hover/focus and are
 * always visible on touch screens.
 * @param {{
 *   batch: Pick<Batch, 'prompt' | 'model' | 'aspectRatio' | 'style' | 'mode'> & { createdAt?: string },
 *   status?: React.ReactNode,
 *   onCopy?: () => void,
 *   onReuse?: () => void,
 *   onHide?: () => void,
 *   className?: string,
 * }} props
 */
export function PromptCard({ batch, status, onCopy, onReuse, onHide, className }) {
  const now = useNow();
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  /** @type {React.RefObject<HTMLParagraphElement | null>} */
  const textRef = useRef(null);
  const model = getModel(batch.model);
  const style = getStylePreset(batch.style);

  useLayoutEffect(() => {
    const element = textRef.current;
    if (!element || expanded) return;
    const measure = () => setClamped(element.scrollHeight > element.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [batch.prompt, expanded]);

  const hasActions = Boolean(onCopy || onReuse || onHide);

  return (
    <article
      className={cn(
        'group/card relative flex flex-col gap-3 self-start rounded-panel bg-panel p-4',
        className,
      )}
    >
      {hasActions && (
        <div className="absolute top-2 right-2 flex gap-0.5 rounded-control bg-panel opacity-0 transition-opacity duration-base group-focus-within/card:opacity-100 group-hover/card:opacity-100 pointer-coarse:opacity-100">
          {onCopy && (
            <IconButton label="Copy prompt" size="sm" onClick={onCopy}>
              <Copy />
            </IconButton>
          )}
          {onReuse && (
            <IconButton label="Reuse prompt and settings" size="sm" onClick={onReuse}>
              <CornerUpLeft />
            </IconButton>
          )}
          {onHide && (
            <IconButton label="Hide from canvas" size="sm" onClick={onHide}>
              <EyeOff />
            </IconButton>
          )}
        </div>
      )}

      <div>
        <p ref={textRef} className={cn('text-sm text-ink-600', !expanded && 'line-clamp-[12]')}>
          {batch.prompt}
        </p>
        {(clamped || expanded) && (
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
            className="mt-1 rounded-sm text-sm font-medium text-accent-600 focus-ring hover:text-accent-700"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {status}

      <footer className="mt-auto flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-ink-500">
          {[
            batch.mode === 'video' ? 'Video' : null,
            batch.aspectRatio,
            style?.label,
            batch.createdAt && now ? formatRelativeTime(batch.createdAt, now) : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <Chip className="bg-surface shadow-sm">{model?.name ?? 'Model'}</Chip>
      </footer>
    </article>
  );
}
