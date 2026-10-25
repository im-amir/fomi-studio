'use client';

const UNSPLASH_HOST = 'https://images.unsplash.com/';

/**
 * Global next/image loader. Unsplash URLs already carry their crop (ar, fit, crop) in the
 * query string; we only add the rendered width, quality and format negotiation.
 * Local files (video posters) are pre-sized; the width param only keeps Next's
 * "loader ignores width" dev warning quiet and is ignored by the static server.
 *
 * @param {{ src: string, width: number, quality?: number }} params
 * @returns {string}
 */
export default function imageLoader({ src, width, quality }) {
  if (!src.startsWith(UNSPLASH_HOST)) return `${src}?w=${width}`;
  const url = new URL(src);
  url.searchParams.set('w', String(width));
  url.searchParams.set('q', String(quality ?? 70));
  url.searchParams.set('auto', 'format');
  url.searchParams.set('cs', 'tinysrgb');
  return url.toString();
}
