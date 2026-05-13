import { Outlet, Navigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, Stack } from '@mui/material';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/features/auth/authSlice';

export default function AuthLayout() {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    if (isAuthenticated) {
        return <Navigate to="/home" replace />;
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#FFF7F5',
                py: 4,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background:
                        'radial-gradient(circle at 18% 14%, rgba(255,87,64,0.20), transparent 26%), radial-gradient(circle at 84% 86%, rgba(254,200,75,0.28), transparent 26%)',
                },
            }}
        >
            <Container maxWidth="sm" sx={{ position: 'relative' }}>
                <Stack alignItems="center" spacing={1} sx={{ mb: 3 }}>
                    <Box component="img" src="/logo.png" alt="HelpHive" sx={{ height: 54 }} />
                    <Typography variant="h5" fontWeight={800}>
                        HelpHive
                    </Typography>
                </Stack>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, sm: 5 },
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 24px 80px rgba(16, 24, 40, 0.12)',
                    }}
                >
                    <Outlet />
                </Paper>
            </Container>
        </Box>
    );
}
