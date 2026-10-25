/**
 * Sample clips for video mode (Mixkit free license), stored in /public so the demo
 * never depends on a third-party host. Posters were extracted at 1s with ffmpeg.
 *
 * @typedef {object} VideoClip
 * @property {string} id
 * @property {string} src
 * @property {string} poster
 * @property {number} width
 * @property {number} height
 * @property {number} duration  seconds
 * @property {string} prompt
 * @property {string[]} keywords
 */

/** @type {VideoClip[]} */
export const VIDEO_CLIPS = [
  {
    id: 'mixkit-10050',
    src: '/media/video/mixkit-10050.mp4',
    poster: '/media/video/mixkit-10050.jpg',
    width: 640,
    height: 360,
    duration: 12.96,
    prompt: 'Slow upward pan through a golden autumn forest, leaves drifting down in the breeze',
    keywords: ['autumn', 'fall', 'leaves', 'forest', 'golden'],
  },
  {
    id: 'mixkit-14911',
    src: '/media/video/mixkit-14911.mp4',
    poster: '/media/video/mixkit-14911.jpg',
    width: 640,
    height: 360,
    duration: 20.92,
    prompt: 'Sunlight bursting through a canopy of red maple leaves, gentle handheld drift',
    keywords: ['sun', 'canopy', 'red', 'maple', 'light', 'tree'],
  },
  {
    id: 'mixkit-4756',
    src: '/media/video/mixkit-4756.mp4',
    poster: '/media/video/mixkit-4756.jpg',
    width: 640,
    height: 360,
    duration: 5.84,
    prompt: 'A young woman smiling at the camera in a softly lit library, shallow depth of field',
    keywords: ['portrait', 'woman', 'smile', 'library', 'person', 'face'],
  },
];
