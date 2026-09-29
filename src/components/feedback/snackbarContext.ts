import { createContext, useContext } from 'react';

export type SnackbarSeverity = 'success' | 'error' | 'info' | 'warning';

export interface SnackbarApi {
    notify: (message: string, severity?: SnackbarSeverity) => void;
    success: (message: string) => void;
    error: (message: string) => void;
}

export const SnackbarContext = createContext<SnackbarApi | null>(null);

export function useSnackbar(): SnackbarApi {
    const ctx = useContext(SnackbarContext);
    if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider');
    return ctx;
}
