import { getStylePreset } from '@/data/style-presets';
import { DEFAULT_REQUEST } from './constants';

/** @import { AdvancedSettings, AspectRatioId, Mode } from './types' */

/**
 * The settings behind a run as short labels ("4 images", "2:3", "Seed 1042"…), so a
 * prompt card answers "how did I get this?" without opening anything. Defaults that
 * add no information (standard quality, no negative prompt) are left out.
 * @param {{ mode: Mode, count: number, aspectRatio: AspectRatioId, style: string | null, advanced: AdvancedSettings }} recipe
 * @returns {string[]}
 */
export function describeRecipe({ mode, count, aspectRatio, style, advanced }) {
  const noun = mode === 'video' ? 'clip' : 'image';
  const parts = [`${count} ${noun}${count === 1 ? '' : 's'}`, aspectRatio];
  const preset = getStylePreset(style);
  if (preset) parts.push(preset.label);
  parts.push(advanced.seed === null ? 'Random seed' : `Seed ${advanced.seed}`);
  parts.push(`Guidance ${advanced.guidance}`);
  if (advanced.quality !== DEFAULT_REQUEST.advanced.quality) {
    parts.push(`${advanced.quality[0].toUpperCase()}${advanced.quality.slice(1)} quality`);
  }
  if (advanced.negativePrompt) parts.push('Negative prompt');
  return parts;
}
