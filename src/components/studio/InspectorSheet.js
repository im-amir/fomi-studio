'use client';

import { X } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { useModalDialog } from '@/hooks/useModalDialog';

/**
 * The inspector as a bottom sheet for phones and tablets. Same component inside, so the
 * two layouts can't drift apart.
 * @param {{ children: React.ReactNode, onClose: () => void }} props
 */
export default function InspectorSheet({ children, onClose }) {
  const { dialogRef, close } = useModalDialog(onClose);
  return (
    <dialog
      ref={dialogRef}
      aria-label="Image details"
      onClick={(event) => event.target === event.currentTarget && close()}
      className="mx-auto mt-auto mb-0 max-h-[90dvh] w-full max-w-xl animate-sheet-up overflow-y-auto overscroll-contain rounded-t-panel bg-canvas p-0 text-ink-900 shadow-lg backdrop:bg-scrim"
    >
      <div className="sticky top-0 z-10 flex justify-end bg-canvas/95 px-2 pt-2 backdrop-blur-sm">
        <IconButton label="Close details" onClick={close}>
          <X />
        </IconButton>
      </div>
      <div className="px-3 pb-[max(env(safe-area-inset-bottom),1rem)]">{children}</div>
    </dialog>
  );
}
