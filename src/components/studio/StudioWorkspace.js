'use client';

import { Suspense, useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { PrimaryNav } from '@/components/shared/PrimaryNav';
import { TopBar } from '@/components/shared/TopBar';
import { ToastProvider, useToast } from '@/components/ui/Toaster';
import { useHotkeys } from '@/hooks/useHotkeys';
import { downloadGeneration } from '@/lib/download';
import { layoutLineage } from '@/lib/studio/layout';
import { neighbourImage } from '@/lib/studio/navigation';
import { DirectionBar } from './DirectionBar';
import { Inspector } from './Inspector';
import { LineageCanvas } from './LineageCanvas';
import { StudioHeader } from './StudioHeader';
import { useStudio } from './useStudio';

/** @import { StudioProject } from '@/lib/studio/types' */
/** @import { TileAction } from '@/components/shared/MediaTile' */
/** @import { Generation } from '@/lib/types' */

const MediaLightbox = dynamic(() => import('@/components/shared/MediaLightbox'));
const NO_UPSCALES = new Set(/** @type {string[]} */ ([]));

/**
 * Part B: a project workspace where every result keeps its lineage.
 * @param {{ project: StudioProject }} props
 */
export function StudioWorkspace({ project }) {
  return (
    <ToastProvider>
      <Studio project={project} />
    </ToastProvider>
  );
}

/** @param {{ project: StudioProject }} props */
function Studio({ project }) {
  const toast = useToast();
  const { state, dispatch, view, imageIndex } = useStudio(project);
  const [viewerOpen, setViewerOpen] = useState(false);
  const layout = useMemo(() => layoutLineage(view), [view]);

  const selected = state.selectedImageId ? imageIndex.get(state.selectedImageId) : undefined;
  const selectedItem = selected?.take.items[selected.index];
  const takeLabel = useCallback(
    /** @param {string} id */ (id) => `T${view.takes.findIndex((take) => take.id === id) + 1}`,
    [view.takes],
  );
  const allItems = useMemo(() => view.takes.flatMap((take) => take.items), [view.takes]);

  const select = useCallback(
    /** @param {string} id */ (id) => dispatch({ type: 'select', id }),
    [dispatch],
  );

  /** @param {import('@/lib/studio/navigation').Direction} direction */
  const move = (direction) => {
    if (!state.selectedImageId) return;
    const next = neighbourImage(view, layout.boxes, imageIndex, state.selectedImageId, direction);
    if (next) select(next);
  };

  /** @param {Generation} item */
  const download = (item) => {
    toast('Preparing download…');
    downloadGeneration(item).catch(() => toast('Download failed. Try again.', { tone: 'error' }));
  };

  const id = state.selectedImageId;
  useHotkeys(
    {
      arrowleft: () => move('left'),
      arrowright: () => move('right'),
      arrowup: () => move('up'),
      arrowdown: () => move('down'),
      p: () => id && dispatch({ type: 'togglePick', id }),
      x: () => id && dispatch({ type: 'toggleReject', id }),
      c: () => id && dispatch({ type: 'toggleCompare', id }),
      enter: () => id && setViewerOpen(true),
    },
    { enabled: !viewerOpen },
  );

  /** @param {TileAction} action @param {Generation} item */
  const handleViewerAction = (action, item) => {
    if (action === 'favorite') dispatch({ type: 'togglePick', id: item.id });
    if (action === 'download') download(item);
    if (action === 'upscale') toast('Upscaling is available after export.');
  };

  return (
    <div className="mx-auto flex max-w-[110rem] flex-col gap-4 px-4 pb-6 md:px-6 lg:h-dvh lg:px-8">
      <TopBar nav={<PrimaryNav activeId="projects" />} />
      <StudioHeader project={view} />
      <DirectionBar direction={view.direction} />

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <main aria-label="Project lineage" className="min-h-0">
          <LineageCanvas
            project={view}
            layout={layout}
            picks={state.picks}
            rejects={state.rejects}
            compareIds={state.compareIds}
            selectedImageId={state.selectedImageId}
            onSelectImage={select}
            takeLabel={takeLabel}
            className="h-full max-lg:h-[70dvh]"
          />
        </main>

        {selected && selectedItem && (
          <Inspector
            item={selectedItem}
            take={selected.take}
            takeLabel={takeLabel(selected.take.id)}
            parent={view.takes.find((take) => take.id === selected.take.parentTakeId)}
            branch={view.branches.find((branch) => branch.id === selected.take.branchId)}
            direction={view.direction}
            picked={state.picks.has(selectedItem.id)}
            rejected={state.rejects.has(selectedItem.id)}
            comparing={state.compareIds.includes(selectedItem.id)}
            onTogglePick={() => dispatch({ type: 'togglePick', id: selectedItem.id })}
            onToggleReject={() => dispatch({ type: 'toggleReject', id: selectedItem.id })}
            onToggleCompare={() => dispatch({ type: 'toggleCompare', id: selectedItem.id })}
            onOpen={() => setViewerOpen(true)}
            onDownload={() => download(selectedItem)}
            className="min-h-0 overflow-y-auto max-lg:hidden"
          />
        )}
      </div>

      <Suspense fallback={null}>
        {viewerOpen && selectedItem && (
          <MediaLightbox
            items={allItems}
            index={allItems.indexOf(selectedItem)}
            favorites={state.picks}
            upscaled={NO_UPSCALES}
            onIndexChange={(index) => select(allItems[index].id)}
            onClose={() => setViewerOpen(false)}
            onAction={handleViewerAction}
          />
        )}
      </Suspense>
    </div>
  );
}
