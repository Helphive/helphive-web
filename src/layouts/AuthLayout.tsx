import { Suspense } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { ColorSchemeSwitch, ErrorBoundary, Logo, PageSkeleton } from '@/components/ui';
import { HoneycombBackdrop } from '@/pages/public/landing/Backdrops';
import { color, font, hairline } from '@/theme/tokens';
import { CheckMarkIcon } from '@/components/ui/icons';

const FACTS = ['Verified providers', 'Stripe-powered payments', 'Live job status'];

function BrandPanel() {
    return (
        <Box
            component="aside"
            aria-label="About HelpHive"
            sx={{
                position: 'relative',
                overflow: 'hidden',
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 6,
                p: { md: 5, lg: 7 },
                bgcolor: color.canvas,
                borderRight: hairline,
            }}
        >
            <HoneycombBackdrop focus="80% 75%" />
            <Box sx={{ position: 'relative' }}>
                <Logo to="/" size={34} />
            </Box>
            <Box sx={{ position: 'relative', maxWidth: { md: 360, lg: 300, xl: 330 } }}>
                <Typography
                    component="p"
                    sx={{
                        fontSize: font.size['4xl'],
                        fontWeight: 800,
                        letterSpacing: font.tracking.display,
                        lineHeight: 1.08,
                    }}
                >
                    Hospitality shifts, booked to the hour.
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                    Hotels and venues book room attendants, public area attendants and linen
                    porters. Providers pick up the shifts that fit their day.
                </Typography>
            </Box>
            <Stack
                component="ul"
                sx={{ position: 'relative', gap: 1, p: 0, m: 0, listStyle: 'none' }}
            >
                {FACTS.map((fact) => (
                    <Stack
                        component="li"
                        key={fact}
                        direction="row"
                        spacing={0.75}
                        sx={{
                            alignItems: 'center',
                            fontSize: font.size.sm,
                            fontWeight: 600,
                            color: color.ink700,
                        }}
                    >
                        <CheckMarkIcon weight="bold" sx={{ fontSize: 16, color: color.green700 }} />
                        <span>{fact}</span>
                    </Stack>
                ))}
            </Stack>
            <Box
                component="img"
                src="/images/app/phone-book-service.webp"
                alt="HelpHive app, Book a service screen: choose the service, the shift and the address, with the total shown before you pay."
                width={608}
                height={1249}
                decoding="async"
                sx={{
                    display: { xs: 'none', lg: 'block' },
                    position: 'absolute',
                    right: 24,
                    bottom: -90,
                    width: { lg: 220, xl: 270 },
                    height: 'auto',
                }}
            />
        </Box>
    );
}

export default function AuthLayout() {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const location = useLocation();

    if (isAuthenticated) {
        return <Navigate to="/home" replace />;
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
                bgcolor: color.surface,
            }}
        >
            <BrandPanel />
            <Box
                component="main"
                sx={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    px: { xs: 2, sm: 4 },
                    py: { xs: 2, sm: 4 },
                }}
            >
                {/* Appearance, reachable before signing in; placed so it moves nothing else. */}
                <ColorSchemeSwitch
                    variant="compact"
                    sx={{
                        position: 'absolute',
                        zIndex: 1,
                        top: { xs: 22, sm: 32 },
                        right: { xs: 16, sm: 32 },
                    }}
                />
                <Box sx={{ display: { xs: 'flex', md: 'none' }, height: 44, alignItems: 'center' }}>
                    <Logo to="/" size={32} />
                </Box>
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: 'center',
                        pt: { xs: 4, sm: 0 },
                    }}
                >
                    <Box sx={{ width: '100%', maxWidth: 420 }}>
                        <ErrorBoundary resetKey={location.pathname}>
                            <Suspense fallback={<PageSkeleton />}>
                                <Outlet />
                            </Suspense>
                        </ErrorBoundary>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
