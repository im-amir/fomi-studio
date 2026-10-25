import { cn } from '@/lib/format';

const BASE =
  'inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-full border text-sm font-medium transition-[background-color,border-color,color,scale] duration-fast';

const TONES = {
  neutral: 'border-line bg-surface text-ink-900',
  accent: 'border-transparent bg-accent-100 text-ink-900',
};

/**
 * Compact pill. Renders a toggle button when `onClick` is given (with aria-pressed when
 * `selected` is defined), otherwise a static label such as a model tag.
 *
 * @param {{
 *   children: React.ReactNode,
 *   leading?: React.ReactNode,
 *   selected?: boolean,
 *   tone?: keyof typeof TONES,
 *   className?: string,
 *   onClick?: React.MouseEventHandler<HTMLButtonElement>,
 * } & Omit<React.ComponentPropsWithRef<'button'>, 'onClick'>} props
 */
export function Chip({
  children,
  leading,
  selected,
  tone = 'neutral',
  className,
  onClick,
  ...rest
}) {
  const padding = leading ? 'h-8 pl-1 pr-3' : 'h-8 px-3';

  if (!onClick) {
    return (
      <span className={cn(BASE, padding, TONES[tone], className)}>
        {leading}
        {children}
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        BASE,
        padding,
        'focus-ring active:scale-[0.96]',
        selected
          ? 'border-accent-600 bg-accent-100 text-ink-900'
          : cn(TONES[tone], 'hover:border-line-strong'),
        className,
      )}
      {...rest}
    >
      {leading}
      <span className="truncate">{children}</span>
    </button>
  );
}
