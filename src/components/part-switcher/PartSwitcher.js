'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/format';

const PARTS = [
  { href: '/', label: 'A · Mockup' },
  { href: '/studio', label: 'B · Studio' },
];

/**
 * Lets reviewers hop between the two assessment parts. Floats bottom-left on desktop;
 * on smaller screens it sits at the end of the page so it never covers content or the
 * phone dock.
 */
export function PartSwitcher() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Assessment parts"
      className="fixed bottom-4 left-4 z-50 flex rounded-full border border-line bg-surface/90 p-1 text-xs shadow-md backdrop-blur max-lg:static max-lg:mx-auto max-lg:mt-2 max-lg:mb-8 max-lg:w-fit max-md:mb-40"
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
