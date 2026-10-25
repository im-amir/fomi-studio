'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { THEME_EVENT, THEME_STORAGE_KEY } from '@/lib/theme';

/** @param {() => void} onChange */
function subscribe(onChange) {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
}

const getTheme = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'light');
  const next = theme === 'dark' ? 'light' : 'dark';

  const toggle = () => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private mode); the theme still applies for this visit.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <IconButton label={`Switch to ${next} theme`} size="sm" tooltipSide="bottom" onClick={toggle}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </IconButton>
  );
}
