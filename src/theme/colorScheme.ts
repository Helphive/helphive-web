import { createContext, useContext } from 'react';
import type { SchemePreference } from './scheme';
import type { Scheme } from './tokens';

export interface ColorSchemeContextValue {
    /** What the person chose: follow the device, or always light / dark. */
    preference: SchemePreference;
    /** The scheme on screen now. */
    scheme: Scheme;
    setPreference: (pref: SchemePreference) => void;
}

export const ColorSchemeContext = createContext<ColorSchemeContextValue | undefined>(undefined);

/** The colour scheme preference and the scheme on screen (provided by ThemeProvider). */
export function useColorScheme() {
    const context = useContext(ColorSchemeContext);
    if (!context) {
        throw new Error('useColorScheme must be used within a ThemeProvider');
    }
    return context;
}
