import 'server-only';
import {
  ASPECT_RATIOS,
  GUIDANCE,
  IMAGE_COUNTS,
  MODES,
  NEGATIVE_PROMPT_MAX_LENGTH,
  PROMPT_MAX_LENGTH,
  QUALITIES,
  SEED_MAX,
  VIDEO_COUNTS,
} from '@/lib/constants';
import { getModel } from '@/data/models';
import { getStylePreset } from '@/data/style-presets';

/** @import { GenerateRequest } from '@/lib/types' */

const orList = new Intl.ListFormat('en', { type: 'disjunction' });

/**
 * @typedef {{ ok: true, value: GenerateRequest }
 *   | { ok: false, error: { code: 'INVALID_REQUEST', message: string, field: string } }} ValidationResult
 */

/**
 * @param {string} field
 * @param {string} message
 * @returns {ValidationResult}
 */
function invalid(field, message) {
  return { ok: false, error: { code: 'INVALID_REQUEST', message, field } };
}

/** @param {unknown} value */
function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validates an untrusted request body. Messages are written for the UI, not for developers.
 * @param {unknown} body
 * @returns {ValidationResult}
 */
export function validateGenerateRequest(body) {
  if (!isRecord(body)) return invalid('body', 'Request body must be a JSON object.');
  const input = /** @type {Record<string, unknown>} */ (body);

  const prompt = typeof input.prompt === 'string' ? input.prompt.trim() : '';
  if (!prompt) return invalid('prompt', 'Describe what you want to create.');
  if (prompt.length > PROMPT_MAX_LENGTH) {
    return invalid('prompt', `Keep the prompt under ${PROMPT_MAX_LENGTH} characters.`);
  }

  const mode = MODES.find((option) => option.value === input.mode)?.value;
  if (!mode) return invalid('mode', 'Mode must be "image" or "video".');

  const allowedCounts = mode === 'video' ? VIDEO_COUNTS : IMAGE_COUNTS;
  if (typeof input.count !== 'number' || !allowedCounts.includes(input.count)) {
    return invalid('count', `Choose ${orList.format(allowedCounts.map(String))} results.`);
  }

  const aspectRatio = ASPECT_RATIOS.find((option) => option.value === input.aspectRatio)?.value;
  if (!aspectRatio) return invalid('aspectRatio', 'Unsupported aspect ratio.');

  const model = typeof input.model === 'string' ? getModel(input.model) : undefined;
  if (!model) return invalid('model', 'Unknown model.');
  if (!model.modes.includes(mode)) {
    return invalid('model', `${model.name} can't generate ${mode}s yet.`);
  }

  const styles = input.styles ?? [];
  if (
    !Array.isArray(styles) ||
    styles.some((id) => typeof id !== 'string' || !getStylePreset(id)) ||
    new Set(styles).size !== styles.length
  ) {
    return invalid('styles', 'Styles must be a list of known, distinct style presets.');
  }

  const advanced = isRecord(input.advanced)
    ? /** @type {Record<string, unknown>} */ (input.advanced)
    : {};
  const seed = advanced.seed ?? null;
  if (seed !== null && (!Number.isInteger(seed) || Number(seed) < 0 || Number(seed) > SEED_MAX)) {
    return invalid('advanced.seed', `Seed must be a whole number between 0 and ${SEED_MAX}.`);
  }
  const guidance = advanced.guidance ?? 7;
  if (typeof guidance !== 'number' || guidance < GUIDANCE.min || guidance > GUIDANCE.max) {
    return invalid(
      'advanced.guidance',
      `Guidance must be between ${GUIDANCE.min} and ${GUIDANCE.max}.`,
    );
  }
  const negativePrompt =
    typeof advanced.negativePrompt === 'string' ? advanced.negativePrompt.trim() : '';
  if (negativePrompt.length > NEGATIVE_PROMPT_MAX_LENGTH) {
    return invalid(
      'advanced.negativePrompt',
      `Keep it under ${NEGATIVE_PROMPT_MAX_LENGTH} characters.`,
    );
  }
  const quality = QUALITIES.find(
    (option) => option.value === (advanced.quality ?? 'standard'),
  )?.value;
  if (!quality) return invalid('advanced.quality', 'Unknown quality setting.');

  return {
    ok: true,
    value: {
      prompt,
      mode,
      count: input.count,
      aspectRatio,
      model: model.id,
      styles: /** @type {string[]} */ (styles),
      advanced: { seed: /** @type {number | null} */ (seed), guidance, negativePrompt, quality },
    },
  };
}
