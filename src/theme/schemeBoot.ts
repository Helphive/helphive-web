// The scheme boot script, injected into <head> by vite.config.ts so the first paint already has the right
// scheme (no flash of light before React starts). No DOM types here: vite.config.ts imports this file.
import { palettes } from './tokens';

export const SCHEME_STORAGE_KEY = 'hh-color-scheme';
export const DARK_QUERY = '(prefers-color-scheme: dark)';

/** Reads the stored preference, resolves System, sets data-theme, color-scheme and theme-color. */
export const bootScript = `(function(){try{var p=null;try{p=localStorage.getItem(${JSON.stringify(
    SCHEME_STORAGE_KEY
)})}catch(e){}var s=p==='light'||p==='dark'?p:(window.matchMedia&&window.matchMedia(${JSON.stringify(
    DARK_QUERY
)}).matches?'dark':'light');var r=document.documentElement;r.setAttribute('data-theme',s);r.style.colorScheme=s;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',s==='dark'?${JSON.stringify(
    palettes.dark.canvas
)}:${JSON.stringify(palettes.light.canvas)});}catch(e){}})();`;
