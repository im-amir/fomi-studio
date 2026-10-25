import 'server-only';
import { SEED_MAX } from '@/lib/constants';
import { createImageGeneration, createVideoGeneration, pickSources } from './media';

/** @import { Batch, GenerateRequest } from '@/lib/types' */

/**
 * Turns a validated request into a batch of results. Time and randomness are injected
 * so the function is deterministic under test.
 * @param {GenerateRequest} request
 * @param {{ now: Date, random: () => number, createId: () => string }} env
 * @returns {Batch}
 */
export function createBatch(request, { now, random, createId }) {
  const baseSeed = request.advanced.seed ?? Math.floor(random() * SEED_MAX);
  const createdAt = now.toISOString();
  const sources = pickSources(request.mode, request.prompt, request.count, baseSeed);

  const items = sources.map((source, index) => {
    const context = {
      id: createId(),
      prompt: request.prompt,
      model: request.model,
      seed: (baseSeed + index) % SEED_MAX,
      aspectRatio: request.aspectRatio,
      createdAt,
    };
    return source.kind === 'video'
      ? createVideoGeneration(source.clip, context)
      : createImageGeneration(source.photoId, context);
  });

  return {
    id: createId(),
    prompt: request.prompt,
    mode: request.mode,
    model: request.model,
    style: request.style,
    aspectRatio: request.aspectRatio,
    advanced: { ...request.advanced, seed: baseSeed },
    createdAt,
    items,
  };
}
