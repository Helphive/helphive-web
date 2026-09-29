import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { SnackbarContext, type SnackbarApi, type SnackbarSeverity } from './snackbarContext';

interface SnackbarState {
    key: number;
    message: string;
    severity: SnackbarSeverity;
}

export default function SnackbarProvider({ children }: { children: ReactNode }) {
    const [current, setCurrent] = useState<SnackbarState | null>(null);
    const [open, setOpen] = useState(false);

    const notify = useCallback((message: string, severity: SnackbarSeverity = 'info') => {
        setCurrent({ key: Date.now(), message, severity });
        setOpen(true);
    }, []);

    const api = useMemo<SnackbarApi>(
        () => ({
            notify,
            success: (message) => notify(message, 'success'),
            error: (message) => notify(message, 'error'),
        }),
        [notify]
    );

    return (
        <SnackbarContext.Provider value={api}>
            {children}
            <Snackbar
                key={current?.key}
                open={open}
                autoHideDuration={4000}
                onClose={(_, reason) => {
                    if (reason !== 'clickaway') setOpen(false);
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ mb: { xs: 8, md: 0 } }}
            >
                <Alert
                    severity={current?.severity ?? 'info'}
                    variant="filled"
                    onClose={() => setOpen(false)}
                    sx={{ width: '100%' }}
                >
                    {current?.message}
                </Alert>
            </Snackbar>
        </SnackbarContext.Provider>
    );
}
