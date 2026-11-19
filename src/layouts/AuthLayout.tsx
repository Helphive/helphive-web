import { Suspense } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';
import { Check } from '@mui/icons-material';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { ErrorBoundary, Logo, PageSkeleton, ShiftRuler } from '@/components/ui';
import { color, font, hairline, hairlineStrong, radius, shadow } from '@/theme/tokens';

const FACTS = ['Verified providers', 'Stripe-powered payments', 'Live job status'];

// Illustrative day on the ruler; not real bookings.
const EXAMPLE_DAY = [
    { start: 7, end: 13, label: 'Room Attendant' },
    { start: 15, end: 20, label: 'Linen Porter', tone: 'ink' as const },
];

function BrandPanel() {
    return (
        <Box
            sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 6,
                p: { md: 5, lg: 7 },
                bgcolor: color.canvas,
                borderRight: hairline,
            }}
        >
            <Logo to="/" />
            <Box sx={{ maxWidth: 480 }}>
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
                <Typography color="text.secondary" sx={{ mt: 2, maxWidth: '42ch' }}>
                    Hotels and venues book room attendants, public area attendants and linen
                    porters. Providers pick up the shifts that fit their day.
                </Typography>
                <Box
                    aria-hidden="true"
                    sx={{
                        mt: 5,
                        p: 2.5,
                        bgcolor: color.surface,
                        border: hairlineStrong,
                        borderRadius: `${radius.md}px`,
                        boxShadow: shadow.float,
                    }}
                >
                    <Typography variant="caption" component="p" sx={{ mb: 1.5 }}>
                        A day on HelpHive
                    </Typography>
                    <ShiftRuler blocks={EXAMPLE_DAY} from={6} to={22} now={10.67} />
                </Box>
            </Box>
            <Stack direction="row" sx={{ gap: 3, flexWrap: 'wrap' }}>
                {FACTS.map((fact) => (
                    <Stack
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
                        <Check sx={{ fontSize: 16, color: color.green700 }} />
                        <span>{fact}</span>
                    </Stack>
                ))}
            </Stack>
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
                    display: 'flex',
                    flexDirection: 'column',
                    px: { xs: 2, sm: 4 },
                    py: { xs: 2, sm: 4 },
                }}
            >
                <Box sx={{ display: { xs: 'flex', md: 'none' }, height: 44, alignItems: 'center' }}>
                    <Logo to="/" />
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
