/**
 * Themed result sets for the mock model. A prompt is matched to a set by keywords,
 * so "redhead portrait" returns portraits instead of a random landscape.
 * Photo ids live in media-manifest.json under the same key.
 *
 * @typedef {object} PromptSet
 * @property {string} key            key in media-manifest.json `sets`
 * @property {string} prompt         canonical prompt, used for history and example chips
 * @property {string} model
 * @property {string[]} keywords
 */

/** @type {PromptSet[]} */
export const IMAGE_PROMPT_SETS = [
  {
    key: 'portrait',
    prompt:
      'A professional portrait photograph of a smiling 31-year-old redheaded woman with warm brown eyes and softly tousled auburn hair framing her face. She is turned slightly towards the viewer, offering a genuine and approachable expression. She is wearing a cream-colored cashmere sweater and delicate gold earrings. The background is a softly blurred expanse of muted gray and beige tones, suggesting a modern art gallery. There is subtle directional lighting.',
    model: 'fomi-portrait',
    // No generic 'portrait': it describes framing, not subject ("a cat portrait" is a cat).
    keywords: ['woman', 'redhead', 'red hair', 'face', 'girl', 'freckles', 'auburn'],
  },
  {
    key: 'mountains',
    prompt:
      'Snow-capped alpine peaks at first light, crisp air, a thin layer of cloud resting in the valleys, shot on a 50mm lens',
    model: 'fomi-realism',
    keywords: ['mountain', 'alpine', 'snow', 'peak', 'glacier', 'landscape', 'summit'],
  },
  {
    key: 'forest',
    prompt:
      'A misty evergreen forest at dawn, layers of fog drifting between the pines, muted greens, quiet and cinematic',
    model: 'fomi-cinematic',
    keywords: ['forest', 'fog', 'mist', 'pine', 'woods', 'tree'],
  },
  {
    key: 'neon',
    prompt:
      'Rain-soaked city street at night, neon signs reflecting in the puddles, cyberpunk palette of magenta and teal',
    model: 'fomi-cinematic',
    keywords: ['neon', 'city', 'night', 'cyberpunk', 'street', 'tokyo', 'urban', 'rain'],
  },
  {
    key: 'paris',
    prompt:
      'The Eiffel Tower at dusk under a pastel pink sky, soft clouds, dreamy travel-poster mood',
    model: 'fomi-realism',
    keywords: ['paris', 'eiffel', 'france', 'tower', 'dusk', 'travel'],
  },
  {
    key: 'cats',
    prompt:
      'Close-up portrait of a curious cat with bright eyes, soft window light, shallow depth of field',
    model: 'fomi-portrait',
    keywords: ['cat', 'kitten', 'pet', 'feline', 'animal'],
  },
  // Studio (Part B) sets. People come before knitwear so "a person in a knit sweater"
  // resolves to people on a tie (the matcher keeps the first best match).
  {
    key: 'autumnPortrait',
    prompt: 'A person in a knit sweater holding a lit candle outdoors in autumn, golden light',
    model: 'fomi-portrait',
    keywords: ['person', 'people', 'holding', 'someone', 'hands'],
  },
  {
    key: 'candles',
    prompt: 'Hand-poured soy candle in an amber glass jar on an oak tabletop, warm light',
    model: 'fomi-realism',
    keywords: ['candle', 'soy', 'wax', 'jar', 'candlelit', 'flame'],
  },
  {
    key: 'pumpkins',
    prompt: 'Heirloom pumpkins on a rustic table, low-key autumn still life',
    model: 'fomi-realism',
    keywords: ['pumpkin', 'gourd', 'squash', 'harvest'],
  },
  {
    key: 'mugs',
    prompt: 'A ceramic mug of something warm on a wool blanket, autumn leaves',
    model: 'fomi-realism',
    keywords: ['mug', 'coffee', 'latte', 'tea', 'cocoa', 'cup'],
  },
  {
    key: 'knitwear',
    prompt: 'A stack of chunky knit throws on a linen backdrop, soft window light',
    model: 'fomi-realism',
    keywords: ['knit', 'sweater', 'throw', 'wool', 'cardigan', 'linen'],
  },
  {
    key: 'autumnForest',
    prompt: 'An autumn forest clearing at golden hour, light through the leaves',
    model: 'fomi-cinematic',
    keywords: ['autumn forest', 'foliage', 'maple', 'clearing', 'golden hour', 'woodland'],
  },
];

/** Prompts offered as one-click starters in the empty state. */
export const EXAMPLE_PROMPTS = [
  {
    label: 'Gallery portrait',
    prompt:
      'Editorial portrait of a redheaded woman in a cream sweater, soft gallery light, muted beige background',
  },
  {
    label: 'Neon street',
    prompt: 'Rain-soaked neon street at night, reflections in puddles, magenta and teal',
  },
  {
    label: 'Alpine dawn',
    prompt: 'Snow-capped alpine peaks at first light, thin clouds in the valleys, 50mm',
  },
];
