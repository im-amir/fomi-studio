'use client';

import Image from 'next/image';
import { Columns2, Download, Heart, Lock, ThumbsDown } from 'lucide-react';
import { Kbd } from '@/components/ui/Kbd';
import { MetadataList } from '@/components/shared/MetadataList';
import { getModel } from '@/data/models';
import { cn } from '@/lib/format';
import { RECIPE_FIELDS, diffRecipe } from '@/lib/studio/recipe';

/** @import { Branch, Direction, Take } from '@/lib/studio/types' */
/** @import { Generation } from '@/lib/types' */

const SHORTCUT_HINTS = [
  ['P', 'pick'],
  ['X', 'reject'],
  ['C', 'compare'],
  ['↵', 'view'],
  ['←↑↓→', 'move'],
];

/**
 * @param {{ label: string, shortcut: string, icon: React.ReactNode, pressed?: boolean, onClick: () => void }} props
 */
function DecisionButton({ label, shortcut, icon, pressed, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-keyshortcuts={shortcut}
      onClick={onClick}
      className={cn(
        'flex h-10 items-center justify-center gap-1.5 rounded-control border text-sm font-medium focus-ring transition-[background-color,border-color,color,scale] duration-fast active:scale-[0.97] [&_svg]:size-4',
        pressed
          ? 'border-accent-600 bg-accent-100 text-ink-900'
          : 'border-line bg-surface text-ink-900 hover:border-line-strong',
      )}
    >
      {icon}
      {label}
    </button>
  );
}

/**
 * Everything about the selected image: a large preview, the decision (pick / reject /
 * compare), the recipe with what changed since the parent take, what the project
 * Direction added, and the exact prompt sent. Branching lives at the bottom.
 * @param {{
 *   item: Generation,
 *   take: Take,
 *   takeLabel: string,
 *   parent: Take | undefined,
 *   branch: Branch | undefined,
 *   direction: Direction,
 *   picked: boolean,
 *   rejected: boolean,
 *   comparing: boolean,
 *   onTogglePick: () => void,
 *   onToggleReject: () => void,
 *   onToggleCompare: () => void,
 *   onOpen: () => void,
 *   onDownload: () => void,
 *   children?: React.ReactNode,
 *   className?: string,
 * }} props
 */
export function Inspector({
  item,
  take,
  takeLabel,
  parent,
  branch,
  direction,
  picked,
  rejected,
  comparing,
  onTogglePick,
  onToggleReject,
  onToggleCompare,
  onOpen,
  onDownload,
  children,
  className,
}) {
  const changed = new Map(
    diffRecipe(parent?.recipe ?? null, take.recipe).map((change) => [change.key, change]),
  );
  const position = take.items.indexOf(item) + 1;

  return (
    <aside
      aria-label="Inspector"
      className={cn(
        'flex flex-col gap-4 rounded-panel border border-line bg-surface p-4',
        className,
      )}
    >
      <header className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-ink-900">
          {takeLabel}{' '}
          <span className="font-normal text-ink-500">
            · {position} of {take.items.length}
          </span>
        </h2>
        {branch && (
          <span className="inline-flex min-w-0 items-center gap-1.5 text-sm text-ink-600">
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: `var(--color-lane-${branch.hue})` }}
            />
            <span className="truncate">{branch.name}</span>
          </span>
        )}
      </header>

      <button
        type="button"
        onClick={onOpen}
        aria-label={`View full size: ${item.alt}`}
        aria-keyshortcuts="Enter"
        className="relative aspect-[4/5] max-h-[42dvh] w-full shrink-0 cursor-zoom-in overflow-hidden rounded-media bg-panel-strong focus-ring"
      >
        <Image
          key={item.id}
          src={item.src}
          alt=""
          fill
          sizes="(min-width: 1024px) 22rem, 90vw"
          placeholder={item.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={item.blurDataURL}
          className={cn('animate-fade-in object-cover', rejected && 'grayscale')}
        />
      </button>

      <div className="grid grid-cols-3 gap-2">
        <DecisionButton
          label={picked ? 'Picked' : 'Pick'}
          shortcut="P"
          pressed={picked}
          onClick={onTogglePick}
          icon={<Heart className={cn(picked && 'fill-accent-600 text-accent-600')} />}
        />
        <DecisionButton
          label="Reject"
          shortcut="X"
          pressed={rejected}
          onClick={onToggleReject}
          icon={<ThumbsDown />}
        />
        <DecisionButton
          label="Compare"
          shortcut="C"
          pressed={comparing}
          onClick={onToggleCompare}
          icon={<Columns2 />}
        />
      </div>
      <p className="-mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500 max-lg:hidden">
        {SHORTCUT_HINTS.map(([key, action]) => (
          <span key={action} className="inline-flex items-center gap-1">
            <Kbd>{key}</Kbd>
            {action}
          </span>
        ))}
      </p>

      <section aria-labelledby="recipe-title">
        <h3
          id="recipe-title"
          className="mb-2 text-xs font-semibold tracking-wide text-ink-500 uppercase"
        >
          Recipe
        </h3>
        <dl className="flex flex-col gap-2">
          {RECIPE_FIELDS.map(([key, label]) => {
            const change = changed.get(key);
            return (
              <div key={key} className="grid grid-cols-[4.5rem_1fr] gap-2 text-sm">
                <dt className="flex items-center gap-1.5 text-ink-500">
                  {change && (
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-accent-600" />
                  )}
                  {label}
                </dt>
                <dd className="text-ink-900">
                  {take.recipe[key]}
                  {change && (
                    <span className="block text-xs text-ink-500">
                      <span className="sr-only">Changed, </span>was {change.from}
                    </span>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </section>

      <section aria-labelledby="inherited-title">
        <h3
          id="inherited-title"
          className="mb-2 text-xs font-semibold tracking-wide text-ink-500 uppercase"
        >
          From Direction
        </h3>
        <ul className="flex flex-col gap-1.5 text-sm text-ink-600">
          {direction.locked.map((lock) => (
            <li key={lock.label} className="flex items-start gap-2">
              <Lock aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-ink-500" />
              {lock.value}
            </li>
          ))}
        </ul>
      </section>

      <MetadataList
        entries={[
          ['Model', getModel(take.model)?.name ?? take.model],
          [
            'Seed',
            <span key="seed" className="font-mono">
              {item.seed}
            </span>,
          ],
          ['Size', `${item.width} × ${item.height}`],
        ]}
      />

      <details className="group text-sm">
        <summary className="cursor-pointer rounded-sm font-medium text-ink-600 focus-ring marker:text-ink-500 hover:text-ink-900">
          Prompt sent to the model
        </summary>
        <p className="mt-2 rounded-control bg-panel p-3 text-ink-600">{take.prompt}</p>
      </details>

      <button
        type="button"
        onClick={onDownload}
        className="inline-flex items-center gap-1.5 self-start rounded-sm text-sm font-medium text-ink-600 focus-ring hover:text-ink-900 [&_svg]:size-4"
      >
        <Download aria-hidden="true" />
        Download full size
      </button>

      {children}
    </aside>
  );
}
