'use client';

import { Image as ImageIcon, PanelLeftClose, PanelLeftOpen, Video } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { Segmented } from '@/components/ui/Segmented';
import { MODES, PROMPT_MIN_WORDS } from '@/lib/constants';
import { cn, countWords } from '@/lib/format';
import { GenerateButton } from './GenerateButton';
import { GenerationSettings } from './GenerationSettings';
import { PromptComposer } from './PromptComposer';

/** @import { ComposerSettings } from '@/hooks/useComposerSettings' */
/** @import { GenerateButtonState } from './GenerateButton' */

const MODE_ICONS = {
  image: <ImageIcon aria-hidden="true" className="size-3.5" />,
  video: <Video aria-hidden="true" className="size-3.5" />,
};
export const MODE_OPTIONS = MODES.map((mode) => ({ ...mode, icon: MODE_ICONS[mode.value] }));

/**
 * The composer as a panel: one column beside the results on desktop, two columns
 * (write | tune) above them on tablets. Phones use the docked composer instead.
 *
 * On desktop it can collapse to a slim rail (Show settings + Generate) so the results
 * get the width; the full panel stays for tablets either way. While the canvas is empty
 * on desktop, the prompt lives in the centre instead (`showComposer` false).
 * @param {{
 *   composer: ComposerSettings,
 *   buttonState: GenerateButtonState,
 *   onGenerate: () => void,
 *   onCancel: () => void,
 *   collapsed: boolean,
 *   onCollapsedChange: (collapsed: boolean) => void,
 *   showComposer: boolean,
 *   autoFocusPrompt: boolean,
 *   className?: string,
 * }} props
 */
export function ControlPanel({
  composer,
  buttonState,
  onGenerate,
  onCancel,
  collapsed,
  onCollapsedChange,
  showComposer,
  autoFocusPrompt,
  className,
}) {
  const { settings, setMode, setPrompt } = composer;

  return (
    <>
      <aside
        aria-label="Generation settings"
        className={cn(
          'flex flex-col gap-4 rounded-panel bg-panel p-4 max-md:hidden md:max-lg:grid md:max-lg:grid-cols-2 md:max-lg:items-start md:max-lg:gap-6 md:max-lg:p-5',
          collapsed && 'lg:hidden',
          className,
        )}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Segmented
              label="Output type"
              value={settings.mode}
              onChange={setMode}
              options={MODE_OPTIONS}
              className="flex-1"
            />
            <IconButton
              label="Hide settings"
              size="sm"
              aria-expanded="true"
              aria-keyshortcuts="Control+Backslash Meta+Backslash"
              onClick={() => onCollapsedChange(true)}
              className="max-lg:hidden"
            >
              <PanelLeftClose />
            </IconButton>
          </div>
          {showComposer && (
            <PromptComposer
              id="prompt"
              value={settings.prompt}
              onChange={setPrompt}
              buttonState={buttonState}
              onGenerate={onGenerate}
              onCancel={onCancel}
              autoFocus={autoFocusPrompt}
            />
          )}
        </div>
        <GenerationSettings composer={composer} />
      </aside>

      {collapsed && (
        <aside
          aria-label="Generation settings (collapsed)"
          className={cn(
            'hidden animate-fade-in flex-col items-center gap-3 rounded-panel bg-panel py-3 lg:flex',
            className,
          )}
        >
          <IconButton
            label="Show settings"
            aria-expanded="false"
            aria-keyshortcuts="Control+Backslash Meta+Backslash"
            onClick={() => onCollapsedChange(false)}
          >
            <PanelLeftOpen />
          </IconButton>
          <GenerateButton
            compact
            hintId="generate-hint-rail"
            state={buttonState}
            wordsNeeded={Math.max(0, PROMPT_MIN_WORDS - countWords(settings.prompt))}
            onGenerate={onGenerate}
            onCancel={onCancel}
          />
        </aside>
      )}
    </>
  );
}
