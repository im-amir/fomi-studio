import { cn } from '@/lib/format';
import { Spinner } from './Spinner';

const BASE =
  'relative inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-medium ' +
  'transition-[background-color,border-color,color,box-shadow,scale] duration-fast ' +
  'active:scale-[0.97] aria-disabled:active:scale-100 focus-ring';

const VARIANTS = {
  primary:
    'bg-accent-600 text-on-accent shadow-sm hover:bg-accent-700 ' +
    'aria-disabled:bg-panel-strong aria-disabled:hover:bg-panel-strong aria-disabled:text-ink-500 aria-disabled:shadow-none',
  secondary:
    'border border-line bg-surface text-ink-900 shadow-sm hover:border-line-strong active:bg-panel ' +
    'aria-disabled:text-ink-500 aria-disabled:hover:border-line',
  ghost:
    'text-ink-600 hover:bg-panel-strong hover:text-ink-900 active:bg-panel-strong ' +
    'aria-disabled:text-ink-500 aria-disabled:hover:bg-transparent aria-disabled:hover:text-ink-500',
};

const SIZES = {
  sm: 'h-8 gap-1.5 rounded-control px-3 text-sm',
  md: 'h-10 gap-2 rounded-control px-4 text-base',
  lg: 'h-11 gap-2 rounded-full px-5 text-md',
};

/**
 * @typedef {object} ButtonOwnProps
 * @property {keyof typeof VARIANTS} [variant]
 * @property {keyof typeof SIZES} [size]
 * @property {boolean} [loading]      shows a spinner in place of the icon; keeps the width stable
 * @property {React.ReactNode} [icon] leading icon
 */

/**
 * Disabled buttons use aria-disabled instead of the disabled attribute so they stay
 * focusable and can explain *why* they're disabled (tooltip / aria-describedby).
 * @param {ButtonOwnProps & React.ComponentPropsWithRef<'button'>} props
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  className,
  children,
  onClick,
  type = 'button',
  ...rest
}) {
  const inert = disabled || loading;
  return (
    <button
      type={type}
      aria-disabled={disabled || undefined}
      aria-busy={loading || undefined}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      onClick={
        onClick &&
        ((event) => {
          if (inert) {
            event.preventDefault();
            return;
          }
          onClick(event);
        })
      }
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
}
