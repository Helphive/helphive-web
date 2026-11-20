// Colour scheme preference: System / Light / Dark, stored on this device.
// The same logic runs twice: as a tiny inline script in index.html before first paint (schemeBoot.ts)
// and here, in ThemeContext, once React is up.
import { palettes, type Scheme } from './tokens';
import { DARK_QUERY, SCHEME_STORAGE_KEY } from './schemeBoot';

export { DARK_QUERY, SCHEME_STORAGE_KEY };

export type SchemePreference = 'system' | 'light' | 'dark';

export const isPreference = (v: unknown): v is SchemePreference =>
    v === 'system' || v === 'light' || v === 'dark';

export function readPreference(): SchemePreference {
    try {
        const v = window.localStorage.getItem(SCHEME_STORAGE_KEY);
        return isPreference(v) ? v : 'system';
    } catch {
        return 'system';
    }
}

export function writePreference(pref: SchemePreference) {
    try {
        if (pref === 'system') window.localStorage.removeItem(SCHEME_STORAGE_KEY);
        else window.localStorage.setItem(SCHEME_STORAGE_KEY, pref);
    } catch {
        // Storage blocked (private mode): the choice lasts for this page only.
    }
}

export const systemScheme = (): Scheme =>
    typeof window !== 'undefined' && window.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light';

export const resolveScheme = (pref: SchemePreference): Scheme =>
    pref === 'system' ? systemScheme() : pref;

/** Sets `data-theme` and `color-scheme` on <html> and the browser chrome colour. */
export function applyScheme(scheme: Scheme) {
    const root = document.documentElement;
    if (root.dataset.theme !== scheme) root.dataset.theme = scheme;
    root.style.colorScheme = scheme;
    document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', palettes[scheme].canvas);
}
