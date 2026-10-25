'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/format';

const PARTS = [
  { href: '/', label: 'A · Mockup' },
  { href: '/studio', label: 'B · Studio' },
];

/** Lets reviewers hop between the two assessment parts. */
export function PartSwitcher() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Assessment parts"
      className="fixed bottom-4 left-4 z-50 flex rounded-full border border-line bg-surface/90 p-1 text-xs shadow-md backdrop-blur max-lg:hidden"
    >
      {PARTS.map((part) => {
        const current = part.href === pathname;
        return (
          <Link
            key={part.href}
            href={part.href}
            aria-current={current ? 'page' : undefined}
            className={cn(
              'rounded-full px-3 py-1.5 font-medium focus-ring transition-colors duration-fast',
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
