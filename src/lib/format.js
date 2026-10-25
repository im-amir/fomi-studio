/**
 * Shortens text at a word boundary, for alt text and tooltips.
 * @param {string} text
 * @param {number} maxLength
 */
export function truncateWords(text, maxLength) {
  const clean = text.trim().replace(/\s+/g, ' ');
  if (clean.length <= maxLength) return clean;
  const cut = clean.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,.;:]$/, '')}…`;
}

/** @param {number} seconds */
export function formatDuration(seconds) {
  const whole = Math.round(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

const relativeTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'short' });
const RELATIVE_UNITS = /** @type {const} */ ([
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
]);

/**
 * "3 hr. ago", "yesterday" — `now` is injected so render output stays pure and testable.
 * @param {string} isoDate
 * @param {number} now epoch ms
 */
export function formatRelativeTime(isoDate, now) {
  const seconds = (new Date(isoDate).getTime() - now) / 1000;
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= size) return relativeTime.format(Math.round(seconds / size), unit);
  }
  return 'just now';
}

/**
 * Joins class names, skipping falsy values.
 * @param {...(string | false | null | undefined)} classes
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
