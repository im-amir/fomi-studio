/**
 * Part B (Studio) data shapes. A project is a tree of takes: every take records the
 * full recipe it was made with and the exact image it branched from, so the workspace
 * can always answer "how did I get here?".
 */

/** @import { AspectRatioId, Generation } from '@/lib/types' */

/**
 * The editable ingredients of a prompt. Changing one is what a branch *is*.
 * @typedef {object} Recipe
 * @property {string} subject
 * @property {string} scene
 * @property {string} light
 * @property {string} mood
 * @property {string} props
 */

/** @typedef {keyof Recipe} RecipeKey */

/**
 * The project brief every generation inherits, so a campaign stays consistent without
 * retyping the same prompt fragments.
 * @typedef {object} Direction
 * @property {string} brief
 * @property {{ name: string, hex: string }[]} palette
 * @property {{ label: string, value: string }[]} locked   always appended to prompts
 * @property {string[]} avoid                               sent as the negative prompt
 */

/**
 * A lane on the canvas: one line of exploration.
 * @typedef {object} Branch
 * @property {string} id
 * @property {string} name
 * @property {number} hue        index into the lane colour tokens (1–5)
 */

/**
 * One generation run inside a branch.
 * @typedef {object} Take
 * @property {string} id
 * @property {string} branchId
 * @property {string | null} parentTakeId
 * @property {string | null} sourceImageId   the image this take was branched from
 * @property {Recipe} recipe
 * @property {string} prompt                 recipe + direction, as sent to the model
 * @property {string} model
 * @property {AspectRatioId} aspectRatio
 * @property {string} createdAt
 * @property {Generation[]} items
 */

/**
 * @typedef {object} StudioProject
 * @property {string} id
 * @property {string} name
 * @property {string} client
 * @property {Direction} direction
 * @property {Branch[]} branches
 * @property {Take[]} takes                  oldest first
 * @property {string[]} picks                image ids
 * @property {string[]} rejects              image ids
 */

export {};
