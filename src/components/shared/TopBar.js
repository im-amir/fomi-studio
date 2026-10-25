import { Headphones, Images } from 'lucide-react';
import { cn } from '@/lib/format';
import { BrandMark } from './BrandMark';
import { ThemeToggle } from './ThemeToggle';

const PILL_CLASS =
  'inline-flex h-8 items-center gap-1.5 rounded-chip border border-line bg-surface px-2.5 text-sm text-ink-600 shadow-sm transition-[color,border-color] duration-fast hover:border-line-strong hover:text-ink-900 focus-ring [&_svg]:size-4';

/**
 * @param {{ nav: React.ReactNode, onOpenGallery: () => void, className?: string }} props
 */
export function TopBar({ nav, onOpenGallery, className }) {
  return (
    <header className={cn('grid h-20 grid-cols-[1fr_auto_1fr] items-center', className)}>
      <div>
        <BrandMark />
      </div>
      {nav}
      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={onOpenGallery} className={PILL_CLASS}>
          <Images aria-hidden="true" />
          Gallery
        </button>
        <a href="mailto:support@fomi.art" className={PILL_CLASS}>
          <Headphones aria-hidden="true" />
          Support
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
