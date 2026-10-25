'use client';

import { useMemo, useReducer } from 'react';
import { MODELS } from '@/data/models';
import { DEFAULT_REQUEST, IMAGE_COUNTS, VIDEO_COUNTS } from '@/lib/constants';

/** @import { AdvancedSettings, AspectRatioId, GenerateRequest, Mode } from '@/lib/types' */

/**
 * @typedef {{ type: 'prompt', value: string }
 *   | { type: 'mode', value: Mode }
 *   | { type: 'count', value: number }
 *   | { type: 'aspectRatio', value: AspectRatioId }
 *   | { type: 'model', value: string }
 *   | { type: 'toggleStyle', value: string }
 *   | { type: 'advanced', value: Partial<AdvancedSettings> }
 *   | { type: 'load', value: Partial<GenerateRequest> }} ComposerAction
 */

/**
 * Keeps settings valid for the current mode, e.g. video has no 8-up and not every
 * model renders video. Fixing it here means the UI never shows an impossible combo.
 * @param {GenerateRequest} state
 * @returns {GenerateRequest}
 */
function reconcile(state) {
  const counts = state.mode === 'video' ? VIDEO_COUNTS : IMAGE_COUNTS;
  const count = counts.includes(state.count) ? state.count : counts[counts.length - 1];
  const modelSupportsMode = MODELS.some(
    (model) => model.id === state.model && model.modes.includes(state.mode),
  );
  const model = modelSupportsMode
    ? state.model
    : (MODELS.find((candidate) => candidate.modes.includes(state.mode))?.id ?? state.model);
  return count === state.count && model === state.model ? state : { ...state, count, model };
}

/**
 * @param {GenerateRequest} state
 * @param {ComposerAction} action
 * @returns {GenerateRequest}
 */
function reducer(state, action) {
  switch (action.type) {
    case 'prompt':
      return { ...state, prompt: action.value };
    case 'mode':
      return reconcile({ ...state, mode: action.value });
    case 'count':
      return { ...state, count: action.value };
    case 'aspectRatio':
      return { ...state, aspectRatio: action.value };
    case 'model':
      return reconcile({ ...state, model: action.value });
    case 'toggleStyle':
      return {
        ...state,
        styles: state.styles.includes(action.value)
          ? state.styles.filter((id) => id !== action.value)
          : [...state.styles, action.value],
      };
    case 'advanced':
      return { ...state, advanced: { ...state.advanced, ...action.value } };
    case 'load':
      return reconcile({
        ...state,
        ...action.value,
        advanced: { ...state.advanced, ...action.value.advanced },
      });
  }
}

/**
 * Everything the user has dialled in for the next generation.
 * Setters are stable, so memoised children don't re-render when settings change.
 * @param {GenerateRequest} [initial]
 */
export function useComposerSettings(initial = DEFAULT_REQUEST) {
  const [settings, dispatch] = useReducer(reducer, initial);

  const actions = useMemo(
    () => ({
      /** @param {string} value */
      setPrompt: (value) => dispatch({ type: 'prompt', value }),
      /** @param {Mode} value */
      setMode: (value) => dispatch({ type: 'mode', value }),
      /** @param {number} value */
      setCount: (value) => dispatch({ type: 'count', value }),
      /** @param {AspectRatioId} value */
      setAspectRatio: (value) => dispatch({ type: 'aspectRatio', value }),
      /** @param {string} value */
      setModel: (value) => dispatch({ type: 'model', value }),
      /** @param {string} value */
      toggleStyle: (value) => dispatch({ type: 'toggleStyle', value }),
      /** @param {Partial<AdvancedSettings>} value */
      setAdvanced: (value) => dispatch({ type: 'advanced', value }),
      /** @param {Partial<GenerateRequest>} value */
      load: (value) => dispatch({ type: 'load', value }),
    }),
    [],
  );

  return { settings, ...actions };
}

/** @typedef {ReturnType<typeof useComposerSettings>} ComposerSettings */
