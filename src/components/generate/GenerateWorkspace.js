'use client';

import {
  Suspense,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import { PrimaryNav } from '@/components/shared/PrimaryNav';
import { TopBar } from '@/components/shared/TopBar';
import { ToastProvider } from '@/components/ui/Toaster';
import { useCanvasFeed } from '@/hooks/useCanvasFeed';
import { useComposerSettings } from '@/hooks/useComposerSettings';
import { useHistory } from '@/hooks/useHistory';
import { useHotkeys } from '@/hooks/useHotkeys';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { BatchFeed } from './BatchFeed';
import { ControlPanel } from './ControlPanel';
import { HistoryStrip } from './HistoryStrip';
import { PromptComposer } from './PromptComposer';
import { PromptDock, settingsSummary } from './PromptDock';
import { SlidersHorizontal } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { useWorkspaceActions } from './useWorkspaceActions';

/** @import { ExamplePrompt, HistoryPage } from '@/lib/types' */

const loadLightbox = () => import('@/components/shared/MediaLightbox');
const MediaLightbox = dynamic(loadLightbox);
const HistoryDialog = dynamic(() => import('./HistoryDialog'));
const SettingsSheet = dynamic(() => import('./SettingsSheet'));
const IdeasDialog = dynamic(() => import('./IdeasDialog'));

/**
 * Part A: the generation workspace from the FOMI mockup.
 * Desktop is an app shell — top bar and history strip stay put, the settings panel stays
 * in reach, and only the results scroll (under the strip, as in the mockup).
 * @param {{ initialHistory: HistoryPage, examples: ExamplePrompt[] }} props
 */
export function GenerateWorkspace(props) {
  return (
    <ToastProvider>
      <Workspace {...props} />
    </ToastProvider>
  );
}

/** @param {{ initialHistory: HistoryPage, examples: ExamplePrompt[] }} props */
function Workspace({ initialHistory, examples }) {
  const composer = useComposerSettings();
  const history = useHistory(initialHistory);
  // The main area is for this session's work; past runs live in the history strip
  // and open here when picked, so nothing on screen is shown twice.
  const feed = useCanvasFeed([]);
  const [viewerItemId, setViewerItemId] = useState(/** @type {string | null} */ (null));
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [ideasOpen, setIdeasOpen] = useState(false);
  // Desktop only: fold the settings panel to a rail so the results get the width.
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  // After the prompt has moved once (centre ↔ panel), each new mount takes focus so you
  // can keep typing; the first page load doesn't steal focus.
  const [composerMoved, setComposerMoved] = useState(false);
  const isPhone = useMediaQuery('(max-width: 767px)');
  // Moving focus on a touch screen pops the keyboard over the results, so only follow the
  // prompt with focus when there's a real pointer (and likely a keyboard).
  const finePointer = useMediaQuery('(pointer: fine)', true);
  /** @type {React.RefObject<HTMLElement | null>} */
  const feedRef = useRef(null);

  const actions = useWorkspaceActions({
    composer,
    feed,
    history,
    feedRef,
    overlayOpen: viewerItemId !== null || historyOpen || settingsOpen || ideasOpen,
    showComposer: () => setPanelCollapsed(false),
    onComposerMove: () => setComposerMoved(true),
  });

  useHotkeys(
    { 'mod+\\': () => setPanelCollapsed((collapsed) => !collapsed) },
    { enabled: viewerItemId === null && !historyOpen && !settingsOpen && !ideasOpen },
  );

  // Empty canvas: the prompt is the hero, so it sits in the centre. Once there's work on the
  // canvas it moves to the panel (phone: the dock) and the results take the centre.
  // Exactly one composer is mounted at a time, which is what lets it morph between spots.
  const composerInCentre = feed.batches.length === 0 && actions.generation.status === 'idle';
  const followFocus = composerMoved && finePointer;

  const { remove: removeBatch } = feed;
  const batchCount = feed.batches.length;
  const hideBatch = useCallback(
    /** @param {string} id */ (id) => {
      // Hiding the last batch sends the prompt back to the centre; animate that move.
      startTransition(() => {
        if (batchCount === 1) setComposerMoved(true);
        removeBatch(id);
      });
    },
    [batchCount, removeBatch],
  );

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

        <div
          className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-6 lg:mt-0 lg:h-full lg:grid-cols-[var(--panel-width)_minmax(0,1fr)] lg:gap-7 lg:transition-[grid-template-columns] lg:duration-slow"
          style={
            /** @type {React.CSSProperties} */ ({
              '--panel-width': panelCollapsed ? '3.5rem' : '18.75rem',
            })
          }
        >
          <ControlPanel
            composer={composer}
            buttonState={actions.buttonState}
            onGenerate={actions.generateFromComposer}
            onCancel={actions.cancel}
            onOpenIdeas={() => setIdeasOpen(true)}
            collapsed={panelCollapsed}
            showComposer={!composerInCentre && !isPhone}
            autoFocusPrompt={followFocus}
            onCollapsedChange={setPanelCollapsed}
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
              generation={actions.generation}
              highlightedId={feed.highlightedId}
              favorites={feed.favorites}
              upscaled={feed.upscaled}
              onOpen={openViewer}
              onAction={actions.handleTileAction}
              onCopyPrompt={actions.copyPrompt}
              onReuse={actions.reuse}
              onHide={hideBatch}
              onRetry={actions.retry}
              onDismissError={actions.dismissError}
              onPickPrompt={actions.pickPrompt}
              examples={examples}
              emptyComposer={
                composerInCentre && (
                  <PromptComposer
                    id="prompt"
                    value={composer.settings.prompt}
                    onChange={composer.setPrompt}
                    buttonState={actions.buttonState}
                    onGenerate={actions.generateFromComposer}
                    onCancel={actions.cancel}
                    autoFocus={followFocus}
                    footerStart={
                      // Desktop keeps the settings panel beside the prompt; smaller screens
                      // hide it while the prompt is centred and open the sheet instead.
                      <IconButton
                        label={`Settings: ${settingsSummary(composer.settings)}`}
                        size="sm"
                        onClick={() => setSettingsOpen(true)}
                        className="lg:hidden"
                      >
                        <SlidersHorizontal />
                      </IconButton>
                    }
                  />
                )
              }
            />
          </main>
        </div>
      </div>

      {isPhone && !composerInCentre && (
        <PromptDock
          composer={composer}
          buttonState={actions.buttonState}
          onGenerate={actions.generateFromComposer}
          onCancel={actions.cancel}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenIdeas={() => setIdeasOpen(true)}
        />
      )}

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
        {ideasOpen && (
          <IdeasDialog
            examples={examples}
            onPick={actions.pickPrompt}
            onClose={() => setIdeasOpen(false)}
          />
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
