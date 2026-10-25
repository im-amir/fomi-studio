/**
 * Shared data shapes. Plain JSDoc so `yarn typecheck` can verify the JavaScript
 * against them without adding TypeScript to the project.
 */

/** @typedef {'image' | 'video'} Mode */
/** @typedef {'1:1' | '4:5' | '2:3' | '3:4' | '16:9' | '9:16'} AspectRatioId */
/** @typedef {'draft' | 'standard' | 'high'} Quality */

/**
 * @typedef {object} AdvancedSettings
 * @property {number | null} seed      null = random seed per run
 * @property {number} guidance         how strictly the model follows the prompt (1–20)
 * @property {string} negativePrompt
 * @property {Quality} quality
 */

/**
 * @typedef {object} GenerateRequest
 * @property {string} prompt
 * @property {Mode} mode
 * @property {number} count
 * @property {AspectRatioId} aspectRatio
 * @property {string} model            model id, see src/data/models.js
 * @property {string[]} styles          style preset ids (any number), see src/data/style-presets.js
 * @property {AdvancedSettings} advanced
 */

/**
 * One generated image or video.
 * @typedef {object} Generation
 * @property {string} id
 * @property {Mode} type
 * @property {string} src              image URL, or mp4 URL for video
 * @property {string} [poster]         video only
 * @property {number} [duration]       video only, seconds
 * @property {number} width            output size in pixels
 * @property {number} height
 * @property {string} [blurDataURL]
 * @property {string} alt
 * @property {string} prompt
 * @property {string} model
 * @property {number} seed
 * @property {AspectRatioId} aspectRatio
 * @property {string} createdAt        ISO 8601
 */

/**
 * The result of one Generate press: the request that produced it and its outputs.
 * @typedef {object} Batch
 * @property {string} id
 * @property {string} prompt
 * @property {Mode} mode
 * @property {string} model
 * @property {string[]} styles
 * @property {AspectRatioId} aspectRatio
 * @property {AdvancedSettings} advanced  as run — `seed` is the one actually used
 * @property {string} createdAt
 * @property {Generation[]} items
 */

/**
 * @typedef {object} HistoryPage
 * @property {Batch[]} items
 * @property {string | null} nextCursor
 */

/**
 * @typedef {object} ApiErrorBody
 * @property {{ code: string, message: string, field?: string }} error
 */

export {};
