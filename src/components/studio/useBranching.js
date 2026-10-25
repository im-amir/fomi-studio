'use client';

import { useCallback, useEffect, useRef } from 'react';
import { ApiError, generateBatch, isAbortError } from '@/lib/api';
import { DEFAULT_REQUEST } from '@/lib/constants';
import { truncateWords } from '@/lib/format';
import { RECIPE_FIELDS, compilePrompt } from '@/lib/studio/recipe';

/** @import { Branch, Direction, Recipe, RecipeKey, Take } from '@/lib/studio/types' */
/** @import { StudioAction, StudioState } from './useStudio' */

const RESULTS_PER_TAKE = 4;
const LANE_HUES = 5;
const BRANCH_NAME_MAX = 28;

/**
 * The lane colour used by the fewest branches, so a new lane stands apart from its
 * neighbours instead of cycling back to the first colour.
 * @param {Branch[]} branches
 */
function leastUsedHue(branches) {
  const counts = Array.from({ length: LANE_HUES }, (_, index) => ({
    hue: index + 1,
    uses: branches.filter((branch) => branch.hue === index + 1).length,
  }));
  return counts.reduce((best, candidate) => (candidate.uses < best.uses ? candidate : best)).hue;
}

/**
 * @typedef {object} BranchRequest
 * @property {Take} source          the take that holds the source image
 * @property {string} sourceImageId
 * @property {Partial<Recipe>} changes   empty = re-roll the same recipe
 * @property {'continue' | 'new'} placement
 */

/**
 * Turns "change this ingredient" into a new take: builds the recipe, compiles the prompt
 * with the project Direction (avoid-list becomes the negative prompt), draws the take in
 * place immediately and fills it when the results arrive. One branch at a time.
 * @param {{ state: StudioState, dispatch: React.Dispatch<StudioAction>, direction: Direction }} params
 */
export function useBranching({ state, dispatch, direction }) {
  /** @type {React.RefObject<AbortController | null>} */
  const controllerRef = useRef(null);
  useEffect(() => () => controllerRef.current?.abort(), []);

  const run = useCallback(
    /** @param {Take} take */ async (take) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      try {
        const batch = await generateBatch(
          {
            ...DEFAULT_REQUEST,
            prompt: take.prompt,
            count: RESULTS_PER_TAKE,
            aspectRatio: take.aspectRatio,
            model: take.model,
            advanced: { ...DEFAULT_REQUEST.advanced, negativePrompt: direction.avoid.join(', ') },
          },
          { signal: controller.signal },
        );
        dispatch({
          type: 'branchFinished',
          take: { ...take, createdAt: batch.createdAt, items: batch.items },
        });
      } catch (error) {
        if (isAbortError(error)) return;
        dispatch({
          type: 'branchFailed',
          error:
            error instanceof ApiError
              ? error
              : new ApiError({
                  code: 'UNKNOWN_ERROR',
                  message: 'Something went wrong.',
                  status: 0,
                }),
        });
      }
    },
    [dispatch, direction.avoid],
  );

  const branch = useCallback(
    /** @param {BranchRequest} request */ (request) => {
      const { source, sourceImageId, changes, placement } = request;
      const recipe = { ...source.recipe, ...changes };
      const changedKey = /** @type {RecipeKey | undefined} */ (Object.keys(changes)[0]);
      const label = RECIPE_FIELDS.find(([key]) => key === changedKey)?.[1];

      /** @type {Branch | null} */
      const newBranch =
        placement === 'new'
          ? {
              id: `branch-${crypto.randomUUID()}`,
              name: truncateWords(
                changedKey && label ? `${label}: ${recipe[changedKey]}` : 'Re-roll',
                BRANCH_NAME_MAX,
              ),
              hue: leastUsedHue(state.branches),
            }
          : null;

      /** @type {Take} */
      const take = {
        id: `take-${crypto.randomUUID()}`,
        branchId: newBranch?.id ?? source.branchId,
        parentTakeId: source.id,
        sourceImageId,
        recipe,
        prompt: compilePrompt(recipe, direction),
        model: source.model,
        aspectRatio: source.aspectRatio,
        createdAt: new Date().toISOString(),
        items: [],
      };

      dispatch({
        type: 'branchStarted',
        pending: { take, newBranch, error: null, startedAt: Date.now() },
      });
      run(take);
    },
    [dispatch, direction, run, state.branches],
  );

  const retry = useCallback(() => {
    if (!state.pending) return;
    dispatch({
      type: 'branchStarted',
      pending: { ...state.pending, error: null, startedAt: Date.now() },
    });
    run(state.pending.take);
  }, [dispatch, run, state.pending]);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    dispatch({ type: 'dismissPending' });
  }, [dispatch]);

  return { branch, retry, cancel, busy: state.pending !== null && state.pending.error === null };
}
