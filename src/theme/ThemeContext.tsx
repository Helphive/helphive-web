import { createContext, useContext, useMemo, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { appTheme } from './index';

type ThemeMode = 'light';

interface ThemeContextType {
    mode: ThemeMode;
    toggleTheme: () => void;
    setMode: (_mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const value = useMemo(
        () => ({
            mode: 'light' as const,
            toggleTheme: () => undefined,
            setMode: () => undefined,
        }),
        []
    );

    return (
        <ThemeContext.Provider value={value}>
            <MuiThemeProvider theme={appTheme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
