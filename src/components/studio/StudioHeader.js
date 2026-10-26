'use client';

import { Command } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Kbd } from '@/components/ui/Kbd';
import { useModifierKey } from '@/hooks/useModifierKey';

/** @import { StudioProject } from '@/lib/studio/types' */

/**
 * Where you are and how far along: the project, its client and its size at a glance,
 * plus the doors to the keyboard-first workflow.
 * @param {{ project: StudioProject, onOpenCommands: () => void, onOpenShortcuts: () => void }} props
 */
export function StudioHeader({ project, onOpenCommands, onOpenShortcuts }) {
  const mod = useModifierKey();
  const images = project.takes.reduce((total, take) => total + take.items.length, 0);
  const stats = [
    `${project.branches.length} branches`,
    `${project.takes.length} takes`,
    `${images} images`,
    `${project.picks.length} picks`,
  ];

  return (
    <section
      aria-labelledby="project-title"
      className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1"
    >
      <div>
        <p className="text-sm text-ink-500">{project.client}</p>
        <h1 id="project-title" className="font-display text-xl text-ink-900">
          {project.name}
        </h1>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-sm text-ink-500 tabular-nums">{stats.join(' · ')}</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={onOpenCommands}
            icon={<Command className="size-4" />}
          >
            Commands
            {mod && <Kbd className="ml-1 max-md:hidden">{mod}K</Kbd>}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenShortcuts}
            aria-label="Keyboard shortcuts"
            className="max-md:hidden"
          >
            <Kbd>?</Kbd>
          </Button>
        </div>
      </div>
    </section>
  );
}
