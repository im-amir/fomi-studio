'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { Copy, CornerUpLeft, EyeOff } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { getModel } from '@/data/models';
import { useNow } from '@/hooks/useNow';
import { cn, formatRelativeTime } from '@/lib/format';

/**
 * The prompt and settings behind a batch, so results never lose their context.
 *
 * On wide screens the card fills exactly the height of its row (the images decide it), so
 * every batch reads as one aligned block. A prompt that doesn't fit fades out; "Show
 * more" releases the card to its natural height and the row grows with it.
 *
 * @param {{
 *   prompt: string,
 *   model: string,
 *   recipe: string[],
 *   createdAt?: string,
 *   status?: React.ReactNode,
 *   onCopy?: () => void,
 *   onReuse?: () => void,
 *   onHide?: () => void,
 * }} props
 */
export function PromptCard({ prompt, model, recipe, createdAt, status, onCopy, onReuse, onHide }) {
  const now = useNow();
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  /** @type {React.RefObject<HTMLDivElement | null>} */
  const textRef = useRef(null);

  useLayoutEffect(() => {
    const element = textRef.current;
    if (!element || expanded) return;
    const measure = () => setOverflowing(element.scrollHeight > element.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [prompt, expanded]);

  const time = createdAt && now ? formatRelativeTime(createdAt, now) : null;

  return (
    <div className="relative xl:min-h-56">
      <article
        className={cn(
          'flex flex-col gap-3 rounded-panel bg-panel p-4',
          !expanded && 'xl:absolute xl:inset-0',
        )}
      >
        <div
          ref={textRef}
          className={cn(
            'relative min-h-0 flex-1 overflow-hidden',
            expanded ? 'overflow-visible' : 'max-xl:max-h-[4.5rem]',
          )}
        >
          <p className="text-sm text-ink-600">{prompt}</p>
          {overflowing && !expanded && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-panel to-transparent"
            />
          )}
        </div>
        {(overflowing || expanded) && (
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
            className="-mt-1 self-start rounded-sm text-sm font-medium text-accent-700 focus-ring hover:text-ink-900"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}

        {status}

        <p className="text-xs text-ink-500">{[...recipe, time].filter(Boolean).join(' · ')}</p>

        <footer className="flex items-center justify-between gap-2">
          <Chip className="min-w-0 bg-surface shadow-sm">{getModel(model)?.name ?? 'Model'}</Chip>
          <div className="-mr-1.5 flex shrink-0">
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
        </footer>
      </article>
    </div>
  );
}
