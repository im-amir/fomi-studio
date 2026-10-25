const UNSPLASH_HOST = 'https://images.unsplash.com/';

/**
 * Asks the CDN for a square crop of a generation, for square thumbnails. Fetching the
 * portrait crop and hiding the rest with object-fit wastes bytes and distorts the
 * focal point. Local files (video posters) are returned unchanged.
 * @param {string} src
 */
export function squareCrop(src) {
  if (!src.startsWith(UNSPLASH_HOST)) return src;
  const url = new URL(src);
  url.searchParams.set('ar', '1:1');
  return url.toString();
}
