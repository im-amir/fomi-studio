import Link from 'next/link';

/** FOMI "F" mark — slanted cuts echo the mockup's logotype. */
export function BrandMark() {
  return (
    <Link
      href="/"
      aria-label="FOMI home"
      className="inline-flex size-10 items-center justify-center rounded-control text-ink-900 focus-ring transition-colors duration-fast hover:text-accent-600"
    >
      <svg aria-hidden="true" viewBox="0 0 24 28" width="22" height="26" fill="currentColor">
        <path d="M3 2h19l-2.2 6.2H10.4v3.6h8l-1.9 5.4h-6.1V26L3 22.8V2Z" />
      </svg>
    </Link>
  );
}
