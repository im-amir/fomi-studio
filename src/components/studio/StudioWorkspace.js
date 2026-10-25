'use client';

import { Suspense, useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { PrimaryNav } from '@/components/shared/PrimaryNav';
import { TopBar } from '@/components/shared/TopBar';
import { ToastProvider, useToast } from '@/components/ui/Toaster';
import { useHotkeys } from '@/hooks/useHotkeys';
import { downloadGeneration } from '@/lib/download';
import { buildHandoff, downloadJson } from '@/lib/studio/export';
import { layoutLineage } from '@/lib/studio/layout';
import { neighbourImage } from '@/lib/studio/navigation';
import { BRANCH_INPUT_ID, BranchComposer } from './BranchComposer';
import { CompareBar } from './CompareBar';
import { DirectionBar } from './DirectionBar';
import { SelectsTray } from './SelectsTray';
import { Inspector } from './Inspector';
import { LineageCanvas } from './LineageCanvas';
import { StudioHeader } from './StudioHeader';
import { useBranching } from './useBranching';
import { useStudio } from './useStudio';
import { useStudioCommands } from './useStudioCommands';

/** @import { StudioProject } from '@/lib/studio/types' */
/** @import { TileAction } from '@/components/shared/MediaTile' */
/** @import { Generation } from '@/lib/types' */

const MediaLightbox = dynamic(() => import('@/components/shared/MediaLightbox'));
const CompareView = dynamic(() => import('./CompareView'));
const CommandPalette = dynamic(() => import('@/components/ui/CommandPalette'));
const ShortcutsSheet = dynamic(() => import('./ShortcutsSheet'));
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
  const [compareOpen, setCompareOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const overlayOpen = viewerOpen || compareOpen || paletteOpen || shortcutsOpen;
  const branching = useBranching({ state, dispatch, direction: view.direction });
  const layout = useMemo(() => layoutLineage(view), [view]);

  const selected = state.selectedImageId ? imageIndex.get(state.selectedImageId) : undefined;
  const selectedItem = selected?.take.items[selected.index];
  const takeLabel = useCallback(
    /** @param {string} id */ (id) => `T${view.takes.findIndex((take) => take.id === id) + 1}`,
    [view.takes],
  );
  const allItems = useMemo(() => view.takes.flatMap((take) => take.items), [view.takes]);

  const pickedItems = useMemo(
    () => [...state.picks].flatMap((pickId) => allItems.find((item) => item.id === pickId) ?? []),
    [state.picks, allItems],
  );

  const compareEntries = useMemo(
    () =>
      state.compareIds.flatMap((compareId) => {
        const found = imageIndex.get(compareId);
        return found
          ? [
              {
                item: found.take.items[found.index],
                take: found.take,
                label: `${takeLabel(found.take.id)} · ${found.index + 1}`,
              },
            ]
          : [];
      }),
    [state.compareIds, imageIndex, takeLabel],
  );
  const canCompare = compareEntries.length >= 2;

  const exportSelects = () => {
    downloadJson(buildHandoff(view, [...state.picks], takeLabel), 'hearth-autumn-selects.json');
    toast(`Exported ${state.picks.size} selects with their recipes`, { tone: 'success' });
  };

  const commands = useStudioCommands({
    state,
    view,
    takeLabel,
    canCompare,
    handlers: {
      select: (imageId) => dispatch({ type: 'select', id: imageId }),
      togglePick: (imageId) => dispatch({ type: 'togglePick', id: imageId }),
      toggleReject: (imageId) => dispatch({ type: 'toggleReject', id: imageId }),
      toggleCompare: (imageId) => dispatch({ type: 'toggleCompare', id: imageId }),
      openCompare: () => setCompareOpen(true),
      focusBranch: () => document.getElementById(BRANCH_INPUT_ID)?.focus(),
      reroll: () =>
        selected &&
        selectedItem &&
        branching.branch({
          source: selected.take,
          sourceImageId: selectedItem.id,
          changes: {},
          placement: 'continue',
        }),
      openViewer: () => setViewerOpen(true),
      exportSelects,
      showShortcuts: () => setShortcutsOpen(true),
    },
  });

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
      b: () => document.getElementById(BRANCH_INPUT_ID)?.focus(),
      'shift+c': () => canCompare && setCompareOpen(true),
      'mod+k': () => setPaletteOpen(true),
      'shift+?': () => setShortcutsOpen(true),
    },
    { enabled: !overlayOpen },
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
      <StudioHeader
        project={view}
        onOpenCommands={() => setPaletteOpen(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
      />
      <DirectionBar direction={view.direction} />

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <main aria-label="Project lineage" className="flex min-h-0 min-w-0 flex-col gap-3">
          <LineageCanvas
            project={view}
            layout={layout}
            picks={state.picks}
            rejects={state.rejects}
            compareIds={state.compareIds}
            selectedImageId={state.selectedImageId}
            onSelectImage={select}
            takeLabel={takeLabel}
            pending={state.pending}
            onRetryPending={branching.retry}
            onCancelPending={branching.cancel}
            className="min-h-0 flex-1 max-lg:h-[70dvh] max-lg:flex-none"
          />
          {compareEntries.length > 0 && (
            <CompareBar
              items={compareEntries.map((entry) => entry.item)}
              onOpen={() => setCompareOpen(true)}
              onClear={() => dispatch({ type: 'clearCompare' })}
            />
          )}
          <SelectsTray
            items={pickedItems}
            selectedImageId={state.selectedImageId}
            onSelect={select}
            onUnpick={(imageId) => dispatch({ type: 'togglePick', id: imageId })}
            onExport={exportSelects}
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
          >
            <BranchComposer
              key={selected.take.id}
              source={selected.take}
              sourceImageId={selectedItem.id}
              sourceLabel={`${takeLabel(selected.take.id)} · ${selected.index + 1}`}
              busy={branching.busy}
              onBranch={branching.branch}
            />
          </Inspector>
        )}
      </div>

      <Suspense fallback={null}>
        {paletteOpen && (
          <CommandPalette
            commands={commands}
            onClose={() => setPaletteOpen(false)}
            placeholder="Search actions, takes and branches…"
          />
        )}
      </Suspense>
      <Suspense fallback={null}>
        {shortcutsOpen && <ShortcutsSheet onClose={() => setShortcutsOpen(false)} />}
      </Suspense>
      <Suspense fallback={null}>
        {compareOpen && canCompare && (
          <CompareView
            entries={compareEntries}
            picks={state.picks}
            onTogglePick={(imageId) => dispatch({ type: 'togglePick', id: imageId })}
            onRemove={(imageId) => dispatch({ type: 'toggleCompare', id: imageId })}
            onClose={() => setCompareOpen(false)}
          />
        )}
      </Suspense>
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
