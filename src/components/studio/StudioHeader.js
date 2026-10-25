/** @import { StudioProject } from '@/lib/studio/types' */

/**
 * Where you are and how far along: the project, its client and its size at a glance.
 * @param {{ project: StudioProject }} props
 */
export function StudioHeader({ project }) {
  const images = project.takes.reduce((total, take) => total + take.items.length, 0);
  const stats = [
    `${project.branches.length} branches`,
    `${project.takes.length} takes`,
    `${images} images`,
    `${project.picks.length} picks`,
  ];

  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
      <div>
        <p className="text-sm text-ink-500">{project.client}</p>
        <h1 className="font-display text-xl text-ink-900">{project.name}</h1>
      </div>
      <p className="text-sm text-ink-500 tabular-nums">{stats.join(' · ')}</p>
    </div>
  );
}
