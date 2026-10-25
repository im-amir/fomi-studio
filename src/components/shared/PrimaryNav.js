'use client';

import Link from 'next/link';
import { Folder, House, Image as ImageIcon, Video, WandSparkles } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/format';

/** @import { Mode } from '@/lib/types' */

const ITEM_CLASS =
  'inline-flex size-10 items-center justify-center rounded-control transition-[color,background-color,scale] duration-fast focus-ring [&_svg]:size-5';

/**
 * @typedef {{ id: string, label: string, icon: React.ReactNode, desktopOnly?: boolean }
 *   & ({ kind: 'link', href: string } | { kind: 'mode', mode: Mode } | { kind: 'soon' })} NavItem
 */

// On phones only the tools that do something there stay (Home duplicates the logo,
// Edit isn't built yet).
/** @type {NavItem[]} */
const ITEMS = [
  { id: 'home', label: 'Home', icon: <House />, kind: 'link', href: '/', desktopOnly: true },
  { id: 'image', label: 'Image', icon: <ImageIcon />, kind: 'mode', mode: 'image' },
  { id: 'video', label: 'Video', icon: <Video />, kind: 'mode', mode: 'video' },
  {
    id: 'edit',
    label: 'Edit — coming soon',
    icon: <WandSparkles />,
    kind: 'soon',
    desktopOnly: true,
  },
  { id: 'projects', label: 'Projects', icon: <Folder />, kind: 'link', href: '/studio' },
];
const MOBILE_ITEMS = ITEMS.filter((item) => !item.desktopOnly);

/**
 * Tool switcher. The coral bar on the track slides to the active tool, so switching
 * Image ↔ Video here or in the panel animates the same indicator. Column count and
 * active index switch per breakpoint through CSS variables — no JS, no hydration flash.
 *
 * Without `onModeChange` (outside the generator) Image/Video link back to it.
 * @param {{ activeId: string, onModeChange?: (mode: Mode) => void }} props
 */
export function PrimaryNav({ activeId, onModeChange }) {
  /** @param {NavItem} item */
  const isActive = (item) => item.id === activeId;
  const vars = /** @type {React.CSSProperties} */ ({
    '--cols-sm': MOBILE_ITEMS.length,
    '--cols-md': ITEMS.length,
    '--active-sm': MOBILE_ITEMS.findIndex(isActive),
    '--active-md': ITEMS.findIndex(isActive),
  });

  return (
    <nav
      aria-label="Tools"
      style={vars}
      className="relative pt-3 [--active:var(--active-sm)] [--cols:var(--cols-sm)] [--item:2.75rem] md:[--active:var(--active-md)] md:[--cols:var(--cols-md)] md:[--item:4.5rem]"
    >
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 rounded-full bg-panel">
        <span className="absolute inset-y-0 left-0 w-[calc(100%/var(--cols))] translate-x-[calc(var(--active)*100%)] px-2 transition-[translate] duration-slow md:px-3">
          <span className="block h-full rounded-full bg-accent-500" />
        </span>
      </div>
      <ul className="grid grid-cols-[repeat(var(--cols),var(--item))]">
        {ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <li
              key={item.id}
              className={cn('flex justify-center', item.desktopOnly && 'max-md:hidden')}
            >
              <Tooltip content={item.label} side="bottom">
                {item.kind === 'link' || (item.kind === 'mode' && !onModeChange) ? (
                  <Link
                    href={item.kind === 'link' ? item.href : '/'}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      ITEM_CLASS,
                      active ? 'text-ink-900' : 'text-ink-600 hover:bg-panel hover:text-ink-900',
                    )}
                  >
                    {item.icon}
                  </Link>
                ) : (
                  <button
                    type="button"
                    aria-label={item.label}
                    aria-pressed={item.kind === 'mode' ? active : undefined}
                    aria-disabled={item.kind === 'soon' || undefined}
                    onClick={item.kind === 'mode' ? () => onModeChange?.(item.mode) : undefined}
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
