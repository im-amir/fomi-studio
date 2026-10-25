/**
 * @typedef {object} Model
 * @property {string} id
 * @property {string} name
 * @property {string} description  one line, shown in the model picker
 * @property {import('@/lib/types').Mode[]} modes
 */

/** @type {Model[]} */
export const MODELS = [
  {
    id: 'fomi-portrait',
    name: 'Fomi Portrait',
    description: 'Skin, hair and expression detail',
    modes: ['image', 'video'],
  },
  {
    id: 'fomi-cinematic',
    name: 'Fomi Cinematic',
    description: 'Film lighting and wide compositions',
    modes: ['image', 'video'],
  },
  {
    id: 'fomi-realism',
    name: 'Fomi Realism',
    description: 'True-to-life products and places',
    modes: ['image'],
  },
  {
    id: 'fomi-anime',
    name: 'Fomi Anime',
    description: 'Clean line art and flat colour',
    modes: ['image'],
  },
];

/** @param {string} id */
export function getModel(id) {
  return MODELS.find((model) => model.id === id);
}
