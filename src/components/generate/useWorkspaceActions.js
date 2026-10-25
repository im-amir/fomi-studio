'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/Toaster';
import { useGenerate } from '@/hooks/useGenerate';
import { useHotkeys } from '@/hooks/useHotkeys';
import { DEFAULT_REQUEST } from '@/lib/constants';
import { downloadGeneration } from '@/lib/download';
import { focusVisiblePrompt } from './PromptTextarea';

/** @import { Batch, GenerateRequest, Generation } from '@/lib/types' */
/** @import { ComposerSettings } from '@/hooks/useComposerSettings' */
/** @import { TileAction } from '@/components/shared/MediaTile' */
/** @import { GenerateButtonState } from './GenerateButton' */

const DONE_FLASH_MS = 1200;
const MOCK_UPSCALE_MS = 1600;

/** @param {GenerateRequest} request */
function describeRun({ mode, count }) {
  const noun = mode === 'video' ? 'clip' : 'image';
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

/**
 * Every user action in the Part A workspace, kept out of the layout component.
 * Callbacks passed to memoised rows/tiles are stable, so typing in the prompt never
 * re-renders the results grid.
 * @param {{
 *   composer: ComposerSettings,
 *   feed: ReturnType<typeof import('@/hooks/useCanvasFeed').useCanvasFeed>,
 *   history: ReturnType<typeof import('@/hooks/useHistory').useHistory>,
 *   feedRef: React.RefObject<HTMLElement | null>,
 *   overlayOpen: boolean,
 * }} params
 */
export function useWorkspaceActions({ composer, feed, history, feedRef, overlayOpen }) {
  const toast = useToast();
  const { state: generation, generate, cancel: cancelGeneration, dismissError } = useGenerate();
  const [announcement, setAnnouncement] = useState('');
  const [justFinished, setJustFinished] = useState(false);
  /** @type {React.RefObject<Set<ReturnType<typeof setTimeout>>>} */
  const timers = useRef(new Set());

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const later = useCallback(
    /** @param {() => void} callback @param {number} ms */ (callback, ms) => {
      const timer = setTimeout(() => {
        timers.current.delete(timer);
        callback();
      }, ms);
      timers.current.add(timer);
    },
    [],
  );

  const { add: addToFeed, markUpscaled, toggleFavorite, show: showOnFeed } = feed;
  const { prepend: prependHistory } = history;
  const { load: loadComposer } = composer;

  const run = useCallback(
    /** @param {GenerateRequest} request */ async (request) => {
      // Desktop: the feed is its own scroller. Smaller screens scroll the page instead.
      const feedElement = feedRef.current;
      if (feedElement && feedElement.scrollHeight > feedElement.clientHeight) {
        feedElement.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        feedElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setJustFinished(false);
      setAnnouncement(`Generating ${describeRun(request)}…`);
      const batch = await generate(request);
      if (!batch) return;
      addToFeed(batch);
      prependHistory(batch);
      setAnnouncement(`${describeRun(request)} ready.`);
      setJustFinished(true);
      later(() => setJustFinished(false), DONE_FLASH_MS);
    },
    [generate, addToFeed, prependHistory, feedRef, later],
  );

  const { settings } = composer;
  const generateFromComposer = () => {
    if (!settings.prompt.trim()) return;
    run(settings);
  };

  const cancel = useCallback(() => {
    cancelGeneration();
    setAnnouncement('Generation cancelled.');
  }, [cancelGeneration]);

  const retry = useCallback(() => {
    if (generation.status === 'error') run(generation.request);
  }, [generation, run]);

  useHotkeys({ escape: cancel }, { enabled: generation.status === 'generating' && !overlayOpen });

  const handleTileAction = useCallback(
    /** @param {TileAction} action @param {Generation} item */ (action, item) => {
      switch (action) {
        case 'favorite':
          toggleFavorite(item.id);
          break;
        case 'download':
          toast('Preparing download…');
          downloadGeneration(item).catch(() =>
            toast('Download failed. Try again.', { tone: 'error' }),
          );
          break;
        case 'upscale':
          toast('Upscaling to 2×…');
          later(() => {
            markUpscaled(item.id);
            toast(`Upscaled to ${item.width * 2} × ${item.height * 2}`, { tone: 'success' });
          }, MOCK_UPSCALE_MS);
          break;
        case 'variations':
          run({
            ...DEFAULT_REQUEST,
            prompt: item.prompt,
            mode: item.type,
            model: item.model,
            aspectRatio: item.aspectRatio,
          });
          break;
      }
    },
    [toggleFavorite, toast, later, markUpscaled, run],
  );

  const copyPrompt = useCallback(
    /** @param {Batch} batch */ async (batch) => {
      try {
        await navigator.clipboard.writeText(batch.prompt);
        toast('Prompt copied', { tone: 'success' });
      } catch {
        toast('Couldn’t access the clipboard', { tone: 'error' });
      }
    },
    [toast],
  );

  const reuse = useCallback(
    /** @param {Batch} batch */ (batch) => {
      loadComposer({
        prompt: batch.prompt,
        mode: batch.mode,
        model: batch.model,
        aspectRatio: batch.aspectRatio,
        style: batch.style,
        advanced: batch.advanced,
      });
      focusVisiblePrompt();
      toast('Prompt and settings loaded');
    },
    [loadComposer, toast],
  );

  const pickPrompt = useCallback(
    /** @param {string} prompt */ (prompt) => {
      loadComposer({ prompt });
      focusVisiblePrompt();
    },
    [loadComposer],
  );

  /** @type {GenerateButtonState} */
  const buttonState =
    generation.status === 'generating'
      ? 'generating'
      : !settings.prompt.trim()
        ? 'empty'
        : justFinished
          ? 'done'
          : 'ready';

  return {
    generation,
    announcement: generation.status === 'error' ? generation.error.message : announcement,
    buttonState,
    generateFromComposer,
    cancel,
    retry,
    dismissError,
    handleTileAction,
    copyPrompt,
    reuse,
    pickPrompt,
    showFromHistory: showOnFeed,
  };
}
