import { Box, Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Logo, ShiftRuler } from '@/components/ui';
import { color, font, hairline } from '@/theme/tokens';

// `standalone` adds a minimal frame for routes outside the app shells.
export default function NotFoundPage({ standalone = false }: { standalone?: boolean }) {
    useDocumentTitle('Page not found');
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    const body = (
        <Box sx={{ maxWidth: 520, mx: 'auto', py: { xs: 6, sm: 10 } }}>
            <Typography variant="caption" component="p" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                Error 404
            </Typography>
            <Typography variant="h2" component="h1" sx={{ mt: 1 }}>
                This page does not exist.
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: '44ch' }}>
                The link may be out of date, or the page has moved. Nothing is booked here.
            </Typography>
            <ShiftRuler blocks={[]} from={6} to={22} sx={{ mt: 4 }} aria-label="An empty day" />
            <Stack direction="row" spacing={1.5} sx={{ mt: 4, flexWrap: 'wrap', rowGap: 1.5 }}>
                <Button
                    variant="contained"
                    size="large"
                    component={RouterLink}
                    to={isAuthenticated ? '/home' : '/'}
                >
                    {isAuthenticated ? 'Go to my dashboard' : 'Go to the home page'}
                </Button>
                {!isAuthenticated && (
                    <Button variant="outlined" size="large" component={RouterLink} to="/login">
                        Log in
                    </Button>
                )}
            </Stack>
        </Box>
    );

    if (!standalone) return body;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: color.canvas }}>
            <Box
                component="header"
                sx={{
                    height: 60,
                    display: 'flex',
                    alignItems: 'center',
                    px: { xs: 2, sm: 3 },
                    bgcolor: color.surface,
                    borderBottom: hairline,
                    fontSize: font.size.md,
                }}
            >
                <Logo to="/" />
            </Box>
            <Box component="main" sx={{ px: 2 }}>
                {body}
            </Box>
        </Box>
    );
}
