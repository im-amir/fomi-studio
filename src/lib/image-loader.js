'use client';

const UNSPLASH_HOST = 'https://images.unsplash.com/';
const LOCAL_LARGE_SUFFIX = '-640.webp';
const LOCAL_SMALL_SUFFIX = '-320.webp';
const LOCAL_SMALL_MAX_WIDTH = 320;

/**
 * Global next/image loader. Unsplash URLs already carry their crop (ar, fit, crop) in the
 * query string; we only add the rendered width, quality and format negotiation.
 * Local video posters exist at 640px and 320px (see src/data/video-clips.js): we pick the
 * smaller file when it covers the rendered width. The ?w= only keeps Next's "loader
 * ignores width" dev warning quiet; the static server ignores it.
 *
 * @param {{ src: string, width: number, quality?: number }} params
 * @returns {string}
 */
export default function imageLoader({ src, width, quality }) {
  if (!src.startsWith(UNSPLASH_HOST)) {
    const file =
      src.endsWith(LOCAL_LARGE_SUFFIX) && width <= LOCAL_SMALL_MAX_WIDTH
        ? src.replace(LOCAL_LARGE_SUFFIX, LOCAL_SMALL_SUFFIX)
        : src;
    return `${file}?w=${width}`;
  }
  const url = new URL(src);
  url.searchParams.set('w', String(width));
  url.searchParams.set('q', String(quality ?? 70));
  url.searchParams.set('auto', 'format');
  url.searchParams.set('cs', 'tinysrgb');
  return url.toString();
}
