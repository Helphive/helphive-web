import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Button } from '@mui/material';
import ErrorState from './ErrorState';

interface ErrorBoundaryProps {
    children: ReactNode;
    /** When this value changes (e.g. the pathname) a caught error is cleared. */
    resetKey?: unknown;
    /** Custom fallback; receives a reset callback. */
    fallback?: (reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
    error: Error | null;
}

/** Catches render errors below it and shows an ErrorState instead of a blank screen. */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('Unhandled UI error', error, info.componentStack);
    }

    componentDidUpdate(prev: ErrorBoundaryProps) {
        if (this.state.error && prev.resetKey !== this.props.resetKey) {
            this.setState({ error: null });
        }
    }

    reset = () => this.setState({ error: null });

    render() {
        if (!this.state.error) return this.props.children;
        if (this.props.fallback) return this.props.fallback(this.reset);
        // A failed lazy chunk (after a deploy) needs a full reload, not just a re-render.
        const chunkFailed = /dynamically imported module|Loading chunk/i.test(
            this.state.error.message
        );
        return (
            <Box sx={{ maxWidth: 560, mx: 'auto', my: { xs: 3, sm: 6 }, px: 2 }}>
                <ErrorState
                    title={
                        chunkFailed
                            ? 'A newer version is available'
                            : 'This page ran into a problem'
                    }
                    message={
                        chunkFailed
                            ? 'Reload to get the latest version of HelpHive.'
                            : 'Try again. If it keeps happening, reload the page.'
                    }
                    onRetry={chunkFailed ? undefined : this.reset}
                    action={
                        <Button variant="contained" onClick={() => window.location.reload()}>
                            Reload page
                        </Button>
                    }
                />
            </Box>
        );
    }
}
