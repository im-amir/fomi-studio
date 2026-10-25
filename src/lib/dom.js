/**
 * Scrolls `scroller` (only) just enough to show `element`. Unlike scrollIntoView, it never
 * scrolls the page or other ancestors, and it respects edges covered by sticky UI.
 * @param {HTMLElement} scroller
 * @param {Element} element
 * @param {{ top?: number, right?: number, bottom?: number, left?: number }} [inset] px kept clear
 */
export function revealWithin(scroller, element, inset = {}) {
  const { top = 16, right = 16, bottom = 16, left = 16 } = inset;
  const area = scroller.getBoundingClientRect();
  const box = element.getBoundingClientRect();
  const dx =
    box.left < area.left + left
      ? box.left - area.left - left
      : box.right > area.right - right
        ? box.right - area.right + right
        : 0;
  const dy =
    box.top < area.top + top
      ? box.top - area.top - top
      : box.bottom > area.bottom - bottom
        ? box.bottom - area.bottom + bottom
        : 0;
  if (dx || dy) scroller.scrollBy({ left: dx, top: dy, behavior: 'smooth' });
}
