'use client';

import { useCallback, useEffect, useEffectEvent, useRef } from 'react';

/**
 * Opens a native <dialog> as a modal while the component is mounted.
 *
 * The dialog owns closing: Escape and `close()` both go through the browser, which
 * restores focus to the opener and fires `close` → `onClose`. The `close` event is
 * dispatched asynchronously, so a close from our own cleanup can arrive after a
 * StrictMode re-mount has reopened the dialog — hence the `open` check.
 *
 * @param {() => void} onClose
 */
export function useModalDialog(onClose) {
  /** @type {React.RefObject<HTMLDialogElement | null>} */
  const dialogRef = useRef(null);
  const handleClose = useEffectEvent(() => {
    if (!dialogRef.current?.open) onClose();
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.addEventListener('close', handleClose);
    dialog.showModal();
    return () => {
      dialog.removeEventListener('close', handleClose);
      if (!dialog.open) return;
      dialog.close();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  const close = useCallback(() => dialogRef.current?.close(), []);

  return { dialogRef, close };
}
