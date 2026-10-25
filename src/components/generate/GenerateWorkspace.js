'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { PrimaryNav } from '@/components/shared/PrimaryNav';
import { TopBar } from '@/components/shared/TopBar';
import { ToastProvider } from '@/components/ui/Toaster';
import { useCanvasFeed } from '@/hooks/useCanvasFeed';
import { useComposerSettings } from '@/hooks/useComposerSettings';
import { useHistory } from '@/hooks/useHistory';
import { BatchFeed } from './BatchFeed';
import { ControlPanel } from './ControlPanel';
import { HistoryStrip } from './HistoryStrip';
import { PromptDock } from './PromptDock';
import { useWorkspaceActions } from './useWorkspaceActions';

/** @import { HistoryPage } from '@/lib/types' */

const loadLightbox = () => import('@/components/shared/MediaLightbox');
const MediaLightbox = dynamic(loadLightbox);
const HistoryDialog = dynamic(() => import('./HistoryDialog'));
const SettingsSheet = dynamic(() => import('./SettingsSheet'));

/**
 * Part A: the generation workspace from the FOMI mockup.
 * Desktop is an app shell — top bar and history strip stay put, the settings panel stays
 * in reach, and only the results scroll (under the strip, as in the mockup).
 * @param {{ initialHistory: HistoryPage, initialFeedSize: number }} props
 */
export function GenerateWorkspace(props) {
  return (
    <ToastProvider>
      <Workspace {...props} />
    </ToastProvider>
  );
}

/** @param {{ initialHistory: HistoryPage, initialFeedSize: number }} props */
function Workspace({ initialHistory, initialFeedSize }) {
  const composer = useComposerSettings();
  const history = useHistory(initialHistory);
  const feed = useCanvasFeed(initialHistory.items.slice(0, initialFeedSize));
  const [viewerItemId, setViewerItemId] = useState(/** @type {string | null} */ (null));
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  /** @type {React.RefObject<HTMLElement | null>} */
  const feedRef = useRef(null);

  const actions = useWorkspaceActions({
    composer,
    feed,
    history,
    feedRef,
    overlayOpen: viewerItemId !== null || historyOpen || settingsOpen,
  });

  const viewerItems = useMemo(() => feed.batches.flatMap((batch) => batch.items), [feed.batches]);
  const viewerIndex = viewerItems.findIndex((item) => item.id === viewerItemId);

  useEffect(() => {
    if (!feed.highlightedId) return;
    document
      .getElementById(`batch-${feed.highlightedId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [feed.highlightedId]);

  const openViewer = useCallback(/** @param {string} id */ (id) => setViewerItemId(id), []);

  return (
    <div className="mx-auto flex max-w-[110rem] flex-col px-4 md:px-6 lg:h-dvh lg:overflow-hidden lg:px-8">
      <a
        href="#results"
        className="fixed top-3 left-3 z-[80] -translate-y-24 rounded-control bg-ink-900 px-4 py-2 text-sm font-medium text-canvas shadow-lg transition-[translate] duration-base focus:translate-y-0"
      >
        Skip to results
      </a>
      <TopBar
        nav={<PrimaryNav activeId={composer.settings.mode} onModeChange={composer.setMode} />}
        onOpenGallery={() => setHistoryOpen(true)}
      />

      <div className="relative min-h-0 flex-1">
        <HistoryStrip
          items={history.items}
          activeBatchId={feed.highlightedId}
          onSelect={actions.showFromHistory}
          onViewAll={() => setHistoryOpen(true)}
          className="z-20 lg:absolute lg:inset-x-0 lg:top-0"
        />

        <div className="mt-4 grid gap-6 lg:mt-0 lg:h-full lg:grid-cols-[18.75rem_minmax(0,1fr)] lg:gap-7">
          <ControlPanel
            composer={composer}
            buttonState={actions.buttonState}
            onGenerate={actions.generateFromComposer}
            onCancel={actions.cancel}
            className="lg:mt-30 lg:mb-6 lg:overflow-y-auto"
          />

          <main
            ref={feedRef}
            id="results"
            tabIndex={-1}
            // Warm the viewer chunk on first intent so opening a result is instant.
            onPointerEnter={loadLightbox}
            onFocus={loadLightbox}
            aria-label="Results"
            className="pb-10 lg:[scrollbar-width:thin] lg:[scrollbar-color:var(--color-line-strong)_transparent] lg:overflow-y-auto lg:pt-30 lg:pr-2"
          >
            <h1 className="sr-only">Create</h1>
            <BatchFeed
              batches={feed.batches}
              initialIds={feed.initialIds}
              generation={actions.generation}
              highlightedId={feed.highlightedId}
              favorites={feed.favorites}
              upscaled={feed.upscaled}
              onOpen={openViewer}
              onAction={actions.handleTileAction}
              onCopyPrompt={actions.copyPrompt}
              onReuse={actions.reuse}
              onHide={feed.remove}
              onRetry={actions.retry}
              onDismissError={actions.dismissError}
              onPickPrompt={actions.pickPrompt}
            />
          </main>
        </div>
      </div>

      <PromptDock
        composer={composer}
        buttonState={actions.buttonState}
        onGenerate={actions.generateFromComposer}
        onCancel={actions.cancel}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <p role="status" aria-live="polite" className="sr-only">
        {actions.announcement}
      </p>

      {/* Own boundaries: otherwise a lazy chunk suspends up to the route's loading.js and
          blanks the whole workspace while it downloads. */}
      <Suspense fallback={null}>
        {viewerIndex !== -1 && (
          <MediaLightbox
            items={viewerItems}
            index={viewerIndex}
            favorites={feed.favorites}
            upscaled={feed.upscaled}
            onIndexChange={(index) => setViewerItemId(viewerItems[index].id)}
            onClose={() => setViewerItemId(null)}
            onAction={actions.handleTileAction}
          />
        )}
      </Suspense>
      <Suspense fallback={null}>
        {settingsOpen && (
          <SettingsSheet composer={composer} onClose={() => setSettingsOpen(false)} />
        )}
      </Suspense>
      <Suspense fallback={null}>
        {historyOpen && (
          <HistoryDialog
            items={history.items}
            hasMore={history.hasMore}
            loading={history.status === 'loading'}
            failed={history.status === 'error'}
            onLoadMore={history.loadMore}
            onSelect={(batch) => {
              setHistoryOpen(false);
              actions.showFromHistory(batch);
            }}
            onClose={() => setHistoryOpen(false)}
          />
        )}
      </Suspense>
    </div>
  );
}
