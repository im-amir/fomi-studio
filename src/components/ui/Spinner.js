import { cn } from '@/lib/format';

/**
 * Decorative by default — the control that owns it should expose the busy state
 * (aria-busy / live region), not the spinner.
 * @param {{ className?: string, size?: number }} props
 */
export function Spinner({ className, size = 16 }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn('animate-spin', className)}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
