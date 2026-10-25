'use client';

import Image from 'next/image';
import { Columns2, Heart, PanelBottomOpen, ThumbsDown } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/format';
import { squareCrop } from '@/lib/media';

/** @import { Generation } from '@/lib/types' */

/**
 * Below desktop the inspector doesn't fit beside the canvas, so the selection lives in a
 * bar under the thumb: the quick decisions (40px targets) and Details, which opens the
 * full inspector and branch composer as a sheet.
 * @param {{
 *   item: Generation,
 *   label: string,
 *   branchName?: string,
 *   picked: boolean,
 *   rejected: boolean,
 *   comparing: boolean,
 *   onTogglePick: () => void,
 *   onToggleReject: () => void,
 *   onToggleCompare: () => void,
 *   onOpenDetails: () => void,
 * }} props
 */
export function SelectionBar({
  item,
  label,
  branchName,
  picked,
  rejected,
  comparing,
  onTogglePick,
  onToggleReject,
  onToggleCompare,
  onOpenDetails,
}) {
  return (
    <section
      aria-label="Selected image"
      className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-canvas/95 px-3 pt-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] backdrop-blur-md lg:hidden"
    >
      <button
        type="button"
        onClick={onOpenDetails}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-control text-left focus-ring"
      >
        <span className="relative size-11 shrink-0 overflow-hidden rounded-chip bg-panel-strong">
          <Image src={squareCrop(item.src)} alt="" fill sizes="44px" className="object-cover" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-ink-900">{label}</span>
          {branchName && <span className="block truncate text-xs text-ink-500">{branchName}</span>}
        </span>
      </button>
      <div className="flex shrink-0 gap-1">
        <IconButton
          label={picked ? 'Unpick' : 'Pick'}
          pressed={picked}
          tooltip={false}
          onClick={onTogglePick}
        >
          <Heart className={cn(picked && 'fill-accent-600 text-accent-600')} />
        </IconButton>
        <IconButton
          label="Reject"
          pressed={rejected}
          tooltip={false}
          onClick={onToggleReject}
          className={cn(rejected && 'bg-panel-strong')}
        >
          <ThumbsDown />
        </IconButton>
        <IconButton
          label="Compare"
          pressed={comparing}
          tooltip={false}
          onClick={onToggleCompare}
          className={cn(comparing && 'bg-accent-100')}
        >
          <Columns2 />
        </IconButton>
        <IconButton
          label="Details and branch"
          variant="secondary"
          tooltip={false}
          onClick={onOpenDetails}
        >
          <PanelBottomOpen />
        </IconButton>
      </div>
    </section>
  );
}
