import 'server-only';
import manifest from '@/data/media-manifest.json';
import { IMAGE_PROMPT_SETS } from '@/data/prompt-sets';
import { VIDEO_CLIPS } from '@/data/video-clips';
import { getAspectRatio } from '@/lib/constants';
import { truncateWords } from '@/lib/format';

/** @import { AspectRatioId, Generation, Mode } from '@/lib/types' */
/** @import { PromptSet } from '@/data/prompt-sets' */

const ALT_MAX_LENGTH = 120;

/**
 * FNV-1a — a tiny stable hash, so the same prompt always maps to the same set and order.
 * @param {string} text
 */
export function hashString(text) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * @template {{ keywords: string[] }} T
 * @param {T[]} candidates
 * @param {string} prompt
 * @returns {T}
 */
function bestMatch(candidates, prompt) {
  const text = prompt.toLowerCase();
  let best = candidates[hashString(text) % candidates.length];
  let bestScore = 0;
  for (const candidate of candidates) {
    const score = candidate.keywords.filter((keyword) => text.includes(keyword)).length;
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}

/** @param {string} prompt @returns {PromptSet} */
export function matchPromptSet(prompt) {
  return bestMatch(IMAGE_PROMPT_SETS, prompt);
}

/** @param {string} setKey @returns {string[]} */
export function getSetPhotoIds(setKey) {
  return /** @type {Record<string, string[]>} */ (manifest.sets)[setKey] ?? [];
}

/**
 * Cropping happens on Unsplash's CDN; the loader adds width/quality per rendered size.
 * @param {string} photoId
 * @param {[number, number]} ratio
 */
function unsplashSrc(photoId, [width, height]) {
  return `https://images.unsplash.com/photo-${photoId}?ar=${width}:${height}&fit=crop&crop=faces,entropy`;
}

/**
 * @typedef {object} GenerationContext
 * @property {string} id
 * @property {string} prompt
 * @property {string} model
 * @property {number} seed
 * @property {AspectRatioId} aspectRatio
 * @property {string} createdAt
 */

/**
 * @param {string} photoId
 * @param {GenerationContext} context
 * @returns {Generation}
 */
export function createImageGeneration(photoId, context) {
  const aspect = getAspectRatio(context.aspectRatio);
  const photo = /** @type {Record<string, { blurDataURL: string }>} */ (manifest.photos)[photoId];
  return {
    ...context,
    type: 'image',
    src: unsplashSrc(photoId, aspect.ratio),
    width: aspect.output.width,
    height: aspect.output.height,
    blurDataURL: photo?.blurDataURL,
    alt: truncateWords(context.prompt, ALT_MAX_LENGTH),
  };
}

/**
 * @param {import('@/data/video-clips').VideoClip} clip
 * @param {GenerationContext} context
 * @returns {Generation}
 */
export function createVideoGeneration(clip, context) {
  const aspect = getAspectRatio(context.aspectRatio);
  return {
    ...context,
    type: 'video',
    src: clip.src,
    poster: clip.poster,
    duration: clip.duration,
    width: aspect.output.width,
    height: aspect.output.height,
    alt: truncateWords(context.prompt, ALT_MAX_LENGTH),
  };
}

/**
 * Picks `count` sources for a prompt, rotating the start by seed so a new seed
 * reshuffles results while the same seed reproduces them — like a real model.
 * @param {Mode} mode
 * @param {string} prompt
 * @param {number} count
 * @param {number} seed
 */
export function pickSources(mode, prompt, count, seed) {
  if (mode === 'video') {
    const first = VIDEO_CLIPS.indexOf(bestMatch(VIDEO_CLIPS, prompt));
    return Array.from({ length: count }, (_, index) => ({
      kind: /** @type {const} */ ('video'),
      clip: VIDEO_CLIPS[(first + index) % VIDEO_CLIPS.length],
    }));
  }
  const photoIds = getSetPhotoIds(matchPromptSet(prompt).key);
  const offset = seed % photoIds.length;
  return Array.from({ length: count }, (_, index) => ({
    kind: /** @type {const} */ ('image'),
    photoId: photoIds[(offset + index) % photoIds.length],
  }));
}
