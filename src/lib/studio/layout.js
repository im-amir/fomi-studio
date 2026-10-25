/** @import { StudioProject } from './types' */

/**
 * Lineage canvas geometry. Lanes are rows (one per branch); columns are time (one per
 * take, oldest left). Everything is computed from these constants, so cards and
 * connectors line up without measuring the DOM.
 */
export const LAYOUT = {
  laneHeaderWidth: 200,
  cardWidth: 248,
  cardHeight: 312,
  // Wider than the card so branch connectors can turn in the gutter, never behind a card.
  columnWidth: 304,
  laneHeight: 348,
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
 * @property {string} path      SVG path data
 * @property {number} hue       lane colour of the child
 * @property {boolean} branch   true when it starts a new lane
 */

/**
 * @param {StudioProject} project
 */
export function layoutLineage(project) {
  const { laneHeaderWidth, cardWidth, cardHeight, columnWidth, laneHeight, padding } = LAYOUT;
  const rowOf = new Map(project.branches.map((branch, index) => [branch.id, index]));
  const hueOf = new Map(project.branches.map((branch) => [branch.id, branch.hue]));

  /** @type {Map<string, CardBox>} */
  const boxes = new Map();
  project.takes.forEach((take, column) => {
    const row = rowOf.get(take.branchId) ?? 0;
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
        path: connectorPath(
          from.x + cardWidth,
          from.y + cardHeight / 2,
          to.x,
          to.y + cardHeight / 2,
        ),
        hue: hueOf.get(take.branchId) ?? 1,
        branch: from.row !== to.row,
      },
    ];
  });

  return {
    boxes,
    connectors,
    width:
      laneHeaderWidth +
      padding * 2 +
      project.takes.length * columnWidth -
      (columnWidth - cardWidth),
    height: project.branches.length * laneHeight,
  };
}

/**
 * Leaves the parent, turns in the first gutter, then runs along the child's lane — so a
 * branch line never passes behind another card in the parent's lane.
 * @param {number} x1 @param {number} y1 @param {number} x2 @param {number} y2
 */
function connectorPath(x1, y1, x2, y2) {
  if (y1 === y2) return `M ${x1} ${y1} H ${x2}`;
  const turnX = x1 + (LAYOUT.columnWidth - LAYOUT.cardWidth) / 2;
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
