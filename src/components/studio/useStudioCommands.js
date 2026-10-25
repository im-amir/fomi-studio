'use client';

import { useMemo } from 'react';
import { diffRecipe } from '@/lib/studio/recipe';

/** @import { Command } from '@/components/ui/CommandPalette' */
/** @import { StudioProject, Take } from '@/lib/studio/types' */
/** @import { StudioState } from './useStudio' */

/**
 * @typedef {object} CommandHandlers
 * @property {(id: string) => void} select
 * @property {(id: string) => void} togglePick
 * @property {(id: string) => void} toggleReject
 * @property {(id: string) => void} toggleCompare
 * @property {() => void} openCompare
 * @property {() => void} focusBranch
 * @property {() => void} reroll
 * @property {() => void} openViewer
 * @property {() => void} exportSelects
 * @property {() => void} showShortcuts
 */

/**
 * The command bar's contents, derived from current state: actions on the selection
 * first, then every take and branch as a destination, then project actions.
 * @param {{
 *   state: StudioState,
 *   view: StudioProject,
 *   takeLabel: (takeId: string) => string,
 *   canCompare: boolean,
 *   handlers: CommandHandlers,
 * }} params
 * @returns {Command[]}
 */
export function useStudioCommands({ state, view, takeLabel, canCompare, handlers }) {
  return useMemo(() => {
    const id = state.selectedImageId;
    const branchName = new Map(view.branches.map((branch) => [branch.id, branch.name]));
    const takeById = new Map(view.takes.map((take) => [take.id, take]));
    /** @param {Take} take */
    const describe = (take) => {
      const parent = take.parentTakeId ? takeById.get(take.parentTakeId) : undefined;
      const changes = diffRecipe(parent?.recipe ?? null, take.recipe);
      return changes.length
        ? changes.map((change) => `${change.label}: ${change.to}`).join(' · ')
        : 'Starting point';
    };

    /** @type {Command[]} */
    const selection = id
      ? [
          {
            id: 'pick',
            group: 'Selection',
            title: state.picks.has(id) ? 'Unpick image' : 'Pick image',
            shortcut: 'P',
            keywords: 'keep favourite',
            run: () => handlers.togglePick(id),
          },
          {
            id: 'reject',
            group: 'Selection',
            title: state.rejects.has(id) ? 'Un-reject image' : 'Reject image',
            shortcut: 'X',
            run: () => handlers.toggleReject(id),
          },
          {
            id: 'branch',
            group: 'Selection',
            title: 'Branch from this image…',
            shortcut: 'B',
            keywords: 'change new variation',
            run: handlers.focusBranch,
          },
          {
            id: 'reroll',
            group: 'Selection',
            title: 'Re-roll this take',
            keywords: 'again same recipe new seed',
            run: handlers.reroll,
          },
          {
            id: 'compare-add',
            group: 'Selection',
            title: state.compareIds.includes(id) ? 'Remove from compare' : 'Add to compare',
            shortcut: 'C',
            run: () => handlers.toggleCompare(id),
          },
          {
            id: 'view',
            group: 'Selection',
            title: 'View full size',
            shortcut: '↵',
            keywords: 'open zoom',
            run: handlers.openViewer,
          },
        ]
      : [];

    /** @type {Command[]} */
    const project = [
      ...(canCompare
        ? [
            {
              id: 'compare-open',
              group: 'Project',
              title: `Compare ${state.compareIds.length} images`,
              shortcut: '⇧C',
              run: handlers.openCompare,
            },
          ]
        : []),
      {
        id: 'export',
        group: 'Project',
        title: `Export ${state.picks.size} selects`,
        keywords: 'download handoff json',
        run: handlers.exportSelects,
      },
      {
        id: 'shortcuts',
        group: 'Project',
        title: 'Keyboard shortcuts',
        shortcut: '?',
        keywords: 'help keys',
        run: handlers.showShortcuts,
      },
    ];

    /** @type {Command[]} */
    const takes = [...view.takes]
      .reverse()
      .filter((take) => take.items.length > 0)
      .map((take) => ({
        id: `go-${take.id}`,
        group: 'Go to take',
        title: `${takeLabel(take.id)} · ${branchName.get(take.branchId) ?? ''}`,
        detail: describe(take),
        keywords: Object.values(take.recipe).join(' '),
        run: () => handlers.select(take.items[0].id),
      }));

    /** @type {Command[]} */
    const branches = view.branches.flatMap((branch) => {
      const latest = [...view.takes]
        .reverse()
        .find((take) => take.branchId === branch.id && take.items.length > 0);
      return latest
        ? [
            {
              id: `branch-${branch.id}`,
              group: 'Go to branch',
              title: branch.name,
              detail: `Latest: ${takeLabel(latest.id)}`,
              run: () => handlers.select(latest.items[0].id),
            },
          ]
        : [];
    });

    return [...selection, ...project, ...takes, ...branches];
  }, [state, view, takeLabel, canCompare, handlers]);
}
