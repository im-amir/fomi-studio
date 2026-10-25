'use client';

import { useState } from 'react';
import { PrimaryNav } from '@/components/shared/PrimaryNav';
import { TopBar } from '@/components/shared/TopBar';
import { DirectionBar } from './DirectionBar';
import { LineageCanvas } from './LineageCanvas';
import { StudioHeader } from './StudioHeader';

/** @import { StudioProject } from '@/lib/studio/types' */

/**
 * Part B: a project workspace where every result keeps its lineage.
 * @param {{ project: StudioProject }} props
 */
export function StudioWorkspace({ project }) {
  const [selectedImageId, setSelectedImageId] = useState(/** @type {string | null} */ (null));
  const [picks] = useState(() => new Set(project.picks));
  const [rejects] = useState(() => new Set(project.rejects));

  return (
    <div className="mx-auto flex max-w-[110rem] flex-col gap-4 px-4 pb-6 md:px-6 lg:h-dvh lg:px-8">
      <TopBar nav={<PrimaryNav activeId="projects" />} />
      <StudioHeader project={project} />
      <DirectionBar direction={project.direction} />
      <main className="min-h-0 flex-1">
        <LineageCanvas
          project={project}
          picks={picks}
          rejects={rejects}
          selectedImageId={selectedImageId}
          onSelectImage={setSelectedImageId}
          className="h-full max-lg:h-[70dvh]"
        />
      </main>
    </div>
  );
}
