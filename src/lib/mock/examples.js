import 'server-only';
import { EXAMPLE_PROMPTS } from '@/data/prompt-sets';
import { createImageGeneration, getSetPhotoIds } from './media';

/** @import { ExamplePrompt } from '@/lib/types' */

/**
 * Resolved on the server so the client never ships the media manifest.
 * @returns {ExamplePrompt[]}
 */
export function getExamplePrompts() {
  return EXAMPLE_PROMPTS.flatMap(({ label, prompt, set, photo }) => {
    const photoId = getSetPhotoIds(set)[photo];
    if (!photoId) return [];
    const { src, blurDataURL } = createImageGeneration(photoId, {
      id: `example-${set}`,
      prompt,
      model: '',
      seed: 0,
      aspectRatio: '4:5',
      createdAt: '',
    });
    return [{ label, prompt, src, blurDataURL }];
  });
}
