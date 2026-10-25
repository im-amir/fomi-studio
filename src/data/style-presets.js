/**
 * Style presets. Every preview uses the same source photo with a different treatment,
 * so the chips compare the *style*, not the subject.
 * @typedef {object} StylePreset
 * @property {string} id
 * @property {string} label
 * @property {string} promptHint  appended to the prompt sent to the model
 */

/** @type {StylePreset[]} */
export const STYLE_PRESETS = [
  { id: 'photoreal', label: 'Photoreal', promptHint: 'photorealistic, natural light' },
  {
    id: 'cinematic',
    label: 'Cinematic',
    promptHint: 'cinematic still, anamorphic, teal and amber',
  },
  {
    id: 'editorial',
    label: 'Editorial',
    promptHint: 'editorial fashion photography, high contrast',
  },
  { id: 'film', label: 'Film', promptHint: 'shot on 35mm film, grain, faded blacks' },
  { id: 'anime', label: 'Anime', promptHint: 'anime key visual, cel shading' },
  { id: 'render-3d', label: '3D', promptHint: '3D render, soft global illumination' },
  { id: 'watercolor', label: 'Watercolor', promptHint: 'loose watercolor, paper texture' },
];

export const STYLE_PREVIEW_PHOTO_ID = '1489424731084-a5d8b219a5bb';

/** @param {string | null} id */
export function getStylePreset(id) {
  return STYLE_PRESETS.find((preset) => preset.id === id);
}
