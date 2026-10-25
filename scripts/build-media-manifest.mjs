/**
 * Builds src/data/media-manifest.json from the curated Unsplash ids in media-sources.json.
 * For each photo it stores the original size and a ~10px preview (as a data URL),
 * so the UI can reserve space and paint a placeholder before the real image arrives.
 *
 * Run: yarn media:build   (needs network; output is committed, so the app never calls this)
 */
import { readFile, writeFile } from 'node:fs/promises';

const SOURCES = new URL('./media-sources.json', import.meta.url);
const OUTPUT = new URL('../src/data/media-manifest.json', import.meta.url);
const CDN = 'https://images.unsplash.com';
const CONCURRENCY = 6;

/** @param {string} url */
async function fetchOk(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} for ${url}`);
  return response;
}

/**
 * @param {string} id
 * @returns {Promise<{ width: number, height: number, blurDataURL: string }>}
 */
async function describe(id) {
  const metaResponse = await fetchOk(`${CDN}/photo-${id}?fm=json`);
  const meta = await metaResponse.json();
  const thumbResponse = await fetchOk(`${CDN}/photo-${id}?w=10&q=30&fm=jpg&cs=strip`);
  const thumb = Buffer.from(await thumbResponse.arrayBuffer()).toString('base64');
  return {
    width: meta.PixelWidth,
    height: meta.PixelHeight,
    blurDataURL: `data:image/jpeg;base64,${thumb}`,
  };
}

/**
 * Runs `task` over `items` with at most `limit` in flight — the CDN throttles bursts.
 * @template T, R
 * @param {T[]} items
 * @param {number} limit
 * @param {(item: T) => Promise<R>} task
 * @returns {Promise<R[]>}
 */
async function mapLimited(items, limit, task) {
  /** @type {R[]} */
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await task(items[index]);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

const sources = JSON.parse(await readFile(SOURCES, 'utf8'));
/** @type {string[]} */
const ids = [...new Set(Object.values(sources).flat())];
const described = await mapLimited(ids, CONCURRENCY, async (id) => {
  const entry = await describe(id);
  process.stdout.write('.');
  return [id, entry];
});

const manifest = { sets: sources, photos: Object.fromEntries(described) };
await writeFile(OUTPUT, `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`\nWrote ${ids.length} photos to ${OUTPUT.pathname}\n`);
