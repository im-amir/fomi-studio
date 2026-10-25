export const THEME_STORAGE_KEY = 'fomi-theme';
export const THEME_EVENT = 'fomi:themechange';

/**
 * Runs before first paint (inlined in the root layout) so a saved dark theme never
 * flashes light. Falls back to the OS preference.
 */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(!t&&matchMedia('(prefers-color-scheme: dark)').matches)t='dark';if(t==='dark')document.documentElement.dataset.theme='dark'}catch(e){}`;
