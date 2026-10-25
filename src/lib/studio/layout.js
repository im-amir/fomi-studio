/** @import { StudioProject } from './types' */

/**
 * Lineage canvas geometry. Lanes are rows (one per branch); columns are generations: a
 * take sits one column right of its parent and of the previous take in its lane (like a
 * compact git graph), so order is kept without a column per timestamp leaving the
 * canvas mostly empty. Everything is computed from these constants, so cards and
 * connectors line up without measuring the DOM.
 */
export const LAYOUT = {
  laneHeaderWidth: 200,
  compactLaneHeaderWidth: 40,
  thumbSize: 84,
  cardWidth: 384,
  cardHeight: 168,
  // Wider than the card so branch connectors can turn in the gutter, never behind a card.
  columnWidth: 440,
  laneHeight: 196,
  padding: 32,
  cornerRadius: 14,
};

/**
 * @typedef {object} CardBox
 * @property {number} x
 * @property {number} y
 * @property {number} row
 * @property {number} column
 */

/**
 * @typedef {object} Connector
 * @property {string} id
 * @property {string} childId   the take the line leads to
 * @property {string} path      SVG path data
 * @property {number} hue       lane colour of the child
 * @property {boolean} branch   true when it starts a new lane
 */

/**
 * @param {StudioProject} project
 * @param {{ laneHeaderWidth?: number }} [options]  narrower lane names on phones
 */
export function layoutLineage(project, { laneHeaderWidth = LAYOUT.laneHeaderWidth } = {}) {
  const { cardWidth, cardHeight, columnWidth, laneHeight, padding } = LAYOUT;
  const rowOf = new Map(project.branches.map((branch, index) => [branch.id, index]));
  const hueOf = new Map(project.branches.map((branch) => [branch.id, branch.hue]));

  /** @type {Map<string, CardBox>} */
  const boxes = new Map();
  /** @type {Map<string, number>} last column used in each lane */
  const laneEnd = new Map();
  // Takes are oldest first, so a parent is always placed before its children.
  project.takes.forEach((take) => {
    const row = rowOf.get(take.branchId) ?? 0;
    const parentColumn = take.parentTakeId ? (boxes.get(take.parentTakeId)?.column ?? -1) : -1;
    const column = Math.max(parentColumn, laneEnd.get(take.branchId) ?? -1) + 1;
    laneEnd.set(take.branchId, column);
    boxes.set(take.id, {
      row,
      column,
      x: laneHeaderWidth + padding + column * columnWidth,
      y: row * laneHeight + (laneHeight - cardHeight) / 2,
    });
  });

  /** @type {Connector[]} */
  const connectors = project.takes.flatMap((take) => {
    const from = take.parentTakeId ? boxes.get(take.parentTakeId) : undefined;
    const to = boxes.get(take.id);
    if (!from || !to) return [];
    return [
      {
        id: `${take.parentTakeId}-${take.id}`,
        childId: take.id,
        path: connectorPath(
          from.x + cardWidth,
          from.y + cardHeight / 2,
          to.x,
          to.y + cardHeight / 2,
          to.row,
        ),
        hue: hueOf.get(take.branchId) ?? 1,
        branch: from.row !== to.row,
      },
    ];
  });

  const columns = Math.max(0, ...[...boxes.values()].map((box) => box.column)) + 1;
  return {
    laneHeaderWidth,
    boxes,
    connectors,
    width: laneHeaderWidth + padding * 2 + columns * columnWidth - (columnWidth - cardWidth),
    height: project.branches.length * laneHeight,
  };
}

const LANE_OFFSET_PX = 6;

/**
 * Leaves the parent, turns in the first gutter, then runs along the child's lane — so a
 * branch line never passes behind another card in the parent's lane. The turn shifts a
 * little per target lane so branches sharing a gutter stay distinguishable.
 * @param {number} x1 @param {number} y1 @param {number} x2 @param {number} y2
 * @param {number} targetRow
 */
function connectorPath(x1, y1, x2, y2, targetRow) {
  if (y1 === y2) return `M ${x1} ${y1} H ${x2}`;
  const turnX = x1 + (LAYOUT.columnWidth - LAYOUT.cardWidth) / 2 + (targetRow - 2) * LANE_OFFSET_PX;
  const r = Math.min(LAYOUT.cornerRadius, Math.abs(y2 - y1) / 2);
  const dir = y2 > y1 ? 1 : -1;
  return [
    `M ${x1} ${y1}`,
    `H ${turnX - r}`,
    `Q ${turnX} ${y1} ${turnX} ${y1 + dir * r}`,
    `V ${y2 - dir * r}`,
    `Q ${turnX} ${y2} ${turnX + r} ${y2}`,
    `H ${x2}`,
  ].join(' ');
}
