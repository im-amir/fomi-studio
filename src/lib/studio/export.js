/** @import { StudioProject } from './types' */

const FULL_SIZE_PARAMS = 'w=2048&q=90&fm=jpg';

/**
 * A hand-off of the picked images with everything needed to reproduce or extend them:
 * the lane and take they came from, the full recipe, the prompt actually sent, seed and
 * model. This is what a designer passes on, not just a folder of JPEGs.
 * @param {StudioProject} project
 * @param {string[]} pickIds  in the order they were picked
 * @param {(takeId: string) => string} takeLabel
 */
export function buildHandoff(project, pickIds, takeLabel) {
  const branchName = new Map(project.branches.map((branch) => [branch.id, branch.name]));
  const selects = pickIds.flatMap((id) => {
    const take = project.takes.find((candidate) => candidate.items.some((item) => item.id === id));
    const item = take?.items.find((candidate) => candidate.id === id);
    if (!take || !item) return [];
    return [
      {
        id,
        take: takeLabel(take.id),
        branch: branchName.get(take.branchId),
        image: item.src.startsWith('http') ? `${item.src}&${FULL_SIZE_PARAMS}` : item.src,
        recipe: take.recipe,
        prompt: take.prompt,
        negativePrompt: project.direction.avoid.join(', '),
        seed: item.seed,
        model: take.model,
        size: `${item.width}×${item.height}`,
      },
    ];
  });
  return {
    project: `${project.client} — ${project.name}`,
    exportedAt: new Date().toISOString(),
    direction: project.direction,
    selects,
  };
}

/**
 * @param {unknown} data
 * @param {string} filename
 */
export function downloadJson(data, filename) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
