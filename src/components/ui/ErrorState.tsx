import type { ReactNode } from 'react';
import { Box, Button, CircularProgress, Typography, type SxProps, type Theme } from '@mui/material';
import { color, hairline, radius } from '@/theme/tokens';
import { ErrorIcon, RefreshIcon } from './icons';

export interface ErrorStateProps {
    /** What failed ("Could not load your bookings"). */
    title: string;
    /** Why, or what to try. Pass the API message from getErrorMessage when there is one. */
    message?: ReactNode;
    /** Shows a "Try again" button. */
    onRetry?: () => void;
    retryLabel?: string;
    /** A retry is in flight: the button shows a spinner and is disabled. */
    retrying?: boolean;
    /** Extra action next to retry (e.g. a link back). */
    action?: ReactNode;
    /** Drop the frame inside a Panel. */
    bare?: boolean;
    sx?: SxProps<Theme>;
}

/** A failed load: says what went wrong and offers the way forward. Uses role="alert". */
export default function ErrorState({
    title,
    message,
    onRetry,
    retryLabel = 'Try again',
    retrying = false,
    action,
    bare,
    sx,
}: ErrorStateProps) {
    return (
        <Box
            role="alert"
            sx={[
                {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    py: { xs: 5, sm: 6 },
                    px: 2,
                },
                bare
                    ? {}
                    : {
                          bgcolor: color.surface,
                          border: hairline,
                          borderRadius: `${radius.md}px`,
                      },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            <Box
                aria-hidden="true"
                sx={{
                    width: 44,
                    height: 44,
                    borderRadius: `${radius.sm}px`,
                    bgcolor: color.red50,
                    color: color.red700,
                    display: 'grid',
                    placeItems: 'center',
                    mb: 2,
                    '& svg': { fontSize: 24 },
                }}
            >
                <ErrorIcon weight="duotone" />
            </Box>
            <Typography variant="h6" component="p">
                {title}
            </Typography>
            {message && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5, maxWidth: '50ch' }}
                >
                    {message}
                </Typography>
            )}
            {(onRetry || action) && (
                <Box
                    sx={{
                        display: 'flex',
                        gap: 1,
                        mt: 2.5,
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                    }}
                >
                    {onRetry && (
                        <Button
                            variant="outlined"
                            startIcon={
                                retrying ? (
                                    <CircularProgress size={16} color="inherit" />
                                ) : (
                                    <RefreshIcon />
                                )
                            }
                            onClick={onRetry}
                            disabled={retrying}
                            aria-busy={retrying || undefined}
                        >
                            {retrying ? 'Trying again' : retryLabel}
                        </Button>
                    )}
                    {action}
                </Box>
            )}
        </Box>
    );
}
