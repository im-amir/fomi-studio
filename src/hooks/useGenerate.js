'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { ApiError, generateBatch, isAbortError } from '@/lib/api';

/** @import { Batch, GenerateRequest } from '@/lib/types' */

/**
 * @typedef {object} PendingBatch  what the grid needs to draw placeholders instantly
 * @property {string} id
 * @property {GenerateRequest} request
 * @property {number} startedAt  epoch ms
 */

/**
 * @typedef {{ status: 'idle' }
 *   | { status: 'generating', pending: PendingBatch }
 *   | { status: 'error', error: ApiError, request: GenerateRequest }} GenerateState
 */

/**
 * @typedef {{ type: 'start', pending: PendingBatch }
 *   | { type: 'succeed', id: string }
 *   | { type: 'fail', id: string, error: ApiError }
 *   | { type: 'cancel' }
 *   | { type: 'dismiss' }} GenerateAction
 */

/**
 * Actions carry the pending id so a late response from a superseded request can't
 * overwrite the state of the newer one.
 * @param {GenerateState} state
 * @param {GenerateAction} action
 * @returns {GenerateState}
 */
function reducer(state, action) {
  switch (action.type) {
    case 'start':
      return { status: 'generating', pending: action.pending };
    case 'succeed':
      return state.status === 'generating' && state.pending.id === action.id
        ? { status: 'idle' }
        : state;
    case 'fail':
      return state.status === 'generating' && state.pending.id === action.id
        ? { status: 'error', error: action.error, request: state.pending.request }
        : state;
    case 'cancel':
    case 'dismiss':
      return { status: 'idle' };
  }
}

/**
 * Runs generations against the API: one in flight at a time (a new request aborts the
 * previous), cancel, retry with the exact same request, and abort on unmount.
 * `generate` resolves with the batch, or null if it was cancelled or failed — the caller
 * decides where successful batches live (feed, history…).
 */
export function useGenerate() {
  const [state, dispatch] = useReducer(reducer, { status: 'idle' });
  /** @type {React.RefObject<AbortController | null>} */
  const controllerRef = useRef(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const generate = useCallback(
    /**
     * @param {GenerateRequest} request
     * @returns {Promise<Batch | null>}
     */
    async (request) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      const id = crypto.randomUUID();
      dispatch({ type: 'start', pending: { id, request, startedAt: Date.now() } });

      try {
        const batch = await generateBatch(request, { signal: controller.signal });
        dispatch({ type: 'succeed', id });
        return batch;
      } catch (error) {
        if (isAbortError(error)) return null;
        const apiError =
          error instanceof ApiError
            ? error
            : new ApiError({ code: 'UNKNOWN_ERROR', message: 'Something went wrong.', status: 0 });
        dispatch({ type: 'fail', id, error: apiError });
        return null;
      } finally {
        if (controllerRef.current === controller) controllerRef.current = null;
      }
    },
    [],
  );

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    dispatch({ type: 'cancel' });
  }, []);

  const dismissError = useCallback(() => dispatch({ type: 'dismiss' }), []);

  return { state, generate, cancel, dismissError };
}
