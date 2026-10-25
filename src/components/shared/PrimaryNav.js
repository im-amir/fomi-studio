'use client';

import Link from 'next/link';
import { Folder, House, Image as ImageIcon, Video, WandSparkles } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/format';

/** @import { Mode } from '@/lib/types' */

const ITEM_CLASS =
  'inline-flex size-10 items-center justify-center rounded-control transition-[color,background-color,scale] duration-fast focus-ring [&_svg]:size-5';

/**
 * @typedef {{ id: string, label: string, icon: React.ReactNode }
 *   & ({ kind: 'link', href: string } | { kind: 'mode', mode: Mode } | { kind: 'soon' })} NavItem
 */

/** @type {NavItem[]} */
const ITEMS = [
  { id: 'home', label: 'Home', icon: <House />, kind: 'link', href: '/' },
  { id: 'image', label: 'Image', icon: <ImageIcon />, kind: 'mode', mode: 'image' },
  { id: 'video', label: 'Video', icon: <Video />, kind: 'mode', mode: 'video' },
  { id: 'edit', label: 'Edit — coming soon', icon: <WandSparkles />, kind: 'soon' },
  { id: 'projects', label: 'Projects', icon: <Folder />, kind: 'link', href: '/studio' },
];

/**
 * Tool switcher. The coral bar on the track slides to the active tool, so switching
 * Image ↔ Video here or in the panel animates the same indicator.
 * @param {{ mode: Mode, onModeChange: (mode: Mode) => void }} props
 */
export function PrimaryNav({ mode, onModeChange }) {
  const activeIndex = ITEMS.findIndex((item) => item.kind === 'mode' && item.mode === mode);

  return (
    <nav aria-label="Tools" className="relative pt-3">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 rounded-full bg-panel">
        <span
          className="absolute inset-y-0 left-0 px-3 transition-transform duration-slow"
          style={{
            width: `${100 / ITEMS.length}%`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        >
          <span className="block h-full rounded-full bg-accent-500" />
        </span>
      </div>
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${ITEMS.length}, 4.5rem)` }}>
        {ITEMS.map((item, index) => {
          const active = index === activeIndex;
          return (
            <li key={item.id} className="flex justify-center">
              <Tooltip content={item.label} side="bottom">
                {item.kind === 'link' ? (
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    className={cn(ITEM_CLASS, 'text-ink-600 hover:bg-panel hover:text-ink-900')}
                  >
                    {item.icon}
                  </Link>
                ) : (
                  <button
                    type="button"
                    aria-label={item.label}
                    aria-pressed={item.kind === 'mode' ? active : undefined}
                    aria-disabled={item.kind === 'soon' || undefined}
                    onClick={item.kind === 'mode' ? () => onModeChange(item.mode) : undefined}
                    className={cn(
                      ITEM_CLASS,
                      item.kind === 'soon' ? 'text-ink-500' : 'active:scale-[0.94]',
                      active
                        ? 'text-ink-900'
                        : item.kind === 'mode' && 'text-ink-600 hover:bg-panel hover:text-ink-900',
                    )}
                  >
                    {item.icon}
                  </button>
                )}
              </Tooltip>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
