import 'server-only';
import { ROOT_RECIPE, STUDIO_PROJECT } from '@/data/studio-project';
import { compilePrompt } from '@/lib/studio/recipe';
import { createImageGeneration, getSetPhotoIds } from './media';

/** @import { Recipe, StudioProject, Take } from '@/lib/studio/types' */
/** @import { ImageRef } from '@/data/studio-project' */

// Fixed anchor keeps the fixture deterministic; the UI shows relative times.
const ANCHOR = Date.parse('2026-10-25T09:00:00Z');
const HOUR = 3_600_000;
const MODEL = 'fomi-realism';
const ASPECT_RATIO = '4:5';

/** Stable id per source photo, so picks and branch sources can point at images. */
const imageId = (/** @type {ImageRef} */ [set, index]) => `img-${set}-${index}`;

/**
 * Expands the authored seed (takes as "what changed") into the full project the
 * workspace renders: complete recipes, compiled prompts and generated images.
 * @returns {StudioProject}
 */
export function getStudioProject() {
  const { takes: seeds, picks, rejects, ...meta } = STUDIO_PROJECT;
  /** @type {Map<string, Recipe>} */
  const recipes = new Map();

  /** @type {Take[]} */
  const takes = seeds.map((seed, takeIndex) => {
    const parentRecipe = seed.parentTakeId ? recipes.get(seed.parentTakeId) : ROOT_RECIPE;
    const recipe = { ...(parentRecipe ?? ROOT_RECIPE), ...seed.changes };
    recipes.set(seed.id, recipe);
    const prompt = compilePrompt(recipe, meta.direction);
    const createdAt = new Date(ANCHOR - seed.hoursAgo * HOUR).toISOString();

    return {
      id: seed.id,
      branchId: seed.branchId,
      parentTakeId: seed.parentTakeId,
      sourceImageId: seed.source ? imageId(seed.source) : null,
      recipe,
      prompt,
      model: MODEL,
      aspectRatio: ASPECT_RATIO,
      createdAt,
      items: seed.images.map((ref, index) => {
        const [set, photoIndex] = ref;
        return createImageGeneration(getSetPhotoIds(set)[photoIndex], {
          id: imageId(ref),
          prompt,
          model: MODEL,
          seed: 4_200_000 + takeIndex * 31 + index,
          aspectRatio: ASPECT_RATIO,
          createdAt,
        });
      }),
    };
  });

  return { ...meta, takes, picks: picks.map(imageId), rejects: rejects.map(imageId) };
}
