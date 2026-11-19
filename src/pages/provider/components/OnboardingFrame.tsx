import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { color, hairline, layout } from '@/theme/tokens';
import { Logo } from '@/components/ui';

/**
 * Page frame for the screens that sit outside the provider shell (onboarding, review status).
 * A slim top bar with the logo and a centred, narrow column.
 */
export default function OnboardingFrame({
    children,
    maxWidth = layout.narrowMaxWidth,
}: {
    children: ReactNode;
    maxWidth?: number;
}) {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: color.canvas }}>
            <Box
                component="header"
                sx={{
                    height: layout.topBarHeight,
                    bgcolor: color.surface,
                    borderBottom: hairline,
                    display: 'flex',
                    alignItems: 'center',
                    px: { xs: 2, sm: 3 },
                }}
            >
                <Logo />
            </Box>
            <Box
                component="main"
                sx={{
                    maxWidth,
                    mx: 'auto',
                    px: { xs: 2, sm: 3 },
                    py: { xs: 2.5, md: 4 },
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
