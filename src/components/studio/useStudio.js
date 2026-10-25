'use client';

import { useMemo, useReducer } from 'react';

/** @import { Branch, StudioProject, Take } from '@/lib/studio/types' */
/** @import { ApiError } from '@/lib/api' */

export const COMPARE_LIMIT = 4;

/**
 * @typedef {object} PendingBranch  a take being generated, drawn in place right away
 * @property {Take} take              items empty until the results arrive
 * @property {Branch | null} newBranch
 * @property {ApiError | null} error
 * @property {number} startedAt      epoch ms, for the progress estimate
 */

/**
 * @typedef {object} StudioState
 * @property {Branch[]} branches
 * @property {Take[]} takes
 * @property {Set<string>} picks
 * @property {Set<string>} rejects
 * @property {string | null} selectedImageId
 * @property {string[]} compareIds
 * @property {PendingBranch | null} pending
 */

/**
 * @typedef {{ type: 'select', id: string | null }
 *   | { type: 'togglePick', id: string }
 *   | { type: 'toggleReject', id: string }
 *   | { type: 'toggleCompare', id: string }
 *   | { type: 'clearCompare' }
 *   | { type: 'branchStarted', pending: PendingBranch }
 *   | { type: 'branchFinished', take: Take }
 *   | { type: 'branchFailed', error: ApiError }
 *   | { type: 'dismissPending' }} StudioAction
 */

/** @param {Set<string>} set @param {string} id */
function toggled(set, id) {
  const next = new Set(set);
  if (!next.delete(id)) next.add(id);
  return next;
}

/**
 * @param {StudioState} state
 * @param {StudioAction} action
 * @returns {StudioState}
 */
function reducer(state, action) {
  switch (action.type) {
    case 'select':
      return { ...state, selectedImageId: action.id };
    case 'togglePick': {
      // Picking and rejecting are mutually exclusive decisions about one image.
      const rejects = new Set(state.rejects);
      rejects.delete(action.id);
      return { ...state, picks: toggled(state.picks, action.id), rejects };
    }
    case 'toggleReject': {
      const picks = new Set(state.picks);
      picks.delete(action.id);
      return { ...state, rejects: toggled(state.rejects, action.id), picks };
    }
    case 'toggleCompare': {
      if (state.compareIds.includes(action.id)) {
        return { ...state, compareIds: state.compareIds.filter((id) => id !== action.id) };
      }
      // Keep the most recent picks when the tray is full.
      return { ...state, compareIds: [...state.compareIds, action.id].slice(-COMPARE_LIMIT) };
    }
    case 'clearCompare':
      return { ...state, compareIds: [] };
    case 'branchStarted':
      return { ...state, pending: action.pending };
    case 'branchFinished': {
      if (!state.pending) return state;
      const { newBranch } = state.pending;
      return {
        ...state,
        branches: newBranch ? [...state.branches, newBranch] : state.branches,
        takes: [...state.takes, action.take],
        selectedImageId: action.take.items[0]?.id ?? state.selectedImageId,
        pending: null,
      };
    }
    case 'branchFailed':
      return state.pending
        ? { ...state, pending: { ...state.pending, error: action.error } }
        : state;
    case 'dismissPending':
      return { ...state, pending: null };
  }
}

/**
 * All Studio state in one reducer: the project tree, the decisions made on images, the
 * selection and any branch being generated. Lookups are derived, never stored.
 * @param {StudioProject} project
 */
export function useStudio(project) {
  const [state, dispatch] = useReducer(reducer, project, (initial) => ({
    branches: initial.branches,
    takes: initial.takes,
    picks: new Set(initial.picks),
    rejects: new Set(initial.rejects),
    selectedImageId: initial.takes.at(-1)?.items[0]?.id ?? null,
    compareIds: [],
    pending: null,
  }));

  // While a branch is generating, its take is part of the tree so the canvas can lay it
  // out (with placeholders) before the results exist.
  const takes = useMemo(
    () => (state.pending ? [...state.takes, state.pending.take] : state.takes),
    [state.takes, state.pending],
  );
  const branches = useMemo(
    () =>
      state.pending?.newBranch ? [...state.branches, state.pending.newBranch] : state.branches,
    [state.branches, state.pending],
  );

  /** @type {StudioProject} the project as currently shown */
  const view = useMemo(
    () => ({ ...project, branches, takes, picks: [...state.picks], rejects: [...state.rejects] }),
    [project, branches, takes, state.picks, state.rejects],
  );

  const imageIndex = useMemo(() => {
    /** @type {Map<string, { take: Take, index: number }>} */
    const index = new Map();
    for (const take of takes)
      take.items.forEach((item, i) => index.set(item.id, { take, index: i }));
    return index;
  }, [takes]);

  return { state, dispatch, view, imageIndex };
}
