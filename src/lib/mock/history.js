import 'server-only';
import { IMAGE_PROMPT_SETS } from '@/data/prompt-sets';
import { VIDEO_CLIPS } from '@/data/video-clips';
import { createImageGeneration, createVideoGeneration, getSetPhotoIds } from './media';

/** @import { AspectRatioId, Batch, HistoryPage } from '@/lib/types' */

// Fixed anchor keeps the fixture deterministic (safe to prerender); the UI shows
// relative times computed on the client.
const HISTORY_ANCHOR = Date.parse('2026-10-25T09:00:00Z');
const HOUR = 3_600_000;
const ITEMS_PER_BATCH = 4;

/** @type {AspectRatioId[]} */
const RATIO_ROTATION = ['4:5', '1:1', '3:4'];

/** @returns {Batch[]} */
function buildHistory() {
  /** @type {Batch[]} */
  const batches = [];
  let step = 0;
  const nextDate = () => new Date(HISTORY_ANCHOR - step++ * 5 * HOUR).toISOString();

  for (const round of [0, 1]) {
    for (const set of IMAGE_PROMPT_SETS) {
      const id = `hist-${set.key}-${round}`;
      const createdAt = nextDate();
      const aspectRatio = RATIO_ROTATION[(batches.length + round) % RATIO_ROTATION.length];
      const photoIds = getSetPhotoIds(set.key);
      const items = Array.from({ length: ITEMS_PER_BATCH }, (_, index) => {
        const photoId = photoIds[(round * ITEMS_PER_BATCH + index) % photoIds.length];
        return createImageGeneration(photoId, {
          id: `${id}-${index}`,
          prompt: set.prompt,
          model: set.model,
          seed: 1_000_000 + step * 97 + index,
          aspectRatio,
          createdAt,
        });
      });
      batches.push({
        id,
        prompt: set.prompt,
        mode: 'image',
        model: set.model,
        style: null,
        aspectRatio,
        createdAt,
        items,
      });
    }
    const clip = VIDEO_CLIPS[round];
    const id = `hist-video-${round}`;
    const createdAt = nextDate();
    batches.push({
      id,
      prompt: clip.prompt,
      mode: 'video',
      model: 'fomi-cinematic',
      style: null,
      aspectRatio: '16:9',
      createdAt,
      items: [0, 1].map((index) =>
        createVideoGeneration(VIDEO_CLIPS[(round + index) % VIDEO_CLIPS.length], {
          id: `${id}-${index}`,
          prompt: clip.prompt,
          model: 'fomi-cinematic',
          seed: 2_000_000 + step * 13 + index,
          aspectRatio: '16:9',
          createdAt,
        }),
      ),
    });
  }
  return batches;
}

const HISTORY = buildHistory();

/** @param {number} offset */
const encodeCursor = (offset) => Buffer.from(String(offset)).toString('base64url');

/** @param {string | null} cursor */
function decodeCursor(cursor) {
  if (!cursor) return 0;
  const offset = Number(Buffer.from(cursor, 'base64url').toString());
  return Number.isInteger(offset) && offset >= 0 ? offset : null;
}

/**
 * @param {{ cursor: string | null, limit: number }} params
 * @returns {HistoryPage | null} null when the cursor is malformed
 */
export function getHistoryPage({ cursor, limit }) {
  const offset = decodeCursor(cursor);
  if (offset === null) return null;
  const items = HISTORY.slice(offset, offset + limit);
  const nextOffset = offset + items.length;
  return { items, nextCursor: nextOffset < HISTORY.length ? encodeCursor(nextOffset) : null };
}
