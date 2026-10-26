'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * A Link that prefetches on hover or focus instead of when it scrolls into view.
 * Viewport prefetching also preloads the other route's CSS, which sits unused (and makes
 * Chrome log a warning) until someone actually heads there.
 * @param {React.ComponentProps<typeof Link> & { href: string }} props
 */
export function IntentLink({ href, onPointerEnter, onFocus, ...props }) {
  const router = useRouter();
  return (
    <Link
      {...props}
      href={href}
      prefetch={false}
      onPointerEnter={(event) => {
        router.prefetch(href);
        onPointerEnter?.(event);
      }}
      onFocus={(event) => {
        router.prefetch(href);
        onFocus?.(event);
      }}
    />
  );
}
