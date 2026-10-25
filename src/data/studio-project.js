/**
 * The project a returning user opens in /studio: an autumn campaign for a candle brand,
 * three days in. Takes are written as "what changed from the parent", the way a person
 * branches; src/lib/mock/studio-project.js expands them into full recipes and images.
 *
 * Images reference curated Unsplash sets in media-manifest.json as [set, index].
 *
 * @typedef {[string, number]} ImageRef
 * @typedef {object} TakeSeed
 * @property {string} id
 * @property {string} branchId
 * @property {string | null} parentTakeId
 * @property {ImageRef | null} source                 image in the parent take it grew from
 * @property {Partial<import('@/lib/studio/types').Recipe>} changes
 * @property {number} hoursAgo
 * @property {ImageRef[]} images
 */

/** @type {import('@/lib/studio/types').Recipe} */
export const ROOT_RECIPE = {
  subject: 'hand-poured soy candle in an amber glass jar',
  scene: 'oak tabletop',
  light: 'soft morning daylight',
  mood: 'calm',
  props: 'none',
};

export const STUDIO_PROJECT = {
  id: 'autumn-campaign',
  name: 'Autumn Campaign',
  client: 'Hearth & Co.',
  direction: {
    brief:
      'Autumn launch for Hearth & Co.’s hand-poured candles. Warm, tactile, unhurried — the feeling of the first cold evening.',
    palette: [
      { name: 'Rust', hex: '#a4502a' },
      { name: 'Amber', hex: '#d99a4e' },
      { name: 'Cream', hex: '#efe3d0' },
      { name: 'Bark', hex: '#4a3426' },
      { name: 'Sage', hex: '#8c9476' },
    ],
    locked: [
      { label: 'Product', value: 'kraft paper label, no visible branding' },
      { label: 'Grade', value: 'soft contrast, fine film grain' },
      { label: 'Lens', value: '50mm, shallow depth of field' },
    ],
    avoid: ['logos', 'text', 'plastic', 'cool blue light'],
  },
  branches: [
    { id: 'hero', name: 'Hero still life', hue: 1 },
    { id: 'low-key', name: 'Low-key evening', hue: 2 },
    { id: 'window', name: 'Window & lifestyle', hue: 3 },
    { id: 'texture', name: 'Knit textures', hue: 4 },
    { id: 'outdoor', name: 'Outdoors & people', hue: 5 },
  ],
  /** @type {TakeSeed[]} oldest first */
  takes: [
    {
      id: 't1',
      branchId: 'hero',
      parentTakeId: null,
      source: null,
      changes: {},
      hoursAgo: 74,
      images: [
        ['candles', 0],
        ['candles', 5],
        ['candles', 7],
        ['candles', 12],
      ],
    },
    {
      id: 't2',
      branchId: 'low-key',
      parentTakeId: 't1',
      source: ['candles', 0],
      changes: { light: 'single low-key candle glow', mood: 'intimate' },
      hoursAgo: 70,
      images: [
        ['candles', 2],
        ['candles', 3],
        ['candles', 9],
        ['candles', 8],
      ],
    },
    {
      id: 't3',
      branchId: 'hero',
      parentTakeId: 't1',
      source: ['candles', 5],
      changes: { light: 'candlelit evening, warm bokeh' },
      hoursAgo: 52,
      images: [
        ['candles', 1],
        ['candles', 6],
        ['candles', 10],
        ['candles', 4],
      ],
    },
    {
      id: 't4',
      branchId: 'window',
      parentTakeId: 't1',
      source: ['candles', 12],
      changes: { scene: 'windowsill with folded knitwear', mood: 'cosy' },
      hoursAgo: 49,
      images: [
        ['candles', 11],
        ['knitwear', 3],
        ['knitwear', 6],
        ['knitwear', 1],
      ],
    },
    {
      id: 't5',
      branchId: 'low-key',
      parentTakeId: 't2',
      source: ['candles', 3],
      changes: { props: 'heirloom pumpkins' },
      hoursAgo: 46,
      images: [
        ['pumpkins', 0],
        ['pumpkins', 1],
        ['pumpkins', 2],
        ['pumpkins', 3],
      ],
    },
    {
      id: 't6',
      branchId: 'texture',
      parentTakeId: 't4',
      source: ['knitwear', 3],
      changes: { subject: 'stack of chunky knit throws', scene: 'linen backdrop' },
      hoursAgo: 30,
      images: [
        ['knitwear', 0],
        ['knitwear', 2],
        ['knitwear', 4],
        ['knitwear', 5],
      ],
    },
    {
      id: 't7',
      branchId: 'window',
      parentTakeId: 't4',
      source: ['candles', 11],
      changes: { props: 'ceramic mug of something warm' },
      hoursAgo: 26,
      images: [
        ['mugs', 0],
        ['mugs', 3],
        ['mugs', 6],
        ['mugs', 7],
      ],
    },
    {
      id: 't8',
      branchId: 'outdoor',
      parentTakeId: 't3',
      source: ['candles', 10],
      changes: { scene: 'autumn forest clearing', light: 'golden hour through the trees' },
      hoursAgo: 20,
      images: [
        ['autumnForest', 0],
        ['autumnForest', 1],
        ['autumnForest', 3],
        ['autumnForest', 4],
      ],
    },
    {
      id: 't9',
      branchId: 'window',
      parentTakeId: 't7',
      source: ['mugs', 0],
      changes: { scene: 'overhead flat lay on wool blanket' },
      hoursAgo: 8,
      images: [
        ['mugs', 1],
        ['mugs', 2],
        ['mugs', 4],
        ['mugs', 5],
      ],
    },
    {
      id: 't10',
      branchId: 'outdoor',
      parentTakeId: 't8',
      source: ['autumnForest', 1],
      changes: { subject: 'person in a knit sweater holding the candle', mood: 'joyful' },
      hoursAgo: 3,
      images: [
        ['autumnPortrait', 0],
        ['autumnPortrait', 3],
        ['autumnPortrait', 4],
        ['autumnPortrait', 5],
      ],
    },
  ],
  /** @type {ImageRef[]} */
  picks: [
    ['candles', 6],
    ['candles', 10],
    ['candles', 3],
    ['mugs', 0],
    ['knitwear', 3],
    ['autumnPortrait', 3],
  ],
  /** @type {ImageRef[]} */
  rejects: [
    ['candles', 7],
    ['pumpkins', 3],
  ],
};
