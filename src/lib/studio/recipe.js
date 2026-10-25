/** @import { Direction, Recipe, RecipeKey } from './types' */

/** Display order and labels for recipe ingredients. */
export const RECIPE_FIELDS = /** @type {const} */ ([
  ['subject', 'Subject'],
  ['scene', 'Scene'],
  ['light', 'Light'],
  ['mood', 'Mood'],
  ['props', 'Props'],
]);

/**
 * @typedef {{ key: RecipeKey, label: string, from: string, to: string }} RecipeChange
 */

/**
 * What changed between a take and its parent — derived, never stored, so the "diff"
 * chips can't drift from the data.
 * @param {Recipe | null} parent
 * @param {Recipe} child
 * @returns {RecipeChange[]}
 */
export function diffRecipe(parent, child) {
  if (!parent) return [];
  return RECIPE_FIELDS.filter(([key]) => parent[key] !== child[key]).map(([key, label]) => ({
    key,
    label,
    from: parent[key],
    to: child[key],
  }));
}

/**
 * The prompt actually sent to the model: the take's recipe plus the project's locked
 * direction. The user only ever edits the difference.
 * @param {Recipe} recipe
 * @param {Direction} direction
 */
export function compilePrompt(recipe, direction) {
  const parts = [
    recipe.subject,
    recipe.scene,
    recipe.light,
    `${recipe.mood} mood`,
    recipe.props !== 'none' ? `with ${recipe.props}` : null,
    ...direction.locked.map((item) => item.value),
  ];
  return parts.filter(Boolean).join(', ');
}
