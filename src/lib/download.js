/** @import { Generation } from './types' */

const FULL_SIZE_PARAMS = 'w=2048&q=85&fm=jpg';

/**
 * Downloads a generation at full size. Fetches a blob because the `download` attribute
 * is ignored for cross-origin URLs (the images live on Unsplash's CDN).
 * @param {Generation} item
 */
export async function downloadGeneration(item) {
  const isVideo = item.type === 'video';
  const url = isVideo ? item.src : `${item.src}&${FULL_SIZE_PARAMS}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed (${response.status})`);
  const objectUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = `fomi-${item.seed}.${isVideo ? 'mp4' : 'jpg'}`;
  link.click();
  // Revoking synchronously can cancel the download in Safari.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
