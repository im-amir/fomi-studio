/** @import { AspectRatioId, GenerateRequest, Mode, Quality } from './types' */

/** @type {{ value: Mode, label: string }[]} */
export const MODES = [
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
];

export const IMAGE_COUNTS = [1, 2, 4, 8];
export const VIDEO_COUNTS = [1, 2, 4];

/**
 * `output` is the pixel size the (mock) model renders at, so tiles can reserve
 * the exact space before media arrives.
 * @type {{ value: AspectRatioId, label: string, ratio: [number, number], output: { width: number, height: number } }[]}
 */
export const ASPECT_RATIOS = [
  { value: '1:1', label: 'Square', ratio: [1, 1], output: { width: 1024, height: 1024 } },
  { value: '4:5', label: 'Portrait', ratio: [4, 5], output: { width: 1024, height: 1280 } },
  { value: '2:3', label: 'Photo', ratio: [2, 3], output: { width: 896, height: 1344 } },
  { value: '3:4', label: 'Classic', ratio: [3, 4], output: { width: 960, height: 1280 } },
  { value: '16:9', label: 'Widescreen', ratio: [16, 9], output: { width: 1344, height: 756 } },
  { value: '9:16', label: 'Story', ratio: [9, 16], output: { width: 756, height: 1344 } },
];

/** @type {{ value: Quality, label: string }[]} */
export const QUALITIES = [
  { value: 'draft', label: 'Draft' },
  { value: 'standard', label: 'Standard' },
  { value: 'high', label: 'High' },
];

export const GUIDANCE = { min: 1, max: 20, step: 0.5 };
export const SEED_MAX = 2 ** 31 - 1;
export const PROMPT_MAX_LENGTH = 1500;
// One or two words rarely describe an image well enough to be worth a generation.
export const PROMPT_MIN_WORDS = 3;
export const NEGATIVE_PROMPT_MAX_LENGTH = 500;

/** @type {GenerateRequest} */
export const DEFAULT_REQUEST = {
  prompt: '',
  mode: 'image',
  count: 4,
  aspectRatio: '2:3',
  model: 'fomi-portrait',
  styles: [],
  advanced: { seed: null, guidance: 7, negativePrompt: '', quality: 'standard' },
};

/** @param {AspectRatioId} value */
export function getAspectRatio(value) {
  return ASPECT_RATIOS.find((option) => option.value === value) ?? ASPECT_RATIOS[0];
}
