import { cn } from '@/lib/format';
import { Tooltip } from './Tooltip';

const VARIANTS = {
  ghost: 'text-ink-600 hover:bg-panel-strong hover:text-ink-900 active:bg-panel-strong',
  secondary: 'border border-line bg-surface text-ink-900 shadow-sm hover:border-line-strong',
  // Sits on top of media: needs its own backdrop to stay legible on any image.
  overlay: 'bg-surface/90 text-ink-900 shadow-sm backdrop-blur-sm hover:bg-surface',
};

const SIZES = {
  sm: 'size-8 rounded-chip [&_svg]:size-4',
  md: 'size-10 rounded-control [&_svg]:size-[18px]',
};

/**
 * Icon-only button. `label` is required: it is the accessible name and the tooltip text.
 * Size md is 40px to meet the touch-target minimum; sm is for dense desktop toolbars
 * where a parent provides the extra hit area.
 *
 * @param {{
 *   label: string,
 *   variant?: keyof typeof VARIANTS,
 *   size?: keyof typeof SIZES,
 *   tooltip?: boolean,
 *   tooltipSide?: 'top' | 'bottom',
 *   pressed?: boolean,
 * } & Omit<React.ComponentPropsWithRef<'button'>, 'aria-label'>} props
 */
export function IconButton({
  label,
  variant = 'ghost',
  size = 'md',
  tooltip = true,
  tooltipSide = 'top',
  pressed,
  className,
  children,
  type = 'button',
  ...rest
}) {
  const button = (
    <button
      type={type}
      aria-label={label}
      aria-pressed={pressed}
      className={cn(
        'inline-flex shrink-0 items-center justify-center focus-ring transition-[background-color,border-color,color,scale] duration-fast active:scale-[0.94]',
        'disabled:opacity-40 disabled:active:scale-100',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );

  return tooltip ? (
    <Tooltip content={label} side={tooltipSide}>
      {button}
    </Tooltip>
  ) : (
    button
  );
}
