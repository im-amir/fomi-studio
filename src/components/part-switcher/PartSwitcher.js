'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/format';

const PARTS = [
  { href: '/', label: 'A · Mockup' },
  { href: '/studio', label: 'B · Studio' },
];

const PLACEMENTS = {
  // Beside the logo on desktop: always visible, never over content.
  bar: 'max-lg:hidden',
  // Smaller screens: at the end of the page, clear of the phone's docked composer.
  page: 'mx-auto mt-2 mb-8 w-fit max-md:mb-40 lg:hidden',
};

/**
 * Lets reviewers hop between the two assessment parts.
 * @param {{ placement: keyof typeof PLACEMENTS }} props
 */
export function PartSwitcher({ placement }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Assessment parts"
      className={cn(
        'flex rounded-full border border-line bg-surface p-1 text-xs shadow-sm',
        PLACEMENTS[placement],
      )}
    >
      {PARTS.map((part) => {
        const current = part.href === pathname;
        return (
          <Link
            key={part.href}
            href={part.href}
            aria-current={current ? 'page' : undefined}
            className={cn(
              'rounded-full px-3 py-1.5 font-medium whitespace-nowrap focus-ring transition-colors duration-fast',
              current ? 'bg-ink-900 text-canvas' : 'text-ink-600 hover:text-ink-900',
            )}
          >
            {part.label}
          </Link>
        );
      })}
    </nav>
  );
}
