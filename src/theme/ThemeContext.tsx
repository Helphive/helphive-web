import { useCallback, useEffect, useMemo, useState, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { darkTheme, lightTheme } from './index';
import {
    DARK_QUERY,
    SCHEME_STORAGE_KEY,
    applyScheme,
    isPreference,
    readPreference,
    resolveScheme,
    systemScheme,
    writePreference,
    type SchemePreference,
} from './scheme';
import type { Scheme } from './tokens';
import { ColorSchemeContext } from './colorScheme';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [preference, setPreferenceState] = useState<SchemePreference>(readPreference);
    const [system, setSystem] = useState<Scheme>(systemScheme);
    const scheme: Scheme = preference === 'system' ? system : preference;

    // Follow the device live while on System.
    useEffect(() => {
        const mq = window.matchMedia?.(DARK_QUERY);
        if (!mq) return;
        const onChange = () => setSystem(mq.matches ? 'dark' : 'light');
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    // Keep other open tabs in step.
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key !== SCHEME_STORAGE_KEY && e.key !== null) return;
            setPreferenceState(isPreference(e.newValue) ? e.newValue : readPreference());
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    useEffect(() => applyScheme(scheme), [scheme]);

    const setPreference = useCallback((pref: SchemePreference) => {
        writePreference(pref);
        // Apply at once (before React re-renders) so CSS-variable styles and MUI switch together.
        applyScheme(resolveScheme(pref));
        setPreferenceState(pref);
    }, []);

    const value = useMemo(
        () => ({ preference, scheme, setPreference }),
        [preference, scheme, setPreference]
    );

    return (
        <ColorSchemeContext.Provider value={value}>
            <MuiThemeProvider theme={scheme === 'dark' ? darkTheme : lightTheme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ColorSchemeContext.Provider>
    );
}
