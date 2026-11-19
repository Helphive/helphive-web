import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Link, Typography } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';
import { color, radius } from '@/theme/tokens';

export function AuthHeading({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h3" component="h1">
                {title}
            </Typography>
            {subtitle && (
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {subtitle}
                </Typography>
            )}
        </Box>
    );
}

export function AuthError({ message }: { message: string | null }) {
    if (!message) return null;
    return (
        <Alert severity="error" role="alert" sx={{ mb: 2.5 }}>
            {message}
        </Alert>
    );
}

/** Full-width primary action that shows a spinner and disables itself while busy. */
export function SubmitButton({
    busy,
    children,
    busyLabel,
}: {
    busy: boolean;
    children: ReactNode;
    busyLabel: string;
}) {
    return (
        <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={busy}
            startIcon={busy ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
            {busy ? busyLabel : children}
        </Button>
    );
}

export function AuthLinks({ children }: { children: ReactNode }) {
    return <Box sx={{ mt: 3, display: 'grid', gap: 1.5, textAlign: 'center' }}>{children}</Box>;
}

export function AuthLinkLine({
    text,
    to,
    linkText,
}: {
    text: string;
    to: string;
    linkText: string;
}) {
    return (
        <Typography variant="body2" color="text.secondary">
            {text}{' '}
            <Link component={RouterLink} to={to} sx={{ color: color.coral700 }}>
                {linkText}
            </Link>
        </Typography>
    );
}

/** Confirmation screen after a successful request. */
export function AuthSuccess({
    title,
    children,
    actions,
}: {
    title: string;
    children: ReactNode;
    actions: ReactNode;
}) {
    return (
        <Box role="status">
            <Box
                aria-hidden="true"
                sx={{
                    width: 48,
                    height: 48,
                    mb: 2.5,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: `${radius.md}px`,
                    bgcolor: color.green50,
                    color: color.green700,
                }}
            >
                <CheckCircleOutline />
            </Box>
            <Typography variant="h3" component="h1">
                {title}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                {children}
            </Typography>
            <Box sx={{ display: 'grid', gap: 1.5 }}>{actions}</Box>
        </Box>
    );
}
