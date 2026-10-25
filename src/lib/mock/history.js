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

/**
 * Newest first. The two most recent runs are the portrait set at 2:3 — the screen the
 * FOMI mockup shows — so a returning user lands on that work.
 * @type {({ kind: 'image', set: string, round: number, aspectRatio: AspectRatioId }
 *   | { kind: 'video', clip: number })[]}
 */
const PLAN = [
  { kind: 'image', set: 'portrait', round: 1, aspectRatio: '2:3' },
  { kind: 'image', set: 'portrait', round: 0, aspectRatio: '2:3' },
  { kind: 'image', set: 'cats', round: 0, aspectRatio: '4:5' },
  { kind: 'video', clip: 0 },
  { kind: 'image', set: 'paris', round: 0, aspectRatio: '2:3' },
  { kind: 'image', set: 'neon', round: 0, aspectRatio: '9:16' },
  { kind: 'image', set: 'forest', round: 0, aspectRatio: '1:1' },
  { kind: 'image', set: 'mountains', round: 0, aspectRatio: '16:9' },
  { kind: 'image', set: 'cats', round: 1, aspectRatio: '1:1' },
  { kind: 'video', clip: 2 },
  { kind: 'image', set: 'neon', round: 1, aspectRatio: '2:3' },
  { kind: 'image', set: 'paris', round: 1, aspectRatio: '4:5' },
  { kind: 'image', set: 'forest', round: 1, aspectRatio: '2:3' },
  { kind: 'image', set: 'mountains', round: 1, aspectRatio: '3:4' },
];

/** @returns {Batch[]} */
function buildHistory() {
  return PLAN.map((entry, step) => {
    const createdAt = new Date(HISTORY_ANCHOR - step * 5 * HOUR).toISOString();

    if (entry.kind === 'video') {
      const clip = VIDEO_CLIPS[entry.clip];
      const id = `hist-video-${entry.clip}`;
      return {
        id,
        prompt: clip.prompt,
        mode: 'video',
        model: 'fomi-cinematic',
        style: null,
        aspectRatio: '16:9',
        createdAt,
        items: [0, 1].map((index) =>
          createVideoGeneration(VIDEO_CLIPS[(entry.clip + index) % VIDEO_CLIPS.length], {
            id: `${id}-${index}`,
            prompt: clip.prompt,
            model: 'fomi-cinematic',
            seed: 2_000_000 + step * 13 + index,
            aspectRatio: '16:9',
            createdAt,
          }),
        ),
      };
    }

    const set = /** @type {import('@/data/prompt-sets').PromptSet} */ (
      IMAGE_PROMPT_SETS.find((candidate) => candidate.key === entry.set)
    );
    const id = `hist-${set.key}-${entry.round}`;
    const photoIds = getSetPhotoIds(set.key);
    return {
      id,
      prompt: set.prompt,
      mode: 'image',
      model: set.model,
      style: null,
      aspectRatio: entry.aspectRatio,
      createdAt,
      items: Array.from({ length: ITEMS_PER_BATCH }, (_, index) =>
        createImageGeneration(photoIds[(entry.round * ITEMS_PER_BATCH + index) % photoIds.length], {
          id: `${id}-${index}`,
          prompt: set.prompt,
          model: set.model,
          seed: 1_000_000 + step * 97 + index,
          aspectRatio: entry.aspectRatio,
          createdAt,
        }),
      ),
    };
  });
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
