'use client';

import { useState } from 'react';
import { GitBranch, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Segmented';
import { Select } from '@/components/ui/Select';
import { RECIPE_FIELDS } from '@/lib/studio/recipe';

/** @import { RecipeKey, Take } from '@/lib/studio/types' */
/** @import { BranchRequest } from './useBranching' */

const FIELD_OPTIONS = RECIPE_FIELDS.map(([value, label]) => ({ value, label }));
const PLACEMENTS = [
  { value: /** @type {const} */ ('new'), label: 'New branch' },
  { value: /** @type {const} */ ('continue'), label: 'This lane' },
];
export const BRANCH_INPUT_ID = 'branch-change';

/**
 * "What should change?" — the core move of the workspace. You change one ingredient of
 * the selected image's recipe; everything else (and the project Direction) carries over,
 * so each new take differs from its parent in exactly the way you asked.
 * @param {{
 *   source: Take,
 *   sourceImageId: string,
 *   sourceLabel: string,
 *   busy: boolean,
 *   onBranch: (request: BranchRequest) => void,
 * }} props
 */
export function BranchComposer({ source, sourceImageId, sourceLabel, busy, onBranch }) {
  const [field, setField] = useState(/** @type {RecipeKey} */ ('light'));
  const [value, setValue] = useState('');
  const [placement, setPlacement] = useState(/** @type {'new' | 'continue'} */ ('new'));
  const trimmed = value.trim();
  const unchanged = trimmed.toLowerCase() === source.recipe[field].toLowerCase();

  /** @param {React.FormEvent<HTMLFormElement>} event */
  const submit = (event) => {
    event.preventDefault();
    if (busy || !trimmed || unchanged) return;
    onBranch({ source, sourceImageId, changes: { [field]: trimmed }, placement });
    setValue('');
  };

  return (
    <form
      onSubmit={submit}
      aria-labelledby="branch-title"
      className="flex flex-col gap-3 rounded-panel bg-panel p-3"
    >
      <h3
        id="branch-title"
        className="flex items-center gap-1.5 text-sm font-semibold text-ink-900"
      >
        <GitBranch aria-hidden="true" className="size-4 text-accent-700" />
        Branch from {sourceLabel}
      </h3>

      <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2">
        <Select
          label="Ingredient to change"
          value={field}
          onChange={setField}
          options={FIELD_OPTIONS}
          placement="top"
        />
        <label htmlFor={BRANCH_INPUT_ID} className="sr-only">
          New {field}
        </label>
        <input
          id={BRANCH_INPUT_ID}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={`Now: ${source.recipe[field]}`}
          autoComplete="off"
          className="h-8 min-w-0 rounded-chip border border-line-strong bg-surface px-2.5 text-sm text-ink-900 focus-ring placeholder:text-ink-500"
        />
      </div>

      <Segmented
        label="Where the new take goes"
        value={placement}
        onChange={setPlacement}
        options={PLACEMENTS}
      />

      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          className="flex-1"
          disabled={!trimmed || unchanged || busy}
          loading={busy}
          icon={<GitBranch className="size-4" />}
        >
          Branch
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={busy}
          onClick={() => onBranch({ source, sourceImageId, changes: {}, placement: 'continue' })}
          icon={<RefreshCw className="size-4" />}
        >
          Re-roll
        </Button>
      </div>
    </form>
  );
}
