/** True on macOS / iOS, where shortcuts use ⌘ instead of Ctrl. Client-only. */
export function isApplePlatform() {
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
}
