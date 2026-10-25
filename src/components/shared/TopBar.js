import { Headphones, Images } from 'lucide-react';
import { cn } from '@/lib/format';
import { BrandMark } from './BrandMark';
import { ThemeToggle } from './ThemeToggle';

const PILL_CLASS =
  'inline-flex h-8 items-center gap-1.5 rounded-chip border border-line bg-surface px-2 text-sm text-ink-600 shadow-sm transition-[color,border-color] duration-fast hover:border-line-strong hover:text-ink-900 focus-ring md:px-2.5 [&_svg]:size-4';

/**
 * Compact on phones (labels collapse to icons, Gallery lives in the history strip's
 * "View all"), the mockup's three-zone bar from tablet up.
 * @param {{ nav: React.ReactNode, onOpenGallery?: () => void, className?: string }} props
 */
export function TopBar({ nav, onOpenGallery, className }) {
  return (
    <header
      className={cn(
        'flex h-16 items-center justify-between gap-3 md:grid md:h-20 md:grid-cols-[1fr_auto_1fr]',
        className,
      )}
    >
      <div>
        <BrandMark />
      </div>
      {nav}
      <div className="flex items-center justify-end gap-2 md:gap-3">
        {onOpenGallery && (
          <button type="button" onClick={onOpenGallery} className={cn(PILL_CLASS, 'max-sm:hidden')}>
            <Images aria-hidden="true" />
            <span className="max-md:sr-only">Gallery</span>
          </button>
        )}
        <a href="mailto:support@fomi.art" className={cn(PILL_CLASS, 'max-sm:hidden')}>
          <Headphones aria-hidden="true" />
          <span className="max-md:sr-only">Support</span>
        </a>
        <ThemeToggle />
        <span
          role="img"
          aria-label="Signed in as Muhammad Amir"
          className="inline-flex size-8 items-center justify-center rounded-full bg-accent-100 text-xs font-semibold text-accent-700 ring-2 ring-surface"
        >
          MA
        </span>
      </div>
    </header>
  );
}
