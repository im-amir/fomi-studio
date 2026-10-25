/** @import { StudioProject, Take } from './types' */
/** @import { CardBox } from './layout' */

/** @typedef {'left' | 'right' | 'up' | 'down'} Direction */

/**
 * Arrow-key movement across the lineage canvas.
 * ← / → walk a lane's images in order (across its takes); ↑ / ↓ jump to the nearest
 * take in the lane above/below, keeping the same position within the take.
 * @param {StudioProject} project
 * @param {Map<string, CardBox>} boxes
 * @param {Map<string, { take: Take, index: number }>} imageIndex
 * @param {string} currentId
 * @param {Direction} direction
 * @returns {string | null} the image to select, or null if there's nowhere to go
 */
export function neighbourImage(project, boxes, imageIndex, currentId, direction) {
  const current = imageIndex.get(currentId);
  if (!current) return null;
  const { take, index } = current;

  if (direction === 'left' || direction === 'right') {
    const laneImages = project.takes
      .filter((candidate) => candidate.branchId === take.branchId)
      .sort((a, b) => (boxes.get(a.id)?.column ?? 0) - (boxes.get(b.id)?.column ?? 0))
      .flatMap((candidate) => candidate.items.map((item) => item.id));
    const position = laneImages.indexOf(currentId) + (direction === 'right' ? 1 : -1);
    return laneImages[position] ?? null;
  }

  const rows = project.branches.map((branch) => branch.id);
  const column = boxes.get(take.id)?.column ?? 0;
  const step = direction === 'down' ? 1 : -1;
  // Skip lanes that have no finished takes yet.
  for (let row = rows.indexOf(take.branchId) + step; row >= 0 && row < rows.length; row += step) {
    const candidates = project.takes.filter(
      (candidate) => candidate.branchId === rows[row] && candidate.items.length > 0,
    );
    if (candidates.length === 0) continue;
    const nearest = candidates.reduce((best, candidate) =>
      Math.abs((boxes.get(candidate.id)?.column ?? 0) - column) <
      Math.abs((boxes.get(best.id)?.column ?? 0) - column)
        ? candidate
        : best,
    );
    return nearest.items[Math.min(index, nearest.items.length - 1)].id;
  }
  return null;
}
