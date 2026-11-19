import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/features/auth/authSlice';
import { useLogoutMutation } from '@/features/auth/authApi';
import { color, hairline, layout } from '@/theme/tokens';
import { Logo } from '@/components/ui';
import { LogoutIcon } from '@/components/ui/icons';

/**
 * Page frame for the screens that sit outside the provider shell (onboarding, review status).
 * A slim top bar with the logo and a way to log out (these pages have no account menu),
 * and a centred, narrow column.
 */
export default function OnboardingFrame({
    children,
    maxWidth = layout.narrowMaxWidth,
}: {
    children: ReactNode;
    maxWidth?: number;
}) {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [logoutApi, { isLoading }] = useLogoutMutation();

    // Same as the dashboard account menu: revoke the refresh token, then clear the session.
    const handleLogout = async () => {
        try {
            const stored = localStorage.getItem('helphive-auth');
            const refreshToken = stored ? JSON.parse(stored).refreshToken : null;
            if (refreshToken) await logoutApi({ refreshToken }).unwrap();
        } catch {
            // Signing out locally still works if the server call fails.
        } finally {
            dispatch(logout());
            navigate('/login');
        }
    };

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
                    justifyContent: 'space-between',
                    px: { xs: 2, sm: 3 },
                }}
            >
                <Logo />
                <Button
                    variant="text"
                    startIcon={<LogoutIcon />}
                    onClick={() => void handleLogout()}
                    disabled={isLoading}
                >
                    Log out
                </Button>
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
